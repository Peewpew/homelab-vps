import { useState } from 'react';
import {
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  FolderGit2,
  Linkedin,
} from 'lucide-react';
import { CV_MOCK_DATA } from '../data/techStackContent';
import { CvProfileState, UploadedPdfMeta, formatFileSize } from '../utils/cvProfile';

interface CvPageProps {
  profile: CvProfileState;
  pdfMeta: UploadedPdfMeta | null;
}

export function CvPage({ profile, pdfMeta }: CvPageProps) {
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  const hasPublishedPdf = Boolean(pdfMeta);
  const pdfUrl = '/api/cv.pdf';
  const pdfFileName = pdfMeta?.fileName ?? 'cv.pdf';

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
              Education background, practical project experience, and verified links to my CV,
              LinkedIn, and GitHub repositories.
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

            {hasPublishedPdf && (
              <a
                href={pdfUrl}
                download={pdfFileName}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <Download className="w-4 h-4" />
                <span>Download CV PDF</span>
              </a>
            )}
          </div>
        </div>

        {/* 2-Column Read-Only CV & Links */}
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

          {/* Right: Published CV PDF & Verified Profile Links */}
          <div className="lg:col-span-5 space-y-6">
            {/* Published PDF Card */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm font-semibold text-zinc-950">CV Document (PDF)</h2>
                </div>
                {pdfMeta && (
                  <span className="font-mono text-xs text-zinc-500 tabular-nums">
                    {formatFileSize(pdfMeta.sizeBytes)}
                  </span>
                )}
              </div>

              {hasPublishedPdf ? (
                <div className="space-y-4">
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    Download <span className="font-mono text-xs text-zinc-900">{pdfFileName}</span>{' '}
                    or preview the document directly below.
                  </p>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowPdfPreview((prev) => !prev)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
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
                      href={pdfUrl}
                      download={pdfFileName}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-800 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-zinc-600 leading-relaxed">
                  A downloadable PDF copy is not attached yet. Full education, project experience,
                  and skills are listed beside this card.
                </p>
              )}

              <div className="pt-4 border-t border-zinc-200 flex items-center justify-between gap-4">
                <span className="text-xs font-medium text-zinc-500">LinkedIn</span>
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline underline-offset-4 truncate"
                >
                  <span className="truncate">{profile.linkedinUrl.replace(/^https?:\/\//, '')}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            </div>

            {/* Selected GitHub Repositories */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-zinc-500" />
                  <h2 className="text-sm font-semibold text-zinc-950">GitHub Repositories</h2>
                </div>
                <span className="font-mono text-xs text-zinc-500 tabular-nums">
                  {profile.repos.length}
                </span>
              </div>

              <ul className="divide-y divide-zinc-200 border-t border-zinc-200">
                {profile.repos.map((repo) => (
                  <li key={repo.id} className="py-3.5 space-y-1">
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
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Inline PDF Preview Panel */}
        {showPdfPreview && hasPublishedPdf && (
          <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-white">
            <div className="flex items-center justify-between gap-4 px-5 py-3 bg-zinc-100 border-b border-zinc-200">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-mono text-xs font-semibold text-zinc-900 truncate">
                  {pdfFileName}
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
              title={`PDF preview of ${pdfFileName}`}
              src={pdfUrl}
              className="w-full h-[560px] bg-zinc-100"
            />
          </div>
        )}
      </div>
    </section>
  );
}
