-- Add 12 months of data for all buildings (Jan 2025 - Dec 2025)
-- This script adds monthly_summaries and sustainability_metrics for 12 months

-- ============================================
-- MONTHLY SUMMARIES for Building 1 (GreenTower Office Complex)
-- ============================================
INSERT INTO monthly_summaries (building_id, building_name, year, month, total_consumption_kwh, total_cost_eur, avg_daily_kwh, peak_demand_kw, comparison_prev_month_pct, co2_emissions_kg)
VALUES
-- Existing months (keeping for reference, will skip duplicates)
-- ('BLDG_GT_001', 'GreenTower Office Complex', 2025, 8, 98750.5, 28542.15, 3185.2, 245.8, NULL, 45231.23),
-- ('BLDG_GT_001', 'GreenTower Office Complex', 2025, 9, 95820.3, 27689.25, 3194.0, 238.5, -2.97, 43925.31),
-- ('BLDG_GT_001', 'GreenTower Office Complex', 2025, 10, 102458.7, 30124.87, 3305.1, 392.4, 6.92, 46965.48),

-- New months: Jan-Jul 2025, Nov-Dec 2025
('BLDG_GT_001', 'GreenTower Office Complex', 2025, 1, 105820.5, 30789.25, 3413.6, 258.5, NULL, 48467.09),
('BLDG_GT_001', 'GreenTower Office Complex', 2025, 2, 96850.3, 28189.15, 3458.9, 265.2, -8.48, 44357.54),
('BLDG_GT_001', 'GreenTower Office Complex', 2025, 3, 92480.8, 26921.45, 2983.3, 245.8, -4.52, 42376.21),
('BLDG_GT_001', 'GreenTower Office Complex', 2025, 4, 89560.2, 26052.85, 2985.3, 238.5, -3.16, 41011.53),
('BLDG_GT_001', 'GreenTower Office Complex', 2025, 5, 87230.6, 25389.25, 2813.9, 225.6, -2.60, 39956.60),
('BLDG_GT_001', 'GreenTower Office Complex', 2025, 6, 85640.4, 24931.85, 2854.7, 218.9, -1.82, 39218.50),
('BLDG_GT_001', 'GreenTower Office Complex', 2025, 7, 84520.3, 24631.45, 2726.5, 212.3, -1.31, 38734.42),
('BLDG_GT_001', 'GreenTower Office Complex', 2025, 11, 108920.8, 31758.95, 3630.7, 285.6, 6.31, 49907.13),
('BLDG_GT_001', 'GreenTower Office Complex', 2025, 12, 115680.5, 33708.25, 3731.6, 298.4, 6.20, 53033.99)
ON CONFLICT (building_id, year, month) DO UPDATE SET
  total_consumption_kwh = EXCLUDED.total_consumption_kwh,
  total_cost_eur = EXCLUDED.total_cost_eur,
  avg_daily_kwh = EXCLUDED.avg_daily_kwh,
  peak_demand_kw = EXCLUDED.peak_demand_kw,
  comparison_prev_month_pct = EXCLUDED.comparison_prev_month_pct,
  co2_emissions_kg = EXCLUDED.co2_emissions_kg,
  building_name = EXCLUDED.building_name;

-- ============================================
-- MONTHLY SUMMARIES for Building 2 (Riverside Mixed-Use)
-- ============================================
INSERT INTO monthly_summaries (building_id, building_name, year, month, total_consumption_kwh, total_cost_eur, avg_daily_kwh, peak_demand_kw, comparison_prev_month_pct, co2_emissions_kg)
VALUES
-- Existing months (keeping for reference)
-- ('BLDG_RS_002', 'Riverside Mixed-Use Complex', 2025, 8, 145680.5, 39852.85, 4699.4, 285.6, NULL, 66789.23),
-- ('BLDG_RS_002', 'Riverside Mixed-Use Complex', 2025, 9, 142350.8, 38921.45, 4745.0, 278.9, -2.28, 65235.67),
-- ('BLDG_RS_002', 'Riverside Mixed-Use Complex', 2025, 10, 148920.3, 40789.82, 4803.9, 292.4, 4.62, 68268.98),

-- New months: Jan-Jul 2025, Nov-Dec 2025
('BLDG_RS_002', 'Riverside Mixed-Use Complex', 2025, 1, 152680.5, 41758.95, 4925.2, 298.5, NULL, 69978.47),
('BLDG_RS_002', 'Riverside Mixed-Use Complex', 2025, 2, 148920.3, 40689.25, 5318.6, 305.2, -2.46, 68167.10),
('BLDG_RS_002', 'Riverside Mixed-Use Complex', 2025, 3, 142350.8, 38921.45, 4592.0, 278.9, -4.38, 65235.67),
('BLDG_RS_002', 'Riverside Mixed-Use Complex', 2025, 4, 138920.6, 38025.85, 4630.7, 272.5, -2.41, 63647.31),
('BLDG_RS_002', 'Riverside Mixed-Use Complex', 2025, 5, 135680.4, 37105.25, 4376.8, 265.8, -2.33, 62132.58),
('BLDG_RS_002', 'Riverside Mixed-Use Complex', 2025, 6, 132450.2, 36205.85, 4415.0, 258.9, -2.38, 60642.24),
('BLDG_RS_002', 'Riverside Mixed-Use Complex', 2025, 7, 129820.5, 35458.95, 4187.8, 252.4, -1.98, 59457.99),
('BLDG_RS_002', 'Riverside Mixed-Use Complex', 2025, 11, 152680.8, 41789.95, 5093.6, 298.5, 2.52, 69978.47),
('BLDG_RS_002', 'Riverside Mixed-Use Complex', 2025, 12, 158920.5, 43489.25, 5126.5, 305.8, 4.09, 72838.79)
ON CONFLICT (building_id, year, month) DO UPDATE SET
  total_consumption_kwh = EXCLUDED.total_consumption_kwh,
  total_cost_eur = EXCLUDED.total_cost_eur,
  avg_daily_kwh = EXCLUDED.avg_daily_kwh,
  peak_demand_kw = EXCLUDED.peak_demand_kw,
  comparison_prev_month_pct = EXCLUDED.comparison_prev_month_pct,
  co2_emissions_kg = EXCLUDED.co2_emissions_kg,
  building_name = EXCLUDED.building_name;

-- ============================================
-- MONTHLY SUMMARIES for Building 3 (Industrial Warehouse)
-- ============================================
INSERT INTO monthly_summaries (building_id, building_name, year, month, total_consumption_kwh, total_cost_eur, avg_daily_kwh, peak_demand_kw, comparison_prev_month_pct, co2_emissions_kg)
VALUES
-- Existing months (keeping for reference)
-- ('BLDG_IW_003', 'Industrial Warehouse Hub', 2025, 8, 358950.2, 78969.04, 11579.0, 545.8, NULL, 164451.09),
-- ('BLDG_IW_003', 'Industrial Warehouse Hub', 2025, 9, 352480.6, 77545.73, 11749.4, 538.9, -1.80, 161487.31),
-- ('BLDG_IW_003', 'Industrial Warehouse Hub', 2025, 10, 365820.8, 81480.58, 11797.4, 745.2, 3.78, 167628.13),

-- New months: Jan-Jul 2025, Nov-Dec 2025
('BLDG_IW_003', 'Industrial Warehouse Hub', 2025, 1, 375680.5, 82649.71, 12118.7, 585.6, NULL, 172162.23),
('BLDG_IW_003', 'Industrial Warehouse Hub', 2025, 2, 368520.3, 81074.47, 13161.4, 598.5, -1.90, 168785.70),
('BLDG_IW_003', 'Industrial Warehouse Hub', 2025, 3, 362450.8, 79739.18, 11692.0, 572.8, -1.65, 166082.92),
('BLDG_IW_003', 'Industrial Warehouse Hub', 2025, 4, 358950.2, 78969.04, 11965.0, 558.9, -0.97, 164451.09),
('BLDG_IW_003', 'Industrial Warehouse Hub', 2025, 5, 355680.6, 78249.73, 11473.6, 548.5, -0.91, 162804.27),
('BLDG_IW_003', 'Industrial Warehouse Hub', 2025, 6, 352480.4, 77545.69, 11749.3, 538.9, -0.90, 161487.31),
('BLDG_IW_003', 'Industrial Warehouse Hub', 2025, 7, 349820.5, 77060.51, 11284.5, 532.4, -0.76, 160320.89),
('BLDG_IW_003', 'Industrial Warehouse Hub', 2025, 11, 372680.8, 81989.78, 12422.7, 598.5, 1.88, 170728.21),
('BLDG_IW_003', 'Industrial Warehouse Hub', 2025, 12, 378920.5, 83362.51, 12223.2, 612.8, 1.68, 173557.59)
ON CONFLICT (building_id, year, month) DO UPDATE SET
  total_consumption_kwh = EXCLUDED.total_consumption_kwh,
  total_cost_eur = EXCLUDED.total_cost_eur,
  avg_daily_kwh = EXCLUDED.avg_daily_kwh,
  peak_demand_kw = EXCLUDED.peak_demand_kw,
  comparison_prev_month_pct = EXCLUDED.comparison_prev_month_pct,
  co2_emissions_kg = EXCLUDED.co2_emissions_kg,
  building_name = EXCLUDED.building_name;

-- ============================================
-- SUSTAINABILITY METRICS for Building 1 (GreenTower)
-- ============================================
INSERT INTO sustainability_metrics (building_id, metric_date, energy_intensity_kwh_sqm, renewable_percentage, esg_score, carbon_intensity_kg_sqm)
VALUES
('BLDG_GT_001', '2025-01-31', 12.45, 18.2, 71, 5.70),
('BLDG_GT_001', '2025-02-28', 11.40, 18.8, 72, 5.22),
('BLDG_GT_001', '2025-03-31', 10.89, 19.5, 73, 4.98),
('BLDG_GT_001', '2025-04-30', 10.54, 20.2, 74, 4.82),
('BLDG_GT_001', '2025-05-31', 10.26, 21.0, 75, 4.70),
('BLDG_GT_001', '2025-06-30', 10.08, 21.5, 75, 4.61),
('BLDG_GT_001', '2025-07-31', 9.95, 22.0, 76, 4.56),
('BLDG_GT_001', '2025-08-31', 11.62, 19.0, 73, 5.32),
('BLDG_GT_001', '2025-09-30', 11.28, 19.5, 73, 5.17),
('BLDG_GT_001', '2025-10-31', 12.05, 18.5, 72, 5.52),
('BLDG_GT_001', '2025-11-30', 12.82, 18.0, 71, 5.87),
('BLDG_GT_001', '2025-12-31', 13.62, 17.5, 70, 6.24)
ON CONFLICT (building_id, metric_date) DO UPDATE SET
  energy_intensity_kwh_sqm = EXCLUDED.energy_intensity_kwh_sqm,
  renewable_percentage = EXCLUDED.renewable_percentage,
  esg_score = EXCLUDED.esg_score,
  carbon_intensity_kg_sqm = EXCLUDED.carbon_intensity_kg_sqm;

-- ============================================
-- SUSTAINABILITY METRICS for Building 2 (Riverside)
-- ============================================
INSERT INTO sustainability_metrics (building_id, metric_date, energy_intensity_kwh_sqm, renewable_percentage, esg_score, carbon_intensity_kg_sqm)
VALUES
('BLDG_RS_002', '2025-01-31', 12.31, 12.0, 67, 5.64),
('BLDG_RS_002', '2025-02-28', 12.01, 12.5, 68, 5.50),
('BLDG_RS_002', '2025-03-31', 11.48, 13.0, 69, 5.26),
('BLDG_RS_002', '2025-04-30', 11.20, 13.5, 70, 5.13),
('BLDG_RS_002', '2025-05-31', 10.94, 14.0, 70, 5.01),
('BLDG_RS_002', '2025-06-30', 10.68, 14.5, 71, 4.89),
('BLDG_RS_002', '2025-07-31', 10.47, 15.0, 71, 4.80),
('BLDG_RS_002', '2025-08-31', 11.75, 12.8, 68, 5.38),
('BLDG_RS_002', '2025-09-30', 11.48, 13.0, 68, 5.26),
('BLDG_RS_002', '2025-10-31', 12.01, 12.3, 68, 5.48),
('BLDG_RS_002', '2025-11-30', 12.31, 12.0, 67, 5.64),
('BLDG_RS_002', '2025-12-31', 12.82, 11.5, 66, 5.88)
ON CONFLICT (building_id, metric_date) DO UPDATE SET
  energy_intensity_kwh_sqm = EXCLUDED.energy_intensity_kwh_sqm,
  renewable_percentage = EXCLUDED.renewable_percentage,
  esg_score = EXCLUDED.esg_score,
  carbon_intensity_kg_sqm = EXCLUDED.carbon_intensity_kg_sqm;

-- ============================================
-- SUSTAINABILITY METRICS for Building 3 (Industrial Warehouse)
-- ============================================
INSERT INTO sustainability_metrics (building_id, metric_date, energy_intensity_kwh_sqm, renewable_percentage, esg_score, carbon_intensity_kg_sqm)
VALUES
('BLDG_IW_003', '2025-01-31', 20.31, 5.0, 57, 9.30),
('BLDG_IW_003', '2025-02-28', 19.92, 5.2, 58, 9.11),
('BLDG_IW_003', '2025-03-31', 19.58, 5.5, 58, 8.96),
('BLDG_IW_003', '2025-04-30', 19.40, 5.8, 59, 8.89),
('BLDG_IW_003', '2025-05-31', 19.23, 6.0, 59, 8.81),
('BLDG_IW_003', '2025-06-30', 19.05, 6.2, 59, 8.73),
('BLDG_IW_003', '2025-07-31', 18.92, 6.5, 60, 8.67),
('BLDG_IW_003', '2025-08-31', 19.40, 5.5, 58, 8.89),
('BLDG_IW_003', '2025-09-30', 19.05, 5.3, 58, 8.73),
('BLDG_IW_003', '2025-10-31', 19.77, 5.2, 58, 9.06),
('BLDG_IW_003', '2025-11-30', 20.14, 5.0, 57, 9.23),
('BLDG_IW_003', '2025-12-31', 20.48, 4.8, 56, 9.38)
ON CONFLICT (building_id, metric_date) DO UPDATE SET
  energy_intensity_kwh_sqm = EXCLUDED.energy_intensity_kwh_sqm,
  renewable_percentage = EXCLUDED.renewable_percentage,
  esg_score = EXCLUDED.esg_score,
  carbon_intensity_kg_sqm = EXCLUDED.carbon_intensity_kg_sqm;

-- ============================================
-- Verification Query
-- ============================================
-- Uncomment to verify data after insertion:
-- SELECT building_id, COUNT(*) as months, MIN(year || '-' || LPAD(month::text, 2, '0')) as first_month, MAX(year || '-' || LPAD(month::text, 2, '0')) as last_month
-- FROM monthly_summaries
-- GROUP BY building_id
-- ORDER BY building_id;

-- SELECT building_id, COUNT(*) as metrics, MIN(metric_date) as first_date, MAX(metric_date) as last_date
-- FROM sustainability_metrics
-- GROUP BY building_id
-- ORDER BY building_id;



