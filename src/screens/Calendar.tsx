import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Check, X, Pill } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const CalendarView: React.FC = () => {
  const { reminders, medicines } = useStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const selectedReminders = reminders.filter(r => r.date === format(selectedDate, 'yyyy-MM-dd'));

  return (
    <div className="p-6 pb-32 space-y-6 h-full flex flex-col">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Tracking</h1>
          <p className="text-slate-500 text-sm">Adherence history</p>
        </div>
      </header>

      {/* Month Selector */}
      <div className="flex justify-between items-center bg-white p-2 rounded-2xl card-shadow">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <span className="font-bold text-slate-700">{format(currentMonth, 'MMMM yyyy')}</span>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-center text-[10px] font-bold text-slate-400 uppercase">{day}</div>
        ))}
        {days.map((day, idx) => {
          const isSelected = isSameDay(day, selectedDate);
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayReminders = reminders.filter(r => r.date === dateStr);
          const allTaken = dayReminders.length > 0 && dayReminders.every(r => r.status === 'taken');
          const someMissed = dayReminders.some(r => r.status === 'missed');

          return (
            <button
              key={idx}
              onClick={() => setSelectedDate(day)}
              className={cn(
                "h-12 rounded-xl flex flex-col items-center justify-center relative transition-all",
                isSelected ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-white text-slate-600 hover:bg-slate-50"
              )}
            >
              <span className="text-sm font-bold">{format(day, 'd')}</span>
              <div className="flex gap-0.5 mt-1">
                {allTaken && <div className={cn("w-1 h-1 rounded-full", isSelected ? "bg-white" : "bg-green-500")} />}
                {someMissed && <div className={cn("w-1 h-1 rounded-full", isSelected ? "bg-white" : "bg-red-500")} />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Details */}
      <div className="flex-1 space-y-4">
        <h3 className="font-display font-semibold text-lg">
          {isSameDay(selectedDate, new Date()) ? 'Today' : format(selectedDate, 'MMMM do')}
        </h3>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDate.toISOString()}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {selectedReminders.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">No records for this day.</p>
            ) : (
              selectedReminders.map(reminder => {
                const med = medicines.find(m => m.id === reminder.medicineId);
                if (!med) return null;
                return (
                  <Card key={reminder.id} className="border-none card-shadow">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                          <Pill size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{med.name}</h4>
                          <p className="text-xs text-slate-500">{reminder.time} • {med.dosage}</p>
                        </div>
                      </div>
                      <Badge className={cn(
                        "rounded-lg",
                        reminder.status === 'taken' ? "bg-green-100 text-green-700" : 
                        reminder.status === 'missed' ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"
                      )}>
                        {reminder.status.toUpperCase()}
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
