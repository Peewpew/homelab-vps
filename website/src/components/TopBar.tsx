import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface TopBarProps {
  onOpenHostModal: () => void;
}

const NAV_ITEMS = [
  { href: '#projects', label: 'Projects' },
  { href: '#cleanup', label: 'Repo Cleanup' },
  { href: '#runbook', label: 'VSCode & VPS' },
  { href: '#pipeline', label: 'Pipeline' },
];

export function TopBar({ onOpenHostModal }: TopBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-zinc-50/95 backdrop-blur-sm border-b border-zinc-200">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#top"
          className="font-display text-lg font-bold tracking-tight text-zinc-950 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded-sm"
        >
          NobleOps
        </a>

        {/* Zone 2: Concise single-line navigation links */}
        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-600"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="hover:text-zinc-950 hover:underline underline-offset-8 decoration-zinc-400 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 rounded-sm"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Single primary action (+ mobile menu trigger on small screens) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenHostModal}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Configure Host
          </button>

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
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2.5 text-sm font-medium text-zinc-700 hover:text-zinc-950 hover:bg-zinc-50 rounded-lg"
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
