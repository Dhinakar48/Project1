// Featured/Home specific images
import img1 from '../public/featured/buds1.avif';
import img1alt from '../public/featured/buds2.jpg';
import img2 from '../public/featured/watch1.avif';
import img2alt from '../public/featured/watch2.webp';
import img3 from '../public/laptop.jpg';
import img3alt from '../public/featured/laptop2.jpg';
import img4 from '../public/featured/headphone3.jpg';
import img4alt from '../public/featured/headphone4.png';
import img5 from '../public/featured/buds3.jpg';
import img5alt from '../public/featured/buds4.webp';
import img6 from '../public/featured/watch3.jpg';
import img6alt from '../public/featured/watch4.jpg';

// --- ALL PRODUCT IMAGES BY CATEGORY ---

// Audios
import mic1 from '../public/audios/microphone1.jpg';
import mic2 from '../public/audios/microphone2.jpg';
import mic3 from '../public/audios/microphone3.jpg';
import mic4 from '../public/audios/microphone4.jpg';
import spk1 from '../public/audios/speaker1.jpg';
import spk2 from '../public/audios/speaker2.jpg';
import spk3 from '../public/audios/speaker3.jpg';
import spk4 from '../public/audios/speaker4.jpg';
import hdp1 from '../public/audios/headphone1.jpg';
import hdp2 from '../public/audios/headphone2.jpg';
import hdp3 from '../public/audios/headphone3.jpg';
import hdp4 from '../public/audios/headphone4.jpg';
import bd1 from '../public/audios/buds1.jpg';
import bd2 from '../public/audios/buds2.jpg';
import bd3 from '../public/audios/buds3.jpg';
import bd4 from '../public/audios/buds4.jpg';

// Wearables
import glass1 from '../public/wearables/glass1.avif';
import glass2 from '../public/wearables/glass2.jpg';
import wt1 from '../public/wearables/watch1.jpg';
import wt2 from '../public/wearables/watch2.webp';
import wt3 from '../public/wearables/watch3.webp';
import wt4 from '../public/wearables/watch4.webp';
import wt5 from '../public/wearables/watch5.avif';
import wt6 from '../public/wearables/watch6.webp';

// Computing
import cp_lp1 from '../public/computing/laptop1.jpg';
import cp_lp2 from '../public/computing/laptop2.jpg';
import cp_lp3 from '../public/computing/laptop3.jpg';
import cp_lp4 from '../public/computing/laptop4.jpg';
import cp_mb1 from '../public/computing/mobile1.jpg';
import cp_mb2 from '../public/computing/mobile2.jpg';
import cp_mb3 from '../public/computing/mobile3.jpg';
import cp_mb4 from '../public/computing/mobile4.jpg';
import cp_mb5 from '../public/computing/mobile5.avif';
import cp_mb6 from '../public/computing/mobile6.avif';
import cp_mn1 from '../public/computing/monitor1.jpg';
import cp_mn2 from '../public/computing/monitor2.jpg';

// Accessories
import acc_cs1 from '../public/accessories/case1.jpg';
import acc_cs2 from '../public/accessories/case2.jpg';
import acc_cs3 from '../public/accessories/case3.avif';
import acc_cs4 from '../public/accessories/case4.webp';
import acc_ch1 from '../public/accessories/charger1.jpg';
import acc_ch2 from '../public/accessories/charger2.jpg';
import acc_pb1 from '../public/accessories/powerbank1.jpg';
import acc_pb2 from '../public/accessories/powerbank2.jpg';

export const productsData = {
    "1": {
        id: "1",
        name: "Bose Buds Pro",
        title: "Wireless Earbuds",
        category: "Audio",
        desc: "Immerse yourself in high-fidelity audio with active noise cancellation.",
        variants: [
            { id: "v1_1", colorBg: "bg-white", ringColor: "ring-gray-300", img: img1, price: "₹24,999", colorName: "Pearl" },
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
            { id: "v4_1", colorBg: "bg-black", ringColor: "ring-blue-400", img: hdp3, price: "₹34,999", colorName: "Ocean Blue" },
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
        title: "Rugged Smartwatch",
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
        title: "Luxury Watch",
        category: "Wearables",
        desc: "Luxury meets technology. Hand-polished titanium with smart guts.",
        variants: [
            { id: "v11_1", colorBg: "bg-stone-800", ringColor: "ring-stone-400", img: wt5, price: "₹84,999", colorName: "Raw Titan" },
            { id: "v11_2", colorBg: "bg-white", ringColor: "ring-amber-700", img: wt6, price: "₹86,999", colorName: "Classic White" }
        ]
    },
    "12": {
        id: "12",
        name: "Stealth 14",
        title: "Power Laptop",
        category: "Computing",
        desc: "Ultra-portable performance for the modern nomad.",
        variants: [
            { id: "v12_1", colorBg: "bg-stone-900", ringColor: "ring-stone-700", img: cp_lp3, price: "₹1,89,999", colorName: "Stealth" },
            { id: "v12_2", colorBg: "bg-yellow-100", ringColor: "ring-yellow-400", img: cp_lp4, price: "₹1,92,999", colorName: "Harvest Gold" }
        ]
    },
    "13": {
        id: "13",
        name: "Galaxy Flagship",
        title: "Smartphone",
        category: "Computing",
        desc: "The pinnacle of mobile photography and speed.",
        variants: [
            { id: "v13_1", colorBg: "bg-pink-200", ringColor: "ring-pink-400", img: cp_mb1, price: "₹1,34,999", colorName: "Rose Pink" },
            { id: "v13_2", colorBg: "bg-stone-600", ringColor: "ring-stone-600", img: cp_mb2, price: "₹1,36,999", colorName: "Dark Gray" }
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
            { id: "v20_2", colorBg: "bg-white", ringColor: "ring-stone-700", img: acc_ch2, price: "₹3,499", colorName: "Phantom" }
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
            { id: "v24_1", colorBg: "bg-white", ringColor: "ring-stone-400", img: wt1, price: "₹29,999", colorName: "Slate" },
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

import hero1 from '../public/headphone.jpg';
import hero2 from '../public/watch.jpg';
import hero3 from '../public/featured/buds3.jpg';
import hero4 from '../public/laptop.jpg';

export const heroSlides = [
    { id: 1, linkToProductId: "4", image: hero1, title: "Pure Sound", desc: "Precision audio.", btnText: "Explore", theme: "dark" },
    { id: 2, linkToProductId: "2", image: hero2, title: "Stay Connected", desc: "Wearables redfined.", btnText: "Shop", theme: "dark" },
    { id: 3, linkToProductId: "5", image: hero3, title: "Radical Design", desc: "Transparent tech.", btnText: "Discover", theme: "light" },
    { id: 4, linkToProductId: "3", image: hero4, title: "Ultimate Power", desc: "Workstation performance.", btnText: "View", theme: "light" }
];
