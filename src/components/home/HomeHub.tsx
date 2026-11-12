import React, { useMemo, useState } from 'react';
import {
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Search,
  ChevronDown,
  Layers,
  Cpu,
  Zap,
  Lock,
} from 'lucide-react';
import {
  STUDIO_TOOLS,
  FLAGSHIP_TOOLS,
  STUDIO_CATEGORIES,
  StudioCategory,
} from '../../config/toolCatalog.ts';
import { ToolPresetId } from '../../engine/state/types.ts';
import { getSEOEntryByPreset } from '../../seo/seoData.ts';

interface HomeHubProps {
  onSelectTool: (presetId: ToolPresetId) => void;
  onOpenBatch: () => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenAbout: () => void;
}

const COMPARISON_ROWS = [
  {
    feature: 'Photo Processing Location',
    category: 'Privacy & Architecture',
    everydayCut: '100% In-Browser RAM (0 bytes uploaded)',
    cloudTools: 'Uploaded & stored on remote cloud servers',
  },
  {
    feature: 'HD Downloads & Daily Limits',
    category: 'Pricing & Paywalls',
    everydayCut: '$0 Forever • Unlimited 4K Exports',
    cloudTools: 'Low-res preview or monthly credits paywall',
  },
  {
    feature: 'Government Portal Specs (PAN / Passport)',
    category: 'Exam & ID Portals',
    everydayCut: 'Exact 213×213 <30KB, 400×200 <20KB, 300 DPI',
    cloudTools: 'Requires manual cropping & external KB tools',
  },
  {
    feature: 'Bulk Batch Cutouts (.ZIP)',
    category: 'Workflow Speed',
    everydayCut: 'Unlimited parallel browser workers → ZIP',
    cloudTools: 'Locked behind paid Pro API plans',
  },
  {
    feature: 'Sensitive IDs (PAN, Passport, Aadhaar)',
    category: 'Compliance',
    everydayCut: 'Safe offline-capable PWA execution',
    cloudTools: 'Third-party server transmission risk',
  },
];

export const HomeHub: React.FC<HomeHubProps> = ({
  onSelectTool,
  onOpenBatch,
  onOpenPrivacy,
  onOpenTerms,
  onOpenAbout,
}) => {
  const [activeCategory, setActiveCategory] = useState<StudioCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return STUDIO_TOOLS.filter((tool) => {
      const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
      if (!matchesCategory) return false;
      if (!query) return true;
      return (
        tool.title.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.specPill.toLowerCase().includes(query) ||
        tool.categoryLabel.toLowerCase().includes(query)
      );
    });
  }, [activeCategory, searchQuery]);

  const handleCardClick = (e: React.MouseEvent, toolId: ToolPresetId) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    onSelectTool(toolId);
  };

  return (
    <div className="flex-1 w-full min-w-0 bg-stage text-zinc-900 dark:text-zinc-100">
      {/* 1. Top EverydayPDF-Style Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-5 shadow-xs">
          <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Zero Server Uploads &bull; 100% In-Browser Privacy</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12] max-w-4xl mx-auto">
          Every photo &amp; ID tool you need,{' '}
          <span className="text-emerald-600 dark:text-emerald-400 block sm:inline">
            100% inside your browser.
          </span>
        </h1>

        <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Remove backgrounds, resize PAN &amp; Passport photos under exact KB limits, erase unwanted objects, and stage e-commerce listings without uploading a single byte to any cloud server.
        </p>

        {/* Zero-Knowledge Engine Trust Card */}
        <div className="mt-7 max-w-3xl mx-auto rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-500/30 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                <span>EverydayCut Zero-Knowledge Engine</span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                  WebGPU / WASM
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                Zero bytes leave your device. Your photos and official documents stay in volatile browser RAM and vanish on page refresh.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={() => document.getElementById('studio-catalog')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex-1 sm:flex-none min-h-[44px] px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <span>Browse {STUDIO_TOOLS.length} Tools</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onOpenBatch}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:border-brand-500 text-slate-800 dark:text-zinc-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-brand-500" />
              <span>Batch ZIP</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Flagship High-Intent Portal & AI Tools Showcase */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block">
              Most Popular Free Tools
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              High-Intent Photo &amp; Government Portal Suite
            </h2>
          </div>
          <a
            href="#studio-catalog"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('studio-catalog')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
          >
            <span>See all {STUDIO_TOOLS.length} tools</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FLAGSHIP_TOOLS.map((tool) => {
            const seo = getSEOEntryByPreset(tool.id);
            return (
              <a
                key={tool.id}
                href={`/${seo.slug}`}
                onClick={(e) => handleCardClick(e, tool.id)}
                className="p-4 rounded-2xl bg-panel border border-borderDark hover:border-brand-500 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400 group-hover:scale-105 transition-transform">
                      <tool.icon className="w-4 h-4" />
                    </div>
                    {tool.badgeText && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tool.pillColor}`}>
                        {tool.badgeText}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed line-clamp-3">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                  <span>{tool.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* 3. Full Categorized Tool Directory */}
      <section id="studio-catalog" className="max-w-6xl mx-auto px-4 sm:px-6 py-10 scroll-mt-20">
        <div className="text-center mb-6">
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-1">
            Complete Studio Directory
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            All {STUDIO_TOOLS.length} Free Client-Side Tools
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1 max-w-xl mx-auto">
            Click any tool to open its dedicated workspace, preset dimensions, and exact KB compression engine.
          </p>
        </div>

        {/* Search & Category Controls */}
        <div className="max-w-xl mx-auto mb-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search all ${STUDIO_TOOLS.length} tools (e.g. PAN, Passport, Amazon, Eraser, Compress)...`}
            aria-label="Search studio tools"
            className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl bg-panel border border-borderDark text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
          />
        </div>

        <div className="flex items-center justify-center flex-wrap gap-2 mb-7">
          {STUDIO_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-brand-500 text-black shadow-sm'
                  : 'bg-panel border border-borderDark text-slate-700 dark:text-zinc-300 hover:border-brand-500/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {filteredTools.length === 0 ? (
          <div className="text-center py-12 bg-panel rounded-2xl border border-borderDark">
            <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
              No tools matched "{searchQuery}"
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="mt-3 min-h-[44px] px-4 py-2 rounded-lg bg-brand-500 text-black text-xs font-bold cursor-pointer"
            >
              Show All {STUDIO_TOOLS.length} Tools
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.map((tool) => {
              const seo = getSEOEntryByPreset(tool.id);
              return (
                <a
                  key={tool.id}
                  href={`/${seo.slug}`}
                  onClick={(e) => handleCardClick(e, tool.id)}
                  className="p-5 rounded-2xl bg-panel border border-borderDark hover:border-brand-500 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400 group-hover:scale-105 transition-transform">
                        <tool.icon className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${tool.pillColor}`}>
                        {tool.specPill}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5 flex-wrap">
                      <span>{tool.title}</span>
                      <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500">
                        &bull; {tool.categoryLabel}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>

                  <div className="w-full mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-all">
                    <span>{tool.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. EverydayPDF-Style Factual Platform Comparison Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs font-semibold mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>Factual Platform Comparison</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Why EverydayCut? See How We Compare
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1.5 max-w-xl mx-auto">
            Built with client-side WebAssembly and HTML5 Canvas so you never hit upload queues, watermarks, or privacy leaks.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-borderDark bg-panel shadow-sm">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-borderDark bg-zinc-50 dark:bg-zinc-900/60">
                <th className="p-4 font-bold text-slate-700 dark:text-zinc-300">Feature &amp; Capability</th>
                <th className="p-4 font-bold text-emerald-700 dark:text-emerald-400">EverydayCut (Client-Side)</th>
                <th className="p-4 font-bold text-slate-500 dark:text-zinc-400">Typical Cloud Tools</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderDark">
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.feature} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/30 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{row.feature}</div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 mt-0.5">
                      {row.category}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{row.everydayCut}</span>
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 dark:text-zinc-400">
                    <span className="inline-flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{row.cloudTools}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. EverydayPDF-Style Multi-Column SEO Footer */}
      <footer className="border-t border-borderDark bg-panel/70 mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-xs">
          <div className="space-y-3">
            <div className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-500" />
              <span>EverydayCut Studio</span>
            </div>
            <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
              The 100% free, client-side photo, ID &amp; e-commerce image suite. Engineered for instant browser speed and zero-upload document privacy.
            </p>
            <a
              href="https://everydaypdf.me"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Companion Suite: EverydayPDF.me →</span>
            </a>
          </div>

          <div className="space-y-2.5">
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              ID &amp; Portal Utilities
            </h3>
            <ul className="space-y-2 text-slate-600 dark:text-zinc-400">
              {STUDIO_TOOLS.filter((t) => t.category === 'documents' || t.id === 'converter' || t.id === 'crop').map((t) => {
                const seo = getSEOEntryByPreset(t.id);
                return (
                  <li key={t.id}>
                    <a
                      href={`/${seo.slug}`}
                      onClick={(e) => handleCardClick(e, t.id)}
                      className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                    >
                      {t.title}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="space-y-2.5">
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              AI Cutout, E-Commerce &amp; Social
            </h3>
            <ul className="space-y-2 text-slate-600 dark:text-zinc-400">
              {STUDIO_TOOLS.filter((t) => t.category === 'ecommerce' || t.id === 'cutout' || t.id === 'eraser' || t.id === 'upscale' || t.id === 'batch').map((t) => {
                const seo = getSEOEntryByPreset(t.id);
                return (
                  <li key={t.id}>
                    <a
                      href={`/${seo.slug}`}
                      onClick={(e) => handleCardClick(e, t.id)}
                      className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                    >
                      {t.title}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-2">
              Legal, Privacy &amp; Trust
            </h3>
            <div className="flex flex-col items-start">
              <button
                type="button"
                onClick={onOpenAbout}
                className="min-h-[44px] py-2 text-left text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                About EverydayCut Architecture
              </button>
              <button
                type="button"
                onClick={onOpenPrivacy}
                className="min-h-[44px] py-2 text-left text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Privacy Policy (Zero Data Retention)
              </button>
              <button
                type="button"
                onClick={onOpenTerms}
                className="min-h-[44px] py-2 text-left text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Terms of Service
              </button>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event('everydaycut:open-cookie-settings'))}
                className="min-h-[44px] py-2 text-left text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Privacy &amp; Cookie Settings
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-borderDark/70 py-4 px-4 text-center text-[11px] text-slate-500 dark:text-zinc-500">
          &copy; 2026 EverydayCut &bull; Part of the EverydayPDF 100% Client-Side Privacy Ecosystem &bull; Runs Locally via WebGPU &amp; WASM
        </div>
      </footer>
    </div>
  );
};
