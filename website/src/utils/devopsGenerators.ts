export interface HostConfig {
  engineerName: string;
  roleTitle: string;
  vpsIp: string;
  vpsUser: string;
  sshAlias: string;
  domain: string;
  githubUser: string;
  repoName: string;
  branch: string;
  appPort: number;
}

export interface RepoCleanupItem {
  id: string;
  path: string;
  category: 'placeholder-stub' | 'stale-branch' | 'empty-file' | 'keep';
  sizeKb: number;
  reason: string;
  selectedForRemoval: boolean;
}

export type ValidationErrors = Partial<Record<keyof HostConfig, string>>;

export const DEFAULT_HOST_CONFIG: HostConfig = {
  engineerName: 'Peewpew',
  roleTitle: 'Linux Systems & DevOps Engineer',
  vpsIp: '198.51.100.24',
  vpsUser: 'deploy',
  sshAlias: 'contabo-noble',
  domain: 'ops.example.com',
  githubUser: 'Peewpew',
  repoName: 'homelab-vps',
  branch: 'main',
  appPort: 3000,
};

export const INITIAL_REPO_ITEMS: RepoCleanupItem[] = [
  {
    id: 'stub-1',
    path: '.github/workflows/feature-branch-ci.yml',
    category: 'empty-file',
    sizeKb: 1,
    reason: '0-byte empty workflow on develop; broken Immich boot on feature/workflow-ci',
    selectedForRemoval: true,
  },
  {
    id: 'stub-2',
    path: '.github/workflows/ci.yml',
    category: 'placeholder-stub',
    sizeKb: 1,
    reason: 'Placeholder workflow that only echoes ready message; replace with real CI/CD',
    selectedForRemoval: true,
  },
  {
    id: 'stub-3',
    path: 'website/README.md',
    category: 'empty-file',
    sizeKb: 1,
    reason: '0-byte placeholder in website/; replace with real Vite/React portfolio app',
    selectedForRemoval: true,
  },
  {
    id: 'stub-4',
    path: 'scripts/README.md',
    category: 'placeholder-stub',
    sizeKb: 1,
    reason: 'ChatGPT-generated list of missing scripts (update-all.sh, deploy.sh)',
    selectedForRemoval: true,
  },
  {
    id: 'stub-5',
    path: 'infra/README.md',
    category: 'placeholder-stub',
    sizeKb: 1,
    reason: 'ChatGPT-generated placeholder docs for missing ufw.sh / docker-install.sh',
    selectedForRemoval: true,
  },
  {
    id: 'branch-1',
    path: '5 stale feature/* branches + develop drift',
    category: 'stale-branch',
    sizeKb: 12,
    reason: 'Consolidate develop into main and prune unmerged ChatGPT experiment branches',
    selectedForRemoval: true,
  },
  {
    id: 'immich-remove',
    path: 'immich-app/docker-compose.yml',
    category: 'placeholder-stub',
    sizeKb: 3,
    reason: 'Decouple Immich from homelab-vps so Immich runs independently in /opt/immich',
    selectedForRemoval: true,
  },
  {
    id: 'keep-2',
    path: '.gitignore',
    category: 'keep',
    sizeKb: 1,
    reason: 'Protects .env, *.sql, backups/, node_modules/, and dist/',
    selectedForRemoval: false,
  },
  {
    id: 'keep-3',
    path: 'website/',
    category: 'keep',
    sizeKb: 420,
    reason: 'Host this DevOps portfolio webapp inside website/ with Nginx delivery',
    selectedForRemoval: false,
  },
  {
    id: 'keep-4',
    path: 'scripts/weekly-apt-upgrade.sh + verify-deploy.sh',
    category: 'keep',
    sizeKb: 4,
    reason: 'Weekly Ubuntu 24.04 APT automation and VPS deployment verification',
    selectedForRemoval: false,
  },
];

export function validateHostConfig(config: HostConfig): {
  valid: boolean;
  errors: ValidationErrors;
} {
  const errors: ValidationErrors = {};

  if (!config.engineerName.trim()) {
    errors.engineerName = 'Engineer name is required.';
  }
  if (!config.roleTitle.trim()) {
    errors.roleTitle = 'Role title is required.';
  }
  if (!config.vpsIp.trim() || /\s/.test(config.vpsIp)) {
    errors.vpsIp = 'Enter a valid IPv4 address or hostname without spaces.';
  }
  if (!config.vpsUser.trim() || !/^[a-z_][a-z0-9_-]*$/i.test(config.vpsUser.trim())) {
    errors.vpsUser = 'Enter a valid Linux username (letters, digits, hyphens, underscores).';
  }
  if (!config.sshAlias.trim() || /\s/.test(config.sshAlias)) {
    errors.sshAlias = 'SSH host alias cannot be empty or contain spaces.';
  }
  if (!config.domain.trim() || /\s/.test(config.domain)) {
    errors.domain = 'Enter a valid domain name without spaces.';
  }
  if (!config.githubUser.trim() || !/^[a-zA-Z0-9-]+$/.test(config.githubUser.trim())) {
    errors.githubUser = 'Enter a valid GitHub username.';
  }
  if (!config.repoName.trim() || !/^[a-zA-Z0-9._-]+$/.test(config.repoName.trim())) {
    errors.repoName = 'Enter a valid repository name.';
  }
  if (!config.branch.trim() || /\s/.test(config.branch)) {
    errors.branch = 'Branch name cannot be empty or contain spaces.';
  }
  if (!Number.isInteger(config.appPort) || config.appPort < 80 || config.appPort > 65535) {
    errors.appPort = 'Port must be an integer between 80 and 65535.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function calculateCleanRepoStats(items: RepoCleanupItem[]): {
  totalCount: number;
  removedCount: number;
  keptCount: number;
  reclaimedKb: number;
  reclaimedLabel: string;
} {
  const removed = items.filter((item) => item.selectedForRemoval);
  const kept = items.filter((item) => !item.selectedForRemoval);
  const reclaimedKb = removed.reduce((sum, item) => sum + item.sizeKb, 0);

  const reclaimedLabel =
    reclaimedKb >= 1024
      ? `${(reclaimedKb / 1024).toFixed(1)} MB`
      : `${reclaimedKb} KB`;

  return {
    totalCount: items.length,
    removedCount: removed.length,
    keptCount: kept.length,
    reclaimedKb,
    reclaimedLabel,
  };
}

export function generatePowerShellCleanupScript(
  config: HostConfig,
  items: RepoCleanupItem[]
): string {
  const fileRemovals = items
    .filter((item) => item.selectedForRemoval && item.category !== 'stale-branch')
    .map((item) => `git rm -rf --ignore-unmatch "${item.path}"`)
    .join('\n');

  const pruneBranches = items.some(
    (item) => item.selectedForRemoval && item.category === 'stale-branch'
  );

  const branchBlock = pruneBranches
    ? `# 4. Prune old ChatGPT experiment branches after consolidating into ${config.branch}
git push origin --delete feature/backups-scripts feature/ci-workflow feature/reverse-proxy feature/website-compose feature/workflow-ci`
    : `# Branch pruning unchecked — keeping existing remote feature/* branches`;

  return `# Run in Windows PowerShell inside your local ${config.repoName} clone
# 1. Fetch all branches and back up develop before modifying history
git fetch --all --prune
git checkout develop
git checkout -b backup/pre-cleanup
git push origin backup/pre-cleanup

# 2. Fast-forward ${config.branch} to match develop, then remove 0-byte & placeholder stubs
git checkout ${config.branch}
git merge develop --ff-only
${fileRemovals || '# No stub files selected for removal'}

# 3. Stage clean scripts/, website/, .gitignore, and deploy workflow, then push
git add .gitignore scripts/ infra/ .github/workflows/ website/
git commit -m "chore: clean ChatGPT stubs, add weekly APT timer & Contabo deploy pipeline"
git push origin ${config.branch}

${branchBlock}`;
}

export function generateGitignoreContent(): string {
  return `# Environment files
.env
.env.*

# Database dumps & backups
*.sql
backups/
data/
media/

# Immich runtime data
immich/library/
immich/postgres/

# Website build & dependencies
website/node_modules/
website/dist/
node_modules/
dist/

# Editor & OS clutter
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
.DS_Store
Thumbs.db
*.log`;
}

export function generateGitHubActionsWorkflow(config: HostConfig): string {
  return `name: Deploy ${config.repoName} to Contabo Ubuntu 24.04

on:
  push:
    branches:
      - ${config.branch}
  pull_request:
    branches:
      - ${config.branch}

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Lint shell scripts
        run: |
          if [ -d scripts ]; then
            find scripts -name "*.sh" -exec bash -n {} +
          fi

      - name: Validate Immich Compose file
        run: |
          if [ -f immich-app/docker-compose.yml ]; then
            DB_PASSWORD=ci DB_USERNAME=ci DB_DATABASE_NAME=ci UPLOAD_LOCATION=/tmp DB_DATA_LOCATION=/tmp \\
              docker compose -f immich-app/docker-compose.yml config > /dev/null
          fi

      - name: Build website/ portfolio app
        working-directory: website
        run: |
          npm ci
          npm run lint
          npm run build

  deploy:
    needs: validate
    if: github.ref == 'refs/heads/${config.branch}' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"
          cache-dependency-path: website/package-lock.json

      - name: Build production bundle
        working-directory: website
        run: |
          npm ci
          npm run build

      - name: Sync website/dist and scripts/ to Contabo VPS
        uses: easingthemes/ssh-deploy@v5
        with:
          SSH_PRIVATE_KEY: \${{ secrets.CONTABO_SSH_KEY }}
          REMOTE_HOST: ${config.vpsIp}
          REMOTE_USER: ${config.vpsUser}
          SOURCE: "website/dist/"
          TARGET: "/var/www/${config.repoName}/dist"
          ARGS: "-avzr --delete"

      - name: Sync repo scripts & verify deployment on Ubuntu 24.04
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${config.vpsIp}
          username: ${config.vpsUser}
          key: \${{ secrets.CONTABO_SSH_KEY }}
          script: |
            cd /opt/${config.repoName} && git pull origin ${config.branch}
            sudo nginx -t && sudo systemctl reload nginx
            curl -fsSLI https://${config.domain} | head -n 1`;
}

export function generateWeeklyAptScript(config: HostConfig): string {
  return `#!/usr/bin/env bash
# scripts/weekly-apt-upgrade.sh — Safe weekly APT maintenance for Ubuntu 24.04.5 LTS (Noble)
set -euo pipefail

LOG_FILE="/var/log/homelab-apt-upgrade.log"
export DEBIAN_FRONTEND=noninteractive

log() {
  printf '[%s] %s\\n' "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" "$*" | tee -a "$LOG_FILE"
}

log "Starting weekly APT maintenance on $(hostname) (Ubuntu 24.04 Noble)..."
apt-get update -qq
apt-get -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" upgrade
apt-get -y autoremove --purge
apt-get -y autoclean

if command -v docker >/dev/null 2>&1; then
  log "Pruning dangling Docker images older than 7 days..."
  docker image prune -f --filter "until=168h" >> "$LOG_FILE" 2>&1 || true
fi

if [ -f /var/run/reboot-required ]; then
  log "NOTICE: Kernel or core library update requires a scheduled VPS reboot."
else
  log "Maintenance complete. No reboot required for ${config.domain}."
fi`;
}

export function generateSystemdAptTimer(config: HostConfig): string {
  return `# 1. Save as /etc/systemd/system/homelab-apt-upgrade.service
[Unit]
Description=Weekly APT update & upgrade for ${config.repoName} (${config.domain})
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
ExecStart=/usr/local/sbin/weekly-apt-upgrade.sh
Nice=10

# 2. Save as /etc/systemd/system/homelab-apt-upgrade.timer
[Unit]
Description=Run weekly APT upgrade every Sunday at 03:00 UTC

[Timer]
OnCalendar=Sun *-*-* 03:00:00 UTC
RandomizedDelaySec=15m
Persistent=true

[Install]
WantedBy=timers.target

# 3. Install & verify on Contabo Ubuntu 24.04:
# sudo cp scripts/weekly-apt-upgrade.sh /usr/local/sbin/weekly-apt-upgrade.sh
# sudo chmod 750 /usr/local/sbin/weekly-apt-upgrade.sh
# sudo systemctl daemon-reload
# sudo systemctl enable --now homelab-apt-upgrade.timer
# systemctl list-timers --all | grep homelab-apt-upgrade`;
}

export function generateVerifyDeployScript(config: HostConfig): string {
  return `#!/usr/bin/env bash
# scripts/verify-deploy.sh — Confirm Contabo VPS matches GitHub ${config.githubUser}/${config.repoName}
set -euo pipefail

REPO_DIR="/opt/${config.repoName}"
WEB_ROOT="/var/www/${config.repoName}/dist"
TARGET_URL="https://${config.domain}"

echo "=== 1. Git Commit Parity (${config.branch}) ==="
git -C "$REPO_DIR" fetch origin "${config.branch}" --quiet
LOCAL_SHA=$(git -C "$REPO_DIR" rev-parse HEAD)
REMOTE_SHA=$(git -C "$REPO_DIR" rev-parse "origin/${config.branch}")
echo "VPS HEAD:    $LOCAL_SHA"
echo "GitHub HEAD: $REMOTE_SHA"
[ "$LOCAL_SHA" = "$REMOTE_SHA" ] || { echo "MISMATCH: VPS is behind GitHub!"; exit 1; }

echo "=== 2. Built Website Assets ==="
test -f "$WEB_ROOT/index.html" && echo "Found $WEB_ROOT/index.html"
if grep -qi "hello world" "$WEB_ROOT/index.html"; then
  echo "WARNING: Legacy hello world HTML still present!" && exit 1
fi

echo "=== 3. Nginx, Firewall & Weekly APT Timer ==="
sudo nginx -t
systemctl is-active --quiet nginx && echo "nginx: active"
systemctl is-enabled --quiet homelab-apt-upgrade.timer && echo "weekly-apt-timer: enabled"

echo "=== 4. Live HTTP/TLS Response ==="
curl -fsSLI "$TARGET_URL" | head -n 5`;
}

export function generateSshConfigSnippet(config: HostConfig): string {
  return `# Save in C:\\Users\\<YourWindowsUser>\\.ssh\\config
Host ${config.sshAlias}
  HostName ${config.vpsIp}
  User ${config.vpsUser}
  IdentityFile ~/.ssh/id_ed25519
  ServerAliveInterval 60
  ServerAliveCountMax 3`;
}

export function generateNginxServerBlock(config: HostConfig): string {
  return `# /etc/nginx/sites-available/${config.repoName} (Ubuntu 24.04.5 LTS Noble)
server {
    listen 80;
    listen [::]:80;
    server_name ${config.domain} www.${config.domain};

    root /var/www/${config.repoName}/dist;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Optional reverse proxy if running Express / Node backend on port ${config.appPort}
    location /api/ {
        proxy_pass http://127.0.0.1:${config.appPort};
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}`;
}
