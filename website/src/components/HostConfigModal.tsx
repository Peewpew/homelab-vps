import { FormEvent, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import {
  DEFAULT_HOST_CONFIG,
  HostConfig,
  ValidationErrors,
  validateHostConfig,
} from '../utils/devopsGenerators';

interface HostConfigModalProps {
  isOpen: boolean;
  config: HostConfig;
  onSave: (nextConfig: HostConfig) => void;
  onClose: () => void;
}

export function HostConfigModal({
  isOpen,
  config,
  onSave,
  onClose,
}: HostConfigModalProps) {
  const [draft, setDraft] = useState<HostConfig>(config);
  const [portInput, setPortInput] = useState<string>(String(config.appPort));
  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (isOpen) {
      setDraft(config);
      setPortInput(String(config.appPort));
      setErrors({});
    }
  }, [isOpen, config]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const parsedPort = Number(portInput);
    const candidate: HostConfig = {
      ...draft,
      appPort: Number.isFinite(parsedPort) ? parsedPort : -1,
    };

    const result = validateHostConfig(candidate);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }

    onSave({
      ...candidate,
      engineerName: candidate.engineerName.trim(),
      roleTitle: candidate.roleTitle.trim(),
      vpsIp: candidate.vpsIp.trim(),
      vpsUser: candidate.vpsUser.trim(),
      sshAlias: candidate.sshAlias.trim(),
      domain: candidate.domain.trim(),
      githubUser: candidate.githubUser.trim(),
      repoName: candidate.repoName.trim(),
      branch: candidate.branch.trim(),
    });
    onClose();
  };

  const handleResetDefaults = () => {
    setDraft(DEFAULT_HOST_CONFIG);
    setPortInput(String(DEFAULT_HOST_CONFIG.appPort));
    setErrors({});
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="host-config-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-zinc-200 rounded-2xl shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-6 border-b border-zinc-200">
          <div className="space-y-1">
            <h2
              id="host-config-title"
              className="font-display text-xl font-bold tracking-tight text-zinc-950"
            >
              Configure Contabo Host &amp; GitHub Repository
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600">
              Values update your portfolio header, PowerShell cleanup commands, SSH config, and
              Nginx blocks in real time.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close host configuration"
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-zinc-200 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="cfg-engineerName" className="block text-xs font-medium text-zinc-800">
                Engineer Name
              </label>
              <input
                id="cfg-engineerName"
                type="text"
                value={draft.engineerName}
                onChange={(e) => setDraft({ ...draft, engineerName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-2 focus:outline-blue-600"
              />
              {errors.engineerName && (
                <p className="text-xs text-red-600">{errors.engineerName}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cfg-roleTitle" className="block text-xs font-medium text-zinc-800">
                Role Title
              </label>
              <input
                id="cfg-roleTitle"
                type="text"
                value={draft.roleTitle}
                onChange={(e) => setDraft({ ...draft, roleTitle: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-2 focus:outline-blue-600"
              />
              {errors.roleTitle && <p className="text-xs text-red-600">{errors.roleTitle}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cfg-vpsIp" className="block text-xs font-medium text-zinc-800">
                Contabo VPS IP / Hostname
              </label>
              <input
                id="cfg-vpsIp"
                type="text"
                value={draft.vpsIp}
                onChange={(e) => setDraft({ ...draft, vpsIp: e.target.value })}
                className="w-full px-3 py-2 text-sm font-mono border border-zinc-300 rounded-lg focus:outline-2 focus:outline-blue-600"
              />
              {errors.vpsIp && <p className="text-xs text-red-600">{errors.vpsIp}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cfg-vpsUser" className="block text-xs font-medium text-zinc-800">
                Ubuntu SSH User
              </label>
              <input
                id="cfg-vpsUser"
                type="text"
                value={draft.vpsUser}
                onChange={(e) => setDraft({ ...draft, vpsUser: e.target.value })}
                className="w-full px-3 py-2 text-sm font-mono border border-zinc-300 rounded-lg focus:outline-2 focus:outline-blue-600"
              />
              {errors.vpsUser && <p className="text-xs text-red-600">{errors.vpsUser}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cfg-sshAlias" className="block text-xs font-medium text-zinc-800">
                VSCode SSH Host Alias
              </label>
              <input
                id="cfg-sshAlias"
                type="text"
                value={draft.sshAlias}
                onChange={(e) => setDraft({ ...draft, sshAlias: e.target.value })}
                className="w-full px-3 py-2 text-sm font-mono border border-zinc-300 rounded-lg focus:outline-2 focus:outline-blue-600"
              />
              {errors.sshAlias && <p className="text-xs text-red-600">{errors.sshAlias}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cfg-domain" className="block text-xs font-medium text-zinc-800">
                Public Domain
              </label>
              <input
                id="cfg-domain"
                type="text"
                value={draft.domain}
                onChange={(e) => setDraft({ ...draft, domain: e.target.value })}
                className="w-full px-3 py-2 text-sm font-mono border border-zinc-300 rounded-lg focus:outline-2 focus:outline-blue-600"
              />
              {errors.domain && <p className="text-xs text-red-600">{errors.domain}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cfg-githubUser" className="block text-xs font-medium text-zinc-800">
                GitHub Username
              </label>
              <input
                id="cfg-githubUser"
                type="text"
                value={draft.githubUser}
                onChange={(e) => setDraft({ ...draft, githubUser: e.target.value })}
                className="w-full px-3 py-2 text-sm font-mono border border-zinc-300 rounded-lg focus:outline-2 focus:outline-blue-600"
              />
              {errors.githubUser && <p className="text-xs text-red-600">{errors.githubUser}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cfg-repoName" className="block text-xs font-medium text-zinc-800">
                GitHub Repository Name
              </label>
              <input
                id="cfg-repoName"
                type="text"
                value={draft.repoName}
                onChange={(e) => setDraft({ ...draft, repoName: e.target.value })}
                className="w-full px-3 py-2 text-sm font-mono border border-zinc-300 rounded-lg focus:outline-2 focus:outline-blue-600"
              />
              {errors.repoName && <p className="text-xs text-red-600">{errors.repoName}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cfg-branch" className="block text-xs font-medium text-zinc-800">
                Default Branch
              </label>
              <input
                id="cfg-branch"
                type="text"
                value={draft.branch}
                onChange={(e) => setDraft({ ...draft, branch: e.target.value })}
                className="w-full px-3 py-2 text-sm font-mono border border-zinc-300 rounded-lg focus:outline-2 focus:outline-blue-600"
              />
              {errors.branch && <p className="text-xs text-red-600">{errors.branch}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cfg-appPort" className="block text-xs font-medium text-zinc-800">
                Upstream App Port
              </label>
              <input
                id="cfg-appPort"
                type="number"
                value={portInput}
                onChange={(e) => setPortInput(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono border border-zinc-300 rounded-lg focus:outline-2 focus:outline-blue-600"
              />
              {errors.appPort && <p className="text-xs text-red-600">{errors.appPort}</p>}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3.5 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-950 rounded-lg"
            >
              Reset Defaults
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
