import pandas as pd
import os

print('='*80)
print('DATA FILE & OUTPUT VERIFICATION')
print('='*80)

df_clean = pd.read_csv('../data/enrolment_cleaned.csv')
print(f'\n1. enrolment_cleaned.csv')
print(f'   Shape: {df_clean.shape}')
print(f'   Columns: {list(df_clean.columns)}')

df_monthly = pd.read_csv('../data/enrolment_monthly.csv')
print(f'\n2. enrolment_monthly.csv')
print(f'   Shape: {df_monthly.shape}')
print(f'   Unique months: {df_monthly["month"].nunique()}')
print(f'   Unique pincodes: {df_monthly["pincode"].nunique()}')

df_features = pd.read_csv('../data/enrolment_features.csv')
print(f'\n3. enrolment_features.csv')
print(f'   Shape: {df_features.shape}')
print(f'   Feature columns: {list(df_features.columns[4:])}')
print(f'   Growth rate stats: min={df_features["enrolments_mom_growth"].min():.2f}%, max={df_features["enrolments_mom_growth"].max():.2f}%')

df_flagged = pd.read_csv('../outputs/flagged_records.csv')
pct = len(df_flagged)/len(df_features)*100
print(f'\n4. flagged_records.csv')
print(f'   Total flagged: {len(df_flagged)} out of {len(df_features)} ({pct:.1f}%)')
print(f'   Demand levels: {df_flagged["demand_level"].value_counts().to_dict()}')
print(f'   Risk levels: {df_flagged["risk_level"].value_counts().to_dict()}')

output_files = [f for f in os.listdir('../outputs') if f.endswith('.png')]
print(f'\n5. Visualizations Created')
print(f'   Total PNG files: {len(output_files)}')

print('\n' + '='*80)
print('SANITY CHECKS')
print('='*80)

# Trend check
monthly_total = df_features.groupby('month')['total_enrolments'].sum().sort_index()
print(f'\n✓ Total enrolments by month (should show clear trend):')
print(monthly_total)

# Flagged pincodes check
flagged_pincodes = df_flagged['pincode'].nunique()
total_pincodes = df_features['pincode'].nunique()
print(f'\n✓ High-risk/demand pincodes: {flagged_pincodes} out of {total_pincodes} ({flagged_pincodes/total_pincodes*100:.1f}%)')
print(f'  (Should be subset, not all and not none)')

# Anomaly count
anomaly_count = (df_flagged['demand_level'] == 'High').sum() + (df_flagged['risk_level'] == 'High').sum()
print(f'\n✓ Anomalies detected: {anomaly_count} records')
print(f'  (Isolation Forest should flag ~5% of {len(df_features)} = ~{int(len(df_features)*0.05)} records)')

print('\n' + '='*80)
