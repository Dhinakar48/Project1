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
              alt="hero"
              className="absolute right-0 top-0 h-full w-full md:w-3/4 object-cover object-center opacity-30 md:opacity-50"
            />
            {/* Gradient Mask */}
            <div className="absolute inset-0 bg-gradient-to-r from-stone-50 via-stone-50/90 to-transparent"></div>
          </div>

          {/* Text Content - Moves in sync with the slide */}
          <div className="relative z-10 w-full px-6 sm:px-10 md:px-16 max-w-7xl mx-auto">
            <div className="max-w-2xl">
              <motion.h1 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-5xl sm:text-6xl md:text-8xl font-black mb-6 leading-[0.9] tracking-tighter text-stone-900"
              >
                {slides[currentSlide].title}
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-stone-600 text-sm sm:text-base md:text-lg mb-10 tracking-wide max-w-md font-medium"
              >
                {slides[currentSlide].desc}
              </motion.p>
              
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                onClick={() => navigate(`/product/${slides[currentSlide].linkToProductId}`)}
                className="bg-stone-900 text-stone-50 px-10 py-5 text-sm sm:text-base font-bold shadow-2xl hover:bg-stone-800 transition-all uppercase tracking-[0.2em] border border-stone-800 active:scale-95"
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
            className={`h-1 transition-all duration-700 ease-in-out ${currentSlide === idx ? "w-20 bg-stone-900" : "w-10 bg-stone-300 hover:bg-stone-400"}`}
            aria-label={`Go to slide ${idx + 1}`}
          ></button>
        ))}
      </div>

    </div>
  );
}