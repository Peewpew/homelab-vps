import { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Terminal } from 'lucide-react';
import { HostConfig } from '../utils/devopsGenerators';
import { RUNBOOK_STEPS } from '../data/portfolioContent';
import { CodeBlock } from './CodeBlock';

interface VpsRunbookSectionProps {
  config: HostConfig;
}

const STORAGE_KEY = 'nobleops_completed_steps_v1';

export function VpsRunbookSection({ config }: VpsRunbookSectionProps) {
  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(completedIds));
    } catch {
      // Ignore storage quota errors in restricted environments
    }
  }, [completedIds]);

  const toggleStep = (stepId: string) => {
    setCompletedIds((prev) =>
      prev.includes(stepId) ? prev.filter((id) => id !== stepId) : [...prev, stepId]
    );
  };

  const completedCount = completedIds.length;
  const totalCount = RUNBOOK_STEPS.length;

  return (
    <section id="runbook" className="py-16 lg:py-20 border-b border-zinc-200 bg-zinc-50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-medium text-blue-600">VSCode &amp; Contabo Setup</p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-zinc-950 [text-wrap:balance]">
              Run from VSCode on Windows to Ubuntu 24.04.5 LTS
            </h2>
            <p className="text-sm sm:text-base text-zinc-600">
              Tailored commands for Windows PowerShell, VSCode Remote-SSH, and Contabo Noble Numbat
              to replace your hello-world HTML page with this live build.
            </p>
          </div>

          <div className="flex items-center gap-3 px-4 py-2.5 bg-white border border-zinc-200 rounded-xl shrink-0">
            <Terminal className="w-4 h-4 text-zinc-500" />
            <span className="text-xs font-medium text-zinc-700">Progress:</span>
            <span className="font-mono text-xs font-semibold text-zinc-950">
              {completedCount} of {totalCount} steps completed
            </span>
          </div>
        </div>

        <div className="space-y-6">
          {RUNBOOK_STEPS.map((step) => {
            const isDone = completedIds.includes(step.id);
            return (
              <div
                key={step.id}
                className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
              >
                <div className="lg:col-span-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span className="font-mono font-semibold text-zinc-900">
                      Step {step.stepNumber}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{step.context}</span>
                  </div>

                  <h3 className="font-display text-xl font-semibold tracking-tight text-zinc-950">
                    {step.title}
                  </h3>

                  <p className="text-sm text-zinc-600 leading-relaxed">{step.explanation}</p>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => toggleStep(step.id)}
                      aria-pressed={isDone}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                        isDone
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      {isDone ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Completed</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-4 h-4 text-zinc-400" />
                          <span>Mark Step Complete</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-7">
                  <CodeBlock
                    filename={step.commandLabel}
                    language="shell"
                    code={step.getCommand(config)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
