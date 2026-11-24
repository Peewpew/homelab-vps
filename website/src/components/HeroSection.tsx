import { ArrowRight } from 'lucide-react';
import { HostConfig } from '../utils/devopsGenerators';
import { HERO_IMAGE, INFRA_KPI_STRIP } from '../data/portfolioContent';
import { ResilientImage } from './ResilientImage';

interface HeroSectionProps {
  config: HostConfig;
  onOpenHostModal: () => void;
}

export function HeroSection({ config, onOpenHostModal }: HeroSectionProps) {
  return (
    <section id="top" className="border-b border-zinc-200 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Left Typographic Column */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-8">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-zinc-500">
                <span>{config.engineerName}</span>
                <span aria-hidden="true">·</span>
                <span>{config.roleTitle}</span>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={onOpenHostModal}
                  className="font-mono text-blue-600 hover:text-blue-700 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded-sm"
                >
                  {config.domain} ({config.vpsIp})
                </button>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-zinc-950 leading-[1.08] [text-wrap:balance]">
                From bare-metal Ubuntu 24.04 to automated delivery.
              </h1>

              <p className="text-base text-zinc-600 leading-relaxed max-w-xl">
                A production DevOps portfolio and interactive operations workbench built to replace
                static placeholder HTML on a Contabo VPS. Structured for clean GitHub history,
                VSCode Remote-SSH workflows, and repeatable Nginx deployments.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#runbook"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <span>Open Contabo Runbook</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#cleanup"
                className="inline-flex items-center px-5 py-3 text-sm font-medium text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg border border-zinc-200 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Clean GitHub Repo
              </a>
            </div>
          </div>

          {/* Right Media Column */}
          <div className="lg:col-span-6">
            <div className="h-full min-h-[280px] sm:min-h-[340px] rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100">
              <ResilientImage
                src={HERO_IMAGE}
                alt="European colocation data center aisle with dark aluminum server racks and cobalt fiber cabling"
                fallbackTitle="Contabo Ubuntu 24.04.5 LTS Infrastructure"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column KPI / Stack Strip Below Hero Split */}
        <div className="mt-12 pt-8 border-t border-zinc-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {INFRA_KPI_STRIP.map((item) => (
            <div key={item.label} className="space-y-1">
              <p className="text-xs font-medium text-zinc-500">{item.label}</p>
              <p className="font-display text-lg font-semibold text-zinc-950 tracking-tight">
                {item.value}
              </p>
              <p className="text-xs text-zinc-600">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
