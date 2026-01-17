/**
 * Analytics Utility for Trend Projection
 * Technique: Simple Linear Regression on recent window (3-6 months)
 * Goal: Explicitly avoid black-box ML using transparent math.
 */

export const calculateTrendProjection = (data: number[], horizonMonths: number = 3) => {
    if (data.length < 2) return { slope: 0, projectedValue: 0, trendDirection: 'Stable' };

    const n = data.length;
    // Use last 6 months max for trend to capture recent behavior
    const windowSize = Math.min(n, 6);
    const y = data.slice(n - windowSize);
    const x = Array.from({ length: windowSize }, (_, i) => i); // [0, 1, 2...]

    // Calculate Slope (m) using Least Squares: m = (n*Σxy - Σx*Σy) / (n*Σx² - (Σx)²)
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
    const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0);

    const slope = (windowSize * sumXY - sumX * sumY) / (windowSize * sumXX - sumX * sumX);

    // Project future value: y = mx + c
    // We project 'horizonMonths' ahead of the last point
    const currentVal = y[y.length - 1]; // Use last actual value as base anchor
    const projectedGrowth = slope * horizonMonths;
    const projectedValue = Math.max(0, currentVal + projectedGrowth);

    let trendDirection = 'Stable';
    if (slope > 0.05 * currentVal) trendDirection = 'Rapidly Rising'; // >5% growth
    else if (slope > 0) trendDirection = 'Rising';
    else if (slope < -0.05 * currentVal) trendDirection = 'Rapidly Declining';
    else if (slope < 0) trendDirection = 'Declining';

    return {
        slope,
        projectedValue: Math.round(projectedValue),
        trendDirection,
        projectedGrowth: Math.round(projectedGrowth)
    };
};

export const getRiskLevel = (volume: number, capacityThreshold: number): 'Low' | 'Medium' | 'High' | 'Critical' => {
    const ratio = volume / capacityThreshold;
    if (ratio > 1.2) return 'Critical';
    if (ratio > 1.0) return 'High';
    if (ratio > 0.8) return 'Medium';
    return 'Low';
};
