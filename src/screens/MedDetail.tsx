import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Pill, Clock, Info, History, Check, X, Edit2, Save, Plus, Trash2, Calendar } from 'lucide-react';
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
      frequency: editedFrequency,
      intervalDays: editedFrequency === 'Every X Days' ? parseInt(editedIntervalDays) : undefined,
      instructions: editedInstructions,
      reminderTone: editedReminderTone,
      expiryDate: editedExpiryDate ? new Date(editedExpiryDate).toISOString() : undefined
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
    <div className="h-full flex flex-col bg-white">
      <div className="h-1.5 w-full" style={{ backgroundColor: medicine.color }} />
      
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8">
          {/* Header Info */}
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold text-slate-400 border-slate-200">
                {medicine.type}
              </Badge>
              <h2 className="text-3xl font-display font-bold text-slate-900">{medicine.name}</h2>
              {!isEditing ? (
                <p className="text-slate-500 font-medium">{medicine.dosage}</p>
              ) : (
                <div className="pt-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dosage</label>
                  <Input 
                    value={editedDosage}
                    onChange={(e) => setEditedDosage(e.target.value)}
                    className="mt-1 rounded-xl border-slate-200"
                    placeholder="e.g. 1000 IU"
                  />
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-400">
                <Pill size={32} />
              </div>
              {!isEditing && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsEditing(true)}
                  className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-bold"
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
                <Card className="border-none bg-red-50 border-l-4 border-red-500">
                  <CardContent className="p-4 flex items-center gap-3">
                    <X className="text-red-500" size={20} />
                    <p className="text-sm font-bold text-red-700">This medication has expired!</p>
                  </CardContent>
                </Card>
              )}
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-none bg-slate-50 card-shadow">
                  <CardContent className="p-4 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Frequency</p>
                    <p className="font-semibold text-slate-700">
                      {medicine.frequency}
                      {medicine.frequency === 'Every X Days' && ` (Every ${medicine.intervalDays} days)`}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-none bg-slate-50 card-shadow">
                  <CardContent className="p-4 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Stock Left</p>
                    <p className={cn("font-semibold", medicine.stock < 5 ? "text-amber-600" : "text-slate-700")}>
                      {medicine.stock} / {medicine.totalStock}
                    </p>
                  </CardContent>
                </Card>
              </div>
              {medicine.expiryDate && (
                <Card className="border-none bg-slate-50 card-shadow">
                  <CardContent className="p-4 space-y-1 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Expiration Date</p>
                      <p className={cn(
                        "font-semibold", 
                        new Date(medicine.expiryDate) < new Date() ? "text-red-600" : "text-slate-700"
                      )}>
                        {format(new Date(medicine.expiryDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Calendar size={20} className="text-slate-300" />
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {isEditing && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expiration Date</label>
                <Input 
                  type="date"
                  value={editedExpiryDate}
                  onChange={(e) => setEditedExpiryDate(e.target.value)}
                  className="rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Frequency</label>
                <select 
                  value={editedFrequency}
                  onChange={(e) => setEditedFrequency(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold text-slate-600 outline-none focus:ring-1 focus:ring-primary transition-all appearance-none"
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Repeat every (Days)</label>
                  <Input 
                    type="number"
                    value={editedIntervalDays}
                    onChange={(e) => setEditedIntervalDays(e.target.value)}
                    className="rounded-xl border-slate-200"
                    min="1"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Frequency</label>
                <select 
                  value={editedFrequency}
                  onChange={(e) => setEditedFrequency(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold text-slate-600 outline-none focus:ring-1 focus:ring-primary transition-all appearance-none"
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Repeat every (Days)</label>
                  <Input 
                    type="number"
                    value={editedIntervalDays}
                    onChange={(e) => setEditedIntervalDays(e.target.value)}
                    className="rounded-xl border-slate-200"
                    min="1"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Frequency</label>
                <select 
                  value={editedFrequency}
                  onChange={(e) => setEditedFrequency(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold text-slate-600 outline-none focus:ring-1 focus:ring-primary transition-all appearance-none"
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Repeat every (Days)</label>
                  <Input 
                    type="number"
                    value={editedIntervalDays}
                    onChange={(e) => setEditedIntervalDays(e.target.value)}
                    className="rounded-xl border-slate-200"
                    min="1"
                  />
                </div>
              )}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reminder Tone</label>
                <select 
                  value={editedReminderTone}
                  onChange={(e) => setEditedReminderTone(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold text-slate-600 outline-none focus:ring-1 focus:ring-primary transition-all appearance-none"
                >
                  <option value="gentle">Gentle</option>
                  <option value="standard">Standard</option>
                  <option value="loud">Loud</option>
                </select>
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
                  <Badge key={time} className="bg-indigo-50 text-indigo-600 border-indigo-100 px-3 py-1.5 rounded-xl text-sm font-bold">
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
                      value={time}
                      onChange={(e) => updateTime(index, e.target.value)}
                      className="rounded-xl border-slate-200"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeTime(index)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
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
            <h3 className="font-display font-semibold text-xl flex items-center gap-2 text-slate-900">
              <Info size={20} className="text-primary" />
              Intake Guidelines
            </h3>
            {!isEditing ? (
              <Card className="border-none bg-indigo-50/50 p-6 rounded-[24px] space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-slate-700 bg-white/50 px-4 py-2 rounded-xl">
                  <span className="font-bold text-slate-500 uppercase text-[10px]">Meal Instructions:</span>
                  <span className="capitalize font-medium text-slate-900">{medicine.mealInstruction || "Not specified"}</span>
                </div>
                <div className="pt-2 border-t border-indigo-100/50">
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    {medicine.instructions || "No specific instructions provided."}
                  </p>
                </div>
              </Card>
            ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="font-bold text-slate-500 uppercase text-[10px]">Meal Instructions:</span>
                    <span className="capitalize">{medicine.mealInstruction || "Not specified"}</span>
                  </div>
                  <Textarea 
                    value={editedInstructions}
                    onChange={(e) => setEditedInstructions(e.target.value)}
                    placeholder="e.g. Take with food, avoid alcohol..."
                    className="rounded-2xl border-slate-200 min-h-[120px]"
                  />
                </div>
            )}
          </section>

          {/* History */}
          {!isEditing && (
            <section className="space-y-4">
              <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                <History size={18} className="text-primary" />
                Recent History
              </h3>
              <div className="space-y-3">
                {history.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">No history recorded yet.</p>
                ) : (
                  history.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          record.status === 'taken' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        )}>
                          {record.status === 'taken' ? <Check size={16} /> : <X size={16} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">
                            {format(new Date(record.date), 'MMM d')}
                          </p>
                          <p className="text-[10px] text-slate-400 uppercase font-bold">{record.time}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={cn(
                        "text-[10px] font-bold uppercase",
                        record.status === 'taken' ? "text-green-600 border-green-200" : "text-red-600 border-red-200"
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

      <div className="p-6 safe-bottom flex gap-3">
        {!isEditing ? (
          <Button onClick={onClose} variant="secondary" className="w-full h-14 rounded-2xl font-bold text-slate-600">
            Close
          </Button>
        ) : (
          <>
            <Button 
              onClick={() => setIsEditing(false)} 
              variant="ghost" 
              className="flex-1 h-14 rounded-2xl font-bold text-slate-500"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              className="flex-[2] h-14 rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
            >
              <Save size={18} className="mr-2" /> Save Changes
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
