-- Enable fonts feature for Creation Exhibitions client
-- Run this SQL query in your database to enable the Font Preview tab

UPDATE "clients"
SET features = jsonb_set(
  COALESCE(features, '{"enabledFeatures": []}'::jsonb),
  '{enabledFeatures}',
  (
    SELECT jsonb_agg(DISTINCT elem)
    FROM jsonb_array_elements_text(
      COALESCE(features->'enabledFeatures', '[]'::jsonb) || '["fonts"]'::jsonb
    ) AS elem
  )::jsonb
)
WHERE subdomain = 'creation-exhibitions';

-- Verify it was added
SELECT 
  subdomain,
  name,
  features->'enabledFeatures' as enabled_features
FROM "clients"
WHERE subdomain = 'creation-exhibitions';



