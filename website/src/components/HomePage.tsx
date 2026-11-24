import { ArrowRight, ExternalLink, FileText, Layers } from 'lucide-react';
import { CvProfileState } from '../utils/cvProfile';
import { HERO_WORKSPACE_IMAGE } from '../data/techStackContent';
import { PortfolioPage } from './TopBar';
import { ResilientImage } from './ResilientImage';

interface HomePageProps {
  profile: CvProfileState;
  onNavigate: (page: PortfolioPage) => void;
}

export function HomePage({ profile, onNavigate }: HomePageProps) {
  return (
    <div>
      {/* Hero Introduction */}
      <section className="border-b border-zinc-200 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-between gap-8">
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-zinc-500">
                  <span>{profile.location}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-blue-600">{profile.availability}</span>
                </div>

                <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-zinc-950 leading-[1.08] [text-wrap:balance]">
                  Hi, I’m {profile.fullName}. {profile.headline}.
                </h1>

                <p className="text-base text-zinc-600 leading-relaxed max-w-xl">
                  {profile.introBio}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('cv')}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  <FileText className="w-4 h-4" />
                  <span>View CV &amp; Links</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('stack')}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg border border-zinc-200 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  <Layers className="w-4 h-4" />
                  <span>Explore Tech Stack</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="h-full min-h-[280px] sm:min-h-[340px] rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100">
                <ResilientImage
                  src={HERO_WORKSPACE_IMAGE}
                  alt="Developer workstation running code editor and terminal beside a bright window"
                  fallbackTitle={`${profile.fullName} — ${profile.headline}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* 4-Column Highlights Strip Below Hero */}
          <div className="mt-12 pt-8 border-t border-zinc-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1">
              <p className="text-xs font-medium text-zinc-500">Containers</p>
              <p className="font-display text-lg font-semibold text-zinc-950 tracking-tight">
                Docker &amp; Compose
              </p>
              <p className="text-xs text-zinc-600">Multi-stage builds &amp; isolated stacks</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-zinc-500">Orchestration</p>
              <p className="font-display text-lg font-semibold text-zinc-950 tracking-tight">
                Kubernetes
              </p>
              <p className="text-xs text-zinc-600">Deployments, probes &amp; rolling updates</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-zinc-500">Version Control</p>
              <p className="font-display text-lg font-semibold text-zinc-950 tracking-tight">
                Git &amp; GitHub Actions
              </p>
              <p className="text-xs text-zinc-600">Clean branching &amp; CI verification</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-zinc-500">Systems</p>
              <p className="font-display text-lg font-semibold text-zinc-950 tracking-tight">
                Ubuntu Linux &amp; Nginx
              </p>
              <p className="text-xs text-zinc-600">Self-hosted VPS &amp; TLS reverse proxy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Selected Repositories */}
      <section className="py-14 lg:py-16 bg-zinc-50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-blue-600">Featured Repositories</p>
              <h2 className="font-display text-2xl font-bold tracking-tight text-zinc-950">
                Selected GitHub work
              </h2>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('cv')}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-700 hover:text-zinc-950 hover:underline underline-offset-4 whitespace-nowrap shrink-0 self-start sm:self-auto"
            >
              <span>See full CV &amp; links</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile.repos.map((repo) => (
              <a
                key={repo.id}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white border border-zinc-200 hover:border-zinc-300 rounded-2xl p-6 flex flex-col justify-between gap-3 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-sm font-semibold text-zinc-950 group-hover:text-blue-600 truncate">
                    {repo.label}
                  </span>
                  <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-blue-600 shrink-0" />
                </div>
                <p className="text-sm text-zinc-600 leading-relaxed">{repo.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
