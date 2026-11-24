/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { CaseStudy } from './data/portfolioContent';
import { DEFAULT_HOST_CONFIG, HostConfig } from './utils/devopsGenerators';
import { TopBar } from './components/TopBar';
import { HeroSection } from './components/HeroSection';
import { ProjectsSection } from './components/ProjectsSection';
import { RepoCleanupWorkbench } from './components/RepoCleanupWorkbench';
import { VpsRunbookSection } from './components/VpsRunbookSection';
import { PipelineSimulator } from './components/PipelineSimulator';
import { HostConfigModal } from './components/HostConfigModal';
import { CaseStudyModal } from './components/CaseStudyModal';

const HOST_STORAGE_KEY = 'nobleops_host_config_v1';

export default function App() {
  const [hostConfig, setHostConfig] = useState<HostConfig>(() => {
    try {
      const saved = window.localStorage.getItem(HOST_STORAGE_KEY);
      return saved ? { ...DEFAULT_HOST_CONFIG, ...(JSON.parse(saved) as Partial<HostConfig>) } : DEFAULT_HOST_CONFIG;
    } catch {
      return DEFAULT_HOST_CONFIG;
    }
  });

  const [isHostModalOpen, setIsHostModalOpen] = useState(false);
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudy | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(HOST_STORAGE_KEY, JSON.stringify(hostConfig));
    } catch {
      // Ignore storage failures
    }
  }, [hostConfig]);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-950">
      <TopBar onOpenHostModal={() => setIsHostModalOpen(true)} />

      <main className="flex-1">
        <HeroSection
          config={hostConfig}
          onOpenHostModal={() => setIsHostModalOpen(true)}
        />
        <ProjectsSection onSelectCaseStudy={(study) => setSelectedCaseStudy(study)} />
        <RepoCleanupWorkbench config={hostConfig} />
        <VpsRunbookSection config={hostConfig} />
        <PipelineSimulator config={hostConfig} />
      </main>

      <footer className="border-t border-zinc-200 bg-zinc-50 py-10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-zinc-800">{hostConfig.engineerName}</span>
            <span aria-hidden="true">·</span>
            <span>Contabo Ubuntu 24.04.5 LTS (Noble)</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{hostConfig.domain}</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#projects" className="hover:text-zinc-900">
              Projects
            </a>
            <a href="#cleanup" className="hover:text-zinc-900">
              Repo Cleanup
            </a>
            <a href="#runbook" className="hover:text-zinc-900">
              VSCode &amp; VPS
            </a>
            <a href="#pipeline" className="hover:text-zinc-900">
              Pipeline
            </a>
          </div>
        </div>
      </footer>

      <HostConfigModal
        isOpen={isHostModalOpen}
        config={hostConfig}
        onSave={(next) => setHostConfig(next)}
        onClose={() => setIsHostModalOpen(false)}
      />

      <CaseStudyModal
        study={selectedCaseStudy}
        config={hostConfig}
        onClose={() => setSelectedCaseStudy(null)}
      />
    </div>
  );
}
