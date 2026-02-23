import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import { Play, Trophy } from 'lucide-react';

interface FameItem {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  youtubeUrl: string;
}

export default function HallOfFame() {
  const [items, setItems] = useState<FameItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/content/hall_of_fame')
      .then(res => setItems(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
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
            className="p-3 md:p-4 rounded-3xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-white/10 shadow-[0_0_40px_rgba(234,179,8,0.1)] backdrop-blur-sm"
          >
            <Trophy className="w-8 h-8 md:w-12 md:h-12 text-yellow-400" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold bg-gradient-to-r from-yellow-100 via-yellow-300 to-yellow-600 bg-clip-text text-transparent font-display tracking-tight drop-shadow-sm">
            Hall of Fame
          </h1>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-yellow-500/5 blur-3xl rounded-full transform -translate-y-1/2" />
          <p className="relative text-base md:text-2xl text-gray-300 leading-relaxed font-light max-w-3xl mx-auto tracking-wide">
            Celebrating the greatest achievements in Garden Horizons. 
            Here you’ll find world records, extreme challenges, and outstanding community moments.
          </p>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-32">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500/50"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-4">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="card-roblox border-yellow-500/10 hover:border-yellow-500/40 group bg-gh-darker/60"
            >
              <div className="aspect-video w-full relative overflow-hidden border-b border-white/5">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center backdrop-blur-[2px] group-hover:backdrop-blur-0">
                  {item.youtubeUrl && (
                    <a 
                      href={item.youtubeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-20 h-20 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all border-4 border-white/10"
                    >
                      <Play fill="currentColor" className="ml-2 w-8 h-8" />
                    </a>
                  )}
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-3 text-yellow-100 font-display tracking-wide group-hover:text-yellow-400 transition-colors">{item.name}</h3>
                <p className="text-gray-400 text-sm leading-7 font-light">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
