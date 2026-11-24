import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { CASE_STUDIES, CaseStudy, ProjectCategory } from '../data/portfolioContent';
import { ResilientImage } from './ResilientImage';

interface ProjectsSectionProps {
  onSelectCaseStudy: (study: CaseStudy) => void;
}

const CATEGORIES: ProjectCategory[] = ['All', 'Infrastructure', 'CI/CD', 'Security'];

export function ProjectsSection({ onSelectCaseStudy }: ProjectsSectionProps) {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>('All');

  const filtered =
    activeCategory === 'All'
      ? CASE_STUDIES
      : CASE_STUDIES.filter((item) => item.category === activeCategory);

  return (
    <section id="projects" className="py-16 lg:py-20 border-b border-zinc-200 bg-zinc-50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-medium text-blue-600">Infrastructure Case Studies</p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-zinc-950 [text-wrap:balance]">
              Production systems engineered on Ubuntu 24.04
            </h2>
            <p className="text-sm sm:text-base text-zinc-600">
              Select any architecture card to inspect the underlying SSH hardening, Nginx routing,
              and GitHub Actions configuration.
            </p>
          </div>

          {/* Interactive Category Segmented Control */}
          <div
            role="tablist"
            aria-label="Filter case studies by domain"
            className="inline-flex items-center gap-1 p-1 bg-zinc-200/70 rounded-lg self-start sm:self-auto"
          >
            {CATEGORIES.map((category) => {
              const isSelected = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveCategory(category)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                    isSelected
                      ? 'bg-white text-zinc-950 shadow-sm'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((study) => (
            <article
              key={study.id}
              className="flex flex-col justify-between bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:border-zinc-300 transition-colors"
            >
              <div>
                {study.image && (
                  <div className="aspect-[16/9] w-full bg-zinc-100 border-b border-zinc-200 overflow-hidden">
                    <ResilientImage
                      src={study.image}
                      alt={study.imageAlt ?? study.title}
                      fallbackTitle={study.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span className="font-mono font-medium text-zinc-700">{study.index}</span>
                    <span aria-hidden="true">·</span>
                    <span>{study.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{study.environment}</span>
                  </div>

                  <h3 className="font-display text-xl font-semibold tracking-tight text-zinc-950">
                    {study.title}
                  </h3>

                  <p className="text-sm text-zinc-600 leading-relaxed">{study.summary}</p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-4 border-t border-zinc-100 flex items-center justify-between gap-4">
                <span className="text-xs font-medium text-zinc-700 truncate">
                  {study.outcome}
                </span>

                <button
                  type="button"
                  onClick={() => onSelectCaseStudy(study)}
                  aria-label={`Inspect configuration for ${study.title}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-950 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  <span>Inspect Config</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
