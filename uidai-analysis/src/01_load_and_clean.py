import pandas as pd
enrol_df = pd.read_csv("../data/enrolment.csv")
enrol_df.columns = enrol_df.columns.str.lower()
enrol_df.columns = enrol_df.columns.str.replace(" ", "_")
enrol_df["date"] = pd.to_datetime(enrol_df["date"], dayfirst=True)
enrol_df["total_enrolments"] = (
    enrol_df["age_0_5"]
    + enrol_df["age_5_17"]
    + enrol_df["age_18_greater"]
)
enrol_df = enrol_df[
    ["date", "state", "district", "pincode", "total_enrolments"]
]
enrol_df = enrol_df.sort_values("date")
enrol_df.to_csv("../data/enrolment_cleaned.csv", index=False)
print("Enrolment dataset cleaned and saved successfully.")
print(enrol_df.head())
