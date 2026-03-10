import os
import pandas as pd
import joblib

from interpret.glassbox import ExplainableBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

from django.conf import settings
from accounts.models import ClinicKPI
from accounts.models import RiskPrediction


# --------------------------------------------------
# MODEL PATH
# --------------------------------------------------

MODEL_PATH = os.path.join(settings.BASE_DIR, "ml", "ebm_model.pkl")


# --------------------------------------------------
# LAZY MODEL LOADER
# --------------------------------------------------

ebm_model = None

def get_model():
    global ebm_model
    if ebm_model is None:
        ebm_model = joblib.load(MODEL_PATH)
    return ebm_model


# --------------------------------------------------
# LOAD DATA FROM DATABASE
# --------------------------------------------------

def load_dataset():
    data = ClinicKPI.objects.all().values()
    df = pd.DataFrame(list(data))
    return df


# --------------------------------------------------
# FEATURE ENGINEERING
# --------------------------------------------------

def build_features(df):
    df["critical_ratio"] = df["critical_cases"] / df["total_patients"].replace(0, 1)
    df["staff_ratio"]    = df["staff_on_duty"]  / df["total_patients"].replace(0, 1)
    df["mortality_flag"] = df["mortality_count"] > 0
    df["resource_failure"] = (
        df["stockout_oxygen"] | df["stockout_essential_drugs"]
    )
    return df


# --------------------------------------------------
# TARGET VARIABLE
# --------------------------------------------------

def create_target(df):
    df["instability"] = (
        (df["critical_ratio"]     > 0.25) |
        (df["staff_ratio"]        < 0.10) |
        (df["bed_occupancy_rate"] > 85)   |
        (df["mortality_flag"]     == True) |
        (df["resource_failure"]   == True) |
        (df["triage_wait_time"]   > 30)   |
        (df["nurses_absent"]      > 3)
    ).astype(int)
    return df


# --------------------------------------------------
# TRAIN EBM MODEL
# --------------------------------------------------

def train_model():
    df = load_dataset()
    df = build_features(df)
    df = create_target(df)

    features = [
        "critical_ratio",
        "staff_ratio",
        "bed_occupancy_rate",
        "mortality_flag",
        "resource_failure",
        "triage_wait_time",
        "nurses_absent",
        "icu_transfers",
        "patient_complaints",
    ]

    X = df[features]
    y = df["instability"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.2,
        stratify=y,
        random_state=42,
    )

    model = ExplainableBoostingClassifier(
        interactions=0,
        max_bins=128,
        learning_rate=0.01,
        max_rounds=500,
        min_samples_leaf=5,
    )

    model.fit(X_train, y_train)

    print("EBM Accuracy:", model.score(X_test, y_test))
    print(classification_report(y_test, model.predict(X_test)))

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print(f"EBM model saved to {MODEL_PATH}")

    # Reset cached model so next call to get_model() loads the new file
    global ebm_model
    ebm_model = None

    return model


# --------------------------------------------------
# BUILD FEATURES FROM KPI OBJECT
# --------------------------------------------------

def build_kpi_features(kpi):
    total = kpi.total_patients or 1  # avoid division by zero

    critical_ratio   = kpi.critical_cases / total
    staff_ratio      = kpi.staff_on_duty  / total
    mortality_flag   = kpi.mortality_count > 0
    resource_failure = kpi.stockout_oxygen or kpi.stockout_essential_drugs

    return [[
        critical_ratio,
        staff_ratio,
        kpi.bed_occupancy_rate,
        mortality_flag,
        resource_failure,
        kpi.triage_wait_time,
        kpi.nurses_absent,
        kpi.icu_transfers,
        kpi.patient_complaints,
    ]]


# --------------------------------------------------
# PREDICT RISK SCORE
# --------------------------------------------------
def predict_risk(kpi):

    features = build_kpi_features(kpi)

    score = float(get_model().predict_proba(features)[0][1])

    if score >= 0.8:
        level = "HIGH"
    elif score >= 0.5:
        level = "MEDIUM"
    else:
        level = "LOW"

    # prevent duplicates
    RiskPrediction.objects.update_or_create(
        kpi=kpi,
        defaults={
            "clinic": kpi.clinic,
            "risk_score": round(score, 2),
            "risk_level": level,
        }
    )

    return round(score, 2)
# --------------------------------------------------
# EXPLAIN PREDICTION
# --------------------------------------------------

def explain_risk(kpi):
    features    = build_kpi_features(kpi)
    explanation = get_model().explain_local(features)

    names         = explanation.data(0)["names"]
    contributions = explanation.data(0)["scores"]

    result = [
        {"feature": name, "impact": round(float(score), 3)}
        for name, score in zip(names, contributions)
    ]

    result.sort(key=lambda x: abs(x["impact"]), reverse=True)
    return result