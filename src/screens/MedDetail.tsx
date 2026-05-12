import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Pill, Clock, Info, History, Check, X, Edit2, Save, Plus, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Medicine } from '../types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MedDetailProps {
  medicine: Medicine;
  onClose: () => void;
}

export const MedDetail: React.FC<MedDetailProps> = ({ medicine, onClose }) => {
  const { reminders, updateMedicine } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedDosage, setEditedDosage] = useState(medicine.dosage);
  const [editedTimes, setEditedTimes] = useState([...medicine.times]);
  const [editedInstructions, setEditedInstructions] = useState(medicine.instructions || '');
  const [editedFrequency, setEditedFrequency] = useState(medicine.frequency);
  const [editedIntervalDays, setEditedIntervalDays] = useState(medicine.intervalDays?.toString() || '2');
  const [editedReminderTone, setEditedReminderTone] = useState(medicine.reminderTone || 'standard');
  const [editedExpiryDate, setEditedExpiryDate] = useState(medicine.expiryDate ? format(new Date(medicine.expiryDate), 'yyyy-MM-dd') : '');
  const [editedPrescriptionNumber, setEditedPrescriptionNumber] = useState(medicine.prescriptionNumber || '');
  const [editedDoctorName, setEditedDoctorName] = useState(medicine.doctorName || '');
  
  const medReminders = reminders
    .filter(r => r.medicineId === medicine.id)
    .sort((a, b) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime());

  const history = medReminders.filter(r => r.status !== 'pending').slice(0, 10);

  const handleSave = () => {
    if (editedTimes.length === 0) {
      toast.error('At least one reminder time is required');
      return;
    }
    
    updateMedicine(medicine.id, {
      dosage: editedDosage,
      times: editedTimes,
      frequency: editedFrequency as any,
      intervalDays: editedFrequency === 'Every X Days' ? parseInt(editedIntervalDays) : undefined,
      instructions: editedInstructions,
      reminderTone: editedReminderTone,
      expiryDate: editedExpiryDate ? new Date(editedExpiryDate).toISOString() : undefined,
      prescriptionNumber: editedPrescriptionNumber,
      doctorName: editedDoctorName
    });
    
    setIsEditing(false);
    toast.success('Medicine updated successfully');
  };

  const addTime = () => {
    setEditedTimes([...editedTimes, '08:00']);
  };

  const removeTime = (index: number) => {
    setEditedTimes(editedTimes.filter((_, i) => i !== index));
  };

  const updateTime = (index: number, value: string) => {
    const newTimes = [...editedTimes];
    newTimes[index] = value;
    setEditedTimes(newTimes);
  };

  return (
    <div className="h-full flex flex-col bg-background transition-colors duration-300">
      <div className="h-1.5 w-full" style={{ backgroundColor: medicine.color }} />
      
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8">
          {/* Header Info */}
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground border-border">
                {medicine.type}
              </Badge>
              <h2 className="text-3xl font-display font-bold text-foreground transition-colors">{medicine.name}</h2>
              {!isEditing ? (
                <p className="text-muted-foreground font-medium transition-colors">{medicine.dosage}</p>
              ) : (
                <div className="pt-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Dosage</label>
                  <Input 
                    value={editedDosage || ''}
                    onChange={(e) => setEditedDosage(e.target.value)}
                    className="mt-1 rounded-xl border-border bg-muted text-foreground"
                    placeholder="e.g. 1000 IU"
                  />
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center text-muted-foreground shadow-inner">
                <Pill size={32} />
              </div>
              {!isEditing && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsEditing(true)}
                  className="text-primary hover:text-primary/80 hover:bg-primary/10 font-bold transition-all"
                >
                  <Edit2 size={14} className="mr-1" /> Edit
                </Button>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          {!isEditing && (
            <div className="space-y-4">
              {medicine.expiryDate && new Date(medicine.expiryDate) < new Date() && (
                <Card className="border-none bg-destructive/10 border-l-4 border-destructive rounded-xl">
                  <CardContent className="p-4 flex items-center gap-3">
                    <AlertCircle className="text-destructive" size={20} />
                    <p className="text-sm font-bold text-destructive">This medication has expired!</p>
                  </CardContent>
                </Card>
              )}
              
              {/* AI-Predictive Refill Assistant */}
              <Card className="border-none bg-primary/10 border-l-4 border-primary rounded-xl overflow-hidden shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Predicted Refill Date</p>
                      <p className="text-lg font-display font-bold text-primary leading-none">
                        {(() => {
                          if (medicine.stock === 0) return 'Out of Stock';
                          const dailyDoseCount = medicine.times.length;
                          if (dailyDoseCount === 0) return 'N/A';
                          const daysLeft = Math.floor(medicine.stock / dailyDoseCount);
                          const refillDate = new Date();
                          refillDate.setDate(refillDate.getDate() + daysLeft);
                          return format(refillDate, 'MMM dd, yyyy');
                        })()}
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="rounded-xl h-10 px-4 bg-primary text-white shadow-lg shadow-primary/20"
                    onClick={() => {
                      toast.success("Notification Sent", {
                        description: `A refill reminder for ${medicine.name} has been sent to your pharmacy and emergency contact.`
                      });
                    }}
                  >
                    Notify
                  </Button>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card className="border-none bg-muted/50 rounded-2xl shadow-sm">
                  <CardContent className="p-4 space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Frequency</p>
                    <p className="font-semibold text-foreground">
                      {medicine.frequency}
                      {medicine.frequency === 'Every X Days' && ` (Every ${medicine.intervalDays} days)`}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-none bg-muted/50 rounded-2xl shadow-sm">
                  <CardContent className="p-4 space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Stock Left</p>
                    <p className={cn("font-semibold", medicine.stock < 5 ? "text-amber-500" : "text-foreground")}>
                      {medicine.stock} / {medicine.totalStock}
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {medicine.prescriptionNumber && (
                  <Card className="border-none bg-muted/50 rounded-2xl shadow-sm">
                    <CardContent className="p-4 space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Prescription #</p>
                      <p className="font-semibold text-foreground">{medicine.prescriptionNumber}</p>
                    </CardContent>
                  </Card>
                )}
                {medicine.doctorName && (
                  <Card className="border-none bg-muted/50 rounded-2xl shadow-sm">
                    <CardContent className="p-4 space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Doctor</p>
                      <p className="font-semibold text-foreground">{medicine.doctorName}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {medicine.expiryDate && (
                <Card className="border-none bg-muted/50 rounded-2xl shadow-sm">
                  <CardContent className="p-4 space-y-1 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Expiration Date</p>
                      <p className={cn(
                        "font-semibold", 
                        new Date(medicine.expiryDate) < new Date() ? "text-destructive" : "text-foreground"
                      )}>
                        {format(new Date(medicine.expiryDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Calendar size={20} className="text-muted-foreground opacity-30" />
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {isEditing && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Expiration Date</label>
                <Input 
                  type="date"
                  value={editedExpiryDate || ''}
                  onChange={(e) => setEditedExpiryDate(e.target.value)}
                  className="rounded-xl border-border bg-muted text-foreground h-12"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Frequency</label>
                <select 
                  value={editedFrequency}
                  onChange={(e) => setEditedFrequency(e.target.value)}
                  className="w-full bg-muted border border-border rounded-xl p-4 text-sm font-bold text-foreground shadow-sm outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-all"
                >
                  <option value="Daily">Daily</option>
                  <option value="Twice Daily">Twice Daily</option>
                  <option value="Three Times Daily">Three Times Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Specific Days">Specific Days</option>
                  <option value="Every X Days">Every X Days</option>
                </select>
              </div>

              {editedFrequency === 'Every X Days' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Repeat every (Days)</label>
                  <Input 
                    type="number"
                    value={editedIntervalDays || ''}
                    onChange={(e) => setEditedIntervalDays(e.target.value)}
                    className="rounded-xl border-border bg-muted text-foreground h-12"
                    min="1"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Reminder Tone</label>
                <select 
                  value={editedReminderTone}
                  onChange={(e) => setEditedReminderTone(e.target.value)}
                  className="w-full bg-muted border border-border rounded-xl p-4 text-sm font-bold text-foreground shadow-sm outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-all"
                >
                  <option value="gentle">Gentle Tone</option>
                  <option value="standard">Standard Alert</option>
                  <option value="loud">Loud Alarm</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Prescription Number</label>
                <Input 
                  value={editedPrescriptionNumber || ''}
                  onChange={(e) => setEditedPrescriptionNumber(e.target.value)}
                  className="rounded-xl border-border bg-muted text-foreground h-12"
                  placeholder="e.g. RX-12345"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Doctor's Name</label>
                <Input 
                  value={editedDoctorName || ''}
                  onChange={(e) => setEditedDoctorName(e.target.value)}
                  className="rounded-xl border-border bg-muted text-foreground h-12"
                  placeholder="e.g. Dr. Arpan"
                />
              </div>
            </div>
          )}

          {/* Schedule */}
          <section className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                <Clock size={18} className="text-primary" />
                Schedule
              </h3>
              {isEditing && (
                <Button variant="ghost" size="sm" onClick={addTime} className="text-primary font-bold">
                  <Plus size={14} className="mr-1" /> Add Time
                </Button>
              )}
            </div>
            
            {!isEditing ? (
              <div className="flex flex-wrap gap-2">
                {medicine.times.map(time => (
                  <Badge key={time} className="bg-primary/10 text-primary border-primary/20 px-3 py-1.5 rounded-xl text-sm font-bold transition-all">
                    {time}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {editedTimes.map((time, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input 
                      type="time"
                      value={time || ''}
                      onChange={(e) => updateTime(index, e.target.value)}
                      className="rounded-xl border-border bg-muted text-foreground h-12"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeTime(index)}
                      className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Intake Guidelines */}
          <section className="space-y-4 pt-4">
            <h3 className="font-display font-semibold text-xl flex items-center gap-2 text-foreground transition-colors">
              <Info size={20} className="text-primary" />
              Intake Guidelines
            </h3>
            {!isEditing ? (
              <Card className="border-none bg-primary/5 p-6 rounded-[24px] space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-foreground/80 bg-background/50 px-4 py-2 rounded-xl">
                  <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest leading-none">Meal Instructions:</span>
                  <span className="capitalize font-bold text-foreground leading-none">{medicine.mealInstruction || "Not specified"}</span>
                </div>
                <div className="pt-2 border-t border-primary/10">
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                    {medicine.instructions || "No specific instructions provided."}
                  </p>
                </div>
              </Card>
            ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                    <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Meal Instructions:</span>
                    <span className="capitalize font-bold">{medicine.mealInstruction || "Not specified"}</span>
                  </div>
                  <Textarea 
                    value={editedInstructions || ''}
                    onChange={(e) => setEditedInstructions(e.target.value)}
                    placeholder="e.g. Take with food, avoid alcohol..."
                    className="rounded-2xl border-border bg-muted text-foreground min-h-[120px]"
                  />
                </div>
            )}
          </section>

          {/* History */}
          {!isEditing && (
            <section className="space-y-4">
              <h3 className="font-display font-semibold text-lg flex items-center gap-2 text-foreground transition-colors">
                <History size={18} className="text-primary" />
                Recent History
              </h3>
              <div className="space-y-3">
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No history recorded yet.</p>
                ) : (
                  history.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl border border-border group transition-all">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                          record.status === 'taken' ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400" : "bg-destructive/10 text-destructive"
                        )}>
                          {record.status === 'taken' ? <Check size={18} /> : <X size={18} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            {format(new Date(record.date), 'MMM d')}
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{record.time}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={cn(
                        "text-[10px] font-bold uppercase px-2 py-1 rounded-lg",
                        record.status === 'taken' ? "text-green-600 border-green-200 dark:text-green-400 dark:border-green-900/40" : "text-destructive border-destructive/20"
                      )}>
                        {record.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}
        </div>
      </ScrollArea>

      <div className="p-6 safe-bottom flex gap-3 border-t border-border bg-background/50 backdrop-blur-sm">
        {!isEditing ? (
          <Button onClick={onClose} variant="secondary" className="w-full h-14 rounded-2xl font-bold transition-all">
            Close Detail
          </Button>
        ) : (
          <>
            <Button 
              onClick={() => setIsEditing(false)} 
              variant="ghost" 
              className="flex-1 h-14 rounded-2xl font-bold text-muted-foreground transition-all"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              className="flex-[2] h-14 rounded-2xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all"
            >
              <Save size={18} className="mr-2" /> Save Changes
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
