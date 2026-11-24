import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import {
  MAX_CV_PDF_BYTES,
  PORTFOLIO_PROFILE,
  isPdfMagicHeader,
  isSafeHttpUrl,
  normalizeLinkedinUrl,
  parseGithubRepoInput,
  validateIntroFields,
  validatePdfFileMeta,
} from './src/utils/cvProfile.ts';
import type {
  CuratedGithubRepo,
  CvProfileState,
  UploadedPdfMeta,
} from './src/utils/cvProfile.ts';
import {
  hashPassword,
  resolveConfinedPath,
  signSessionToken,
  timingSafeEqualStrings,
  verifyPassword,
  verifySessionToken,
} from './src/utils/serverAuth.ts';

interface StoredAdminRecord {
  hash: string;
  salt: string;
  createdAt: string;
}

const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';
const DATA_DIR = path.resolve(process.cwd(), 'data');
const PROFILE_FILE = resolveConfinedPath(DATA_DIR, 'profile.json');
const ADMIN_FILE = resolveConfinedPath(DATA_DIR, 'admin.json');
const CV_PDF_FILE = resolveConfinedPath(DATA_DIR, 'cv.pdf');
const CV_META_FILE = resolveConfinedPath(DATA_DIR, 'cv.meta.json');
const SESSION_SECRET =
  process.env.SESSION_SECRET?.trim() || crypto.randomBytes(32).toString('hex');

function ensureDataDir(): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function writeFileAtomic(targetPath: string, content: Buffer | string, mode?: number): void {
  ensureDataDir();
  const tempName = `.tmp-${process.pid}-${crypto.randomUUID()}`;
  const tempPath = resolveConfinedPath(DATA_DIR, tempName);
  fs.writeFileSync(tempPath, content, mode ? { mode } : undefined);
  fs.renameSync(tempPath, targetPath);
}

function writeJsonAtomic(targetPath: string, data: unknown, mode?: number): void {
  writeFileAtomic(targetPath, JSON.stringify(data, null, 2), mode);
}

function getEnvAdminPassword(): string {
  return process.env.ADMIN_PASSWORD?.trim() || '';
}

function readAdminRecord(): StoredAdminRecord | null {
  if (!fs.existsSync(ADMIN_FILE)) return null;
  try {
    const raw = fs.readFileSync(ADMIN_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<StoredAdminRecord>;
    if (
      typeof parsed.hash === 'string' &&
      typeof parsed.salt === 'string' &&
      parsed.hash.length > 0 &&
      parsed.salt.length > 0
    ) {
      return {
        hash: parsed.hash,
        salt: parsed.salt,
        createdAt: typeof parsed.createdAt === 'string' ? parsed.createdAt : '',
      };
    }
  } catch {
    return null;
  }
  return null;
}

function isSetupRequired(): boolean {
  return !getEnvAdminPassword() && !readAdminRecord();
}

function sanitizeFilename(rawName: string): string {
  const base = path.basename(rawName || 'cv.pdf').replace(/[^A-Za-z0-9._-]/g, '_');
  const trimmed = base.replace(/^\.+/, '');
  const withName = trimmed || 'cv.pdf';
  return withName.toLowerCase().endsWith('.pdf') ? withName : `${withName}.pdf`;
}

function sanitizeStoredProfile(candidate: Partial<CvProfileState>): CvProfileState {
  const fullName =
    typeof candidate.fullName === 'string' && candidate.fullName.trim()
      ? candidate.fullName.trim().slice(0, 120)
      : PORTFOLIO_PROFILE.fullName;
  const headline =
    typeof candidate.headline === 'string' && candidate.headline.trim()
      ? candidate.headline.trim().slice(0, 160)
      : PORTFOLIO_PROFILE.headline;
  const location =
    typeof candidate.location === 'string' && candidate.location.trim()
      ? candidate.location.trim().slice(0, 120)
      : PORTFOLIO_PROFILE.location;
  const availability =
    typeof candidate.availability === 'string' && candidate.availability.trim()
      ? candidate.availability.trim().slice(0, 120)
      : PORTFOLIO_PROFILE.availability;
  const introBio =
    typeof candidate.introBio === 'string' && candidate.introBio.trim()
      ? candidate.introBio.trim().slice(0, 1200)
      : PORTFOLIO_PROFILE.introBio;

  const linkedinCandidate =
    typeof candidate.linkedinUrl === 'string' ? candidate.linkedinUrl.trim() : '';
  const linkedinUrl = isSafeHttpUrl(linkedinCandidate)
    ? linkedinCandidate
    : PORTFOLIO_PROFILE.linkedinUrl;

  let repos: CuratedGithubRepo[] = PORTFOLIO_PROFILE.repos;
  if (Array.isArray(candidate.repos)) {
    repos = candidate.repos
      .filter((item): item is CuratedGithubRepo => Boolean(item && typeof item === 'object'))
      .slice(0, 12)
      .flatMap((item, index) => {
        if (
          typeof item.label !== 'string' ||
          typeof item.url !== 'string' ||
          !isSafeHttpUrl(item.url)
        ) {
          return [];
        }
        return [
          {
            id:
              typeof item.id === 'string' && item.id.trim()
                ? item.id.trim().slice(0, 80)
                : `repo-${index + 1}`,
            label: item.label.trim().slice(0, 120),
            url: item.url.trim(),
            description:
              typeof item.description === 'string' && item.description.trim()
                ? item.description.trim().slice(0, 280)
                : 'Selected GitHub repository',
          },
        ];
      });
  }

  return {
    fullName,
    headline,
    location,
    availability,
    introBio,
    linkedinUrl,
    repos,
  };
}

function readStoredProfile(): CvProfileState {
  if (!fs.existsSync(PROFILE_FILE)) {
    return PORTFOLIO_PROFILE;
  }
  try {
    const raw = fs.readFileSync(PROFILE_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<CvProfileState>;
    return sanitizeStoredProfile(parsed);
  } catch {
    return PORTFOLIO_PROFILE;
  }
}

function readStoredPdfMeta(): UploadedPdfMeta | null {
  if (!fs.existsSync(CV_PDF_FILE)) {
    return null;
  }
  try {
    const stats = fs.statSync(CV_PDF_FILE);
    if (!stats.isFile() || stats.size <= 0) {
      return null;
    }
    if (fs.existsSync(CV_META_FILE)) {
      const raw = fs.readFileSync(CV_META_FILE, 'utf8');
      const parsed = JSON.parse(raw) as Partial<UploadedPdfMeta>;
      if (typeof parsed.fileName === 'string' && parsed.fileName.trim()) {
        return {
          fileName: sanitizeFilename(parsed.fileName),
          sizeBytes: stats.size,
          uploadedAt:
            typeof parsed.uploadedAt === 'string'
              ? parsed.uploadedAt
              : stats.mtime.toISOString(),
        };
      }
    }
    return {
      fileName: 'cv.pdf',
      sizeBytes: stats.size,
      uploadedAt: stats.mtime.toISOString(),
    };
  } catch {
    return null;
  }
}

function extractBearerToken(req: Request): string {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return '';
  return header.slice('Bearer '.length).trim();
}

function isRequestAuthenticated(req: Request): boolean {
  const token = extractBearerToken(req);
  if (!token) return false;
  return verifySessionToken(token, SESSION_SECRET);
}

function requireOwnerAuth(req: Request, res: Response, next: NextFunction): void {
  if (!isRequestAuthenticated(req)) {
    res.status(401).json({ error: 'Owner authentication is required.' });
    return;
  }
  next();
}

async function startServer(): Promise<void> {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '6mb' }));

  app.use('/api', (_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/profile', (_req, res) => {
    res.json({
      profile: readStoredProfile(),
      pdfMeta: readStoredPdfMeta(),
    });
  });

  app.get('/api/cv.pdf', (_req, res) => {
    const meta = readStoredPdfMeta();
    if (!meta || !fs.existsSync(CV_PDF_FILE)) {
      res.status(404).json({ error: 'No CV PDF has been published yet.' });
      return;
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${meta.fileName}"`);
    res.sendFile(CV_PDF_FILE);
  });

  app.get('/api/auth/status', (req, res) => {
    res.json({
      authenticated: isRequestAuthenticated(req),
      setupRequired: isSetupRequired(),
    });
  });

  app.post('/api/auth/setup', (req, res) => {
    if (!isSetupRequired()) {
      res.status(409).json({ error: 'Owner access is already configured.' });
      return;
    }

    const body = req.body as { password?: unknown };
    const password = typeof body?.password === 'string' ? body.password : '';
    if (password.trim().length < 8 || password.length > 128) {
      res.status(400).json({
        error: 'Choose an owner password between 8 and 128 characters.',
      });
      return;
    }

    const { hash, salt } = hashPassword(password);
    const record: StoredAdminRecord = {
      hash,
      salt,
      createdAt: new Date().toISOString(),
    };
    writeJsonAtomic(ADMIN_FILE, record, 0o600);

    res.status(201).json({
      token: signSessionToken(SESSION_SECRET),
    });
  });

  app.post('/api/auth/login', (req, res) => {
    if (isSetupRequired()) {
      res.status(409).json({
        error: 'No owner password is configured yet. Complete initial setup first.',
      });
      return;
    }

    const body = req.body as { password?: unknown };
    const password = typeof body?.password === 'string' ? body.password : '';
    if (!password) {
      res.status(400).json({ error: 'Enter the owner password.' });
      return;
    }

    const envPassword = getEnvAdminPassword();
    let valid = false;
    if (envPassword) {
      valid = timingSafeEqualStrings(password, envPassword);
    } else {
      const record = readAdminRecord();
      if (record) {
        valid = verifyPassword(password, record.hash, record.salt);
      }
    }

    if (!valid) {
      res.status(401).json({ error: 'Incorrect owner password.' });
      return;
    }

    res.json({
      token: signSessionToken(SESSION_SECRET),
    });
  });

  app.put('/api/profile', requireOwnerAuth, (req, res) => {
    const body = req.body as Partial<CvProfileState>;
    if (!body || typeof body !== 'object') {
      res.status(400).json({ error: 'Profile payload is required.' });
      return;
    }

    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
    const headline = typeof body.headline === 'string' ? body.headline.trim() : '';
    const location = typeof body.location === 'string' ? body.location.trim() : '';
    const availability =
      typeof body.availability === 'string' ? body.availability.trim() : '';
    const introBio = typeof body.introBio === 'string' ? body.introBio.trim() : '';

    const introValidation = validateIntroFields({ fullName, headline, introBio });
    if (!introValidation.valid) {
      const firstError =
        introValidation.errors.fullName ||
        introValidation.errors.headline ||
        introValidation.errors.introBio ||
        'Invalid profile introduction fields.';
      res.status(400).json({ error: firstError });
      return;
    }

    const linkedinCheck = normalizeLinkedinUrl(
      typeof body.linkedinUrl === 'string' ? body.linkedinUrl : ''
    );
    if (!linkedinCheck.valid || !linkedinCheck.url) {
      res.status(400).json({ error: linkedinCheck.error || 'Invalid LinkedIn URL.' });
      return;
    }

    if (!Array.isArray(body.repos)) {
      res.status(400).json({ error: 'Repositories list must be an array.' });
      return;
    }

    const validatedRepos: CuratedGithubRepo[] = [];
    for (let index = 0; index < Math.min(body.repos.length, 12); index += 1) {
      const item = body.repos[index];
      if (!item || typeof item !== 'object') {
        res.status(400).json({ error: 'Invalid repository entry.' });
        return;
      }
      const parsed = parseGithubRepoInput({
        repoOrUrl: typeof item.url === 'string' && item.url ? item.url : String(item.label || ''),
        description: typeof item.description === 'string' ? item.description : '',
      });
      if (!parsed.valid || !parsed.repo) {
        if (
          typeof item.label === 'string' &&
          item.label.trim() &&
          typeof item.url === 'string' &&
          isSafeHttpUrl(item.url)
        ) {
          validatedRepos.push({
            id:
              typeof item.id === 'string' && item.id.trim()
                ? item.id.trim().slice(0, 80)
                : `repo-${index + 1}`,
            label: item.label.trim().slice(0, 120),
            url: item.url.trim(),
            description:
              typeof item.description === 'string' && item.description.trim()
                ? item.description.trim().slice(0, 280)
                : 'Selected GitHub repository',
          });
          continue;
        }
        res.status(400).json({ error: parsed.error || 'Invalid repository URL.' });
        return;
      }

      validatedRepos.push({
        id:
          typeof item.id === 'string' && item.id.trim()
            ? item.id.trim().slice(0, 80)
            : `repo-${crypto.randomUUID().slice(0, 8)}`,
        label: parsed.repo.label,
        url: parsed.repo.url,
        description: parsed.repo.description,
      });
    }

    const updated: CvProfileState = {
      fullName: fullName.slice(0, 120),
      headline: headline.slice(0, 160),
      location: (location || PORTFOLIO_PROFILE.location).slice(0, 120),
      availability: (availability || PORTFOLIO_PROFILE.availability).slice(0, 120),
      introBio: introBio.slice(0, 1200),
      linkedinUrl: linkedinCheck.url,
      repos: validatedRepos,
    };

    writeJsonAtomic(PROFILE_FILE, updated);
    res.json({ profile: updated });
  });

  app.post('/api/cv', requireOwnerAuth, (req, res) => {
    const body = req.body as {
      fileName?: unknown;
      contentType?: unknown;
      size?: unknown;
      dataBase64?: unknown;
    };

    const fileName = sanitizeFilename(typeof body?.fileName === 'string' ? body.fileName : '');
    const contentType =
      typeof body?.contentType === 'string' ? body.contentType : 'application/pdf';
    const declaredSize = typeof body?.size === 'number' ? body.size : 0;

    const metaCheck = validatePdfFileMeta({
      name: fileName,
      type: contentType,
      size: declaredSize,
    });
    if (!metaCheck.valid) {
      res.status(400).json({ error: metaCheck.error || 'Invalid PDF file metadata.' });
      return;
    }

    if (typeof body?.dataBase64 !== 'string' || !body.dataBase64.trim()) {
      res.status(400).json({ error: 'PDF content is required.' });
      return;
    }

    const cleanedBase64 = body.dataBase64.replace(/^data:application\/pdf;base64,/i, '').trim();
    const buffer = Buffer.from(cleanedBase64, 'base64');

    if (buffer.length <= 0 || buffer.length > MAX_CV_PDF_BYTES) {
      res.status(400).json({ error: 'PDF size exceeds the 3.50 MB upload limit.' });
      return;
    }

    if (!isPdfMagicHeader(new Uint8Array(buffer.subarray(0, 8)))) {
      res.status(400).json({
        error: 'Uploaded file is not a valid PDF document (missing %PDF- signature).',
      });
      return;
    }

    const pdfMeta: UploadedPdfMeta = {
      fileName,
      sizeBytes: buffer.length,
      uploadedAt: new Date().toISOString(),
    };

    writeFileAtomic(CV_PDF_FILE, buffer);
    writeJsonAtomic(CV_META_FILE, pdfMeta);

    res.status(201).json({ pdfMeta });
  });

  app.delete('/api/cv', requireOwnerAuth, (_req, res) => {
    if (fs.existsSync(CV_PDF_FILE)) {
      fs.unlinkSync(CV_PDF_FILE);
    }
    if (fs.existsSync(CV_META_FILE)) {
      fs.unlinkSync(CV_META_FILE);
    }
    res.json({ ok: true });
  });

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API route not found.' });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    const indexHtml = resolveConfinedPath(distDir, 'index.html');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(indexHtml);
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`Portfolio server running on http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
