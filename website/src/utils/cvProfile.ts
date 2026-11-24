export const MAX_CV_PDF_BYTES = Math.floor(3.5 * 1024 * 1024);

export interface UploadedCvPdf {
  fileName: string;
  sizeBytes: number;
  uploadedAt: string;
  dataUrl: string;
}

export interface CuratedGithubRepo {
  id: string;
  label: string;
  url: string;
  description: string;
}

export interface CvProfileState {
  fullName: string;
  headline: string;
  location: string;
  availability: string;
  introBio: string;
  linkedinUrl: string;
  repos: CuratedGithubRepo[];
}

export const DEFAULT_CV_PROFILE: CvProfileState = {
  fullName: 'Peewpew',
  headline: 'Junior DevOps & Cloud Infrastructure Engineer',
  location: 'Europe · Remote / Hybrid',
  availability: 'Open to Junior DevOps & Linux Roles',
  introBio:
    'I am an IT and DevOps student focused on Linux server administration, containerization, and reproducible deployments. Through my coursework and self-hosted lab projects, I build reliable web applications backed by Docker, Kubernetes, and clean Git workflows.',
  linkedinUrl: 'https://www.linkedin.com/in/peewpeew',
  repos: [
    {
      id: 'repo-homelab-vps',
      label: 'Peewpew/homelab-vps',
      url: 'https://github.com/Peewpew/homelab-vps',
      description:
        'Ubuntu 24.04 VPS portfolio, automated weekly APT updates, and deployment verification scripts.',
    },
    {
      id: 'repo-immich-stack',
      label: 'Peewpew/immich-stack',
      url: 'https://github.com/Peewpew/immich-stack',
      description:
        'Self-hosted Docker Compose media service with PostgreSQL, Redis, and automated backups.',
    },
  ],
};

export interface IntroFormErrors {
  fullName?: string;
  headline?: string;
  introBio?: string;
}

export function validateIntroFields(input: {
  fullName: string;
  headline: string;
  introBio: string;
}): { valid: boolean; errors: IntroFormErrors } {
  const errors: IntroFormErrors = {};
  if (!input.fullName.trim()) {
    errors.fullName = 'Display name is required.';
  }
  if (!input.headline.trim()) {
    errors.headline = 'Role headline is required.';
  }
  if (!input.introBio.trim()) {
    errors.introBio = 'Short introduction is required.';
  }
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function validatePdfFileMeta(file: {
  name: string;
  type: string;
  size: number;
}): { valid: boolean; error?: string } {
  const lowerName = file.name.trim().toLowerCase();
  const isPdfType = file.type === 'application/pdf' || lowerName.endsWith('.pdf');

  if (!isPdfType) {
    return {
      valid: false,
      error: 'Please select a valid PDF document (.pdf).',
    };
  }

  if (file.size <= 0) {
    return {
      valid: false,
      error: 'The selected PDF file appears to be empty.',
    };
  }

  if (file.size > MAX_CV_PDF_BYTES) {
    return {
      valid: false,
      error: `PDF exceeds the ${formatFileSize(MAX_CV_PDF_BYTES)} browser storage limit. Compress the file or place it in website/public/cv.pdf.`,
    };
  }

  return { valid: true };
}

export function normalizeLinkedinUrl(rawUrl: string): {
  valid: boolean;
  url?: string;
  error?: string;
} {
  const trimmed = rawUrl.trim();
  if (!trimmed || /\s/.test(trimmed)) {
    return {
      valid: false,
      error: 'Enter a valid LinkedIn profile URL without spaces.',
    };
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(withProtocol);
    if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname.includes('.')) {
      return {
        valid: false,
        error: 'Enter a full profile URL such as https://www.linkedin.com/in/your-handle.',
      };
    }
    return { valid: true, url: parsed.toString() };
  } catch {
    return {
      valid: false,
      error: 'Enter a valid LinkedIn URL (for example, https://www.linkedin.com/in/your-handle).',
    };
  }
}

export function parseGithubRepoInput(input: {
  repoOrUrl: string;
  description?: string;
}): {
  valid: boolean;
  repo?: Omit<CuratedGithubRepo, 'id'>;
  error?: string;
} {
  const raw = input.repoOrUrl.trim();
  const desc = (input.description ?? '').trim();

  if (!raw || /\s/.test(raw)) {
    return {
      valid: false,
      error: 'Enter a repository as owner/repo or a full https://github.com/owner/repo URL.',
    };
  }

  let ownerRepo = '';
  const fullUrlMatch = raw.match(
    /^https?:\/\/(?:www\.)?github\.com\/([^/]+)\/([^/?#]+?)(?:\.git)?\/?$/i
  );
  if (fullUrlMatch) {
    ownerRepo = `${fullUrlMatch[1]}/${fullUrlMatch[2]}`;
  } else if (/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(raw.replace(/\.git$/i, ''))) {
    ownerRepo = raw.replace(/\.git$/i, '');
  } else {
    return {
      valid: false,
      error: 'Format must be owner/repo (e.g. Peewpew/homelab-vps) or a GitHub repository URL.',
    };
  }

  return {
    valid: true,
    repo: {
      label: ownerRepo,
      url: `https://github.com/${ownerRepo}`,
      description: desc || 'Selected GitHub repository',
    },
  };
}
