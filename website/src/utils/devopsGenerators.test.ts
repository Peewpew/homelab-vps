import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_HOST_CONFIG,
  INITIAL_REPO_ITEMS,
  calculateCleanRepoStats,
  generateGitHubActionsWorkflow,
  generateNginxServerBlock,
  generatePowerShellCleanupScript,
  generateSshConfigSnippet,
  generateSystemdAptTimer,
  generateVerifyDeployScript,
  generateWeeklyAptScript,
  validateHostConfig,
} from './devopsGenerators';

test('validateHostConfig accepts valid default Peewpew/homelab-vps config', () => {
  const result = validateHostConfig(DEFAULT_HOST_CONFIG);
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
});

test('validateHostConfig rejects empty IP, spaced SSH alias, and invalid port', () => {
  const result = validateHostConfig({
    ...DEFAULT_HOST_CONFIG,
    vpsIp: '   ',
    sshAlias: 'my host',
    appPort: 22,
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.vpsIp);
  assert.ok(result.errors.sshAlias);
  assert.ok(result.errors.appPort);
});

test('calculateCleanRepoStats accurately sums removed and kept items', () => {
  const stats = calculateCleanRepoStats(INITIAL_REPO_ITEMS);
  assert.equal(stats.totalCount, INITIAL_REPO_ITEMS.length);
  assert.equal(stats.removedCount, 7);
  assert.equal(stats.keptCount, 3);
  assert.equal(stats.reclaimedLabel, '20 KB');
});

test('generatePowerShellCleanupScript consolidates develop into main and removes stub files', () => {
  const script = generatePowerShellCleanupScript(DEFAULT_HOST_CONFIG, INITIAL_REPO_ITEMS);
  assert.match(script, /git checkout -b backup\/pre-cleanup/);
  assert.match(script, /git merge develop --ff-only/);
  assert.match(script, /feature-branch-ci\.yml/);
  assert.match(script, /git push origin main/);
  assert.match(script, /git push origin --delete feature\/backups-scripts/);
});

test('generateWeeklyAptScript and generateSystemdAptTimer configure non-interactive Ubuntu 24.04 updates', () => {
  const aptScript = generateWeeklyAptScript(DEFAULT_HOST_CONFIG);
  const timerUnit = generateSystemdAptTimer(DEFAULT_HOST_CONFIG);
  assert.match(aptScript, /DEBIAN_FRONTEND=noninteractive/);
  assert.match(aptScript, /apt-get update -qq/);
  assert.match(aptScript, /\/var\/run\/reboot-required/);
  assert.match(timerUnit, /OnCalendar=Sun \*-\*-\* 03:00:00 UTC/);
  assert.match(timerUnit, /Persistent=true/);
});

test('generateVerifyDeployScript checks Git commit parity and weekly APT timer', () => {
  const verify = generateVerifyDeployScript(DEFAULT_HOST_CONFIG);
  assert.match(verify, /git -C "\$REPO_DIR" rev-parse HEAD/);
  assert.match(verify, /homelab-apt-upgrade\.timer/);
  assert.match(verify, /https:\/\/ops\.example\.com/);
});

test('generateSshConfigSnippet formats VSCode Remote-SSH host block', () => {
  const ssh = generateSshConfigSnippet({
    ...DEFAULT_HOST_CONFIG,
    sshAlias: 'prod-vps',
    vpsIp: '203.0.113.88',
    vpsUser: 'ubuntu',
  });
  assert.match(ssh, /Host prod-vps/);
  assert.match(ssh, /HostName 203\.0\.113\.88/);
  assert.match(ssh, /User ubuntu/);
});

test('generateNginxServerBlock and GitHub Actions embed domain, repoName, and port', () => {
  const custom = {
    ...DEFAULT_HOST_CONFIG,
    domain: 'devops.peewpew.io',
    repoName: 'homelab-vps',
    appPort: 4000,
  };
  const nginx = generateNginxServerBlock(custom);
  const workflow = generateGitHubActionsWorkflow(custom);

  assert.match(nginx, /server_name devops\.peewpew\.io/);
  assert.match(nginx, /root \/var\/www\/homelab-vps\/dist;/);
  assert.match(nginx, /proxy_pass http:\/\/127\.0\.0\.1:4000;/);
  assert.match(workflow, /TARGET: "\/var\/www\/homelab-vps\/dist"/);
});
