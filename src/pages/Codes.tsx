import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import { Copy, Check, Ticket } from 'lucide-react';
import dbData from '../data/db.json';

interface CodeItem {
  id: number;
  code: string;
  description: string;
  displayOrder?: number;
}

export default function Codes() {
  const [codes, setCodes] = useState<CodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/content/codes');
        setCodes(res.data);
      } catch (err) {
        const staticItems = dbData.codes as CodeItem[];
        staticItems.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0) || b.id - a.id);
        setCodes(staticItems);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const copyToClipboard = (code: string, id: number) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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
            className="p-3 md:p-4 rounded-3xl bg-gradient-to-br from-gh-accent/20 to-purple-500/20 border border-white/10 shadow-[0_0_40px_rgba(139,92,246,0.1)] backdrop-blur-sm"
          >
            <Ticket className="w-8 h-8 md:w-12 md:h-12 text-gh-accent" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold bg-gradient-to-r from-gh-accent via-purple-400 to-pink-400 bg-clip-text text-transparent font-display tracking-tight drop-shadow-sm">
            Active Codes
          </h1>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gh-accent/5 blur-3xl rounded-full transform -translate-y-1/2" />
          <p className="relative text-base md:text-2xl text-gray-300 leading-relaxed font-light max-w-3xl mx-auto tracking-wide">
            Discover the latest active Garden Horizons codes. 
            Redeem them to unlock rewards and boost your progress.
          </p>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-32">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gh-accent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
          {codes.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card-roblox group p-8 flex flex-col items-center text-center border-gh-accent/20 hover:border-gh-accent/60 bg-gh-darker/80"
            >
              <div 
                className="relative w-full py-4 mb-6 bg-black/40 rounded-xl border border-white/5 group-hover:border-gh-accent/30 transition-colors cursor-pointer"
                onClick={() => copyToClipboard(item.code, item.id)}
              >
                <code className="text-2xl md:text-3xl font-mono font-bold text-gh-accent tracking-widest">
                  {item.code}
                </code>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                  {copiedId === item.id ? <Check size={20} className="text-green-400" /> : <Copy size={20} className="group-hover:text-white transition-colors" />}
                </div>
              </div>
              
              <p className="text-gray-400 font-light leading-relaxed">
                {item.description}
              </p>
              
              <button 
                onClick={() => copyToClipboard(item.code, item.id)}
                className="mt-6 text-xs font-bold uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors"
              >
                {copiedId === item.id ? 'Copied!' : 'Click to Copy'}
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
