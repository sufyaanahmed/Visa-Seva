import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const OCI_CATEGORIES = [
  {
    id: 'former_indian',
    title: 'Former Indian Citizen',
    subtitle: 'Applicants who previously held Indian citizenship / Indian passport',
    eligibility: [
      'Was a citizen of India on or after 26th January 1950.',
      'Belonged to a territory that became part of India after 15th August 1947.',
      'Has formally renounced Indian citizenship and possesses a Surrender Certificate / Renunciation Certificate.',
    ],
    documents: [
      'Current foreign passport (valid for minimum 6 months).',
      'Surrender Certificate / Renunciation Certificate issued by Indian authorities.',
      'Cancelled Indian Passport (stamped "Cancelled on Acquisition of Foreign Nationality").',
      'Naturalization Certificate / Citizenship Certificate of the current foreign country.',
      'Address proof in country of residence (utility bill / driving licence).',
      '2x2 inch passport photograph (white background, square, neutral expression).',
    ],
  },
  {
    id: 'child_descendant',
    title: 'Child / Grandchild / Great-Grandchild',
    subtitle: 'Lineal descendants of Indian citizens or former Indian citizens',
    eligibility: [
      'Child, grandchild, or great-grandchild of a person eligible for OCI / Indian citizen.',
      'Never held citizenship of Pakistan or Bangladesh at any point in lineage.',
    ],
    documents: [
      'Current foreign passport (minimum 6 months validity).',
      'Full Birth Certificate showing both parents’ names (Apostilled/Attested if outside India/UK/US).',
      'Parents’ / Grandparents’ Indian Passport, OCI Card, or Indian Nativity/Domicile Certificate.',
      'Parents’ marriage certificate (if applicable).',
      'Proof of current residential address.',
      '2x2 inch passport photograph.',
    ],
  },
  {
    id: 'foreign_spouse',
    title: 'Foreign Spouse of Indian Citizen / OCI Holder',
    subtitle: 'Spouses of foreign origin married to an Indian Citizen or registered OCI cardholder',
    eligibility: [
      'Marriage must be legally registered and subsisting for a continuous period of at least 2 years immediately preceding application.',
      'Applicant must not be a citizen or origin of Pakistan, Bangladesh, or other specified restricted territories.',
    ],
    documents: [
      'Current foreign passport of the applicant.',
      'Registered Marriage Certificate (apostilled/attested as required).',
      'Indian Passport or valid OCI Card of the Indian / OCI spouse.',
      'Joint declaration of subsisting marriage signed by both spouses.',
      'Joint bank statement or joint residential proof in country of residence.',
      '2x2 inch passport photograph of applicant.',
    ],
  },
];

const OCI_BENEFITS = [
  {
    title: 'Lifelong Multi-Purpose Entry',
    desc: 'Multiple entry, multi-purpose lifelong visa to visit India without applying for regular or e-Visas.',
  },
  {
    title: 'Exemption from Police Reporting',
    desc: 'Exemption from registration with Foreigners Regional Registration Officer (FRRO) for any length of stay in India.',
  },
  {
    title: 'Economic & Educational Parity',
    desc: 'Parity with Non-Resident Indians (NRIs) in financial, economic, and educational fields (except agricultural/plantation land purchase).',
  },
  {
    title: 'Domestic Airfare & Park Tariffs',
    desc: 'Parity with Indian nationals in airfares for domestic routes and entry fees to national parks, monuments, and historical sites.',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Can OCI cardholders enter India without a visa?',
    a: 'Yes. OCI cardholders enjoy lifelong visa-free entry. You simply need to carry your valid foreign passport along with your physical OCI booklet. You must also complete the mandatory e-Arrival registration within 72 hours before arrival.',
  },
  {
    q: 'How long does a new OCI card application take to process?',
    a: 'Standard OCI applications typically take between 4 to 8 weeks from the date physical documents are received and verified by the Indian Mission / Post / VFS centre.',
  },
  {
    q: 'I need to travel to India urgently, but my OCI application is still pending. What can I do?',
    a: 'You can apply for an Indian e-Visa (e-Tourist, e-Business, etc.) online on this portal. e-Visas are typically granted within 24–72 hours, allowing you to travel immediately while your OCI application proceeds through standard consular channels.',
  },
  {
    q: 'Are Pakistani or Bangladeshi nationals eligible for OCI?',
    a: 'No. Under Section 7A of the Citizenship Act, 1955, any person who is, or had ever been, a citizen of Pakistan or Bangladesh (or whose parents or grandparents were citizens of these countries) is ineligible for an OCI card and must apply for a standard regular visa.',
  },
  {
    q: 'Do OCI cardholders have voting or political rights in India?',
    a: 'No. OCI cardholders are not Indian citizens. They do not have voting rights, cannot hold constitutional posts (President, MP, MLA, Judge), and cannot purchase agricultural or plantation property in India.',
  },
  {
    q: 'Do I need to update my OCI card when I renew my foreign passport?',
    a: 'Under updated MHA rules, OCI cardholders only need to upload their new passport photo and bio page online once on the OCI portal (Misc Services) after turning 20 years of age. Re-issuance of physical OCI booklet upon passport renewal is no longer mandatory for adults.',
  },
];

export default function OciGuidance() {
  const [activeCategory, setActiveCategory] = useState('former_indian');
  const [openFaq, setOpenFaq] = useState(null);

  const selectedCat = OCI_CATEGORIES.find((c) => c.id === activeCategory) || OCI_CATEGORIES[0];

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-text">
      {/* Hero Header */}
      <section className="border-b border-[#E6DFD3] bg-gradient-to-b from-[#FAF7F0] to-[#F3EDE2] py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-secondary-accent mb-4">
            <Link to="/" className="hover:underline">Home</Link>
            <span>›</span>
            <Link to="/guide/visa-finder" className="hover:underline">Visa Guide</Link>
            <span>›</span>
            <span className="text-text/70">OCI Guidance</span>
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C4762A] font-sans mb-3">
            Ministry of Home Affairs Guidelines &bull; Section 7A, Citizenship Act
          </p>

          <h1 className="font-serif text-3xl font-bold tracking-tight text-primary-dark sm:text-4xl md:text-5xl">
            Overseas Citizen of India (OCI) Guide
          </h1>
          <p className="mt-4 max-w-3xl text-base text-text/80 sm:text-lg">
            Comprehensive eligibility guidelines, required document checklists, and application steps for foreign nationals of Indian origin, former Indian citizens, and their foreign spouses.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/apply?flow=oci"
              className="inline-flex items-center gap-2 rounded-lg bg-[#C4762A] px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-[#b0651d] transition-colors"
            >
              <span>Start OCI Application Form</span>
              <span>→</span>
            </Link>
            <a
              href="https://ociservices.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#0b2540] px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-[#163a5f] transition-colors"
            >
              <span>Official OCI Portal (MHA)</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <Link
              to="/e-arrival"
              className="inline-flex items-center gap-2 rounded-lg border border-[#E6DFD3] bg-white px-5 py-2.5 text-sm font-bold text-text shadow-xs hover:bg-[#FAF7F0] transition-colors"
            >
              <span>Existing Cardholder? Complete e-Arrival</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        
        {/* Urgent Travel Bridge Banner */}
        <div className="mb-12 rounded-xl border border-blue-300 bg-blue-50/70 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-blue-900 block mb-1">
                Need to travel while OCI is processing?
              </span>
              <h3 className="font-serif text-lg font-bold text-blue-950">
                Get an interim e-Visa in 24–72 hours
              </h3>
              <p className="mt-1 text-sm text-blue-900/80">
                OCI applications take 4–8 weeks. If your departure date is soon, you can safely apply for an e-Visa now without impacting your pending OCI application.
              </p>
            </div>
            <Link
              to="/guide/visa-finder"
              className="whitespace-nowrap rounded-lg bg-blue-900 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-950 transition-colors shadow-xs"
            >
              Find Fast e-Visa Route
            </Link>
          </div>
        </div>

        {/* OCI Benefits Grid */}
        <div className="mb-16">
          <h2 className="font-serif text-2xl font-bold text-primary-dark">Privileges of OCI Cardholders</h2>
          <p className="mt-1 text-sm text-text/70 mb-6">Lifelong benefits granted to registered Overseas Citizens of India</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {OCI_BENEFITS.map((b, idx) => (
              <div key={idx} className="rounded-xl border border-[#E6DFD3] bg-white p-5 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C4762A] block mb-1">
                  0{idx + 1}
                </span>
                <h3 className="font-serif font-bold text-base text-primary-dark">{b.title}</h3>
                <p className="mt-1 text-sm text-text/80">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Eligibility & Document Checklist Tabs */}
        <div className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-primary-dark">Eligibility & Document Checklists</h2>
              <p className="mt-1 text-sm text-text/70">Select your qualifying category to see specific criteria and requirements</p>
            </div>
          </div>

          {/* Category Selector Tabs */}
          <div className="flex border-b border-[#E6DFD3] gap-2 overflow-x-auto pb-px mb-8">
            {OCI_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap pb-3 px-4 font-sans text-sm font-bold transition-colors cursor-pointer border-b-2 ${
                  activeCategory === cat.id
                    ? 'border-secondary-accent text-primary-dark'
                    : 'border-transparent text-text/60 hover:text-text'
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>

          {/* Selected Category Details Card */}
          <div className="rounded-xl border border-[#E6DFD3] bg-white p-6 md:p-8 shadow-xs">
            <div className="border-b border-[#E6DFD3] pb-6 mb-6">
              <h3 className="font-serif text-xl font-bold text-primary-dark">{selectedCat.title}</h3>
              <p className="text-sm text-text/70 mt-1">{selectedCat.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Eligibility Requirements */}
              <div>
                <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-secondary-accent mb-4">
                  Eligibility Criteria
                </h4>
                <ul className="space-y-3">
                  {selectedCat.eligibility.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-text/85">
                      <span className="text-emerald-700 font-bold mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Document Checklist */}
              <div>
                <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-primary mb-4">
                  Required Documents
                </h4>
                <ul className="space-y-3">
                  {selectedCat.documents.map((doc, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-text/85">
                      <span className="text-primary font-bold mt-0.5">▪</span>
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Step Application Walkthrough */}
        <div className="mb-16">
          <h2 className="font-serif text-2xl font-bold text-primary-dark">Step-by-Step OCI Application Process</h2>
          <p className="mt-1 text-sm text-text/70 mb-8">How to apply through the Government of India portal</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-xl border border-[#E6DFD3] bg-white p-5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#0b2540] text-xs font-bold text-white mb-3">1</span>
              <h3 className="font-serif font-bold text-base text-primary-dark">Online Registration</h3>
              <p className="mt-2 text-xs text-text/80 leading-relaxed">
                Fill Form Part-A &amp; Part-B on ociservices.gov.in with personal details, previous Indian connections, and upload photo/signature.
              </p>
            </div>

            <div className="rounded-xl border border-[#E6DFD3] bg-white p-5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#0b2540] text-xs font-bold text-white mb-3">2</span>
              <h3 className="font-serif font-bold text-base text-primary-dark">Upload Documents</h3>
              <p className="mt-2 text-xs text-text/80 leading-relaxed">
                Upload clear PDF copies of foreign passport, Indian surrender certificate, birth certificate, or marriage proof.
              </p>
            </div>

            <div className="rounded-xl border border-[#E6DFD3] bg-white p-5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#0b2540] text-xs font-bold text-white mb-3">3</span>
              <h3 className="font-serif font-bold text-base text-primary-dark">Physical Submission</h3>
              <p className="mt-2 text-xs text-text/80 leading-relaxed">
                Submit the printed application form along with original passports and attested copies to the designated consular service provider (VFS/Mission).
              </p>
            </div>

            <div className="rounded-xl border border-[#E6DFD3] bg-white p-5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-800 text-xs font-bold text-white mb-3">4</span>
              <h3 className="font-serif font-bold text-base text-primary-dark">OCI Card Collection</h3>
              <p className="mt-2 text-xs text-text/80 leading-relaxed">
                Upon MHA verification (4–8 weeks), your OCI booklet will be printed and dispatched or made available for collection.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-[#C4762A]/30 bg-[#FAF7F0] p-6 text-center shadow-xs">
            <h3 className="font-serif text-xl font-bold text-primary-dark">Ready to prepare your OCI registration dossier?</h3>
            <p className="mt-2 text-sm text-text/80 max-w-2xl mx-auto">
              Complete your OCI form Part-A details, auto-check Section 7A eligibility rules, and prepare your photo, signature, and required PDF evidence.
            </p>
            <div className="mt-5">
              <Link
                to="/apply?flow=oci"
                className="inline-flex items-center gap-2 rounded-lg bg-[#C4762A] px-6 py-3 text-sm font-bold text-white shadow hover:bg-[#b0651d] transition-colors"
              >
                <span>Start OCI Application Form</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-12">
          <h2 className="font-serif text-2xl font-bold text-primary-dark">Frequently Asked Questions</h2>
          <p className="mt-1 text-sm text-text/70 mb-6">Clarifications on OCI rules, travel rights, and renewals</p>

          <div className="divide-y divide-[#E6DFD3] rounded-xl border border-[#E6DFD3] bg-white overflow-hidden">
            {FAQ_ITEMS.map((faq, idx) => (
              <div key={idx} className="p-5">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="flex w-full items-center justify-between text-left font-serif font-bold text-base text-primary-dark hover:text-secondary-accent transition-colors cursor-pointer"
                  aria-expanded={openFaq === idx}
                >
                  <span>{faq.q}</span>
                  <span className="text-xl font-sans ml-4 text-text/50">{openFaq === idx ? '−' : '+'}</span>
                </button>
                {openFaq === idx && (
                  <p className="mt-3 text-sm text-text/85 leading-relaxed font-sans">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
