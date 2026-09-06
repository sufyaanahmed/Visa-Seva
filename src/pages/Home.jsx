import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/hero-reveal.css';

/* ─────────────────────────────────────────────────────────────────────────────
   INLINE SVG ILLUSTRATION COMPONENTS
   All vectors are hand-crafted inspired by Indian art, wildlife & architecture.
───────────────────────────────────────────────────────────────────────────── */

/** Mughal Jali (lattice) tiling pattern */
function JaliPattern({ id = 'jali-hero', color = '#1E2A4F', opacity = 0.06 }) {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <pattern id={id} x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <circle cx="30" cy="30" r="28" fill="none" stroke={color} strokeWidth="0.6" opacity={opacity} />
          <circle cx="30" cy="30" r="18" fill="none" stroke={color} strokeWidth="0.4" opacity={opacity} />
          <circle cx="30" cy="30" r="8"  fill="none" stroke={color} strokeWidth="0.8" opacity={opacity} />
          <path d="M30 2 Q40 15 30 30 Q20 15 30 2Z" fill={color} fillOpacity={opacity * 0.6} />
          <path d="M30 58 Q40 45 30 30 Q20 45 30 58Z" fill={color} fillOpacity={opacity * 0.6} />
          <path d="M2 30 Q15 40 30 30 Q15 20 2 30Z" fill={color} fillOpacity={opacity * 0.6} />
          <path d="M58 30 Q45 40 30 30 Q45 20 58 30Z" fill={color} fillOpacity={opacity * 0.6} />
        </pattern>
      </defs>
    </svg>
  );
}

/** The visa's engraved geometry is shared by all three printed stars. */
const guillochePaths = Array.from({ length: 20 }, (_, i) => {
  const baseR = 4 + (i * 42 / 20);
  const points = Array.from({ length: 361 }, (_, degrees) => {
    const angle = (degrees * Math.PI) / 180;
    const radius = baseR * (1 + 0.15 * Math.cos(5 * angle)) + 1.2 * Math.sin(100 * angle);
    return `${50 + radius * Math.sin(angle)},${50 - radius * Math.cos(angle)}`;
  });
  return `M ${points.join(' L ')} Z`;
});

function GuillocheStar({ className }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" aria-hidden="true">
      {guillochePaths.map((path, i) => (
        <path key={i} d={path} strokeWidth={0.3} opacity={0.6} style={{ mixBlendMode: 'multiply' }} />
      ))}
    </svg>
  );
}

let heroRevealedThisRuntime = false;

function shouldRevealHero() {
  if (typeof window === 'undefined' || heroRevealedThisRuntime) return false;
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Royal Bengal Tiger Image */
function TigerIllustration({ className = '' }) {
  return (
    <div className={`overflow-hidden rounded-xl shadow-md ${className}`}>
      <img src="/tiger.jpg" alt="Royal Bengal Tiger" className="w-full h-auto" />
    </div>
  );
}

/** Peacock Image */
function PeacockIllustration({ className = '' }) {
  return (
    <div className={`overflow-hidden rounded-xl shadow-md ${className}`}>
      <img src="/peacock.jpg" alt="Peacock" className="w-full h-auto" />
    </div>
  );
}

/** Elephant Image */
function ElephantIllustration({ className = '' }) {
  return (
    <div className={`overflow-hidden rounded-xl shadow-md ${className}`}>
      <img src="/elephant.jpg" alt="Elephant" className="w-full h-auto" />
    </div>
  );
}





/** Mughal/Temple Arch - decorative frame */
function MughalArch({ className = '', color = '#1E2A4F', gold = '#D4AF37' }) {
  return (
    <svg viewBox="0 0 200 260" className={className} fill="none">
      {/* Columns */}
      <rect x="10" y="80" width="22" height="180" fill={color} fillOpacity="0.08" stroke={color} strokeWidth="1" strokeOpacity="0.2" />
      <rect x="168" y="80" width="22" height="180" fill={color} fillOpacity="0.08" stroke={color} strokeWidth="1" strokeOpacity="0.2" />
      {/* Column caps */}
      <path d="M8 80 Q21 65 34 80" stroke={gold} strokeWidth="2" fill="none" opacity="0.5" />
      <path d="M166 80 Q179 65 192 80" stroke={gold} strokeWidth="2" fill="none" opacity="0.5" />
      {/* Main arch - Mughal cusped shape */}
      <path d="M10 80 Q10 20 100 5 Q190 20 190 80 Q190 100 175 115 Q165 125 160 115 Q155 105 160 90 Q160 35 100 22 Q40 35 40 90 Q45 105 40 115 Q35 125 25 115 Q10 100 10 80Z"
        stroke={color} strokeWidth="1.5" strokeOpacity="0.25" fill={color} fillOpacity="0.04" />
      {/* Inner arch detail */}
      <path d="M30 82 Q30 38 100 24 Q170 38 170 82 Q170 96 162 106 Q158 112 155 106 Q152 100 157 88 Q157 44 100 32 Q43 44 43 88 Q48 100 45 106 Q42 112 38 106 Q30 96 30 82Z"
        stroke={gold} strokeWidth="1" strokeOpacity="0.3" fill="none" />
      {/* Keystone ornament */}
      <circle cx="100" cy="8" r="8" fill={gold} fillOpacity="0.25" stroke={gold} strokeWidth="1" strokeOpacity="0.5" />
      <circle cx="100" cy="8" r="4" fill={gold} fillOpacity="0.4" />
      {/* Spandrel floral */}
      <circle cx="30" cy="50" r="12" fill={gold} fillOpacity="0.07" stroke={gold} strokeWidth="0.8" strokeOpacity="0.3" />
      <circle cx="170" cy="50" r="12" fill={gold} fillOpacity="0.07" stroke={gold} strokeWidth="0.8" strokeOpacity="0.3" />
      {/* Base platform */}
      <rect x="5" y="258" width="190" height="6" rx="1" fill={color} fillOpacity="0.12" />
      <rect x="0" y="252" width="200" height="8" rx="1" fill={color} fillOpacity="0.08" stroke={color} strokeWidth="0.5" strokeOpacity="0.2" />
    </svg>
  );
}

function TempleGopuram({ className = '' }) {
  return (
    <svg viewBox="0 0 120 220" className={className} fill="none">
      {/* Main tower body tiers */}
      <rect x="35" y="180" width="50" height="40" fill="#8B1C1C" opacity="0.2" stroke="#8B1C1C" strokeWidth="1" />
      <rect x="38" y="158" width="44" height="26" fill="#8B1C1C" opacity="0.2" stroke="#8B1C1C" strokeWidth="0.8" />
      <rect x="42" y="138" width="36" height="24" fill="#8B1C1C" opacity="0.2" stroke="#8B1C1C" strokeWidth="0.8" />
      <rect x="46" y="120" width="28" height="22" fill="#8B1C1C" opacity="0.2" stroke="#8B1C1C" strokeWidth="0.8" />
      <rect x="50" y="104" width="20" height="20" fill="#8B1C1C" opacity="0.2" stroke="#8B1C1C" strokeWidth="0.8" />
      <rect x="53" y="90" width="14" height="18" fill="#8B1C1C" opacity="0.2" stroke="#8B1C1C" strokeWidth="0.8" />
      {/* Top finial */}
      <path d="M57 90 L60 70 L63 90Z" fill="#D4AF37" opacity="0.4" />
      <circle cx="60" cy="68" r="5" fill="#D4AF37" opacity="0.4" />
      <circle cx="60" cy="60" r="3" fill="#D4AF37" opacity="0.5" />
      {/* Arch at base */}
      <path d="M42 180 Q60 165 78 180" stroke="#8B1C1C" strokeWidth="1" fill="none" opacity="0.4" />
      {/* Small decorative bumps on each tier edge */}
      {[180, 158, 138, 120, 104].map((y, i) => (
        <g key={i}>
          <circle cx={38 - i * 4} cy={y} r="3" fill="#D4AF37" opacity="0.3" />
          <circle cx={82 + i * 4} cy={y} r="3" fill="#D4AF37" opacity="0.3" />
        </g>
      ))}
    </svg>
  );
}


/* ─────────────────────────────────────────────────────────────────────────────
   MAIN HOME COMPONENT
───────────────────────────────────────────────────────────────────────────── */

export default function Home() {
  const [isRevealing, setIsRevealing] = useState(shouldRevealHero);
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    // Returning through the router is instant. A fresh page load can play the
    // entrance again, without introducing a replay control into the design.
    heroRevealedThisRuntime = true;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const respectPreference = () => {
      if (preference.matches) setIsRevealing(false);
    };
    preference.addEventListener('change', respectPreference);
    return () => preference.removeEventListener('change', respectPreference);
  }, []);

  return (
    <div className="w-full bg-[#FAF7F0] overflow-x-hidden">

      {/* The existing chakra and visa become the opening sequence. */}
      <section
        className={`hero-reveal relative min-h-screen flex flex-col justify-center items-center text-center px-6${isRevealing ? ' is-revealing' : ''}${isInteracting ? ' is-interacting' : ''}`}
        data-hero-reveal={isRevealing ? 'active' : 'complete'}
        onFocusCapture={(event) => {
          if (event.target.closest('a, button, input, select, textarea')) setIsInteracting(true);
        }}
      >

        {/* Jali tiling background */}
        <JaliPattern />
        <div className="hero-jali absolute inset-0 z-0" style={{ background: 'url(#jali-hero)' }} aria-hidden="true">
          <svg width="100%" height="100%">
            <rect width="100%" height="100%" fill="url(#jali-hero)" />
          </svg>
        </div>

        {/* The wheel keeps turning independently of its entrance. */}
        <div className="absolute inset-0 flex items-center justify-center z-[25] pointer-events-none" aria-hidden="true">
          <svg viewBox="0 0 400 400" className="hero-chakra w-[140vw] max-w-[900px] h-auto text-[#8B1C1C]"
            onAnimationEnd={(event) => {
              // Let the final decorative motion finish naturally. A timer can
              // cut the sequence short after a slow frame or a background tab.
              if (event.target === event.currentTarget && event.animationName === 'hero-chakra-reveal') setIsRevealing(false);
            }}
          >
            <g className="hero-chakra-rotor">
              <circle className="hero-chakra-ring hero-chakra-ring-outer" cx="200" cy="200" r="185" fill="none" stroke="currentColor" strokeWidth="12" pathLength="1" transform="rotate(-35 200 200)" />
              <circle className="hero-chakra-ring hero-chakra-ring-inner" cx="200" cy="200" r="172" fill="none" stroke="currentColor" strokeWidth="3" pathLength="1" transform="rotate(-35 200 200)" />

              {Array.from({ length: 24 }, (_, i) => (
                <g key={`spoke-${i}`} transform={`rotate(${i * 15} 200 200)`}>
                  <g className="hero-chakra-spoke" style={{ '--spoke-delay': `${120 + i * 27}ms` }}>
                    <polygon points="192,180 208,180 202,30 198,30" fill="currentColor" />
                    <circle cx="200" cy="34" r="5.5" fill="currentColor" transform="rotate(7.5 200 200)" />
                  </g>
                </g>
              ))}

              <g className="hero-chakra-hub">
                <circle cx="200" cy="200" r="32" fill="none" stroke="currentColor" strokeWidth="12" />
                <circle cx="200" cy="200" r="14" fill="currentColor" />
              </g>
            </g>
          </svg>
        </div>

        {/* ── Hero Content ── */}
        <div
          className="hero-card-stage relative z-30 flex flex-col items-center gap-6 w-full max-w-3xl px-4 mb-20 sm:mb-32"
        >


          <div className="hero-visa-shell relative w-full rounded-2xl">
          <div className="hero-visa-shadow" aria-hidden="true" />
          {/* Surface and typography have separate timelines. The chakra never
              shows through a fading group of text and card decorations. */}
          <div
            className="hero-visa-card relative flex flex-col justify-between w-full min-h-[400px] sm:min-h-[460px] rounded-2xl overflow-hidden"
          >
            <div className="hero-visa-surface" aria-hidden="true" />
            <svg className="hero-visa-edge" aria-hidden="true">
              <rect width="100%" height="100%" rx="16" fill="none" stroke="currentColor" strokeWidth="2" pathLength="1" />
            </svg>
            {/* Guilloche / Security Pattern Overlay - Gold */}
            <div className="hero-engraving absolute inset-0 opacity-20 pointer-events-none"
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 25 20, 50 10 T 100 10' fill='none' stroke='%23D4AF37' stroke-width='0.3'/%3E%3Cpath d='M0 10 Q 25 0, 50 10 T 100 10' fill='none' stroke='%23D4AF37' stroke-width='0.15'/%3E%3C/svg%3E")` }}
            />

            {/* Radial glow in center */}
            <div className="hero-card-glow absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(212,175,55,0.08) 0%, transparent 70%)' }} />

            {/* Decorative watermark */}
            <div className="hero-watermark absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06]">
              <img src="/emblem.svg" alt="" aria-hidden="true" className="w-2/3 max-w-[260px] h-auto" style={{ filter: 'brightness(0) invert(1)' }} />
            </div>

            {/* Guilloche Stars (Bottom Right) */}
            <div className="hero-seals absolute bottom-16 right-4 sm:right-8 opacity-90 pointer-events-none z-0 flex flex-col items-end">
               <GuillocheStar className="w-14 h-14 text-[#FF9933] drop-shadow-[0_0_8px_rgba(255,153,51,0.6)]" />
               <GuillocheStar className="w-10 h-10 text-white -mt-3 mr-8 transform -rotate-12 drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
               <GuillocheStar className="w-12 h-12 text-[#138808] -mt-5 mr-1 transform rotate-12 drop-shadow-[0_0_8px_rgba(19,136,8,1)]" />
            </div>

            {/* Repeating text lines as subtle borders */}
            <div className="hero-microprint absolute left-0 w-full h-full pointer-events-none flex flex-col justify-between py-[20%] opacity-[0.07] text-[5px] leading-none overflow-hidden text-[#D4AF37] font-serif tracking-widest">
               <div className="w-[200%] whitespace-nowrap">INDIA VISA SEVA · REPUBLIC OF INDIA · OFFICIAL VISA PORTAL · IMMIGRATION BUREAU</div>
               <div className="w-[200%] whitespace-nowrap">INDIA VISA SEVA · REPUBLIC OF INDIA · OFFICIAL VISA PORTAL · IMMIGRATION BUREAU</div>
            </div>

            <div className="relative z-10 flex flex-col flex-1 p-5 sm:p-8 w-full text-[#FAF7F0]">

              {/* Header Row */}
              <div className="hero-card-heading flex items-start justify-between gap-3">
                <div className="min-w-0 text-left">
                  <h2 className="text-[10px] sm:text-xs font-bold font-serif text-[#D4AF37]/80 tracking-[0.18em] sm:tracking-[0.3em] uppercase">अखिल भारतीय ई-वीज़ा पोर्टल</h2>
                  <h2 className="text-xs sm:text-sm font-bold font-serif text-[#D4AF37] tracking-[0.2em] sm:tracking-[0.25em] uppercase mt-0.5">INDIA VISA SEVA</h2>
                </div>
                <span className="shrink-0 text-[10px] sm:text-xs font-bold font-sans text-white/30 tracking-[0.2em] sm:tracking-[0.3em] uppercase border border-white/10 px-2 py-1 rounded">E-Visa</span>
              </div>

              {/* Divider */}
              <div className="hero-divider w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent my-4" />

              {/* Central gateway text */}
              <div className="flex-1 flex flex-col items-center justify-center py-4 z-10 text-center">
                 <p className="hero-eyebrow text-[11px] sm:text-xs font-serif font-bold tracking-[0.25em] text-[#D4AF37] uppercase mb-2">
                   Welcome to India
                 </p>
                 <h1 className="focus:outline-none text-4xl sm:text-5xl md:text-[3.25rem] font-serif font-normal text-white leading-[1.12] tracking-tight">
                   <span className="hero-line-mask"><span className="hero-title-first">Your Gateway</span></span>
                   <span className="hero-line-mask mt-1.5"><span className="hero-title-second font-serif italic text-[#E5C158]">to India</span></span>
                 </h1>
                 <div className="hero-tagline flex items-center justify-center gap-2.5 sm:gap-3.5 mt-5 text-white/70">
                   <span className="h-px w-6 bg-[#D4AF37]/40 hidden sm:block" />
                   <span className="tracking-[0.18em] uppercase font-sans text-[10.5px] sm:text-[11.5px] text-white/60">Discover</span>
                   <span className="text-[#D4AF37] text-[8px] opacity-75">✦</span>
                   <span className="tracking-[0.18em] uppercase font-sans text-[10.5px] sm:text-[11.5px] text-white/60">Experience</span>
                   <span className="text-[#D4AF37] text-[8px] opacity-75">✦</span>
                   <span className="tracking-[0.18em] uppercase font-sans text-[10.5px] sm:text-[11.5px] text-white/60">Flourish</span>
                   <span className="h-px w-6 bg-[#D4AF37]/40 hidden sm:block" />
                 </div>
              </div>
            </div>

            {/* ACTION BUTTONS (Inside the sticker) */}
            <div className="hero-action-panel relative z-10 flex flex-col w-full">
              <div className="hero-actions flex flex-col sm:flex-row gap-3 p-4 sm:p-6 pb-3 justify-center">
                <Link
                  to="/guide/visa-finder"
                  className="relative group bg-gradient-to-b from-[#E5C158] via-[#D4AF37] to-[#C49A32] text-[#162040] font-sans font-bold uppercase tracking-[0.16em] text-xs px-8 py-3.5 text-center transition-all duration-300 hover:-translate-y-0.5 shadow-[0_4px_16px_rgba(212,175,55,0.25)] hover:shadow-[0_8px_24px_rgba(212,175,55,0.38)] cursor-pointer"
                  style={{
                    clipPath: 'polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px)',
                  }}
                >
                  {/* Subtle inner hairline border */}
                  <span
                    className="absolute inset-[3px] border border-[#162040]/25 pointer-events-none transition-colors duration-300 group-hover:border-[#162040]/40"
                    style={{
                      clipPath: 'polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px), 0 6px)',
                    }}
                  />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <span>Start Application</span>
                    <span className="text-sm transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                  </span>
                </Link>
                <Link
                  to="/status"
                  className="relative group bg-white/[0.05] border border-white/20 text-white/80 font-sans font-bold uppercase tracking-[0.16em] text-xs px-8 py-3.5 text-center transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.09] hover:text-white hover:border-white/35 cursor-pointer"
                  style={{
                    clipPath: 'polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px)',
                  }}
                >
                  <span className="relative z-10">Check Application Status</span>
                </Link>
              </div>
              
              {/* Subtle direct links */}
              <div className="hero-direct-routes flex flex-wrap justify-center items-center gap-x-4 gap-y-2 px-6 pb-5 text-[10px] sm:text-[11px] font-sans tracking-widest text-white/50 uppercase">
                <span className="hidden sm:inline opacity-60 font-bold mr-1">Direct Routes:</span>
                <Link to="/flow/voa" className="hover:text-[#D4AF37] transition-colors flex items-center gap-1.5">
                  <div className="flex gap-1">
                    <img src="https://flagcdn.com/w40/jp.png" className="w-4 rounded-sm opacity-90" alt="Japan"/>
                    <img src="https://flagcdn.com/w40/kr.png" className="w-4 rounded-sm opacity-90" alt="South Korea"/>
                    <img src="https://flagcdn.com/w40/ae.png" className="w-4 rounded-sm opacity-90" alt="UAE"/>
                  </div>
                  On Arrival
                </Link>
                <span className="opacity-30">·</span>
                <Link to="/flow/afghan" className="hover:text-[#D4AF37] transition-colors flex items-center gap-1.5"><img src="https://flagcdn.com/w20/af.png" className="w-4 rounded-sm opacity-90" alt=""/> Afghan</Link>
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#FAF7F0] to-transparent z-20 pointer-events-none" />
      </section>

      {/* ── HOW IT WORKS: VISUAL FLOW ── */}
      <section className="bg-white py-24 px-6 relative z-20 border-b border-[#EBE5D9]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-sans font-bold uppercase tracking-[0.3em] text-[#C4762A] mb-3">Simple Process</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#1E2A4F]">How it works</h2>
          </div>

          <div className="relative flex flex-col md:flex-row items-center md:items-start justify-between gap-10 md:gap-4">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
            
            {/* Steps */}
            {[
              {
                step: '01',
                title: 'Discover',
                desc: 'Find the exact visa route for your nationality and purpose.',
                icon: (
                  <svg className="w-6 h-6 text-[#1E2A4F]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                )
              },
              {
                step: '02',
                title: 'Apply & Pay',
                desc: 'Complete the secure online application and submit payment.',
                icon: (
                  <svg className="w-6 h-6 text-[#1E2A4F]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                )
              },
              {
                step: '03',
                title: 'Receive ETA',
                desc: 'Get your Electronic Travel Authorization delivered via email.',
                icon: (
                  <svg className="w-6 h-6 text-[#1E2A4F]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                )
              },
              {
                step: '04',
                title: 'Travel',
                desc: 'Arrive in India and present your ETA for entry.',
                icon: (
                  <svg className="w-6 h-6 text-[#1E2A4F]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                )
              }
            ].map((s, i) => (
              <div key={s.step} className="relative z-10 flex flex-col items-center text-center flex-1 group">
                <div className="w-20 h-20 rounded-full bg-white border border-[#D4AF37]/30 shadow-[0_8px_20px_rgba(0,0,0,0.04)] flex items-center justify-center mb-6 relative group-hover:scale-105 group-hover:border-[#D4AF37] transition-all duration-300">
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-[#FAF7F0] text-[#D4AF37] text-[10px] font-bold rounded-full flex items-center justify-center border border-[#D4AF37]/20">
                    {s.step}
                  </div>
                  {s.icon}
                </div>
                <h3 className="font-serif font-bold text-[#1E2A4F] text-lg mb-2">{s.title}</h3>
                <p className="font-sans text-sm text-[#1E2A4F]/70 max-w-[200px]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3 THEMATIC CULTURAL & TRAVEL EXPLORATIONS ── */}
      <section className="bg-[#FAF7F0] py-28 px-6 relative z-20 border-t border-[#EBE5D9]">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="text-xs font-sans font-bold uppercase tracking-[0.25em] text-[#C4762A] mb-2 block">
              Curated Journeys
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#1E2A4F] mb-3">
              Journeys Across Bharat
            </h2>
            <div className="w-12 h-0.5 bg-[#D4AF37] mx-auto mb-4" />
            <p className="text-sm font-serif italic text-[#1E2A4F]/75 leading-relaxed">
              Timeless stone monuments, ancient protected forests, and living waters.
            </p>
          </div>

          {/* 3 Thematic Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {/* Card 1: UNESCO World Heritage */}
            <Link 
              to="/unesco-sites" 
              className="group block relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-700 h-[520px] cursor-pointer"
            >
              <div className="absolute inset-0 w-full h-full bg-neutral-900">
                <img 
                  src="/Taj_Mahal.jpg" 
                  alt="UNESCO World Heritage Sites" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out opacity-90 group-hover:opacity-100" 
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-85 group-hover:opacity-90 transition-opacity duration-500" />

              <div className="absolute inset-0 p-8 sm:p-9 flex flex-col justify-end items-start text-left z-10">
                <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#D4AF37] mb-2">
                  Heritage · 42 Monuments
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2.5 leading-snug">
                  World Heritage Sites
                </h3>
                <p className="text-xs font-serif italic text-white/80 leading-relaxed mb-5">
                  White marble mirroring the morning sky, stone chariot wheels, and rock-hewn caves carved by hand.
                </p>
                <div className="inline-flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-widest text-[#D4AF37] group-hover:text-white transition-colors">
                  <span>Explore Heritage</span>
                  <span className="transform group-hover:translate-x-1.5 transition-transform duration-300">→</span>
                </div>
              </div>
            </Link>

            {/* Card 2: Top National Parks */}
            <Link 
              to="/national-parks" 
              className="group block relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-700 h-[520px] cursor-pointer md:mt-6"
            >
              <div className="absolute inset-0 w-full h-full bg-neutral-900">
                <img 
                  src="/Tiger1.jpg" 
                  alt="National Parks and Wildlife" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out opacity-90 group-hover:opacity-100" 
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-85 group-hover:opacity-90 transition-opacity duration-500" />

              <div className="absolute inset-0 p-8 sm:p-9 flex flex-col justify-end items-start text-left z-10">
                <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#D4AF37] mb-2">
                  Wildlife · Protected Sanctuaries
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2.5 leading-snug">
                  National Parks & Wilds
                </h3>
                <p className="text-xs font-serif italic text-white/80 leading-relaxed mb-5">
                  Golden grass in the early dawn. The quiet gaze of the tiger resting beneath wild banyans.
                </p>
                <div className="inline-flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-widest text-[#D4AF37] group-hover:text-white transition-colors">
                  <span>Explore Sanctuaries</span>
                  <span className="transform group-hover:translate-x-1.5 transition-transform duration-300">→</span>
                </div>
              </div>
            </Link>

            {/* Card 3: Top Natural Wonders */}
            <Link 
              to="/natural-wonders" 
              className="group block relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-700 h-[520px] cursor-pointer"
            >
              <div className="absolute inset-0 w-full h-full bg-neutral-900">
                <img 
                  src="/Himalaya.jpg" 
                  alt="Natural Wonders, Backwaters and Mountains" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out opacity-90 group-hover:opacity-100" 
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-85 group-hover:opacity-90 transition-opacity duration-500" />

              <div className="absolute inset-0 p-8 sm:p-9 flex flex-col justify-end items-start text-left z-10">
                <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#D4AF37] mb-2">
                  Landscapes · Waterways & Peaks
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2.5 leading-snug">
                  Natural Wonders
                </h3>
                <p className="text-xs font-serif italic text-white/80 leading-relaxed mb-5">
                  Silent backwaters under palm shade, high mountain passes, and bridges woven through living tree roots.
                </p>
                <div className="inline-flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-widest text-[#D4AF37] group-hover:text-white transition-colors">
                  <span>Explore Landscapes</span>
                  <span className="transform group-hover:translate-x-1.5 transition-transform duration-300">→</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Bottom Link to Full Interactive Map */}
          <div className="mt-16 text-center">
            <Link 
              to="/tourism" 
              className="inline-flex items-center gap-3 px-8 py-3.5 rounded-xl border border-[#D4AF37]/40 bg-white text-[#162040] hover:bg-[#162040] hover:text-white hover:border-[#162040] text-xs font-sans font-bold uppercase tracking-widest transition-all duration-300 shadow-2xs hover:shadow-md cursor-pointer"
            >
              <span>Explore All 28 States on the Interactive Travel Map</span>
              <span className="text-[#D4AF37]">→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
