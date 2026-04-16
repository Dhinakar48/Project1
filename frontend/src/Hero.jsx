import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { heroSlides as slides } from "./data";

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[80vh] sm:h-[85vh] bg-stone-50 text-stone-900 overflow-hidden flex items-center border-b border-stone-200">
      
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={currentSlide}
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "-100%", opacity: 0 }}
          transition={{ 
            duration: 0.8, 
            ease: [0.25, 1, 0.5, 1]
          }}
          style={{ willChange: "transform, opacity" }}
          className="absolute inset-0 w-full h-full flex items-center"
        >
          {/* Background/Product Image - Strictly contained in this slide's layer */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <img
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              className="absolute inset-0 w-full h-full object-cover object-center scale-105"
            />
            {/* Left side blur overlay for text readability */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm [mask-image:linear-gradient(to_right,black_30%,transparent_60%)] md:[mask-image:linear-gradient(to_right,black_40%,transparent_70%)] pointer-events-none"></div>
          </div>

          {/* Text Content - Moves in sync with the slide */}
          <div className="relative z-10 w-full px-4 sm:px-8 md:px-16 max-w-7xl mr-auto">
            <div className="max-w-2xl">
              <motion.h1 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className={`text-5xl sm:text-6xl md:text-8xl font-black mb-6 leading-[0.9] tracking-tighter ${
                  slides[currentSlide].theme === "dark" ? "text-white" : "text-stone-900"
                }`}
              >
                {slides[currentSlide].title}
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className={`text-sm sm:text-base md:text-lg mb-10 tracking-wide max-w-md font-semibold ${
                  slides[currentSlide].theme === "dark" ? "text-white/80" : "text-amber-700/70"
                }`}
              >
                {slides[currentSlide].desc}
              </motion.p>
              
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                onClick={() => navigate(`/product/${slides[currentSlide].linkToProductId}`)}
                className={`px-10 py-5 text-sm sm:text-base font-black transition-all uppercase tracking-[0.2em] border active:scale-95 ${
                  slides[currentSlide].theme === "dark" 
                  ? "bg-amber-500 text-stone-900 hover:bg-amber-400 border-amber-500" 
                  : "bg-amber-600 text-white hover:bg-amber-500 border-amber-600 shadow-xl shadow-amber-600/20"
                }`}
              >
                {slides[currentSlide].btnText}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slide Indicators - Fixed position, not moving with slides */}
      <div className="absolute bottom-12 left-6 sm:left-10 md:left-16 flex gap-4 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-1 transition-all duration-700 ease-in-out ${
              currentSlide === idx 
                ? `w-20 ${slides[currentSlide].theme === "dark" ? "bg-white" : "bg-stone-900"}` 
                : `w-10 ${slides[currentSlide].theme === "dark" ? "bg-white/30 hover:bg-white/50" : "bg-stone-300 hover:bg-stone-400"}`
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          ></button>
        ))}
      </div>

    </div>
  );
}