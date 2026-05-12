import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Button } from '@/components/ui/button';
import { X, Calendar as CalendarIcon, Clock, Stethoscope, Video, ChevronRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';

interface AppointmentBookingProps {
  initialDoctor?: string;
  onClose: () => void;
}

export const AppointmentBooking: React.FC<AppointmentBookingProps> = ({ initialDoctor, onClose }) => {
  const { addAppointment, activeProfileId } = useStore();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [doctor, setDoctor] = useState(initialDoctor || 'Dr. Arjun Mehta');
  const [specialty, setSpecialty] = useState('General Physician');

  const timeSlots = [
    '09:00 AM', '10:30 AM', '11:45 AM', '02:00 PM', '04:30 PM', '06:00 PM'
  ];

  const handleBook = () => {
    if (!selectedTime) {
      toast.error('Please select a time slot');
      return;
    }

    addAppointment({
      id: Math.random().toString(36).substr(2, 9),
      profileId: activeProfileId,
      doctorName: doctor,
      specialty: specialty,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: selectedTime,
      status: 'upcoming'
    });

    setStep(3);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <header className="px-6 py-5 bg-white border-b border-slate-100 flex justify-between items-center z-10 shadow-sm">
        <h2 className="font-display font-bold text-slate-900">Book Consultation</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-2xl">
          <X size={24} />
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex gap-4 items-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                  <Stethoscope size={32} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{doctor}</h3>
                  <p className="text-sm text-muted-foreground">{specialty}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold uppercase tracking-widest text-[8px]">98% Adherence</Badge>
                <Badge className="bg-blue-100 text-blue-700 border-none font-bold uppercase tracking-widest text-[8px]">Available Today</Badge>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Select Date</p>
              <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
                {[0, 1, 2, 3, 4, 5, 6].map(offset => {
                  const date = addDays(new Date(), offset);
                  const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                  return (
                    <button
                      key={offset}
                      onClick={() => setSelectedDate(date)}
                      className={cn(
                        "flex flex-col items-center justify-center min-w-[70px] h-20 rounded-2xl border transition-all",
                        isSelected 
                          ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200" 
                          : "bg-white border-slate-100 text-slate-900 hover:border-blue-200"
                      )}
                    >
                      <span className={cn("text-[10px] font-bold uppercase tracking-widest mb-1", isSelected ? "text-blue-100" : "text-slate-400")}>
                        {format(date, 'EEE')}
                      </span>
                      <span className="text-lg font-black">{format(date, 'd')}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Select Time Slot</p>
              <div className="grid grid-cols-3 gap-3">
                {timeSlots.map(time => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={cn(
                      "py-3 rounded-xl border text-xs font-bold transition-all",
                      selectedTime === time
                        ? "bg-blue-50 border-blue-600 text-blue-600 shadow-sm"
                        : "bg-white border-slate-100 text-slate-600 hover:border-blue-200"
                    )}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex gap-3">
              <Video className="text-indigo-600 shrink-0" size={20} />
              <div>
                <p className="text-xs font-bold text-indigo-900">Virtual Consultation Enabled</p>
                <p className="text-[10px] text-indigo-700">A secure video link will be sent to your app and email 15 mins before the appointment.</p>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
              <CheckCircle2 size={48} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Booking Confirmed!</h3>
              <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
                Consultation with <strong>{doctor}</strong> is scheduled for <strong>{format(selectedDate, 'MMMM d')}</strong> at <strong>{selectedTime}</strong>.
              </p>
            </div>
            <div className="bg-white p-4 rounded-3xl border border-slate-100 w-full space-y-3 shadow-sm">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-bold uppercase tracking-widest">Appointment ID</span>
                <span className="font-black">#MP-{Math.floor(Math.random()*100000)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-bold uppercase tracking-widest">Type</span>
                <span className="font-black">Video Consultation</span>
              </div>
            </div>
            <Button className="w-full h-14 rounded-2xl font-bold bg-slate-900 text-white" onClick={onClose}>
              Back to Home
            </Button>
          </div>
        )}
      </div>

      {step === 1 && (
        <div className="p-6 bg-white border-t border-slate-100 safe-bottom">
          <Button 
            className="w-full h-14 rounded-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-200 text-lg flex items-center justify-center gap-2 group"
            onClick={handleBook}
            disabled={!selectedTime}
          >
            Confirm Booking
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      )}
    </div>
  );
};

const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={cn("px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold", className)}>
    {children}
  </span>
);
