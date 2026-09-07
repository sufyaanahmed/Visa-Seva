import React, { useState, useEffect } from 'react';
import IndiaSvgMap from "../components/IndiaSvgMap";

const destinations = [
  { img: '/Places/Assam.jpg', title: 'Assam', desc: 'Journey through emerald tea gardens where the morning mist rolls like a slow river. Let the mighty Brahmaputra wash over your soul.' },
  { img: '/Places/Bangalore.jpg', title: 'Bangalore', desc: 'Where the pulse of tomorrow beats beneath ancient rain trees. A city of gardens that blooms with the energy of a billion dreams.' },
  { img: '/Places/Bhopal.jpg', title: 'Bhopal', desc: 'Twin lakes reflecting the whispers of bygone nawabs. Step into a city where history and nature dance an eternal waltz.' },
  { img: '/Dal_lake.jpg', title: 'Dal Lake', desc: 'A mirror of heaven reflecting the mighty Himalayas. Drift softly on wooden shikaras through a floating paradise of lotus blooms.' },
  { img: '/Places/Delhi.jpg', title: 'Delhi', desc: 'The beating heart of India, where empires have risen and fallen like the tides. Walk through centuries of history etched in sandstone.' },
  { img: '/Gir_Lion.avif', title: 'Gir National Park', desc: 'Into the wild domain of the majestic Asiatic lion. Feel the raw, untamed spirit of the forest awaken your primal senses.' },
  { img: '/Places/Goa.jpg', title: 'Goa', desc: 'Where golden sands meet the rhythmic crash of the Arabian Sea. Let the ocean breeze wash away your worries under a painted sunset.' },
  { img: '/Places/Gujarat.jpg', title: 'Gujarat', desc: 'A vibrant tapestry of color spread across the great white desert. Experience a land where ancient legends are spun in silk.' },
  { img: '/Places/Gulmarg.jpg', title: 'Gulmarg', desc: 'Meadows of flowers blanketed in pristine, untouched snow. Breathe the crisp mountain air at the very edge of the world.' },
  { img: '/Places/Hyderabad.jpg', title: 'Hyderabad', desc: 'Where the scent of biryani mingles with the echoes of the Charminar. A royal city where tradition glistens like rare pearls.' },
  { img: '/Places/Jaipur.jpg', title: 'Jaipur', desc: 'Step into a realm of sun-drenched palaces and timeless royal intrigue. The Pink City whispers legends of forgotten kings on the desert wind.' },
  { img: '/Places/Kashmir.jpg', title: 'Kashmir', desc: 'Paradise on earth, veiled in mist and emerald valleys. Let the song of the Chinar trees serenade your wandering spirit.' },
  { img: '/Kerala_backwaters.avif', title: 'Kerala', desc: 'Drift through emerald waters under a canopy of ancient palms. Let the silent backwaters carry you to a world untouched by time.' },
  { img: '/Places/Kolkata.jpg', title: 'Kolkata', desc: 'The city of joy, echoing with the poetry of Tagore and colonial charm. Lose yourself in the soul-stirring rhythm of its vibrant streets.' },
  { img: '/Places/Ladakh.jpg', title: 'Ladakh', desc: 'A barren paradise crowning the roof of the world. Discover serene monasteries clinging to the edge of the sky.' },
  { img: '/Living_Root_Bridge.avif', title: 'Meghalaya', desc: 'The abode of clouds, where living root bridges cross rushing torrents. Enter a mystical land where rain paints the world a thousand shades of green.' },
  { img: '/Places/Mumbai.jpg', title: 'Mumbai', desc: 'The city of dreams that never sleeps, rising from the restless sea. Feel the electric pulse of a metropolis that defies the impossible.' },
  { img: '/Places/Mysore.jpg', title: 'Mysore', desc: 'A city draped in silk and illuminated by the glow of a thousand palace lights. Walk the paths of royalty surrounded by the scent of sandalwood.' },
  { img: '/Places/Ooty.jpg', title: 'Ooty', desc: 'Rolling hills blanketed in blue blooms and the aroma of eucalyptus. Escape to a mountain retreat that feels like a forgotten fairytale.' },
  { img: '/Places/Rajasthan.jpg', title: 'Rajasthan', desc: 'A land of golden dunes and invincible forts standing against time. Hear the ballads of valor carried on the desert wind.' },
  { img: '/Places/Shimla.jpg', title: 'Shimla', desc: 'A colonial gem nestled amidst snow-draped peaks. Wander through mist-laden pine forests where the air holds the chill of history.' },
  { img: '/Places/Sikkim.jpg', title: 'Sikkim', desc: 'A hidden kingdom of orchids and ancient Buddhist chants. Stand in the shadow of Kanchenjunga and feel the earth touch the heavens.' },
  { img: '/Places/Srinagar.jpg', title: 'Srinagar', desc: 'A summer capital cradled by mountains and shimmering waters. Experience the melancholic beauty of a city wrapped in eternal romance.' },
  { img: '/Taj_Mahal.jpg', title: 'Taj Mahal', desc: "A monument of marble born from an emperor's undying love. Witness a timeless romance etched in stone at the edge of the Yamuna." },
  { img: '/Places/Tamil_Nadu.jpg', title: 'Tamil Nadu', desc: 'A glorious peninsula of towering temple gopurams and classical rhythms. Journey into the ancient soul of the Dravidian heartland.' },
  { img: '/Places/Varanasi.jpg', title: 'Varanasi', desc: "Where the sacred river meets the eternal fires of devotion. Experience the spiritual heart of the world at dawn's golden hour." },
  { img: '/Places/Vizag.jpg', title: 'Visakhapatnam', desc: 'Where the lush Eastern Ghats plunge into the azure Bay of Bengal. Discover a coastal jewel glistening with untold marine secrets.' },
  { img: '/Places/Andaman_Nicobar.jpg', title: 'Andaman & Nicobar Islands', desc: 'Pristine white-sand beaches surrounded by crystal-clear turquoise waters. A tropical haven for marine life and vibrant coral reefs.' },
  { img: '/Places/Odisha.jpg', title: 'Odisha', desc: 'Where the Sun Temple of Konark stands as a testament to ancient architectural marvels. Discover golden beaches and deeply rooted tribal heritage.' },
  { img: '/Places/Punjab.jpg', title: 'Punjab', desc: 'The land of five rivers, resonating with the golden glow of the Harmandir Sahib. Experience boundless warmth and vibrant harvest festivals.' },
  { img: '/Places/Uttarakhand.jpg', title: 'Uttarakhand', desc: 'The land of the gods, nestled in the majestic Himalayas. A spiritual sanctuary offering serene hill stations and sacred pilgrimage routes.' }
];



const stateToDestinations = {
  'IN-AS': ['Assam'],
  'IN-KA': ['Bangalore', 'Mysore'],
  'IN-MP': ['Bhopal'],
  'IN-JK': ['Dal Lake', 'Gulmarg', 'Kashmir', 'Srinagar', 'Ladakh'],
  'IN-LA': ['Ladakh'],
  'IN-DL': ['Delhi'],
  'IN-GJ': ['Gir National Park', 'Gujarat'],
  'IN-GA': ['Goa'],
  'IN-TG': ['Hyderabad'],
  'IN-RJ': ['Jaipur', 'Rajasthan'],
  'IN-KL': ['Kerala'],
  'IN-WB': ['Kolkata'],
  'IN-ML': ['Meghalaya'],
  'IN-MH': ['Mumbai'],
  'IN-TN': ['Ooty', 'Tamil Nadu'],
  'IN-HP': ['Shimla'],
  'IN-SK': ['Sikkim'],
  'IN-UP': ['Taj Mahal', 'Varanasi'],
  'IN-AP': ['Visakhapatnam'],
  'IN-PB': ['Punjab'],
  'IN-AN': ['Andaman & Nicobar Islands'],
  'IN-OR': ['Odisha'],
  'IN-UT': ['Uttarakhand']
};

const stateDescriptions = {
  'IN-AS': { name: 'Assam', desc: 'Renowned for its rolling tea estates, the mighty Brahmaputra river, and rich wildlife including the rare one-horned rhinoceros.' },
  'IN-KA': { name: 'Karnataka', desc: 'A majestic blend of ancient ruins in Hampi, royal palaces in Mysore, lush Western Ghats, and the vibrant tech-hub of Bangalore.' },
  'IN-MP': { name: 'Madhya Pradesh', desc: 'The heart of India, famous for its majestic tiger reserves, ancient Khajuraho temples, and deeply rooted heritage.' },
  'IN-JK': { name: 'Jammu & Kashmir', desc: 'Often called Paradise on Earth, known for its breathtaking alpine scenery, Dal Lake shikaras, and tranquil Mughal gardens.' },
  'IN-LA': { name: 'Ladakh', desc: 'A high-altitude desert renowned for its starkly beautiful landscapes, crystal-clear lakes, and ancient cliffside Buddhist monasteries.' },
  'IN-DL': { name: 'Delhi', desc: 'A bustling metropolis that seamlessly bridges two different eras with its historic Mughal monuments and modern urban vibrancy.' },
  'IN-GJ': { name: 'Gujarat', desc: 'Home to the Asiatic lion, the vast white salt desert of the Rann of Kutch, and a deeply rooted mercantile culture woven in silk.' },
  'IN-GA': { name: 'Goa', desc: 'Famous for its pristine golden beaches, laid-back coastal vibe, Portuguese colonial architecture, and vibrant sunset nightlife.' },
  'IN-TG': { name: 'Telangana', desc: 'A culturally rich state known for the historic Charminar, delectable Hyderabadi Biryani, and the ancient Golconda fort.' },
  'IN-RJ': { name: 'Rajasthan', desc: 'The land of kings, defined by its golden sand dunes, invincible majestic forts, opulent palaces, and vibrant folklore.' },
  'IN-KL': { name: 'Kerala', desc: "God's Own Country, celebrated for its tranquil palm-fringed backwaters, golden beaches, and rejuvenating Ayurvedic retreats." },
  'IN-WB': { name: 'West Bengal', desc: 'A cultural melting pot known for the Sunderbans mangrove forest, colonial-era architecture, and a deeply intellectual literary heritage.' },
  'IN-ML': { name: 'Meghalaya', desc: 'The abode of clouds, famous for its mesmerizing living root bridges, stunning monsoon waterfalls, and lush emerald hills.' },
  'IN-MH': { name: 'Maharashtra', desc: 'A diverse state featuring the bustling city of Mumbai, ancient rock-cut caves of Ajanta and Ellora, and the pristine Western Ghats.' },
  'IN-TN': { name: 'Tamil Nadu', desc: 'The spiritual heart of South India, distinguished by its monumental intricately-carved temple gopurams and classical arts.' },
  'IN-HP': { name: 'Himachal Pradesh', desc: 'A Himalayan haven offering breathtaking mountain vistas, serene misty hill stations, and thrilling adventure sports.' },
  'IN-SK': { name: 'Sikkim', desc: 'A pristine Himalayan kingdom known for its stunning orchids, majestic views of Mount Kanchenjunga, and serene Buddhist culture.' },
  'IN-UP': { name: 'Uttar Pradesh', desc: 'The spiritual heartland of India, home to the iconic monument of love, the Taj Mahal, and the sacred eternal ghats of Varanasi.' },
  'IN-AP': { name: 'Andhra Pradesh', desc: 'Known for its rich cultural heritage, ancient pilgrimage temples, and beautiful coastal landscapes along the azure Bay of Bengal.' },
  'IN-PB': { name: 'Punjab', desc: 'Known for its lush green fields, the magnificent Golden Temple in Amritsar, and a culture brimming with warmth and vibrant celebrations.' },
  'IN-AN': { name: 'Andaman & Nicobar Islands', desc: 'A stunning archipelago featuring pristine beaches, vibrant coral reefs, and historical landmarks like the Cellular Jail.' },
  'IN-OR': { name: 'Odisha', desc: 'A culturally rich state celebrated for the architectural wonder of the Konark Sun Temple, serene beaches, and vibrant classical dance.' },
  'IN-UT': { name: 'Uttarakhand', desc: 'Often referred to as Devbhumi (Land of the Gods), known for its majestic Himalayan peaks, holy rivers, and peaceful ashrams.' }
};

const STATE_NAMES = {
  "IN-AN": "Andaman and Nicobar Islands",
  "IN-AP": "Andhra Pradesh",
  "IN-AR": "Arunachal Pradesh",
  "IN-AS": "Assam",
  "IN-BR": "Bihar",
  "IN-CH": "Chandigarh",
  "IN-CT": "Chhattisgarh",
  "IN-DD": "Daman and Diu",
  "IN-DL": "Delhi",
  "IN-DN": "Dadra and Nagar Haveli",
  "IN-GA": "Goa",
  "IN-GJ": "Gujarat",
  "IN-HP": "Himachal Pradesh",
  "IN-HR": "Haryana",
  "IN-JH": "Jharkhand",
  "IN-JK": "Jammu and Kashmir",
  "IN-KA": "Karnataka",
  "IN-KL": "Kerala",
  "IN-LD": "Lakshadweep",
  "IN-MH": "Maharashtra",
  "IN-ML": "Meghalaya",
  "IN-MN": "Manipur",
  "IN-MP": "Madhya Pradesh",
  "IN-MZ": "Mizoram",
  "IN-NL": "Nagaland",
  "IN-OR": "Odisha",
  "IN-PB": "Punjab",
  "IN-PY": "Puducherry",
  "IN-RJ": "Rajasthan",
  "IN-SK": "Sikkim",
  "IN-TG": "Telangana",
  "IN-TN": "Tamil Nadu",
  "IN-TR": "Tripura",
  "IN-UP": "Uttar Pradesh",
  "IN-UT": "Uttarakhand",
  "IN-WB": "West Bengal"
};

const ComingSoon = () => (
  <div className="flex-1 flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-[#1E2A4F]/20 rounded-2xl bg-white/50 backdrop-blur-sm min-h-[300px]">
    <svg className="w-16 h-16 text-[#D4AF37] mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <h3 className="text-2xl font-serif font-bold text-[#1E2A4F] mb-2">More Coming Soon</h3>
    <p className="text-[#1E2A4F]/70 text-sm">We are curating premium experiences for this region. Check back later!</p>
  </div>
);

const DestinationsGrid = ({ dests }) => (
  <div className="columns-1 md:columns-2 gap-6 pb-12 relative z-10">
    {dests.map((dest, i) => (
      <div 
        key={i} 
        className="break-inside-avoid mb-6 group flex flex-col bg-white overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(30,42,79,0.12)] cursor-pointer shadow-lg rounded-3xl border border-[#EBE5D9]/60"
      >
        <div className="w-full overflow-hidden relative bg-[#1E2A4F]">
          <img 
            src={dest.img} 
            alt={dest.title} 
            className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-1000 ease-[cubic-bezier(0.21,0.83,0.26,1)]" 
            loading="lazy" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1E2A4F]/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10" />
        </div>
        <div className="flex flex-col relative bg-white flex-1 p-6 items-center text-center">
          <h3 className="text-xl font-serif font-bold text-[#1E2A4F] mb-3 tracking-wide">{dest.title}</h3>
          <div className="h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent w-8 group-hover:w-16 mb-4 opacity-70 group-hover:opacity-100 transition-all duration-700 ease-out" />
          <p className="text-[0.85rem] text-[#1E2A4F]/80 leading-relaxed italic font-serif max-w-xl">
            "{dest.desc}"
          </p>
        </div>
      </div>
    ))}
  </div>
);

const FeaturedShowcase = () => {
  const featured = destinations.filter(d => ['Kashmir', 'Rajasthan', 'Kerala', 'Varanasi'].includes(d.title));
  
  return (
    <div className="flex-1 flex flex-col relative z-10">
      <div className="mb-6 flex flex-col items-center text-center">
        <h3 className="text-2xl font-serif font-bold text-[#1E2A4F]">Editor's Picks</h3>
        <p className="text-[#1E2A4F]/70 text-sm mt-1">Discover India's most breathtaking destinations.</p>
        <div className="w-12 h-0.5 bg-[#D4AF37] mt-3" />
      </div>
      <DestinationsGrid dests={featured} />
    </div>
  );
};

import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store';

const STATE_AIRPORTS = {
  'IN-RJ': 'Jaipur International Airport (JAI) or Delhi (DEL)',
  'IN-KL': 'Cochin (COK) or Trivandrum (TRV)',
  'IN-MH': 'Mumbai Chhatrapati Shivaji Airport (BOM)',
  'IN-DL': 'Indira Gandhi International Airport (DEL)',
  'IN-KA': 'Bengaluru Kempegowda Airport (BLR)',
  'IN-TN': 'Chennai International Airport (MAA)',
  'IN-WB': 'Kolkata Netaji Subhash Chandra Bose Airport (CCU)',
  'IN-TG': 'Hyderabad Rajiv Gandhi Airport (HYD)',
  'IN-GA': 'Goa Dabolim (GOI) / Manohar International (GOX)',
  'IN-UP': 'Lucknow (LKO) or Varanasi (VNS)',
  'IN-AS': 'Guwahati Lokpriya Gopinath Bordoloi Airport (GAU)',
  'IN-JK': 'Srinagar Airport (SXR) via Delhi Checkpoint',
  'IN-LA': 'Leh Kushok Bakula Rimpochee Airport via Delhi',
  'IN-HP': 'Chandigarh (IXC) or Delhi (DEL) Checkpoint',
  'IN-UT': 'Dehradun Jolly Grant Airport via Delhi',
};

const StateHeader = ({ stateId }) => {
  const navigate = useNavigate();
  const { updateState } = useStore();
  const info = stateDescriptions[stateId] || { 
    name: STATE_NAMES[stateId] || 'Selected Region', 
    desc: 'Experience the unique culture, rich heritage, and stunning landscapes of this beautiful region.' 
  };
  const airport = STATE_AIRPORTS[stateId] || 'Major Indian International Entry Ports';

  const handleApplyForState = () => {
    updateState({
      type: 'evisa',
      step: 0,
      data: {
        application_type: 'evisa',
        visa_category: 'tourist',
        places_to_visit: info.name,
        arrival_port: airport.split(' ')[0] + ' Airport',
      },
      docs: [],
      submitted: false,
    });
    navigate('/apply');
  };

  return (
    <div className="mb-8 flex flex-col items-center text-center">
      <h2 className="text-3xl font-serif font-bold text-[#1E2A4F] mb-2">{info.name}</h2>
      <p className="text-[#1E2A4F]/80 text-[0.95rem] max-w-lg leading-relaxed mb-5">{info.desc}</p>
      
      {/* Contextual Visa Callout Card */}
      <div className="w-full max-w-md bg-white border border-[#D4AF37]/50 rounded-xl p-4 shadow-sm text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-[#C4762A] block">
            Official Travel Facilitation
          </span>
          <strong className="text-xs font-serif font-bold text-[#1E2A4F] block">
            e-Tourist Visa for {info.name}
          </strong>
          <span className="text-[10px] text-gray-500 block mt-0.5">
            Gateway: {airport}
          </span>
        </div>
        <button
          type="button"
          onClick={handleApplyForState}
          className="bg-gradient-to-r from-[#1E2A4F] to-[#162040] hover:from-[#162040] hover:to-[#0B2540] text-white text-[11px] font-sans font-bold uppercase tracking-wider px-3.5 py-2 rounded shadow-xs transition-all whitespace-nowrap cursor-pointer shrink-0"
        >
          <span>Apply Visa</span>
          <span className="text-[#D4AF37] ml-1">→</span>
        </button>
      </div>

      <div className="w-16 h-0.5 bg-[#D4AF37] mt-2 opacity-70" />
    </div>
  );
};

export default function Tourism() {
  const [searchParams] = useSearchParams();
  const stateFromUrl = searchParams.get('state');

  const [activeStateId, setActiveStateId] = useState(() => {
    return stateFromUrl && (stateDescriptions[stateFromUrl] || STATE_NAMES[stateFromUrl]) ? stateFromUrl : null;
  });

  useEffect(() => {
    if (stateFromUrl && (stateDescriptions[stateFromUrl] || STATE_NAMES[stateFromUrl])) {
      setActiveStateId(stateFromUrl);
    }
  }, [stateFromUrl]);

  // Lock body scroll when bottom sheet is open on mobile
  useEffect(() => {
    if (activeStateId && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [activeStateId]);

  const handleStateClick = (stateId) => {
    setActiveStateId(stateId);
  };

  let displayedDestinations = [];
  if (activeStateId && stateToDestinations[activeStateId]) {
    const titles = stateToDestinations[activeStateId];
    displayedDestinations = destinations.filter(d => titles.includes(d.title));
  }

  return (
    // Changed overflow-hidden to overflow-x-hidden so vertical scrolling still works!
    <div className="w-full bg-[#FAF7F0] min-h-screen relative overflow-x-hidden">
      {/* Authentic Standard Ashoka Chakra (Dharmachakra) Background Watermark */}
      <div className="absolute top-0 right-0 w-[750px] h-[750px] md:w-[900px] md:h-[900px] opacity-[0.05] pointer-events-none translate-x-1/4 -translate-y-1/4 select-none">
        <svg 
          viewBox="0 0 400 400" 
          className="w-full h-full text-[#1E2A4F] animate-[spin_240s_linear_infinite]"
        >
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

      <div className="max-w-[1400px] mx-auto py-[4.75rem] px-6 relative z-10">
        
        {/* Header Section */}
        <section className="text-center mb-16 flex flex-col items-center">
          <p className="uppercase tracking-widest text-[0.8rem] text-[#C4762A] font-bold mb-3">
            Incredible India
          </p>
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-[#1E2A4F] mb-6">
            Interactive Travel Map
          </h1>
          <p className="text-[1.15rem] text-[#1E2A4F]/80 max-w-2xl leading-relaxed">
            Click on any state to uncover its hidden gems and timeless heritage.
          </p>
        </section>

        {/* Split View: Map + Details */}
        <div className="flex flex-col lg:flex-row gap-12 relative items-start">
          
          {/* LEFT: Map */}
          <div className="w-full lg:w-1/2 flex flex-col relative sticky top-28 z-20">
            {/* Handcrafted Crayon Indian Flag Artwork shifted to the far left */}
            <div className="flex justify-start -ml-2 sm:-ml-6 lg:-ml-8 mb-1 z-30 pointer-events-none">
              <img 
                src="/Flag_art.png" 
                alt="National Flag of India" 
                className="w-32 sm:w-40 md:w-48 lg:w-52 h-auto object-contain select-none drop-shadow-xs" 
                loading="eager"
              />
            </div>

            {/* Map Container */}
            <div className="w-full bg-white rounded-2xl shadow-lg p-8 flex items-center justify-center border border-[#D4AF37]/20 relative z-10 lg:h-[calc(100vh-10rem)]">
              <style>{`
                .india-map-container path,
                svg path {
                  fill: #F5EFE6 !important;
                  stroke: #D4AF37 !important;
                  stroke-width: 0.8px !important;
                  cursor: pointer !important;
                  transition: fill 0.3s ease, stroke-width 0.3s ease !important;
                }
                .india-map-container path:hover,
                svg path:hover {
                  fill: #C4762A !important;
                  stroke: #1E2A4F !important;
                  stroke-width: 2px !important;
                  outline: none;
                }
              `}</style>
              <IndiaSvgMap onStateClick={handleStateClick} />
            </div>
          </div>

          {/* RIGHT: Desktop Details & Mobile Fallback Content */}
          <div className="w-full lg:w-1/2 flex flex-col relative z-10 lg:pr-2">
            {!activeStateId ? (
              <FeaturedShowcase />
            ) : (
              <div className="hidden lg:flex flex-col h-fit w-full pb-8">
                <StateHeader stateId={activeStateId} />
                {displayedDestinations.length === 0 ? <ComingSoon /> : <DestinationsGrid dests={displayedDestinations} />}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* MOBILE OVERLAY (Darkens background when bottom sheet is active) */}
      <div 
        className={`lg:hidden fixed inset-0 bg-black/40 z-[90] transition-opacity duration-500 ${activeStateId ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setActiveStateId(null)}
      />

      {/* MOBILE BOTTOM SHEET */}
      <div 
        className={`lg:hidden fixed inset-x-0 bottom-0 z-[100] bg-[#FAF7F0] rounded-t-3xl shadow-[0_-20px_50px_rgba(0,0,0,0.3)] transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col ${activeStateId ? 'translate-y-0' : 'translate-y-full'}`} 
        style={{ maxHeight: '85vh', minHeight: '50vh' }}
      >
        {/* Handle bar for swipe indication */}
        <div 
          className="w-full flex justify-center pt-4 pb-2 cursor-pointer" 
          onClick={() => setActiveStateId(null)}
        >
          <div className="w-12 h-1.5 bg-[#1E2A4F]/20 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="px-6 pb-4 border-b border-[#D4AF37]/20 flex justify-between items-center shrink-0">
          <h2 className="font-serif font-bold text-2xl text-[#1E2A4F]">
            {activeStateId ? (stateDescriptions[activeStateId]?.name || STATE_NAMES[activeStateId] || 'Selected Region') : 'Selected Region'}
          </h2>
          <button 
            onClick={() => setActiveStateId(null)} 
            className="p-2 rounded-full bg-[#1E2A4F]/5 text-[#1E2A4F] hover:bg-[#1E2A4F]/10 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 overscroll-contain">
          {activeStateId && (
            <div className="mb-6 text-center text-[#1E2A4F]/80 text-[0.95rem] leading-relaxed border-b border-[#D4AF37]/10 pb-6">
              {stateDescriptions[activeStateId]?.desc || 'Experience the unique culture, rich heritage, and stunning landscapes of this beautiful region.'}
            </div>
          )}
          {activeStateId && displayedDestinations.length === 0 ? (
            <ComingSoon />
          ) : (
            <DestinationsGrid dests={displayedDestinations} />
          )}
        </div>
      </div>
      
    </div>
  );
}
