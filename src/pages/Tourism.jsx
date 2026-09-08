import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import IndiaSvgMap from "../components/IndiaSvgMap";
import { useStore } from '../store';
import { ALL_LANDMARKS, LANDMARK_CATEGORIES } from '../data/landmarksData';

const destinations = [
  { img: '/Places/Assam.jpg', title: 'Assam', desc: 'Journey through emerald tea gardens where the morning mist rolls like a slow river. Let the mighty Brahmaputra wash over your soul.' },
  { img: '/Places/Bangalore.jpg', title: 'Bangalore', desc: 'Where the pulse of tomorrow beats beneath ancient rain trees. A city of gardens that blooms with the energy of a billion dreams.' },
  { img: '/Bhopal_statue.jpg', title: 'Bhopal', desc: 'Twin lakes reflecting the whispers of bygone nawabs. Step into a city where history and nature dance an eternal waltz.' },
  { img: '/Dal_lake.jpg', title: 'Dal Lake', desc: 'A mirror of heaven reflecting the mighty Himalayas. Drift softly on wooden shikaras through a floating paradise of lotus blooms.' },
  { img: '/Qutub_minar.jpg', title: 'Delhi', desc: 'The beating heart of India, where empires have risen and fallen like the tides. Walk through centuries of history etched in sandstone.' },
  { img: '/Gir_Lion.avif', title: 'Gir National Park', desc: 'Into the wild domain of the majestic Asiatic lion. Feel the raw, untamed spirit of the forest awaken your primal senses.' },
  { img: '/Goa_church.jpg', title: 'Goa', desc: 'Where golden sands meet the rhythmic crash of the Arabian Sea. Let the ocean breeze wash away your worries under a painted sunset.' },
  { img: '/Stepwell.jpg', title: 'Gujarat', desc: 'A vibrant tapestry of color spread across the great white desert. Experience a land where ancient legends are spun in silk.' },
  { img: '/Places/Gulmarg.jpg', title: 'Gulmarg', desc: 'Meadows of flowers blanketed in pristine, untouched snow. Breathe the crisp mountain air at the very edge of the world.' },
  { img: '/Places/Hyderabad.jpg', title: 'Hyderabad', desc: 'Where the scent of biryani mingles with the echoes of the Charminar. A royal city where tradition glistens like rare pearls.' },
  { img: '/Hawa_Mahal.avif', title: 'Jaipur', desc: 'Step into a realm of sun-drenched palaces and timeless royal intrigue. The Pink City whispers legends of forgotten kings on the desert wind.' },
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
  { img: '/Chola_Temple.avif', title: 'Tamil Nadu', desc: 'A glorious peninsula of towering temple gopurams and classical rhythms. Journey into the ancient soul of the Dravidian heartland.' },
  { img: '/Places/Varanasi.jpg', title: 'Varanasi', desc: "Where the sacred river meets the eternal fires of devotion. Experience the spiritual heart of the world at dawn's golden hour." },
  { img: '/Places/Vizag.jpg', title: 'Visakhapatnam', desc: 'Where the lush Eastern Ghats plunge into the azure Bay of Bengal. Discover a coastal jewel glistening with untold marine secrets.' },
  { img: '/Places/Andaman_Nicobar.jpg', title: 'Andaman & Nicobar Islands', desc: 'Pristine white-sand beaches surrounded by crystal-clear turquoise waters. A tropical haven for marine life and vibrant coral reefs.' },
  { img: '/Sun_Temple.webp', title: 'Odisha', desc: 'Where the Sun Temple of Konark stands as a testament to ancient architectural marvels. Discover golden beaches and deeply rooted tribal heritage.' },
  { img: '/Places/Punjab.jpg', title: 'Punjab', desc: 'The land of five rivers, resonating with the golden glow of the Harmandir Sahib. Experience boundless warmth and vibrant harvest festivals.' },
  { img: '/Places/Mizoram.jpg', title: 'Mizoram', desc: 'The land of rolling green hills, whispering bamboo groves, and misty morning valleys. Discover an untouched paradise of tranquility in the northeastern highlands.' },
  { img: '/Chamoli.jpg', title: 'Uttarakhand', desc: 'The land of the gods, nestled in the majestic Himalayas. A spiritual sanctuary offering serene hill stations and sacred pilgrimage routes.' }
];

const stateToDestinations = {
  'IN-AS': ['Assam'],
  'IN-KA': ['Bangalore', 'Mysore'],
  'IN-MP': ['Bhopal'],
  'IN-JK': ['Dal Lake', 'Gulmarg', 'Kashmir', 'Srinagar'],
  'IN-LA': ['Ladakh'],
  'IN-DL': ['Delhi'],
  'IN-GJ': ['Gir National Park', 'Gujarat'],
  'IN-GA': ['Goa'],
  'IN-TG': ['Hyderabad'],
  'IN-RJ': ['Jaipur', 'Rajasthan'],
  'IN-KL': ['Kerala'],
  'IN-WB': ['Kolkata'],
  'IN-ML': ['Meghalaya'],
  'IN-MZ': ['Mizoram'],
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
  'IN-UT': { name: 'Uttarakhand', desc: 'Often referred to as Devbhumi (Land of the Gods), known for its majestic Himalayan peaks, holy rivers, and peaceful ashrams.' },
  'IN-BR': { name: 'Bihar', desc: 'The historic cradle of ancient empires and spiritual wisdom, home to the sacred Mahabodhi Temple at Bodh Gaya and ancient Nalanda University.' },
  'IN-CT': { name: 'Chhattisgarh', desc: 'The herbal heartland of India, renowned for majestic tiered waterfalls like Chitrakote and ancient tribal forests.' },
  'IN-JH': { name: 'Jharkhand', desc: 'A land of waterfalls, rolling plateaus, and sacred Jain and tribal pilgrimage hills.' }
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
  "IN-LA": "Ladakh",
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
  'IN-BR': 'Gaya (GAY) or Patna (PAT)',
  'IN-OR': 'Bhubaneswar Biju Patnaik Airport (BBI)',
  'IN-AN': 'Port Blair Veer Savarkar Airport (IXZ)',
  'IN-PB': 'Amritsar Sri Guru Ram Dass Jee Airport (ATQ)',
  'IN-AP': 'Visakhapatnam (VTZ) or Tirupati (TIR)',
  'IN-MP': 'Bhopal (BHO), Indore (IDR) or Khajuraho (HJR)',
};

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
            decoding="async"
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
    <div className="mb-6 flex flex-col items-center text-center">
      <h2 className="text-3xl font-serif font-bold text-[#1E2A4F] mb-2">{info.name}</h2>
      <p className="text-[#1E2A4F]/80 text-[0.95rem] max-w-lg leading-relaxed mb-4">{info.desc}</p>

      <div className="w-full max-w-md bg-white border border-[#D4AF37]/50 rounded-xl p-4 shadow-sm text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
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

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredPin, setHoveredPin] = useState(null);
  const [activeModalLandmark, setActiveModalLandmark] = useState(null);

  useEffect(() => {
    if (stateFromUrl && (stateDescriptions[stateFromUrl] || STATE_NAMES[stateFromUrl])) {
      setActiveStateId(stateFromUrl);
    }
  }, [stateFromUrl]);

  useEffect(() => {
    if ((activeStateId && window.innerWidth < 1024) || activeModalLandmark) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [activeStateId, activeModalLandmark]);

  const handleStateClick = (stateId) => {
    setActiveStateId(stateId);
  };

  const filteredLandmarks = selectedCategory === 'all'
    ? ALL_LANDMARKS
    : ALL_LANDMARKS.filter(lm => lm.category === selectedCategory);

  const stateLandmarks = activeStateId
    ? ALL_LANDMARKS.filter(lm => lm.stateId === activeStateId)
    : [];

  let displayedDestinations = [];
  if (activeStateId && stateToDestinations[activeStateId]) {
    const titles = stateToDestinations[activeStateId];
    displayedDestinations = destinations.filter(d => titles.includes(d.title));
  }

  return (
    <div className="w-full bg-[#FAF7F0] min-h-screen relative overflow-x-hidden">
      <div className="absolute top-0 right-0 w-[750px] h-[750px] md:w-[900px] md:h-[900px] opacity-[0.05] pointer-events-none translate-x-1/4 -translate-y-1/4 select-none">
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

      <div className="max-w-[1400px] mx-auto py-[4.75rem] px-6 relative z-10">
        <section className="text-center mb-8 flex flex-col items-center">
          <p className="uppercase tracking-widest text-[0.8rem] text-[#C4762A] font-bold mb-2">
            Incredible India · Grand Atlas of Bharat
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-[#1E2A4F] mb-3">
            Interactive Travel Map
          </h1>
          <p className="text-[1.05rem] text-[#1E2A4F]/80 max-w-2xl leading-relaxed mb-6">
            Explore pinpoint locations of UNESCO monuments, tiger sanctuaries, natural landscapes, and sacred pilgrimage circuits across India.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 p-2 bg-white/90 backdrop-blur-xs rounded-2xl border border-[#D4AF37]/35 shadow-xs mb-4">
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#1E2A4F]/60 px-2 hidden md:inline">
              Map Layers:
            </span>
            {LANDMARK_CATEGORIES.map(cat => {
              const count = cat.id === 'all'
                ? ALL_LANDMARKS.length
                : ALL_LANDMARKS.filter(l => l.category === cat.id).length;
              const isActive = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? `${cat.badgeBg} text-white shadow-sm ring-2 ring-offset-1 ring-[#D4AF37]/40`
                      : 'bg-[#FAF7F0] text-[#1E2A4F]/80 hover:bg-white border border-[#EBE5D9]'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-black/5 text-gray-600'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-[#1E2A4F]/70">
            <span className="text-[10.5px] uppercase font-bold tracking-widest text-[#C4762A]">Curated Guides:</span>
            <Link to="/unesco-sites" className="hover:text-[#B45309] font-medium underline underline-offset-4 decoration-[#D4AF37]/50 transition-colors">UNESCO Monuments →</Link>
            <span>·</span>
            <Link to="/national-parks" className="hover:text-[#15803D] font-medium underline underline-offset-4 decoration-[#D4AF37]/50 transition-colors">National Parks & Wilds →</Link>
            <span>·</span>
            <Link to="/natural-wonders" className="hover:text-[#0369A1] font-medium underline underline-offset-4 decoration-[#D4AF37]/50 transition-colors">Natural Wonders →</Link>
            <span>·</span>
            <Link to="/spiritual-heritage" className="hover:text-[#C2410C] font-medium underline underline-offset-4 decoration-[#D4AF37]/50 transition-colors">Sacred Circuits →</Link>
          </div>
        </section>

        <div className="flex flex-col lg:flex-row gap-10 relative items-start">
          <div className="w-full lg:w-1/2 flex flex-col relative sticky top-28 z-20">
            <div className="flex justify-between items-center -ml-2 sm:-ml-6 lg:-ml-8 mb-1 z-30 pointer-events-none">
              <img
                src="/Flag_art.png"
                alt="National Flag of India"
                className="w-28 sm:w-36 md:w-44 h-auto object-contain select-none drop-shadow-xs"
                loading="eager"
                decoding="async"
              />
              <div className="pointer-events-auto pr-2">
                {activeStateId && (
                  <button
                    onClick={() => setActiveStateId(null)}
                    className="text-[11px] font-sans font-bold text-[#1E2A4F] bg-white border border-[#D4AF37]/40 px-3 py-1 rounded-full shadow-2xs hover:bg-[#FAF7F0] transition-colors cursor-pointer"
                  >
                    Reset Map View ✕
                  </button>
                )}
              </div>
            </div>

            <div className="w-full bg-white rounded-3xl shadow-xl p-6 sm:p-8 flex flex-col items-center justify-center border border-[#D4AF37]/30 relative z-10 overflow-visible">
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
                  fill: #EBE5D9 !important;
                  stroke: #1E2A4F !important;
                  stroke-width: 2px !important;
                  outline: none;
                }
                ${activeStateId ? `
                  .india-map-container path#${activeStateId},
                  svg path#${activeStateId} {
                    fill: #C4762A !important;
                    stroke: #162040 !important;
                    stroke-width: 2.5px !important;
                  }
                ` : ''}
              `}</style>

              <IndiaSvgMap onStateClick={handleStateClick}>
                <g className="landmarks-pin-layer" style={{ pointerEvents: 'auto' }}>
                  {filteredLandmarks.map((lm) => {
                    const isSelected = activeStateId === lm.stateId;
                    const isHovered = hoveredPin?.id === lm.id;
                    const catConfig = LANDMARK_CATEGORIES.find(c => c.id === lm.category);
                    const pinColor = catConfig?.color || '#D4AF37';

                    return (
                      <g
                        key={lm.id}
                        transform={`translate(${lm.mapX}, ${lm.mapY})`}
                        className="cursor-pointer group"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveStateId(lm.stateId);
                          setActiveModalLandmark(lm);
                        }}
                        onMouseEnter={(e) => {
                          e.stopPropagation();
                          setHoveredPin(lm);
                        }}
                        onMouseLeave={() => setHoveredPin(null)}
                      >
                        <circle
                          r={isHovered || isSelected ? "7" : "5"}
                          fill={pinColor}
                          stroke="#FFFFFF"
                          strokeWidth={isHovered || isSelected ? "2" : "1.6"}
                          className="drop-shadow-md transition-all duration-200 group-hover:scale-125"
                        />
                        <circle r="1.8" fill="#FFFFFF" />

                        {(isHovered || isSelected) && (
                          <g transform="translate(0, -14)" className="pointer-events-none">
                            <rect
                              x={-((lm.title.length * 4.2) + 12)}
                              y="-16"
                              width={(lm.title.length * 8.4) + 24}
                              height="20"
                              rx="5"
                              fill="#162040"
                              stroke="#D4AF37"
                              strokeWidth="0.75"
                              opacity="0.95"
                              className="drop-shadow-lg"
                            />
                            <text
                              x="0"
                              y="-3"
                              textAnchor="middle"
                              fill="#FFFFFF"
                              fontSize="8.5"
                              fontWeight="bold"
                              fontFamily="sans-serif"
                            >
                              {lm.title}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </g>
              </IndiaSvgMap>

              <div className="w-full flex items-center justify-between text-[11px] text-[#1E2A4F]/65 mt-2 px-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse inline-block" />
                  Click pins or states to inspect regional landmarks
                </span>
                <span className="font-semibold text-[#C4762A]">
                  Showing {filteredLandmarks.length} Pins
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Desktop Details & Mobile Fallback Content */}
          <div className="w-full lg:w-1/2 flex flex-col relative z-10 lg:pr-2">
            {!activeStateId ? (
              <div className="flex-1 flex flex-col relative z-10">
                <div className="mb-6 flex flex-col items-center text-center">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#C4762A]">
                    National Landmark Highlights
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-[#1E2A4F] mt-1">
                    Signature Experiences of Bharat
                  </h3>
                  <p className="text-[#1E2A4F]/75 text-xs font-serif italic mt-1 max-w-md">
                    Select any pin on the map to explore UNESCO monuments, tiger reserves, living backwaters, and sacred temples.
                  </p>
                  <div className="w-12 h-0.5 bg-[#D4AF37] mt-3" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {filteredLandmarks.slice(0, 8).map(lm => {
                    const catConfig = LANDMARK_CATEGORIES.find(c => c.id === lm.category);
                    return (
                      <div
                        key={lm.id}
                        onClick={() => {
                          setActiveStateId(lm.stateId);
                          setActiveModalLandmark(lm);
                        }}
                        className="bg-white rounded-2xl overflow-hidden border border-[#EBE5D9] hover:border-[#D4AF37] shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col group text-left"
                      >
                        <div className="relative h-36 w-full overflow-hidden bg-neutral-900">
                          <img
                            src={lm.img}
                            alt={lm.title}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-center">
                            <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold">
                              {lm.state}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-white text-[9px] font-bold ${catConfig?.badgeBg || 'bg-[#1E2A4F]'}`}>
                              {lm.categoryLabel}
                            </span>
                          </div>
                          <div className="absolute bottom-2 left-3 right-3">
                            <h4 className="font-serif font-bold text-sm text-white drop-shadow-xs truncate">
                              {lm.title}
                            </h4>
                          </div>
                        </div>
                        <div className="p-3.5 flex-1 flex flex-col justify-between">
                          <p className="text-[11px] text-[#1E2A4F]/80 font-serif italic line-clamp-2 mb-3">
                            "{lm.desc}"
                          </p>
                          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider pt-2 border-t border-[#FAF7F0]">
                            <span className="text-[#C4762A]">Explore Pin Details</span>
                            <span className="text-[#1E2A4F] group-hover:translate-x-1 transition-transform">→</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-[#D4AF37]/20">
                  <h4 className="font-serif font-bold text-lg text-[#1E2A4F] text-center mb-4">
                    Iconic Heritage Cities
                  </h4>
                  <DestinationsGrid dests={destinations.slice(0, 6)} />
                </div>
              </div>
            ) : (
              <div className="hidden lg:flex flex-col h-fit w-full pb-8">
                <StateHeader stateId={activeStateId} />
                {stateLandmarks.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10.5px] font-sans font-bold uppercase tracking-widest text-[#C4762A]">
                        Pinpoint Landmarks in {stateDescriptions[activeStateId]?.name || STATE_NAMES[activeStateId]} ({stateLandmarks.length})
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {stateLandmarks.map(lm => {
                        const catConfig = LANDMARK_CATEGORIES.find(c => c.id === lm.category);
                        return (
                          <div
                            key={lm.id}
                            onClick={() => setActiveModalLandmark(lm)}
                            className="bg-white rounded-2xl overflow-hidden border border-[#EBE5D9] hover:border-[#D4AF37] shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col group text-left"
                          >
                            <div className="relative h-36 w-full overflow-hidden bg-neutral-900">
                              <img
                                src={lm.img}
                                alt={lm.title}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                              <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-center">
                                <span className={`px-2 py-0.5 rounded-full text-white text-[9px] font-bold ${catConfig?.badgeBg || 'bg-[#1E2A4F]'}`}>
                                  {lm.categoryLabel}
                                </span>
                              </div>
                              <div className="absolute bottom-2 left-3 right-3">
                                <h4 className="font-serif font-bold text-sm text-white drop-shadow-xs truncate">
                                  {lm.title}
                                </h4>
                              </div>
                            </div>
                            <div className="p-3.5 flex-1 flex flex-col justify-between">
                              <p className="text-[11px] text-[#1E2A4F]/80 font-serif italic line-clamp-2 mb-3">
                                "{lm.desc}"
                              </p>
                              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider pt-2 border-t border-[#FAF7F0]">
                                <span className="text-[#C4762A]">Read Factsheet</span>
                                <span className="text-[#1E2A4F] group-hover:translate-x-1 transition-transform">→</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {displayedDestinations.length > 0 && (
                  <div>
                    <span className="text-[10.5px] font-sans font-bold uppercase tracking-widest text-[#1E2A4F]/70 block mb-3 text-left">
                      Regional Experiences & Towns
                    </span>
                    <DestinationsGrid dests={displayedDestinations} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {activeModalLandmark && (
        <div
          className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in"
          onClick={() => setActiveModalLandmark(null)}
        >
          <div
            className="bg-white max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl border border-[#EBE5D9] max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-neutral-900 shrink-0">
              <img
                src={activeModalLandmark.img}
                alt={activeModalLandmark.title}
                decoding="async"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <button
                onClick={() => setActiveModalLandmark(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20 z-10"
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-6 right-6 z-10 text-left">
                <span className="px-2.5 py-0.5 rounded-sm bg-[#D4AF37] text-white text-[10px] font-bold uppercase tracking-widest mb-1.5 inline-block">
                  {activeModalLandmark.categoryLabel} · {activeModalLandmark.state}
                </span>
                <h3 className="font-serif font-bold text-2xl sm:text-3xl text-white">
                  {activeModalLandmark.title}
                </h3>
                <p className="text-xs text-white/80 font-sans mt-0.5">
                  📍 {activeModalLandmark.location}
                </p>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-left custom-scrollbar">
              <div>
                <h4 className="font-serif font-bold text-xs uppercase tracking-widest text-[#C4762A] mb-1.5">
                  Landmark Overview
                </h4>
                <p className="text-sm font-serif text-[#1E2A4F]/90 leading-relaxed italic">
                  {activeModalLandmark.desc}
                </p>
              </div>

              {activeModalLandmark.highlights && (
                <div>
                  <h4 className="font-serif font-bold text-xs uppercase tracking-widest text-[#C4762A] mb-2">
                    Key Highlights
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeModalLandmark.highlights.map((h, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-[#FAF7F0] border border-[#EBE5D9] text-[#1E2A4F] font-medium">
                        ✦ {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#FAF7F0]">
                {activeModalLandmark.bestTime && (
                  <div className="p-3 rounded-xl bg-[#FAF7F0] border border-[#EBE5D9]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Best Season</span>
                    <span className="text-xs font-semibold text-[#1E2A4F]">{activeModalLandmark.bestTime}</span>
                  </div>
                )}
                {activeModalLandmark.airport && (
                  <div className="p-3 rounded-xl bg-[#FAF7F0] border border-[#EBE5D9]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Gateway Airport</span>
                    <span className="text-xs font-semibold text-[#1E2A4F] truncate block">{activeModalLandmark.airport}</span>
                  </div>
                )}
              </div>

              {activeModalLandmark.travelTip && (
                <div className="p-4 rounded-xl bg-[#FAF7F0] border-l-4 border-[#D4AF37] text-xs text-[#1E2A4F]/85 italic font-serif">
                  <strong className="text-[#1E2A4F] not-italic block font-sans font-bold text-[10px] uppercase tracking-wider mb-1">
                    Curator's Travel Note:
                  </strong>
                  "{activeModalLandmark.travelTip}"
                </div>
              )}
            </div>

            <div className="p-4 bg-[#FAF7F0] border-t border-[#EBE5D9] flex flex-wrap items-center justify-between gap-3 shrink-0">
              <Link
                to={activeModalLandmark.guideUrl || '/unesco-sites'}
                className="py-2.5 px-4 rounded-xl bg-[#1E2A4F] hover:bg-[#162040] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
              >
                Read Dedicated Guide →
              </Link>
              <button
                type="button"
                onClick={() => {
                  setActiveModalLandmark(null);
                  setActiveStateId(activeModalLandmark.stateId);
                }}
                className="py-2.5 px-4 rounded-xl border border-[#D4AF37] bg-white text-[#1E2A4F] hover:bg-[#FAF7F0] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                View {activeModalLandmark.state} Circuit
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className={`lg:hidden fixed inset-0 bg-black/50 z-[90] transition-opacity duration-500 ${activeStateId ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setActiveStateId(null)}
      />

      <div
        className={`lg:hidden fixed inset-x-0 bottom-0 z-[100] bg-[#FAF7F0] rounded-t-3xl shadow-[0_-20px_50px_rgba(0,0,0,0.3)] transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col ${activeStateId ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ maxHeight: '85vh', minHeight: '50vh' }}
      >
        <div
          className="w-full flex justify-center pt-4 pb-2 cursor-pointer"
          onClick={() => setActiveStateId(null)}
        >
          <div className="w-12 h-1.5 bg-[#1E2A4F]/20 rounded-full" />
        </div>
        <div className="px-6 pb-4 border-b border-[#D4AF37]/20 flex justify-between items-center shrink-0">
          <h2 className="font-serif font-bold text-2xl text-[#1E2A4F]">
            {activeStateId ? (stateDescriptions[activeStateId]?.name || STATE_NAMES[activeStateId] || 'Selected Region') : 'Selected Region'}
          </h2>
          <button
            onClick={() => setActiveStateId(null)}
            className="p-2 rounded-full bg-[#1E2A4F]/5 text-[#1E2A4F] hover:bg-[#1E2A4F]/10 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 overscroll-contain text-left">
          {activeStateId && (
            <div className="mb-6 text-[#1E2A4F]/80 text-[0.95rem] leading-relaxed border-b border-[#D4AF37]/10 pb-6">
              {stateDescriptions[activeStateId]?.desc || 'Experience the unique culture, rich heritage, and stunning landscapes of this beautiful region.'}
            </div>
          )}
          {stateLandmarks.length > 0 && (
            <div className="mb-6">
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#C4762A] block mb-3">
                Key Pinpoint Landmarks ({stateLandmarks.length})
              </span>
              <div className="space-y-3">
                {stateLandmarks.map(lm => (
                  <div
                    key={lm.id}
                    onClick={() => setActiveModalLandmark(lm)}
                    className="p-3 bg-white rounded-xl border border-[#EBE5D9] flex items-center justify-between gap-3 shadow-2xs cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={lm.img} alt={lm.title} loading="lazy" decoding="async" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                      <div className="min-w-0">
                        <h4 className="font-serif font-bold text-xs text-[#1E2A4F] truncate">{lm.title}</h4>
                        <span className="text-[10px] text-gray-500 block truncate">{lm.categoryLabel}</span>
                      </div>
                    </div>
                    <span className="text-xs text-[#D4AF37] font-bold shrink-0">Explore →</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {displayedDestinations.length > 0 && (
            <div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#1E2A4F]/70 block mb-3">
                Regional Towns & Experiences
              </span>
              <DestinationsGrid dests={displayedDestinations} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
