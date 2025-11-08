# Database Schema for n8n AI Agent

## Simplified Table Architecture

### 1. **buildings** (Core Entity)
```sql
building_id (PK) | TEXT
building_name | TEXT
address | TEXT
city | TEXT
country | TEXT
client_id | TEXT
total_area_sqm | NUMERIC
building_type | TEXT
construction_year | INTEGER
num_floors | INTEGER
num_units | INTEGER
onboarding_date | DATE
completion_status | INTEGER (0-100)
```

**Purpose:** Central building information

---

### 2. **meters**
```sql
meter_id (PK) | TEXT
building_id (FK) | TEXT → buildings.building_id
meter_type | TEXT (Electricity/Gas/Solar)
tenant_id (FK) | TEXT → tenants.tenant_id (nullable)
location | TEXT
installation_date | DATE
```

**Purpose:** Energy meters linked to buildings

---

### 3. **tenants**
```sql
tenant_id (PK) | TEXT
building_id (FK) | TEXT → buildings.building_id
company_name | TEXT
floor | INTEGER
unit_number | TEXT
area_sqm | NUMERIC
lease_start | DATE
contact_email | TEXT
consent_signed | BOOLEAN
consent_date | DATE (nullable)
```

**Purpose:** Tenant information per building

---

### 4. **readings** (Time-Series)
```sql
reading_id (PK) | TEXT
meter_id (FK) | TEXT → meters.meter_id
timestamp | TIMESTAMPTZ
consumption_kwh | NUMERIC (nullable)
consumption_m3 | NUMERIC (nullable)
production_kwh | NUMERIC (nullable)
unit_price_eur | NUMERIC
temperature_celsius | NUMERIC (nullable)
solar_irradiance | INTEGER (nullable)
```

**Purpose:** Energy readings from meters

**Indexes:**
- `meter_id` + `timestamp` (for time-series queries)

---

### 5. **anomalies**
```sql
anomaly_id (PK) | TEXT
meter_id (FK) | TEXT → meters.meter_id
detected_at | TIMESTAMPTZ
anomaly_type | TEXT
severity | TEXT (Low/Medium/High/Critical)
expected_value | NUMERIC
actual_value | NUMERIC
resolved | BOOLEAN
resolution_note | TEXT (nullable)
```

**Purpose:** Detected anomalies in energy consumption

---

### 6. **monthly_summaries**
```sql
id (PK) | SERIAL
building_id (FK) | TEXT → buildings.building_id
building_name | TEXT (denormalized)
year | INTEGER
month | INTEGER (1-12)
total_consumption_kwh | NUMERIC
total_cost_eur | NUMERIC
avg_daily_kwh | NUMERIC
peak_demand_kw | NUMERIC
comparison_prev_month_pct | NUMERIC (nullable)
co2_emissions_kg | NUMERIC
```

**Purpose:** Monthly aggregated metrics per building

**Unique:** `(building_id, year, month)`

---

### 7. **sustainability_metrics**
```sql
id (PK) | SERIAL
building_id (FK) | TEXT → buildings.building_id
metric_date | DATE
energy_intensity_kwh_sqm | NUMERIC
renewable_percentage | NUMERIC
esg_score | INTEGER
carbon_intensity_kg_sqm | NUMERIC
```

**Purpose:** Sustainability tracking per building

**Unique:** `(building_id, metric_date)`

---

## Entity Relationships (Simplified)

```
buildings
  ├── meters (1:M)
  │     ├── readings (1:M)
  │     └── anomalies (1:M)
  ├── tenants (1:M)
  │     └── meters (optional 1:M)
  ├── monthly_summaries (1:M)
  └── sustainability_metrics (1:M)
```

---

## Key Design Principles for n8n AI Agents

1. **Flat Structure**: Minimal nesting, clear relationships
2. **Descriptive Names**: Self-documenting column names
3. **Type Clarity**: Explicit data types (TEXT, NUMERIC, DATE, BOOLEAN)
4. **Denormalization**: `building_name` in summaries for easier queries
5. **Indexing**: Key columns indexed for performance
6. **Nullable Fields**: Clear indication of optional data

---

## Common n8n AI Agent Queries

### Get Building with Meters
```sql
SELECT b.*, 
       json_agg(m.*) as meters
FROM buildings b
LEFT JOIN meters m ON b.building_id = m.building_id
WHERE b.building_id = 'BLDG_GT_001'
GROUP BY b.building_id;
```

### Get Recent Readings
```sql
SELECT r.*, m.meter_type, b.building_name
FROM readings r
JOIN meters m ON r.meter_id = m.meter_id
JOIN buildings b ON m.building_id = b.building_id
WHERE r.timestamp >= NOW() - INTERVAL '7 days'
ORDER BY r.timestamp DESC;
```

### Get Unresolved Anomalies
```sql
SELECT a.*, m.meter_type, b.building_name
FROM anomalies a
JOIN meters m ON a.meter_id = m.meter_id
JOIN buildings b ON m.building_id = b.building_id
WHERE a.resolved = false
ORDER BY a.detected_at DESC;
```

---

## n8n Workflow Tips

1. **Use PostgreSQL node** for database queries
2. **Return JSON** for AI agent processing
3. **Index on filter columns** (meter_id, timestamp, building_id)
4. **Batch operations** for bulk inserts
5. **Use transactions** for data consistency




