-- 002_atomic_chain_append.sql
-- Fixes C1: Race condition on chain tip.
-- Two concurrent uploads could read the same chain_position and fork the chain.
-- Solution: Postgres functions that atomically read-then-write inside a transaction
-- with FOR UPDATE row locking, plus UNIQUE constraints as a safety net.

-- Enable pgcrypto for SHA-256 inside Postgres
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── Safety net: UNIQUE constraints on (project_id, chain_position) ──────────
-- Even if the RPC is bypassed, the DB will reject duplicate chain positions.
ALTER TABLE evidence_items
  ADD CONSTRAINT uq_evidence_items_project_chain_position
  UNIQUE (project_id, chain_position);

ALTER TABLE custody_events
  ADD CONSTRAINT uq_custody_events_project_chain_position
  UNIQUE (project_id, chain_position);

-- ─── Atomic evidence item append ─────────────────────────────────────────────
-- Reads the chain tip FOR UPDATE (blocking concurrent reads), computes the
-- new chain link, inserts, and returns the new row — all in one transaction.
--
-- The hash formula MUST match Node.js exactly:
--   Node.js:  createHash('sha256').update(contentHash + ingestedAt + previousHash).digest('hex')
--   Postgres: encode(sha256(convert_to(content_hash || ingested_at || previous_hash, 'UTF8')), 'hex')
-- Both produce lowercase hex of SHA-256 over the UTF-8 concatenation.

CREATE OR REPLACE FUNCTION append_evidence_item(
  p_project_id     UUID,
  p_submitted_by   UUID,
  p_file_path      TEXT,
  p_file_name      TEXT,
  p_file_type      TEXT,
  p_file_size      BIGINT,
  p_content_hash   TEXT,
  p_requirement_id UUID DEFAULT NULL,
  p_note           TEXT DEFAULT NULL,
  p_metadata       JSONB DEFAULT '{}'::JSONB,
  p_captured_at    TIMESTAMPTZ DEFAULT NOW(),
  p_time_confidence TEXT DEFAULT 'system-generated',
  p_evidence_id    UUID DEFAULT gen_random_uuid()
)
RETURNS SETOF evidence_items
LANGUAGE plpgsql
AS $$
DECLARE
  v_previous_hash  TEXT;
  v_chain_position INT;
  v_chain_hash     TEXT;
  v_ingested_at    TEXT;  -- ISO 8601 string for hash determinism
BEGIN
  -- L3: Capture ingestion time as ISO 8601 string (matches Node.js new Date().toISOString())
  v_ingested_at := to_char(NOW() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');

  -- L1: Lock the chain tip row FOR UPDATE to serialize concurrent appends.
  -- If no rows exist, we start from GENESIS.
  SELECT chain_hash, chain_position
    INTO v_previous_hash, v_chain_position
    FROM evidence_items
   WHERE project_id = p_project_id
   ORDER BY chain_position DESC
   LIMIT 1
     FOR UPDATE;  -- Blocks concurrent readers until this transaction commits

  IF v_previous_hash IS NULL THEN
    -- First item in chain: genesis sentinel
    v_previous_hash  := 'GENESIS';
    v_chain_position := 1;
  ELSE
    v_chain_position := v_chain_position + 1;
  END IF;

  -- A3: Deterministic chain hash — identical to Node.js computeChainHash()
  -- Formula: SHA-256(contentHash + ingestedAt + previousHash)
  v_chain_hash := encode(
    sha256(convert_to(p_content_hash || v_ingested_at || v_previous_hash, 'UTF8')),
    'hex'
  );

  -- K1: Append-only insert. The UNIQUE constraint is the backstop.
  RETURN QUERY
  INSERT INTO evidence_items (
    id, project_id, submitted_by, file_path, file_name, file_type, file_size,
    content_hash, requirement_id, note, metadata,
    chain_hash, chain_position, previous_hash,
    captured_at, time_confidence, ingested_at
  ) VALUES (
    p_evidence_id,
    p_project_id,
    p_submitted_by,
    p_file_path,
    p_file_name,
    p_file_type,
    p_file_size,
    p_content_hash,
    p_requirement_id,
    p_note,
    p_metadata,
    v_chain_hash,
    v_chain_position,
    CASE WHEN v_previous_hash = 'GENESIS' THEN NULL ELSE v_previous_hash END,  -- DB stores NULL for genesis
    p_captured_at,
    p_time_confidence,
    v_ingested_at
  )
  RETURNING *;
END;
$$;

-- ─── Atomic custody event append ─────────────────────────────────────────────
-- Same pattern: lock tip, compute hashes, insert, return.
--
-- The event_hash is computed in Node.js from sorted-key JSON of event_data.
-- We accept it as a parameter (p_event_hash) rather than recomputing in Postgres,
-- because JSON key-sorting in plpgsql is fragile.
--
-- The chain_hash formula MUST match Node.js computeEventChainHash():
--   SHA-256(eventHash + createdAt + previousHash)

CREATE OR REPLACE FUNCTION append_custody_event(
  p_project_id       UUID,
  p_evidence_item_id UUID DEFAULT NULL,
  p_actor_id         UUID DEFAULT NULL,
  p_event_type       TEXT DEFAULT 'ingested',
  p_event_data       JSONB DEFAULT '{}'::JSONB,
  p_event_hash       TEXT DEFAULT NULL  -- Pre-computed in Node.js for determinism
)
RETURNS SETOF custody_events
LANGUAGE plpgsql
AS $$
DECLARE
  v_previous_hash    TEXT;
  v_chain_position   INT;
  v_chain_hash       TEXT;
  v_created_at       TEXT;  -- ISO 8601 string for hash determinism
BEGIN
  -- Capture creation time as ISO 8601 (matches Node.js)
  v_created_at := to_char(NOW() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');

  -- Lock the custody chain tip FOR UPDATE to serialize concurrent appends
  SELECT chain_hash, chain_position
    INTO v_previous_hash, v_chain_position
    FROM custody_events
   WHERE project_id = p_project_id
   ORDER BY chain_position DESC
   LIMIT 1
     FOR UPDATE;

  IF v_previous_hash IS NULL THEN
    v_previous_hash  := 'GENESIS';
    v_chain_position := 1;
  ELSE
    v_chain_position := v_chain_position + 1;
  END IF;

  -- A3: Deterministic chain hash — identical to Node.js computeEventChainHash()
  -- Formula: SHA-256(eventHash + createdAt + previousHash)
  v_chain_hash := encode(
    sha256(convert_to(p_event_hash || v_created_at || v_previous_hash, 'UTF8')),
    'hex'
  );

  RETURN QUERY
  INSERT INTO custody_events (
    project_id, evidence_item_id, actor_id, event_type,
    event_hash, chain_hash, chain_position, previous_hash,
    event_data, created_at
  ) VALUES (
    p_project_id,
    p_evidence_item_id,
    p_actor_id,
    p_event_type,
    p_event_hash,
    v_chain_hash,
    v_chain_position,
    CASE WHEN v_previous_hash = 'GENESIS' THEN NULL ELSE v_previous_hash END,
    p_event_data,
    v_created_at
  )
  RETURNING *;
END;
$$;
