import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

sns.set_style("whitegrid")
plt.rcParams["figure.figsize"] = (14, 6)

features_df = pd.read_csv("../data/enrolment_features.csv")
features_df["month"] = pd.to_datetime(features_df["month"])

os_dir = "../outputs"
import os
os.makedirs(os_dir, exist_ok=True)

print("=" * 80)
print("UNIVARIATE ANALYSIS")
print("=" * 80)

print("\n1. Total Enrolments Over Time")
monthly_total = features_df.groupby("month")["total_enrolments"].sum().reset_index()
print(monthly_total.describe())

print("\n2. Monthly Enrolments Distribution")
print(features_df["total_enrolments"].describe())

print("\n3. Month-over-Month Growth Rate Distribution")
print(features_df["enrolments_mom_growth"].describe())

print("\n4. Top 10 Pincodes by Total Enrolments")
top_pincodes = (
    features_df.groupby("pincode")["total_enrolments"]
    .sum()
    .sort_values(ascending=False)
    .head(10)
)
print(top_pincodes)

print("\n5. Top 10 Districts by Total Enrolments")
top_districts = (
    features_df.groupby("district")["total_enrolments"]
    .sum()
    .sort_values(ascending=False)
    .head(10)
)
print(top_districts)

print("\n6. State-wise Enrolments")
state_enrolments = (
    features_df.groupby("state")["total_enrolments"]
    .sum()
    .sort_values(ascending=False)
)
print(state_enrolments)

fig, ax = plt.subplots(figsize=(12, 5))
monthly_total.set_index("month")["total_enrolments"].plot(ax=ax, linewidth=2)
ax.set_title("Total Enrolments Over Time (Univariate Trend)", fontsize=14, fontweight="bold")
ax.set_xlabel("Month")
ax.set_ylabel("Total Enrolments")
ax.grid(alpha=0.3)
plt.tight_layout()
plt.savefig(f"{os_dir}/01_univariate_time_trend.png", dpi=300, bbox_inches="tight")
plt.close()

fig, axes = plt.subplots(1, 2, figsize=(14, 5))
axes[0].hist(features_df["total_enrolments"], bins=50, edgecolor="black", alpha=0.7)
axes[0].set_title("Distribution of Monthly Enrolments", fontsize=12, fontweight="bold")
axes[0].set_xlabel("Total Enrolments")
axes[0].set_ylabel("Frequency")

axes[1].hist(features_df["enrolments_mom_growth"], bins=50, edgecolor="black", alpha=0.7, color="orange")
axes[1].set_title("Distribution of MoM Growth Rate (%)", fontsize=12, fontweight="bold")
axes[1].set_xlabel("Growth Rate (%)")
axes[1].set_ylabel("Frequency")

plt.tight_layout()
plt.savefig(f"{os_dir}/02_univariate_distributions.png", dpi=300, bbox_inches="tight")
plt.close()

fig, ax = plt.subplots(figsize=(12, 6))
state_enrolments.plot(kind="barh", ax=ax, color="steelblue")
ax.set_title("Total Enrolments by State", fontsize=14, fontweight="bold")
ax.set_xlabel("Total Enrolments")
plt.tight_layout()
plt.savefig(f"{os_dir}/03_univariate_state_totals.png", dpi=300, bbox_inches="tight")
plt.close()

print("\n" + "=" * 80)
print("BIVARIATE ANALYSIS")
print("=" * 80)

print("\n1. Correlation between Growth Rate and Share")
correlation = features_df[["enrolments_mom_growth", "enrolment_share_district"]].corr()
print(correlation)

fig, axes = plt.subplots(1, 2, figsize=(14, 5))

axes[0].scatter(features_df["rolling_3m_avg"], features_df["enrolments_mom_growth"], alpha=0.5, s=20)
axes[0].set_xlabel("3-Month Rolling Average")
axes[0].set_ylabel("MoM Growth Rate (%)")
axes[0].set_title("Growth Rate vs Rolling Average", fontsize=12, fontweight="bold")
axes[0].grid(alpha=0.3)

axes[1].scatter(features_df["enrolment_share_state"], features_df["total_enrolments"], alpha=0.5, s=20, color="orange")
axes[1].set_xlabel("Enrolment Share (State %)")
axes[1].set_ylabel("Total Enrolments")
axes[1].set_title("Enrolments vs State Share", fontsize=12, fontweight="bold")
axes[1].grid(alpha=0.3)

plt.tight_layout()
plt.savefig(f"{os_dir}/04_bivariate_scatter.png", dpi=300, bbox_inches="tight")
plt.close()

state_month_pivot = features_df.pivot_table(
    values="total_enrolments", index="state", columns="month", aggfunc="sum"
)

fig, ax = plt.subplots(figsize=(16, 6))
sns.heatmap(state_month_pivot, cmap="YlGnBu", ax=ax, cbar_kws={"label": "Total Enrolments"})
ax.set_title("State-wise Enrolments Over Time (Bivariate Heatmap)", fontsize=14, fontweight="bold")
ax.set_xlabel("Month")
ax.set_ylabel("State")
plt.tight_layout()
plt.savefig(f"{os_dir}/05_bivariate_state_heatmap.png", dpi=300, bbox_inches="tight")
plt.close()

top_states = features_df["state"].value_counts().head(5).index
filtered_df = features_df[features_df["state"].isin(top_states)]

fig, ax = plt.subplots(figsize=(14, 6))
for state in top_states:
    state_data = filtered_df[filtered_df["state"] == state].groupby("month")["total_enrolments"].sum()
    ax.plot(state_data.index, state_data.values, marker="o", label=state, linewidth=2)

ax.set_title("Top 5 States - Enrolment Trends Over Time", fontsize=14, fontweight="bold")
ax.set_xlabel("Month")
ax.set_ylabel("Total Enrolments")
ax.legend()
ax.grid(alpha=0.3)
plt.tight_layout()
plt.savefig(f"{os_dir}/06_bivariate_top_states_trend.png", dpi=300, bbox_inches="tight")
plt.close()

print("\n" + "=" * 80)
print("TRIVARIATE ANALYSIS & HOTSPOT IDENTIFICATION")
print("=" * 80)

print("\n1. High-Growth Pincodes (MoM Growth > 50%)")
high_growth = features_df[features_df["enrolments_mom_growth"] > 50].sort_values(
    "enrolments_mom_growth", ascending=False
)
print(f"Found {len(high_growth)} records of high growth (>50%)")
if len(high_growth) > 0:
    print(high_growth[["month", "state", "district", "pincode", "enrolments_mom_growth"]].head(10))

print("\n2. Top 10 Pincode-Month Combinations by Enrolments")
top_pincode_months = features_df.nlargest(10, "total_enrolments")[
    ["month", "state", "district", "pincode", "total_enrolments"]
]
print(top_pincode_months)

print("\n3. Anomalies: Unusual Spikes (Growth > 100%)")
anomalies = features_df[features_df["enrolments_mom_growth"] > 100]
print(f"Found {len(anomalies)} anomalous spikes (>100% growth)")
if len(anomalies) > 0:
    print(anomalies[["month", "pincode", "total_enrolments", "enrolments_mom_growth"]].head(10))

print("\n4. Anomalies: Drops (Growth < -50%)")
drops = features_df[features_df["enrolments_mom_growth"] < -50]
print(f"Found {len(drops)} significant drops (<-50% growth)")
if len(drops) > 0:
    print(drops[["month", "pincode", "total_enrolments", "enrolments_mom_growth"]].head(10))

district_state_month = features_df.pivot_table(
    values="total_enrolments",
    index=["state", "district"],
    columns="month",
    aggfunc="sum"
)

if len(district_state_month) > 20:
    top_10_districts = features_df.groupby("district")["total_enrolments"].sum().nlargest(10).index
    district_pivot = features_df[features_df["district"].isin(top_10_districts)].pivot_table(
        values="total_enrolments", index="district", columns="month", aggfunc="sum"
    )
else:
    district_pivot = district_state_month

fig, ax = plt.subplots(figsize=(16, 8))
sns.heatmap(district_pivot, cmap="RdYlGn", ax=ax, cbar_kws={"label": "Total Enrolments"})
ax.set_title("District-Month Enrolment Hotspots (Trivariate Heatmap)", fontsize=14, fontweight="bold")
ax.set_xlabel("Month")
ax.set_ylabel("District")
plt.tight_layout()
plt.savefig(f"{os_dir}/07_trivariate_district_hotspots.png", dpi=300, bbox_inches="tight")
plt.close()

fig, ax = plt.subplots(figsize=(12, 8))
growth_by_state = features_df.groupby("state")["enrolments_mom_growth"].mean().sort_values(ascending=False)
growth_by_state.plot(kind="barh", ax=ax, color="steelblue")
ax.set_title("Average MoM Growth Rate by State", fontsize=14, fontweight="bold")
ax.set_xlabel("Average Growth Rate (%)")
plt.tight_layout()
plt.savefig(f"{os_dir}/08_trivariate_growth_by_state.png", dpi=300, bbox_inches="tight")
plt.close()

print("\nAnalysis complete. Visualizations saved to ../outputs/")
