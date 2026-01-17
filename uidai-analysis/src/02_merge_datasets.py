import pandas as pd

df = pd.read_csv("../data/enrolment_cleaned.csv")

df["date"] = pd.to_datetime(df["date"])

df["month"] = df["date"].dt.to_period("M").dt.to_timestamp()

monthly_df = (
    df
    .groupby(["month", "state", "district", "pincode"], as_index=False)
    .agg({"total_enrolments": "sum"})
)

monthly_df = monthly_df.sort_values("month")

monthly_df.to_csv("../data/enrolment_monthly.csv", index=False)

print("Monthly enrolment dataset created successfully.")
print(monthly_df.head())
