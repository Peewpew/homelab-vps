export type TechCategoryFilter = 'All' | 'Docker' | 'Kubernetes' | 'Git';

export interface TechExample {
  id: string;
  label: string;
  filename: string;
  language: string;
  outcome: string;
  snippet: string;
}

export interface TechStackModule {
  id: Exclude<TechCategoryFilter, 'All'>;
  name: string;
  context: string;
  image: string;
  imageAlt: string;
  summary: string;
  capabilities: string[];
  examples: TechExample[];
}

export const HERO_WORKSPACE_IMAGE = '/src/assets/images/infra_pipeline_deploy_1795529633877.jpg';

export const CV_MOCK_DATA = {
  education: [
    {
      period: '2024 – Present',
      program: 'Cloud Infrastructure & DevOps Engineering (Education Track)',
      institution: 'Technical Academy · Placeholder Institution',
      highlights:
        'Coursework in Linux system administration, containerization with Docker, Kubernetes orchestration, Git collaboration workflows, and automated CI/CD.',
    },
    {
      period: '2022 – 2024',
      program: 'IT Systems & Networking Foundations',
      institution: 'Vocational IT Program · Placeholder School',
      highlights:
        'TCP/IP networking, DNS, HTTP/TLS fundamentals, firewall configuration (UFW), and Bash shell scripting.',
    },
  ],
  experience: [
    {
      period: '2025 – Present',
      role: 'Self-Hosted Linux & Container Lab',
      context: 'Personal VPS Environment',
      summary:
        'Provisioned and secured an Ubuntu 24.04 VPS running Docker Compose services, Nginx reverse proxy rules, automated APT maintenance, and static portfolio delivery.',
    },
    {
      period: '2024 – 2025',
      role: 'Team Coursework & CI/CD Projects',
      context: 'Academic Group Labs',
      summary:
        'Managed shared Git repositories using feature branches and pull requests, packaged web services into multi-stage Docker images, and deployed test workloads onto Kubernetes clusters.',
    },
  ],
  skills: [
    {
      group: 'Containers & Orchestration',
      items: 'Docker · Docker Compose · Kubernetes Deployments & Services · Helm basics',
    },
    {
      group: 'Version Control & CI/CD',
      items: 'Git branching & rebasing · GitHub Actions · Pull request code reviews',
    },
    {
      group: 'Systems & Web Delivery',
      items: 'Ubuntu 24.04 LTS · Nginx reverse proxy · Let’s Encrypt TLS · UFW & SSH keys',
    },
    {
      group: 'Languages & Tooling',
      items: 'Bash · YAML · TypeScript & React · VSCode Remote-SSH',
    },
  ],
};

export const TECH_STACK_MODULES: TechStackModule[] = [
  {
    id: 'Docker',
    name: 'Docker',
    context: 'Containerization · Portable Environments',
    image: '/src/assets/images/stack_docker_containers_1795538084580.jpg',
    imageAlt:
      'Minimalist isometric illustration of stacked matte slate and cobalt-blue shipping containers',
    summary:
      'I use Docker to package applications and their dependencies into lightweight, predictable containers so services run identically on my laptop, in CI, and on a Linux server.',
    capabilities: [
      'Write multi-stage Dockerfiles to keep production images small and fast.',
      'Orchestrate multi-service stacks (app + database + cache) via Docker Compose.',
      'Persist stateful volumes safely across container upgrades and restarts.',
    ],
    examples: [
      {
        id: 'docker-compose',
        label: 'Multi-Service Compose',
        filename: 'docker-compose.yml',
        language: 'yaml',
        outcome:
          'Starts an application alongside PostgreSQL with isolated networking, health checks, and persistent storage in one command.',
        snippet: `services:
  web:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      db:
        condition: service_healthy
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: appdb
      POSTGRES_PASSWORD: \${DB_PASSWORD}
    volumes:
      - pg_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
volumes:
  pg_data:`,
      },
      {
        id: 'dockerfile',
        label: 'Multi-Stage Build',
        filename: 'Dockerfile',
        language: 'dockerfile',
        outcome:
          'Compiles static assets in a Node build stage and ships only Nginx plus the compiled dist/ bundle for a ~25 MB image.',
        snippet: `# Stage 1: Build production bundle
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve static files with Nginx
FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80`,
      },
    ],
  },
  {
    id: 'Kubernetes',
    name: 'Kubernetes',
    context: 'Container Orchestration · Self-Healing Workloads',
    image: '/src/assets/images/stack_kubernetes_cluster_1795538084580.jpg',
    imageAlt:
      'Minimalist visualization of interconnected frosted glass compute cubes linked by cobalt pathways',
    summary:
      'From my coursework I learned how Kubernetes schedules workloads across nodes, automatically replaces failed pods, and rolls out updates without dropping live traffic.',
    capabilities: [
      'Define declarative Deployments with readiness probes and replica counts.',
      'Expose internal pods safely behind ClusterIP or Ingress Services.',
      'Perform zero-downtime rolling updates and instant rollbacks with kubectl.',
    ],
    examples: [
      {
        id: 'k8s-deployment',
        label: 'Deployment & Probes',
        filename: 'deployment.yaml',
        language: 'yaml',
        outcome:
          'Maintains 3 healthy replicas and verifies /healthz before routing traffic to newly rolled-out pods.',
        snippet: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: portfolio-web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: portfolio-web
  template:
    metadata:
      labels:
        app: portfolio-web
    spec:
      containers:
        - name: web
          image: ghcr.io/peewpeew/portfolio:1.2.0
          ports:
            - containerPort: 80
          readinessProbe:
            httpGet:
              path: /
              port: 80
            initialDelaySeconds: 3`,
      },
      {
        id: 'k8s-service',
        label: 'Service & Rollout CLI',
        filename: 'kubectl-rollout.sh',
        language: 'bash',
        outcome:
          'Applies declarative manifests, watches the rolling update complete, and rolls back safely if a new release fails.',
        snippet: `# Apply deployment and service definitions
kubectl apply -f k8s/deployment.yaml -f k8s/service.yaml

# Watch pods roll out cleanly without downtime
kubectl rollout status deployment/portfolio-web

# Inspect running pods and revert immediately if needed
kubectl get pods -l app=portfolio-web
kubectl rollout undo deployment/portfolio-web`,
      },
    ],
  },
  {
    id: 'Git',
    name: 'Git',
    context: 'Version Control · Clean Collaboration',
    image: '/src/assets/images/stack_git_branching_1795538085041.jpg',
    imageAlt:
      'Minimalist sculpture of dark slate and cobalt tracks branching out and merging into one main line',
    summary:
      'I rely on Git every day to keep project history readable, isolate features on short-lived branches, and pair commits with automated GitHub Actions checks.',
    capabilities: [
      'Isolate work cleanly on feature/* branches before merging into main.',
      'Keep secrets and build artifacts out of history with disciplined .gitignore rules.',
      'Automate build and lint checks on every push using GitHub Actions workflows.',
    ],
    examples: [
      {
        id: 'git-workflow',
        label: 'Branch & PR Flow',
        filename: 'git-workflow.sh',
        language: 'bash',
        outcome:
          'Keeps main always deployable while isolating new features for review and automated CI validation.',
        snippet: `# Create a clean feature branch from up-to-date main
git checkout main
git pull origin main
git checkout -b feat/add-cv-viewer

# Stage intentional changes and verify diff before committing
git status
git add src/components/CvPage.tsx
git commit -m "feat: add interactive CV PDF preview"
git push -u origin feat/add-cv-viewer`,
      },
      {
        id: 'git-ci',
        label: 'GitHub Actions Check',
        filename: '.github/workflows/ci.yml',
        language: 'yaml',
        outcome:
          'Automatically verifies TypeScript types and builds the production bundle on every pull request.',
        snippet: `name: Verify Build
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
      - run: npm ci
      - run: npm run lint && npm run build`,
      },
    ],
  },
];

export function filterTechStackModules(filter: TechCategoryFilter): TechStackModule[] {
  if (filter === 'All') return TECH_STACK_MODULES;
  return TECH_STACK_MODULES.filter((item) => item.id === filter);
}
