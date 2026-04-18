// Featured/Home specific images
const img1 = '/featured/buds1.avif';
const img1alt = '/featured/buds2.jpg';
const img2 = '/featured/watch1.avif';
const img2alt = '/featured/watch2.webp';
const img3 = '/computing/laptop5.avif';
const img3alt = '/featured/laptop2.jpg';
const img4 = '/featured/headphone3.jpg';
const img4alt = '/featured/headphone4.png';
const img5 = '/featured/buds3.jpg';
const img5alt = '/featured/buds4.webp';
const img6 = '/featured/watch3.jpg';
const img6alt = '/featured/watch4.jpg';

// --- ALL PRODUCT IMAGES BY CATEGORY ---

// Audios
const mic1 = '/audios/microphone1.jpg';
const mic2 = '/audios/microphone2.png';
const mic3 = '/audios/microphone3.jpg';
const mic4 = '/audios/microphone4.png';
const spk1 = '/audios/speaker1.avif';
const spk2 = '/audios/speaker2.avif';
const spk3 = '/audios/speaker3.jpg';
const spk4 = '/audios/speaker4.avif';
const hdp1 = '/audios/headphone1.jpg';
const hdp2 = '/audios/headphone2.jpg';
const hdp3 = '/audios/headphone3.avif';
const hdp4 = '/audios/headphone4.png';
const bd1 = '/audios/buds1.webp';
const bd2 = '/audios/buds2.webp';
const bd3 = '/audios/buds3.jpg';
const bd4 = '/audios/buds4.jpg';

// Wearables
const glass1 = '/wearables/glass1.avif';
const glass2 = '/wearables/glass2.jpg';
const wt1 = '/wearables/watch1.jpg';
const wt2 = '/wearables/watch2.webp';
const wt3 = '/wearables/watch3.webp';
const wt4 = '/wearables/watch4.webp';
const wt5 = '/wearables/watch5.avif';
const wt6 = '/wearables/watch6.webp';

// Computing
const cp_lp1 = '/computing/laptop1.jpg';
const cp_lp2 = '/computing/laptop2.jpg';
const cp_lp3 = '/computing/laptop3.jpg';
const cp_lp4 = '/computing/laptop4.jpg';
const cp_mb1 = '/computing/mobile1.webp';
const cp_mb2 = '/computing/mobile2.webp';
const cp_mb3 = '/computing/mobile3.webp';
const cp_mb4 = '/computing/mobile4.webp';
const cp_mb5 = '/computing/mobile5.avif';
const cp_mb6 = '/computing/mobile6.avif';
const cp_mn1 = '/computing/monitor1.avif';
const cp_mn2 = '/computing/monitor2.avif';

// Accessories
const acc_cs1 = '/accessories/case1.jpg';
const acc_cs2 = '/accessories/case2.jpg';
const acc_cs3 = '/accessories/case3.avif';
const acc_cs4 = '/accessories/case4.webp';
const acc_ch1 = '/accessories/charger1.jpg';
const acc_ch2 = '/accessories/charger2.avif';
const acc_pb1 = '/accessories/powerbank1.jpg';
const acc_pb2 = '/accessories/powerbank2.jpg';

export const productsData = {
    "1": {
        id: "1",
        name: "Bose Buds Pro",
        title: "Wireless Earbuds",
        category: "Audio",
        desc: "Immerse yourself in high-fidelity audio with active noise cancellation.",
        variants: [
            { id: "v1_1", colorBg: "bg-gray-200", ringColor: "ring-gray-300", img: img1, price: "₹9,999", colorName: "Pearl" },
            { id: "v1_2", colorBg: "bg-gray-800", ringColor: "ring-gray-600", img: img1alt, price: "₹10,999", colorName: "Midnight" }
        ],
        specs: {
            brand: "Bose",
            material: "ABS Plastic & Silicone",
            weight: "48g (charging case)",
            battery: "6 Hours (buds) + 24 Hours (case)",
            processor: "Bose Custom S3",
            camera: "N/A",
            height: "5.1 cm",
            width: "5.1 cm"
        }
    },
    "2": {
        id: "2",
        name: "Pulse Watch X",
        title: "Smartwatch",
        category: "Wearables",
        desc: "Track your fitness, stay connected, and look sleek. The ultimate companion.",
        variants: [
            { id: "v2_1", colorBg: "bg-yellow-100", ringColor: "ring-stone-400", img: img2, price: "₹11,999", colorName: "Titanium" },
            { id: "v2_2", colorBg: "bg-blue-900", ringColor: "ring-blue-700", img: img2alt, price: "₹13,999", colorName: "Ocean" }
        ],
        specs: {
            brand: "Pulse",
            material: "Titanium Chassis",
            weight: "36.5g",
            battery: "3 Days battery life",
            processor: "W-Core X1",
            camera: "N/A",
            height: "4.4 cm",
            width: "3.8 cm",
            display: '1.9" Retina OLED'
        }
    },
    "3": {
        id: "3",
        name: "Vertex Pro 16",
        title: "Laptop",
        category: "Computing",
        desc: "Unmatched performance. Power through heavy workflows with our chipset.",
        variants: [
            { id: "v3_1", colorBg: "bg-stone-300", ringColor: "ring-stone-400", img: img3, price: "₹1,59,999", colorName: "Silver" },
            { id: "v3_2", colorBg: "bg-stone-800", ringColor: "ring-stone-700", img: img3alt, price: "₹1,69,999", colorName: "Space Gray" }
        ],
        specs: {
            brand: "Vertex",
            material: "Recycled Aluminum",
            weight: "1.4kg",
            battery: "18 Hours backup",
            processor: "M3 Pro Ultra",
            camera: "1080p FaceTime HD",
            height: "1.13 cm",
            width: "30.41 cm",
            display: '16.2" Liquid Retina XDR'
        }
    },
    "4": {
        id: "4",
        name: "Aura Studio X",
        title: "Over-Ear Headphones",
        category: "Audio",
        desc: "Studio-quality sound with spatial audio capabilities.",
        discount: 20,
        variants: [
            { id: "v4_1", colorBg: "bg-gray-200", ringColor: "ring-blue-400", img: hdp3, price: "₹11,999", colorName: "Ocean Blue" },
            { id: "v4_2", colorBg: "bg-blue-600", ringColor: "ring-red-400", img: hdp4, price: "₹10,999", colorName: "Ember Red" }
        ],
        specs: {
            brand: "Aura",
            material: "Memory Foam & Leather",
            weight: "250g",
            battery: "40 Hours with ANC",
            processor: "Aura H1 Chip",
            camera: "N/A",
            height: "18.7 cm",
            width: "16.8 cm"
        }
    },
    "5": {
        id: "5",
        name: "Zenith Pods Plus",
        title: "Active Earbuds",
        category: "Audio",
        desc: "Designed for the ultimate workout. Sweatproof and secure fit.",
        variants: [
            { id: "v5_1", colorBg: "bg-purple-300", ringColor: "ring-purple-700", img: bd3, price: "₹18,999", colorName: "Deep Purple" },
            { id: "v5_2", colorBg: "bg-green-200", ringColor: "ring-stone-400", img: bd4, price: "₹19,499", colorName: "Astro Gray" }
        ],
        specs: {
            brand: "Zenith",
            material: "Bio-Plastic",
            weight: "5.4g (per bud)",
            battery: "8 Hours playback",
            processor: "Zenith S2",
            camera: "N/A",
            height: "2.5 cm",
            width: "2.1 cm"
        }
    },
    "6": {
        id: "6",
        name: "Chronos Alpine",
        title: "Luxury watch",
        category: "Wearables",
        desc: "Built for the outdoors. Massive battery and precise GPS.",
        variants: [
            { id: "v6_1", colorBg: "bg-blue-900", ringColor: "ring-orange-500", img: wt3, price: "₹52,999", colorName: "Navy Blue" },
            { id: "v6_2", colorBg: "bg-stone-300", ringColor: "ring-stone-700", img: wt4, price: "₹54,999", colorName: "Obsidian" }
        ],
        specs: {
            brand: "Chronos",
            material: "Aerospace Grade Steel",
            weight: "52g",
            battery: "14 Days in Hike Mode",
            processor: "Adventure X9",
            camera: "N/A",
            height: "4.9 cm",
            width: "4.9 cm",
            display: '1.43" AMOLED Sapphire'
        }
    },
    "7": {
        id: "7",
        name: "ProCast Studio",
        title: "Professional Mic",
        category: "Audio",
        desc: "Broadcast-ready microphone for professional audio production.",
        discount: 15,
        variants: [
            { id: "v7_1", img: mic1, price: "₹21,999", colorName: "Pro Black" },
            { id: "v7_2", img: mic2, price: "₹22,499", colorName: "Steel" }
        ],
        specs: {
            brand: "ProCast",
            material: "Zinc Alloy",
            weight: "850g (with stand)",
            battery: "N/A (USB Powered)",
            processor: "ProCast DSP V3",
            camera: "N/A",
            height: "21.1 cm",
            width: "12.0 cm"
        }
    },
    "8": {
        id: "8",
        name: "Advanced Streamer",
        title: "Vocal Mic",
        category: "Audio",
        desc: "Optimized for streaming with noise-rejection technology.",
        variants: [
            { id: "v8_1", img: mic3, price: "₹14,999", colorName: "Midnight" },
            { id: "v8_2", img: mic4, price: "₹14,999", colorName: "Titan" }
        ],
        specs: {
            brand: "Advanced Streamer",
            material: "High-grade Polymer",
            weight: "450g",
            battery: "N/A (USB-C)",
            processor: "Stream DSP Core",
            camera: "N/A",
            height: "15.4 cm",
            width: "6.4 cm"
        }
    },
    "9": {
        id: "9",
        name: "Sonic Core H1",
        title: "Hi-Fi Headphones",
        category: "Audio",
        desc: "Experience sound in its purest form with open-back acoustics.",
        variants: [
            { id: "v9_1", colorBg: "bg-gray-200", ringColor: "ring-blue-600", img: hdp1, price: "₹42,999", colorName: "Deep Sea" },
            { id: "v9_2", colorBg: "bg-violet-300", ringColor: "ring-stone-600", img: hdp2, price: "₹42,999", colorName: "Matte" }
        ],
        specs: {
            brand: "Sonic Core",
            material: "Carbon Fiber & Mesh",
            weight: "310g",
            battery: "N/A (Wired)",
            processor: "Acoustic Engine Q1",
            camera: "N/A",
            height: "20.0 cm",
            width: "18.5 cm"
        }
    },
    "10": {
        id: "10",
        name: "Vision Pro Glass",
        title: "AR Glasses",
        category: "Wearables",
        desc: "The future of vision. Overlay your life with digital intelligence.",
        variants: [
            { id: "v10_1", img: glass1, price: "₹4,999", colorName: "Dark Matter Style" },
            { id: "v10_2", img: glass2, price: "₹5,999", colorName: "Pure Style" }
        ],
        specs: {
            brand: "Vision",
            material: "Magnesium Alloy & Lenses",
            weight: "125g",
            battery: "4 Hours AR use",
            processor: "Vision AR Engine v2",
            camera: "Dual 12MP Ultra-wide",
            height: "4.8 cm",
            width: "14.5 cm",
            display: "Dual 4K Micro-OLED"
        }
    },
    "11": {
        id: "11",
        name: "G-Shock Watch",
        title: "Rugged Watch",
        category: "Wearables",
        desc: "Luxury meets technology. Hand-polished titanium with smart guts.",
        variants: [
            { id: "v11_1", colorBg: "bg-stone-800", ringColor: "ring-stone-400", img: wt5, price: "₹84,999", colorName: "Raw Titan" },
            { id: "v11_2", colorBg: "bg-gray-200", ringColor: "ring-amber-700", img: wt6, price: "₹86,999", colorName: "Classic White" }
        ],
        specs: {
            brand: "G-Shock",
            material: "Polished Grade 5 Titanium",
            weight: "61g",
            battery: "7 Days Mixed use",
            processor: "LuxeCore S5",
            camera: "N/A",
            height: "5.3 cm",
            width: "5.1 cm",
            display: '1.5" Custom Digital'
        }
    },
    "12": {
        id: "12",
        name: "Macbook Air",
        title: "Power Laptop",
        category: "Computing",
        desc: "Ultra-portable performance for the modern nomad.",
        variants: [
            { id: "v12_1", colorBg: "bg-stone-300", ringColor: "ring-stone-700", img: cp_lp3, price: "₹1,89,999", colorName: "Stealth" },
            { id: "v12_2", colorBg: "bg-pink-100", ringColor: "ring-yellow-400", img: cp_lp4, price: "₹1,92,999", colorName: "Harvest Gold" }
        ],
        specs: {
            brand: "Apple",
            material: "Anodized Aluminum",
            weight: "1.24kg",
            battery: "18 Hours Video Playback",
            processor: "M2 Chip 8-core CPU",
            camera: "1080p FaceTime HD",
            height: "1.13 cm",
            width: "30.41 cm",
            display: '13.6" Liquid Retina'
        }
    },
    "13": {
        id: "13",
        name: "Samsung S26Ultra",
        title: "Smartphone",
        category: "Computing",
        desc: "The pinnacle of mobile photography and speed.",
        discount: 10,
        variants: [
            { id: "v13_1", colorBg: "bg-violet-900", ringColor: "ring-pink-400", img: cp_mb1, price: "₹1,34,999", colorName: "Rose Pink" },
            { id: "v13_2", colorBg: "bg-blue-100", ringColor: "ring-stone-600", img: cp_mb2, price: "₹1,36,999", colorName: "Dark Gray" }
        ],
        specs: {
            brand: "Samsung",
            material: "Armor Aluminum Frame",
            weight: "233g",
            battery: "5000mAh Intelligence",
            processor: "Snapdragon 8 Gen 3",
            camera: "200MP Main + 50MP Zoom",
            height: "16.2 cm",
            width: "7.9 cm",
            display: '6.8" Dynamic AMOLED 2X'
        }
    },
    "14": {
        id: "14",
        name: "Horizon Ultra",
        title: "Pro Monitor",
        category: "Computing",
        desc: "4K Color-accurate display for professional designers.",
        variants: [
            { id: "v14_1", colorBg: "bg-black", ringColor: "ring-zinc-900", img: cp_mn1, price: "₹74,999", colorName: "Studio" },
            { id: "v14_2", colorBg: "bg-zinc-300", ringColor: "ring-zinc-700", img: cp_mn2, price: "₹76,999", colorName: "Design" }
        ],
        specs: {
            brand: "Horizon",
            material: "Aluminum & Glass",
            weight: "4.5kg",
            processor: "Horizon Display Engine",
            display: '27" 5K Nano-texture',
            height: "46.2 cm",
            width: "62.3 cm",
            battery: "N/A (AC Powered)",
            camera: "12MP Center Stage"
        }
    },
    "15": {
        id: "15",
        name: "Urban Shield",
        title: "Protective Case",
        category: "Accessories",
        desc: "Military-grade protection with a slim profile.",
        variants: [
            { id: "v15_1", colorBg: "bg-stone-900", ringColor: "ring-stone-700", img: acc_cs1, price: "₹3,499", colorName: "Black" },
            { id: "v15_2", colorBg: "bg-violet-900", ringColor: "ring-blue-700", img: acc_cs2, price: "₹3,499", colorName: "Navy" }
        ],
        specs: {
            brand: "Urban",
            material: "Aramid Fiber & TPU",
            weight: "32g",
            protection: "10ft Drop Certified",
            compatibility: "iPhone 15/16 Series",
            height: "15.0 cm",
            width: "7.5 cm"
        }
    },
    "16": {
        id: "16",
        name: "Volt Power 100",
        title: "Power Bank",
        category: "Accessories",
        desc: "Huge capacity. Fast charge your laptop on the move.",
        variants: [
            { id: "v16_1", colorBg: "bg-stone-200", ringColor: "ring-stone-600", img: acc_pb1, price: "₹7,999", colorName: "Carbon" },
            { id: "v16_2", colorBg: "bg-stone-800", ringColor: "ring-stone-400", img: acc_pb2, price: "₹7,999", colorName: "Alloy" }
        ],
        specs: {
            brand: "Volt",
            material: "Anodized Aluminum Shell",
            weight: "420g",
            capacity: "25000mAh",
            output: "100W PD Ultra-fast",
            height: "16.8 cm",
            width: "8.1 cm"
        }
    },
    "17": {
        id: "17",
        name: "Apple iPhone 17 ProMax",
        title: "Smartphone",
        category: "Computing",
        desc: "Forged in titanium. Featuring the groundbreaking A17 Pro chip and a customizable Action button.",
        discount: 5,
        variants: [
            { id: "v17_1", colorBg: "bg-blue-100", ringColor: "ring-stone-600", img: cp_mb3, price: "₹1,34,900", colorName: "Sky Blue Titanium" },
            { id: "v17_2", colorBg: "bg-orange-400", ringColor: "ring-stone-200", img: cp_mb4, price: "₹1,34,900", colorName: "Orange Titanium" }
        ],
        specs: {
            brand: "Apple",
            material: "Titanium & Ceramic Shield",
            weight: "221g",
            processor: "A17 Pro Chip",
            display: '6.7" Super Retina XDR',
            height: "15.99 cm",
            width: "7.67 cm",
            battery: "Up to 29 hours video",
            camera: "48MP Main | 12MP Ultra Wide | 12MP Telephoto"
        }
    },
    "18": {
        id: "18",
        name: "Nothing Phone 4a",
        title: "Smartphone",
        category: "Computing",
        desc: "A new way to interact. The iconic Glyph Interface meets premium performance and symmetry.",
        variants: [
            { id: "v18_1", colorBg: "bg-stone-200", ringColor: "ring-stone-400", img: cp_mb5, price: "₹35,999", colorName: "White" },
            { id: "v18_2", colorBg: "bg-pink-300", ringColor: "ring-stone-700", img: cp_mb6, price: "₹34,999", colorName: "Dark Gray" }
        ],
        specs: {
            brand: "Nothing",
            material: "Recycled Plastic & Glass",
            weight: "185g",
            processor: "Snapdragon 7s Gen 2",
            display: '6.7" Flexible OLED',
            height: "16.1 cm",
            width: "7.6 cm",
            battery: "5000mAh with 45W charging",
            camera: "50MP Dual Rear | 32MP Front"
        }
    },
    "19": {
        id: "19",
        name: "Samsung Silicon Case",
        title: "Smartphone Case",
        category: "Accessories",
        desc: "Soft to the touch, easy on the eyes. A premium silicone case that protects your device without the bulk.",
        variants: [
            { id: "v19_1", colorBg: "bg-orange-400", ringColor: "ring-stone-300", img: acc_cs3, price: "₹2,199", colorName: "Lilac" },
            { id: "v19_2", colorBg: "bg-red-900", ringColor: "ring-blue-200", img: acc_cs4, price: "₹2,199", colorName: "Sky Blue" }
        ],
        specs: {
            brand: "Samsung",
            material: "Liquid Silicone",
            weight: "28g",
            lining: "Soft Microfiber",
            compatibility: "Samsung S Series",
            height: "16.5 cm",
            width: "8.0 cm"
        }
    },
    "20": {
        id: "20",
        name: "Super Fast Charger",
        title: "Universal Adapter",
        category: "Accessories",
        desc: "Power through your day with our most advanced 45W charger. Safe, efficient, and universally compatible.",
        variants: [
            { id: "v20_1", colorBg: "bg-black", ringColor: "ring-stone-100", img: acc_ch1, price: "₹3,499", colorName: "Classic" },
            { id: "v20_2", colorBg: "bg-gray-200", ringColor: "ring-stone-700", img: acc_ch2, price: "₹3,499", colorName: "Phantom" }
        ],
        specs: {
            brand: "SuperCharge",
            material: "Fire-retardant PC",
            weight: "95g",
            output: "45W Super Fast Charging",
            ports: "Single USB-C",
            height: "5.0 cm",
            width: "5.0 cm"
        }
    },
    "21": {
        id: "21",
        name: "Zenith Pods Pro",
        title: "Wireless Buds",
        category: "Audio",
        desc: "The original studio-quality earbuds. Unmatched clarity and comfortable fit for all-day listening.",
        variants: [
            { id: "v21_1", colorBg: "bg-violet-200", ringColor: "ring-stone-200", img: bd1, price: "₹14,999", colorName: "Pure White" },
            { id: "v21_2", colorBg: "bg-green-600", ringColor: "ring-stone-700", img: bd2, price: "₹15,499", colorName: "Space Black" }
        ],
        specs: {
            brand: "Zenith",
            material: "Recycled ABS Polymer",
            weight: "4.8g (per bud)",
            battery: "7h (buds) + 30h (case)",
            processor: "Zenith S3 Adaptive",
            camera: "N/A",
            height: "2.1 cm",
            width: "1.8 cm"
        }
    },
    "22": {
        id: "22",
        name: "JBL Box XL",
        title: "Wi-Fi Speaker",
        category: "Audio",
        desc: "Fill any room with rich, high-fidelity sound. Features dual woofers and crystal clear tweeters.",
        variants: [
            { id: "v22_1", colorBg: "bg-black", ringColor: "ring-blue-800", img: spk1, price: "₹24,999", colorName: "Midnight Black" },
            { id: "v22_2", colorBg: "bg-blue-300", ringColor: "ring-stone-200", img: spk2, price: "₹24,999", colorName: "Sandstone" }
        ],
        specs: {
            brand: "JBL",
            material: "Hand-finished Wood & Fabric",
            weight: "450g",
            battery: "N/A (AC Powered)",
            processor: "Beam Audio Engine V2",
            camera: "N/A",
            height: "18.2 cm",
            width: "32.5 cm"
        }
    },
    "23": {
        id: "23",
        name: "Sonic Boom",
        title: "Powerful Speaker",
        category: "Audio",
        desc: "Explosive bass and massive volume. The ultimate speaker for large gatherings and outdoor events.",
        variants: [
            { id: "v23_1", colorBg: "bg-blue-300", ringColor: "ring-stone-700", img: spk3, price: "₹32,999", colorName: "Obsidian" },
            { id: "v23_2", colorBg: "bg-gray-700", ringColor: "ring-stone-300", img: spk4, price: "₹32,999", colorName: "Granite" }
        ],
        specs: {
            brand: "Sonic",
            material: "Ruggedized Polycarbonate",
            weight: "850g",
            battery: "24 Hours (Rechargeable)",
            processor: "Sonic Boost DSP",
            camera: "N/A",
            height: "45.0 cm",
            width: "22.0 cm"
        }
    },
    "24": {
        id: "24",
        name: "Nova Chrono",
        title: "Classic Smartwatch",
        category: "Wearables",
        desc: "Timeless design meets modern intelligence. A versatile smartwatch that fits perfectly in both the boardroom and the gym.",
        variants: [
            { id: "v24_1", colorBg: "bg-gray-200", ringColor: "ring-stone-400", img: wt1, price: "₹29,999", colorName: "Slate" },
            { id: "v24_2", colorBg: "bg-stone-400", ringColor: "ring-stone-600", img: wt2, price: "₹29,999", colorName: "Charcoal" }
        ],
        specs: {
            brand: "Nova",
            material: "Brushed Stainless Steel",
            weight: "58g",
            processor: "Chrono-X Chipset",
            display: '1.43" Super AMOLED',
            height: "4.6 cm",
            width: "4.6 cm",
            battery: "10 Days (Normal) | 20 Days (Saver)",
            camera: "N/A"
        }
    },
    "25": {
        id: "25",
        name: "Aero Slim 13",
        title: "Ultraportable Laptop",
        category: "Computing",
        desc: "Designed for those who move. Phenomenal battery life meets lightweight engineering for the ultimate travel workstation.",
        variants: [
            { id: "v25_1", colorBg: "bg-stone-300", ringColor: "ring-stone-200", img: cp_lp1, price: "₹1,29,999", colorName: "Platinum" },
            { id: "v25_2", colorBg: "bg-blue-900", ringColor: "ring-stone-600", img: cp_lp2, price: "₹1,32,999", colorName: "Storm" }
        ],
        specs: {
            brand: "Aero",
            material: "Carbon Fiber Hybrid",
            weight: "1.1kg",
            processor: "Intel Ultra 7",
            display: '13.4" OLED Infinity-Edge',
            height: "1.4 cm",
            width: "29.5 cm",
            battery: "14 Hours runtime",
            camera: "720p Dual-array Mic"
        }
    }
};

export const featuredProductsArray = Object.values(productsData);

const hero1 = '/headphone.jpg';
const hero2 = '/watch.jpg';
const hero3 = '/featured/buds3.jpg';
const hero4 = '/laptop.jpg';

export const heroSlides = [
    { id: 1, linkToProductId: "4", image: hero1, title: "Pure Sound", desc: "Precision audio.", btnText: "Explore", theme: "dark" },
    { id: 2, linkToProductId: "2", image: hero2, title: "Stay Connected", desc: "Wearables redfined.", btnText: "Shop", theme: "dark" },
    { id: 3, linkToProductId: "5", image: hero3, title: "Radical Design", desc: "Transparent tech.", btnText: "Discover", theme: "light" },
    { id: 4, linkToProductId: "3", image: hero4, title: "Ultimate Power", desc: "Workstation performance.", btnText: "View", theme: "dark" }
];
