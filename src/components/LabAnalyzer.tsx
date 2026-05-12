import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, FileText, Activity, CheckCircle2, Camera, Lightbulb, History, Search, User, Stethoscope, Calendar } from 'lucide-react';
import { useStore } from '../store/useStore';
import { analyzeLabReport } from '../services/aiService';
import { toast } from 'sonner';

interface LabAnalyzerProps {
  onClose: () => void;
}

export const LabAnalyzer: React.FC<LabAnalyzerProps> = ({ onClose }) => {
  const { addVitalSign, activeProfileId, user, addReport, reports, profiles, settings } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'scan' | 'saved'>('scan');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const activeProfile = profiles.find(p => p.id === activeProfileId);
  const [patientName, setPatientName] = useState(activeProfile?.name || '');
  const [doctorNotes, setDoctorNotes] = useState('');
  
  const savedReports = reports.filter(r => r.profileId === activeProfileId && r.type === 'lab_result');
  const language = settings.language;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Str = reader.result as string;
      setPreviewImage(base64Str);
      setIsAnalyzing(true);
      setResults(null);
      
      try {
        const base64Data = base64Str.split(',')[1];
        // We will pass the full base64 to the service
        const analysis = await analyzeLabReport(base64Data, file.type, language);
        setResults(analysis);
      } catch (error) {
        toast.error('Failed to analyze the report. Please try again.');
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const saveReport = () => {
    if (!results || !results.extractedVitals) return;
    
    let saved = 0;
    results.extractedVitals.forEach((vital: any) => {
      addVitalSign({
        id: Math.random().toString(36).substr(2, 9),
        profileId: activeProfileId,
        userId: user?.id || 'unknown',
        type: vital.type || 'generic',
        value: vital.value.toString(),
        unit: vital.unit,
        timestamp: new Date().toISOString(),
        status: vital.status,
        source: 'manual' as any
      });
      saved++;
    });

    addReport({
      id: Math.random().toString(36).substr(2, 9),
      profileId: activeProfileId,
      title: 'Lab Report Analysis',
      date: new Date().toISOString(),
      summary: results.summary,
      imageUrl: previewImage || undefined,
      type: 'lab_result',
      year: new Date().getFullYear(),
      category: 'Blood Test',
      patientName: patientName,
      doctorFollowUp: doctorNotes,
      metrics: results.extractedVitals,
      recommendations: results.recommendations
    });
    
    toast.success(`Saved report and ${saved} vital signs to your profile.`);
    setActiveTab('saved');
    setPreviewImage(null);
    setResults(null);
    setDoctorNotes('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-xl flex flex-col"
    >
      <div className="bg-card w-full h-full md:h-auto md:max-h-[90vh] md:max-w-2xl md:m-auto md:rounded-[40px] md:border md:border-border overflow-hidden flex flex-col shadow-2xl relative">
        <div className="flex flex-col border-b border-light relative z-10">
          <div className="flex items-center justify-between p-6 pb-4">
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground">AI Lab Analyzer</h2>
              <p className="text-sm text-muted-foreground font-medium">Extract insights from test reports</p>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex px-6 space-x-6">
            <button
              onClick={() => setActiveTab('scan')}
              className={`pb-3 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'scan' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              <Search size={16} /> SCAN NEW
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`pb-3 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'saved' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              <History size={16} /> SAVED ({savedReports.length})
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'scan' ? (
            <>
              {!previewImage ? (
                <div className="h-full flex flex-col items-center justify-center pt-8">
                  <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                    <FileText className="text-emerald-500" size={48} />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-center text-foreground">Upload Lab Report</h3>
                  <p className="text-sm text-muted-foreground mb-8 text-center max-w-sm px-4">
                    Take a photo of your blood test, lipid profile, or any lab result. Our AI will extract the key metrics.
                  </p>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/*,application/pdf"
                    capture
                    onChange={handleFileSelect}
                  />
                  
                  <div className="flex flex-col gap-4 w-full max-w-sm">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-6 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20"
                    >
                      <Camera size={24} /> <span className="text-sm">Scan Report</span>
                    </button>
                  </div>
                </div>
              ) : (
            <div className="space-y-6">
              {/* Preview */}
              <div className="relative h-48 rounded-2xl overflow-hidden border border-border bg-slate-900/50">
                <img src={previewImage || ''} alt="Scan preview" className="w-full h-full object-cover opacity-60" />
                {isAnalyzing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                    <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
                    <p className="text-sm font-bold text-emerald-500 animate-pulse">Analyzing document...</p>
                  </div>
                )}
              </div>

              {/* Results */}
              <AnimatePresence>
                {results && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Summary Card */}
                    <div className="bg-slate-900 rounded-3xl p-5 border border-white/5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl p-none" />
                      <h3 className="font-bold text-white mb-2 relative z-10">AI Summary</h3>
                      <p className="text-sm text-slate-300 leading-relaxed relative z-10">{results.summary}</p>
                    </div>

                    {/* Extracted Vitals */}
                    {results.extractedVitals && results.extractedVitals.length > 0 && (
                      <div>
                        <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3 px-1">Extracted Metrics</h4>
                        <div className="space-y-3">
                          {results.extractedVitals.map((vital: any, idx: number) => (
                            <div key={idx} className="bg-card border border-border p-4 rounded-2xl flex justify-between items-center shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                  vital.status === 'normal' ? 'bg-emerald-500/10 text-emerald-500' : 
                                  vital.status === 'high' ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'
                                }`}>
                                  <Activity size={20} />
                                </div>
                                <div>
                                  <p className="font-bold text-sm text-foreground capitalize">{vital.name}</p>
                                  <p className={`text-xs font-medium uppercase tracking-wider ${
                                    vital.status === 'normal' ? 'text-emerald-500' : 
                                    vital.status === 'high' ? 'text-rose-500' : 'text-blue-500'
                                  }`}>
                                    {vital.status}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-lg text-foreground">{vital.value} <span className="text-[10px] text-muted-foreground">{vital.unit}</span></p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {results.recommendations && results.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3 px-1 flex items-center gap-2">
                          <Lightbulb size={16} /> Actionable Steps
                        </h4>
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                          <ul className="space-y-2">
                            {results.recommendations.map((rec: string, idx: number) => (
                              <li key={idx} className="flex gap-2 text-sm text-amber-700 dark:text-amber-400">
                                <span className="font-bold mt-0.5">•</span>
                                <span className="leading-relaxed">{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Patient & Doctor Inputs */}
                    <div className="space-y-4 pt-4 border-t border-border">
                      <div>
                        <label className="text-xs font-bold text-muted-foreground uppercase pl-1">Patient Name</label>
                        <div className="flex items-center gap-3 bg-muted p-3 rounded-xl mt-1">
                          <User size={16} className="text-muted-foreground" />
                          <input 
                            type="text" 
                            className="bg-transparent border-none outline-none w-full text-foreground text-sm font-medium" 
                            placeholder="Patient's full name" 
                            value={patientName}
                            onChange={(e) => setPatientName(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-muted-foreground uppercase pl-1">Doctor Follow-up / Notes</label>
                        <div className="flex gap-3 bg-muted p-3 rounded-xl mt-1">
                          <Stethoscope size={16} className="text-muted-foreground shrink-0 mt-1" />
                          <textarea 
                            className="bg-transparent border-none outline-none w-full text-foreground text-sm font-medium resize-none" 
                            placeholder="Any notes from the doctor?" 
                            rows={3}
                            value={doctorNotes}
                            onChange={(e) => setDoctorNotes(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
            </>
          ) : (
            <div className="space-y-4">
              {savedReports.length === 0 ? (
                <div className="text-center py-10 opacity-50">
                  <History size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No saved reports found.</p>
                </div>
              ) : (
                savedReports.map(report => (
                  <div key={report.id} className="bg-card border border-border p-5 rounded-2xl space-y-3 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-foreground text-lg">{report.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Calendar size={12} /> {new Date(report.date).toLocaleDateString()}
                          {report.patientName && <><User size={12} className="ml-2" /> {report.patientName}</>}
                        </div>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider font-bold bg-primary/10 text-primary px-2 py-1 rounded-md shrink-0">
                        {report.metrics?.length || 0} Metrics
                      </span>
                    </div>
                    {report.summary && (
                      <p className="text-sm text-foreground/80 line-clamp-3">{report.summary}</p>
                    )}
                    {report.doctorFollowUp && (
                      <div className="flex gap-2 text-sm bg-blue-500/10 text-blue-700 dark:text-blue-400 p-3 rounded-xl mt-2 border border-blue-500/20">
                        <Stethoscope size={16} className="mt-0.5 shrink-0" />
                        <div>
                          <span className="font-bold block mb-1 text-xs uppercase tracking-wider">Doctor's Notes</span>
                          <p className="leading-relaxed">{report.doctorFollowUp}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {activeTab === 'scan' && results && results.extractedVitals && results.extractedVitals.length > 0 && (
          <div className="p-4 bg-background border-t border-border mt-auto">
            <button 
              onClick={saveReport}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={20} />
              Save to Health Profile
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
