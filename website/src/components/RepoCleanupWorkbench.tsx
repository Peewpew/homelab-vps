import { useState } from 'react';
import { FolderGit2, RotateCcw, Trash2, CheckSquare, Square } from 'lucide-react';
import {
  HostConfig,
  INITIAL_REPO_ITEMS,
  RepoCleanupItem,
  calculateCleanRepoStats,
  generateGitHubActionsWorkflow,
  generateGitignoreContent,
  generatePowerShellCleanupScript,
  generateSystemdAptTimer,
  generateVerifyDeployScript,
  generateWeeklyAptScript,
} from '../utils/devopsGenerators';
import { CodeBlock } from './CodeBlock';

interface RepoCleanupWorkbenchProps {
  config: HostConfig;
}

type ScriptTab =
  | 'powershell'
  | 'apt-script'
  | 'apt-timer'
  | 'verify-deploy'
  | 'workflow'
  | 'gitignore';

const CATEGORY_LABELS: Record<RepoCleanupItem['category'], string> = {
  'placeholder-stub': 'ChatGPT placeholder stub',
  'stale-branch': 'Branch drift & stale branches',
  'empty-file': '0-byte empty file',
  keep: 'Keep & build out',
};

export function RepoCleanupWorkbench({ config }: RepoCleanupWorkbenchProps) {
  const [items, setItems] = useState<RepoCleanupItem[]>(INITIAL_REPO_ITEMS);
  const [activeTab, setActiveTab] = useState<ScriptTab>('powershell');

  const stats = calculateCleanRepoStats(items);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selectedForRemoval: !item.selectedForRemoval } : item
      )
    );
  };

  const resetDefaults = () => {
    setItems(INITIAL_REPO_ITEMS);
  };

  const keptItems = items.filter((item) => !item.selectedForRemoval);

  const tabMeta: Record<ScriptTab, { label: string; filename: string; language: string; code: string }> = {
    powershell: {
      label: 'Cleanup PS1',
      filename: 'cleanup-homelab-vps.ps1',
      language: 'powershell',
      code: generatePowerShellCleanupScript(config, items),
    },
    'apt-script': {
      label: 'Weekly APT',
      filename: 'scripts/weekly-apt-upgrade.sh',
      language: 'bash',
      code: generateWeeklyAptScript(config),
    },
    'apt-timer': {
      label: 'APT Timer',
      filename: 'infra/homelab-apt-upgrade.timer',
      language: 'ini',
      code: generateSystemdAptTimer(config),
    },
    'verify-deploy': {
      label: 'Verify VPS',
      filename: 'scripts/verify-deploy.sh',
      language: 'bash',
      code: generateVerifyDeployScript(config),
    },
    workflow: {
      label: 'Actions CI',
      filename: '.github/workflows/ci.yml',
      language: 'yaml',
      code: generateGitHubActionsWorkflow(config),
    },
    gitignore: {
      label: '.gitignore',
      filename: '.gitignore',
      language: 'gitignore',
      code: generateGitignoreContent(),
    },
  };

  const activeSnippet = tabMeta[activeTab];

  return (
    <section id="cleanup" className="py-16 lg:py-20 border-b border-zinc-200 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-medium text-blue-600">GitHub Repository Audit &amp; Scripts</p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-zinc-950 [text-wrap:balance]">
              Clean {config.githubUser}/{config.repoName} and add real VPS automation
            </h2>
            <p className="text-sm sm:text-base text-zinc-600">
              Audited against your live repository: reconcile{' '}
              <span className="font-mono text-zinc-900">develop</span> into{' '}
              <span className="font-mono text-zinc-900">{config.branch}</span>, clear 0-byte
              ChatGPT stubs, and drop in weekly APT upgrades plus VPS deploy verification.
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm border border-zinc-200 rounded-xl px-5 py-3 bg-zinc-50 shrink-0">
            <div>
              <p className="text-xs text-zinc-500">Marked for cleanup</p>
              <p className="font-mono font-semibold text-zinc-950">{stats.removedCount} items</p>
            </div>
            <div className="h-8 w-px bg-zinc-200" aria-hidden="true" />
            <div>
              <p className="text-xs text-zinc-500">Clean repo modules</p>
              <p className="font-mono font-semibold text-zinc-950">{stats.keptCount} kept</p>
            </div>
            <div className="h-8 w-px bg-zinc-200" aria-hidden="true" />
            <div>
              <p className="text-xs text-zinc-500">Target branch</p>
              <p className="font-mono font-semibold text-blue-600">{config.branch}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Interactive File Audit List & Clean Tree Preview */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-zinc-200 rounded-2xl bg-zinc-50 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 bg-white">
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
                  <FolderGit2 className="w-4 h-4 text-zinc-500" />
                  <span>{config.githubUser}/{config.repoName} Audit</span>
                </div>
                <button
                  type="button"
                  onClick={resetDefaults}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-950 whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Audit</span>
                </button>
              </div>

              <ul className="divide-y divide-zinc-200">
                {items.map((item) => {
                  const marked = item.selectedForRemoval;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => toggleItem(item.id)}
                        aria-pressed={marked}
                        className="w-full text-left px-5 py-3.5 flex items-start gap-3 hover:bg-white transition-colors focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-blue-600"
                      >
                        <span className="mt-0.5 text-zinc-700 shrink-0">
                          {marked ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-zinc-400" />
                          )}
                        </span>
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`font-mono text-xs font-medium truncate ${
                                marked ? 'line-through text-zinc-400' : 'text-zinc-950'
                              }`}
                            >
                              {item.path}
                            </span>
                            <span className="text-xs text-zinc-500 whitespace-nowrap shrink-0">
                              {marked ? 'Clean' : 'Keep'}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500">
                            {CATEGORY_LABELS[item.category]} · {item.reason}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Resulting Clean Directory Tree */}
            <div className="border border-zinc-200 rounded-2xl p-5 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-950">
                  Target Clean Repository Structure
                </h3>
                <span className="text-xs font-mono text-zinc-500">
                  {keptItems.length + 2} entries
                </span>
              </div>
              {keptItems.length === 0 ? (
                <div className="py-4 text-xs text-zinc-500 flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-zinc-400" />
                  <span>All items are marked for cleanup. Uncheck core modules to keep them.</span>
                </div>
              ) : (
                <ul className="space-y-1.5 font-mono text-xs text-zinc-700">
                  <li>{config.repoName}/</li>
                  <li className="pl-4 text-blue-600">├── .github/workflows/ci.yml</li>
                  <li className="pl-4 text-blue-600">├── infra/homelab-apt-upgrade.timer</li>
                  {keptItems.map((entry, idx) => (
                    <li key={entry.id} className="pl-4">
                      {idx === keptItems.length - 1 ? '└── ' : '├── '}
                      {entry.path}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Right: Generated PowerShell Cleanup, APT Automation, Verify Script, Actions, .gitignore */}
          <div className="lg:col-span-7 space-y-4">
            <div
              role="tablist"
              aria-label="Generated repository files and automation scripts"
              className="flex flex-wrap items-center gap-1 p-1 bg-zinc-100 rounded-lg border border-zinc-200"
            >
              {(Object.keys(tabMeta) as ScriptTab[]).map((tabKey) => {
                const isSelected = activeTab === tabKey;
                return (
                  <button
                    key={tabKey}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setActiveTab(tabKey)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-white text-zinc-950 shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-950'
                    }`}
                  >
                    {tabMeta[tabKey].label}
                  </button>
                );
              })}
            </div>

            <CodeBlock
              filename={activeSnippet.filename}
              language={activeSnippet.language}
              code={activeSnippet.code}
            />

            <p className="text-xs text-zinc-500 leading-relaxed">
              Safety guarantee: <span className="font-mono text-zinc-700">backup/pre-cleanup</span>{' '}
              preserves the exact state of <span className="font-mono text-zinc-700">develop</span>{' '}
              before deleting empty workflow stubs and merging cleanly into{' '}
              <span className="font-mono text-zinc-700">{config.branch}</span>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
