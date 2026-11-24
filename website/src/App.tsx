/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import {
  CvProfileState,
  PORTFOLIO_PROFILE,
  UploadedPdfMeta,
} from './utils/cvProfile';
import { PortfolioPage, TopBar } from './components/TopBar';
import { HomePage } from './components/HomePage';
import { CvPage } from './components/CvPage';
import { TechStackPage } from './components/TechStackPage';
import { OwnerPage } from './components/OwnerPage';

type AppPage = PortfolioPage | 'owner';

function readPageFromHash(): AppPage {
  if (typeof window === 'undefined') return 'home';
  const hash = window.location.hash.replace('#', '').toLowerCase();
  if (hash === 'cv') return 'cv';
  if (hash === 'stack' || hash === 'tech-stack') return 'stack';
  if (hash === 'owner') return 'owner';
  return 'home';
}

export default function App() {
  const [activePage, setActivePage] = useState<AppPage>(readPageFromHash);
  const [profile, setProfile] = useState<CvProfileState>(PORTFOLIO_PROFILE);
  const [pdfMeta, setPdfMeta] = useState<UploadedPdfMeta | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [setupRequired, setSetupRequired] = useState(false);

  useEffect(() => {
    const onHashChange = () => {
      setActivePage(readPageFromHash());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    let active = true;

    fetch('/api/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then(
        (
          data: { profile?: CvProfileState; pdfMeta?: UploadedPdfMeta | null } | null
        ) => {
          if (!active || !data) return;
          if (data.profile) setProfile(data.profile);
          setPdfMeta(data.pdfMeta ?? null);
        }
      )
      .catch(() => {
        // Keep bundled fallback profile if server is unreachable
      });

    fetch('/api/auth/status')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { setupRequired?: boolean } | null) => {
        if (!active || !data) return;
        setSetupRequired(Boolean(data.setupRequired));
      })
      .catch(() => {
        // Ignore auth status errors on initial public render
      });

    return () => {
      active = false;
    };
  }, []);

  const handleNavigate = (page: AppPage) => {
    setActivePage(page);
    window.history.replaceState(null, '', `#${page}`);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-950">
      <TopBar
        brandName={profile.fullName}
        activePage={activePage}
        linkedinUrl={profile.linkedinUrl}
        onNavigate={handleNavigate}
      />

      <main className="flex-1">
        {activePage === 'home' && (
          <HomePage profile={profile} onNavigate={handleNavigate} />
        )}

        {activePage === 'cv' && <CvPage profile={profile} pdfMeta={pdfMeta} />}

        {activePage === 'stack' && <TechStackPage />}

        {activePage === 'owner' && (
          <OwnerPage
            profile={profile}
            pdfMeta={pdfMeta}
            authToken={authToken}
            setupRequired={setupRequired}
            onAuthSuccess={(token) => {
              setAuthToken(token);
              setSetupRequired(false);
            }}
            onSignOut={() => setAuthToken(null)}
            onProfileUpdated={setProfile}
            onPdfUpdated={setPdfMeta}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      <footer className="border-t border-zinc-200 bg-white py-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-zinc-900">{profile.fullName}</span>
            <span aria-hidden="true">·</span>
            <span>{profile.headline}</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                handleNavigate('home');
              }}
              className="hover:text-zinc-900"
            >
              Home
            </a>
            <a
              href="#cv"
              onClick={(e) => {
                e.preventDefault();
                handleNavigate('cv');
              }}
              className="hover:text-zinc-900"
            >
              CV
            </a>
            <a
              href="#stack"
              onClick={(e) => {
                e.preventDefault();
                handleNavigate('stack');
              }}
              className="hover:text-zinc-900"
            >
              Tech Stack
            </a>
            <a
              href={profile.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-900"
            >
              LinkedIn
            </a>
            <a
              href="#owner"
              onClick={(e) => {
                e.preventDefault();
                handleNavigate('owner');
              }}
              className="text-zinc-400 hover:text-zinc-900"
            >
              Owner Access
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
