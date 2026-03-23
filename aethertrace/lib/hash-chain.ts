/**
 * AetherTrace Hash Chain Library
 *
 * This is the cryptographic foundation of the entire system.
 * Every function here preserves invariant L1 (Explicit Invariants Required):
 * the hash chain is an ordered, deterministic, tamper-evident sequence.
 *
 * Invariants preserved:
 * - L1: Chain ordering is explicit and deterministic
 * - L2: Ordering ambiguity is surfaced, never resolved silently
 * - L3: Time is metadata with stated confidence, not absolute truth
 * - K1: Append-only — once written, records are immutable
 * - K2: Content-addressed integrity — identity derived from content hashes
 * - K3: Verification is independent — any third party can recompute
 * - A3: Determinism required — identical inputs produce identical outputs
 *
 * ~50 lines of core logic. Battle-tested Node.js crypto. Zero dependencies.
 */

import { createHash } from 'crypto';

// ─── Types ────────────────────────────────────────────────────────────────────

/** A single item in the evidence hash chain */
export interface ChainItem {
  /** SHA-256 hash of the file content */
  contentHash: string;
  /** ISO 8601 timestamp of ingestion (system-generated, L3 compliant) */
  ingestedAt: string;
  /** Hash linking this item to the chain (computed from content + time + previous) */
  chainHash: string;
  /** Sequential position in the chain (1-indexed) */
  chainPosition: number;
  /** Chain hash of the previous item, or "GENESIS" for the first item */
  previousHash: string;
}

/** A single event in the custody event chain */
export interface CustodyEventItem {
  /** SHA-256 hash of the event data */
  eventHash: string;
  /** ISO 8601 timestamp of event creation */
  createdAt: string;
  /** Hash linking this event to the custody chain */
  chainHash: string;
  /** Sequential position in the custody chain (1-indexed) */
  chainPosition: number;
  /** Chain hash of the previous event, or "GENESIS" for the first event */
  previousHash: string;
}

/** Result of chain verification */
export interface ChainVerificationResult {
  /** Whether the entire chain is intact */
  valid: boolean;
  /** If invalid, the 1-indexed position where the chain broke */
  brokenAt?: number;
  /** Total items verified */
  itemsVerified: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Sentinel value for the first item in any chain (K1: append-only genesis) */
export const GENESIS = 'GENESIS';

// ─── Core Hash Functions ──────────────────────────────────────────────────────

/**
 * Compute SHA-256 hash of raw file content.
 * Preserves K2: identity derived from content, not location or naming.
 *
 * @param content - Raw file bytes as Buffer
 * @returns Lowercase hex SHA-256 hash string
 */
export function computeContentHash(content: Buffer): string {
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Compute the chain hash for an evidence item.
 * This links each item to its predecessor, creating the tamper-evident chain.
 * Preserves L1: ordering is a system property, enforced cryptographically.
 * Preserves A3: identical inputs always produce identical output.
 *
 * Formula: SHA-256(contentHash + ingestedAt + previousHash)
 *
 * @param contentHash - SHA-256 of the file content
 * @param ingestedAt - ISO 8601 ingestion timestamp
 * @param previousHash - Chain hash of the previous item, or GENESIS
 * @returns Lowercase hex SHA-256 chain hash
 */
export function computeChainHash(
  contentHash: string,
  ingestedAt: string,
  previousHash: string
): string {
  const input = `${contentHash}${ingestedAt}${previousHash}`;
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Compute SHA-256 hash of custody event data.
 * Preserves K2: event identity derived from content.
 * Preserves A3: deterministic — same event data always produces same hash.
 *
 * @param eventData - Event data object (will be JSON-stringified with sorted keys)
 * @returns Lowercase hex SHA-256 hash string
 */
export function computeEventHash(eventData: Record<string, unknown>): string {
  // Sort keys for deterministic serialization (A3: identical inputs → identical outputs)
  const serialized = JSON.stringify(eventData, Object.keys(eventData).sort());
  return createHash('sha256').update(serialized).digest('hex');
}

/**
 * Compute the chain hash for a custody event.
 * Same linking mechanism as evidence chain, applied to events.
 * Preserves L1: custody event ordering is explicit and cryptographic.
 *
 * Formula: SHA-256(eventHash + createdAt + previousHash)
 *
 * @param eventHash - SHA-256 of the event data
 * @param createdAt - ISO 8601 event creation timestamp
 * @param previousHash - Chain hash of the previous event, or GENESIS
 * @returns Lowercase hex SHA-256 chain hash
 */
export function computeEventChainHash(
  eventHash: string,
  createdAt: string,
  previousHash: string
): string {
  const input = `${eventHash}${createdAt}${previousHash}`;
  return createHash('sha256').update(input).digest('hex');
}

// ─── Chain Verification ───────────────────────────────────────────────────────

/**
 * Verify an evidence hash chain from genesis to tip.
 * Walks the chain, recomputes each chain hash from its inputs,
 * and compares to the stored chain hash.
 *
 * Preserves K3: any third party can run this independently.
 * Preserves G1: if verification cannot be guaranteed, it fails closed.
 *
 * @param items - Array of ChainItems, ordered by chainPosition ascending
 * @returns Verification result with valid status and optional brokenAt position
 */
export function verifyChain(items: ChainItem[]): ChainVerificationResult {
  // Empty chain is valid (no evidence to verify)
  if (items.length === 0) {
    return { valid: true, itemsVerified: 0 };
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // L2: Surface ordering ambiguity — positions must be sequential
    const expectedPosition = i + 1;
    if (item.chainPosition !== expectedPosition) {
      return {
        valid: false,
        brokenAt: expectedPosition,
        itemsVerified: i,
      };
    }

    // Determine what the previous hash should be
    const expectedPreviousHash =
      i === 0 ? GENESIS : items[i - 1].chainHash;

    // L1: Previous hash linkage must be explicit and correct
    if (item.previousHash !== expectedPreviousHash) {
      return {
        valid: false,
        brokenAt: item.chainPosition,
        itemsVerified: i,
      };
    }

    // K2 + A3: Recompute the chain hash from its inputs
    const recomputedChainHash = computeChainHash(
      item.contentHash,
      item.ingestedAt,
      item.previousHash
    );

    // If recomputed hash ≠ stored hash → CHAIN BROKEN → evidence tampered
    if (recomputedChainHash !== item.chainHash) {
      return {
        valid: false,
        brokenAt: item.chainPosition,
        itemsVerified: i,
      };
    }
  }

  return {
    valid: true,
    itemsVerified: items.length,
  };
}

/**
 * Verify a custody event chain from genesis to tip.
 * Same logic as evidence chain verification, applied to custody events.
 *
 * @param events - Array of CustodyEventItems, ordered by chainPosition ascending
 * @returns Verification result
 */
export function verifyCustodyChain(
  events: CustodyEventItem[]
): ChainVerificationResult {
  if (events.length === 0) {
    return { valid: true, itemsVerified: 0 };
  }

  for (let i = 0; i < events.length; i++) {
    const event = events[i];

    const expectedPosition = i + 1;
    if (event.chainPosition !== expectedPosition) {
      return {
        valid: false,
        brokenAt: expectedPosition,
        itemsVerified: i,
      };
    }

    const expectedPreviousHash =
      i === 0 ? GENESIS : events[i - 1].chainHash;

    if (event.previousHash !== expectedPreviousHash) {
      return {
        valid: false,
        brokenAt: event.chainPosition,
        itemsVerified: i,
      };
    }

    const recomputedChainHash = computeEventChainHash(
      event.eventHash,
      event.createdAt,
      event.previousHash
    );

    if (recomputedChainHash !== event.chainHash) {
      return {
        valid: false,
        brokenAt: event.chainPosition,
        itemsVerified: i,
      };
    }
  }

  return {
    valid: true,
    itemsVerified: events.length,
  };
}
