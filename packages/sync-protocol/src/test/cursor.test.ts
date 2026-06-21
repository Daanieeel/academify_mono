import { describe, expect, it } from 'bun:test';

import {
  computeNextSyncWindow,
  isDuplicateOrOutOfOrder,
  isStaleAck,
  validateCursorProgression,
} from '../index';

describe('validateCursorProgression', () => {
  it('accepts a strictly increasing cursor', () => {
    expect(validateCursorProgression('5', '6')).toBe(true);
  });

  it('accepts a cursor that jumps ahead (gap)', () => {
    expect(validateCursorProgression('3', '10')).toBe(true);
  });

  it('rejects an equal cursor (duplicate)', () => {
    expect(validateCursorProgression('5', '5')).toBe(false);
  });

  it('rejects a lower cursor (out of order)', () => {
    expect(validateCursorProgression('5', '4')).toBe(false);
  });

  it('compares beyond Number.MAX_SAFE_INTEGER correctly', () => {
    expect(
      validateCursorProgression('9007199254740993', '9007199254740994'),
    ).toBe(true);
  });
});

describe('isDuplicateOrOutOfOrder', () => {
  it('flags an exact duplicate', () => {
    expect(isDuplicateOrOutOfOrder('42', '42')).toBe(true);
  });

  it('flags an out-of-order (lower) cursor', () => {
    expect(isDuplicateOrOutOfOrder('42', '41')).toBe(true);
  });

  it('does not flag a new, higher cursor', () => {
    expect(isDuplicateOrOutOfOrder('42', '43')).toBe(false);
  });
});

describe('isStaleAck', () => {
  it('rejects an ack equal to the current cursor', () => {
    expect(isStaleAck('100', '100')).toBe(true);
  });

  it('rejects an ack lower than the current cursor', () => {
    expect(isStaleAck('100', '99')).toBe(true);
  });

  it('accepts an ack higher than the current cursor', () => {
    expect(isStaleAck('100', '101')).toBe(false);
  });
});

describe('computeNextSyncWindow', () => {
  it('applies the default limit when omitted', () => {
    expect(computeNextSyncWindow('0')).toEqual({
      after_cursor: '0',
      limit: 100,
    });
  });

  it('clamps a limit above the max', () => {
    expect(computeNextSyncWindow('0', 10000).limit).toBe(500);
  });

  it('clamps a limit below 1', () => {
    expect(computeNextSyncWindow('0', 0).limit).toBe(1);
  });
});
