import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import { Sparkles, Zap } from 'lucide-react';
import dbData from '../data/db.json';

interface UpdateItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  overlayText?: string;
  displayOrder?: number;
}

export default function Updates() {
  const [items, setItems] = useState<UpdateItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/content/updates');
        setItems(res.data);
      } catch (err) {
        const staticItems = (dbData as any).updates as UpdateItem[] || [];
        staticItems.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0) || b.id - a.id);
        setItems(staticItems);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
            className="p-3 md:p-4 rounded-3xl bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-white/10 shadow-[0_0_40px_rgba(236,72,153,0.1)] backdrop-blur-sm"
          >
            <Zap className="w-8 h-8 md:w-12 md:h-12 text-pink-400" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 bg-clip-text text-transparent font-display tracking-tight drop-shadow-sm">
            Latest Updates
          </h1>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-pink-500/5 blur-3xl rounded-full transform -translate-y-1/2" />
          <p className="relative text-base md:text-2xl text-gray-300 leading-relaxed font-light max-w-3xl mx-auto tracking-wide">
            Stay up to date with the newest features, changes, and improvements in Garden Horizons.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-12 md:gap-16 max-w-6xl mx-auto px-4">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex flex-col md:flex-row gap-6 md:gap-10 items-start"
          >
            {/* Image Container */}
            <div className="w-full md:w-1/2 flex flex-col gap-0 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/20 backdrop-blur-sm">
              <div className="relative aspect-video w-full overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                <img 
                  src={item.imageUrl} 
                  alt={item.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Overlay Text (Bottom Right) */}
                {item.overlayText && (
                  <div className="absolute bottom-4 right-4 z-20 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-sm font-medium text-white/90">
                    {item.overlayText}
                  </div>
                )}
              </div>
              
              {/* Title Box (Directly below image) */}
              <div className="bg-gradient-to-r from-red-500/10 to-purple-500/10 border-t border-white/10 p-5 backdrop-blur-md">
                <h2 className="text-2xl md:text-3xl font-bold text-white font-display tracking-wide leading-tight">
                  {item.title}
                </h2>
              </div>
            </div>

            {/* Description (Right on Desktop, Below on Mobile) */}
            <div className="w-full md:w-1/2 flex flex-col justify-center py-2 md:py-4">
              <div className="prose prose-invert max-w-none">
                <p className="text-base md:text-lg text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {item.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}

        {items.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            No updates found. Check back later!
          </div>
        )}
      </div>
    </div>
  );
}
