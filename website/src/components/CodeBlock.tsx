import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  filename: string;
  language: string;
  code: string;
}

export function CodeBlock({ filename, language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API may be unavailable in restricted contexts; fall back cleanly
      const textarea = document.createElement('textarea');
      textarea.value = code;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 text-zinc-100">
      <div className="flex items-center justify-between gap-4 px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/90">
        <div className="flex items-center gap-2 text-xs text-zinc-400 min-w-0">
          <span className="font-mono text-zinc-200 truncate">{filename}</span>
          <span aria-hidden="true">·</span>
          <span className="shrink-0">{language}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`Copy ${filename}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-zinc-400" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs leading-6 font-mono text-zinc-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}
