import { useState } from 'react';
import {
  TechCategoryFilter,
  TechStackModule,
  filterTechStackModules,
} from '../data/techStackContent';
import { CodeBlock } from './CodeBlock';
import { ResilientImage } from './ResilientImage';

const FILTER_OPTIONS: TechCategoryFilter[] = ['All', 'Docker', 'Kubernetes', 'Git'];

function TechStackCard({ module }: { module: TechStackModule }) {
  const [activeExampleId, setActiveExampleId] = useState(module.examples[0].id);

  const activeExample =
    module.examples.find((ex) => ex.id === activeExampleId) ?? module.examples[0];

  return (
    <article className="bg-white border border-zinc-200 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
      {/* Visualizing Picture */}
      <div className="lg:col-span-5 bg-zinc-100/70 border-b lg:border-b-0 lg:border-r border-zinc-200 p-6 flex flex-col justify-start gap-4">
        <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-white">
          <ResilientImage
            src={module.image}
            alt={module.imageAlt}
            fallbackTitle={`${module.name} Architecture`}
            className="w-full h-full object-cover"
          />
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed">{module.imageAlt}</p>
      </div>

      {/* Explanation & Interactive Example */}
      <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-blue-600">{module.context}</p>
            <h2 className="font-display text-2xl font-bold tracking-tight text-zinc-950">
              {module.name}
            </h2>
          </div>

          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">{module.summary}</p>

          <ul className="space-y-1.5 text-sm text-zinc-700 list-disc pl-5">
            {module.capabilities.map((cap) => (
              <li key={cap}>{cap}</li>
            ))}
          </ul>
        </div>

        {/* Small Practical Examples */}
        <div className="pt-5 border-t border-zinc-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-semibold text-zinc-900">What it can do</span>
            <div
              role="tablist"
              aria-label={`${module.name} practical examples`}
              className="inline-flex items-center gap-1 p-1 bg-zinc-100 rounded-lg border border-zinc-200 self-start sm:self-auto"
            >
              {module.examples.map((ex) => {
                const selected = ex.id === activeExample.id;
                return (
                  <button
                    key={ex.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setActiveExampleId(ex.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      selected
                        ? 'bg-white text-zinc-950 shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-950'
                    }`}
                  >
                    {ex.label}
                  </button>
                );
              })}
            </div>
          </div>

          <CodeBlock
            filename={activeExample.filename}
            language={activeExample.language}
            code={activeExample.snippet}
          />

          <p className="text-xs text-zinc-600 leading-relaxed">
            <span className="font-semibold text-zinc-900">Result:</span> {activeExample.outcome}
          </p>
        </div>
      </div>
    </article>
  );
}

export function TechStackPage() {
  const [filter, setFilter] = useState<TechCategoryFilter>('All');
  const modules = filterTechStackModules(filter);

  return (
    <section className="py-12 lg:py-16 bg-zinc-50 min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-10">
        {/* Header & Filter */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-medium text-blue-600">Education &amp; Practical Tooling</p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 [text-wrap:balance]">
              Tech stack learned &amp; what I can build with it
            </h1>
            <p className="text-sm sm:text-base text-zinc-600">
              Core tools from my coursework and self-hosted lab projects — illustrated visually with
              small, real-world examples of how I use each one.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Filter tech stack showcase"
            className="inline-flex items-center gap-1 p-1 bg-zinc-200/70 rounded-lg self-start md:self-auto shrink-0"
          >
            {FILTER_OPTIONS.map((option) => {
              const isSelected = filter === option;
              return (
                <button
                  key={option}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setFilter(option)}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-white text-zinc-950 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stack Modules */}
        <div className="space-y-8">
          {modules.map((module) => (
            <TechStackCard key={module.id} module={module} />
          ))}
        </div>
      </div>
    </section>
  );
}
