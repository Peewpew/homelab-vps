import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import {
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  FolderGit2,
  Linkedin,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';
import { CV_MOCK_DATA } from '../data/techStackContent';
import {
  CvProfileState,
  UploadedCvPdf,
  formatFileSize,
  normalizeLinkedinUrl,
  parseGithubRepoInput,
  validatePdfFileMeta,
} from '../utils/cvProfile';

interface CvPageProps {
  profile: CvProfileState;
  cvPdf: UploadedCvPdf | null;
  onUpdateProfile: (updater: (prev: CvProfileState) => CvProfileState) => void;
  onSetCvPdf: (pdf: UploadedCvPdf | null) => boolean;
}

export function CvPage({ profile, cvPdf, onUpdateProfile, onSetCvPdf }: CvPageProps) {
  const [linkedinDraft, setLinkedinDraft] = useState(profile.linkedinUrl);
  const [linkedinError, setLinkedinError] = useState<string | null>(null);
  const [linkedinSaved, setLinkedinSaved] = useState(false);

  const [repoInput, setRepoInput] = useState('');
  const [repoDescInput, setRepoDescInput] = useState('');
  const [repoError, setRepoError] = useState<string | null>(null);

  const [pdfError, setPdfError] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setLinkedinDraft(profile.linkedinUrl);
  }, [profile.linkedinUrl]);

  const handlePdfUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const check = validatePdfFileMeta({
      name: file.name,
      type: file.type,
      size: file.size,
    });

    if (!check.valid) {
      setPdfError(check.error ?? 'Invalid PDF file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setPdfError('Unable to read the selected PDF file.');
        return;
      }

      const uploaded: UploadedCvPdf = {
        fileName: file.name,
        sizeBytes: file.size,
        uploadedAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        dataUrl: reader.result,
      };

      const persisted = onSetCvPdf(uploaded);
      setShowPdfPreview(true);
      setPdfError(
        persisted
          ? null
          : 'Loaded for this session, but the file exceeded browser storage limits to persist across reloads.'
      );
    };
    reader.onerror = () => {
      setPdfError('Failed to read the PDF file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePdf = () => {
    setShowPdfPreview(false);
    setPdfError(null);
    onSetCvPdf(null);
  };

  const handleSaveLinkedin = (event: FormEvent) => {
    event.preventDefault();
    const result = normalizeLinkedinUrl(linkedinDraft);
    if (!result.valid || !result.url) {
      setLinkedinError(result.error ?? 'Enter a valid LinkedIn URL.');
      setLinkedinSaved(false);
      return;
    }

    onUpdateProfile((prev) => ({ ...prev, linkedinUrl: result.url! }));
    setLinkedinDraft(result.url);
    setLinkedinError(null);
    setLinkedinSaved(true);
    window.setTimeout(() => setLinkedinSaved(false), 2000);
  };

  const handleAddRepo = (event: FormEvent) => {
    event.preventDefault();
    const parsed = parseGithubRepoInput({
      repoOrUrl: repoInput,
      description: repoDescInput,
    });

    if (!parsed.valid || !parsed.repo) {
      setRepoError(parsed.error ?? 'Enter a valid GitHub repository.');
      return;
    }

    const duplicate = profile.repos.some(
      (item) => item.label.toLowerCase() === parsed.repo!.label.toLowerCase()
    );
    if (duplicate) {
      setRepoError(`${parsed.repo.label} is already listed.`);
      return;
    }

    onUpdateProfile((prev) => ({
      ...prev,
      repos: [
        ...prev.repos,
        {
          id: `repo-${Date.now()}`,
          ...parsed.repo!,
        },
      ],
    }));
    setRepoInput('');
    setRepoDescInput('');
    setRepoError(null);
  };

  const handleRemoveRepo = (id: string) => {
    onUpdateProfile((prev) => ({
      ...prev,
      repos: prev.repos.filter((repo) => repo.id !== id),
    }));
  };

  return (
    <section className="py-12 lg:py-16 bg-zinc-50 min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-10">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-zinc-200">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-medium text-blue-600">Curriculum Vitae</p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 [text-wrap:balance]">
              {profile.fullName} — {profile.headline}
            </h1>
            <p className="text-sm sm:text-base text-zinc-600">
              Education background, practical project experience, downloadable PDF CV, and verified
              links. Placeholder CV entries can be updated as you add your details.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={profile.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium text-zinc-900 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <Linkedin className="w-4 h-4 text-blue-600" />
              <span>LinkedIn Profile</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
            </a>

            {cvPdf && (
              <a
                href={cvPdf.dataUrl}
                download={cvPdf.fileName}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <Download className="w-4 h-4" />
                <span>Download CV PDF</span>
              </a>
            )}
          </div>
        </div>

        {/* 2-Column CV Content & PDF/Links Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Structured CV Summary (Education, Experience, Skills) */}
          <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 space-y-8">
            {/* Education */}
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold tracking-tight text-zinc-950">
                Education
              </h2>
              <div className="divide-y divide-zinc-200 border-t border-zinc-200">
                {CV_MOCK_DATA.education.map((item) => (
                  <div key={item.program} className="py-4 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-zinc-950">{item.program}</h3>
                      <span className="font-mono text-xs text-zinc-500 tabular-nums">
                        {item.period}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-zinc-500">{item.institution}</p>
                    <p className="text-sm text-zinc-600 leading-relaxed">{item.highlights}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hands-on Experience & Labs */}
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold tracking-tight text-zinc-950">
                Practical Experience &amp; Labs
              </h2>
              <div className="divide-y divide-zinc-200 border-t border-zinc-200">
                {CV_MOCK_DATA.experience.map((item) => (
                  <div key={item.role} className="py-4 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-zinc-950">{item.role}</h3>
                      <span className="font-mono text-xs text-zinc-500 tabular-nums">
                        {item.period}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-zinc-500">{item.context}</p>
                    <p className="text-sm text-zinc-600 leading-relaxed">{item.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Core Technical Skills */}
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold tracking-tight text-zinc-950">
                Core Technical Skills
              </h2>
              <div className="divide-y divide-zinc-200 border-t border-zinc-200">
                {CV_MOCK_DATA.skills.map((skill) => (
                  <div
                    key={skill.group}
                    className="py-3.5 grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4"
                  >
                    <span className="sm:col-span-4 text-xs font-semibold text-zinc-900">
                      {skill.group}
                    </span>
                    <span className="sm:col-span-8 text-sm text-zinc-600">{skill.items}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: PDF CV Upload + LinkedIn + Selected GitHub Repositories */}
          <div className="lg:col-span-5 space-y-6">
            {/* PDF Upload Card */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-zinc-950">CV Document (PDF)</h2>
                <span className="text-xs text-zinc-500 tabular-nums">Max 3.5 MB</span>
              </div>

              <input
                ref={fileInputRef}
                id="cv-pdf-upload"
                type="file"
                accept="application/pdf,.pdf"
                aria-label="Select CV PDF file"
                onChange={handlePdfUpload}
                className="sr-only"
              />

              {cvPdf ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="font-mono text-sm font-semibold text-zinc-950 truncate">
                        {cvPdf.fileName}
                      </p>
                      <p className="text-xs text-zinc-500 tabular-nums">
                        {formatFileSize(cvPdf.sizeBytes)} · Uploaded {cvPdf.uploadedAt}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePdf}
                      aria-label={`Remove ${cvPdf.fileName}`}
                      className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-zinc-500 hover:text-red-700 hover:bg-red-50 transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPdfPreview((prev) => !prev)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      {showPdfPreview ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Hide Preview</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview PDF</span>
                        </>
                      )}
                    </button>

                    <a
                      href={cvPdf.dataUrl}
                      download={cvPdf.fileName}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-800 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-700 hover:text-zinc-950 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Replace</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-zinc-600">
                    Upload your PDF CV so hiring managers can preview or download it directly from
                    this page.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload CV PDF</span>
                  </button>
                </div>
              )}

              {pdfError && (
                <p role="alert" className="text-xs text-red-600">
                  {pdfError}
                </p>
              )}

              {/* LinkedIn URL Form */}
              <form
                onSubmit={handleSaveLinkedin}
                noValidate
                className="pt-5 border-t border-zinc-200 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="cv-linkedin-input"
                    className="block text-xs font-medium text-zinc-800"
                  >
                    LinkedIn Profile URL
                  </label>
                  {linkedinSaved && (
                    <span className="text-xs font-medium text-emerald-700">Saved</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="cv-linkedin-input"
                    type="url"
                    value={linkedinDraft}
                    onChange={(e) => {
                      setLinkedinDraft(e.target.value);
                      if (linkedinError) setLinkedinError(null);
                    }}
                    placeholder="https://www.linkedin.com/in/your-handle"
                    className="min-w-0 flex-1 px-3 py-2 text-xs font-mono bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-2 focus:outline-blue-600"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 text-xs font-medium text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    Save Link
                  </button>
                </div>

                {linkedinError && (
                  <p role="alert" className="text-xs text-red-600">
                    {linkedinError}
                  </p>
                )}
              </form>
            </div>

            {/* Selected GitHub Repositories */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-zinc-500" />
                  <h2 className="text-sm font-semibold text-zinc-950">GitHub Repositories</h2>
                </div>
                <span className="font-mono text-xs text-zinc-500 tabular-nums">
                  {profile.repos.length}
                </span>
              </div>

              {profile.repos.length === 0 ? (
                <p className="text-sm text-zinc-500 py-4 border-y border-zinc-200">
                  No repositories listed yet. Add a repository below.
                </p>
              ) : (
                <ul className="divide-y divide-zinc-200 border-y border-zinc-200">
                  {profile.repos.map((repo) => (
                    <li key={repo.id} className="py-3.5 flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-zinc-950 hover:text-blue-600 hover:underline underline-offset-4 break-all"
                        >
                          <span>{repo.label}</span>
                          <ExternalLink className="w-3 h-3 text-zinc-400 shrink-0" />
                        </a>
                        <p className="text-xs text-zinc-600 leading-relaxed">{repo.description}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveRepo(repo.id)}
                        aria-label={`Remove repository ${repo.label}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-zinc-500 hover:text-red-700 hover:bg-red-50 transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <form onSubmit={handleAddRepo} noValidate className="space-y-3">
                <div className="space-y-1">
                  <label htmlFor="cv-repo-input" className="block text-xs font-medium text-zinc-800">
                    Add Repository (owner/repo or URL)
                  </label>
                  <input
                    id="cv-repo-input"
                    type="text"
                    value={repoInput}
                    onChange={(e) => {
                      setRepoInput(e.target.value);
                      if (repoError) setRepoError(null);
                    }}
                    placeholder="Peewpew/kubernetes-labs"
                    className="w-full px-3 py-2 text-xs font-mono bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-2 focus:outline-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="cv-repo-desc" className="block text-xs font-medium text-zinc-800">
                    Summary (optional)
                  </label>
                  <input
                    id="cv-repo-desc"
                    type="text"
                    value={repoDescInput}
                    onChange={(e) => setRepoDescInput(e.target.value)}
                    placeholder="Kubernetes coursework & manifests"
                    className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-2 focus:outline-blue-600"
                  />
                </div>

                {repoError && (
                  <p role="alert" className="text-xs text-red-600">
                    {repoError}
                  </p>
                )}

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Repository</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Inline PDF Preview Panel */}
        {showPdfPreview && cvPdf && (
          <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-white">
            <div className="flex items-center justify-between gap-4 px-5 py-3 bg-zinc-100 border-b border-zinc-200">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-mono text-xs font-semibold text-zinc-900 truncate">
                  {cvPdf.fileName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPdfPreview(false)}
                className="px-3 py-1.5 text-xs font-medium text-zinc-700 hover:text-zinc-950 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-md transition-colors whitespace-nowrap shrink-0"
              >
                Close Preview
              </button>
            </div>
            <iframe
              title={`PDF preview of ${cvPdf.fileName}`}
              src={cvPdf.dataUrl}
              className="w-full h-[560px] bg-zinc-100"
            />
          </div>
        )}
      </div>
    </section>
  );
}
