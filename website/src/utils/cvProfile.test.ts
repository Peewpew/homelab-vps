import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_CV_PROFILE,
  MAX_CV_PDF_BYTES,
  formatFileSize,
  normalizeLinkedinUrl,
  parseGithubRepoInput,
  validateIntroFields,
  validatePdfFileMeta,
} from './cvProfile';
import { TECH_STACK_MODULES, filterTechStackModules } from '../data/techStackContent';

test('formatFileSize formats bytes, kilobytes, and megabytes cleanly', () => {
  assert.equal(formatFileSize(512), '512 B');
  assert.equal(formatFileSize(2048), '2.0 KB');
  assert.equal(formatFileSize(1.5 * 1024 * 1024), '1.50 MB');
});

test('validateIntroFields accepts defaults and rejects blank fields', () => {
  const valid = validateIntroFields(DEFAULT_CV_PROFILE);
  assert.equal(valid.valid, true);
  assert.deepEqual(valid.errors, {});

  const invalid = validateIntroFields({
    fullName: '   ',
    headline: '',
    introBio: ' ',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.fullName);
  assert.ok(invalid.errors.headline);
  assert.ok(invalid.errors.introBio);
});

test('validatePdfFileMeta accepts valid PDFs and rejects non-PDF or oversized files', () => {
  assert.deepEqual(
    validatePdfFileMeta({ name: 'Peewpew_CV.pdf', type: 'application/pdf', size: 245000 }),
    { valid: true }
  );

  const nonPdf = validatePdfFileMeta({ name: 'resume.docx', type: 'application/msword', size: 12000 });
  assert.equal(nonPdf.valid, false);
  assert.ok(nonPdf.error);

  const tooBig = validatePdfFileMeta({
    name: 'huge.pdf',
    type: 'application/pdf',
    size: MAX_CV_PDF_BYTES + 1024,
  });
  assert.equal(tooBig.valid, false);
  assert.ok(tooBig.error);
});

test('normalizeLinkedinUrl prepends https and rejects invalid URLs', () => {
  const normalized = normalizeLinkedinUrl('www.linkedin.com/in/peewpeew');
  assert.equal(normalized.valid, true);
  assert.equal(normalized.url, 'https://www.linkedin.com/in/peewpeew');

  const invalid = normalizeLinkedinUrl('not a url');
  assert.equal(invalid.valid, false);
  assert.ok(invalid.error);
});

test('parseGithubRepoInput accepts owner/repo shorthand and full GitHub URLs', () => {
  const fromShort = parseGithubRepoInput({
    repoOrUrl: 'Peewpew/immich-stack',
    description: 'Standalone Immich deployment',
  });
  assert.equal(fromShort.valid, true);
  assert.equal(fromShort.repo?.label, 'Peewpew/immich-stack');
  assert.equal(fromShort.repo?.url, 'https://github.com/Peewpew/immich-stack');
  assert.equal(fromShort.repo?.description, 'Standalone Immich deployment');

  const fromUrl = parseGithubRepoInput({
    repoOrUrl: 'https://github.com/Peewpew/homelab-vps.git/',
  });
  assert.equal(fromUrl.valid, true);
  assert.equal(fromUrl.repo?.label, 'Peewpew/homelab-vps');
  assert.equal(fromUrl.repo?.url, 'https://github.com/Peewpew/homelab-vps');

  const invalid = parseGithubRepoInput({ repoOrUrl: 'invalid-repo-name' });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.error);
});

test('filterTechStackModules includes Docker, Kubernetes, and Git and filters cleanly', () => {
  assert.equal(filterTechStackModules('All').length, TECH_STACK_MODULES.length);
  assert.deepEqual(
    filterTechStackModules('All').map((m) => m.id),
    ['Docker', 'Kubernetes', 'Git']
  );
  assert.equal(filterTechStackModules('Kubernetes').length, 1);
  assert.equal(filterTechStackModules('Kubernetes')[0].id, 'Kubernetes');
});
