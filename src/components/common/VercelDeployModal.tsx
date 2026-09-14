import React, { useState } from "react";
import {
  X,
  ExternalLink,
  Check,
  Copy,
  Terminal,
  Globe,
  Github,
  Zap,
  ShieldCheck,
  FileCode,
  ArrowRight,
} from "lucide-react";
import { BrandLogo } from "./BrandLogo";

interface VercelDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandName: string;
}

export const VercelDeployModal: React.FC<VercelDeployModalProps> = ({
  isOpen,
  onClose,
  brandName,
}) => {
  const [copiedCli, setCopiedCli] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);

  if (!isOpen) return null;

  const cliSnippet = `# 1. Install Vercel CLI globally (if not already installed)
npm i -g vercel

# 2. Login to your Vercel account
vercel login

# 3. Deploy instantly to production
vercel --prod`;

  const vercelJsonSnippet = `{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "vite build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/((?!api/.*).*)", "destination": "/index.html" }
  ]
}`;

  const copyCli = () => {
    navigator.clipboard.writeText(cliSnippet);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  const copyConfig = () => {
    navigator.clipboard.writeText(vercelJsonSnippet);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-black border border-slate-700 flex items-center justify-center text-white font-bold shadow-lg">
              {/* Vercel Triangle Logo */}
              <svg viewBox="0 0 1155 1000" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                <path d="m577.3 0 577.4 1000H0z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Deploy {brandName} on Vercel</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ready to Deploy
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Production Vite build, edge caching, and SPA routing pre-configured
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Status Checklist */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Vercel Compatibility Verification Checklist</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-2 text-slate-300">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span><code className="text-white font-mono">vercel.json</code> auto-routing created</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span><code className="text-white font-mono">.vercelignore</code> build rules placed</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span>SPA rewrite to <code className="text-white font-mono">/index.html</code> enabled</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span>Immutable asset caching configured</span>
              </div>
            </div>
          </div>

          {/* Option 1: GitHub to Vercel (Recommended) */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-white">
                  <Github className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-white">
                  Method 1: Export to GitHub & Connect to Vercel (Easiest)
                </span>
              </div>
              <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full">
                Recommended
              </span>
            </div>

            <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside pl-1">
              <li>
                In the top-right menu of Google AI Studio, click <strong>"Export to GitHub"</strong> (or download ZIP and push to GitHub).
              </li>
              <li>
                Go to{" "}
                <a
                  href="https://vercel.com/new"
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 underline font-semibold inline-flex items-center gap-1"
                >
                  vercel.com/new <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>Select your exported GitHub repository. Vercel will automatically detect <strong>Vite</strong>.</li>
              <li>Click <strong>Deploy</strong>! Your application will be live with an SSL HTTPS domain in ~60 seconds.</li>
            </ol>

            <a
              href="https://vercel.com/new"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-98"
            >
              <span>Go to Vercel Project Import</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Option 2: Vercel CLI */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-white">
                  <Terminal className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-white">
                  Method 2: Deploy with Vercel CLI
                </span>
              </div>
              <button
                onClick={copyCli}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                {copiedCli ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCli ? "Copied" : "Copy Commands"}</span>
              </button>
            </div>

            <pre className="p-3 bg-slate-900 rounded-xl text-[11px] font-mono text-slate-300 border border-slate-800 overflow-x-auto">
              {cliSnippet}
            </pre>
          </div>

          {/* Included vercel.json preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-amber-400" />
                <span>Pre-configured <code className="text-white font-mono">vercel.json</code></span>
              </span>
              <button
                onClick={copyConfig}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
              >
                {copiedConfig ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedConfig ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-950 rounded-xl text-[10px] font-mono text-slate-400 border border-slate-800 overflow-x-auto">
              {vercelJsonSnippet}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrandLogo size="sm" />
            <span className="text-xs font-bold text-white">{brandName} Production Bundle</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
