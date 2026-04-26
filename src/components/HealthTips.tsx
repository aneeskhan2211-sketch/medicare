import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lightbulb, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useStore } from '../store/useStore';
import { toast } from 'sonner';

const tips = [
  "Take your medication at the same time each day to build a habit.",
  "Keep your medication in a cool, dry place away from direct sunlight.",
  "If you miss a dose, check the leaflet or ask your doctor what to do.",
  "Bring an updated list of your medications to all doctor appointments.",
  "Stay hydrated – it helps your body absorb medication more effectively.",
  "Don't stop taking your medication just because you feel better."
];

export const HealthTips: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % tips.length);
    }, 5000); // Rotate every 5 seconds
    return () => clearInterval(timer);
  }, []);

  const addCoins = useStore(state => state.addCoins);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Health Tip',
          text: tips[index],
        });
        addCoins(5);
        toast.success('Shared! You earned 5 coins!');
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      const mailtoLink = `mailto:?subject=Health Tip&body=${encodeURIComponent(tips[index])}`;
      window.location.href = mailtoLink;
      addCoins(5);
      toast.success('Shared! You earned 5 coins!');
    }
  };

  return (
    <section className="space-y-4">
      <h3 className="font-display font-bold text-slate-900 px-1">Health Tips</h3>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-none bg-sky-50 card-shadow rounded-[20px]">
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="text-sky-500 shrink-0">
                  <Lightbulb size={24} />
                </div>
                <p className="text-sm font-medium text-sky-900 leading-relaxed">
                  {tips[index]}
                </p>
              </div>
              <button onClick={handleShare} className="text-sky-600 hover:text-sky-800 p-2 rounded-full hover:bg-sky-100 transition-colors">
                <Share2 size={20} />
              </button>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </section>
  );
};
