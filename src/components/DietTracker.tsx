import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Utensils, Droplets, Camera, Plus, Loader2, Upload, Leaf, AlertTriangle } from 'lucide-react';
import { analyzeFoodImage } from '../services/aiService';
import { toast } from 'sonner';
import { useStore } from '../store/useStore';

export const DietTracker: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { 
    meals: globalMeals, 
    addMeal, 
    activeProfileId, 
    waterIntake, 
    logWater 
  } = useStore();
  
  const today = new Date().toISOString().split('T')[0];
  const waterGlasses = waterIntake[today] || 0;
  
  const [activeTab, setActiveTab] = useState<'diet' | 'hydration'>('diet');
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  
  const meals = globalMeals.filter(m => m.profileId === activeProfileId && m.date === today);

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + (meal.carbs || 0), 0);
  const totalFats = meals.reduce((sum, meal) => sum + (meal.fats || 0), 0);
  
  const goalCalories = 2000;
  const goalProtein = 150;
  const goalCarbs = 200;
  const goalFats = 70;

  const [showManualLog, setShowManualLog] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [manualForm, setManualForm] = useState({ name: '', calories: '', protein: '', carbs: '', fats: '', type: 'Snack' });

  interface DayHistory {
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  }

  // History from all days
  const historyByDate = globalMeals.reduce((acc, meal) => {
    if (meal.profileId !== activeProfileId) return acc;
    if (!acc[meal.date]) {
      acc[meal.date] = { date: meal.date, calories: 0, protein: 0, carbs: 0, fats: 0 };
    }
    acc[meal.date].calories += meal.calories;
    acc[meal.date].protein += (meal.protein || 0);
    acc[meal.date].carbs += (meal.carbs || 0);
    acc[meal.date].fats += (meal.fats || 0);
    return acc;
  }, {} as Record<string, DayHistory>);

  const historyList = Object.values(historyByDate).sort((a: DayHistory, b: DayHistory) => b.date.localeCompare(a.date));


  const handleManualLog = () => {
    if (!manualForm.name || !manualForm.calories) {
      toast.error('Name and Calories are required');
      return;
    }
    addMeal({
      id: Math.random().toString(36).substr(2, 9),
      profileId: activeProfileId,
      name: manualForm.name,
      calories: parseInt(manualForm.calories) || 0,
      type: manualForm.type,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      protein: parseInt(manualForm.protein) || 0,
      carbs: parseInt(manualForm.carbs) || 0,
      fats: parseInt(manualForm.fats) || 0,
      date: today
    });
    setManualForm({ name: '', calories: '', protein: '', carbs: '', fats: '', type: 'Snack' });
    setShowManualLog(false);
    toast.success('Meal logged successfully!');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const toastId = toast.loading('Analyzing food...');

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        
        try {
          const result = await analyzeFoodImage(base64String, file.type);
          
          if (result.name && result.calories) {
            addMeal({
              id: Math.random().toString(36).substr(2, 9),
              profileId: activeProfileId,
              name: result.name,
              calories: result.calories,
              type: result.type || 'Meal',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              protein: typeof result.protein === 'number' ? result.protein : 15,
              carbs: typeof result.carbs === 'number' ? result.carbs : 30,
              fats: typeof result.fats === 'number' ? result.fats : 10,
              healthyRemarks: result.healthyRemarks,
              unhealthyRemarks: result.unhealthyRemarks,
              date: today
            });
            toast.success(`Added ${result.name}!`, { id: toastId });
          } else {
            toast.error('Could not identify food.', { id: toastId });
          }
        } catch (_) {
          toast.error('Failed to analyze image.', { id: toastId });
        } finally {
          setIsScanning(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (_) {
      toast.error('Failed to read file.', { id: toastId });
      setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="px-6 py-4 flex items-center justify-between border-b border-border bg-card">
        <div>
          <h2 className="text-2xl font-black font-display text-foreground">Diet & Nutrition</h2>
          <p className="text-sm font-medium text-muted-foreground">Track your intake</p>
        </div>
        <button onClick={onClose} className="w-10 h-10 bg-muted/50 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors">
          <X size={20} />
        </button>
      </header>

      <div className="p-4 flex gap-2">
        <button 
          onClick={() => setActiveTab('diet')}
          className={`flex-1 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'diet' ? 'bg-lime-500/20 text-lime-600 dark:text-lime-400' : 'bg-muted/50 text-muted-foreground'}`}
        >
          <Utensils size={18} /> Meals
        </button>
        <button 
          onClick={() => setActiveTab('hydration')}
          className={`flex-1 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'hydration' ? 'bg-sky-500/20 text-sky-600 dark:text-sky-400' : 'bg-muted/50 text-muted-foreground'}`}
        >
          <Droplets size={18} /> Hydration
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'diet' ? (
            <motion.div key="diet" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
              
              <div className="bg-white dark:bg-card rounded-3xl p-6 shadow-sm border border-border">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">Daily Goals</h3>
                  <button onClick={() => setShowHistory(true)} className="text-lime-600 dark:text-lime-400 font-bold text-sm bg-lime-500/10 px-3 py-1 rounded-full">History</button>
                </div>
                
                  <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-bold w-full">
                       <span className="text-muted-foreground">Calories</span>
                       <span className="text-lime-600 dark:text-lime-400">{Math.round(totalCalories)} / {goalCalories} kcal</span>
                    </div>
                    <div className="w-full bg-muted h-4 rounded-full overflow-hidden relative">
                      <div className="bg-lime-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (totalCalories/goalCalories)*100)}%` }} />
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/80">{Math.round((totalCalories/goalCalories)*100)}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {[ { name: 'Prot', val: totalProtein, goal: goalProtein, colors: { bg: 'bg-sky-500', bgLight: 'bg-sky-500/10' } },
                       { name: 'Carbs', val: totalCarbs, goal: goalCarbs, colors: { bg: 'bg-amber-500', bgLight: 'bg-amber-500/10' } },
                       { name: 'Fats', val: totalFats, goal: goalFats, colors: { bg: 'bg-rose-500', bgLight: 'bg-rose-500/10' } } ].map(mac => (
                      <div key={mac.name} className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground w-full">
                            <span>{mac.name}</span>
                            <span>{Math.round(mac.val)}g</span>
                        </div>
                        <div className={`w-full ${mac.colors.bgLight} h-3 rounded-full overflow-hidden`}>
                          <div className={`${mac.colors.bg} h-full rounded-full`} style={{ width: `${Math.min(100, (mac.val/mac.goal)*100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4 pb-10">
                <div className="flex justify-between items-center px-2">
                  <h3 className="font-bold text-lg">Today's Meals</h3>
                  <button onClick={() => setShowManualLog(true)} className="text-lime-500 font-bold text-sm bg-lime-500/10 px-3 py-1 rounded-full">+ Add</button>
                </div>

                {meals.map(meal => (
                  <div key={meal.id} className="bg-card border border-border p-4 rounded-2xl flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-lime-500/10 text-lime-500 rounded-xl flex items-center justify-center">
                          <Utensils size={18} />
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground text-sm">{meal.name}</h4>
                          <p className="text-xs text-muted-foreground font-medium">{meal.type} • {meal.time}</p>
                        </div>
                      </div>
                      <span className="font-black text-lime-500">{meal.calories} kcal</span>
                    </div>
                    {meal.protein !== undefined && (
                      <div className="flex gap-2 text-[10px] font-bold text-muted-foreground bg-muted/30 p-2 rounded-lg justify-around">
                        <span className="text-sky-500 bg-sky-500/10 px-2 py-1 rounded">P: {meal.protein}g</span>
                        <span className="text-amber-500 bg-amber-500/10 px-2 py-1 rounded">C: {meal.carbs}g</span>
                        <span className="text-rose-500 bg-rose-500/10 px-2 py-1 rounded">F: {meal.fats}g</span>
                      </div>
                    )}
                    {meal.healthyRemarks && meal.healthyRemarks.length > 0 && (
                      <div className="p-3 rounded-lg text-xs leading-relaxed border bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                        <div className="flex items-center gap-2 font-bold mb-1">
                          <Leaf size={14} /> Healthy Aspects
                        </div>
                        <ul className="list-disc pl-5 opacity-90 space-y-1">
                          {meal.healthyRemarks.map((remark, idx) => (
                            <li key={idx}>{remark}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {meal.unhealthyRemarks && meal.unhealthyRemarks.length > 0 && (
                      <div className="p-3 rounded-lg text-xs leading-relaxed border bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400 mt-2">
                        <div className="flex items-center gap-2 font-bold mb-1">
                          <AlertTriangle size={14} /> Points of Concern
                        </div>
                        <ul className="list-disc pl-5 opacity-90 space-y-1">
                          {meal.unhealthyRemarks.map((remark, idx) => (
                            <li key={idx}>{remark}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="file" 
                    accept="image/*"
                    capture
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                  <input 
                    type="file" 
                    accept="image/*"
                    className="hidden"
                    ref={galleryInputRef}
                    onChange={handleFileUpload}
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isScanning}
                    className="w-full py-4 border-2 border-dashed border-border rounded-2xl text-muted-foreground font-bold flex flex-col items-center justify-center gap-2 hover:bg-muted/50 hover:border-lime-500/30 hover:text-lime-500 transition-colors disabled:opacity-50"
                  >
                    {isScanning ? <Loader2 size={24} className="animate-spin text-lime-500" /> : <Camera size={24} />}
                    <span className="text-xs">Take Photo</span>
                  </button>
                  <button 
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={isScanning}
                    className="w-full py-4 border-2 border-dashed border-border rounded-2xl text-muted-foreground font-bold flex flex-col items-center justify-center gap-2 hover:bg-muted/50 hover:border-lime-500/30 hover:text-lime-500 transition-colors disabled:opacity-50"
                  >
                    {isScanning ? <Loader2 size={24} className="animate-spin text-lime-500" /> : <Upload size={24} />}
                    <span className="text-xs">Upload from Gallery</span>
                  </button>
                </div>
              </div>

            </motion.div>
          ) : (
            <motion.div key="hydration" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              
              <div className="bg-gradient-to-br from-sky-400 to-blue-600 rounded-3xl p-6 text-white shadow-lg text-center">
                <Droplets size={48} className="mx-auto mb-4 opacity-80" />
                <h3 className="text-4xl font-black mb-1">{waterGlasses} / 8</h3>
                <p className="font-medium text-sky-100 mb-6 tracking-wide">Glasses of Water Today</p>
                
                <div className="flex justify-center gap-4">
                  <button 
                    onClick={() => logWater(Math.max(0, waterGlasses - 1))}
                    className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    -
                  </button>
                  <button 
                    onClick={() => logWater(Math.min(20, waterGlasses + 1))}
                    className="w-16 h-12 rounded-full bg-white text-sky-600 font-black flex items-center justify-center hover:bg-sky-50 transition-colors"
                  >
                    <Plus size={24} />
                  </button>
                </div>
              </div>

              <div className="bg-card border border-border rounded-3xl p-5">
                <h4 className="font-bold mb-4 px-1">Recent Drinks</h4>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="text-sky-500 bg-sky-500/10 p-2 rounded-lg">
                          <Droplets size={16} />
                        </div>
                        <span className="font-medium text-sm">Glass of Water (250ml)</span>
                      </div>
                      <span className="text-xs font-bold text-muted-foreground">{12 - i}:00 PM</span>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showManualLog && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="w-full max-w-sm bg-card rounded-3xl p-6 shadow-2xl border border-border"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold font-display">Log Meal</h3>
                <button onClick={() => setShowManualLog(false)} className="text-muted-foreground hover:bg-muted p-2 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase pl-2">Meal Name</label>
                  <input type="text" placeholder="e.g. Scrambled Eggs" value={manualForm.name} onChange={e => setManualForm({...manualForm, name: e.target.value})} className="w-full bg-muted border-none rounded-xl p-3 focus:ring-2 focus:ring-lime-500 outline-none" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase pl-2">Calories</label>
                    <input type="number" placeholder="kcal" value={manualForm.calories} onChange={e => setManualForm({...manualForm, calories: e.target.value})} className="w-full bg-muted border-none rounded-xl p-3 focus:ring-2 focus:ring-lime-500 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase pl-2">Meal Type</label>
                    <select value={manualForm.type} onChange={e => setManualForm({...manualForm, type: e.target.value})} className="w-full bg-muted border-none rounded-xl p-3 focus:ring-2 focus:ring-lime-500 outline-none appearance-none">
                      <option>Breakfast</option>
                      <option>Lunch</option>
                      <option>Dinner</option>
                      <option>Snack</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-sky-500 uppercase">Protein (g)</label>
                    <input type="number" placeholder="0" value={manualForm.protein} onChange={e => setManualForm({...manualForm, protein: e.target.value})} className="w-full bg-sky-500/10 text-sky-600 border-none rounded-xl p-3 focus:ring-2 focus:ring-sky-500 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-amber-500 uppercase">Carbs (g)</label>
                    <input type="number" placeholder="0" value={manualForm.carbs} onChange={e => setManualForm({...manualForm, carbs: e.target.value})} className="w-full bg-amber-500/10 text-amber-600 border-none rounded-xl p-3 focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-rose-500 uppercase">Fats (g)</label>
                    <input type="number" placeholder="0" value={manualForm.fats} onChange={e => setManualForm({...manualForm, fats: e.target.value})} className="w-full bg-rose-500/10 text-rose-600 border-none rounded-xl p-3 focus:ring-2 focus:ring-rose-500 outline-none" />
                  </div>
                </div>

                <button onClick={handleManualLog} className="w-full bg-lime-500 hover:bg-lime-600 text-white font-bold text-lg p-4 rounded-xl mt-4 transition-colors">
                  Save Meal
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {showHistory && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="w-full max-w-sm bg-card rounded-3xl p-6 shadow-2xl border border-border"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold font-display">Diet History</h3>
                <button onClick={() => setShowHistory(false)} className="text-muted-foreground hover:bg-muted p-2 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-3">
                {historyList.map((day, i) => (
                  <div key={i} className="bg-muted/50 p-4 rounded-2xl flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-sm">{day.date}</p>
                      <p className="font-black text-lime-600">{Math.round(day.calories)} kcal</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[10px] uppercase font-bold text-muted-foreground bg-white/50 dark:bg-black/20 p-2 rounded-lg text-center">
                       <div className="text-sky-600">P: {Math.round(day.protein)}g</div>
                       <div className="text-amber-600">C: {Math.round(day.carbs)}g</div>
                       <div className="text-rose-600">F: {Math.round(day.fats)}g</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
