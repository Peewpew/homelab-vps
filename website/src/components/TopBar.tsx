import { useState } from 'react';
import { ExternalLink, Menu, X } from 'lucide-react';

export type PortfolioPage = 'home' | 'cv' | 'stack';

interface TopBarProps {
  brandName: string;
  activePage: PortfolioPage;
  linkedinUrl: string;
  onNavigate: (page: PortfolioPage) => void;
}

const NAV_ITEMS: Array<{ id: PortfolioPage; label: string }> = [
  { id: 'home', label: 'Home' },
  { id: 'cv', label: 'CV' },
  { id: 'stack', label: 'Tech Stack' },
];

export function TopBar({ brandName, activePage, linkedinUrl, onNavigate }: TopBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSelectPage = (page: PortfolioPage) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-zinc-50/95 backdrop-blur-sm border-b border-zinc-200">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#home"
          onClick={(event) => {
            event.preventDefault();
            handleSelectPage('home');
          }}
          className="font-display text-lg font-bold tracking-tight text-zinc-950 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded-sm"
        >
          {brandName}
        </a>

        {/* Zone 2: Clean single-line page navigation */}
        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-8 text-sm font-medium"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  handleSelectPage(item.id);
                }}
                className={`transition-colors whitespace-nowrap shrink-0 underline-offset-8 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 rounded-sm ${
                  isActive
                    ? 'text-zinc-950 font-semibold underline decoration-blue-600 decoration-2'
                    : 'text-zinc-600 hover:text-zinc-950 hover:underline decoration-zinc-400'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Single primary action (+ mobile menu trigger) */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <span>LinkedIn</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-100 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="md:hidden border-t border-zinc-200 bg-white px-4 py-3 flex flex-col gap-1"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  handleSelectPage(item.id);
                }}
                className={`px-3 py-2.5 text-sm font-medium rounded-lg ${
                  isActive
                    ? 'bg-zinc-100 text-zinc-950 font-semibold'
                    : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-50'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>
      )}
    </header>
  );
}
