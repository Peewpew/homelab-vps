import { HostConfig, generateNginxServerBlock, generateGitHubActionsWorkflow, generateSshConfigSnippet } from '../utils/devopsGenerators';

export type ProjectCategory = 'All' | 'Infrastructure' | 'CI/CD' | 'Security';

export interface CaseStudy {
  id: string;
  index: string;
  title: string;
  category: Exclude<ProjectCategory, 'All'>;
  environment: string;
  summary: string;
  outcome: string;
  image?: string;
  imageAlt?: string;
  architectureNotes: string[];
  configFilename: string;
  configLanguage: string;
  getConfigSnippet: (config: HostConfig) => string;
}

export interface RunbookStep {
  id: string;
  stepNumber: string;
  title: string;
  context: string;
  explanation: string;
  commandLabel: string;
  getCommand: (config: HostConfig) => string;
}

export interface PipelineStage {
  id: string;
  name: string;
  getCommand: (config: HostConfig) => string;
  durationMs: number;
  logOutput: (config: HostConfig) => string[];
}

export const HERO_IMAGE = '/src/assets/images/hero_server_architecture_1795529633307.jpg';

export const INFRA_KPI_STRIP = [
  {
    label: 'Target Host OS',
    value: 'Ubuntu 24.04.5 LTS',
    detail: 'Contabo VPS · Noble Numbat',
  },
  {
    label: 'Edge & TLS Layer',
    value: 'Nginx + Certbot',
    detail: 'HTTP/2 · Automated renewal',
  },
  {
    label: 'Local IDE Bridge',
    value: 'VSCode Remote-SSH',
    detail: 'PowerShell · Ed25519 key auth',
  },
  {
    label: 'Delivery Pipeline',
    value: 'GitHub Actions',
    detail: 'Lint · Build · Rsync deploy',
  },
];

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'ubuntu-hardening',
    index: '01',
    title: 'Ubuntu 24.04.5 LTS Host Hardening & UFW Baseline',
    category: 'Security',
    environment: 'Contabo VPS · Ubuntu Noble',
    summary:
      'Replaced default root password login with Ed25519 key authentication, strict UFW ingress rules, and Fail2ban SSH jail policies.',
    outcome: 'Zero password-auth exposure across SSH, HTTP, and HTTPS ports',
    image: '/src/assets/images/infra_ubuntu_hardening_1795529633167.jpg',
    imageAlt: 'Machined aluminum server heatsink and braided network cables on concrete surface',
    architectureNotes: [
      'Disable SSH password authentication and root login in /etc/ssh/sshd_config.d/99-hardening.conf.',
      'Permit only OpenSSH, Nginx Full (80/443), and deny all other unsolicited inbound traffic via UFW.',
      'Enable unattended-upgrades for automatic security patches on Ubuntu 24.04 Noble.',
    ],
    configFilename: '/etc/ssh/sshd_config.d/99-hardening.conf',
    configLanguage: 'conf',
    getConfigSnippet: (config) => `# Ubuntu 24.04.5 LTS (Noble) SSH Hardening
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AllowUsers ${config.vpsUser}
MaxAuthTries 3
ClientAliveInterval 300`,
  },
  {
    id: 'nginx-certbot',
    index: '02',
    title: 'Zero-Downtime Nginx Reverse Proxy & SPA Delivery',
    category: 'Infrastructure',
    environment: 'Nginx 1.24 · Let’s Encrypt TLS',
    summary:
      'Replaced the single static hello-world HTML page with a gzipped Nginx server block supporting SPA routing and upstream API proxying.',
    outcome: 'Sub-25ms cached static asset delivery with atomic nginx -t reloads',
    image: '/src/assets/images/infra_pipeline_deploy_1795529633877.jpg',
    imageAlt: 'Developer desk running VSCode and terminal deployment logs beside a bright window',
    architectureNotes: [
      'Separate static frontend bundle (/var/www/<repo>/dist) from upstream Node/Express services.',
      'Validate every configuration change with sudo nginx -t before reloading worker processes.',
      'Provision automated TLS certificates via certbot --nginx for zero-cost HTTPS renewal.',
    ],
    configFilename: '/etc/nginx/sites-available/portfolio.conf',
    configLanguage: 'nginx',
    getConfigSnippet: (config) => generateNginxServerBlock(config),
  },
  {
    id: 'github-cicd',
    index: '03',
    title: 'Automated GitHub Actions Build & SSH Rsync Pipeline',
    category: 'CI/CD',
    environment: 'GitHub Actions · Rsync over SSH',
    summary:
      'Eliminated manual FTP uploads by compiling TypeScript, verifying Vite production bundles, and syncing artifacts directly to Contabo.',
    outcome: 'Deterministic 45-second push-to-production deployment workflow',
    architectureNotes: [
      'Run npm ci and tsc --noEmit on ubuntu-latest before touching the live Contabo server.',
      'Store private SSH deployment key safely inside GitHub Repository Secrets (CONTABO_SSH_KEY).',
      'Use rsync --delete so stale assets and legacy files never linger on disk.',
    ],
    configFilename: '.github/workflows/deploy.yml',
    configLanguage: 'yaml',
    getConfigSnippet: (config) => generateGitHubActionsWorkflow(config),
  },
  {
    id: 'vscode-remote',
    index: '04',
    title: 'Windows PowerShell to VSCode Remote-SSH Workflow',
    category: 'Infrastructure',
    environment: 'Windows PowerShell · VSCode',
    summary:
      'Unified local Windows editing with live Ubuntu 24.04 filesystem access, integrated bash terminals, and port forwarding inside VSCode.',
    outcome: 'Single-command remote workspace launch directly from PowerShell',
    architectureNotes: [
      'Generate an Ed25519 SSH keypair in Windows PowerShell and append it to ~/.ssh/authorized_keys.',
      'Define a clean Host alias in ~/.ssh/config so VSCode Remote-SSH connects in one click.',
      'Forward remote dev port 3000 securely over SSH without exposing Node dev servers publicly.',
    ],
    configFilename: '~/.ssh/config (Windows)',
    configLanguage: 'sshconfig',
    getConfigSnippet: (config) => generateSshConfigSnippet(config),
  },
];

export const RUNBOOK_STEPS: RunbookStep[] = [
  {
    id: 'step-keygen',
    stepNumber: '01',
    title: 'Generate Ed25519 SSH Key & Copy to Contabo (PowerShell)',
    context: 'Windows PowerShell · Local Machine',
    explanation:
      'Windows PowerShell does not include ssh-copy-id by default. Generate an Ed25519 key and pipe the public key directly into your Contabo Ubuntu 24.04 authorized_keys file.',
    commandLabel: 'Windows PowerShell',
    getCommand: (config) =>
      `ssh-keygen -t ed25519 -C "${config.sshAlias}"
Get-Content $env:USERPROFILE\\.ssh\\id_ed25519.pub | ssh ${config.vpsUser}@${config.vpsIp} "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"`,
  },
  {
    id: 'step-vscode-config',
    stepNumber: '02',
    title: 'Configure VSCode Remote-SSH Host Alias',
    context: 'VSCode · Remote - SSH Extension',
    explanation:
      'Add this Host entry to C:\\Users\\<You>\\.ssh\\config, then open the project directory directly on your Contabo VPS or locally from PowerShell.',
    commandLabel: 'PowerShell + VSCode CLI',
    getCommand: (config) =>
      `${generateSshConfigSnippet(config)}

# Launch VSCode connected directly to Contabo Ubuntu 24.04:
code --remote ssh-remote+${config.sshAlias} /var/www/${config.repoName}`,
  },
  {
    id: 'step-ubuntu-bootstrap',
    stepNumber: '03',
    title: 'Bootstrap Ubuntu 24.04.5 LTS, Weekly APT Timer & Repo Sync',
    context: 'Contabo VPS · Ubuntu 24.04 Noble',
    explanation:
      'Install Nginx, UFW, and Node.js 22 LTS, clone your cleaned GitHub repo into /opt/<repo>, and enable the weekly Sunday 03:00 UTC APT maintenance timer.',
    commandLabel: 'Ubuntu 24.04 Bash (via VSCode Terminal)',
    getCommand: (config) =>
      `sudo apt update && sudo apt install -y nginx ufw certbot python3-certbot-nginx git
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

sudo ufw allow OpenSSH && sudo ufw allow "Nginx Full" && sudo ufw --force enable
sudo mkdir -p /var/www/${config.repoName}/dist /opt/${config.repoName}
sudo chown -R ${config.vpsUser}:${config.vpsUser} /var/www/${config.repoName} /opt/${config.repoName}

git clone https://github.com/${config.githubUser}/${config.repoName}.git /opt/${config.repoName}
sudo cp /opt/${config.repoName}/scripts/weekly-apt-upgrade.sh /usr/local/sbin/weekly-apt-upgrade.sh
sudo chmod 750 /usr/local/sbin/weekly-apt-upgrade.sh
sudo systemctl enable --now homelab-apt-upgrade.timer`,
  },
  {
    id: 'step-nginx-enable',
    stepNumber: '04',
    title: 'Enable Nginx, Issue TLS & Verify VPS Matches GitHub',
    context: 'Edge Routing & Parity Check',
    explanation:
      'Activate the Nginx site block, issue a Let’s Encrypt TLS certificate, and run scripts/verify-deploy.sh to prove your Contabo VPS HEAD matches GitHub and no hello-world HTML remains.',
    commandLabel: 'Ubuntu 24.04 Bash',
    getCommand: (config) =>
      `sudo ln -sf /etc/nginx/sites-available/${config.repoName} /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d ${config.domain}

bash /opt/${config.repoName}/scripts/verify-deploy.sh`,
  },
];

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 'lint-build',
    name: 'Typecheck & Production Build',
    getCommand: () => 'npm ci && npm run lint && npm run build',
    durationMs: 700,
    logOutput: (config) => [
      `Checked out ${config.githubUser}/${config.repoName}@${config.branch}`,
      'tsc --noEmit passed with 0 errors',
      'vite build bundled dist/index.html + assets (142.8 kB gzip)',
    ],
  },
  {
    id: 'rsync-deploy',
    name: 'Rsync Artifacts to Contabo',
    getCommand: (config) =>
      `rsync -avzr --delete dist/ ${config.vpsUser}@${config.vpsIp}:/var/www/${config.repoName}/dist`,
    durationMs: 700,
    logOutput: (config) => [
      `Connected to ${config.vpsUser}@${config.vpsIp} via Ed25519 key`,
      'Removed legacy hello-world-test.html and stale assets',
      `Synced production bundle to /var/www/${config.repoName}/dist`,
    ],
  },
  {
    id: 'nginx-reload',
    name: 'Nginx Config Test & Reload',
    getCommand: () => 'sudo nginx -t && sudo systemctl reload nginx',
    durationMs: 650,
    logOutput: (config) => [
      `nginx: configuration file /etc/nginx/sites-enabled/${config.repoName} syntax is ok`,
      'nginx: test is successful',
      'Reloaded nginx.service without dropping active connections',
    ],
  },
  {
    id: 'healthcheck',
    name: 'HTTPS Endpoint Verification',
    getCommand: (config) => `curl -fsSLI https://${config.domain}`,
    durationMs: 600,
    logOutput: (config) => [
      `GET https://${config.domain}/ -> HTTP/2 200 OK`,
      'TLSv1.3 handshake verified · NobleOps portfolio live',
    ],
  },
];
