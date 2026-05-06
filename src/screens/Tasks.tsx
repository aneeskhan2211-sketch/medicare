import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { CheckCircle2, Circle, Clock, Plus, Trash2, X, Calendar as CalendarIcon, Repeat, ClipboardList, Sun, Moon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Task, RecurrenceType } from '../types';
import { MedicalBackground } from '../components/MedicalBackground';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { playSuccessSound } from '../lib/audio';

export const Tasks: React.FC = () => {
  const tasks = useStore(state => state.tasks);
  const addTask = useStore(state => state.addTask);
  const updateTaskStatus = useStore(state => state.updateTaskStatus);
  const deleteTask = useStore(state => state.deleteTask);
  const activeProfileId = useStore(state => state.activeProfileId);
  const settings = useStore(state => state.settings);
  const updateSettings = useStore(state => state.updateSettings);
  
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState('09:00');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [sortBy, setSortBy] = useState<'date' | 'status'>('date');

  const profileTasks = React.useMemo(() => 
    tasks.filter(t => t.profileId === activeProfileId),
    [tasks, activeProfileId]
  );

  const sortedTasks = React.useMemo(() => {
    return [...profileTasks].sort((a, b) => {
      if (sortBy === 'status') {
        if (a.status === b.status) {
          return new Date(`${a.dueDate}T${a.dueTime}`).getTime() - new Date(`${b.dueDate}T${b.dueTime}`).getTime();
        }
        return a.status === 'pending' ? -1 : 1;
      } else {
        const dateA = new Date(`${a.dueDate}T${a.dueTime}`).getTime();
        const dateB = new Date(`${b.dueDate}T${b.dueTime}`).getTime();
        if (dateA === dateB) {
          return a.status === 'pending' ? -1 : 1;
        }
        return dateA - dateB;
      }
    });
  }, [profileTasks, sortBy]);

  const handleAddTask = () => {
    if (!title) {
      toast.error('Please enter a task title');
      return;
    }

    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      profileId: activeProfileId,
      title,
      dueDate: date,
      dueTime: time,
      status: 'pending',
      recurrence,
      userId: 'user-1'
    };

    addTask(newTask);
    setTitle('');
    setRecurrence('none');
    setShowAdd(false);
    toast.success('Task added successfully');
  };

  return (
    <div className="pb-32 min-h-screen transition-colors duration-300 relative">
      <MedicalBackground />

      <header className="p-6 flex justify-between items-center transition-colors relative z-10">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">General Tasks</h1>
          <p className="text-muted-foreground text-sm font-medium">Manage your health activities</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              const newMode = !settings.darkMode;
              updateSettings({ darkMode: newMode });
              toast.info(newMode ? 'Dark mode activated' : 'Light mode activated');
            }}
            className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors border border-border"
          >
            {settings.darkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAdd(true)}
            className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 animate-pulse-green"
          >
            <Plus size={24} />
          </motion.button>
        </div>
      </header>

      {profileTasks.length > 0 && (
        <div className="px-6 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-primary" />
              {profileTasks.length} {profileTasks.length === 1 ? 'Task' : 'Tasks'}
            </span>
          </div>
          <div className="flex bg-muted/50 p-1 rounded-xl transition-colors border border-border/50">
            <button 
              onClick={() => setSortBy('date')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1.5",
                sortBy === 'date' ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <CalendarIcon size={12} />
              Date
            </button>
            <button 
              onClick={() => setSortBy('status')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1.5",
                sortBy === 'status' ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <CheckCircle2 size={12} />
              Status
            </button>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 px-6">
        <div className="space-y-4 pb-8">
          {profileTasks.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 border border-border shadow-sm">
                <CheckCircle2 className="text-muted-foreground/30" size={40} />
              </div>
              <p className="text-muted-foreground font-medium">No tasks yet. Tap + to add one.</p>
            </div>
          ) : (
            sortedTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: task.status === 'completed' ? 0.7 : 1, 
                  y: 0,
                  scale: task.status === 'completed' ? 0.98 : 1
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                layout
              >
                <Card className={cn(
                  "border-none premium-card transition-all rounded-xl overflow-hidden",
                  task.status === 'completed' ? "bg-muted/50 opacity-60 shadow-none" : "bg-card"
                )}>
                  <CardContent className="p-3 flex items-center gap-3 transition-all">
                    <motion.button 
                      whileTap={{ scale: 0.8 }}
                      whileHover={{ scale: 1.1 }}
                      onClick={() => {
                        const isCompleting = task.status === 'pending';
                        updateTaskStatus(task.id, isCompleting ? 'completed' : 'pending');
                        if (isCompleting) {
                          playSuccessSound();
                          toast.success('Task completed! 🎉', {
                            description: task.recurrence && task.recurrence !== 'none' ? `Next ${task.recurrence} task created.` : undefined
                          });
                        }
                      }}
                      className={cn(
                        "transition-colors relative flex items-center justify-center w-7 h-7 shrink-0",
                        task.status === 'completed' ? "text-emerald-500" : "text-muted-foreground/30 hover:text-primary"
                      )}
                    >
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={task.status}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1, rotate: task.status === 'completed' ? [0, -15, 15, 0] : 0 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          transition={{ 
                            default: { type: "spring", stiffness: 500, damping: 25 },
                            rotate: { duration: 0.4, ease: "easeInOut" }
                          }}
                        >
                          {task.status === 'completed' ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                        </motion.div>
                      </AnimatePresence>
                      
                      <AnimatePresence>
                        {task.status === 'completed' && (
                          <>
                            {/* Confetti Particles */}
                            {[...Array(6)].map((_, i) => (
                              <motion.div
                                key={i}
                                initial={{ scale: 0, x: 0, y: 0 }}
                                animate={{ 
                                  scale: [0, 1, 0],
                                  x: [0, (i % 2 === 0 ? 1 : -1) * (15 + Math.random() * 20)],
                                  y: [0, (Math.floor(i/2) - 1) * (15 + Math.random() * 20)],
                                  rotate: [0, 180]
                                }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="absolute w-1 h-1 rounded-full bg-emerald-400"
                              />
                            ))}
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1.8, opacity: 0 }}
                              transition={{ duration: 0.4 }}
                              className="absolute inset-0 rounded-full bg-emerald-500/20"
                            />
                          </>
                        )}
                      </AnimatePresence>
                    </motion.button>
                    <div className="flex-1 min-w-0">
                      <div className="relative inline-block max-w-full">
                        <h4 className={cn(
                          "font-black text-foreground text-base transition-colors duration-500 truncate leading-tight uppercase tracking-tight",
                          task.status === 'completed' && "text-muted-foreground opacity-50",
                          task.title.toLowerCase().includes('blood pressure') && "text-rose-600 dark:text-rose-400"
                        )}>
                          {task.title}
                        </h4>
                        <AnimatePresence>
                          {task.status === 'completed' && (
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: "100%" }}
                              exit={{ width: 0 }}
                              className="absolute left-0 top-1/2 h-[1px] bg-muted-foreground/30 -translate-y-1/2"
                            />
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground uppercase tracking-tight">
                          <CalendarIcon size={10} />
                          {task.dueDate}
                        </div>
                        <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground uppercase tracking-tight">
                          <Clock size={10} />
                          {task.dueTime}
                        </div>
                        {task.recurrence && task.recurrence !== 'none' && (
                          <div className="flex items-center gap-1 text-[9px] font-bold text-primary uppercase tracking-tight">
                            <Repeat size={10} />
                            {task.recurrence}
                          </div>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="text-muted-foreground/20 hover:text-destructive transition-colors p-1 shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </ScrollArea>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 pb-24" onClick={() => setShowAdd(false)}>
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-card rounded-[32px] md:rounded-t-[40px] p-8 space-y-8 shadow-2xl transition-colors relative overflow-hidden"
            >
              {/* Add a decorative handle for bottom sheet feel */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-muted rounded-full" />
              
              <div className="flex justify-between items-center pt-2">
                <h3 className="text-xl font-bold text-foreground">New Task</h3>
                <button onClick={() => setShowAdd(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-foreground/70 uppercase tracking-widest px-1">TASK TITLE</label>
                  <Input 
                    value={title || ''}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Blood pressure check"
                    className="rounded-[20px] bg-muted border-none h-14 px-5 text-foreground font-bold focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-foreground/70 uppercase tracking-widest px-1">DUE DATE</label>
                    <Input 
                      type="date"
                      value={date || ''}
                      onChange={(e) => setDate(e.target.value)}
                      className="rounded-[20px] bg-muted border-none h-14 px-5 text-foreground font-bold focus:ring-2 focus:ring-primary transition-all appearance-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-foreground/70 uppercase tracking-widest px-1">DUE TIME</label>
                    <Input 
                      type="time"
                      value={time || ''}
                      onChange={(e) => setTime(e.target.value)}
                      className="rounded-[20px] bg-muted border-none h-14 px-5 text-foreground font-bold focus:ring-2 focus:ring-primary transition-all appearance-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-foreground/70 uppercase tracking-widest px-1">RECURRENCE</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['none', 'daily', 'weekly', 'monthly'] as RecurrenceType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setRecurrence(type)}
                        className={cn(
                          "py-3 px-1 rounded-2xl text-[10px] font-bold uppercase transition-all border-2",
                          recurrence === type 
                            ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                            : "bg-muted text-muted-foreground border-transparent hover:border-border"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <Button onClick={handleAddTask} className="w-full h-16 rounded-[24px] font-bold text-lg mt-6 shadow-xl shadow-primary/30 premium-shadow animate-pulse-green">
                  Create Task
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
