import React from 'react';
import { useStore } from '../store/useStore';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Bell, Moon, Languages, Clock, Shield, Fingerprint, Lock } from 'lucide-react';

export const Settings = () => {
  const { settings, updateSettings } = useStore();

  const safeSettings = {
    notifications: settings?.notifications || { enabled: true, emailEnabled: true, pushEnabled: true, reminderSound: 'default' },
    security: settings?.security || { biometricEnabled: false, autoLock: false, twoFactorEnabled: false },
    darkMode: settings?.darkMode ?? false,
    language: settings?.language || 'en',
    quietHours: settings?.quietHours || { enabled: false, start: '22:00', end: '07:00' }
  };
    
  return (
    <div className="space-y-6 p-4 text-slate-900">
      <h2 className="text-2xl font-bold">Settings</h2>
      
      <Card className="rounded-[20px] shadow-sm">
        <CardContent className="p-4 space-y-6">
          {/* Notifications */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-slate-500 uppercase">Notifications</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="text-primary" size={18}/>
                <span className="text-sm font-medium">Enable All</span>
              </div>
              <Switch 
                checked={safeSettings.notifications.enabled}
                onCheckedChange={(checked) => updateSettings({ notifications: { ...safeSettings.notifications, enabled: checked } })}
              />
            </div>
            
            {safeSettings.notifications.enabled && (
              <>
                <div className="flex items-center justify-between pl-8">
                  <span className="text-sm font-medium">Email Notifications</span>
                  <Switch 
                    checked={safeSettings.notifications.emailEnabled}
                    onCheckedChange={(checked) => updateSettings({ notifications: { ...safeSettings.notifications, emailEnabled: checked } })}
                  />
                </div>
                <div className="flex items-center justify-between pl-8">
                  <span className="text-sm font-medium">Push Notifications</span>
                  <Switch 
                    checked={safeSettings.notifications.pushEnabled}
                    onCheckedChange={(checked) => updateSettings({ notifications: { ...safeSettings.notifications, pushEnabled: checked } })}
                  />
                </div>
              </>
            )}

            <div className="space-y-2 pt-2">
              <span className="text-sm font-medium">Reminder Sound</span>
              <select 
                value={safeSettings.notifications.reminderSound} 
                onChange={(e) => updateSettings({ notifications: { ...safeSettings.notifications, reminderSound: e.target.value } })}
                className="w-full bg-slate-50 rounded-lg p-2 text-sm font-medium border border-slate-200 outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="default">Default</option>
                <option value="chime">Chime</option>
                <option value="alarm">Alarm</option>
              </select>
            </div>
          </div>
          
          {/* Security */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-sm text-slate-500 uppercase">Security</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Fingerprint className="text-primary" size={18}/>
                <span className="text-sm font-medium">Biometric Auth</span>
              </div>
              <Switch 
                checked={safeSettings.security.biometricEnabled}
                onCheckedChange={(checked) => updateSettings({ security: { ...safeSettings.security, biometricEnabled: checked } })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="text-primary" size={18}/>
                <span className="text-sm font-medium">Auto-Lock</span>
              </div>
              <Switch 
                checked={safeSettings.security.autoLock}
                onCheckedChange={(checked) => updateSettings({ security: { ...safeSettings.security, autoLock: checked } })}
              />
            </div>
          </div>

          {/* General */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-sm text-slate-500 uppercase">General</h3>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon className="text-primary" size={18}/>
                  <span className="text-sm font-medium">Dark Mode</span>
                </div>
                <Switch 
                  checked={safeSettings.darkMode}
                  onCheckedChange={(checked) => updateSettings({ darkMode: checked })}
                />
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium flex items-center gap-2"><Languages size={18}/> Language</span>
              <select 
                value={safeSettings.language} 
                onChange={(e) => updateSettings({ language: e.target.value })}
                className="w-full bg-slate-50 rounded-lg p-2 text-sm font-medium border border-slate-200 outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
            </div>
            
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Clock className="text-primary" size={18}/>
                  <span className="text-sm font-medium">Quiet Hours</span>
                </div>
                <Switch 
                  checked={safeSettings.quietHours.enabled}
                  onCheckedChange={(checked) => updateSettings({ quietHours: { ...safeSettings.quietHours, enabled: checked } })}
                />
              </div>
              
              {safeSettings.quietHours.enabled && (
                <div className="flex gap-4">
                  <div className="space-y-1 w-full">
                    <span className="text-xs font-medium text-slate-500">Start Time</span>
                    <Input 
                      type="time" 
                      value={safeSettings.quietHours.start}
                      onChange={(e) => updateSettings({ quietHours: { ...safeSettings.quietHours, start: e.target.value } })}
                    />
                  </div>
                  <div className="space-y-1 w-full">
                    <span className="text-xs font-medium text-slate-500">End Time</span>
                    <Input 
                      type="time" 
                      value={safeSettings.quietHours.end}
                      onChange={(e) => updateSettings({ quietHours: { ...safeSettings.quietHours, end: e.target.value } })}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
