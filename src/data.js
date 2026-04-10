// Featured/Home specific images
const img1 = '/featured/buds1.avif';
const img1alt = '/featured/buds2.jpg';
const img2 = '/featured/watch1.avif';
const img2alt = '/featured/watch2.webp';
const img3 = '/laptop.jpg';
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
const mic2 = '/audios/microphone2.jpg';
const mic3 = '/audios/microphone3.jpg';
const mic4 = '/audios/microphone4.jpg';
const spk1 = '/audios/speaker1.jpg';
const spk2 = '/audios/speaker2.jpg';
const spk3 = '/audios/speaker3.jpg';
const spk4 = '/audios/speaker4.jpg';
const hdp1 = '/audios/headphone1.jpg';
const hdp2 = '/audios/headphone2.jpg';
const hdp3 = '/audios/headphone3.avif';
const hdp4 = '/audios/headphone4.png';
const bd1 = '/audios/buds1.jpg';
const bd2 = '/audios/buds2.jpg';
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
            { id: "v1_1", colorBg: "bg-gray-200", ringColor: "ring-gray-300", img: img1, price: "₹24,999", colorName: "Pearl" },
            { id: "v1_2", colorBg: "bg-gray-800", ringColor: "ring-gray-600", img: img1alt, price: "₹25,999", colorName: "Midnight" }
        ]
    },
    "2": {
        id: "2",
        name: "Pulse Watch X",
        title: "Smartwatch",
        category: "Wearables",
        desc: "Track your fitness, stay connected, and look sleek. The ultimate companion.",
        variants: [
            { id: "v2_1", colorBg: "bg-yellow-100", ringColor: "ring-stone-400", img: img2, price: "₹41,999", colorName: "Titanium" },
            { id: "v2_2", colorBg: "bg-blue-900", ringColor: "ring-blue-700", img: img2alt, price: "₹43,999", colorName: "Ocean" }
        ]
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
        ]
    },
    "4": {
        id: "4",
        name: "Aura Studio X",
        title: "Over-Ear Headphones",
        category: "Audio",
        desc: "Studio-quality sound with spatial audio capabilities.",
        variants: [
            { id: "v4_1", colorBg: "bg-gray-200", ringColor: "ring-blue-400", img: hdp3, price: "₹34,999", colorName: "Ocean Blue" },
            { id: "v4_2", colorBg: "bg-blue-600", ringColor: "ring-red-400", img: hdp4, price: "₹35,999", colorName: "Ember Red" }
        ]
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
        ]
    },
    "6": {
        id: "6",
        name: "Chronos Alpine",
        title: "Luxury watch",
        category: "Wearables",
        desc: "Built for the outdoors. Massive battery and precise GPS.",
        variants: [
            { id: "v6_1", colorBg: "bg-blue-900", ringColor: "ring-orange-500", img: wt3, price: "₹52,999", colorName: "Sunset Orange" },
            { id: "v6_2", colorBg: "bg-stone-300", ringColor: "ring-stone-700", img: wt4, price: "₹54,999", colorName: "Obsidian" }
        ]
    },
    "7": {
        id: "7",
        name: "ProCast Studio",
        title: "Professional Mic",
        category: "Audio",
        desc: "Broadcast-ready microphone for professional audio production.",
        variants: [
            { id: "v7_1", img: mic1, price: "₹21,999", colorName: "Pro Black" },
            { id: "v7_2", img: mic2, price: "₹22,499", colorName: "Steel" }
        ]
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
        ]
    },
    "9": {
        id: "9",
        name: "Sonic Core H1",
        title: "Hi-Fi Headphones",
        category: "Audio",
        desc: "Experience sound in its purest form with open-back acoustics.",
        variants: [
            { id: "v9_1", colorBg: "bg-blue-100", ringColor: "ring-blue-600", img: hdp1, price: "₹42,999", colorName: "Deep Sea" },
            { id: "v9_2", colorBg: "bg-stone-100", ringColor: "ring-stone-600", img: hdp2, price: "₹42,999", colorName: "Matte" }
        ]
    },
    "10": {
        id: "10",
        name: "Vision Pro Glass",
        title: "AR Glasses",
        category: "Wearables",
        desc: "The future of vision. Overlay your life with digital intelligence.",
        variants: [
            { id: "v10_1", img: glass1, price: "₹1,24,999", colorName: "Dark Matter Style" },
            { id: "v10_2", img: glass2, price: "₹1,26,999", colorName: "Pure Style" }
        ]
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
        ]
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
        ]
    },
    "13": {
        id: "13",
        name: "Samsung S26Ultra",
        title: "Smartphone",
        category: "Computing",
        desc: "The pinnacle of mobile photography and speed.",
        variants: [
            { id: "v13_1", colorBg: "bg-violet-900", ringColor: "ring-pink-400", img: cp_mb1, price: "₹1,34,999", colorName: "Rose Pink" },
            { id: "v13_2", colorBg: "bg-blue-100", ringColor: "ring-stone-600", img: cp_mb2, price: "₹1,36,999", colorName: "Dark Gray" }
        ]
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
        ]
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
        ]
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
        ]
    },
    "17": {
        id: "17",
        name: "Apple iPhone 17 ProMax",
        title: "Smartphone",
        category: "Computing",
        desc: "Forged in titanium. Featuring the groundbreaking A17 Pro chip and a customizable Action button.",
        variants: [
            { id: "v17_1", colorBg: "bg-blue-100", ringColor: "ring-stone-600", img: cp_mb3, price: "₹1,34,900", colorName: "Black Titanium" },
            { id: "v17_2", colorBg: "bg-orange-400", ringColor: "ring-stone-200", img: cp_mb4, price: "₹1,34,900", colorName: "White Titanium" }
        ]
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
        ]
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
        ]
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
        ]
    },
    "21": {
        id: "21",
        name: "Zenith Pods Pro",
        title: "Wireless Buds",
        category: "Audio",
        desc: "The original studio-quality earbuds. Unmatched clarity and comfortable fit for all-day listening.",
        variants: [
            { id: "v21_1", colorBg: "bg-violet-200", ringColor: "ring-stone-200", img: bd1, price: "₹14,999", colorName: "Pure White" },
            { id: "v21_2", colorBg: "bg-green-900", ringColor: "ring-stone-700", img: bd2, price: "₹15,499", colorName: "Space Black" }
        ]
    },
    "22": {
        id: "22",
        name: "Beam Box XL",
        title: "Hi-Fi Speaker",
        category: "Audio",
        desc: "Fill any room with rich, high-fidelity sound. Features dual woofers and crystal clear tweeters.",
        variants: [
            { id: "v22_1", colorBg: "bg-black", ringColor: "ring-blue-800", img: spk1, price: "₹24,999", colorName: "Midnight Blue" },
            { id: "v22_2", colorBg: "bg-blue-300", ringColor: "ring-stone-200", img: spk2, price: "₹24,999", colorName: "Sandstone" }
        ]
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
        ]
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
        ]
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
        ]
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
    { id: 4, linkToProductId: "3", image: hero4, title: "Ultimate Power", desc: "Workstation performance.", btnText: "View", theme: "light" }
];
