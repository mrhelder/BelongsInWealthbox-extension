// Run with: node --test tests/extension.test.mjs (no npm packages required).
import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('manifest.json', root), 'utf8'));
const script = await readFile(new URL('content.js', root), 'utf8');

test('minimal local-only Manifest V3 configuration', () => {
  assert.equal(manifest.manifest_version, 3);
  assert.deepEqual(manifest.content_scripts[0].matches, ['https://*.crmworkspace.com/*']);
  assert.deepEqual(manifest.content_scripts[0].js, ['content.js']);
  assert.equal(manifest.content_scripts[0].run_at, 'document_idle');
  assert.equal(manifest.background, undefined);
  assert.equal(manifest.permissions, undefined);
  assert.equal(manifest.host_permissions, undefined);
  assert.doesNotMatch(script, /\b(?:fetch|XMLHttpRequest|WebSocket|sendBeacon)\s*\(/);
  assert.doesNotMatch(script, /\bconsole\./);
  assert.doesNotMatch(script, /history\.(?:pushState|replaceState)\s*=/);
});

const instrumented = script.replace(/\}\)\(\);\s*$/, 'globalThis.__test = { PHONE_PATTERN, toTelHref }; })();');
assert.notEqual(instrumented, script);
const environment = { document: { readyState: 'loading', addEventListener() {} } };
vm.runInNewContext(instrumented, environment);
const { PHONE_PATTERN, toTelHref } = environment.__test;
const dial = value => [...value.matchAll(PHONE_PATTERN)]
  .map(match => ({ text: match[0], href: toTelHref(match[0]) }))
  .filter(match => match.href);

test('recognizes supported NANP formats and preserves full prefix', () => {
  for (const value of [
    '(919) 555-0123', '919-555-0123', '919.555.0123',
    '919 555 0123', '9195550123', '+1 (919) 555-0123',
    '1-919-555-0123', '+19195550123'
  ]) {
    assert.deepEqual(dial(value), [{ text: value, href: 'tel:+19195550123' }], value);
  }
});

test('rejects longer identifiers, invalid NANP ranges, and foreign country codes', () => {
  for (const value of [
    '1234567890123456', '919-555-01234', 'ABC9195550123X',
    '0000000000', '1234567890', '919-055-0123',
    '+44 919-555-0123', '+971 919 555 0123', '+44 20 7946 0958'
  ]) {
    assert.deepEqual(dial(value), [], value);
  }
});

test('retains extension as separate visible text and accepts multiple numbers', () => {
  const text = 'Call 919-555-0123 ext. 204 or 919-555-0124';
  assert.deepEqual(dial(text), [
    { text: '919-555-0123', href: 'tel:+19195550123' },
    { text: '919-555-0124', href: 'tel:+19195550124' }
  ]);
});
