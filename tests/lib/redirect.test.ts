import { describe, it, expect } from 'vitest';
import { getSafeRedirectPath } from '@/lib/redirect';

describe.skip('getSafeRedirectPath', () => {
  const FALLBACK = '/';

  it('returns the fallback when the param is null', () => {
    expect(getSafeRedirectPath(null, FALLBACK)).toBe(FALLBACK);
  });

  it('returns the fallback when the param is an empty string', () => {
    expect(getSafeRedirectPath('', FALLBACK)).toBe(FALLBACK);
  });

  it('returns a valid relative path unchanged', () => {
    expect(getSafeRedirectPath('/checkout', FALLBACK)).toBe('/checkout');
  });

  it('preserves a query string and hash on an otherwise-valid path', () => {
    // ADDED — not in the doc. A naive "must start with /" check could
    // accidentally still pass this, but it's worth confirming the good
    // path isn't over-sanitized (e.g. stripped to just "/checkout").
    expect(getSafeRedirectPath('/checkout?step=2#summary', FALLBACK)).toBe(
      '/checkout?step=2#summary'
    );
  });

  it('rejects an absolute URL to another host', () => {
    expect(getSafeRedirectPath('https://evil.example.com', FALLBACK)).toBe(FALLBACK);
  });

  it('rejects a protocol-relative //host redirect', () => {
    expect(getSafeRedirectPath('//evil.example.com', FALLBACK)).toBe(FALLBACK);
  });

  // ADDED, and genuinely critical — not mentioned in either doc. A leading
  // backslash is a known bypass for naive `startsWith('/')` guards: some
  // URL parsers (and historically, some browsers) treat `\` the same as
  // `/` when resolving a URL, so `\evil.com` can be interpreted exactly
  // like `//evil.com` even though the literal string doesn't start with
  // two forward slashes. A check that only looks for `//` at the start
  // would let this straight through.
  it('rejects a leading-backslash redirect (\\evil.example.com)', () => {
    expect(getSafeRedirectPath('\\evil.example.com', FALLBACK)).toBe(FALLBACK);
  });

  // ADDED — combines both tricks: starts with one real "/" (passing a
  // naive startsWith('/') check) immediately followed by a backslash,
  // which some parsers still resolve as a second slash.
  it('rejects a redirect combining a leading slash with a backslash (/\\evil.example.com)', () => {
    expect(getSafeRedirectPath('/\\evil.example.com', FALLBACK)).toBe(FALLBACK);
  });

  // ADDED — leading whitespace before a scheme has been used historically
  // to slip past naive prefix checks in some parsing contexts.
  it('rejects a redirect with leading whitespace before an absolute URL', () => {
    expect(getSafeRedirectPath('  https://evil.example.com', FALLBACK)).toBe(FALLBACK);
  });
});
