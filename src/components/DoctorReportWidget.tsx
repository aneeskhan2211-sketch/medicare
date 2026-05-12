import React, { useState } from 'react';
import { FileText, Download, Loader2, CheckCircle2, ChevronRight, Stethoscope } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useStore } from '../store/useStore';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export const DoctorReportWidget: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const generateClinicalReport = useStore(state => state.generateClinicalReport);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateClinicalReport();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MediPulse_Clinical_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Clinical report downloaded successfully');
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/5 dark:to-purple-500/5 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Stethoscope size={18} className="shrink-0" />
              <span className="text-xs font-black uppercase tracking-widest">Medical Professional Export</span>
            </div>
            <h3 className="text-xl font-display font-bold text-foreground leading-tight">
              Clinical Summary Report
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px]">
              Generate a professional summary of your vitals, adherence, and medication history for your doctor.
            </p>
          </div>
          
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 shadow-xl flex items-center justify-center shrink-0 border border-indigo-500/10">
             <FileText className="text-indigo-500" size={32} />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-4 mb-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-white/50 dark:bg-slate-800/50 p-2 rounded-lg border border-indigo-500/5">
              <CheckCircle2 size={12} className="text-emerald-500" />
              <span>PDF Format</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-white/50 dark:bg-slate-800/50 p-2 rounded-lg border border-indigo-500/5">
              <CheckCircle2 size={12} className="text-emerald-500" />
              <span>Clinically Valid</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            disabled={isGenerating}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[18px] font-bold shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>COMPILING RECORDS...</span>
              </>
            ) : (
              <>
                <Download size={20} />
                <span>EXPORT DOCTOR REPORT</span>
              </>
            )}
          </motion.button>
          
          <button className="text-[10px] text-center font-bold text-muted-foreground/60 hover:text-muted-foreground flex items-center justify-center gap-1 transition-colors group uppercase tracking-widest mt-1">
            Preview current report data <ChevronRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
