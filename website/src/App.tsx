/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import {
  CvProfileState,
  DEFAULT_CV_PROFILE,
  UploadedCvPdf,
} from './utils/cvProfile';
import { PortfolioPage, TopBar } from './components/TopBar';
import { HomePage } from './components/HomePage';
import { CvPage } from './components/CvPage';
import { TechStackPage } from './components/TechStackPage';
import { EditIntroModal } from './components/EditIntroModal';

const CV_PROFILE_STORAGE_KEY = 'nobleops_cv_profile_v1';
const CV_PDF_STORAGE_KEY = 'nobleops_cv_pdf_v1';

function readPageFromHash(): PortfolioPage {
  if (typeof window === 'undefined') return 'home';
  const hash = window.location.hash.replace('#', '').toLowerCase();
  if (hash === 'cv') return 'cv';
  if (hash === 'stack' || hash === 'tech-stack') return 'stack';
  return 'home';
}

export default function App() {
  const [activePage, setActivePage] = useState<PortfolioPage>(readPageFromHash);
  const [isIntroModalOpen, setIsIntroModalOpen] = useState(false);

  const [profile, setProfile] = useState<CvProfileState>(() => {
    try {
      const saved = window.localStorage.getItem(CV_PROFILE_STORAGE_KEY);
      return saved
        ? { ...DEFAULT_CV_PROFILE, ...(JSON.parse(saved) as Partial<CvProfileState>) }
        : DEFAULT_CV_PROFILE;
    } catch {
      return DEFAULT_CV_PROFILE;
    }
  });

  const [cvPdf, setCvPdf] = useState<UploadedCvPdf | null>(() => {
    try {
      const saved = window.localStorage.getItem(CV_PDF_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as UploadedCvPdf) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const onHashChange = () => {
      setActivePage(readPageFromHash());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(CV_PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Ignore storage quota errors
    }
  }, [profile]);

  const handleNavigate = (page: PortfolioPage) => {
    setActivePage(page);
    window.history.replaceState(null, '', `#${page}`);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleSetCvPdf = (nextPdf: UploadedCvPdf | null): boolean => {
    setCvPdf(nextPdf);
    try {
      if (nextPdf) {
        window.localStorage.setItem(CV_PDF_STORAGE_KEY, JSON.stringify(nextPdf));
      } else {
        window.localStorage.removeItem(CV_PDF_STORAGE_KEY);
      }
      return true;
    } catch {
      return false;
    }
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
          <HomePage
            profile={profile}
            hasUploadedCv={Boolean(cvPdf)}
            onNavigate={handleNavigate}
            onEditIntro={() => setIsIntroModalOpen(true)}
          />
        )}

        {activePage === 'cv' && (
          <CvPage
            profile={profile}
            cvPdf={cvPdf}
            onUpdateProfile={setProfile}
            onSetCvPdf={handleSetCvPdf}
          />
        )}

        {activePage === 'stack' && <TechStackPage />}
      </main>

      <footer className="border-t border-zinc-200 bg-white py-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-zinc-900">{profile.fullName}</span>
            <span aria-hidden="true">·</span>
            <span>{profile.headline}</span>
          </div>

          <div className="flex items-center gap-6">
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
          </div>
        </div>
      </footer>

      <EditIntroModal
        isOpen={isIntroModalOpen}
        profile={profile}
        onSave={(updates) => setProfile((prev) => ({ ...prev, ...updates }))}
        onClose={() => setIsIntroModalOpen(false)}
      />
    </div>
  );
}
