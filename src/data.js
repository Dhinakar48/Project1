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

export const productsData = {
    "1": {
        id: "1",
        name: "Bose Buds Pro",
        title: "Wireless Earbuds",
        desc: "Immerse yourself in high-fidelity audio with active noise cancellation. Perfect for the audiophile on the go.",
        variants: [
            { id: "v1_1", colorBg: "bg-white", ringColor: "ring-gray-300", img: img1, price: "₹24,999", colorName: "Pearl" },
            { id: "v1_2", colorBg: "bg-gray-800", ringColor: "ring-gray-600", img: img1alt, price: "₹25,999", colorName: "Midnight" }
        ]
    },
    "2": {
        id: "2",
        name: "Pulse Watch X",
        title: "Smartwatch",
        desc: "Track your fitness, stay connected, and look sleek. The ultimate companion for a modern lifestyle.",
        variants: [
            { id: "v2_1", colorBg: "bg-stone-300", ringColor: "ring-stone-400", img: img2, price: "₹41,999", colorName: "Titanium" },
            { id: "v2_2", colorBg: "bg-blue-900", ringColor: "ring-blue-700", img: img2alt, price: "₹43,999", colorName: "Ocean" }
        ]
    },
    "3": {
        id: "3",
        name: "Vertex Pro 16",
        title: "Laptop",
        desc: "Unmatched performance. Power through heavy workflows with our most advanced chipset yet.",
        variants: [
            { id: "v3_1", colorBg: "bg-stone-300", ringColor: "ring-stone-400", img: img3, price: "₹1,59,999", colorName: "Silver" },
            { id: "v3_2", colorBg: "bg-stone-800", ringColor: "ring-stone-700", img: img3alt, price: "₹1,69,999", colorName: "Space Gray" }
        ]
    },
    "4": {
        id: "4",
        name: "Aura Studio X",
        title: "Over-Ear Headphones",
        desc: "Studio-quality sound with spatial audio capabilities and plush memory foam ear cups.",
        variants: [
            { id: "v4_1", colorBg: "bg-stone-800", ringColor: "ring-stone-600", img: img4, price: "₹34,999", colorName: "Matte Black" },
            { id: "v4_2", colorBg: "bg-white", ringColor: "ring-gray-300", img: img4alt, price: "₹35,999", colorName: "Cloud White" }
        ]
    },
    "5": {
        id: "5",
        name: "Zenith Pods Plus",
        title: "Active Earbuds",
        desc: "Designed for the ultimate workout. Sweatproof, secure fit, and punchy bass.",
        variants: [
            { id: "v5_1", colorBg: "bg-purple-900", ringColor: "ring-purple-700", img: img5, price: "₹18,999", colorName: "Deep Purple" },
            { id: "v5_2", colorBg: "bg-stone-300", ringColor: "ring-stone-400", img: img5alt, price: "₹19,499", colorName: "Astro Gray" }
        ]
    },
    "6": {
        id: "6",
        name: "Chronos Alpine",
        title: "Rugged Smartwatch",
        desc: "Built for the outdoors. Features precise GPS tracking, altimeter, and a massive 30-day battery life.",
        variants: [
            { id: "v6_1", colorBg: "bg-orange-600", ringColor: "ring-orange-500", img: img6, price: "₹52,999", colorName: "Sunset Orange" },
            { id: "v6_2", colorBg: "bg-stone-900", ringColor: "ring-stone-700", img: img6alt, price: "₹54,999", colorName: "Obsidian" }
        ]
    },
    "default": {
        id: "default",
        name: "Premium Device",
        title: "Technology",
        desc: "Experience the next generation of technological excellence.",
        variants: [
            { id: "vd_1", colorBg: "bg-white", ringColor: "ring-gray-400", img: img1, price: "₹82,999", colorName: "Standard" }
        ]
    }
};

export const featuredProductsArray = [
    productsData["1"],
    productsData["2"],
    productsData["3"],
    productsData["4"],
    productsData["5"],
    productsData["6"]
];

import hero1 from '../public/featured/headphone3.jpg';
import hero2 from '../public/featured/watch1.avif';
import hero3 from '../public/featured/buds3.jpg';
import hero4 from '../public/featured/laptop2.jpg';

export const heroSlides = [
    {
        id: 1,
        linkToProductId: "1",
        image: hero1,
        title: "Pure Sound",
        desc: "Precision-engineered audio for the most demanding listeners.",
        btnText: "Explore Audio"
    },
    {
        id: 2,
        linkToProductId: "2",
        image: hero2,
        title: "Stay Connected",
        desc: "Next-generation wearables to track your life, seamlessly.",
        btnText: "Shop Wearables"
    },
    {
        id: 3,
        linkToProductId: "default",
        image: hero3,
        title: "Radical Design",
        desc: "Transparent aesthetics meeting unparalleled performance.",
        btnText: "Discover More"
    },
    {
        id: 4,
        linkToProductId: "3",
        image: hero4,
        title: "Ultimate Power",
        desc: "Unmatched performance for heavy workflows with our new chipset.",
        btnText: "View Computers"
    }
];
