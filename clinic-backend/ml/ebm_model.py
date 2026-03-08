import pandas as pd
import joblib

from interpret.glassbox import ExplainableBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

from accounts.models import ClinicKPI


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

    df["critical_ratio"] = df["critical_cases"] / df["total_patients"]
    df["staff_ratio"] = df["staff_on_duty"] / df["total_patients"]

    df["mortality_flag"] = df["mortality_count"] > 0

    df["resource_failure"] = (
        df["stockout_oxygen"] | df["stockout_essential_drugs"]
    )

    return df


# --------------------------------------------------
# TARGET VARIABLE (CLINIC INSTABILITY)
# --------------------------------------------------

def create_target(df):

    conditions = [
        df["critical_ratio"] > 0.25,
        df["staff_ratio"] < 0.15,
        df["bed_occupancy_rate"] > 85,
        df["mortality_flag"] == True,
        df["resource_failure"] == True
    ]

    df["instability"] = (
        conditions[0].astype(int)
        + conditions[1].astype(int)
        + conditions[2].astype(int)
        + conditions[3].astype(int)
        + conditions[4].astype(int)
    ) >= 2

    df["instability"] = df["instability"].astype(int)

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
    ]

    X = df[features]
    y = df["instability"]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
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

    accuracy = model.score(X_test, y_test)
    print("EBM Accuracy:", accuracy)

    preds = model.predict(X_test)
    print(classification_report(y_test, preds))

    joblib.dump(model, "ml/ebm_model.pkl")

    print("EBM model saved to ml/ebm_model.pkl")

    return model


# --------------------------------------------------
# LOAD MODEL
# --------------------------------------------------

ebm_model = joblib.load("ml/ebm_model.pkl")


# --------------------------------------------------
# BUILD FEATURES FROM KPI OBJECT
# --------------------------------------------------

def build_kpi_features(kpi):

    critical_ratio = (
        kpi.critical_cases / kpi.total_patients if kpi.total_patients else 0
    )

    staff_ratio = (
        kpi.staff_on_duty / kpi.total_patients if kpi.total_patients else 0
    )

    mortality_flag = kpi.mortality_count > 0

    resource_failure = (
        kpi.stockout_oxygen or kpi.stockout_essential_drugs
    )

    return [[
        critical_ratio,
        staff_ratio,
        kpi.bed_occupancy_rate,
        mortality_flag,
        resource_failure
    ]]


# --------------------------------------------------
# PREDICT RISK SCORE
# --------------------------------------------------

def predict_risk(kpi):

    features = build_kpi_features(kpi)

    score = ebm_model.predict_proba(features)[0][1]

    return round(float(score), 2)


# --------------------------------------------------
# EXPLAIN PREDICTION (EBM INTERPRETABILITY)
# --------------------------------------------------

def explain_risk(kpi):

    features = build_kpi_features(kpi)

    explanation = ebm_model.explain_local(features)

    contributions = explanation.data(0)["scores"]
    names = explanation.data(0)["names"]

    result = []

    for name, score in zip(names, contributions):
        result.append({
            "feature": name,
            "impact": round(score, 3)
        })

    result.sort(key=lambda x: abs(x["impact"]), reverse=True)

    return result