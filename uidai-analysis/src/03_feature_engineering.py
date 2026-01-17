import pandas as pd
import numpy as np

monthly_df = pd.read_csv("../data/enrolment_monthly.csv")
monthly_df["month"] = pd.to_datetime(monthly_df["month"])

features_df = monthly_df.copy()

features_df = features_df.sort_values(["pincode", "month"]).reset_index(drop=True)

features_df["enrolments_mom_growth"] = (
    features_df.groupby("pincode")["total_enrolments"]
    .pct_change()
    .fillna(0)
    * 100
)

features_df["rolling_3m_avg"] = (
    features_df.groupby("pincode")["total_enrolments"]
    .transform(lambda x: x.rolling(window=3, min_periods=1).mean())
)

district_totals = (
    features_df.groupby(["month", "district"])["total_enrolments"]
    .sum()
    .reset_index()
    .rename(columns={"total_enrolments": "district_total"})
)

state_totals = (
    features_df.groupby(["month", "state"])["total_enrolments"]
    .sum()
    .reset_index()
    .rename(columns={"total_enrolments": "state_total"})
)

features_df = features_df.merge(
    district_totals, on=["month", "district"], how="left"
)
features_df = features_df.merge(
    state_totals, on=["month", "state"], how="left"
)

features_df["enrolment_share_district"] = (
    (features_df["total_enrolments"] / features_df["district_total"] * 100)
    .fillna(0)
)

features_df["enrolment_share_state"] = (
    (features_df["total_enrolments"] / features_df["state_total"] * 100)
    .fillna(0)
)

features_df = features_df[
    [
        "month",
        "state",
        "district",
        "pincode",
        "total_enrolments",
        "enrolments_mom_growth",
        "rolling_3m_avg",
        "enrolment_share_district",
        "enrolment_share_state",
    ]
]

features_df.to_csv("../data/enrolment_features.csv", index=False)

print("Feature engineering completed successfully.")
print(features_df.head(10))
print("\nFeature summary statistics:")
print(features_df[["enrolments_mom_growth", "rolling_3m_avg"]].describe())
