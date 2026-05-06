import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Check, X, Pill, Stethoscope, Calendar as CalendarIcon, Sun, Moon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { MedicalBackground } from '../components/MedicalBackground';

export const CalendarView: React.FC = () => {
  const { reminders, medicines, appointments, settings, updateSettings } = useStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const selectedReminders = reminders.filter(r => r.date === dateKey);
  const selectedAppointments = appointments.filter(a => a.date === dateKey);

  const hasEvents = selectedReminders.length > 0 || selectedAppointments.length > 0;

  return (
    <div className="pb-32 min-h-screen transition-colors duration-300 relative">
      <MedicalBackground />

      <div className="p-6 space-y-6 relative z-10 flex-1 flex flex-col">
        <header className="flex justify-between items-center px-1">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground transition-colors">Health Timeline</h1>
            <p className="text-muted-foreground text-sm font-medium transition-colors">Your adherence history</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              const newMode = !settings.darkMode;
              updateSettings({ darkMode: newMode });
            }}
            className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors border border-border"
          >
            {settings.darkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
          </motion.button>
        </header>

        {/* Month Selector */}
        <div className="flex justify-between items-center bg-card p-2 rounded-2xl border border-border shadow-sm">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft size={20} />
          </button>
          <span className="font-bold text-foreground">{format(currentMonth, 'MMMM yyyy')}</span>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 text-muted-foreground hover:text-primary transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-center text-[10px] font-bold text-muted-foreground uppercase">{day}</div>
          ))}
          {days.map((day, idx) => {
            const isSelected = isSameDay(day, selectedDate);
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayReminders = reminders.filter(r => r.date === dateStr);
            const dayAppointments = appointments.filter(a => a.date === dateStr);
            const allTaken = dayReminders.length > 0 && dayReminders.every(r => r.status === 'taken');
            const someMissed = dayReminders.some(r => r.status === 'missed');
            const hasApt = dayAppointments.length > 0;

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "h-12 rounded-xl flex flex-col items-center justify-center relative transition-all active:scale-90 border",
                  isSelected ? "bg-primary text-white border-primary shadow-lg shadow-primary/30" : "bg-card text-foreground border-transparent hover:border-border"
                )}
              >
                <span className="text-sm font-bold">{format(day, 'd')}</span>
                <div className="flex gap-0.5 mt-1">
                  {allTaken && <div className={cn("w-1 h-1 rounded-full", isSelected ? "bg-white" : "bg-emerald-500")} />}
                  {someMissed && <div className={cn("w-1 h-1 rounded-full", isSelected ? "bg-white" : "bg-rose-500")} />}
                  {hasApt && <div className={cn("w-1 h-1 rounded-full", isSelected ? "bg-white" : "bg-indigo-500")} />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Day Details */}
        <div className="flex-1 space-y-4">
          <h3 className="font-display font-bold text-lg px-1 text-foreground">
            {isSameDay(selectedDate, new Date()) ? 'Today' : format(selectedDate, 'MMMM do')}
          </h3>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDate.toISOString()}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {!hasEvents ? (
                <div className="flex flex-col items-center justify-center py-12 text-center rounded-[32px] bg-muted/20 border-2 border-dashed border-border px-4 transition-colors">
                  <div className="w-16 h-16 rounded-3xl bg-card flex items-center justify-center text-muted-foreground/30 mb-4 border border-border shadow-sm">
                    <CalendarIcon size={32} />
                  </div>
                  <p className="text-muted-foreground text-xs font-medium">No records or appointments<br />for this day.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedAppointments.map(apt => (
                    <Card key={apt.id} className="border-none premium-card bg-indigo-500/5 dark:bg-indigo-500/10 rounded-2xl">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <Stethoscope size={24} />
                          </div>
                          <div>
                            <h4 className="font-bold text-foreground text-sm">{apt.doctorName}</h4>
                            <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">{apt.time} • {apt.specialty}</p>
                          </div>
                        </div>
                        <Badge className="bg-indigo-500 text-white border-none rounded-lg text-[10px] font-black uppercase">
                          APPT
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}

                  {selectedReminders.map(reminder => {
                    const med = medicines.find(m => m.id === reminder.medicineId);
                    if (!med) return null;
                    return (
                      <Card key={reminder.id} className="border-none premium-card bg-card rounded-2xl">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground">
                              <Pill size={24} />
                            </div>
                            <div>
                              <h4 className="font-bold text-foreground text-sm">{med.name}</h4>
                              <p className="text-[10px] text-muted-foreground font-bold uppercase">{reminder.time} • {med.dosage}</p>
                            </div>
                          </div>
                          <Badge className={cn(
                            "rounded-lg border-none text-[10px] font-black uppercase px-2 py-1",
                            reminder.status === 'taken' ? "bg-emerald-500/10 text-emerald-600" : 
                            reminder.status === 'missed' ? "bg-rose-500/10 text-rose-600" : "bg-primary/10 text-primary"
                          )}>
                            {reminder.status}
                          </Badge>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
