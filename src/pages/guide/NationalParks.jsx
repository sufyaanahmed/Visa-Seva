import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import IndiaSvgMap from '../../components/IndiaSvgMap';

const NATIONAL_PARKS = [
  {
    id: 'nagarhole',
    title: 'Nagarhole & Bandipur Tiger Reserve',
    state: 'Karnataka',
    stateId: 'IN-KA',
    keyFauna: 'Black Panther, Asian Elephant, Bengal Tiger, Dhole',
    habitat: 'Moist Deciduous Woods & Nilgiri Biosphere Foothills',
    season: 'October to May (Peak Sightings: February to May)',
    airport: 'Mysore (MYQ) 75 km or Bangalore (BLR) 220 km',
    img: '/elephant.jpg',
    aspect: 'aspect-[3/4]',
    mapX: 185,
    mapY: 550,
    safariZones: 'Kabini River Boat Safari, Bandipur Core, Nagarhole Trail',
    desc: 'Ancient teak woods where the Kabini River curves through dense jungle. Home to rare melanistic black panthers and the largest congregation of wild Asian elephants in Asia.',
    highlights: ['Kabini River Boat Safari', 'Rare Black Panther Sightings', 'Asian Elephant Herds', 'Nilgiri Biosphere Corridors'],
    travelTip: 'Afternoon boat safaris along the Kabini River offer serene glimpses of wild elephant herds gathering at the water line.',
  },
  {
    id: 'tadoba',
    title: 'Tadoba Andhari Tiger Reserve',
    state: 'Maharashtra',
    stateId: 'IN-MH',
    keyFauna: 'Royal Bengal Tiger, Indian Leopard, Sloth Bear, Gaur',
    habitat: 'Dry Deciduous Teak Forest, Bamboo Thickets & Irai Lake',
    season: 'October to June (Peak Tiger Sightings: March to May)',
    airport: 'Nagpur Dr. Babasaheb Ambedkar (NAG) 140 km',
    img: '/tiger.jpg',
    aspect: 'aspect-[3/4]',
    mapX: 265,
    mapY: 410,
    safariZones: 'Moharli, Kolara, Navegaon Core Ranges',
    desc: 'The jewel of Vidarbha with deep bamboo thickets and red clay paths. Renowned as one of India’s most reliable landscapes for observing wild tiger families.',
    highlights: ['High Tiger Density', 'Irai Lake Safari', 'Sloth Bear Sightings', 'Ancient Gond Forest Heritage'],
    travelTip: 'Early morning drives near Moharli waterholes reveal tigers walking along the dust roads in golden morning sunlight.',
  },
  {
    id: 'mudumalai',
    title: 'Mudumalai & Nilgiri Biosphere',
    state: 'Tamil Nadu',
    stateId: 'IN-TN',
    keyFauna: 'Asian Elephant, Royal Bengal Tiger, Nilgiri Tahr, Gaur',
    habitat: 'Tropical Moist Deciduous & Shola Grassland Slopes',
    season: 'September to May',
    airport: 'Coimbatore (CJB) 160 km or Calicut (CCJ)',
    img: '/Places/Tamil_Nadu.jpg',
    aspect: 'aspect-[3/4]',
    mapX: 202,
    mapY: 578,
    safariZones: 'Theppakadu, Kargudi, Masinagudi Elephant Corridor',
    desc: 'Misty slopes where the Western Ghats meet the Eastern Ghats. Old elephant routes wind past giant teak trees and cool mountain streams.',
    highlights: ['Historic Theppakadu Sanctuary', 'Nilgiri Biosphere Heart', 'Endemic Nilgiri Langur', 'Moyar River Gorge'],
    travelTip: 'The buffer zone of Masinagudi at dusk provides rewarding views of elephant herds migrating toward forest watering holes.',
  },
  {
    id: 'similipal',
    title: 'Similipal & Bhitarkanika Sanctuaries',
    state: 'Odisha',
    stateId: 'IN-OR',
    keyFauna: 'Melanistic Black Tiger, Giant Estuarine Crocodile, King Cobra, Asian Elephant',
    habitat: 'Lush Sal Forests, Waterfalls & Mangrove Estuaries',
    season: 'November to June (Bhitarkanika: October to April)',
    airport: 'Bhubaneswar Biju Patnaik (BBI) 150 km',
    img: '/Places/Odisha.jpg',
    aspect: 'aspect-[4/5]',
    mapX: 410,
    mapY: 395,
    safariZones: 'Baripada, Pithabata, Dangamal Mangrove Creek',
    desc: 'Vast red-soil sal plateaus and mangrove waterways. The world’s unique home to wild melanistic tigers and pristine saltwater crocodile sanctuaries.',
    highlights: ['Rare Melanistic Tiger Habitat', 'Bhitarkanika Giant Crocodile Haven', 'Barehipani & Joranda Waterfalls', 'Olive Ridley Nesting Coasts'],
    travelTip: 'Creek cruises through Bhitarkanika at dawn offer peaceful views of sunning estuarine crocodiles in pristine tidal mangroves.',
  },
  {
    id: 'ranthambore',
    title: 'Ranthambore Tiger Reserve',
    state: 'Rajasthan',
    stateId: 'IN-RJ',
    keyFauna: 'Royal Bengal Tiger, Leopard, Marsh Crocodile',
    habitat: 'Dry Deciduous Teak & Ancient Banyan Groves',
    season: 'October to June (Peak Sightings: March to May)',
    airport: 'Jaipur (JAI) 160 km or Delhi (DEL)',
    img: '/Tiger1.jpg',
    aspect: 'aspect-[16/10]',
    mapX: 180,
    mapY: 275,
    safariZones: 'Zones 1 to 10 (Core Lake Zones 1 to 5)',
    desc: 'Golden scrub forests beneath the stone ramparts of the 10th-century fort. Tigers move quietly among ancient banyan roots and water lilies of Padam Talao.',
    highlights: ['Diurnal Tiger Tracking', 'Ancient 10th-Century Fortress', 'Padam Talao Lake Safaris', '300+ Forest Bird Species'],
    travelTip: 'Core zones 1 through 5 around Padam Talao offer quiet morning views of tigers resting near the lake water.',
  },
  {
    id: 'gir',
    title: 'Gir Asiatic Lion Sanctuary',
    state: 'Gujarat',
    stateId: 'IN-GJ',
    keyFauna: 'Asiatic Lion, Indian Leopard, Chousingha Antelope',
    habitat: 'Dry Teak Forest & Rocky Scrub Valleys',
    season: 'December to April (Closed Mid-June to Mid-October)',
    airport: 'Rajkot (HSR) 160 km or Ahmedabad (AMD)',
    img: '/Gir_Lion.avif',
    aspect: 'aspect-[16/10]',
    mapX: 78,
    mapY: 372,
    safariZones: 'Gir Jungle Trail & Devalia Park',
    desc: 'The only home on earth for the wild Asiatic lion. Rugged teak hills and dry streams shared with the pastoral Maldhari forest dwellers.',
    highlights: ['Sole Asiatic Lion Refuge', 'Maldhari Forest Culture', 'Four-Horned Chousingha', 'Hiran River Waterholes'],
    travelTip: 'The first morning safari at 06:00 AM brings the best chance to spot lion prides resting together in the cool dawn air.',
  },
  {
    id: 'kaziranga',
    title: 'Kaziranga National Park',
    state: 'Assam',
    stateId: 'IN-AS',
    keyFauna: 'One-Horned Rhinoceros, Wild Buffalo, Asian Elephant',
    habitat: 'Brahmaputra Floodplain & Tall Elephant Grass',
    season: 'November to April (Closed May to October)',
    airport: 'Guwahati (GAU) 217 km or Jorhat (JRH)',
    img: '/Kaziranga_Rhino.avif',
    aspect: 'aspect-[16/10]',
    mapX: 520,
    mapY: 260,
    safariZones: 'Central (Kohora) & Western (Bagori) Ranges',
    desc: 'Vast grasslands along the floodplains of the Brahmaputra River. Two-thirds of the world’s one-horned rhinoceroses graze quietly among marsh waters.',
    highlights: ['2,400+ One-Horned Rhinos', 'Wild Water Buffalo Herds', 'Brahmaputra Flood Ecology', 'Waterfowl Colonies'],
    travelTip: 'The Bagori range in early morning light brings peaceful close encounters with grazing rhinos across the grass meadows.',
  },
  {
    id: 'hemis',
    title: 'Hemis High Altitude Sanctuary',
    state: 'Ladakh',
    stateId: 'IN-LA',
    keyFauna: 'Snow Leopard, Tibetan Wolf, Blue Sheep (Bharal)',
    habitat: 'High Alpine Himalayan Ridges (3,300m to 6,000m)',
    season: 'December to March (Winter Snow Leopard Trails)',
    airport: 'Leh Kushok Bakula Rimpochee Airport (IXL)',
    img: '/Hemis_Leopard.avif',
    aspect: 'aspect-[16/10]',
    mapX: 195,
    mapY: 90,
    safariZones: 'Rumbak Valley & Husing Nala',
    desc: 'The highest mountain sanctuary in the world. Silent snow ridges and stone gorges where the elusive snow leopard walks above ancient Buddhist monasteries.',
    highlights: ['Snow Leopard Habitat', 'Rumbak Mountain Valley', 'Blue Sheep & Golden Eagles', '17th-Century Hemis Gompa'],
    travelTip: 'Allow two quiet rest days in Leh to acclimatize before walking the mountain paths of Rumbak Valley.',
  },
  {
    id: 'periyar',
    title: 'Periyar Lake & Elephant Sanctuary',
    state: 'Kerala',
    stateId: 'IN-KL',
    keyFauna: 'Wild Asian Elephant, Bengal Tiger, Nilgiri Tahr',
    habitat: 'Tropical Wet Evergreen Rainforest & Mountain Lake',
    season: 'September to May',
    airport: 'Cochin (COK) 140 km or Madurai (IXM)',
    img: '/Periyar_Elephants.avif',
    aspect: 'aspect-[16/10]',
    mapX: 198,
    mapY: 625,
    safariZones: 'Periyar Lake Boat Safaris & Bamboo Rafting',
    desc: 'Evergreen hills and spice slopes surrounding a peaceful mountain lake. Wild elephant herds arrive at dawn to drink and bathe along the water’s edge.',
    highlights: ['Quiet Water Safaris', 'Wild Asian Elephant Herds', 'Bamboo Raft Expeditions', 'Cardamom Hills Trails'],
    travelTip: 'Morning bamboo rafting across the quiet lake waters offers silent, engine-free views of wild elephants grazing along the banks.',
  },
  {
    id: 'corbett',
    title: 'Jim Corbett & Ramganga Sanctuary',
    state: 'Uttarakhand',
    stateId: 'IN-UT',
    keyFauna: 'Gharial Crocodile, Bengal Tiger, Asian Elephant',
    habitat: 'Sub-Himalayan Sal Woods & River Valley',
    season: 'Mid-November to Mid-June (Dhikala Zone)',
    airport: 'Dehradun (DED) 160 km or Delhi (DEL)',
    img: '/Gharial.jpg',
    aspect: 'aspect-[16/10]',
    mapX: 232,
    mapY: 185,
    safariZones: 'Dhikala, Bijrani, Jhirna, Dhela',
    desc: 'Foothills where the Ramganga River winds through sal forests. Critically endangered long-snouted Gharials bask on sunlit river stones beside wild tiger tracks.',
    highlights: ['Endangered Gharial Haven', 'Ramganga River Valley', 'Dhikala Core Grasslands', 'Historic Forest Rest Houses'],
    travelTip: 'Watch for Gharials resting quietly on river sandbanks from the Dhikala watchtower overlooking the Ramganga basin.',
  },
  {
    id: 'sundarbans',
    title: 'Sundarbans Mangrove Delta',
    state: 'West Bengal',
    stateId: 'IN-WB',
    keyFauna: 'Swimming Bengal Tiger, Estuarine Crocodile, River Dolphin',
    habitat: 'Tidal Halophytic Mangrove Estuary',
    season: 'October to March',
    airport: 'Kolkata Netaji Subhash Chandra Bose (CCU)',
    img: '/peacock.jpg',
    aspect: 'aspect-[3/4]',
    mapX: 438,
    mapY: 368,
    safariZones: 'Sajnekhali, Sudhanyakhali, Dobanki Walk',
    desc: 'The world’s largest mangrove forest spanning the Ganges delta. Home to tigers adapted to tidal rivers and quiet estuarine waterways.',
    highlights: ['World’s Largest Mangrove Delta', 'Swimming Bengal Tigers', 'Silent Boat-Only Safaris', 'High Canopy Walkways'],
    travelTip: 'Low tide hours are best for watching mudflats where estuarine crocodiles and deer emerge into the sun.',
  },
  {
    id: 'kanha',
    title: 'Kanha & Bandhavgarh Reserves',
    state: 'Madhya Pradesh',
    stateId: 'IN-MP',
    keyFauna: 'Bengal Tiger, Hard-Ground Barasingha Deer, Leopard',
    habitat: 'Sal Woods, Bamboo Glades & Open Grass Maidans',
    season: 'October to June (Peak Sightings: February to May)',
    airport: 'Jabalpur (JLR) 160 km or Raipur (RPR)',
    img: '/Kanha.jpg',
    aspect: 'aspect-[3/4]',
    mapX: 295,
    mapY: 345,
    safariZones: 'Mukki, Kanha, Sarhi & Tala (Bandhavgarh)',
    desc: 'Lush central Indian sal forests that inspired classic jungle lore. Open meadows where rescued swamp deer graze alongside dense tiger populations.',
    highlights: ['Central Sal Meadows', 'Highest Tiger Density at Tala', 'Barasingha Swamp Deer', 'Ancient Hilltop Fort Ruins'],
    travelTip: 'Early morning drives in Mukki zone offer quiet misty views across the frost-touched sal maidans.',
  }
];

export default function NationalParks() {
  const [selectedState, setSelectedState] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [activeModalPark, setActiveModalPark] = useState(null);
  const [hoveredPinPark, setHoveredPinPark] = useState(null);

  const parkStateIds = Array.from(new Set(NATIONAL_PARKS.map(p => p.stateId)));
  const uniqueStates = ['all', ...Array.from(new Set(NATIONAL_PARKS.map(p => p.state)))];

  const filteredParks = selectedState === 'all'
    ? NATIONAL_PARKS
    : NATIONAL_PARKS.filter(p => p.state === selectedState || p.stateId === selectedState);

  const handleStateClick = (stateId) => {
    if (parkStateIds.includes(stateId)) {
      setSelectedState(prev => prev === stateId ? 'all' : stateId);
    }
  };

  const handlePinClick = (park, e) => {
    e.stopPropagation();
    setSelectedState(park.state);
  };

  return (
    <div className="w-full bg-[#FAF7F0] min-h-screen py-16 px-4 sm:px-6 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-xs uppercase tracking-widest text-[#1E2A4F]/60">
          <Link to="/" className="hover:text-[#1E2A4F]">Home</Link>
          <span>/</span>
          <span className="text-[#C4762A] font-bold">National Parks & Wild Sanctuaries</span>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <span className="text-xs font-sans font-bold uppercase tracking-[0.25em] text-[#2E7D32] mb-2 block">
            Protected Sanctuaries
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#1E2A4F] mb-3 leading-tight">
            National Parks of India
          </h1>
          <div className="w-12 h-0.5 bg-[#2E7D32] mx-auto mb-4" />
          <p className="text-sm sm:text-base font-serif italic text-[#1E2A4F]/80 leading-relaxed">
            From the quiet gaze of the tiger in ancient banyans to lions of Gir, elephant river trails, and high snow leopard passes.
          </p>
        </div>

        {/* View Switcher & Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white p-3 sm:p-4 rounded-2xl border border-[#EBE5D9] shadow-xs">
          {/* State Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {uniqueStates.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedState(st)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  selectedState === st
                    ? 'bg-[#162040] text-white shadow-xs'
                    : 'bg-[#FAF7F0] text-[#162040]/80 hover:bg-[#EBE5D9]'
                }`}
              >
                {st === 'all' ? `All Sanctuaries (${NATIONAL_PARKS.length})` : st}
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

        {/* MAP EXPLORER VIEW */}
        {viewMode === 'map' && (
          <div className="mb-12 bg-white rounded-3xl border border-[#EBE5D9] p-6 sm:p-8 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Map Column */}
              <div className="lg:col-span-6 flex flex-col items-center">
                <div className="w-full max-w-[440px] relative">
                  <style>{`
                    .india-map-container path {
                      fill: #F5EFE6 !important;
                      stroke: #D4AF37 !important;
                      stroke-width: 0.8px !important;
                      cursor: pointer !important;
                      transition: all 0.3s ease !important;
                    }
                    ${parkStateIds.map(id => `
                      .india-map-container path#${id} {
                        fill: #DCE8D8 !important;
                        stroke: #2E7D32 !important;
                        stroke-width: 1.5px !important;
                      }
                    `).join('')}
                    ${selectedState !== 'all' ? `
                      .india-map-container path#${NATIONAL_PARKS.find(p => p.state === selectedState || p.stateId === selectedState)?.stateId || selectedState} {
                        fill: #2E7D32 !important;
                        stroke: #162040 !important;
                        stroke-width: 2.5px !important;
                      }
                    ` : ''}
                    .india-map-container path:hover {
                      fill: #81C784 !important;
                      stroke: #162040 !important;
                      stroke-width: 2px !important;
                    }
                  `}</style>
                  <IndiaSvgMap onStateClick={handleStateClick}>
                    {/* Render pinpoint dots for each reserve */}
                    <g className="sanctuary-pinpoints" style={{ pointerEvents: 'auto' }}>
                      {NATIONAL_PARKS.map((park) => {
                        const isHighlighted = selectedState === 'all' || selectedState === park.state || selectedState === park.stateId;
                        const isHovered = hoveredPinPark?.id === park.id;
                        
                        return (
                          <g
                            key={park.id}
                            className="cursor-pointer transition-transform duration-200"
                            onClick={(e) => handlePinClick(park, e)}
                            onMouseEnter={() => setHoveredPinPark(park)}
                            onMouseLeave={() => setHoveredPinPark(null)}
                          >
                            {/* Pulse radar ring for active / all pins */}
                            {isHighlighted && (
                              <circle
                                cx={park.mapX}
                                cy={park.mapY}
                                r={isHovered ? 14 : 9}
                                fill="#2E7D32"
                                opacity="0.3"
                                className="animate-pulse"
                              />
                            )}

                            {/* Outer dot ring */}
                            <circle
                              cx={park.mapX}
                              cy={park.mapY}
                              r={isHovered ? 8 : 5.5}
                              fill={isHighlighted ? '#2E7D32' : '#8D9B87'}
                              stroke="#FFFFFF"
                              strokeWidth={isHovered ? 2.5 : 1.5}
                              className="transition-all duration-200"
                            />

                            {/* Inner dot center */}
                            <circle
                              cx={park.mapX}
                              cy={park.mapY}
                              r={isHovered ? 3.5 : 2}
                              fill={isHovered ? '#D4AF37' : '#FFFFFF'}
                              className="transition-all duration-200"
                            />

                            {/* Interactive Pin Hover Label */}
                            {isHovered && (
                              <g transform={`translate(${park.mapX}, ${park.mapY - 14})`}>
                                <rect
                                  x="-55"
                                  y="-20"
                                  width="110"
                                  height="20"
                                  rx="4"
                                  fill="#162040"
                                  opacity="0.95"
                                />
                                <text
                                  x="0"
                                  y="-6"
                                  textAnchor="middle"
                                  fill="#FFFFFF"
                                  fontSize="8.5"
                                  fontWeight="bold"
                                  fontFamily="sans-serif"
                                >
                                  {park.title.split(' ')[0]}
                                </text>
                              </g>
                            )}
                          </g>
                        );
                      })}
                    </g>
                  </IndiaSvgMap>
                </div>
                <p className="text-[11px] text-[#1E2A4F]/60 mt-3 text-center">
                  Click highlighted states or sanctuary pin dots to explore regional reserves.
                </p>
              </div>

              {/* Summary Column */}
              <div className="lg:col-span-6 flex flex-col justify-center text-left">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2E7D32] mb-1">
                  Sanctuary Biosphere Map
                </span>
                <h3 className="text-2xl font-serif font-bold text-[#1E2A4F] mb-3">
                  {selectedState !== 'all' 
                    ? `Sanctuaries in ${selectedState} (${filteredParks.length})` 
                    : `India Protected Wildlife Reserves (${NATIONAL_PARKS.length})`}
                </h3>
                <p className="text-xs font-serif italic text-[#1E2A4F]/75 leading-relaxed mb-6">
                  {selectedState !== 'all' 
                    ? 'Protected wildlife reserves, key species, and visiting seasons in this state:'
                    : 'Interactive pinpoint dots locate India’s premier protected tiger reserves, Asiatic lion forests, elephant corridors, and high-altitude snow leopard habitats.'}
                </p>

                {/* Mini list of parks for the state */}
                <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                  {filteredParks.map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => setActiveModalPark(p)}
                      className="p-3 bg-[#FAF7F0] hover:bg-white rounded-xl border border-[#EBE5D9] hover:border-[#2E7D32] transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={p.img} alt={p.title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[9px] px-1.5 py-0.2 rounded-sm bg-[#2E7D32]/15 text-[#2E7D32] font-bold">
                              {p.state}
                            </span>
                          </div>
                          <h4 className="font-serif font-bold text-xs text-[#1E2A4F] truncate">{p.title}</h4>
                          <span className="text-[10px] text-gray-500 block truncate">{p.keyFauna}</span>
                        </div>
                      </div>
                      <span className="text-xs text-[#2E7D32] font-bold shrink-0">Field Notes →</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EDITORIAL PARKS MASONRY GRID */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 [column-fill:_balance]">
          {filteredParks.map((park) => (
            <div
              key={park.id}
              className="break-inside-avoid mb-8 w-full inline-block group bg-white rounded-2xl overflow-hidden border border-[#EBE5D9] hover:border-[#1E2A4F]/30 shadow-xs hover:shadow-xl transition-all duration-500 hover:-translate-y-1 relative"
            >
              <div>
                {/* Image Container with Dynamic Aspect Ratio */}
                <div 
                  className={`relative w-full overflow-hidden bg-neutral-900 cursor-pointer ${park.aspect || 'aspect-[16/10]'}`}
                  onClick={() => setActiveModalPark(park)}
                >
                  <img
                    src={park.img}
                    alt={park.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* State & Habitat Badge */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#162040]/80 backdrop-blur-xs text-white/90 text-[10px] font-medium tracking-wide">
                      {park.state}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/95 text-[#2E7D32] text-[10px] font-bold shadow-xs">
                      Protected Reserve
                    </span>
                  </div>

                  {/* Title */}
                  <div className="absolute bottom-3.5 left-4 right-4 text-left z-10">
                    <h3 className="font-serif font-bold text-xl text-white drop-shadow-xs">
                      {park.title}
                    </h3>
                  </div>
                </div>

                {/* Editorial Details */}
                <div className="p-6 text-left">
                  {/* Key Species */}
                  <div className="mb-3">
                    <div className="text-[10.5px] font-sans font-bold text-[#C4762A] uppercase tracking-wider mb-0.5">
                      Key Species:
                    </div>
                    <p className="text-xs font-serif font-medium text-[#162040]">
                      {park.keyFauna}
                    </p>
                  </div>

                  <p className="text-xs font-serif italic text-[#1E2A4F]/85 leading-relaxed mb-4">
                    {park.desc}
                  </p>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {park.highlights.map((h) => (
                      <span key={h} className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF7F0] border border-[#EBE5D9] text-[#162040]/85 font-medium">
                        {h}
                      </span>
                    ))}
                  </div>

                  {/* Safari Timing & Airport */}
                  <div className="pt-3 border-t border-[#FAF7F0] text-[11px] text-[#1E2A4F]/75 space-y-1">
                    <div>
                      <strong className="text-[#162040]">Best Season:</strong> {park.season}
                    </div>
                    <div className="truncate">
                      <strong className="text-[#162040]">Gateway:</strong> {park.airport}
                    </div>
                  </div>
                </div>
              </div>

              {/* Informative Action Buttons */}
              <div className="p-6 pt-0 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModalPark(park)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#162040] hover:bg-[#0B2540] text-white text-center text-xs font-bold uppercase tracking-wider transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Field Guide</span>
                  <span>→</span>
                </button>
                <Link
                  to={`/tourism?state=${park.stateId}`}
                  className="py-2.5 px-3 rounded-xl border border-[#162040]/20 bg-white hover:bg-[#FAF7F0] text-[#162040] text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
                  title="View State Travel Guide"
                >
                  State Circuit →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* SAFARI FACTSHEET LIGHTBOX MODAL */}
        {activeModalPark && (
          <div 
            className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in"
            onClick={() => setActiveModalPark(null)}
          >
            <div 
              className="bg-white max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl border border-[#EBE5D9] max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header Image */}
              <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-neutral-900 shrink-0">
                <img 
                  src={activeModalPark.img} 
                  alt={activeModalPark.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <button
                  onClick={() => setActiveModalPark(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20 z-10"
                >
                  ✕
                </button>
                <div className="absolute bottom-4 left-6 right-6 z-10">
                  <span className="px-2.5 py-0.5 rounded-sm bg-[#2E7D32] text-white text-[10px] font-bold uppercase tracking-widest mb-1.5 inline-block">
                    {activeModalPark.state} · Protected Sanctuary
                  </span>
                  <h3 className="font-serif font-bold text-2xl sm:text-3xl text-white">
                    {activeModalPark.title}
                  </h3>
                  <p className="text-white/80 text-xs font-sans">
                    Habitat: {activeModalPark.habitat}
                  </p>
                </div>
              </div>

              {/* Modal Body Content */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-5 text-left">
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#1E2A4F] uppercase tracking-wider mb-2">
                    Forest Ecosystem
                  </h4>
                  <p className="text-xs sm:text-sm font-serif italic text-[#1E2A4F]/85 leading-relaxed">
                    {activeModalPark.desc}
                  </p>
                </div>

                {/* Key Protected Fauna */}
                <div>
                  <h4 className="font-serif font-bold text-xs text-[#1E2A4F] uppercase tracking-wider mb-2">
                    Protected Fauna
                  </h4>
                  <p className="text-xs text-[#162040] font-serif bg-[#FAF7F0] p-3 rounded-xl border border-[#EBE5D9]">
                    {activeModalPark.keyFauna}
                  </p>
                </div>

                {/* Field Notes */}
                <div className="bg-[#FAF7F0] border border-[#2E7D32]/40 rounded-2xl p-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#2E7D32] block mb-1">
                    Field Observation Note
                  </span>
                  <p className="text-xs font-serif italic text-[#1E2A4F]/85 leading-relaxed mb-2">
                    {activeModalPark.travelTip}
                  </p>
                  <span className="text-[11px] text-gray-600 block">
                    <strong>Permitted Zones:</strong> {activeModalPark.safariZones}
                  </span>
                </div>

                {/* Logistics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-[#1E2A4F]/80">
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <strong className="block text-[#162040] mb-0.5">Gateway Airport:</strong>
                    <span>{activeModalPark.airport}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <strong className="block text-[#162040] mb-0.5">Best Sighting Season:</strong>
                    <span>{activeModalPark.season}</span>
                  </div>
                </div>

                {/* Footer Link */}
                <div className="pt-4 border-t border-[#EBE5D9] flex items-center justify-between">
                  <Link
                    to={`/tourism?state=${activeModalPark.stateId}`}
                    className="text-xs font-bold text-[#162040] hover:text-[#2E7D32] flex items-center gap-1"
                  >
                    <span>View all destinations in {activeModalPark.state}</span>
                    <span>→</span>
                  </Link>
                  <button
                    onClick={() => setActiveModalPark(null)}
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
