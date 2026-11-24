import { useEffect } from 'react';
import { X } from 'lucide-react';
import { CaseStudy } from '../data/portfolioContent';
import { HostConfig } from '../utils/devopsGenerators';
import { CodeBlock } from './CodeBlock';

interface CaseStudyModalProps {
  study: CaseStudy | null;
  config: HostConfig;
  onClose: () => void;
}

export function CaseStudyModal({ study, config, onClose }: CaseStudyModalProps) {
  useEffect(() => {
    if (!study) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [study, onClose]);

  if (!study) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-study-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white border border-zinc-200 rounded-2xl shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-6 border-b border-zinc-200">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="font-mono font-medium text-zinc-700">{study.index}</span>
              <span aria-hidden="true">·</span>
              <span>{study.category}</span>
              <span aria-hidden="true">·</span>
              <span>{study.environment}</span>
            </div>
            <h3
              id="case-study-modal-title"
              className="font-display text-2xl font-bold tracking-tight text-zinc-950"
            >
              {study.title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close configuration inspector"
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-zinc-200 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">{study.summary}</p>

          <div className="space-y-2.5">
            <h4 className="text-sm font-semibold text-zinc-950">Architecture Decisions</h4>
            <ul className="space-y-2 text-sm text-zinc-600 list-disc pl-5">
              {study.architectureNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-sm font-semibold text-zinc-950">
              Live Configuration ({config.domain})
            </h4>
            <CodeBlock
              filename={study.configFilename}
              language={study.configLanguage}
              code={study.getConfigSnippet(config)}
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between gap-4">
          <span className="text-xs text-zinc-500">Outcome: {study.outcome}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
