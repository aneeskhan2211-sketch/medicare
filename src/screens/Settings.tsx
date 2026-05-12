import React from 'react';
import { useStore } from '../store/useStore';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Bell, Moon, Languages, Clock, Shield, Fingerprint, Lock, RefreshCw, Cloud, Coffee, Utensils, Activity, Sun, Watch, Smartphone, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Settings as SettingsType } from '../types';
import { notificationService } from '../services/notificationService';
import { useTranslation } from 'react-i18next';

export const Settings = () => {
  const { t, i18n } = useTranslation();
  const { settings, updateSettings, syncData, profiles, activeProfileId, updateLifestyle, logout } = useStore();
  const [isSyncing, setIsSyncing] = React.useState(false);
  const activeProfile = profiles.find(p => p.id === activeProfileId);
  const lifestyle = activeProfile?.lifestyle || {
    wakeTime: '07:00',
    sleepTime: '23:00',
    mealTimes: { breakfast: '08:00', lunch: '13:00', dinner: '19:30' },
    activityLevel: 'moderate'
  };

  const updateMealTime = (meal: 'breakfast' | 'lunch' | 'dinner', time: string) => {
    updateLifestyle(activeProfileId, {
      ...lifestyle,
      mealTimes: { ...lifestyle.mealTimes, [meal]: time }
    });
  };

  const safeSettings: SettingsType = {
    ...settings,
    notifications: settings?.notifications || { enabled: true, emailEnabled: true, pushEnabled: true, reminderSound: 'default' },
    security: settings?.security || { biometricEnabled: false, autoLock: false, twoFactorEnabled: false },
    darkMode: settings?.darkMode ?? false,
    language: settings?.language || 'en',
    quietHours: settings?.quietHours || { enabled: false, start: '22:00', end: '07:00' },
    dataSync: settings?.dataSync || { autoSync: true, lastSynced: new Date().toISOString() },
    caregiverAlerts: settings?.caregiverAlerts || { enabled: false, name: '', email: '', phone: '', alertOnMissingCritical: true },
    smartwatchConnected: settings?.smartwatchConnected ?? false,
    appleHealthConnected: settings?.appleHealthConnected ?? false,
    googleFitConnected: settings?.googleFitConnected ?? false,
    sensitivity: settings?.sensitivity ?? 50
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncData();
    } catch (error) {
      toast.error("Sync failed. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };
    
  return (
    <div className="h-full overflow-y-auto overflow-x-hidden touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="space-y-6 p-6 text-foreground min-h-full flex flex-col">
        <h2 className="text-2xl font-bold font-display px-2">Settings</h2>
        
        <Card className="rounded-[32px] card-shadow border-none bg-card overflow-hidden flex-1 mb-6">
          <CardContent className="p-6 space-y-8">
          {/* Notifications */}
          <div className="space-y-5">
            <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Notifications</h3>
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-3">
                  <Bell className="text-primary" size={18}/>
                  <span className="text-sm font-bold text-foreground">Enable All Notifications</span>
                </div>
                <p className="text-[11px] text-slate-400 pl-8 leading-tight">Master switch for all medicine and task alerts</p>
              </div>
              <Switch 
                checked={safeSettings.notifications.enabled}
                onCheckedChange={(checked) => updateSettings({ notifications: { ...safeSettings.notifications, enabled: checked } })}
              />
            </div>
            
            {safeSettings.notifications.enabled && (
              <div className="space-y-4 pl-8 pt-1">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground/80">Email Notifications</span>
                    <p className="text-[10px] text-slate-400 leading-tight">Receive daily summaries in your inbox</p>
                  </div>
                  <Switch 
                    checked={safeSettings.notifications.emailEnabled}
                    onCheckedChange={(checked) => updateSettings({ notifications: { ...safeSettings.notifications, emailEnabled: checked } })}
                  />
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground/80">Push Notifications</span>
                    <p className="text-[10px] text-slate-400 leading-tight">Get real-time alerts on this device</p>
                  </div>
                  <Switch 
                    checked={safeSettings.notifications.pushEnabled}
                    onCheckedChange={async (checked) => {
                      if (checked) {
                        const granted = await notificationService.requestPermission();
                        if (!granted) {
                          toast.error('Notification permission denied', {
                            description: 'Please enable notifications in your browser settings.'
                          });
                          return;
                        }
                      }
                      updateSettings({ notifications: { ...safeSettings.notifications, pushEnabled: checked } });
                    }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-foreground">Reminder Sound</span>
                <p className="text-[11px] text-slate-400 leading-tight">Choose the alert tone for your medications</p>
              </div>
              <select 
                value={safeSettings.notifications.reminderSound} 
                onChange={(e) => updateSettings({ notifications: { ...safeSettings.notifications, reminderSound: e.target.value } })}
                className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-sm font-bold border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-all"
              >
                <option value="default">Default System Tone</option>
                <option value="chime">Gentle Chime</option>
                <option value="alarm">Loud Alarm</option>
              </select>
            </div>
          </div>
          
          {/* Daily Routine for AI */}
          <div className="space-y-5 pt-5 border-t border-border transition-colors">
            <h3 className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest px-1">Daily Routine (AI Optimization)</h3>
            <p className="text-[10px] text-slate-400 pl-1 leading-tight -mt-4">This data helps MediPulse suggest the best times for your pills.</p>
            
            <div className="grid gap-3">
               <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Sun className="text-amber-500" size={18} />
                    <span className="text-sm font-bold">Wake Time</span>
                  </div>
                  <Input 
                    type="time" 
                    value={lifestyle.wakeTime || ''}
                    className="w-24 h-10 bg-transparent border-none text-right font-bold"
                    onChange={(e) => updateLifestyle(activeProfileId, { ...lifestyle, wakeTime: e.target.value })}
                  />
               </div>
               <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/50">
                  <div className="flex items-center gap-3">
                    <Moon className="text-indigo-500" size={18} />
                    <span className="text-sm font-bold">Sleep Time</span>
                  </div>
                  <Input 
                    type="time" 
                    value={lifestyle.sleepTime || ''}
                    className="w-24 h-10 bg-transparent border-none text-right font-bold"
                    onChange={(e) => updateLifestyle(activeProfileId, { ...lifestyle, sleepTime: e.target.value })}
                  />
               </div>

               <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-4">
                  <h4 className="text-[11px] font-bold text-primary uppercase tracking-wider">Meal Times</h4>
                  <div className="space-y-3">
                    {[
                      { id: 'breakfast', icon: Coffee, label: 'Breakfast' },
                      { id: 'lunch', icon: Sun, label: 'Lunch' },
                      { id: 'dinner', icon: Utensils, label: 'Dinner' }
                    ].map((meal) => (
                      <div key={meal.id} className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <meal.icon size={14} className="text-slate-400" />
                           <span className="text-xs font-medium text-slate-600">{meal.label}</span>
                         </div>
                         <Input 
                           type="time" 
                           value={(lifestyle.mealTimes as any)[meal.id] || ''}
                           className="w-24 h-8 bg-white/50 border-none text-right text-xs font-bold"
                           onChange={(e) => updateMealTime(meal.id as any, e.target.value)}
                         />
                      </div>
                    ))}
                  </div>
               </div>

               <div className="p-4 bg-muted/30 rounded-2xl border border-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Activity className="text-emerald-500" size={18} />
                    <span className="text-sm font-bold">Activity Level</span>
                  </div>
                  <div className="flex gap-1 bg-white/50 p-1 rounded-lg">
                    {['low', 'moderate', 'high'].map((level) => (
                      <button
                        key={level}
                        onClick={() => updateLifestyle(activeProfileId, { ...lifestyle, activityLevel: level as any })}
                        className={cn(
                          "px-2 py-1 rounded-md text-[10px] font-bold capitalize transition-all",
                          lifestyle.activityLevel === level 
                            ? "bg-primary text-white" 
                            : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
               </div>
            </div>
          </div>

          {/* Security */}
          <div className="space-y-5 pt-5 border-t border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Security & Privacy</h3>
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-3">
                  <Fingerprint className="text-indigo-500" size={18}/>
                  <span className="text-sm font-bold text-foreground">Biometric Auth</span>
                </div>
                <p className="text-[11px] text-slate-400 pl-8 leading-tight">Use Face ID or Fingerprint for faster login</p>
              </div>
              <Switch 
                checked={safeSettings.security.biometricEnabled}
                onCheckedChange={(checked) => {
                    updateSettings({ security: { ...safeSettings.security, biometricEnabled: checked } });
                    if (checked) toast.success('Biometric authentication enabled');
                }}
              />
            </div>
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-3">
                  <Lock className="text-indigo-500" size={18}/>
                  <span className="text-sm font-bold text-foreground">Auto-Lock</span>
                </div>
                <p className="text-[11px] text-slate-400 pl-8 leading-tight">Automatically lock the app when closed</p>
              </div>
              <Switch 
                checked={safeSettings.security.autoLock}
                onCheckedChange={(checked) => {
                    updateSettings({ security: { ...safeSettings.security, autoLock: checked } });
                    if (checked) toast.success('Auto-lock protection active');
                }}
              />
            </div>
          </div>

          {/* General */}
          <div className="space-y-5 pt-5 border-t border-border transition-colors">
            <h3 className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest">General Preferences</h3>
            <div className="flex items-start justify-between">
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-3">
                        <Moon className={cn("transition-colors", safeSettings.darkMode ? "text-amber-400" : "text-slate-400")} size={18}/>
                        <span className="text-sm font-bold text-foreground">Dark Mode</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground pl-8 leading-tight">Switch between light and dark themes for better comfort</p>
                </div>
                <Switch 
                  checked={safeSettings.darkMode}
                  onCheckedChange={(checked) => {
                      updateSettings({ darkMode: checked });
                      toast.info(checked ? 'Dark mode activated' : 'Light mode activated');
                  }}
                />
            </div>

            <div className="space-y-2">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-3">
                    <Languages className="text-primary" size={18}/>
                    <span className="text-sm font-bold text-foreground">{t('Language')}</span>
                </div>
                <p className="text-[11px] text-muted-foreground pl-8 leading-tight">Translate the interface to your primary language</p>
              </div>
              <select 
                value={safeSettings.language} 
                onChange={(e) => {
                    updateSettings({ language: e.target.value });
                    i18n.changeLanguage(e.target.value);
                    const langMap: any = { en: 'English', es: 'Spanish', fr: 'French', hi: 'Hindi' };
                    toast.success(t(`Language changed to ${langMap[e.target.value] || e.target.value}`));
                }}
                className="w-full bg-muted rounded-xl p-4 text-sm font-bold border border-border outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-all text-foreground"
              >
                <option value="en">English (US)</option>
                <option value="es">Español (ES)</option>
                <option value="fr">Français (FR)</option>
                <option value="hi">हिन्दी (India)</option>
              </select>
            </div>
            
            <div className="pt-2">
              <div className="flex items-start justify-between mb-2">
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-3">
                      <Clock className="text-primary" size={18}/>
                      <span className="text-sm font-bold text-foreground">Quiet Hours</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground pl-8 leading-tight">Silence non-essential notifications while you sleep</p>
                </div>
                <Switch 
                  checked={safeSettings.quietHours.enabled}
                  onCheckedChange={(checked) => {
                      updateSettings({ quietHours: { ...safeSettings.quietHours, enabled: checked } });
                      if (checked) toast.info('Quiet hours are now active');
                  }}
                />
              </div>
              
              {safeSettings.quietHours.enabled && (
                <div className="flex gap-4 pl-8 mt-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2 w-full">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Quiet From</span>
                    <Input 
                      type="time" 
                      value={safeSettings.quietHours.start || ''}
                      className="rounded-xl border-border bg-muted h-12 text-sm font-bold text-foreground"
                      onChange={(e) => updateSettings({ quietHours: { ...safeSettings.quietHours, start: e.target.value } })}
                    />
                  </div>
                  <div className="space-y-2 w-full">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Until</span>
                    <Input 
                      type="time" 
                      value={safeSettings.quietHours.end || ''}
                      className="rounded-xl border-border bg-muted h-12 text-sm font-bold text-foreground"
                      onChange={(e) => updateSettings({ quietHours: { ...safeSettings.quietHours, end: e.target.value } })}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

            {/* Caregiver Alerts */}
            <div className="space-y-5 pt-5 border-t border-border transition-colors">
              <h3 className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest px-1">Caregiver Protection</h3>
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-3">
                    <Shield className="text-rose-500" size={18}/>
                    <span className="text-sm font-bold text-foreground">Enable Caregiver Alerts</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground pl-8 leading-tight">Notify a family member if critical doses are missed</p>
                </div>
                <Switch 
                  checked={safeSettings.caregiverAlerts?.enabled || false}
                  onCheckedChange={(checked) => updateSettings({ 
                    caregiverAlerts: { 
                      ...(safeSettings.caregiverAlerts || { 
                        enabled: false, 
                        name: '', 
                        email: '', 
                        phone: '', 
                        alertOnMissingCritical: true 
                      }), 
                      enabled: checked 
                    } 
                  })}
                />
              </div>

              {safeSettings.caregiverAlerts?.enabled && (
                <div className="space-y-4 pl-8 pt-1 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Caregiver Name</label>
                    <Input 
                      placeholder="e.g. Mom"
                      value={safeSettings.caregiverAlerts.name}
                      onChange={(e) => updateSettings({ caregiverAlerts: { ...safeSettings.caregiverAlerts!, name: e.target.value } })}
                      className="rounded-xl border-border bg-muted h-10 text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Emergency Email</label>
                    <Input 
                      type="email"
                      placeholder="caregiver@email.com"
                      value={safeSettings.caregiverAlerts.email}
                      onChange={(e) => updateSettings({ caregiverAlerts: { ...safeSettings.caregiverAlerts!, email: e.target.value } })}
                      className="rounded-xl border-border bg-muted h-10 text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Emergency Phone</label>
                    <Input 
                      type="tel"
                      placeholder="+1 234 567 8900"
                      value={safeSettings.caregiverAlerts.phone}
                      onChange={(e) => updateSettings({ caregiverAlerts: { ...safeSettings.caregiverAlerts!, phone: e.target.value } })}
                      className="rounded-xl border-border bg-muted h-10 text-sm font-bold"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-bold text-foreground/80">Alert on Critical Doses ONLY</span>
                    <Switch 
                      checked={safeSettings.caregiverAlerts.alertOnMissingCritical}
                      onCheckedChange={(checked) => updateSettings({ caregiverAlerts: { ...safeSettings.caregiverAlerts!, alertOnMissingCritical: checked } })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Health Devices */}
          <div className="space-y-5 pt-5 border-t border-border transition-colors">
            <h3 className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest px-1">Health Devices</h3>
            
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-3">
                  <Watch className="text-blue-500" size={18}/>
                  <span className="text-sm font-bold text-foreground">Smartwatch (Bluetooth)</span>
                </div>
                <p className="text-[11px] text-muted-foreground pl-8 leading-tight">Sync vitals from BLE enabled watches</p>
              </div>
              <Switch 
                checked={safeSettings.smartwatchConnected}
                onCheckedChange={(checked) => {
                    updateSettings({ smartwatchConnected: checked });
                    toast.success(checked ? 'Smartwatch connected successfully' : 'Smartwatch disconnected');
                }}
              />
            </div>

            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-3">
                  <Smartphone className="text-rose-500" size={18}/>
                  <span className="text-sm font-bold text-foreground">Apple Health / Google Fit</span>
                </div>
                <p className="text-[11px] text-muted-foreground pl-8 leading-tight">Sync steps and activity data</p>
              </div>
              <Switch 
                checked={safeSettings.appleHealthConnected || safeSettings.googleFitConnected}
                onCheckedChange={(checked) => {
                    updateSettings({ appleHealthConnected: checked, googleFitConnected: checked });
                    toast.success(checked ? 'Health apps connected' : 'Health apps disconnected');
                }}
              />
            </div>
          </div>

          {/* Data Sync */}
          <div className="space-y-5 pt-5 border-t border-border transition-colors">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest px-1">Cloud Services</h3>
                <div className="flex items-center gap-3 mt-1">
                  <Cloud className="text-sky-500" size={18}/>
                  <span className="text-sm font-bold text-foreground">Data Synchronization</span>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-foreground/70">Last Synced</span>
                  <span className="text-[10px] text-muted-foreground">
                    {safeSettings.dataSync.lastSynced 
                      ? format(new Date(safeSettings.dataSync.lastSynced), 'do MMM, h:mm a') 
                      : 'Never synchronized'}
                  </span>
                </div>
                <Button 
                  onClick={handleSync}
                  loading={isSyncing}
                  disabled={isSyncing}
                  className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-full h-9 shadow-sm"
                >
                  Sync Now
                </Button>
              </div>

              <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground/80">Auto-Backup</span>
                  <p className="text-[10px] text-muted-foreground leading-tight">Sync automatically when you open the app</p>
                </div>
                <Switch 
                  checked={safeSettings.dataSync.autoSync}
                  onCheckedChange={(checked) => updateSettings({ dataSync: { ...safeSettings.dataSync, autoSync: checked } })}
                />
              </div>
            </div>
          </div>

          {/* About */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                <img src="/logo.png" alt="MediPulse" className="w-8 h-8 opacity-50 grayscale dark:invert" onError={(e) => e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/3062/3062634.png'} />
            </div>
            <div className="text-center">
                <p className="text-xs font-bold text-foreground">MediPulse v2.4.0</p>
                <p className="text-[10px] text-slate-400 font-medium leading-tight">Your Smart Health Records & Medication Companion</p>
            </div>
            <p className="text-[9px] text-slate-300 dark:text-slate-600 mt-2">© 2026 MediPulse Health Inc. All rights reserved.</p>
          </div>
        </CardContent>
      </Card>

      <Button 
        variant="ghost" 
        onClick={() => {
          toast.promise(async () => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            logout();
          }, {
            loading: 'Signing out...',
            success: 'Logged out successfully',
            error: 'Failed to sign out'
          });
        }}
        className="w-full h-14 rounded-2xl text-destructive hover:text-destructive/80 hover:bg-destructive/10 font-bold mb-6"
      >
        <LogOut size={18} className="mr-2" />
        Sign Out from Account
      </Button>
      </div>
    </div>
  );
};
