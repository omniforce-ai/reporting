-- Remove creation-exhibitions domain/URL from all clients
-- This clears the customDomain field for any client that has it set to creation-exhibitions

-- First, check what clients have this domain set
SELECT 
  id,
  name,
  subdomain,
  "customDomain",
  "updatedAt"
FROM "clients"
WHERE "customDomain" ILIKE '%creation-exhibitions%'
   OR "customDomain" = 'creation-exhibitions'
   OR "customDomain" = 'https://creation-exhibitions';

-- Remove the customDomain for all clients that have it set to creation-exhibitions
UPDATE "clients"
SET 
  "customDomain" = NULL,
  "updatedAt" = NOW()
WHERE "customDomain" ILIKE '%creation-exhibitions%'
   OR "customDomain" = 'creation-exhibitions'
   OR "customDomain" = 'https://creation-exhibitions';

-- Verify the update - check the creation-exhibitions client
SELECT 
  id,
  name,
  subdomain,
  "customDomain",
  "updatedAt"
FROM "clients"
WHERE subdomain = 'creation-exhibitions' OR name ILIKE '%creation%exhibitions%';

-- Verify no clients have this domain set
SELECT 
  id,
  name,
  subdomain,
  "customDomain"
FROM "clients"
WHERE "customDomain" IS NOT NULL
ORDER BY name;

