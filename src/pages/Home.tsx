import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Leaf, Sprout } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] md:min-h-[75vh] text-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="max-w-4xl"
      >
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-6 md:mb-8 tracking-tight font-display">
          <span className="bg-gradient-to-r from-gh-green-light via-teal-300 to-gh-accent bg-clip-text text-transparent text-glow-green drop-shadow-2xl">
            Garden Horizons
          </span>
        </h1>
        
        <p className="text-base sm:text-xl md:text-2xl text-gray-300 mb-10 md:mb-16 leading-relaxed max-w-3xl mx-auto font-light tracking-wide">
          Welcome to <span className="text-white font-medium">Garden Horizons Official</span>. 
          Discover powerful plants, rare mutations, and outstanding community achievements. 
          Explore a world where nature meets strategy.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center items-center w-full sm:w-auto">
          <Link to="/mutations" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.03, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto group relative px-6 py-4 md:px-10 md:py-5 bg-gh-green-dark/60 hover:bg-gh-green-dark border border-gh-green-light/30 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(74,222,128,0.1)] hover:shadow-[0_0_40px_rgba(74,222,128,0.3)] transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <div className="flex items-center justify-center gap-3 md:gap-4 text-gh-green-light font-bold text-base md:text-lg tracking-wider">
                <Sprout className="w-5 h-5 md:w-6 md:h-6" />
                <span>MUTATIONS</span>
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          </Link>

          <Link to="/plants" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.03, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto group relative px-6 py-4 md:px-10 md:py-5 bg-gh-blue/20 hover:bg-gh-blue/40 border border-gh-accent/30 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(139,92,246,0.1)] hover:shadow-[0_0_40px_rgba(139,92,246,0.3)] transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <div className="flex items-center justify-center gap-3 md:gap-4 text-gh-accent font-bold text-base md:text-lg tracking-wider">
                <Leaf className="w-5 h-5 md:w-6 md:h-6" />
                <span>PLANTS</span>
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
