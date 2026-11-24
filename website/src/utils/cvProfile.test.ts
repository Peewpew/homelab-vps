import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {
  MAX_CV_PDF_BYTES,
  PORTFOLIO_PROFILE,
  formatFileSize,
  isPdfContentType,
  isPdfMagicHeader,
  isSafeHttpUrl,
  normalizeLinkedinUrl,
  parseGithubRepoInput,
  validateIntroFields,
  validatePdfFileMeta,
} from './cvProfile';
import {
  hashPassword,
  resolveConfinedPath,
  signSessionToken,
  timingSafeEqualStrings,
  verifyPassword,
  verifySessionToken,
} from './serverAuth';
import { TECH_STACK_MODULES, filterTechStackModules } from '../data/techStackContent';

test('PORTFOLIO_PROFILE and validation helpers validate inputs accurately', () => {
  assert.equal(validateIntroFields(PORTFOLIO_PROFILE).valid, true);
  assert.equal(
    validateIntroFields({ fullName: ' ', headline: '', introBio: '' }).valid,
    false
  );
  assert.equal(formatFileSize(2048), '2.0 KB');
  assert.equal(
    validatePdfFileMeta({ name: 'cv.pdf', type: 'application/pdf', size: 1024 }).valid,
    true
  );
  assert.equal(
    validatePdfFileMeta({ name: 'cv.pdf', type: 'application/pdf', size: MAX_CV_PDF_BYTES + 1 })
      .valid,
    false
  );
  assert.equal(isPdfMagicHeader(Buffer.from('%PDF-1.4')), true);
  assert.equal(isPdfMagicHeader(Buffer.from('<html')), false);
  assert.equal(isPdfContentType('application/pdf'), true);
  assert.equal(isPdfContentType('text/html'), false);
  assert.equal(isSafeHttpUrl('https://github.com/Peewpew'), true);
  assert.equal(isSafeHttpUrl('javascript:alert(1)'), false);
});

test('LinkedIn and GitHub repo parsers normalize and reject invalid entries', () => {
  const ln = normalizeLinkedinUrl('linkedin.com/in/peewpeew');
  assert.equal(ln.valid, true);
  assert.equal(ln.url, 'https://linkedin.com/in/peewpeew');
  assert.equal(normalizeLinkedinUrl('invalid link').valid, false);

  const gh = parseGithubRepoInput({
    repoOrUrl: 'https://github.com/Peewpew/homelab-vps.git',
    description: 'Homelab repo',
  });
  assert.equal(gh.valid, true);
  assert.equal(gh.repo?.label, 'Peewpew/homelab-vps');
  assert.equal(parseGithubRepoInput({ repoOrUrl: 'bad repo' }).valid, false);
});

test('scrypt password hashing, HMAC session tokens, and path confinement enforce security', () => {
  const { hash, salt } = hashPassword('super-secret-pass');
  assert.equal(verifyPassword('super-secret-pass', hash, salt), true);
  assert.equal(verifyPassword('wrong-pass', hash, salt), false);
  assert.equal(timingSafeEqualStrings('abc', 'abc'), true);
  assert.equal(timingSafeEqualStrings('abc', 'abd'), false);

  const secret = 'test-signing-secret';
  const token = signSessionToken(secret, 60_000);
  assert.equal(verifySessionToken(token, secret), true);
  assert.equal(verifySessionToken(token, 'wrong-secret'), false);
  assert.equal(verifySessionToken(token, secret, Date.now() + 120_000), false);

  const confined = resolveConfinedPath('/tmp/data', 'cv.pdf');
  assert.equal(confined, path.resolve('/tmp/data', 'cv.pdf'));
  assert.throws(() => resolveConfinedPath('/tmp/data', '../etc/passwd'));
});

test('filterTechStackModules includes Docker, Kubernetes, and Git', () => {
  assert.deepEqual(
    filterTechStackModules('All').map((m) => m.id),
    TECH_STACK_MODULES.map((m) => m.id)
  );
  assert.equal(filterTechStackModules('Docker').length, 1);
});
