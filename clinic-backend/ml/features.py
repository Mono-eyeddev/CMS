def create_features(df):

    df["critical_ratio"] = df["critical_cases"] / df["total_patients"]

    df["staff_ratio"] = df["staff_on_duty"] / df["total_patients"]

    df["mortality_flag"] = df["mortality_count"] > 0

    df["overcrowded"] = df["bed_occupancy_rate"] > 85

    df["resource_failure"] = (
        df["stockout_oxygen"] |
        df["stockout_essential_drugs"]
    )

    return df

def create_target(df):

    df["instability"] = (
        (df["critical_ratio"] > 0.2) |
        (df["staff_ratio"] < 0.1) |
        (df["mortality_flag"] == True) |
        (df["resource_failure"] == True)
    ).astype(int)

    return df