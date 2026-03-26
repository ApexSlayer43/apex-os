-- Migration 004: Add organization profile columns for onboarding
-- These columns capture the custodian identity that appears on evidence packages
-- and power domain-specific category suggestions in the custody ceremony.

-- Add profile columns to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS contact_role TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS company_type TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS trade TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT false;

-- Create Casey's org + membership
-- User ID: 3dcddc4a-2f2a-41bd-b289-70c808a683e3 (hall324@gmail.com)
DO $$
DECLARE
  new_org_id UUID;
BEGIN
  -- Only insert if no org exists for this user
  IF NOT EXISTS (
    SELECT 1 FROM org_members WHERE user_id = '3dcddc4a-2f2a-41bd-b289-70c808a683e3'
  ) THEN
    INSERT INTO organizations (name, owner_id, subscription_status, plan, onboarding_complete)
    VALUES ('My Organization', '3dcddc4a-2f2a-41bd-b289-70c808a683e3', 'active', 'starter', false)
    RETURNING id INTO new_org_id;

    INSERT INTO org_members (org_id, user_id, role)
    VALUES (new_org_id, '3dcddc4a-2f2a-41bd-b289-70c808a683e3', 'owner');
  END IF;
END $$;
