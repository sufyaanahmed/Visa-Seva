import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const faqs = [
  {
    category: "Documents & Photo Specifications",
    items: [
      {
        q: "What are the exact photo size and format specifications?",
        a: "Your photograph must be a recent, clear color photograph with a plain white background. Dimensions must be square (minimum 350x350 pixels, recommended 2x2 inches / 50mm x 50mm). The file format must be JPEG (.jpg/.jpeg), with file size between 10 KB (minimum) and 1 MB (maximum). The applicant's face must be centered, full front view with eyes open, neutral expression, and even lighting. Spectacles/sunglasses, tinted lenses, uniforms, headwear (except religious headwear), and shadows are not permitted.",
        keywords: ['photo', 'photo size', 'photograph', 'image size', 'dimension', 'dimensions', '50mm', '2x2', 'square', 'pixels', 'kb', 'mb', 'jpeg', 'jpg', 'white background', 'face', 'glasses', 'specifications', 'specs']
      },
      {
        q: "What are the passport bio-page scan file size and format requirements?",
        a: "The scanned copy of your passport's bio-data page (showing your photograph and personal particulars) must be uploaded in PDF (.pdf) format only. The file size must be between 10 KB (minimum) and 300 KB (maximum). The document must be crisp and clearly legible without glare, flash reflection, or cropped borders. The Machine Readable Zone (MRZ lines at the bottom) must be completely visible.",
        keywords: ['passport', 'bio page', 'pdf', 'passport scan', 'file size', 'size', 'kb', 'format', 'upload', 'mrz', 'documents', 'scanned copy']
      },
      {
        q: "What additional supporting documents are needed for Business, Medical, or Student visas?",
        a: "• e-Business: A clear PDF copy of your business card or formal letter of invitation from the Indian company/organization (10 KB to 300 KB).\n• e-Medical: A formal letter on the letterhead of the accredited Indian hospital/medical institution detailing the treatment plan (PDF, 10 KB to 300 KB).\n• e-Medical Attendant: A copy of the principal patient's medical visa or hospital letter.\n• e-Student: Admission letter from an eligible Indian educational institute and financial undertaking/scholarship proof.",
        keywords: ['business visa', 'medical visa', 'student visa', 'documents', 'invitation letter', 'hospital letter', 'business card', 'pdf size', 'attendant']
      },
      {
        q: "What passport validity is required for an e-Visa?",
        a: "Your physical passport must have at least 6 months of validity remaining from your expected date of arrival in India. It must also contain at least two blank pages for official stamping by the Immigration Officer upon arrival.",
        keywords: ['passport validity', '6 months', 'validity', 'blank pages', 'expiry', 'passport rules']
      }
    ]
  },
  {
    category: "General Rules & Eligibility",
    items: [
      {
        q: "What is an e-Visa and who is eligible?",
        a: "An e-Visa is an official electronic travel authorization issued by the Government of India for foreign nationals traveling for tourism, recreation, casual business visits, short-term medical treatment, conferences, or qualifying study. Citizens of over 165 countries can apply completely online without visiting an Indian Embassy or Consular Mission.",
        keywords: ['what is evisa', 'eligibility', 'eligible countries', 'online visa', 'tourism', 'embassy', 'government']
      },
      {
        q: "How early should I apply before my travel date?",
        a: "You can apply up to 120 days in advance of your proposed arrival date. Applications should be submitted at least 4 business days before your scheduled flight departure to account for consular review.",
        keywords: ['how early', 'when to apply', 'advance application', '120 days', '4 days', 'timeline', 'departure']
      },
      {
        q: "What is the difference between Visa on Arrival and e-Visa?",
        a: "Visa on Arrival (VoA) is restricted strictly to qualifying passport holders of Japan, South Korea, and the UAE (if previously holding an Indian visa) at 6 designated international airports (Delhi, Mumbai, Kolkata, Chennai, Bengaluru, Hyderabad). All other eligible nationalities must obtain an approved e-Visa online prior to boarding.",
        keywords: ['voa', 'visa on arrival', 'japan', 'south korea', 'korea', 'uae', 'difference', 'ports']
      },
      {
        q: "Are there restricted or protected areas in India that require extra permits?",
        a: "Yes. An e-Visa permits general travel across India, but does not grant entry into designated Protected or Restricted Areas (such as certain border regions in Sikkim, Arunachal Pradesh, parts of Ladakh, Andaman & Nicobar tribal areas, and Lakshadweep). A separate Protected Area Permit (PAP) or Restricted Area Permit (RAP) must be obtained from the Ministry of Home Affairs or competent local authority.",
        keywords: ['restricted areas', 'protected areas', 'pap', 'rap', 'sikkim', 'arunachal', 'ladakh', 'permits', 'andaman']
      }
    ]
  },
  {
    category: "Validity, Stay Limits & Entry Ports",
    items: [
      {
        q: "What is the difference between visa validity and allowable continuous stay?",
        a: "• 30-Day e-Tourist Visa: Valid for 30 days from the date of first arrival in India, allowing Double Entry.\n• 1-Year & 5-Year e-Tourist Visa: Multiple entries during the validity period. Continuous stay during each visit cannot exceed 90 days for most nationalities (180 days for citizens of the US, UK, Canada, and Japan).\n• e-Business Visa: Valid for 1 year with Multiple Entries; continuous stay cannot exceed 180 days per calendar year.",
        keywords: ['validity', 'length of stay', 'continuous stay', 'duration', '30 days', '1 year', '5 years', 'multiple entry', 'double entry', '90 days', '180 days']
      },
      {
        q: "Which international airports and seaports accept e-Visa entry?",
        a: "e-Visa holders can arrive at 31 designated international airports: Ahmedabad, Amritsar, Bagdogra, Bengaluru, Bhubaneswar, Calicut, Chandigarh, Chennai, Cochin, Coimbatore, Delhi, Gaya, Goa (Dabolim & MOPA), Guwahati, Hyderabad, Indore, Jaipur, Kannur, Kolkata, Lucknow, Madurai, Mangalore, Mumbai, Nagpur, Port Blair, Pune, Tiruchirappalli, Trivandrum, Varanasi, and Visakhapatnam, plus 6 designated seaports (Cochin, Goa, Mangalore, Mumbai, Chennai, Port Blair). You may exit via any authorized Immigration Check Post (ICP) in India.",
        keywords: ['ports of entry', 'airports', 'seaports', 'delhi', 'mumbai', 'goa', 'bangalore', 'chennai', 'arrival ports', 'where can i enter', 'icp']
      },
      {
        q: "Can an e-Visa be extended or converted while in India?",
        a: "No. Under Government of India regulations, e-Visas are strictly non-extendable and non-convertible to any other visa type (such as employment or permanent residency). In extraordinary circumstances of acute medical emergency, contact the local Foreigners Regional Registration Office (FRRO).",
        keywords: ['extend', 'extension', 'convert', 'conversion', 'overstay', 'frro', 'change visa']
      }
    ]
  },
  {
    category: "Payment, Status & Arrival Protocols",
    items: [
      {
        q: "What should I do if my payment fails or is charged twice?",
        a: "Visa processing fees are non-refundable. If your payment fails, wait 30 minutes for automated bank settlement before attempting payment again. Do not make rapid consecutive transactions to avoid duplicate holds. You can check the payment status directly on the portal using your Application ID.",
        keywords: ['payment', 'failed payment', 'fee', 'cost', 'charge', 'refund', 'card declined', 'double charge', 'transaction']
      },
      {
        q: "Do I need to carry a printed copy of the Electronic Travel Authorization (ETA)?",
        a: "Yes. You must carry a printed physical copy of your Electronic Travel Authorization (ETA) confirmation document at the time of boarding and present it to the Immigration Officer upon arrival in India. Digital photos or mobile screenshots alone may not be accepted by airlines.",
        keywords: ['eta', 'print', 'printed copy', 'electronic travel authorization', 'paper copy', 'boarding']
      },
      {
        q: "What is the mandatory 72-hour e-Arrival Card requirement?",
        a: "All foreign passengers traveling to India must complete the online e-Arrival Card declaration within 72 hours before their flight departure. This is a mandatory customs and health arrival declaration, completely free of charge.",
        keywords: ['arrival card', '72 hours', 'air suvidha', 'customs declaration', 'pre-flight', 'health declaration']
      },
      {
        q: "Can I correct an error or typo in my name or passport number after submission?",
        a: "No changes can be made once an application is submitted and payment is processed. If there is a critical discrepancy (e.g. incorrect passport number, misspelled name, or wrong nationality), the airline will deny boarding and you must submit a new application with the correct details.",
        keywords: ['correction', 'typo', 'mistake', 'error', 'edit application', 'wrong name', 'wrong passport number', 'change details']
      }
    ]
  }
];

function JaliPattern({ id = 'jali-help', color = '#1E2A4F', opacity = 0.05 }) {
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

export default function Help() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...faqs.map((f) => f.category)];

  const filteredFaqs = useMemo(() => {
    const raw = searchTerm.toLowerCase().trim();
    if (!raw) {
      return faqs
        .filter((group) => selectedCategory === 'All' || group.category === selectedCategory)
        .filter((group) => group.items.length > 0);
    }

    const queryTokens = raw.split(/\s+/).filter(Boolean);

    return faqs
      .filter((group) => selectedCategory === 'All' || group.category === selectedCategory)
      .map((group) => {
        const matchingItems = group.items.filter((item) => {
          const qText = item.q.toLowerCase();
          const aText = item.a.toLowerCase();
          const kwList = (item.keywords || []).map((k) => k.toLowerCase());

          // Match if every token is found in question, answer, or keywords
          return queryTokens.every((token) =>
            qText.includes(token) ||
            aText.includes(token) ||
            kwList.some((kw) => kw.includes(token))
          );
        });
        return { ...group, items: matchingItems };
      })
      .filter((group) => group.items.length > 0);
  }, [searchTerm, selectedCategory]);

  const totalResultsCount = useMemo(() => {
    return filteredFaqs.reduce((acc, g) => acc + g.items.length, 0);
  }, [filteredFaqs]);

  return (
    <div className="min-h-screen bg-[#FAF7F0] py-12 px-4 relative overflow-x-hidden">
      {/* Jali Pattern & Authentic Atmosphere */}
      <JaliPattern id="jali-help" />
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40" style={{ background: 'url(#jali-help)' }} aria-hidden="true">
        <svg width="100%" height="100%">
          <rect width="100%" height="100%" fill="url(#jali-help)" />
        </svg>
      </div>

      {/* Ashoka Chakra Background Watermark */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] md:w-[800px] md:h-[800px] opacity-[0.045] pointer-events-none translate-x-1/4 -translate-y-1/4 select-none">
        <svg viewBox="0 0 400 400" className="w-full h-full text-[#1E2A4F] animate-[spin_240s_linear_infinite]">
          <g>
            <circle cx="200" cy="200" r="185" fill="none" stroke="currentColor" strokeWidth="12" />
            <circle cx="200" cy="200" r="172" fill="none" stroke="currentColor" strokeWidth="3" />

            {Array.from({ length: 24 }, (_, i) => (
              <g key={`spoke-${i}`} transform={`rotate(${i * 15} 200 200)`}>
                <polygon points="192,180 208,180 202,30 198,30" fill="currentColor" />
                <circle cx="200" cy="34" r="5.5" fill="currentColor" transform="rotate(7.5 200 200)" />
              </g>
            ))}

            <circle cx="200" cy="200" r="32" fill="none" stroke="currentColor" strokeWidth="12" />
            <circle cx="200" cy="200" r="14" fill="currentColor" />
          </g>
        </svg>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Page Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-sans font-bold uppercase tracking-[0.3em] text-[#C4762A] mb-3">
            Official Guidance & Support Center
          </p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-text-secondary font-sans text-sm max-w-2xl mx-auto">
            Authoritative answers on photo specifications, document requirements, entry rules, processing timelines, and arrival procedures.
          </p>
        </div>

        {/* Live Search & Clean Category Filter Bar */}
        <div className="bg-white border-2 border-[#D4AF37]/40 p-6 sm:p-7 rounded-2xl shadow-lg mb-10 space-y-4">
          
          {/* Search Input Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by keyword (e.g. photo size, passport scan, 72 hours, ports, fee, validity)..."
              className="w-full bg-[#FAF7F0] border-2 border-[#D4AF37]/30 px-4 py-3.5 pl-12 pr-24 text-sm font-sans text-primary focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 rounded-xl transition-all shadow-inner placeholder:text-gray-400"
            />
            <div className="absolute left-4 top-3.5 text-[#D4AF37] pointer-events-none">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-3 text-xs font-bold text-gray-500 hover:text-primary bg-white border border-gray-300 hover:border-[#D4AF37] px-2.5 py-1 rounded-md transition-all cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Clean Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#1E2A4F] text-white shadow-xs'
                      : 'bg-[#FAF7F0] text-gray-700 border border-gray-300 hover:border-[#D4AF37] hover:bg-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Results Counter / Reset */}
            {searchTerm && (
              <div className="text-xs text-gray-500 font-sans flex items-center gap-2">
                <span><strong>{totalResultsCount}</strong> result{totalResultsCount === 1 ? '' : 's'}</span>
                <span className="text-gray-300">·</span>
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="text-[#C4762A] font-bold hover:underline cursor-pointer"
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* FAQ Groups */}
        <div className="space-y-10">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((group, idx) => (
              <section key={idx}>
                <h2 className="text-lg font-serif font-bold text-primary border-b-2 border-[#D4AF37]/30 pb-3 mb-4 flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#1E2A4F] text-white flex items-center justify-center text-xs font-bold font-mono shadow-xs">
                    {idx + 1}
                  </span>
                  {group.category}
                </h2>
                <div className="space-y-3">
                  {group.items.map((faq, fIdx) => (
                    <details
                      key={fIdx}
                      open={Boolean(searchTerm)}
                      className="group border border-[#D4AF37]/25 bg-white shadow-xs p-5 transition-all duration-300 hover:border-[#D4AF37]/70 open:shadow-md open:border-[#D4AF37] rounded-xl"
                    >
                      <summary className="font-sans font-bold text-primary cursor-pointer list-none flex justify-between items-center pr-2 text-sm sm:text-[15px] leading-snug">
                        <span className="pr-4">{faq.q}</span>
                        <span className="text-[#D4AF37] transform group-open:rotate-180 transition-transform duration-300 flex-shrink-0">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </summary>
                      <div className="mt-3.5 text-text-secondary text-xs sm:text-sm font-sans leading-relaxed border-t border-border pt-3.5 whitespace-pre-line">
                        {faq.a}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="bg-white border-2 border-dashed border-[#D4AF37]/40 p-10 rounded-2xl text-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#FAF7F0] border border-[#D4AF37]/40 text-[#D4AF37] flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                ?
              </div>
              <h3 className="font-serif font-bold text-lg text-gray-900 mb-1">
                No FAQs Match &ldquo;{searchTerm}&rdquo;
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm mb-5 max-w-md mx-auto">
                Try searching for broader keywords like <em>photo, passport, validity, fee, ports, arrival</em>, or explore all categories.
              </p>
              <button
                type="button"
                onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                className="bg-[#1E2A4F] text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#162040] transition-colors cursor-pointer"
              >
                Reset Search Filters
              </button>
            </div>
          )}

          {/* Direct Assistance Card */}
          <section className="bg-[#1E2A4F] text-white p-8 sm:p-10 mt-12 text-center border-t-4 border-[#D4AF37] shadow-xl relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 pattern-jali opacity-10" />
            <div className="relative z-10">
              <h2 className="text-2xl font-serif font-bold mb-3">Ready to Begin Your Application?</h2>
              <p className="mb-6 text-slate-200 font-sans text-xs sm:text-sm max-w-lg mx-auto">
                Use the interactive Visa Finder to verify requirements or launch your e-Visa application directly.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/guide/visa-finder" className="bg-gradient-to-r from-[#D4AF37] to-[#C9933A] text-[#1E2A4F] px-6 py-3 font-sans font-bold uppercase tracking-widest text-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 rounded-lg">
                  Explore Visa Finder →
                </Link>
                <Link to="/status" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 font-sans font-bold uppercase tracking-widest text-xs transition-all duration-300 rounded-lg">
                  Track Application Status
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
