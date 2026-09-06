import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import IndiaSvgMap from '../../components/IndiaSvgMap';

const UNESCO_SITES = [
  {
    id: 'taj-mahal',
    title: 'Taj Mahal',
    year: '1983',
    era: 'Mughal Architecture (1631–1648 CE)',
    location: 'Agra, Uttar Pradesh',
    stateId: 'IN-UP',
    category: 'cultural',
    airport: 'Delhi (DEL) or Agra (AGR)',
    img: '/Taj_Mahal.jpg',
    altitude: '171m',
    bestTime: 'October to March (Dawn and Full Moon nights)',
    desc: 'Luminous white Makrana marble rising by the sacred Yamuna. Built in memory of Mumtaz Mahal, where Persian symmetry meets fine Indian gemstone inlays.',
    highlights: ['Makrana White Marble', 'Pietra Dura Gem Inlay', 'Yamuna River Reflection', 'Charbagh Symmetry'],
    travelTip: 'Arrive at first light. The white dome turns soft amber and rose as the morning sun lifts over the river mist.',
  },
  {
    id: 'hampi',
    title: 'Monuments of Hampi',
    year: '1986',
    era: 'Vijayanagara Empire (14th–16th Century)',
    location: 'Vijayanagara, Karnataka',
    stateId: 'IN-KA',
    category: 'cultural',
    airport: 'Hubballi (HBX) or Bengaluru (BLR)',
    img: '/Hampi.avif',
    altitude: '467m',
    bestTime: 'November to February',
    desc: 'Ancient stone city carved amidst wild granite boulders. Monolithic temple chariots and musical pillars standing quietly beside the Tungabhadra River.',
    highlights: ['Monolithic Stone Chariot', 'Musical Pillars of Vittala', 'Granite Boulder Hills', 'Tungabhadra River Temples'],
    travelTip: 'Walk to Matanga Hill at sunrise for an unbroken view of ancient stone spires across the boulder valley.',
  },
  {
    id: 'ellora-caves',
    title: 'Ellora Caves & Kailasa Temple',
    year: '1983',
    era: 'Rashtrakuta Dynasty (600–1000 CE)',
    location: 'Chhatrapati Sambhajinagar, Maharashtra',
    stateId: 'IN-MH',
    category: 'cultural',
    airport: 'Aurangabad (IXU) or Mumbai (BOM)',
    img: '/Ellora_Caves.avif',
    altitude: '570m',
    bestTime: 'October to March',
    desc: 'Thirty-four sanctuaries hewn directly into vertical basalt cliffs. Crowned by Kailasa, the largest single rock excavation on earth, carved top to bottom from a single cliff.',
    highlights: ['Monolithic Kailasa Cave 16', '34 Rock-Cut Sanctuaries', 'Basalt Cliff Architecture', 'Monsoon Mountain Streams'],
    travelTip: 'Spend time at Cave 16 to admire the towering stone elephants and mythological friezes carved from solid bedrock.',
  },
  {
    id: 'ajanta-caves',
    title: 'Ajanta Caves',
    year: '1983',
    era: 'Satavahana & Vakataka (2nd BCE–5th CE)',
    location: 'Aurangabad District, Maharashtra',
    stateId: 'IN-MH',
    category: 'cultural',
    airport: 'Aurangabad (IXU) or Jalgaon (JAG)',
    img: '/Ajanta_Caves.avif',
    altitude: '495m',
    bestTime: 'September to March',
    desc: 'Thirty rock caves following the horseshoe curve of the Waghora River gorge. Renowned for ancient tempera frescoes painted in quiet lantern light two thousand years ago.',
    highlights: ['Ancient Fresco Murals', 'Horseshoe River Gorge', 'Chaitya Prayer Stupas', 'Bodhisattva Padmapani'],
    travelTip: 'The soft filtered light inside Cave 1 reveals the delicate natural earth pigments of Bodhisattva Padmapani.',
  },
  {
    id: 'khajuraho',
    title: 'Khajuraho Temples',
    year: '1986',
    era: 'Chandela Dynasty (950–1050 CE)',
    location: 'Chhatarpur, Madhya Pradesh',
    stateId: 'IN-MP',
    category: 'cultural',
    airport: 'Khajuraho (HJR) or Jabalpur (JLR)',
    img: '/Khajuraho.avif',
    altitude: '283m',
    bestTime: 'October to March',
    desc: 'Golden sandstone spires reaching toward the sky. Celebrated for intricate carvings celebrating human life, music, devotion, and sacred dance.',
    highlights: ['Kandariya Mahadeva Spire', 'Sandstone Architecture', 'Bas-Relief Sculptures', 'February Classical Dance Festival'],
    travelTip: 'The morning sun illuminates the detailed sandstone carvings of Kandariya Mahadeva in warm amber tones.',
  },
  {
    id: 'kaziranga-national-park',
    title: 'Kaziranga Sanctuary',
    year: '1985',
    era: 'Ancient Brahmaputra Floodplain',
    location: 'Golaghat & Nagaon, Assam',
    stateId: 'IN-AS',
    category: 'natural',
    airport: 'Guwahati (GAU) or Jorhat (JRH)',
    img: '/Kaziranga_Rhino.avif',
    altitude: '80m',
    bestTime: 'November to April',
    desc: 'Vast tall grass floodplains on the banks of the mighty Brahmaputra. The peaceful home to two-thirds of the world’s great Indian one-horned rhinoceroses.',
    highlights: ['One-Horned Rhinoceros', 'Brahmaputra Floodplains', 'Wild Water Buffalo', 'Elephant Corridors'],
    travelTip: 'Early morning jeeps in the Bagori range often encounter mother rhinos and calves grazing quietly in the morning mist.',
  },
  {
    id: 'jaipur-city',
    title: 'Jaipur Walled City & Amber Fort',
    year: '2013 / 2019',
    era: 'Rajput Heritage (Founded 1727 CE)',
    location: 'Jaipur, Rajasthan',
    stateId: 'IN-RJ',
    category: 'cultural',
    airport: 'Jaipur International Airport (JAI)',
    img: '/Places/Jaipur.jpg',
    altitude: '431m',
    bestTime: 'October to March',
    desc: 'Hilltop ramparts over Maota Lake and pink terracotta city streets planned according to ancient Vedic geometry.',
    highlights: ['Amber Fort Mirror Palace', 'Hawa Mahal Windows', 'Vedic Town Plan', 'Jantar Mantar Sundials'],
    travelTip: 'Visit Amber Fort in late afternoon to watch the sunset warm the yellow sandstone walls above the lake.',
  },
  {
    id: 'sun-temple-konark',
    title: 'Sun Temple of Konark',
    year: '1984',
    era: 'Eastern Ganga Dynasty (1250 CE)',
    location: 'Puri, Odisha',
    stateId: 'IN-OR',
    category: 'cultural',
    airport: 'Bhubaneswar (BBI)',
    img: '/Places/Odisha.jpg',
    altitude: '10m',
    bestTime: 'October to March',
    desc: 'A colossal stone chariot of the Sun God with twenty-four carved wheels drawn by seven horses at the edge of the Bay of Bengal.',
    highlights: ['24 Carved Stone Wheels', 'Ancient Solar Sundials', 'Kalinga Architecture', 'Bay of Bengal Coast'],
    travelTip: 'Each carved wheel spoke casts precise shadows marking the exact hours and quarters of the day.',
  },
  {
    id: 'qutb-complex',
    title: 'Qutb Minar & Ancient Iron Pillar',
    year: '1993',
    era: 'Delhi Sultanate & Gupta Era (4th–13th CE)',
    location: 'New Delhi',
    stateId: 'IN-DL',
    category: 'cultural',
    airport: 'Indira Gandhi International (DEL)',
    img: '/Places/Delhi.jpg',
    altitude: '216m',
    bestTime: 'October to March',
    desc: 'Fluted red sandstone tower standing beside a rust-resistant iron pillar forged sixteen centuries ago.',
    highlights: ['72.5m Sandstone Minaret', 'Rustless Gupta Iron Pillar', 'Calligraphic Bands', 'Alai Darwaza Gateway'],
    travelTip: 'The ancient Sanskrit verse inscribed upon the iron pillar remains sharp and corrosion-free after 1,600 monsoons.',
  },
  {
    id: 'sanchi-stupa',
    title: 'Great Stupa at Sanchi',
    year: '1989',
    era: 'Mauryan Empire (3rd BCE–12th CE)',
    location: 'Raisen, Madhya Pradesh',
    stateId: 'IN-MP',
    category: 'cultural',
    airport: 'Bhopal (BHO)',
    img: '/Places/Bhopal.jpg',
    altitude: '430m',
    bestTime: 'October to March',
    desc: 'India’s oldest stone structure commissioned by Emperor Ashoka. Four intricately carved stone gateways telling tales of peace, wisdom, and compassion.',
    highlights: ['Ashokan Great Stupa', 'Four Carved Torana Gates', 'Monastic Sanctuaries', 'Peaceful Hilltop Vistas'],
    travelTip: 'Walk the circular stone path around the dome in silence to appreciate the fine Buddhist relief carvings.',
  },
  {
    id: 'rani-ki-vav',
    title: 'Rani-ki-Vav Stepwell',
    year: '2014',
    era: 'Solanki Dynasty (1063 CE)',
    location: 'Patan, Gujarat',
    stateId: 'IN-GJ',
    category: 'cultural',
    airport: 'Ahmedabad (AMD)',
    img: '/Places/Gujarat.jpg',
    altitude: '76m',
    bestTime: 'October to March',
    desc: 'An inverted subterranean temple honoring the sanctity of water, descending seven carved tiers with hundreds of fine sculptures.',
    highlights: ['Seven Underground Tiers', '500+ Stone Sculptures', 'Reclining Vishnu Carving', 'Maru-Gurjara Masonry'],
    travelTip: 'Descend to the lower gallery to view the stone carving of Vishnu resting serenely on the cosmic serpent Shesha.',
  },
  {
    id: 'chola-temples',
    title: 'Great Living Chola Temples',
    year: '1987 / 2004',
    era: 'Chola Dynasty (11th–12th Century)',
    location: 'Thanjavur, Tamil Nadu',
    stateId: 'IN-TN',
    category: 'cultural',
    airport: 'Tiruchirappalli (TRZ) or Chennai (MAA)',
    img: '/Places/Tamil_Nadu.jpg',
    altitude: '59m',
    bestTime: 'November to February',
    desc: 'Towering granite temple vimanas where thousand-year-old temple rituals, sacred chants, and oil lamps still burn each evening.',
    highlights: ['66m Solid Granite Vimana', 'Living Thousand-Year Rituals', 'Classical Chola Bronzes', 'Temple Music & Lamps'],
    travelTip: 'Experience the evening oil lamp aarti at Brihadisvara Temple accompanied by classical temple nadaswaram pipes.',
  },
  {
    id: 'khangchendzonga',
    title: 'Khangchendzonga Biosphere',
    year: '2016',
    era: 'Sacred Himalayan Mountain Sanctuary',
    location: 'North & West Sikkim',
    stateId: 'IN-SK',
    category: 'mixed',
    airport: 'Pakyong (PYG) or Bagdogra (IXB)',
    img: '/Himalaya.jpg',
    altitude: '1,220m to 8,586m',
    bestTime: 'March to May & October to December',
    desc: 'The sacred mountain home of the world’s third highest peak. Pristine glaciers, high alpine lakes, and forests of red pandas and orchids.',
    highlights: ['Mount Kanchenjunga (8,586m)', 'Sacred Beyul Monasteries', 'Zemu Glacial Lakes', 'Red Panda Habitat'],
    travelTip: 'Dawn at Dzongri ridge offers a golden sunrise reflection across the snow crests of Kanchenjunga.',
  },
  {
    id: 'valley-of-flowers',
    title: 'Valley of Flowers',
    year: '1988 / 2005',
    era: 'High Alpine Himalayan Valley',
    location: 'Chamoli, Uttarakhand',
    stateId: 'IN-UT',
    category: 'natural',
    airport: 'Dehradun (DED)',
    img: '/Places/Uttarakhand.jpg',
    altitude: '3,350m to 3,650m',
    bestTime: 'July to September (Monsoon Floral Season)',
    desc: 'A high Himalayan valley carpeted in hundreds of wild endemic alpine flowers, framed by snow peaks and glacial mountain brooks.',
    highlights: ['500+ Wild Alpine Blooms', 'Brahma Kamal & Blue Poppy', 'Pushpawati Glacial Stream', 'Nanda Devi Peaks'],
    travelTip: 'August is peak bloom when the valley floor turns into a natural sea of purple, blue, and gold petals.',
  },
  {
    id: 'goa-churches',
    title: 'Churches of Old Goa',
    year: '1986',
    era: '16th–17th Century',
    location: 'Old Goa (Velha Goa)',
    stateId: 'IN-GA',
    category: 'cultural',
    airport: 'Goa (GOX / GOI)',
    img: '/Places/Goa.jpg',
    altitude: '15m',
    bestTime: 'November to February',
    desc: 'Historic laterite cathedrals with gilded altars and resonant bells standing quietly amidst coastal palm groves.',
    highlights: ['Basilica of Bom Jesus', 'Sé Cathedral Golden Bell', 'Gilded Baroque Altars', 'Laterite Stone Work'],
    travelTip: 'Visit in the quiet morning hours when soft coastal light streams through the tall wooden choir lofts.',
  },
  {
    id: 'western-ghats',
    title: 'Western Ghats Rainforest Chain',
    year: '2012',
    era: 'Prehistoric Mountain Ecosystem',
    location: 'Kerala, Karnataka & Maharashtra',
    stateId: 'IN-KL',
    category: 'natural',
    airport: 'Cochin (COK) or Coimbatore (CJB)',
    img: '/Kerala_tea.avif',
    altitude: '300m to 2,695m',
    bestTime: 'September to March',
    desc: 'Ancient green mountain chain older than the Himalayas. Mist-draped tea hills, cloud forests, and waterfalls that feed the rivers of the south.',
    highlights: ['Global Biodiversity Hotspot', 'Mist-Draped Cloud Forests', 'Nilgiri Tahr & Hornbills', 'Mountain Waterfalls'],
    travelTip: 'Early morning walks through the Shola forests bring crisp mountain air and sightings of rare endemic birds.',
  }
];

export default function UnescoSites() {
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [selectedStateId, setSelectedStateId] = useState(null);
  const [activeModalSite, setActiveModalSite] = useState(null);

  const unescoStateIds = Array.from(new Set(UNESCO_SITES.map(s => s.stateId)));

  const filteredSites = UNESCO_SITES.filter(site => {
    const matchesCategory = filter === 'all' || site.category === filter;
    const matchesState = !selectedStateId || site.stateId === selectedStateId;
    return matchesCategory && matchesState;
  });

  const handleStateClick = (stateId) => {
    if (unescoStateIds.includes(stateId)) {
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
          <span className="text-[#C4762A] font-bold">World Heritage of India</span>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <span className="text-xs font-sans font-bold uppercase tracking-[0.25em] text-[#C4762A] mb-2 block">
            Heritage Archive
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#1E2A4F] mb-3 leading-tight">
            UNESCO World Heritage
          </h1>
          <div className="w-12 h-0.5 bg-[#D4AF37] mx-auto mb-4" />
          <p className="text-sm sm:text-base font-serif italic text-[#1E2A4F]/80 leading-relaxed">
            Sacred stupas, rock sanctuaries, sun chariots, and mountain rainforests preserved across centuries.
          </p>
        </div>

        {/* View Switcher & Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white p-3 sm:p-4 rounded-2xl border border-[#EBE5D9] shadow-xs">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {[
              { id: 'all', label: 'All Monuments (16)' },
              { id: 'cultural', label: 'Cultural' },
              { id: 'natural', label: 'Natural' },
              { id: 'mixed', label: 'Mixed' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFilter(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  filter === cat.id
                    ? 'bg-[#162040] text-white shadow-xs'
                    : 'bg-[#FAF7F0] text-[#162040]/80 hover:bg-[#EBE5D9]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-[#FAF7F0] p-1 rounded-xl border border-[#EBE5D9] shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'grid' ? 'bg-white text-[#162040] shadow-xs' : 'text-[#162040]/60 hover:text-[#162040]'
              }`}
            >
              <span>🗂 Editorial Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'map' ? 'bg-white text-[#162040] shadow-xs' : 'text-[#162040]/60 hover:text-[#162040]'
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
          <div className="mb-12 bg-white rounded-3xl border border-[#EBE5D9] p-6 sm:p-8 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Map Column */}
              <div className="lg:col-span-6 flex flex-col items-center">
                <div className="w-full max-w-[420px]">
                  <style>{`
                    .india-map-container path {
                      fill: #F5EFE6 !important;
                      stroke: #D4AF37 !important;
                      stroke-width: 0.8px !important;
                      cursor: pointer !important;
                      transition: all 0.3s ease !important;
                    }
                    ${unescoStateIds.map(id => `
                      .india-map-container path#${id} {
                        fill: #E9DCC9 !important;
                        stroke: #C4762A !important;
                        stroke-width: 1.5px !important;
                      }
                    `).join('')}
                    ${selectedStateId ? `
                      .india-map-container path#${selectedStateId} {
                        fill: #C4762A !important;
                        stroke: #162040 !important;
                        stroke-width: 2.5px !important;
                      }
                    ` : ''}
                    .india-map-container path:hover {
                      fill: #D4AF37 !important;
                      stroke: #162040 !important;
                      stroke-width: 2px !important;
                    }
                  `}</style>
                  <IndiaSvgMap onStateClick={handleStateClick} />
                </div>
                <p className="text-[11px] text-[#1E2A4F]/60 mt-3 text-center">
                  Click highlighted states on the map to view regional monuments.
                </p>
              </div>

              {/* State Summary Column */}
              <div className="lg:col-span-6 flex flex-col justify-center text-left">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C4762A] mb-1">
                  Regional Heritage Map
                </span>
                <h3 className="text-2xl font-serif font-bold text-[#1E2A4F] mb-3">
                  {selectedStateId 
                    ? `Monuments in this Region (${filteredSites.length})` 
                    : 'Select a highlighted state on the map'}
                </h3>
                <p className="text-xs font-serif italic text-[#1E2A4F]/75 leading-relaxed mb-6">
                  {selectedStateId 
                    ? 'Monuments and protected heritage sites located in this region:'
                    : 'India preserves forty-two world heritage monuments across its states, from rock-cut cave art to ancient temples and mountain forests.'}
                </p>

                {/* Mini list of sites for the state */}
                <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                  {filteredSites.map(s => (
                    <div 
                      key={s.id} 
                      onClick={() => setActiveModalSite(s)}
                      className="p-3 bg-[#FAF7F0] hover:bg-white rounded-xl border border-[#EBE5D9] hover:border-[#C4762A] transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={s.img} alt={s.title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                        <div className="min-w-0">
                          <h4 className="font-serif font-bold text-xs text-[#1E2A4F] truncate">{s.title}</h4>
                          <span className="text-[10px] text-gray-500 block truncate">{s.location}</span>
                        </div>
                      </div>
                      <span className="text-xs text-[#C4762A] font-bold shrink-0">Read Story →</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EDITORIAL HERITAGE SITES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSites.map((site) => (
            <div
              key={site.id}
              className="group flex flex-col justify-between bg-white rounded-2xl overflow-hidden border border-[#EBE5D9] hover:border-[#1E2A4F]/30 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 relative"
            >
              <div>
                {/* Image Container */}
                {/* Image Container */}
                <div 
                  className="relative h-60 w-full overflow-hidden bg-neutral-900 cursor-pointer"
                  onClick={() => setActiveModalSite(site)}
                >
                  <img
                    src={site.img}
                    alt={site.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Category & Inscription Badge */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#162040]/80 backdrop-blur-xs text-white/90 text-[10px] font-medium tracking-wide">
                      {site.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/95 text-[#162040] text-[10px] font-bold shadow-xs">
                      {site.year}
                    </span>
                  </div>

                  {/* Title */}
                  <div className="absolute bottom-3.5 left-4 right-4 text-left z-10">
                    <h3 className="font-serif font-bold text-xl text-white drop-shadow-xs">
                      {site.title}
                    </h3>
                    <p className="text-white/80 text-xs font-sans tracking-wide mt-0.5">
                      {site.location}
                    </p>
                  </div>
                </div>

                {/* Editorial Details */}
                <div className="p-6 text-left">
                  {/* Era & Altitude Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[10.5px]">
                    <span className="px-2 py-0.5 rounded-md bg-[#FAF7F0] border border-[#EBE5D9] text-[#C4762A] font-medium">
                      {site.era}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#FAF7F0] border border-[#EBE5D9] text-[#162040]/70 font-medium">
                      {site.altitude}
                    </span>
                  </div>

                  <p className="text-xs font-serif italic text-[#1E2A4F]/85 leading-relaxed mb-4 line-clamp-3">
                    {site.desc}
                  </p>

                  {/* Architectural Highlights */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {site.highlights.map((h) => (
                      <span key={h} className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF7F0] border border-[#EBE5D9] text-[#162040]/85 font-medium">
                        {h}
                      </span>
                    ))}
                  </div>

                  {/* Visiting Window */}
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
                  title="View State Travel Circuit"
                >
                  State Circuit →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* FACTSHEET LIGHTBOX MODAL */}
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
                  <span className="px-2.5 py-0.5 rounded-sm bg-[#D4AF37] text-[#162040] text-[10px] font-bold uppercase tracking-widest mb-1.5 inline-block">
                    Inscribed {activeModalSite.year} · {activeModalSite.category} Heritage
                  </span>
                  <h3 className="font-serif font-bold text-2xl sm:text-3xl text-white">
                    {activeModalSite.title}
                  </h3>
                  <p className="text-white/80 text-xs font-sans">
                    {activeModalSite.location} · {activeModalSite.era}
                  </p>
                </div>
              </div>

              {/* Modal Body Content */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-5 text-left">
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#1E2A4F] uppercase tracking-wider mb-2">
                    Cultural Heritage
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
                <div className="bg-[#FAF7F0] border border-[#D4AF37]/40 rounded-2xl p-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#C4762A] block mb-1">
                    Morning Light & Visiting Note
                  </span>
                  <p className="text-xs font-serif italic text-[#1E2A4F]/85 leading-relaxed">
                    {activeModalSite.travelTip}
                  </p>
                </div>

                {/* Access Details */}
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
                    className="text-xs font-bold text-[#162040] hover:text-[#C4762A] flex items-center gap-1"
                  >
                    <span>Explore full regional circuit</span>
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
