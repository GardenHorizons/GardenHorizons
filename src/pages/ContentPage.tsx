import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import { Sprout, Leaf } from 'lucide-react';
import dbData from '../data/db.json';

interface Item {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  overlayText: string;
  displayOrder?: number;
}

export default function ContentPage({ type }: { type: 'mutations' | 'plants' }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/content/${type}`);
        setItems(res.data);
      } catch (err) {
        // Fallback to static data
        const staticItems = (dbData as any)[type] as Item[];
        // Sort static data
        staticItems.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0) || b.id - a.id);
        setItems(staticItems);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [type]);

  const isMutations = type === 'mutations';
  const title = isMutations ? 'Rare Mutations' : 'Powerful Plants';
  const subtitle = isMutations 
    ? 'Mutations are special plant evolutions with unique traits and enhanced potential. Discover their abilities and find out which ones stand out the most.'
    : 'Each plant has its own traits and growth potential. Learn what makes them unique and how they contribute to your progression.';
  
  const Icon = isMutations ? Sprout : Leaf;
  const gradientClass = isMutations 
    ? "from-gh-green-light via-emerald-400 to-teal-500" 
    : "from-gh-green-light via-lime-400 to-green-600";
  const glowClass = isMutations ? "text-glow" : "text-glow-green";

  return (
    <div className="py-8 md:py-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-16 md:mb-24 text-center max-w-5xl mx-auto px-4"
      >
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-6 md:mb-10">
          <div 
            className={`p-3 md:p-4 rounded-3xl bg-gradient-to-br ${isMutations ? 'from-gh-purple/20 to-gh-blue/20' : 'from-gh-green-dark/40 to-gh-green-mid/20'} border border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.05)] backdrop-blur-sm`}
          >
            <Icon className={`w-8 h-8 md:w-12 md:h-12 ${isMutations ? 'text-gh-accent' : 'text-gh-green-light'}`} />
          </div>
          
          <h1 className={`text-4xl sm:text-5xl md:text-7xl font-bold bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent font-display tracking-tight ${glowClass} drop-shadow-2xl`}>
            {title}
          </h1>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 bg-gh-green-light/5 blur-3xl rounded-full transform -translate-y-1/2" />
          <p className="relative text-base md:text-2xl text-gray-300 leading-relaxed font-light max-w-3xl mx-auto tracking-wide">
            {subtitle}
          </p>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-32">
          <div className={`animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 ${isMutations ? 'border-gh-accent' : 'border-gh-green-light'} shadow-[0_0_30px_rgba(255,255,255,0.1)]`}></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-4">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.6, ease: "easeOut" }}
              className="card-roblox group flex flex-col h-full bg-gh-darker/80 backdrop-blur-md border-white/5 hover:border-white/20"
            >
              <div className="aspect-[16/10] w-full overflow-hidden relative border-b border-white/5">
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gh-darker/90 via-transparent to-transparent" />
                
                {item.overlayText && (
                  <div className={`absolute bottom-4 right-4 bg-black/70 backdrop-blur-md px-4 py-1.5 rounded-lg text-xs font-bold font-mono ${isMutations ? 'text-gh-accent border-gh-accent/20' : 'text-gh-green-light border-gh-green-light/20'} border shadow-lg tracking-wider uppercase`}>
                    {item.overlayText}
                  </div>
                )}
              </div>
              
              <div className="p-8 flex-grow flex flex-col relative overflow-hidden">
                {/* Subtle background glow on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${isMutations ? 'from-gh-purple/10' : 'from-gh-green-dark/10'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                
                <h3 className={`text-2xl font-bold mb-4 text-white group-hover:${isMutations ? 'text-gh-accent' : 'text-gh-green-light'} transition-colors font-display tracking-wide`}>
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm leading-7 font-light tracking-wide">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
