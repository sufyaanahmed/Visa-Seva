import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Loader from './components/Loader';
import VisaAssistant from './components/VisaAssistant';
import { useStore, isMeaningfulDraft } from './store';
import Home from './pages/Home';
const Applications = lazy(() => import('./platform/Applications'));
const ApplicationDetail = lazy(() => import('./platform/Applications').then(m => ({ default: m.ApplicationDetail })));
const Checkout = lazy(() => import('./platform/Applications').then(m => ({ default: m.Checkout })));
const Assistants = lazy(() => import('./platform/Assistants'));
const AssistantConsent = lazy(() => import('./platform/Assistants').then(m => ({ default: m.AssistantConsent })));
const MagicLink = lazy(() => import('./platform/MagicLink'));
const Admin = lazy(() => import('./platform/Admin'));
const isAdminHost = import.meta.env.VITE_APP_ROLE === 'admin' || window.location.hostname === (import.meta.env.VITE_ADMIN_HOST || 'admin.localhost');

const Wizard = lazy(() => import('./pages/Wizard'));
const Status = lazy(() => import('./pages/Status'));
const EArrival = lazy(() => import('./pages/EArrival'));
const Resume = lazy(() => import('./pages/Resume'));
const Help = lazy(() => import('./pages/Help'));
const AIAssistants = lazy(() => import('./pages/AIAssistants'));
const Tourism = lazy(() => import('./pages/Tourism'));
const AfghanFlow = lazy(() => import('./pages/flows/AfghanFlow'));
const VoaFlow = lazy(() => import('./pages/flows/VoaFlow'));
const NormalFlow = lazy(() => import('./pages/flows/NormalFlow'));
const RegularFlow = lazy(() => import('./pages/flows/RegularFlow'));
const VisaFinder = lazy(() => import('./pages/guide/VisaFinder'));
const OciGuidance = lazy(() => import('./pages/guide/OciGuidance'));
const UnescoSites = lazy(() => import('./pages/guide/UnescoSites'));
const NationalParks = lazy(() => import('./pages/guide/NationalParks'));
const NaturalWonders = lazy(() => import('./pages/guide/NaturalWonders'));
const SpiritualHeritage = lazy(() => import('./pages/guide/SpiritualHeritage'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const Reviews = lazy(() => import('./pages/Reviews'));
const NotFound = lazy(() => import('./pages/NotFound'));

const Header = () => {
  const { state } = useStore();
  const hasDraft = isMeaningfulDraft(state);
  const location = useLocation();
  const pathname = location.pathname;
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);
  const [textZoom, setTextZoom] = useState(100);
  const [highContrast, setHighContrast] = useState(false);
  const [highlightLinks, setHighlightLinks] = useState(false);
  const [readAloud, setReadAloud] = useState(false);

  useEffect(() => {
    if (!readAloud) {
      window.speechSynthesis?.cancel();
      return;
    }

    const handleMouseOver = (e) => {
      const target = e.target;
      if (['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'A', 'BUTTON', 'SPAN', 'LABEL'].includes(target.tagName)) {
        const text = target.innerText || target.textContent;
        if (text && text.trim().length > 0) {
          window.speechSynthesis?.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          window.speechSynthesis?.speak(utterance);
        }
      }
    };

    document.body.addEventListener('mouseover', handleMouseOver);
    return () => {
      document.body.removeEventListener('mouseover', handleMouseOver);
      window.speechSynthesis?.cancel();
    };
  }, [readAloud]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = `${textZoom}%`;
    root.classList.toggle('high-contrast', highContrast);
    root.classList.toggle('highlight-links', highlightLinks);
    return () => {
      root.style.fontSize = '';
      root.classList.remove('high-contrast', 'highlight-links');
    };
  }, [textZoom, highContrast, highlightLinks]);

  const isApplyActive = pathname === '/apply' || pathname.startsWith('/guide/visa-finder') || pathname.startsWith('/dashboard') || pathname.startsWith('/flow') || pathname.startsWith('/guide/oci') || pathname.startsWith('/e-arrival');
  const isStatusActive = pathname.startsWith('/status') || pathname.startsWith('/applications') || pathname === '/resume';
  const isTourismActive = pathname.startsWith('/tourism') || pathname.startsWith('/unesco-sites') || pathname.startsWith('/national-parks') || pathname.startsWith('/natural-wonders') || pathname.startsWith('/spiritual-heritage');
  const isHelpActive = pathname.startsWith('/help') || pathname.startsWith('/faq');
  const isAssistantsActive = pathname.startsWith('/ai-assistants');

  const navItems = [
    {
      label: 'Apply',
      to: hasDraft ? '/dashboard' : '/guide/visa-finder',
      active: isApplyActive,
    },
    {
      label: 'My applications',
      to: '/status',
      active: isStatusActive,
    },
    {
      label: 'Discover India',
      to: '/tourism',
      active: isTourismActive,
    },
    {
      label: 'Help',
      to: '/help',
      active: isHelpActive,
    },
    {
      label: 'Use with AI',
      to: '/ai-assistants',
      active: isAssistantsActive,
    },
  ];

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="relative z-50 border-b border-[#E6DFD3] bg-[#FAF7F0] print:hidden">
      <div className="mx-auto flex min-h-[104px] w-full max-w-[1200px] flex-wrap items-center gap-4 px-4 py-4 sm:px-6 lg:flex-nowrap">
        <Link to="/" className="group mr-auto flex shrink-0 items-center gap-3 font-serif text-[1.2rem] text-primary no-underline sm:gap-4 sm:text-[1.4rem] md:text-2xl" aria-label="India Visa Seva home">
          <span className="grid h-[48px] w-[48px] shrink-0 place-items-center sm:h-[56px] sm:w-[56px]" aria-hidden="true">
            <img src="/emblem.svg" alt="" className="h-10 w-auto opacity-90 drop-shadow-sm sm:h-14" />
          </span>
          <span className="flex flex-col border-l border-border pl-3 leading-tight sm:pl-4">
            <span className="mb-1 font-sans text-[0.6rem] font-bold uppercase tracking-[0.2em] text-secondary-accent sm:text-[0.65rem]">Independent prototype</span>
            <span className="font-bold text-primary-dark">India Visa Seva</span>
          </span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-4 lg:flex xl:gap-6">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`relative py-1.5 font-sans text-[0.85rem] uppercase tracking-wider transition-colors duration-200 group ${
                item.active ? 'text-primary-dark font-bold' : 'text-text font-medium hover:text-secondary-accent'
              }`}
            >
              <span>{item.label}</span>
              {item.active ? (
                <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#D4AF37] rounded-full animate-fadeIn" />
              ) : (
                <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-transparent group-hover:bg-[#D4AF37]/30 rounded-full transition-colors" />
              )}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setAccessibilityOpen((open) => !open)}
              className="flex h-[38px] items-center gap-2 rounded-lg border border-[#E6DFD3] bg-white px-3.5 font-sans font-medium text-[0.85rem] uppercase tracking-wider text-text shadow-xs transition-colors hover:bg-[#FAF7F0] hover:text-secondary-accent focus:outline-none focus:ring-2 focus:ring-[#D4AF37] cursor-pointer"
              aria-controls="accessibility-options"
              aria-expanded={accessibilityOpen}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-text/70" fill="currentColor" aria-hidden="true">
                <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z" />
              </svg>
              <span className="hidden sm:inline">Accessibility</span>
            </button>

            {accessibilityOpen && (
              <div id="accessibility-options" className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-xl border border-[#E6DFD3] bg-white py-2 text-text shadow-xl font-sans" aria-label="Accessibility options">
                <div className="border-b border-[#E6DFD3] bg-[#FAF7F0] px-4 py-2 font-sans text-[0.7rem] font-bold uppercase tracking-widest text-text/70">Display settings</div>
                <div className="px-4 py-3">
                  <p className="mb-2 font-sans text-xs font-bold text-text/80 uppercase tracking-wider">Text size</p>
                  <div className="flex items-center justify-between border border-[#E6DFD3] rounded-lg overflow-hidden shadow-xs">
                    <button type="button" onClick={() => setTextZoom(Math.max(80, textZoom - 10))} className="px-4 py-2 bg-[#FAF7F0] hover:bg-white text-text font-bold transition-colors focus:outline-none cursor-pointer" aria-label="Decrease text size">−</button>
                    <span className="font-sans text-xs font-bold w-12 text-center text-text">{textZoom}%</span>
                    <button type="button" onClick={() => setTextZoom(Math.min(150, textZoom + 10))} className="px-4 py-2 bg-[#FAF7F0] hover:bg-white text-text font-bold transition-colors focus:outline-none cursor-pointer" aria-label="Increase text size">+</button>
                  </div>
                </div>
                <button type="button" aria-pressed={highContrast} onClick={() => setHighContrast((value) => !value)} className="flex w-full items-center justify-between px-4 py-3 text-left font-sans text-xs font-medium uppercase tracking-wider transition-colors hover:bg-[#FAF7F0] border-t border-[#E6DFD3] cursor-pointer">
                  <span>High contrast</span> {highContrast && <span className="font-bold text-[#00875f]">On</span>}
                </button>
                <button type="button" aria-pressed={highlightLinks} onClick={() => setHighlightLinks((value) => !value)} className="flex w-full items-center justify-between px-4 py-3 text-left font-sans text-xs font-medium uppercase tracking-wider transition-colors hover:bg-[#FAF7F0] border-t border-[#E6DFD3] cursor-pointer">
                  <span>Highlight links</span> {highlightLinks && <span className="font-bold text-[#00875f]">On</span>}
                </button>
                <button type="button" aria-pressed={readAloud} onClick={() => setReadAloud((value) => !value)} className="flex w-full items-center justify-between px-4 py-3 text-left font-sans text-xs font-medium uppercase tracking-wider transition-colors hover:bg-[#FAF7F0] border-t border-[#E6DFD3] cursor-pointer">
                  <span>Read aloud on hover</span> {readAloud && <span className="font-bold text-[#00875f]">On</span>}
                </button>
              </div>
            )}
          </div>

          <button type="button" className="flex items-center justify-center p-2 text-primary focus:outline-none focus:ring-2 focus:ring-[#D4AF37] lg:hidden" onClick={() => setMenuOpen((open) => !open)} aria-controls="mobile-navigation" aria-expanded={menuOpen} aria-label="Toggle navigation menu">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-navigation" aria-label="Mobile navigation" className="absolute left-0 z-40 flex w-full flex-col border-t border-gray-100 bg-white px-6 py-4 shadow-xl lg:hidden">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={closeMenu}
              className={`border-b border-gray-100 py-3 font-sans text-[0.95rem] uppercase tracking-wider flex items-center justify-between transition-colors ${
                item.active ? 'text-secondary-accent font-bold' : 'text-text font-medium hover:text-secondary-accent'
              }`}
            >
              <span>{item.label}</span>
              {item.active && <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};

const Footer = () => (
  <footer className="relative bg-[#111A31] pt-20 pb-12 text-[#FAF7F0] overflow-hidden border-t-4 border-[#D4AF37] print:hidden">
    <div className="mx-auto max-w-6xl px-6 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-16">
        
        {/* Brand Section */}
        <div className="md:col-span-5 lg:col-span-4 flex flex-col items-start">
          <div className="flex items-center gap-3 mb-6">
            <img src="/emblem.svg" alt="" className="w-10 h-10 opacity-90 drop-shadow-[0_2px_8px_rgba(212,175,55,0.25)]" style={{ filter: 'brightness(0) saturate(100%) invert(88%) sepia(21%) saturate(1210%) hue-rotate(345deg) brightness(91%) contrast(85%)' }} />
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold tracking-wide text-white">India Visa Seva</span>
            </div>
          </div>
        </div>

        {/* Links: Services */}
        <div className="md:col-span-3 lg:col-span-2 lg:col-start-7">
          <h3 className="mb-6 font-sans text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">Services</h3>
          <ul className="flex flex-col gap-4 font-sans text-sm text-white/70">
            <li><Link to="/guide/visa-finder" className="transition-all hover:text-white hover:translate-x-1 inline-block">Find Visa Route</Link></li>
            <li><Link to="/status" className="transition-all hover:text-white hover:translate-x-1 inline-block">Check Status</Link></li>
            <li><Link to="/e-arrival" className="transition-all hover:text-white hover:translate-x-1 inline-block">e-Arrival Guidance</Link></li>
            <li><Link to="/guide/oci" className="transition-all hover:text-white hover:translate-x-1 inline-block text-[#D4AF37]">OCI Card Guide</Link></li>
          </ul>
        </div>

        {/* Links: Resources */}
        <div className="md:col-span-4 lg:col-span-2 lg:col-start-10">
          <h3 className="mb-6 font-sans text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">Resources</h3>
          <ul className="flex flex-col gap-4 font-sans text-sm text-white/70">
            <li><Link to="/tourism" className="transition-all hover:text-white hover:translate-x-1 inline-block">Discover India</Link></li>
            <li><Link to="/help" className="transition-all hover:text-white hover:translate-x-1 inline-block">Help & FAQ</Link></li>
            <li><Link to="/reviews" className="transition-all hover:text-white hover:translate-x-1 inline-block">Public Reviews</Link></li>
            <li><Link to="/ai-assistants" className="transition-all hover:text-white hover:translate-x-1 inline-block">Use with ChatGPT or Claude</Link></li>
            <li><Link to="/admin" className="transition-all hover:text-white hover:translate-x-1 inline-block text-[#D4AF37]/90 font-medium">Consular Officer Login</Link></li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs text-white/40">
        <p>&copy; {new Date().getFullYear()} India Visa Seva. All rights reserved.</p>
        <Link to="/admin" className="hover:text-white/80 transition-colors">Admin Portal</Link>
      </div>
    </div>
  </footer>
);

export default function App() {
  if (isAdminHost) return <Suspense fallback={<Loader />}><Admin /></Suspense>;

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF7F0] font-sans text-text print:bg-white">
      <ScrollToTop />
      <Header />

      <main id="main-content" className="w-full flex-1">
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/flow/afghan" element={<AfghanFlow />} />
            <Route path="/flow/voa" element={<VoaFlow />} />
            <Route path="/flow/normal" element={<NormalFlow />} />
            <Route path="/flow/regular" element={<RegularFlow />} />
            <Route path="/guide/visa-finder" element={<VisaFinder />} />
            <Route path="/guide/oci" element={<OciGuidance />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/status" element={<Status />} />
            <Route path="/auth/confirm" element={<MagicLink />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/applications/:id" element={<ApplicationDetail />} />
            <Route path="/applications/:id/checkout" element={<Checkout />} />
            <Route path="/assistants" element={<Assistants />} />
            <Route path="/assistant-consent" element={<AssistantConsent />} />
            <Route path="/e-arrival" element={<EArrival />} />
            <Route path="/resume" element={<Resume />} />
            <Route path="/help" element={<Help />} />
            <Route path="/ai-assistants" element={<AIAssistants />} />
            <Route path="/tourism" element={<Tourism />} />
            <Route path="/unesco-sites" element={<UnescoSites />} />
            <Route path="/national-parks" element={<NationalParks />} />
            <Route path="/natural-wonders" element={<NaturalWonders />} />
            <Route path="/spiritual-heritage" element={<SpiritualHeritage />} />
            <Route path="/apply" element={<Wizard />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <VisaAssistant />
    </div>
  );
}
