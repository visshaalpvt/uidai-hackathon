import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest
from scipy import stats
import os

features_df = pd.read_csv("../data/enrolment_features.csv")
features_df["month"] = pd.to_datetime(features_df["month"])

os_dir = "../outputs"
os.makedirs(os_dir, exist_ok=True)

print("=" * 80)
print("FORECASTING & ANOMALY DETECTION")
print("=" * 80)

print("\n1. SIMPLE ROLLING AVERAGE FORECAST")
print("-" * 80)

forecast_df = features_df.copy()
forecast_df = forecast_df.sort_values(["pincode", "month"]).reset_index(drop=True)

forecast_df["forecast_3m"] = (
    forecast_df.groupby("pincode")["total_enrolments"]
    .transform(lambda x: x.rolling(window=3, min_periods=1).mean().shift(1))
)

forecast_df["forecast_error"] = (
    forecast_df["total_enrolments"] - forecast_df["forecast_3m"]
)

forecast_df["forecast_error_pct"] = (
    (forecast_df["forecast_error"] / forecast_df["forecast_3m"] * 100)
    .fillna(0)
    .replace([np.inf, -np.inf], 0)
)

valid_forecast = forecast_df[forecast_df["forecast_3m"].notna()].copy()

print(f"Forecast MAE: {valid_forecast['forecast_error'].abs().mean():.2f}")
print(f"Forecast MAPE: {valid_forecast['forecast_error_pct'].abs().mean():.2f}%")

forecast_summary = valid_forecast.groupby("pincode").agg({
    "forecast_error": "mean",
    "forecast_error_pct": "mean",
    "total_enrolments": "mean"
}).reset_index()
forecast_summary.columns = ["pincode", "avg_forecast_error", "avg_forecast_error_pct", "avg_enrolments"]

print("\nTop 10 Pincodes with Highest Forecast Error:")
print(forecast_summary.nlargest(10, "avg_forecast_error_pct"))

print("\n2. Z-SCORE ANOMALY DETECTION")
print("-" * 80)

anomaly_df = features_df.copy()

anomaly_df["z_score_enrolments"] = (
    anomaly_df.groupby("pincode")["total_enrolments"]
    .transform(lambda x: np.abs(stats.zscore(x, nan_policy="omit")))
)

anomaly_df["z_score_growth"] = (
    anomaly_df.groupby("pincode")["enrolments_mom_growth"]
    .transform(lambda x: np.abs(stats.zscore(x, nan_policy="omit")))
)

z_threshold = 2.5
z_anomalies = anomaly_df[
    (anomaly_df["z_score_enrolments"] > z_threshold) |
    (anomaly_df["z_score_growth"] > z_threshold)
].copy()

print(f"Found {len(z_anomalies)} anomalous records (Z-score > {z_threshold})")

z_anomalies_sorted = z_anomalies.sort_values("z_score_enrolments", ascending=False)
print("\nTop 15 Z-Score Anomalies:")
print(z_anomalies_sorted[[
    "month", "state", "district", "pincode", "total_enrolments",
    "z_score_enrolments", "z_score_growth"
]].head(15))

print("\n3. ISOLATION FOREST ANOMALY DETECTION")
print("-" * 80)

iso_df = features_df[[
    "month", "state", "district", "pincode",
    "total_enrolments", "enrolments_mom_growth", "rolling_3m_avg",
    "enrolment_share_district", "enrolment_share_state"
]].copy()

iso_df = iso_df.fillna(0)

features_for_iso = iso_df[[
    "total_enrolments", "enrolments_mom_growth",
    "rolling_3m_avg", "enrolment_share_state"
]].copy()

scaler = StandardScaler()
scaled_features = scaler.fit_transform(features_for_iso)

iso_forest = IsolationForest(contamination=0.05, random_state=42)
iso_df["anomaly_score"] = iso_forest.fit_predict(scaled_features)
iso_df["anomaly_flag"] = (iso_df["anomaly_score"] == -1).astype(int)

anomaly_count = (iso_df["anomaly_flag"] == 1).sum()
print(f"Isolation Forest identified {anomaly_count} anomalous records (~5% of data)")

iso_anomalies = iso_df[iso_df["anomaly_flag"] == 1].sort_values("total_enrolments", ascending=False)
print("\nTop 15 Isolation Forest Anomalies:")
print(iso_anomalies[[
    "month", "state", "district", "pincode", "total_enrolments",
    "enrolments_mom_growth"
]].head(15))

print("\n4. HIGH-DEMAND & HIGH-RISK AREAS")
print("-" * 80)

high_demand = features_df.groupby("pincode").agg({
    "total_enrolments": ["mean", "sum", "count"],
    "enrolments_mom_growth": "mean"
}).reset_index()

high_demand.columns = ["pincode", "avg_enrolments", "total_enrolments", "num_months", "avg_growth"]

high_demand = high_demand[high_demand["num_months"] >= 2]
high_demand = high_demand.sort_values("avg_enrolments", ascending=False)

high_demand["demand_level"] = pd.qcut(
    high_demand["avg_enrolments"],
    q=3,
    labels=["Low", "Medium", "High"],
    duplicates="drop"
)

high_demand["risk_level"] = "Normal"
high_demand.loc[
    (high_demand["avg_growth"] > 50) | (high_demand["avg_growth"] < -30),
    "risk_level"
] = "High"
high_demand.loc[
    (high_demand["avg_growth"] > 25) & (high_demand["avg_growth"] <= 50),
    "risk_level"
] = "Medium"

high_demand_flag = high_demand[
    (high_demand["demand_level"] == "High") | (high_demand["risk_level"] == "High")
].copy()

state_district_mapping = features_df.groupby("pincode")[["state", "district"]].first().reset_index()
high_demand_flag = high_demand_flag.merge(state_district_mapping, on="pincode", how="left")

print(f"\nTotal High-Demand or High-Risk Pincodes: {len(high_demand_flag)}")

print("\nHigh-Risk Pincodes (Unusual Growth Patterns):")
high_risk = high_demand_flag[high_demand_flag["risk_level"] == "High"].sort_values("avg_growth", ascending=False)
print(high_risk[[
    "pincode", "state", "district", "avg_enrolments", "avg_growth", "demand_level", "risk_level"
]].head(20))

print("\nHigh-Demand Pincodes:")
high_dm = high_demand_flag[high_demand_flag["demand_level"] == "High"].sort_values("avg_enrolments", ascending=False)
print(high_dm[[
    "pincode", "state", "district", "avg_enrolments", "avg_growth", "demand_level", "risk_level"
]].head(20))

print("\n5. EXPORT FLAGGED RECORDS")
print("-" * 80)

final_flags = features_df.merge(
    iso_df[["month", "pincode", "anomaly_flag"]],
    on=["month", "pincode"],
    how="left"
).fillna(0)

final_flags = final_flags.merge(
    high_demand[["pincode", "demand_level", "risk_level"]],
    on="pincode",
    how="left"
)

final_flags["flag_reason"] = ""
final_flags.loc[final_flags["anomaly_flag"] == 1, "flag_reason"] = "Isolation Forest Anomaly"
final_flags.loc[final_flags["risk_level"] == "High", "flag_reason"] += " | High-Risk Growth"
final_flags.loc[final_flags["demand_level"] == "High", "flag_reason"] += " | High-Demand Area"

flagged_records = final_flags[
    (final_flags["anomaly_flag"] == 1) |
    (final_flags["risk_level"] == "High") |
    (final_flags["demand_level"] == "High")
].copy()

flagged_records = flagged_records.sort_values("total_enrolments", ascending=False)

flagged_records[[
    "month", "state", "district", "pincode", "total_enrolments",
    "enrolments_mom_growth", "demand_level", "risk_level", "flag_reason"
]].to_csv(f"{os_dir}/flagged_records.csv", index=False)

print(f"\nFlagged {len(flagged_records)} records exported to flagged_records.csv")
print("\nSample of Flagged Records:")
print(flagged_records[[
    "month", "state", "district", "pincode", "total_enrolments",
    "enrolments_mom_growth", "demand_level", "risk_level"
]].head(20))

print("\n" + "=" * 80)
print("ML Analysis complete.")
print("=" * 80)
