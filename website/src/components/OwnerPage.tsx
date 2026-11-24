import { FormEvent, useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  ExternalLink,
  FileText,
  FolderGit2,
  KeyRound,
  Lock,
  LogOut,
  Plus,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  CvProfileState,
  MAX_CV_PDF_BYTES,
  UploadedPdfMeta,
  formatFileSize,
  isPdfMagicHeader,
  normalizeLinkedinUrl,
  parseGithubRepoInput,
  validateIntroFields,
  validatePdfFileMeta,
} from '../utils/cvProfile';
import { PortfolioPage } from './TopBar';

interface OwnerPageProps {
  profile: CvProfileState;
  pdfMeta: UploadedPdfMeta | null;
  authToken: string | null;
  setupRequired: boolean;
  onAuthSuccess: (token: string) => void;
  onSignOut: () => void;
  onProfileUpdated: (profile: CvProfileState) => void;
  onPdfUpdated: (pdfMeta: UploadedPdfMeta | null) => void;
  onNavigate: (page: PortfolioPage | 'owner') => void;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

export function OwnerPage({
  profile,
  pdfMeta,
  authToken,
  setupRequired,
  onAuthSuccess,
  onSignOut,
  onProfileUpdated,
  onPdfUpdated,
  onNavigate,
}: OwnerPageProps) {
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [fullName, setFullName] = useState(profile.fullName);
  const [headline, setHeadline] = useState(profile.headline);
  const [location, setLocation] = useState(profile.location);
  const [availability, setAvailability] = useState(profile.availability);
  const [introBio, setIntroBio] = useState(profile.introBio);
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedinUrl);

  const [profileStatus, setProfileStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [newRepoInput, setNewRepoInput] = useState('');
  const [newRepoDesc, setNewRepoDesc] = useState('');
  const [repoStatus, setRepoStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [savingRepo, setSavingRepo] = useState(false);

  const [pdfStatus, setPdfStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const syncLocalDraftFromProfile = (next: CvProfileState) => {
    setFullName(next.fullName);
    setHeadline(next.headline);
    setLocation(next.location);
    setAvailability(next.availability);
    setIntroBio(next.introBio);
    setLinkedinUrl(next.linkedinUrl);
  };

  const handleAuthSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setAuthError(null);

    if (setupRequired) {
      if (passwordInput.trim().length < 8) {
        setAuthError('Password must be at least 8 characters long.');
        return;
      }
      if (passwordInput !== confirmPasswordInput) {
        setAuthError('Passwords do not match.');
        return;
      }
    } else if (!passwordInput) {
      setAuthError('Enter your owner password.');
      return;
    }

    setAuthLoading(true);
    try {
      const endpoint = setupRequired ? '/api/auth/setup' : '/api/auth/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const payload = (await response.json()) as { token?: string; error?: string };
      if (!response.ok || !payload.token) {
        setAuthError(payload.error || 'Authentication failed.');
        return;
      }

      setPasswordInput('');
      setConfirmPasswordInput('');
      syncLocalDraftFromProfile(profile);
      onAuthSuccess(payload.token);
    } catch {
      setAuthError('Unable to reach the portfolio server.');
    } finally {
      setAuthLoading(false);
    }
  };

  const persistProfile = async (
    nextProfile: CvProfileState
  ): Promise<{ ok: boolean; error?: string; saved?: CvProfileState }> => {
    if (!authToken) {
      return { ok: false, error: 'Sign in as owner first.' };
    }

    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(nextProfile),
    });

    const data = (await response.json()) as { profile?: CvProfileState; error?: string };
    if (response.status === 401) {
      onSignOut();
      return { ok: false, error: 'Session expired. Please sign in again.' };
    }
    if (!response.ok || !data.profile) {
      return { ok: false, error: data.error || 'Could not save profile updates.' };
    }
    return { ok: true, saved: data.profile };
  };

  const handleSaveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setProfileStatus(null);

    const introCheck = validateIntroFields({ fullName, headline, introBio });
    if (!introCheck.valid) {
      const message =
        introCheck.errors.fullName ||
        introCheck.errors.headline ||
        introCheck.errors.introBio ||
        'Fill in all required fields.';
      setProfileStatus({ type: 'error', message });
      return;
    }

    const linkedinCheck = normalizeLinkedinUrl(linkedinUrl);
    if (!linkedinCheck.valid || !linkedinCheck.url) {
      setProfileStatus({
        type: 'error',
        message: linkedinCheck.error || 'Enter a valid LinkedIn URL.',
      });
      return;
    }

    setSavingProfile(true);
    try {
      const candidate: CvProfileState = {
        ...profile,
        fullName: fullName.trim(),
        headline: headline.trim(),
        location: location.trim() || profile.location,
        availability: availability.trim() || profile.availability,
        introBio: introBio.trim(),
        linkedinUrl: linkedinCheck.url,
      };
      const result = await persistProfile(candidate);
      if (!result.ok || !result.saved) {
        setProfileStatus({
          type: 'error',
          message: result.error || 'Failed to save profile.',
        });
        return;
      }
      onProfileUpdated(result.saved);
      setLinkedinUrl(result.saved.linkedinUrl);
      setProfileStatus({
        type: 'success',
        message: 'Saved introduction and LinkedIn profile for all visitors.',
      });
    } catch {
      setProfileStatus({
        type: 'error',
        message: 'Network error while saving profile.',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddRepo = async (event: FormEvent) => {
    event.preventDefault();
    setRepoStatus(null);

    const parsed = parseGithubRepoInput({
      repoOrUrl: newRepoInput,
      description: newRepoDesc,
    });
    if (!parsed.valid || !parsed.repo) {
      setRepoStatus({
        type: 'error',
        message: parsed.error || 'Enter a valid GitHub repository.',
      });
      return;
    }

    const duplicate = profile.repos.some(
      (item) => item.label.toLowerCase() === parsed.repo!.label.toLowerCase()
    );
    if (duplicate) {
      setRepoStatus({
        type: 'error',
        message: `${parsed.repo.label} is already in your featured repositories.`,
      });
      return;
    }

    setSavingRepo(true);
    try {
      const nextRepos = [
        ...profile.repos,
        {
          id: `repo-${Date.now()}`,
          label: parsed.repo.label,
          url: parsed.repo.url,
          description: parsed.repo.description,
        },
      ];
      const result = await persistProfile({ ...profile, repos: nextRepos });
      if (!result.ok || !result.saved) {
        setRepoStatus({
          type: 'error',
          message: result.error || 'Could not add repository.',
        });
        return;
      }
      onProfileUpdated(result.saved);
      setNewRepoInput('');
      setNewRepoDesc('');
      setRepoStatus({
        type: 'success',
        message: `Added ${parsed.repo.label} to the public portfolio.`,
      });
    } catch {
      setRepoStatus({
        type: 'error',
        message: 'Network error while saving repositories.',
      });
    } finally {
      setSavingRepo(false);
    }
  };

  const handleRemoveRepo = async (repoId: string) => {
    setRepoStatus(null);
    setSavingRepo(true);
    try {
      const nextRepos = profile.repos.filter((item) => item.id !== repoId);
      const result = await persistProfile({ ...profile, repos: nextRepos });
      if (!result.ok || !result.saved) {
        setRepoStatus({
          type: 'error',
          message: result.error || 'Could not remove repository.',
        });
        return;
      }
      onProfileUpdated(result.saved);
      setRepoStatus({
        type: 'success',
        message: 'Updated repository list.',
      });
    } catch {
      setRepoStatus({
        type: 'error',
        message: 'Network error while updating repositories.',
      });
    } finally {
      setSavingRepo(false);
    }
  };

  const handlePdfFileSelected = async (file: File | undefined) => {
    if (!file || !authToken) return;
    setPdfStatus(null);

    const validation = validatePdfFileMeta({
      name: file.name,
      type: file.type,
      size: file.size,
    });
    if (!validation.valid) {
      setPdfStatus({
        type: 'error',
        message: validation.error || 'Invalid PDF file.',
      });
      return;
    }

    setUploadingPdf(true);
    try {
      const buffer = await file.arrayBuffer();
      const header = new Uint8Array(buffer.slice(0, 8));
      if (!isPdfMagicHeader(header)) {
        setPdfStatus({
          type: 'error',
          message: 'Selected file does not appear to be a valid PDF (%PDF- header missing).',
        });
        return;
      }

      const response = await fetch('/api/cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type || 'application/pdf',
          size: file.size,
          dataBase64: arrayBufferToBase64(buffer),
        }),
      });

      const payload = (await response.json()) as {
        pdfMeta?: UploadedPdfMeta;
        error?: string;
      };
      if (response.status === 401) {
        onSignOut();
        setPdfStatus({ type: 'error', message: 'Session expired. Please sign in again.' });
        return;
      }
      if (!response.ok || !payload.pdfMeta) {
        setPdfStatus({
          type: 'error',
          message: payload.error || 'PDF upload failed.',
        });
        return;
      }

      onPdfUpdated(payload.pdfMeta);
      setPdfStatus({
        type: 'success',
        message: `Published ${payload.pdfMeta.fileName} (${formatFileSize(payload.pdfMeta.sizeBytes)}) on the CV page.`,
      });
    } catch {
      setPdfStatus({
        type: 'error',
        message: 'Failed to upload PDF document.',
      });
    } finally {
      setUploadingPdf(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeletePdf = async () => {
    if (!authToken) return;
    setPdfStatus(null);
    setUploadingPdf(true);
    try {
      const response = await fetch('/api/cv', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.status === 401) {
        onSignOut();
        setPdfStatus({ type: 'error', message: 'Session expired. Please sign in again.' });
        return;
      }
      if (!response.ok) {
        setPdfStatus({ type: 'error', message: 'Could not remove CV PDF.' });
        return;
      }
      onPdfUpdated(null);
      setPdfStatus({
        type: 'success',
        message: 'Removed published CV PDF from public view.',
      });
    } catch {
      setPdfStatus({ type: 'error', message: 'Network error while removing CV PDF.' });
    } finally {
      setUploadingPdf(false);
    }
  };

  if (!authToken) {
    return (
      <section className="py-16 bg-zinc-50 min-h-[calc(100vh-8rem)]">
        <div className="max-w-md mx-auto px-4 sm:px-6 space-y-6">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-950"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Portfolio</span>
          </button>

          <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-medium text-blue-600">
                {setupRequired ? (
                  <KeyRound className="w-4 h-4" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                <span>{setupRequired ? 'Initial Owner Setup' : 'Owner Sign In'}</span>
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-950">
                {setupRequired ? 'Claim Owner Access' : 'Sign in to manage CV'}
              </h1>
              <p className="text-sm text-zinc-600 leading-relaxed">
                {setupRequired
                  ? 'Set your private owner password once to protect PDF uploads, LinkedIn updates, and repository links. Visitors remain read-only.'
                  : 'Enter your owner password to upload a new CV PDF or update your intro, LinkedIn URL, and GitHub repositories.'}
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="owner-password"
                  className="block text-xs font-semibold text-zinc-900"
                >
                  {setupRequired ? 'New Owner Password (min. 8 characters)' : 'Owner Password'}
                </label>
                <input
                  id="owner-password"
                  type="password"
                  autoComplete={setupRequired ? 'new-password' : 'current-password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm text-zinc-950 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
                  placeholder="Enter password"
                />
              </div>

              {setupRequired && (
                <div className="space-y-1.5">
                  <label
                    htmlFor="owner-password-confirm"
                    className="block text-xs font-semibold text-zinc-900"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="owner-password-confirm"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm text-zinc-950 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
                    placeholder="Repeat password"
                  />
                </div>
              )}

              {authError && (
                <p className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-zinc-950 hover:bg-zinc-800 disabled:opacity-60 rounded-lg transition-colors"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {authLoading
                    ? 'Verifying...'
                    : setupRequired
                      ? 'Save Owner Password & Enter'
                      : 'Sign In'}
                </span>
              </button>
            </form>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 lg:py-16 bg-zinc-50 min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
          <div className="space-y-1">
            <p className="text-xs font-medium text-blue-600">Owner Console</p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
              Manage CV &amp; Portfolio Content
            </h1>
            <p className="text-sm text-zinc-600">
              Changes saved here update what employers see across Home and CV.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('cv')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-800 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-lg transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>View Public CV</span>
            </button>
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-700 hover:text-zinc-950 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* 1. CV PDF Upload Card */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h2 className="text-base font-semibold text-zinc-950">CV PDF Document</h2>
              </div>
              <p className="text-xs text-zinc-600">
                Upload a PDF up to {formatFileSize(MAX_CV_PDF_BYTES)}. Stored securely on the
                server and served at <span className="font-mono">/api/cv.pdf</span>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => handlePdfFileSelected(e.target.files?.[0])}
                className="sr-only"
                id="owner-cv-upload"
              />
              <label
                htmlFor="owner-cv-upload"
                className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer ${
                  uploadingPdf ? 'opacity-60 pointer-events-none' : ''
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{pdfMeta ? 'Replace CV PDF' : 'Upload CV PDF'}</span>
              </label>

              {pdfMeta && (
                <button
                  type="button"
                  disabled={uploadingPdf}
                  onClick={handleDeletePdf}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>

          {pdfMeta ? (
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-mono font-semibold text-zinc-950 truncate">
                  {pdfMeta.fileName}
                </span>
                <span className="text-zinc-500 font-mono tabular-nums">
                  ({formatFileSize(pdfMeta.sizeBytes)})
                </span>
              </div>
              <a
                href="/api/cv.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-blue-600 hover:underline shrink-0"
              >
                <span>Open PDF</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ) : (
            <p className="text-xs text-zinc-500">
              No PDF is published yet. Upload your CV PDF above to enable visitor preview and
              downloads.
            </p>
          )}

          {pdfStatus && (
            <p
              className={`text-xs font-medium px-3 py-2 rounded-lg border ${
                pdfStatus.type === 'success'
                  ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                  : 'text-red-700 bg-red-50 border-red-200'
              }`}
            >
              {pdfStatus.message}
            </p>
          )}
        </div>

        {/* 2. Intro & LinkedIn Form */}
        <form
          onSubmit={handleSaveProfile}
          className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-5"
        >
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-zinc-950">
              Introduction &amp; LinkedIn Profile
            </h2>
            <p className="text-xs text-zinc-600">
              Shown on your Home landing page, top navigation bar, and CV header.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="owner-fullname" className="block text-xs font-semibold text-zinc-900">
                Display Name
              </label>
              <input
                id="owner-fullname"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm text-zinc-950 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="owner-headline" className="block text-xs font-semibold text-zinc-900">
                Role Headline
              </label>
              <input
                id="owner-headline"
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full px-3.5 py-2 text-sm text-zinc-950 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="owner-location" className="block text-xs font-semibold text-zinc-900">
                Location
              </label>
              <input
                id="owner-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2 text-sm text-zinc-950 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="owner-availability"
                className="block text-xs font-semibold text-zinc-900"
              >
                Availability Note
              </label>
              <input
                id="owner-availability"
                type="text"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full px-3.5 py-2 text-sm text-zinc-950 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="owner-linkedin" className="block text-xs font-semibold text-zinc-900">
              LinkedIn Profile URL
            </label>
            <input
              id="owner-linkedin"
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://www.linkedin.com/in/your-handle"
              className="w-full px-3.5 py-2 text-sm font-mono text-zinc-950 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="owner-bio" className="block text-xs font-semibold text-zinc-900">
              Short Introduction
            </label>
            <textarea
              id="owner-bio"
              rows={4}
              value={introBio}
              onChange={(e) => setIntroBio(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm text-zinc-950 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
            />
          </div>

          {profileStatus && (
            <p
              className={`text-xs font-medium px-3 py-2 rounded-lg border flex items-center gap-2 ${
                profileStatus.type === 'success'
                  ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                  : 'text-red-700 bg-red-50 border-red-200'
              }`}
            >
              {profileStatus.type === 'success' && <Check className="w-3.5 h-3.5 shrink-0" />}
              <span>{profileStatus.message}</span>
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium text-white bg-zinc-950 hover:bg-zinc-800 disabled:opacity-60 rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{savingProfile ? 'Saving...' : 'Save Profile Details'}</span>
            </button>
          </div>
        </form>

        {/* 3. Featured GitHub Repositories */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-zinc-700" />
                <h2 className="text-base font-semibold text-zinc-950">
                  Featured GitHub Repositories
                </h2>
              </div>
              <p className="text-xs text-zinc-600">
                Choose the repositories shown on your Home and CV pages.
              </p>
            </div>
            <span className="font-mono text-xs text-zinc-500 tabular-nums">
              {profile.repos.length} / 12
            </span>
          </div>

          <ul className="divide-y divide-zinc-200 border-t border-zinc-200">
            {profile.repos.map((repo) => (
              <li
                key={repo.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-zinc-950 hover:text-blue-600 hover:underline break-all"
                  >
                    <span>{repo.label}</span>
                    <ExternalLink className="w-3 h-3 shrink-0 text-zinc-400" />
                  </a>
                  <p className="text-xs text-zinc-600">{repo.description}</p>
                </div>

                <button
                  type="button"
                  disabled={savingRepo}
                  onClick={() => handleRemoveRepo(repo.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 border border-zinc-200 rounded-lg self-start sm:self-center shrink-0 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </li>
            ))}
          </ul>

          <form
            onSubmit={handleAddRepo}
            className="pt-4 border-t border-zinc-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
          >
            <div className="sm:col-span-5 space-y-1.5">
              <label htmlFor="owner-repo-url" className="block text-xs font-semibold text-zinc-900">
                GitHub Repo (owner/repo or URL)
              </label>
              <input
                id="owner-repo-url"
                type="text"
                value={newRepoInput}
                onChange={(e) => setNewRepoInput(e.target.value)}
                placeholder="Peewpew/k8s-lab"
                className="w-full px-3 py-2 text-xs font-mono text-zinc-950 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-5 space-y-1.5">
              <label htmlFor="owner-repo-desc" className="block text-xs font-semibold text-zinc-900">
                Short Summary
              </label>
              <input
                id="owner-repo-desc"
                type="text"
                value={newRepoDesc}
                onChange={(e) => setNewRepoDesc(e.target.value)}
                placeholder="Docker & Kubernetes coursework templates"
                className="w-full px-3 py-2 text-xs text-zinc-950 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={savingRepo}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </form>

          {repoStatus && (
            <p
              className={`text-xs font-medium px-3 py-2 rounded-lg border ${
                repoStatus.type === 'success'
                  ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                  : 'text-red-700 bg-red-50 border-red-200'
              }`}
            >
              {repoStatus.message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
