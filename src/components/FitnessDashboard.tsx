import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { X, Activity, Navigation, Thermometer, Battery, MapPin, Play, Square, Settings, RefreshCw, Footprints, Flame, Timer, Bike, Dumbbell, Zap, Bed, Car, ArrowRight, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ActivityType, ActivitySession, DailySummary } from '../types';

export const FitnessDashboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const activeProfileId = useStore(state => state.activeProfileId);
  const settings = useStore(state => state.settings);
  const profiles = useStore(state => state.profiles);
  const activeProfile = profiles.find(p => p.id === activeProfileId);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [askingPermission, setAskingPermission] = useState(false);

  // Simulated live sensor data
  const [activityType, setActivityType] = useState<ActivityType>('STILL');
  const [speed, setSpeed] = useState(0); // km/h
  const [steps, setSteps] = useState(0);
  const [distance, setDistance] = useState(0);
  const [calories, setCalories] = useState(0);
  const [trackingActive, setTrackingActive] = useState(false);
  const [healthScore, setHealthScore] = useState(85);
  const [heartRate, setHeartRate] = useState(72);
  const [confidence, setConfidence] = useState(98);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'timeline' | 'analytics'>('dashboard');

  const [locationEnabled, setLocationEnabled] = useState(false);

  useEffect(() => {
    // Check if permissions already granted via connected trackers
    if (settings.appleHealthConnected || settings.googleFitConnected || settings.smartwatchConnected) {
      setPermissionGranted(true);
      setTrackingActive(true);
      enableLocation();
    } else {
      setPermissionGranted(false);
      setTrackingActive(false);
    }
  }, [settings.appleHealthConnected, settings.googleFitConnected]);

  const enableLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationEnabled(true);
        },
        (error) => {
          setLocationEnabled(false);
          console.error("Location error:", error);
        },
        { enableHighAccuracy: true }
      );
    }
  };

  const handleGrantPermissions = () => {
    setAskingPermission(true);
    setTimeout(() => {
      localStorage.setItem('medipulse_fitness_permissions', 'granted');
      setPermissionGranted(true);
      setAskingPermission(false);
      setTrackingActive(true);
      enableLocation();
    }, 1500);
  };

  // Simulate background tracking and activity recognition
  useEffect(() => {
    if (!trackingActive) return;

    let tick = 0;
    const interval = setInterval(() => {
      tick++;
      
      // Simulate activity changes based on time
      if (tick % 20 === 0) {
        // Change activity randomly for demo
        const activities: ActivityType[] = ['WALKING', 'RUNNING', 'STILL', 'CYCLING', 'IN_VEHICLE'];
        const next = activities[Math.floor(Math.random() * activities.length)];
        setActivityType(next);
        
        switch(next) {
          case 'WALKING': setSpeed(4.5); setConfidence(95); break;
          case 'RUNNING': setSpeed(10.2); setConfidence(88); break;
          case 'CYCLING': setSpeed(22.5); setConfidence(92); break;
          case 'IN_VEHICLE': setSpeed(45.0); setConfidence(99); break;
          case 'STILL': setSpeed(0); setConfidence(100); break;
          default: setSpeed(0); setConfidence(90);
        }
      }

      // Update metrics based on current activity
      if (activityType === 'WALKING') {
        setSteps(s => s + 2);
        setDistance(d => d + 0.001);
        setCalories(c => c + 0.1);
        setHeartRate(95 + Math.floor(Math.random() * 10));
      } else if (activityType === 'RUNNING') {
        setSteps(s => s + 3);
        setDistance(d => d + 0.003);
        setCalories(c => c + 0.3);
        setHeartRate(140 + Math.floor(Math.random() * 15));
      } else if (activityType === 'CYCLING') {
        setDistance(d => d + 0.006);
        setCalories(c => c + 0.2);
        setHeartRate(130 + Math.floor(Math.random() * 10));
      } else if (activityType === 'IN_VEHICLE') {
        setDistance(d => d + 0.012);
        setHeartRate(75 + Math.floor(Math.random() * 5));
      } else {
        setHeartRate(70 + Math.floor(Math.random() * 5));
      }

    }, 1000);

    return () => clearInterval(interval);
  }, [trackingActive, activityType]);

  const getActivityIcon = (type: ActivityType, size = 20) => {
    switch (type) {
      case 'WALKING': return <Footprints size={size} />;
      case 'RUNNING': return <Flame size={size} />;
      case 'CYCLING': return <Bike size={size} />;
      case 'STILL': return <Bed size={size} />;
      case 'IN_VEHICLE': return <Car size={size} />;
      case 'STAIR_CLIMBING': return <Activity size={size} />;
      case 'WORKOUT': return <Dumbbell size={size} />;
      default: return <Activity size={size} />;
    }
  };

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case 'WALKING': return 'text-emerald-500 bg-emerald-500/10';
      case 'RUNNING': return 'text-orange-500 bg-orange-500/10';
      case 'CYCLING': return 'text-blue-500 bg-blue-500/10';
      case 'STILL': return 'text-indigo-500 bg-indigo-500/10';
      case 'IN_VEHICLE': return 'text-purple-500 bg-purple-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  // Removed the early return for activeProfile so that the component can at least render the ui
  // We handle it gracefully below.
  if (!activeProfile) {
    return (
      <div className="h-full flex flex-col bg-background relative overflow-hidden">
        <header className="p-6 flex justify-between items-center relative z-10">
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center relative z-10">
          <div className="w-24 h-24 bg-rose-500/10 text-rose-500 rounded-[32px] flex items-center justify-center mb-8">
            <Activity size={48} />
          </div>
          <h2 className="text-2xl font-black mb-4">Profile Required</h2>
          <p className="text-muted-foreground mb-8">
            Please create and select a profile in the app to access Fitness features.
          </p>
          <Button 
            className="w-full h-14 rounded-2xl font-bold text-lg" 
            onClick={onClose}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!permissionGranted) {
    return (
      <div className="h-full flex flex-col bg-background relative overflow-hidden">
        <header className="p-6 flex justify-between items-center relative z-10">
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center relative z-10">
          <div className="w-24 h-24 bg-primary/10 text-primary rounded-[32px] flex items-center justify-center mb-8">
            <Activity size={48} />
          </div>
          <h2 className="text-2xl font-black mb-4">Auto Activity Tracking</h2>
          <p className="text-muted-foreground mb-8">
            MediPulse uses Activity Recognition and device sensors to automatically detect if you are walking, running, cycling, or driving. No manual start needed.
          </p>
          
          <div className="w-full space-y-4 mb-8 text-left">
            <div className={`flex items-center gap-3 p-4 rounded-2xl ${locationEnabled ? 'bg-emerald-500/10' : 'bg-muted'}`}>
              <MapPin className={locationEnabled ? 'text-emerald-500' : 'text-primary'} size={20} />
              <div>
                <p className="font-bold text-sm">Location Services</p>
                <p className={`text-xs ${locationEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                  {locationEnabled ? 'Location active and capturing' : 'Required for speed and distance calculation'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-muted rounded-2xl">
              <Zap className="text-primary" size={20} />
              <div>
                <p className="font-bold text-sm">Physical Activity</p>
                <p className="text-xs text-muted-foreground">Required to detect walking, running, or cycling</p>
              </div>
            </div>
          </div>

          <Button 
            className="w-full h-14 rounded-2xl font-bold text-lg" 
            onClick={handleGrantPermissions}
            disabled={askingPermission}
          >
            {askingPermission ? "Requesting..." : "Enable Tracking"}
          </Button>
          <p className="mt-4 text-[10px] text-muted-foreground">
            We use a foreground service to track your activity while the app is in the background. Note: In this web demo, sensors are simulated.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <header className="p-6 bg-card border-b border-border shadow-sm flex flex-col z-10 sticky top-0">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">Fitness</h2>
            <div className="flex items-center gap-2 text-xs font-bold mt-1">
              {trackingActive ? (
                <span className="flex items-center gap-1.5 text-emerald-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Syncing
                </span>
              ) : (
                <span className="text-muted-foreground">Paused</span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 bg-muted p-1 rounded-xl">
          <button 
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'timeline' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('timeline')}
          >
            Timeline
          </button>
          <button 
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'analytics' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto w-full touch-pan-y custom-scrollbar p-6 space-y-6">
        
        {activeTab === 'dashboard' && (
          <>
            {/* Live Detected Activity Card */}
            <Card className="rounded-[24px] border-none shadow-xl bg-gradient-to-br from-card to-muted relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Current State</span>
                  </div>
                  <div className="bg-background/80 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border border-border/50">
                    Confidence: {confidence}%
                  </div>
                </div>

                <div className="flex items-center gap-6 mb-8">
                  <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center shadow-inner ${getActivityColor(activityType)}`}>
                    {getActivityIcon(activityType, 40)}
                  </div>
                  <div>
                    <h3 className="text-3xl font-black capitalize tracking-tight leading-none mb-1 text-foreground">{activityType.toLowerCase().replace('_', ' ')}</h3>
                    {activityType !== 'STILL' && activityType !== 'IN_VEHICLE' && (
                      <p className="text-primary font-bold">{speed.toFixed(1)} km/h</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div className="flex flex-col border-r border-border/50 pr-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Steps</span>
                    <span className="font-mono font-bold">{steps}</span>
                  </div>
                  <div className="flex flex-col border-r border-border/50 px-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Distance</span>
                    <span className="font-mono font-bold">{distance.toFixed(2)}<span className="text-[10px] ml-0.5">km</span></span>
                  </div>
                  <div className="flex flex-col border-r border-border/50 px-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Calories</span>
                    <span className="font-mono font-bold">{calories.toFixed(0)}</span>
                  </div>
                  <div className="flex flex-col pl-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1"><Heart size={10} className="text-rose-500 animate-pulse" /> HR</span>
                    <span className="font-mono font-bold">{heartRate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Daily Summary */}
            <div>
              <h3 className="font-display font-bold text-foreground mb-4">Today's Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <Card className="rounded-[20px] bg-emerald-500/10 border-none">
                  <CardContent className="p-4">
                    <Footprints className="text-emerald-500 mb-2" size={18} />
                    <div className="text-2xl font-black text-foreground mb-1">4,285</div>
                    <div className="text-xs font-bold text-muted-foreground">Steps</div>
                  </CardContent>
                </Card>
                <Card className="rounded-[20px] bg-orange-500/10 border-none">
                  <CardContent className="p-4">
                    <Flame className="text-orange-500 mb-2" size={18} />
                    <div className="text-2xl font-black text-foreground mb-1">320</div>
                    <div className="text-xs font-bold text-muted-foreground">Kcal Burned</div>
                  </CardContent>
                </Card>
                <Card className="rounded-[20px] bg-blue-500/10 border-none">
                  <CardContent className="p-4">
                    <MapPin className="text-blue-500 mb-2" size={18} />
                    <div className="text-2xl font-black text-foreground mb-1">3.2</div>
                    <div className="text-xs font-bold text-muted-foreground">Total Km</div>
                  </CardContent>
                </Card>
                <Card className="rounded-[20px] bg-primary/10 border-none">
                  <CardContent className="p-4">
                    <Timer className="text-primary mb-2" size={18} />
                    <div className="text-2xl font-black text-foreground mb-1">45</div>
                    <div className="text-xs font-bold text-muted-foreground">Active Min</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* AI Insights */}
            <Card className="rounded-[20px] border-none bg-indigo-50 dark:bg-indigo-950/20 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={16} className="text-indigo-500" />
                  <h4 className="font-bold text-indigo-900 dark:text-indigo-400 text-sm">AI Health Insights</h4>
                </div>
                <ul className="space-y-2 text-sm text-indigo-800/80 dark:text-indigo-300/80 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                    You walked 3.2 km today, good progress towards your 5km goal.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                    Your heart rate was stable during your morning commute.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-border/50">
            {[
              { type: 'WALKING', time: '10:30 AM', duration: '15 min', details: '1.2 km' },
              { type: 'IN_VEHICLE', time: '09:00 AM', duration: '45 min', details: 'Commute' },
              { type: 'RUNNING', time: '07:30 AM', duration: '30 min', details: '3.5 km • 320 kcal' },
              { type: 'SLEEPING', time: '11:00 PM', duration: '8h 15m', details: 'Deep sleep: 2h' },
            ].map((item, i) => (
              <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className={`p-2 rounded-full z-10 border-4 border-background ${getActivityColor(item.type as ActivityType).split(' ')[1]} ${getActivityColor(item.type as ActivityType).split(' ')[0]}`}>
                  {getActivityIcon(item.type as ActivityType, 16)}
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] px-4 py-3 bg-muted rounded-2xl shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm capitalize">{item.type.toLowerCase().replace('_', ' ')}</span>
                    <span className="text-[10px] font-bold text-muted-foreground">{item.time}</span>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{item.duration}</span>
                    <span>•</span>
                    <span>{item.details}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h3 className="font-display font-bold text-foreground">Weekly Activity</h3>
            <div className="h-48 flex items-end gap-2 px-2">
              {[40, 65, 30, 80, 50, 90, 45].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-primary/20 rounded-t-lg relative group transition-all" style={{ height: `${val}%` }}>
                     <div className="absolute inset-x-0 bottom-0 bg-primary rounded-t-lg transition-all h-[60%]" />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                  </span>
                </div>
              ))}
            </div>

            <Card className="rounded-[20px] border-none bg-muted">
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-foreground">Health Score</span>
                  <span className="text-lg font-black text-primary">{healthScore}/100</span>
                </div>
                <div className="h-2 bg-background rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${healthScore}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">Based on your activity levels, sleep quality, and heart rate patterns.</p>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h4 className="font-bold text-sm">Background Sync Status</h4>
              <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                <div className="flex items-center gap-3">
                  <RefreshCw size={16} className="text-primary animate-spin" style={{ animationDuration: '3s' }} />
                  <div>
                    <p className="text-sm font-bold">Firestore Sync</p>
                    <p className="text-[10px] text-muted-foreground">Last synced: Just now</p>
                  </div>
                </div>
                <div className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-full">Active</div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
