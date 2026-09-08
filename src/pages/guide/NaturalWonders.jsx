import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import IndiaSvgMap from '../../components/IndiaSvgMap';

const NATURAL_SPOTS = [
  {
    id: 'living-root-bridges',
    title: 'Living Root Bridges of Meghalaya',
    location: 'Cherrapunji & Mawlynnong, Meghalaya',
    stateId: 'IN-ML',
    state: 'Meghalaya',
    category: 'waterfalls',
    altitude: '1,430m',
    mapX: 460,
    mapY: 275,
    climate: 'Cloud Rainforest',
    bestSeason: 'October to April (Clear Streams) & June to September (Monsoon)',
    airport: 'Guwahati (GAU) 160 km or Shillong (SHL)',
    img: '/Living_Root_Bridge.avif',
    aspect: 'aspect-[16/10]',
    desc: 'Ancient living tree roots guided across jungle rivers by the indigenous Khasi clans, forming suspension bridges that grow stronger with each passing monsoon.',
    highlights: ['Double Decker Root Bridge', 'Nohkalikai 340m Waterfall', 'Crystal Clear Dawki River', 'Mawsmai Limestone Caves'],
    travelTip: 'The stone steps down to Nongriat descend through emerald betel nut groves beside clear jungle pools.',
  },
  {
    id: 'ladakh-pangong',
    title: 'Pangong Tso & High Mountain Passes',
    location: 'Changthang Plateau, Ladakh',
    stateId: 'IN-LA',
    state: 'Ladakh',
    category: 'mountains',
    altitude: '4,225m',
    mapX: 200,
    mapY: 75,
    climate: 'High-Altitude Cold Desert',
    bestSeason: 'May to September (Clear Azure Water)',
    airport: 'Leh Kushok Bakula Rimpochee Airport (IXL) 150 km',
    img: '/Pangong_Tso.avif',
    aspect: 'aspect-[16/10]',
    desc: 'A silent high-altitude lake extending past snow ridges into the horizon, shifting from morning turquoise to deep evening cobalt blue.',
    highlights: ['4,225m Altitude Waters', 'Chang La Pass (5,360m)', 'Starry Night Skies', 'Bar-Headed Geese'],
    travelTip: 'Warm woolens are essential even in mid-summer as mountain breezes cool rapidly at sunset.',
  },
  {
    id: 'kalsubai-peak-trek',
    title: 'Mount Kalsubai Peak & Sahyadri Ridge',
    location: 'Bhandardara, Maharashtra',
    stateId: 'IN-MH',
    state: 'Maharashtra',
    category: 'mountains',
    altitude: '1,646m (Highest Peak in Maharashtra)',
    mapX: 130,
    mapY: 410,
    climate: 'Sahyadri Montane Ridge',
    bestSeason: 'June to September (Cloud Treks) & October to February (Clear Sunrise)',
    airport: 'Mumbai (BOM) 150 km or Nashik (ISK)',
    img: '/Kalsubai.avif',
    aspect: 'aspect-[16/10]',
    desc: 'The highest summit in the Western Ghats of Maharashtra. Iron ladders climbing vertical basalt cliffs to a peaceful hilltop temple above a sea of clouds.',
    highlights: ['Highest Peak in Maharashtra', 'Basalt Rock Ladder Trails', 'Arthur Lake Mountain Vistas', 'Monsoon Cloud Meadows'],
    travelTip: 'Starting the trek in the quiet early morning brings you to the summit in time for sunrise across the valley of clouds.',
  },
  {
    id: 'dal-lake-valleys',
    title: 'Dal Lake & Kashmir Valleys',
    location: 'Srinagar, Jammu & Kashmir',
    stateId: 'IN-JK',
    state: 'Jammu and Kashmir',
    category: 'lakes',
    altitude: '1,583m',
    mapX: 140,
    mapY: 100,
    climate: 'Alpine Valley',
    bestSeason: 'April to October (Garden Blooms) & December to February (Snow)',
    airport: 'Srinagar Sheikh ul-Alam Airport (SXR)',
    img: '/Dal_lake.jpg',
    aspect: 'aspect-[3/4]',
    desc: 'Carved cedar shikara boats gliding across mirror waters reflecting the snow peaks of the Pir Panjal, past floating lotus beds and morning markets.',
    highlights: ['Dawn Shikara Lake Cruises', 'Carved Cedar Houseboats', 'Floating Lotus Gardens', 'Nigeen Lake Reflections'],
    travelTip: 'A quiet dawn ride at 05:30 AM reveals farmers gathering in wooden boats for the floating morning market.',
  },
  {
    id: 'kerala-backwaters',
    title: 'Kerala Backwaters & Vembanad Lake',
    location: 'Alleppey & Kumarakom, Kerala',
    stateId: 'IN-KL',
    state: 'Kerala',
    category: 'backwaters',
    altitude: 'Sea Level',
    mapX: 185,
    mapY: 625,
    climate: 'Tropical Waterway',
    bestSeason: 'September to March (Gentle Breeze) & June to August (Monsoon)',
    airport: 'Cochin (COK) 75 km or Trivandrum (TRV)',
    img: '/Kerala_backwaters.avif',
    aspect: 'aspect-[16/10]',
    desc: 'Canals and palm-fringed lagoons running parallel to the Arabian Sea. Handcrafted thatched houseboats drifting past paddy fields and village riverbanks.',
    highlights: ['Thatched Kettuvallam Boats', 'Vembanad Bird Sanctuary', 'August Snake Boat Races', 'Ayurvedic Herb Gardens'],
    travelTip: 'Anchoring in the peaceful Kumarakom waters at dusk brings cool lake breezes and golden sunset reflections.',
  },
  {
    id: 'munnar-tea-valleys',
    title: 'Munnar Tea Valleys & Anamudi Peak',
    location: 'Idukki, Kerala',
    stateId: 'IN-KL',
    state: 'Kerala',
    category: 'mountains',
    altitude: '1,600m to 2,695m (Anamudi Peak)',
    mapX: 195,
    mapY: 595,
    climate: 'Highland Mountain Mist',
    bestSeason: 'September to March',
    airport: 'Cochin (COK) 110 km or Madurai (IXM)',
    img: '/Kerala_tea.avif',
    aspect: 'aspect-[16/10]',
    desc: 'Rolling green tea plantations spread across high mountain ridges. Overlooked by Anamudi, the highest mountain summit in south India.',
    highlights: ['High-Altitude Tea Estates', 'Anamudi Summit (2,695m)', 'Nilgiri Tahr at Eravikulam', 'Top Station Cloud Views'],
    travelTip: 'Early morning walks through the tea trails offer cool mountain mist and panoramic views above the clouds.',
  },
  {
    id: 'western-ghats-dudhsagar',
    title: 'Dudhsagar Four-Tier Waterfalls',
    location: 'Bhagwan Mahaveer Sanctuary, Goa / Karnataka',
    stateId: 'IN-GA',
    state: 'Goa',
    category: 'waterfalls',
    altitude: '310m Cascade',
    mapX: 125,
    mapY: 515,
    climate: 'Wet Evergreen Rainforest',
    bestSeason: 'June to December',
    airport: 'Goa (GOX / GOI) 70 km',
    img: '/Dudhsagar_Falls.avif',
    aspect: 'aspect-[16/10]',
    desc: 'Four massive tiers of white mountain water plunging 310 meters down sheer jungle cliffs, crossed by a stone railway viaduct surrounded by deep rainforest.',
    highlights: ['310m Cascading Falls', 'Historic Railway Viaduct', 'Forest Sanctuary Safaris', 'Natural Plunge Pools'],
    travelTip: 'The scenic railway line passing in front of the waterfall spray provides an unforgettable window view of the white cascade.',
  },
  {
    id: 'andaman-reefs',
    title: 'Andaman Radhanagar Beach & Reefs',
    location: 'Havelock Island, Andaman & Nicobar',
    stateId: 'IN-AN',
    state: 'Andaman and Nicobar Islands',
    category: 'coastal',
    altitude: 'Sea Level',
    mapX: 535,
    mapY: 630,
    climate: 'Tropical Island Maritime',
    bestSeason: 'October to May',
    airport: 'Port Blair (IXZ) then Ferry to Havelock',
    img: '/Havelock_Radhanagar.webp',
    aspect: 'aspect-[16/10]',
    desc: 'White coral sands bordered by virgin rainforest and turquoise ocean waters. Celebrated for pristine barrier reefs and peaceful sunset shores.',
    highlights: ['Powdery White Sand Coast', 'Coral Reef Snorkeling', 'Night Kayaking in Bioluminescence', 'Elephant Beach Waters'],
    travelTip: 'Radhanagar beach faces west, making sunset walks along the curved bay especially serene and colorful.',
  },
  {
    id: 'sikkim-kanchenjunga',
    title: 'Yumthang Valley & Kanchenjunga',
    location: 'North Sikkim',
    stateId: 'IN-SK',
    state: 'Sikkim',
    category: 'mountains',
    altitude: '3,564m to 8,586m',
    mapX: 395,
    mapY: 235,
    climate: 'Himalayan Alpine Meadows',
    bestSeason: 'March to May (Rhododendron Season) & October to December',
    airport: 'Pakyong (PYG) 120 km or Bagdogra (IXB)',
    img: '/Himalaya.jpg',
    aspect: 'aspect-[3/4]',
    desc: 'A high Himalayan valley framed by snow summits and natural sulphur springs, where twenty-four species of wild rhododendrons bloom in spring.',
    highlights: ['24 Rhododendron Species', 'Zero Point Glacial Plain', 'Natural Hot Springs', 'Kanchenjunga Mountain Views'],
    travelTip: 'Spring brings brilliant shades of red, rose, and purple blossoms across the entire valley floor.',
  },
  {
    id: 'gulmarg-meadows',
    title: 'Gulmarg Meadows & Apharwat Peak',
    location: 'Baramulla, Jammu & Kashmir',
    stateId: 'IN-JK',
    state: 'Jammu and Kashmir',
    category: 'mountains',
    altitude: '2,650m to 3,980m',
    mapX: 135,
    mapY: 95,
    climate: 'Alpine Meadow & Winter Snow',
    bestSeason: 'May to September (Wildflowers) & December to March (Snow)',
    airport: 'Srinagar Airport (SXR) 56 km',
    img: '/Places/Gulmarg.jpg',
    aspect: 'aspect-[3/4]',
    desc: 'An open alpine bowl blanketed in wildflowers in summer, rising to 3,980 meters at Apharwat Peak via one of the highest cable cars in the world.',
    highlights: ['High Cable Car (3,980m)', 'Alpine Wildflower Meadows', 'Apharwat Mountain Lake', 'Winter Powder Slopes'],
    travelTip: 'The second stage of the cable car brings you directly to the alpine ridge with open views of distant Himalayan snow crests.',
  },
  {
    id: 'mizoram-green-hills',
    title: 'Lush Green Hills & Blue Mountains of Mizoram',
    location: 'Phawngpui & Reiek, Mizoram',
    stateId: 'IN-MZ',
    state: 'Mizoram',
    category: 'mountains',
    altitude: '2,157m (Phawngpui Summit)',
    mapX: 500,
    mapY: 335,
    climate: 'Subtropical Montane Rainforest & Evergreen Valleys',
    bestSeason: 'October to April (Misty Horizons & Clear Mountain Skies)',
    airport: 'Lengpui Airport (AJL) in Aizawl',
    img: '/Places/Mizoram.jpg',
    aspect: 'aspect-[16/10]',
    desc: 'Rolling emerald hills blanketed in virgin bamboo forests and mountain wildflowers, where morning mists drift through tranquil valleys and silent hill peaks.',
    highlights: ['Phawngpui Blue Mountain Sanctuary', 'Reiek Mountain Heritage Ridge', 'Misty Green Mountain Folds', 'Vantawng 229m Waterfall'],
    travelTip: 'Early mornings along Reiek Ridge offer panoramic views across endless waves of green mountain peaks emerging from soft white cloud valleys.',
  }
];

export default function NaturalWonders() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [selectedStateId, setSelectedStateId] = useState(null);
  const [activeModalSpot, setActiveModalSpot] = useState(null);

  const categories = [
    { id: 'all', label: 'All Landscapes (11)' },
    { id: 'mountains', label: 'Mountains & Treks' },
    { id: 'waterfalls', label: 'Waterfalls & Rainforests' },
    { id: 'backwaters', label: 'Backwaters & Lagoons' },
    { id: 'lakes', label: 'Alpine Lakes' },
    { id: 'coastal', label: 'Coral Islands & Beaches' },
  ];

  const naturalStateIds = Array.from(new Set(NATURAL_SPOTS.map(s => s.stateId)));

  const filteredSpots = NATURAL_SPOTS.filter(spot => {
    const matchesCategory = activeCategory === 'all' || spot.category === activeCategory;
    const matchesState = !selectedStateId || spot.stateId === selectedStateId;
    return matchesCategory && matchesState;
  });

  const handleStateClick = (stateId) => {
    if (naturalStateIds.includes(stateId)) {
      setSelectedStateId(prev => prev === stateId ? null : stateId);
    }
  };

  return (
    <div className="w-full bg-[#FAF7F0] min-h-screen py-16 px-4 sm:px-6 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Breadcrumb & Map Action */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#1E2A4F]/60">
            <Link to="/" className="hover:text-[#1E2A4F]">Home</Link>
            <span>/</span>
            <Link to="/tourism" className="hover:text-[#1E2A4F]">Tourism</Link>
            <span>/</span>
            <span className="text-[#0284C7] font-bold">Natural Wonders</span>
          </div>
          <Link
            to="/tourism"
            className="inline-flex items-center gap-2 self-start sm:self-auto px-4 py-1.5 rounded-xl bg-white border border-[#0284C7]/40 text-[#1E2A4F] hover:bg-[#1E2A4F] hover:text-white text-xs font-sans font-bold uppercase tracking-wider transition-colors shadow-2xs"
          >
            <span>🗺 Interactive State Map</span>
            <span className="text-[#D4AF37]">→</span>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <span className="text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-[#0284C7] block mb-2">
            Living Landscapes & Wilderness
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#1E2A4F] mb-3 leading-tight">
            Natural Wonders of India
          </h1>
          <div className="w-12 h-0.5 bg-[#0284C7] mx-auto mb-4" />
          <p className="text-sm sm:text-base font-serif italic text-[#1E2A4F]/80 leading-relaxed mb-6">
            Silent backwaters beneath palm leaves, living root bridges, and mountain summits touching the clouds.
          </p>

          {/* Minimal Thematic Guide Switcher */}
          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-white/70 backdrop-blur-xs rounded-2xl border border-[#D4AF37]/30 shadow-2xs max-w-fit mx-auto">
            <Link
              to="/unesco-sites"
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#FAF7F0] text-[#1E2A4F] border border-[#EBE5D9] text-xs font-sans font-semibold uppercase tracking-wider transition-colors"
            >
              Heritage Sites
            </Link>
            <Link
              to="/national-parks"
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#FAF7F0] text-[#1E2A4F] border border-[#EBE5D9] text-xs font-sans font-semibold uppercase tracking-wider transition-colors"
            >
              National Parks
            </Link>
            <span className="px-3.5 py-1.5 rounded-xl bg-[#1E2A4F] text-white text-xs font-sans font-semibold uppercase tracking-wider shadow-2xs">
              Natural Wonders
            </span>
            <Link
              to="/spiritual-heritage"
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#FAF7F0] text-[#1E2A4F] border border-[#EBE5D9] text-xs font-sans font-semibold uppercase tracking-wider transition-colors"
            >
              Spiritual Heritage
            </Link>
          </div>
        </div>

        {/* View Switcher & Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white p-3 sm:p-4 rounded-2xl border border-[#EBE5D9] shadow-xs">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  activeCategory === cat.id
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
          <div className="mb-12 bg-white rounded-3xl border border-[#0284C7]/30 p-6 sm:p-8 shadow-lg">
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
                    ${naturalStateIds.map(id => `
                      .india-map-container path#${id} {
                        fill: #E0F2FE !important;
                        stroke: #0284C7 !important;
                        stroke-width: 1.5px !important;
                      }
                    `).join('')}
                    ${selectedStateId ? `
                      .india-map-container path#${selectedStateId} {
                        fill: #0284C7 !important;
                        stroke: #162040 !important;
                        stroke-width: 2.5px !important;
                      }
                    ` : ''}
                    .india-map-container path:hover {
                      fill: #38BDF8 !important;
                      stroke: #162040 !important;
                      stroke-width: 2px !important;
                    }
                  `}</style>
                  <IndiaSvgMap onStateClick={handleStateClick}>
                    <g className="nature-pins-layer" style={{ pointerEvents: 'auto' }}>
                      {NATURAL_SPOTS.map((spot) => {
                        const isSelected = selectedStateId === spot.stateId;
                        return (
                          <g
                            key={spot.id}
                            transform={`translate(${spot.mapX || 200}, ${spot.mapY || 200})`}
                            className="cursor-pointer group"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStateId(spot.stateId);
                              setActiveModalSpot(spot);
                            }}
                          >
                            <circle
                              r={isSelected ? "6.5" : "5"}
                              fill="#0284C7"
                              stroke="#FFFFFF"
                              strokeWidth={isSelected ? "2" : "1.6"}
                              className="drop-shadow-md group-hover:scale-125 transition-transform duration-200"
                            />
                            <circle r="1.8" fill="#FFFFFF" />
                          </g>
                        );
                      })}
                    </g>
                  </IndiaSvgMap>
                </div>
                <p className="text-[11px] text-[#1E2A4F]/60 mt-3 text-center">
                  ✦ Click highlighted states or landscape pin dots to view regional wonders.
                </p>
              </div>

              {/* Summary Column */}
              <div className="lg:col-span-6 flex flex-col justify-center text-left">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0284C7] mb-1">
                  Scenic Landscape Map
                </span>
                <h3 className="text-2xl font-serif font-bold text-[#1E2A4F] mb-3">
                  {selectedStateId 
                    ? `Landscapes in this Region (${filteredSpots.length})` 
                    : 'Select a highlighted landscape state'}
                </h3>
                <p className="text-xs font-serif italic text-[#1E2A4F]/75 leading-relaxed mb-6">
                  {selectedStateId 
                    ? 'Natural landscapes, altitudes, and seasonal trekking conditions in this state:'
                    : 'Explore the natural geography of India, from high Himalayan glaciers in Sikkim to backwater lagoons, living root bridges, and coral bays.'}
                </p>

                {/* Mini list of spots for the state */}
                <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                  {filteredSpots.map(s => (
                    <div 
                      key={s.id} 
                      onClick={() => setActiveModalSpot(s)}
                      className="p-3 bg-[#FAF7F0] hover:bg-white rounded-xl border border-[#EBE5D9] hover:border-[#0284C7] transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={s.img} alt={s.title} loading="lazy" decoding="async" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                        <div className="min-w-0">
                          <h4 className="font-serif font-bold text-xs text-[#1E2A4F] truncate">{s.title}</h4>
                          <span className="text-[10px] text-gray-500 block truncate">{s.altitude} · {s.location}</span>
                        </div>
                      </div>
                      <span className="text-xs text-[#0284C7] font-bold shrink-0">Landscape Story →</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EDITORIAL SPOTS MASONRY GRID */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 [column-fill:_balance]">
          {filteredSpots.map((spot) => (
            <div
              key={spot.id}
              className="break-inside-avoid mb-8 w-full inline-block group bg-white rounded-2xl overflow-hidden border border-[#EBE5D9] hover:border-[#0284C7] shadow-xs hover:shadow-xl transition-all duration-500 hover:-translate-y-1 relative"
            >
              <div>
                {/* Image Container with Dynamic Aspect Ratio */}
                <div 
                  className={`relative w-full overflow-hidden bg-neutral-900 cursor-pointer ${spot.aspect || 'aspect-[16/10]'}`}
                  onClick={() => setActiveModalSpot(spot)}
                >
                  <img
                    src={spot.img}
                    alt={spot.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* State & Altitude Badge */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#162040]/80 backdrop-blur-xs text-white/90 text-[10px] font-medium tracking-wide">
                      {spot.state}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/95 text-[#0284C7] text-[10px] font-bold shadow-xs">
                      {spot.altitude.split(' ')[0]} {spot.altitude.split(' ')[1] || ''}
                    </span>
                  </div>

                  {/* Title */}
                  <div className="absolute bottom-3.5 left-4 right-4 text-left z-10">
                    <h3 className="font-serif font-bold text-xl text-white drop-shadow-xs">
                      {spot.title}
                    </h3>
                    <p className="text-white/80 text-xs font-sans tracking-wide mt-0.5 truncate">
                      {spot.location}
                    </p>
                  </div>
                </div>

                {/* Editorial Details */}
                <div className="p-6 text-left">
                  {/* Climate Chip */}
                  <div className="mb-2 text-[10.5px] text-[#0284C7] font-medium">
                    {spot.climate}
                  </div>

                  <p className="text-xs font-serif italic text-[#1E2A4F]/85 leading-relaxed mb-4">
                    {spot.desc}
                  </p>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {spot.highlights.map((h) => (
                      <span key={h} className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF7F0] border border-[#EBE5D9] text-[#162040]/85 font-medium">
                        {h}
                      </span>
                    ))}
                  </div>

                  {/* Best Season & Airport */}
                  <div className="pt-3 border-t border-[#FAF7F0] text-[11px] text-[#1E2A4F]/75 space-y-1">
                    <div>
                      <strong className="text-[#162040]">Best Season:</strong> {spot.bestSeason}
                    </div>
                    <div className="truncate">
                      <strong className="text-[#162040]">Gateway:</strong> {spot.airport}
                    </div>
                  </div>
                </div>
              </div>

              {/* Informative Action Buttons */}
              <div className="p-6 pt-0 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModalSpot(spot)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#162040] hover:bg-[#0B2540] text-white text-center text-xs font-bold uppercase tracking-wider transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Explore Story</span>
                  <span>→</span>
                </button>
                <Link
                  to={`/tourism?state=${spot.stateId}`}
                  className="py-2.5 px-3 rounded-xl border border-[#162040]/20 bg-white hover:bg-[#FAF7F0] text-[#162040] text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
                  title="View State Travel Guide"
                >
                  State Circuit →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* NATURAL SPOT FACTSHEET LIGHTBOX MODAL */}
        {activeModalSpot && (
          <div 
            className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in"
            onClick={() => setActiveModalSpot(null)}
          >
            <div 
              className="bg-white max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl border border-[#EBE5D9] max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header Image */}
              <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-neutral-900 shrink-0">
                <img 
                  src={activeModalSpot.img} 
                  alt={activeModalSpot.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <button
                  onClick={() => setActiveModalSpot(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20 z-10"
                >
                  ✕
                </button>
                <div className="absolute bottom-4 left-6 right-6 z-10">
                  <span className="px-2.5 py-0.5 rounded-sm bg-[#0284C7] text-white text-[10px] font-bold uppercase tracking-widest mb-1.5 inline-block">
                    {activeModalSpot.state} · {activeModalSpot.altitude}
                  </span>
                  <h3 className="font-serif font-bold text-2xl sm:text-3xl text-white">
                    {activeModalSpot.title}
                  </h3>
                  <p className="text-white/80 text-xs font-sans">
                    {activeModalSpot.location}
                  </p>
                </div>
              </div>

              {/* Modal Body Content */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-5 text-left">
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#1E2A4F] uppercase tracking-wider mb-2">
                    Landscape & Ecosystem
                  </h4>
                  <p className="text-xs sm:text-sm font-serif italic text-[#1E2A4F]/85 leading-relaxed">
                    {activeModalSpot.desc}
                  </p>
                </div>

                {/* Highlights */}
                <div>
                  <h4 className="font-serif font-bold text-xs text-[#1E2A4F] uppercase tracking-wider mb-2">
                    Key Highlights
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeModalSpot.highlights.map(h => (
                      <span key={h} className="text-xs px-3 py-1 rounded-lg bg-[#FAF7F0] border border-[#EBE5D9] text-[#162040] font-medium">
                        ✦ {h}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Exploration Insight */}
                <div className="bg-[#FAF7F0] border border-[#0284C7]/40 rounded-2xl p-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#0284C7] block mb-1">
                    ✦ Mountain & Waterway Insight
                  </span>
                  <p className="text-xs font-serif italic text-[#1E2A4F]/85 leading-relaxed">
                    {activeModalSpot.travelTip}
                  </p>
                </div>

                {/* Logistics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-[#1E2A4F]/80">
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <strong className="block text-[#162040] mb-0.5">Gateway Hub:</strong>
                    <span>{activeModalSpot.airport}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <strong className="block text-[#162040] mb-0.5">Optimal Season:</strong>
                    <span>{activeModalSpot.bestSeason}</span>
                  </div>
                </div>

                {/* Footer Link */}
                <div className="pt-4 border-t border-[#EBE5D9] flex items-center justify-between">
                  <Link
                    to={`/tourism?state=${activeModalSpot.stateId}`}
                    className="text-xs font-bold text-[#162040] hover:text-[#0284C7] flex items-center gap-1"
                  >
                    <span>View all destinations in {activeModalSpot.state}</span>
                    <span>→</span>
                  </Link>
                  <button
                    onClick={() => setActiveModalSpot(null)}
                    className="text-xs text-gray-500 hover:text-[#162040]"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Map Discovery Callout Banner */}
        <div className="mt-16 bg-white rounded-2xl border border-[#E6DFD3] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#0284C7] block mb-1">
              Geography & Natural Terrains
            </span>
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#1E2A4F] mb-1.5">
              Explore All 28 States on the Interactive Map
            </h3>
            <p className="text-xs sm:text-sm font-serif text-[#1E2A4F]/70 max-w-xl">
              Locate high altitude passes, coastal lagoons, and mountain valleys across India on our interactive travel map.
            </p>
          </div>
          <Link
            to="/tourism"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1E2A4F] text-white hover:bg-[#141D36] text-xs font-sans font-bold uppercase tracking-widest transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            <span>Open Interactive Map</span>
            <span className="text-[#D4AF37]">→</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
