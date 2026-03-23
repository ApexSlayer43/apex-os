/**
 * AetherTrace Hash Chain Tests
 *
 * These tests verify the cryptographic foundation of the entire system.
 * Every test is named for the invariant it proves.
 *
 * If any test fails, ANVIL does not proceed to Phase 2.
 * Build Risk #1 from CLAUDE.md: "Hash chain must be correct on first pass."
 */

import { describe, it, expect } from 'vitest';
import {
  computeContentHash,
  computeChainHash,
  computeEventHash,
  computeEventChainHash,
  verifyChain,
  verifyCustodyChain,
  GENESIS,
  ChainItem,
  CustodyEventItem,
} from './hash-chain';

// ─── Helper: build a valid chain of N items ──────────────────────────────────

function buildChain(count: number): ChainItem[] {
  const items: ChainItem[] = [];
  for (let i = 0; i < count; i++) {
    const contentHash = computeContentHash(
      Buffer.from(`test-content-${i}`)
    );
    const ingestedAt = new Date(2026, 2, 15, 10, 0, i).toISOString();
    const previousHash = i === 0 ? GENESIS : items[i - 1].chainHash;
    const chainHash = computeChainHash(contentHash, ingestedAt, previousHash);

    items.push({
      contentHash,
      ingestedAt,
      chainHash,
      chainPosition: i + 1,
      previousHash,
    });
  }
  return items;
}

function buildEventChain(count: number): CustodyEventItem[] {
  const events: CustodyEventItem[] = [];
  for (let i = 0; i < count; i++) {
    const eventHash = computeEventHash({
      type: 'ingested',
      evidenceItemId: `item-${i}`,
      actorId: 'user-1',
    });
    const createdAt = new Date(2026, 2, 15, 10, 0, i).toISOString();
    const previousHash = i === 0 ? GENESIS : events[i - 1].chainHash;
    const chainHash = computeEventChainHash(
      eventHash,
      createdAt,
      previousHash
    );

    events.push({
      eventHash,
      createdAt,
      chainHash,
      chainPosition: i + 1,
      previousHash,
    });
  }
  return events;
}

// ─── computeContentHash ──────────────────────────────────────────────────────

describe('computeContentHash', () => {
  it('A3: identical content produces identical hash', () => {
    const content = Buffer.from('hello world');
    const hash1 = computeContentHash(content);
    const hash2 = computeContentHash(content);
    expect(hash1).toBe(hash2);
  });

  it('K2: different content produces different hash', () => {
    const hash1 = computeContentHash(Buffer.from('file-a'));
    const hash2 = computeContentHash(Buffer.from('file-b'));
    expect(hash1).not.toBe(hash2);
  });

  it('returns a 64-character lowercase hex string (SHA-256)', () => {
    const hash = computeContentHash(Buffer.from('test'));
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('matches known SHA-256 output', () => {
    // SHA-256 of empty string is well-known
    const hash = computeContentHash(Buffer.from(''));
    expect(hash).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    );
  });

  it('handles binary content (not just text)', () => {
    const binary = Buffer.from([0x00, 0xff, 0x42, 0xde, 0xad, 0xbe, 0xef]);
    const hash = computeContentHash(binary);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
});

// ─── computeChainHash ────────────────────────────────────────────────────────

describe('computeChainHash', () => {
  it('A3: identical inputs produce identical chain hash', () => {
    const hash1 = computeChainHash('abc', '2026-03-15T10:00:00Z', GENESIS);
    const hash2 = computeChainHash('abc', '2026-03-15T10:00:00Z', GENESIS);
    expect(hash1).toBe(hash2);
  });

  it('L1: different content hash produces different chain hash', () => {
    const hash1 = computeChainHash('abc', '2026-03-15T10:00:00Z', GENESIS);
    const hash2 = computeChainHash('def', '2026-03-15T10:00:00Z', GENESIS);
    expect(hash1).not.toBe(hash2);
  });

  it('L3: same content at different timestamps produces different chain hash', () => {
    const hash1 = computeChainHash('abc', '2026-03-15T10:00:00Z', GENESIS);
    const hash2 = computeChainHash('abc', '2026-03-15T10:00:01Z', GENESIS);
    expect(hash1).not.toBe(hash2);
  });

  it('L1: different previous hash produces different chain hash', () => {
    const hash1 = computeChainHash('abc', '2026-03-15T10:00:00Z', GENESIS);
    const hash2 = computeChainHash('abc', '2026-03-15T10:00:00Z', 'somehash');
    expect(hash1).not.toBe(hash2);
  });

  it('uses GENESIS string for first item in chain', () => {
    const hash = computeChainHash('abc', '2026-03-15T10:00:00Z', GENESIS);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
});

// ─── computeEventHash ────────────────────────────────────────────────────────

describe('computeEventHash', () => {
  it('A3: identical event data produces identical hash', () => {
    const data = { type: 'ingested', itemId: '123', actor: 'user-1' };
    const hash1 = computeEventHash(data);
    const hash2 = computeEventHash(data);
    expect(hash1).toBe(hash2);
  });

  it('A3: key order does not affect hash (sorted internally)', () => {
    const hash1 = computeEventHash({ b: 2, a: 1 });
    const hash2 = computeEventHash({ a: 1, b: 2 });
    expect(hash1).toBe(hash2);
  });

  it('different event data produces different hash', () => {
    const hash1 = computeEventHash({ type: 'ingested' });
    const hash2 = computeEventHash({ type: 'exported' });
    expect(hash1).not.toBe(hash2);
  });
});

// ─── computeEventChainHash ───────────────────────────────────────────────────

describe('computeEventChainHash', () => {
  it('A3: identical inputs produce identical event chain hash', () => {
    const hash1 = computeEventChainHash('abc', '2026-03-15T10:00:00Z', GENESIS);
    const hash2 = computeEventChainHash('abc', '2026-03-15T10:00:00Z', GENESIS);
    expect(hash1).toBe(hash2);
  });

  it('different event hash produces different chain hash', () => {
    const hash1 = computeEventChainHash('abc', '2026-03-15T10:00:00Z', GENESIS);
    const hash2 = computeEventChainHash('def', '2026-03-15T10:00:00Z', GENESIS);
    expect(hash1).not.toBe(hash2);
  });
});

// ─── verifyChain ─────────────────────────────────────────────────────────────

describe('verifyChain', () => {
  it('empty chain is valid (no evidence to verify)', () => {
    const result = verifyChain([]);
    expect(result.valid).toBe(true);
    expect(result.itemsVerified).toBe(0);
  });

  it('single-item chain with correct genesis is valid', () => {
    const chain = buildChain(1);
    const result = verifyChain(chain);
    expect(result.valid).toBe(true);
    expect(result.itemsVerified).toBe(1);
  });

  it('K1: valid 3-item chain passes verification', () => {
    const chain = buildChain(3);
    const result = verifyChain(chain);
    expect(result.valid).toBe(true);
    expect(result.itemsVerified).toBe(3);
  });

  it('valid 10-item chain passes verification', () => {
    const chain = buildChain(10);
    const result = verifyChain(chain);
    expect(result.valid).toBe(true);
    expect(result.itemsVerified).toBe(10);
  });

  it('detects tampered content hash (evidence altered)', () => {
    const chain = buildChain(3);
    // Tamper: change the content hash of item 2
    chain[1] = { ...chain[1], contentHash: 'tampered_hash_value' };
    const result = verifyChain(chain);
    expect(result.valid).toBe(false);
    expect(result.brokenAt).toBe(2);
  });

  it('detects tampered chain hash directly', () => {
    const chain = buildChain(3);
    // Tamper: change the chain hash of item 2
    chain[1] = { ...chain[1], chainHash: 'tampered_chain_hash' };
    const result = verifyChain(chain);
    expect(result.valid).toBe(false);
    expect(result.brokenAt).toBe(2);
  });

  it('detects tampered timestamp (L3: time is metadata)', () => {
    const chain = buildChain(3);
    // Tamper: change the timestamp of item 2
    chain[1] = { ...chain[1], ingestedAt: '2099-01-01T00:00:00Z' };
    const result = verifyChain(chain);
    expect(result.valid).toBe(false);
    expect(result.brokenAt).toBe(2);
  });

  it('detects deleted middle item (gap in chain)', () => {
    const chain = buildChain(3);
    // Remove middle item — positions become [1, 3]
    const broken = [chain[0], chain[2]];
    const result = verifyChain(broken);
    expect(result.valid).toBe(false);
    expect(result.brokenAt).toBe(2); // Expected position 2, got 3
  });

  it('detects reordered items', () => {
    const chain = buildChain(3);
    // Swap items 1 and 2
    const reordered = [chain[0], chain[2], chain[1]];
    const result = verifyChain(reordered);
    expect(result.valid).toBe(false);
  });

  it('detects broken genesis (first item with wrong previousHash)', () => {
    const chain = buildChain(3);
    // Tamper: first item claims a non-GENESIS previous
    chain[0] = { ...chain[0], previousHash: 'not_genesis' };
    const result = verifyChain(chain);
    expect(result.valid).toBe(false);
    expect(result.brokenAt).toBe(1);
  });

  it('detects broken linkage between items 2 and 3', () => {
    const chain = buildChain(3);
    // Tamper: item 3 claims wrong previous hash
    chain[2] = { ...chain[2], previousHash: 'wrong_previous' };
    const result = verifyChain(chain);
    expect(result.valid).toBe(false);
    expect(result.brokenAt).toBe(3);
  });

  it('reports correct itemsVerified count on failure', () => {
    const chain = buildChain(5);
    // Break at position 4
    chain[3] = { ...chain[3], contentHash: 'tampered' };
    const result = verifyChain(chain);
    expect(result.valid).toBe(false);
    expect(result.brokenAt).toBe(4);
    expect(result.itemsVerified).toBe(3); // 3 items verified before break
  });
});

// ─── verifyCustodyChain ──────────────────────────────────────────────────────

describe('verifyCustodyChain', () => {
  it('empty custody chain is valid', () => {
    const result = verifyCustodyChain([]);
    expect(result.valid).toBe(true);
    expect(result.itemsVerified).toBe(0);
  });

  it('valid 3-event custody chain passes verification', () => {
    const chain = buildEventChain(3);
    const result = verifyCustodyChain(chain);
    expect(result.valid).toBe(true);
    expect(result.itemsVerified).toBe(3);
  });

  it('detects tampered custody event', () => {
    const chain = buildEventChain(3);
    chain[1] = { ...chain[1], eventHash: 'tampered_event' };
    const result = verifyCustodyChain(chain);
    expect(result.valid).toBe(false);
    expect(result.brokenAt).toBe(2);
  });

  it('detects deleted custody event', () => {
    const chain = buildEventChain(3);
    const broken = [chain[0], chain[2]];
    const result = verifyCustodyChain(broken);
    expect(result.valid).toBe(false);
  });
});

// ─── Integration: full chain lifecycle ───────────────────────────────────────

describe('Integration: evidence chain lifecycle', () => {
  it('simulates real upload → chain → verify workflow', () => {
    // Simulate 3 evidence uploads, each building on the previous chain
    const file1 = Buffer.from('inspection-report-foundation.pdf');
    const file2 = Buffer.from('concrete-pour-photo-001.jpg');
    const file3 = Buffer.from('material-delivery-receipt-steel.pdf');

    const items: ChainItem[] = [];

    // Upload 1: genesis
    const hash1 = computeContentHash(file1);
    const time1 = '2026-03-15T10:00:00.000Z';
    const chainHash1 = computeChainHash(hash1, time1, GENESIS);
    items.push({
      contentHash: hash1,
      ingestedAt: time1,
      chainHash: chainHash1,
      chainPosition: 1,
      previousHash: GENESIS,
    });

    // Upload 2: links to item 1
    const hash2 = computeContentHash(file2);
    const time2 = '2026-03-15T14:30:00.000Z';
    const chainHash2 = computeChainHash(hash2, time2, chainHash1);
    items.push({
      contentHash: hash2,
      ingestedAt: time2,
      chainHash: chainHash2,
      chainPosition: 2,
      previousHash: chainHash1,
    });

    // Upload 3: links to item 2
    const hash3 = computeContentHash(file3);
    const time3 = '2026-03-16T09:15:00.000Z';
    const chainHash3 = computeChainHash(hash3, time3, chainHash2);
    items.push({
      contentHash: hash3,
      ingestedAt: time3,
      chainHash: chainHash3,
      chainPosition: 3,
      previousHash: chainHash2,
    });

    // Verify entire chain
    const result = verifyChain(items);
    expect(result.valid).toBe(true);
    expect(result.itemsVerified).toBe(3);

    // Now simulate tampering: someone alters the PDF file
    const tamperedItems = items.map((item, i) => {
      if (i === 0) {
        // Swap content hash as if the file was altered
        return {
          ...item,
          contentHash: computeContentHash(
            Buffer.from('ALTERED-inspection-report.pdf')
          ),
        };
      }
      return item;
    });

    const tamperedResult = verifyChain(tamperedItems);
    expect(tamperedResult.valid).toBe(false);
    expect(tamperedResult.brokenAt).toBe(1);
  });
});
