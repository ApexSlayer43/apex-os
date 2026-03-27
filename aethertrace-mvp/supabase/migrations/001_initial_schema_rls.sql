-- 001_initial_schema_rls.sql
-- Exported from live Supabase project pcjuknjzslwhbieerhyb on 2026-03-27
-- This file captures all RLS policies and the user_org_ids() helper function.
-- All 8 FORGE tables have RLS enabled with 22 policies total.

-- ═══════════════════════════════════════════════════════════════
-- HELPER FUNCTION: user_org_ids()
-- Returns all org IDs the current user belongs to.
-- Used by every RLS policy for tenant isolation.
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.user_org_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT org_id FROM org_members WHERE user_id = auth.uid()
  UNION
  SELECT id FROM organizations WHERE owner_id = auth.uid()
$$;

-- ═══════════════════════════════════════════════════════════════
-- ENABLE RLS ON ALL TABLES
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE custody_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE custody_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_packages ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════
-- ORGANIZATIONS — owner can insert/update, members can read
-- ═══════════════════════════════════════════════════════════════

CREATE POLICY org_insert ON organizations
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY org_select ON organizations
  FOR SELECT USING (id IN (SELECT user_org_ids()));

CREATE POLICY org_update ON organizations
  FOR UPDATE USING (owner_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════
-- ORG_MEMBERS — owner manages, members can read their own org
-- ═══════════════════════════════════════════════════════════════

CREATE POLICY org_members_insert ON org_members
  FOR INSERT WITH CHECK (
    org_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
  );

CREATE POLICY org_members_select ON org_members
  FOR SELECT USING (org_id IN (SELECT user_org_ids()));

CREATE POLICY org_members_delete ON org_members
  FOR DELETE USING (
    org_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
  );

-- ═══════════════════════════════════════════════════════════════
-- PROJECTS — org members can read/insert, owner can update
-- ═══════════════════════════════════════════════════════════════

CREATE POLICY project_insert ON projects
  FOR INSERT WITH CHECK (org_id IN (SELECT user_org_ids()));

CREATE POLICY project_select ON projects
  FOR SELECT USING (org_id IN (SELECT user_org_ids()));

CREATE POLICY project_update ON projects
  FOR UPDATE USING (
    org_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
  );

-- ═══════════════════════════════════════════════════════════════
-- EVIDENCE_ITEMS — submitter inserts, org members read
-- No UPDATE or DELETE — evidence is immutable (I1)
-- ═══════════════════════════════════════════════════════════════

CREATE POLICY evidence_insert ON evidence_items
  FOR INSERT WITH CHECK (
    submitted_by = auth.uid()
    AND project_id IN (
      SELECT id FROM projects WHERE org_id IN (SELECT user_org_ids())
    )
  );

CREATE POLICY evidence_select ON evidence_items
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects WHERE org_id IN (SELECT user_org_ids())
    )
  );

-- ═══════════════════════════════════════════════════════════════
-- CUSTODY_EVENTS — actor inserts, org members read
-- No UPDATE or DELETE — custody events are immutable (K1)
-- ═══════════════════════════════════════════════════════════════

CREATE POLICY custody_event_insert ON custody_events
  FOR INSERT WITH CHECK (
    actor_id = auth.uid()
    AND project_id IN (
      SELECT id FROM projects WHERE org_id IN (SELECT user_org_ids())
    )
  );

CREATE POLICY custody_event_select ON custody_events
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects WHERE org_id IN (SELECT user_org_ids())
    )
  );

-- ═══════════════════════════════════════════════════════════════
-- CUSTODY_PLANS — org members insert/read, owner updates
-- ═══════════════════════════════════════════════════════════════

CREATE POLICY custody_plan_insert ON custody_plans
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE org_id IN (SELECT user_org_ids())
    )
  );

CREATE POLICY custody_plan_select ON custody_plans
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects WHERE org_id IN (SELECT user_org_ids())
    )
  );

CREATE POLICY custody_plan_update ON custody_plans
  FOR UPDATE USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN organizations o ON p.org_id = o.id
      WHERE o.owner_id = auth.uid()
    )
  );

-- ═══════════════════════════════════════════════════════════════
-- EVIDENCE_REQUIREMENTS — org members insert/read, owner updates/deletes (draft only)
-- ═══════════════════════════════════════════════════════════════

CREATE POLICY evidence_req_insert ON evidence_requirements
  FOR INSERT WITH CHECK (
    custody_plan_id IN (
      SELECT cp.id FROM custody_plans cp
      JOIN projects p ON cp.project_id = p.id
      WHERE p.org_id IN (SELECT user_org_ids())
    )
  );

CREATE POLICY evidence_req_select ON evidence_requirements
  FOR SELECT USING (
    custody_plan_id IN (
      SELECT cp.id FROM custody_plans cp
      JOIN projects p ON cp.project_id = p.id
      WHERE p.org_id IN (SELECT user_org_ids())
    )
  );

CREATE POLICY evidence_req_update ON evidence_requirements
  FOR UPDATE USING (
    custody_plan_id IN (
      SELECT cp.id FROM custody_plans cp
      JOIN projects p ON cp.project_id = p.id
      JOIN organizations o ON p.org_id = o.id
      WHERE o.owner_id = auth.uid()
    )
  );

CREATE POLICY evidence_req_delete ON evidence_requirements
  FOR DELETE USING (
    custody_plan_id IN (
      SELECT cp.id FROM custody_plans cp
      JOIN projects p ON cp.project_id = p.id
      JOIN organizations o ON p.org_id = o.id
      WHERE o.owner_id = auth.uid() AND cp.status = 'draft'
    )
  );

-- ═══════════════════════════════════════════════════════════════
-- EVIDENCE_PACKAGES — owner inserts, org members read
-- ═══════════════════════════════════════════════════════════════

CREATE POLICY package_insert ON evidence_packages
  FOR INSERT WITH CHECK (
    generated_by = auth.uid()
    AND project_id IN (
      SELECT p.id FROM projects p
      JOIN organizations o ON p.org_id = o.id
      WHERE o.owner_id = auth.uid()
    )
  );

CREATE POLICY package_select ON evidence_packages
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects WHERE org_id IN (SELECT user_org_ids())
    )
  );
