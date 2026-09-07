import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import IndiaSvgMap from '../../components/IndiaSvgMap';

const SPIRITUAL_SITES = [
  {
    id: 'varanasi',
    title: 'Varanasi Ghats & Sacred Ganga Aarti',
    state: 'Uttar Pradesh',
    stateId: 'IN-UP',
    tradition: 'Vedic Living Heritage',
    airport: 'Varanasi (VNS) or Delhi (DEL)',
    img: '/Places/Varanasi.jpg',
    aspect: 'aspect-[3/4]',
    altitude: '80m',
    bestTime: 'October to March (Dawn Boat Journeys)',
    desc: 'Ancient stone ghats on the curve of the holy Ganga. Thousand-year-old brass lamps lifted in devotion at evening prayer as river waters reflect the fire.',
    highlights: ['Dashashwamedh Evening Aarti', 'Ancient Kashi Vishwanath Temple', 'Dawn Rowing on the Ganga', 'Sarnath Sacred Deer Park'],
    travelTip: 'Take a small wooden rowboat at 05:30 AM from Assi Ghat to watch the morning sun illuminate thirty ghats in golden light.',
  },
  {
    id: 'golden-temple',
    title: 'The Golden Temple (Harmandir Sahib)',
    state: 'Punjab',
    stateId: 'IN-PB',
    tradition: 'Sikh Sacred Heritage',
    airport: 'Amritsar (ATQ)',
    img: '/Places/Punjab.jpg',
    aspect: 'aspect-[4/5]',
    altitude: '230m',
    bestTime: 'October to March',
    desc: 'A gilded sanctum resting serenely in the center of the holy Amrit Sarovar. Four open doorways welcoming all travelers to community kitchen langar meals.',
    highlights: ['Gilded Sanctum on Water', 'Free Community Kitchen (Langar)', 'Sacred Amrit Sarovar Pool', 'Continuous Gurbani Chants'],
    travelTip: 'Sitting beside the quiet water late in the evening as devotional hymns drift across the marble courtyard is deeply peaceful.',
  },
  {
    id: 'meenakshi-temple',
    title: 'Meenakshi Amman Temple',
    state: 'Tamil Nadu',
    stateId: 'IN-TN',
    tradition: 'Classical Dravidian Temple Heritage',
    airport: 'Madurai (IXM) or Chennai (MAA)',
    img: '/Places/Tamil_Nadu.jpg',
    aspect: 'aspect-[3/4]',
    altitude: '136m',
    bestTime: 'November to February',
    desc: 'Fourteen monumental stone gopuram towers rising over Madurai with thousands of carved and painted deities, sacred musical halls, and ancient oil lamps.',
    highlights: ['14 Towering Sculpted Gopurams', 'Hall of a Thousand Pillars', 'Living Classical Temple Rituals', 'Golden Lotus Sacred Tank'],
    travelTip: 'Walk the concentric granite corridors in the evening to witness the night ceremonial procession accompanied by temple drums.',
  },
  {
    id: 'rishikesh-haridwar',
    title: 'Rishikesh & Himalayan Ganga',
    state: 'Uttarakhand',
    stateId: 'IN-UT',
    tradition: 'Yoga & Himalayan Meditation',
    airport: 'Dehradun (DED) or Delhi (DEL)',
    img: '/Places/Uttarakhand.jpg',
    aspect: 'aspect-[3/4]',
    altitude: '372m',
    bestTime: 'September to April',
    desc: 'Where the emerald mountain Ganga enters the plains from the Himalayan foothills. Quiet river ashrams, evening fire prayers at Har Ki Pauri, and mountain meditation.',
    highlights: ['Har Ki Pauri Evening Aarti', 'Himalayan Yoga Ashrams', 'Triveni Ghat River Prayers', 'Gateway to the Garhwal Hills'],
    travelTip: 'Sit along the quiet pebble beaches of the Ganga upstream from Laxman Jhula for serene morning meditation.',
  },
  {
    id: 'puri-konark',
    title: 'Puri Jagannath & Sacred Coast',
    state: 'Odisha',
    stateId: 'IN-OR',
    tradition: 'Kalinga Sacred Architecture',
    airport: 'Bhubaneswar (BBI)',
    img: '/Places/Odisha.jpg',
    aspect: 'aspect-[4/5]',
    altitude: '10m',
    bestTime: 'October to March',
    desc: 'One of the four cardinal Char Dham sanctuaries of India by the Bay of Bengal, celebrated for monumental stone temple vimanas and chariot heritage.',
    highlights: ['Puri Jagannath Grand Temple', 'Ananda Bazar Sacred Kitchen', 'Konark Sun Temple Coast', 'Chariot Festival Heritage'],
    travelTip: 'Taste the ancient Mahaprasad cooked in traditional clay pots over wood fires in the world’s largest temple kitchen.',
  },
  {
    id: 'ladakh-monasteries',
    title: 'Buddhist Monasteries of Ladakh',
    state: 'Ladakh',
    stateId: 'IN-LA',
    tradition: 'Himalayan Buddhist Heritage',
    airport: 'Leh (IXL)',
    img: '/Places/Ladakh.jpg',
    aspect: 'aspect-[3/4]',
    altitude: '3,500m',
    bestTime: 'May to September (Festival Season)',
    desc: 'Monasteries resting upon rocky cliff tops overlooking the Indus and Nubra valleys, preserving Sanskrit-Tibetan manuscripts, giant Buddha statues, and prayer flags.',
    highlights: ['Cliffside Thiksey Gompa', 'Maitreya Buddha at Diskit', 'Sacred Cham Mask Dances', 'Hemis Ancient Treasury'],
    travelTip: 'Arrive at Thiksey Monastery at 06:00 AM to hear monks gather in the prayer hall for morning conch shells and chanting.',
  },
  {
    id: 'dilwara-temples',
    title: 'Dilwara Marble Temples',
    state: 'Rajasthan',
    stateId: 'IN-RJ',
    tradition: 'Jain Sacred Heritage',
    airport: 'Udaipur (UDR) 185 km or Ahmedabad (AMD)',
    img: '/Places/Rajasthan.jpg',
    aspect: 'aspect-[3/4]',
    altitude: '1,220m',
    bestTime: 'October to March',
    desc: 'White marble temples in the hills of Mount Abu with ceilings and pillars carved with such delicacy that solid stone resembles translucent lace and filigree.',
    highlights: ['Carved Marble Filigree Ceilings', 'Luna Vasahi & Vimal Vasahi', 'Mount Abu Mountain Sanctuary', 'Pillared Marble Corridors'],
    travelTip: 'Look upward at the central marble ceiling of Vimal Vasahi to see marble carved into delicate lotus petals hanging suspended in air.',
  }
];

export default function SpiritualHeritage() {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [selectedStateId, setSelectedStateId] = useState(null);
  const [activeModalSite, setActiveModalSite] = useState(null);

  const spiritualStateIds = Array.from(new Set(SPIRITUAL_SITES.map(s => s.stateId)));

  const filteredSites = SPIRITUAL_SITES.filter(site => {
    const matchesState = !selectedStateId || site.stateId === selectedStateId;
    return matchesState;
  });

  const handleStateClick = (stateId) => {
    if (spiritualStateIds.includes(stateId)) {
      setSelectedStateId(prev => prev === stateId ? null : stateId);
    }
  };

  return (
    <div className="w-full bg-[#FAF7F0] min-h-screen py-16 px-4 sm:px-6 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-xs uppercase tracking-widest text-[#1E2A4F]/60">
          <Link to="/" className="hover:text-[#1E2A4F]">Home</Link>
          <span>/</span>
          <span className="text-[#C4762A] font-bold">Sacred & Spiritual Heritage</span>
        </div>
        {/* Hero Section */}
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <span className="text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-[#C4762A] block mb-2">
            Sacred Circuits & Living Faith
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#1E2A4F] mb-3 leading-tight">
            Spiritual Heritage of India
          </h1>
          <div className="w-12 h-0.5 bg-[#D4AF37] mx-auto mb-4" />
          <p className="text-sm sm:text-base font-serif italic text-[#1E2A4F]/80 leading-relaxed">
            Sacred river ghats, gilded waters, cliffside Buddhist gompas, and ancient temple corridors.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-end mb-8">
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#EBE5D9] shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'grid' ? 'bg-[#162040] text-white shadow-xs' : 'text-[#162040]/60 hover:text-[#162040]'
              }`}
            >
              <span>🗂 Editorial Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'map' ? 'bg-[#162040] text-white shadow-xs' : 'text-[#162040]/60 hover:text-[#162040]'
              }`}
            >
              <span>🗺 Map of India</span>
            </button>
          </div>
        </div>

        {/* Selected State Filter Chip */}
        {selectedStateId && (
          <div className="mb-6 inline-flex items-center gap-2 bg-[#162040] text-white text-xs font-sans px-3.5 py-1.5 rounded-full">
            <span>Showing State: <strong>{selectedStateId}</strong></span>
            <button 
              onClick={() => setSelectedStateId(null)}
              className="text-[#D4AF37] hover:text-white font-bold ml-1 cursor-pointer"
            >
              ✕ Clear Filter
            </button>
          </div>
        )}

        {/* MAP EXPLORER VIEW */}
        {viewMode === 'map' && (
          <div className="mb-12 bg-white rounded-3xl border border-[#EBE5D9] p-6 sm:p-8 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Map Column */}
              <div className="lg:col-span-6 flex flex-col items-center">
                <div className="w-full max-w-[420px]">
                  <style>{`
                    .india-map-container path {
                      fill: #F5EFE6 !important;
                      stroke: #EBE5D9 !important;
                      stroke-width: 0.8px !important;
                      cursor: pointer !important;
                      transition: all 0.3s ease !important;
                    }
                    ${spiritualStateIds.map(id => `
                      .india-map-container path#${id} {
                        fill: #FDE68A !important;
                        stroke: #D97706 !important;
                        stroke-width: 1.5px !important;
                      }
                    `).join('')}
                    ${selectedStateId ? `
                      .india-map-container path#${selectedStateId} {
                        fill: #D97706 !important;
                        stroke: #162040 !important;
                        stroke-width: 2.5px !important;
                      }
                    ` : ''}
                    .india-map-container path:hover {
                      fill: #FDE68A !important;
                      stroke: #162040 !important;
                      stroke-width: 2px !important;
                    }
                  `}</style>
                  <IndiaSvgMap onStateClick={handleStateClick} />
                </div>
                <p className="text-[11px] text-[#1E2A4F]/60 mt-3 text-center">
                  Click highlighted states on the map to view sacred pilgrimage circuits.
                </p>
              </div>

              {/* Summary Column */}
              <div className="lg:col-span-6 flex flex-col justify-center text-left">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C4762A] mb-1">
                  Sacred Geography of India
                </span>
                <h3 className="text-2xl font-serif font-bold text-[#1E2A4F] mb-3">
                  {selectedStateId 
                    ? `Pilgrimage Sites in this Region (${filteredSites.length})` 
                    : 'Select a highlighted state on the map'}
                </h3>
                <p className="text-xs font-serif italic text-[#1E2A4F]/75 leading-relaxed mb-6">
                  {selectedStateId 
                    ? 'Sacred temples, river ghats, and monastic retreats located in this state:'
                    : 'India is home to thousands of years of living spiritual traditions. Tap any highlighted region to discover ancient shrines, holy confluences, and serene meditation havens.'}
                </p>

                {/* Mini list of sites for the state */}
                <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                  {filteredSites.map(s => (
                    <div 
                      key={s.id} 
                      onClick={() => setActiveModalSite(s)}
                      className="p-3 bg-[#FAF7F0] hover:bg-white rounded-xl border border-[#EBE5D9] hover:border-[#D97706] transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={s.img} alt={s.title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                        <div className="min-w-0">
                          <h4 className="font-serif font-bold text-xs text-[#1E2A4F] truncate">{s.title}</h4>
                          <span className="text-[10px] text-gray-500 block truncate">{s.tradition} · {s.state}</span>
                        </div>
                      </div>
                      <span className="text-xs text-[#D97706] font-bold shrink-0">Sacred Story →</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EDITORIAL MASONRY GRID */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 [column-fill:_balance]">
          {filteredSites.map((site) => (
            <div
              key={site.id}
              className="break-inside-avoid mb-8 w-full inline-block group bg-white rounded-2xl overflow-hidden border border-[#EBE5D9] hover:border-[#D97706] shadow-xs hover:shadow-xl transition-all duration-500 hover:-translate-y-1 relative"
            >
              <div>
                {/* Image Container with Dynamic Aspect Ratio */}
                <div 
                  className={`relative w-full overflow-hidden bg-neutral-900 cursor-pointer ${site.aspect || 'aspect-[3/4]'}`}
                  onClick={() => setActiveModalSite(site)}
                >
                  <img
                    src={site.img}
                    alt={site.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* State & Altitude Badge */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#162040]/80 backdrop-blur-xs text-white/90 text-[10px] font-medium tracking-wide">
                      {site.state}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/95 text-[#D97706] text-[10px] font-bold shadow-xs">
                      {site.altitude}
                    </span>
                  </div>

                  {/* Title */}
                  <div className="absolute bottom-3.5 left-4 right-4 text-left z-10">
                    <h3 className="font-serif font-bold text-xl text-white drop-shadow-xs">
                      {site.title}
                    </h3>
                  </div>
                </div>

                {/* Editorial Details */}
                <div className="p-6 text-left">
                  {/* Tradition Chip */}
                  <div className="mb-2 text-[10.5px] text-[#C4762A] font-medium">
                    {site.tradition}
                  </div>

                  <p className="text-xs font-serif italic text-[#1E2A4F]/85 leading-relaxed mb-4">
                    {site.desc}
                  </p>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {site.highlights.map((h) => (
                      <span key={h} className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF7F0] border border-[#EBE5D9] text-[#162040]/85 font-medium">
                        {h}
                      </span>
                    ))}
                  </div>

                  {/* Best Season & Airport */}
                  <div className="pt-3 border-t border-[#FAF7F0] text-[11px] text-[#1E2A4F]/75 space-y-1">
                    <div>
                      <strong className="text-[#162040]">Best Season:</strong> {site.bestTime}
                    </div>
                    <div className="truncate">
                      <strong className="text-[#162040]">Gateway:</strong> {site.airport}
                    </div>
                  </div>
                </div>
              </div>

              {/* Informative Action Buttons */}
              <div className="p-6 pt-0 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModalSite(site)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#162040] hover:bg-[#0B2540] text-white text-center text-xs font-bold uppercase tracking-wider transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Explore Story</span>
                  <span>→</span>
                </button>
                <Link
                  to={`/tourism?state=${site.stateId}`}
                  className="py-2.5 px-3 rounded-xl border border-[#162040]/20 bg-white hover:bg-[#FAF7F0] text-[#162040] text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
                  title="View State Travel Guide"
                >
                  State Circuit →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* SPIRITUAL FACTSHEET LIGHTBOX MODAL */}
        {activeModalSite && (
          <div 
            className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in"
            onClick={() => setActiveModalSite(null)}
          >
            <div 
              className="bg-white max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl border border-[#EBE5D9] max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header Image */}
              <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-neutral-900 shrink-0">
                <img 
                  src={activeModalSite.img} 
                  alt={activeModalSite.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <button
                  onClick={() => setActiveModalSite(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20 z-10"
                >
                  ✕
                </button>
                <div className="absolute bottom-4 left-6 right-6 z-10">
                  <span className="px-2.5 py-0.5 rounded-sm bg-[#D97706] text-white text-[10px] font-bold uppercase tracking-widest mb-1.5 inline-block">
                    {activeModalSite.state} · Sacred Circuit
                  </span>
                  <h3 className="font-serif font-bold text-2xl sm:text-3xl text-white">
                    {activeModalSite.title}
                  </h3>
                  <p className="text-white/80 text-xs font-sans">
                    {activeModalSite.tradition}
                  </p>
                </div>
              </div>

              {/* Modal Body Content */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-5 text-left">
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#1E2A4F] uppercase tracking-wider mb-2">
                    Sacred Tradition
                  </h4>
                  <p className="text-xs sm:text-sm font-serif italic text-[#1E2A4F]/85 leading-relaxed">
                    {activeModalSite.desc}
                  </p>
                </div>

                {/* Highlights */}
                <div>
                  <h4 className="font-serif font-bold text-xs text-[#1E2A4F] uppercase tracking-wider mb-2">
                    Key Highlights
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeModalSite.highlights.map(h => (
                      <span key={h} className="text-xs px-3 py-1 rounded-lg bg-[#FAF7F0] border border-[#EBE5D9] text-[#162040] font-medium">
                        ✦ {h}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Visiting Insight */}
                <div className="bg-[#FAF7F0] border border-[#D97706]/40 rounded-2xl p-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#D97706] block mb-1">
                    ✦ Morning Prayer & Visiting Note
                  </span>
                  <p className="text-xs font-serif italic text-[#1E2A4F]/85 leading-relaxed">
                    {activeModalSite.travelTip}
                  </p>
                </div>

                {/* Logistics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-[#1E2A4F]/80">
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <strong className="block text-[#162040] mb-0.5">Gateway Airport:</strong>
                    <span>{activeModalSite.airport}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <strong className="block text-[#162040] mb-0.5">Optimal Season:</strong>
                    <span>{activeModalSite.bestTime}</span>
                  </div>
                </div>

                {/* Footer Link */}
                <div className="pt-4 border-t border-[#EBE5D9] flex items-center justify-between">
                  <Link
                    to={`/tourism?state=${activeModalSite.stateId}`}
                    className="text-xs font-bold text-[#162040] hover:text-[#D97706] flex items-center gap-1"
                  >
                    <span>View all destinations in {activeModalSite.state}</span>
                    <span>→</span>
                  </Link>
                  <button
                    onClick={() => setActiveModalSite(null)}
                    className="text-xs text-gray-500 hover:text-[#162040]"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
