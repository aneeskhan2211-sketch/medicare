import React from 'react';
import { Camera, Pill, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AIVisionWidgetProps {
  onClick: () => void;
  className?: string;
}

export const AIVisionWidget: React.FC<AIVisionWidgetProps> = ({ onClick, className }) => {
  return (
    <Card 
      onClick={onClick}
      className={cn(
        "overflow-hidden border-none bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-lg rounded-[24px] transition-all hover:shadow-sky-500/20 cursor-pointer group active:scale-[0.98]",
        className
      )}
    >
      <CardContent className="p-3.5 relative h-full flex flex-col justify-between min-h-[120px]">
        {/* Background Sparkles */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl group-hover:scale-110 transition-transform" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
              <Sparkles size={16} className="text-white animate-pulse" />
            </div>
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20">
              <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[7px] font-black uppercase tracking-widest">AI Vision</span>
            </div>
          </div>
          
          <div className="space-y-0.5">
            <h3 className="text-sm font-black tracking-tight leading-tight group-hover:translate-x-1 transition-transform">Identify Pill</h3>
            <p className="text-[9px] font-bold text-white/60 leading-tight">Snap & know meds</p>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between mt-2">
          <div className="flex -space-x-1">
            {[1, 2].map((i) => (
              <div key={i} className="w-4 h-4 rounded-full border border-sky-400 bg-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                <Pill size={8} className="text-white opacity-60" />
              </div>
            ))}
          </div>
          
          <div className="h-7 pr-1 pl-2.5 bg-white text-indigo-600 rounded-full flex items-center gap-1.5 font-bold text-[9px] shadow-md group-hover:bg-indigo-50 transition-colors">
            SCAN
            <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
              <Camera size={10} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
