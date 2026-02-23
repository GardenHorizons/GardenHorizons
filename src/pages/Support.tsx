import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, Send, CheckCircle, AlertCircle, MessageSquare, Ticket } from 'lucide-react';
import { cn } from '../lib/utils';
import dbData from '../data/db.json';

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

export default function Support() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({ discordUsername: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/content/faqs');
        setFaqs(res.data);
      } catch (err) {
        setFaqs(dbData.faqs as FAQ[]);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.discordUsername || !formData.message) return;

    setStatus('sending');
    try {
      await axios.post('/api/support', formData);
      setStatus('success');
      setFormData({ discordUsername: '', message: '' });
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 md:py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16 md:mb-24"
      >
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-6 md:mb-10">
          <div 
            className="p-3 md:p-4 rounded-3xl bg-gradient-to-br from-gh-purple/30 to-gh-blue/30 border border-white/10 shadow-[0_0_50px_rgba(139,92,246,0.15)]"
          >
            <Ticket className="w-8 h-8 md:w-12 md:h-12 text-gh-accent" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold bg-gradient-to-r from-gh-accent via-purple-300 to-indigo-400 bg-clip-text text-transparent font-display tracking-tight text-glow drop-shadow-2xl">
            Support Center
          </h1>
        </div>
        <p className="text-base md:text-2xl text-gray-300 font-light max-w-2xl mx-auto leading-relaxed">
          Need assistance? Browse our frequently asked questions or submit a ticket directly to our team.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 rounded-xl bg-gh-green-mid/20 border border-gh-green-light/20">
              <MessageSquare className="w-6 h-6 text-gh-green-light" />
            </div>
            <h2 className="text-3xl font-bold text-white font-display tracking-wide">
              Knowledge Base
            </h2>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div 
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + (index * 0.1) }}
                className="glass-panel rounded-2xl overflow-hidden border border-white/5 hover:border-gh-green-light/30 transition-all duration-300 group"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
                >
                  <span className={`font-semibold text-lg tracking-wide transition-colors ${openFaq === faq.id ? 'text-gh-green-light' : 'text-gray-200 group-hover:text-white'}`}>
                    {faq.question}
                  </span>
                  {openFaq === faq.id ? <ChevronUp className="text-gh-green-light" /> : <ChevronDown className="text-gray-500 group-hover:text-white" />}
                </button>
                <AnimatePresence>
                  {openFaq === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-8 pb-8 text-gray-300 text-base leading-relaxed border-t border-white/5 pt-6 font-light">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 rounded-xl bg-gh-accent/20 border border-gh-accent/20">
              <Send className="w-6 h-6 text-gh-accent" />
            </div>
            <h2 className="text-3xl font-bold text-white font-display tracking-wide">
              Submit a Ticket
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="glass-panel p-10 rounded-3xl space-y-8 border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.3)] relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gh-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="relative z-10">
              <label className="block text-xs font-bold text-gh-accent mb-3 uppercase tracking-[0.2em]">Discord Username</label>
              <input
                type="text"
                required
                value={formData.discordUsername}
                onChange={e => setFormData({ ...formData, discordUsername: e.target.value })}
                className="w-full bg-gh-darker/60 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-gh-accent focus:ring-1 focus:ring-gh-accent transition-all placeholder:text-gray-600 font-medium"
                placeholder="username"
              />
            </div>
            <div className="relative z-10">
              <label className="block text-xs font-bold text-gh-accent mb-3 uppercase tracking-[0.2em]">Message</label>
              <textarea
                required
                rows={6}
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-gh-darker/60 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-gh-accent focus:ring-1 focus:ring-gh-accent transition-all resize-none placeholder:text-gray-600 font-light leading-relaxed"
                placeholder="Describe your issue in detail..."
              />
            </div>

            <button
              type="submit"
              disabled={status === 'sending' || status === 'success'}
              className={cn(
                "w-full py-5 rounded-xl font-bold flex items-center justify-center gap-3 transition-all uppercase tracking-[0.15em] text-sm relative z-10 overflow-hidden group",
                status === 'success' 
                  ? "bg-green-600 text-white shadow-[0_0_30px_rgba(22,163,74,0.4)]" 
                  : "bg-gradient-to-r from-gh-purple to-gh-blue hover:from-gh-accent hover:to-gh-purple text-white shadow-[0_0_30px_rgba(139,92,246,0.2)] hover:shadow-[0_0_40px_rgba(139,92,246,0.4)]"
              )}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative flex items-center gap-3">
                {status === 'sending' && <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />}
                {status === 'success' && <><CheckCircle size={20} /> Ticket Sent</>}
                {status === 'error' && <><AlertCircle size={20} /> Failed to Send</>}
                {status === 'idle' && <><Send size={18} /> Submit Ticket</>}
              </span>
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
