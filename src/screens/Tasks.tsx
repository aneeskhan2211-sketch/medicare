import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { CheckCircle2, Circle, Clock, Plus, Trash2, X, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Task } from '../types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export const Tasks: React.FC = () => {
  const { tasks, addTask, updateTaskStatus, deleteTask, activeProfileId } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState('09:00');

  const profileTasks = tasks.filter(t => t.profileId === activeProfileId);

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
      userId: 'user-1'
    };

    addTask(newTask);
    setTitle('');
    setShowAdd(false);
    toast.success('Task added successfully');
  };

  return (
    <div className="pb-32 h-full flex flex-col">
      <header className="p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">General Tasks</h1>
          <p className="text-slate-500 text-sm font-medium">Manage your health activities</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAdd(true)}
          className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30"
        >
          <Plus size={24} />
        </motion.button>
      </header>

      <ScrollArea className="flex-1 px-6">
        <div className="space-y-4 pb-8">
          {profileTasks.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="text-slate-200" size={40} />
              </div>
              <p className="text-slate-400 font-medium">No tasks yet. Tap + to add one.</p>
            </div>
          ) : (
            profileTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                layout
              >
                <Card className={cn(
                  "border-none card-shadow transition-all",
                  task.status === 'completed' ? "bg-slate-50/50 opacity-60" : "bg-white"
                )}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <button 
                      onClick={() => updateTaskStatus(task.id, task.status === 'pending' ? 'completed' : 'pending')}
                      className={cn(
                        "transition-colors",
                        task.status === 'completed' ? "text-green-500" : "text-slate-300 hover:text-primary"
                      )}
                    >
                      {task.status === 'completed' ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                    </button>
                    <div className="flex-1">
                      <h4 className={cn(
                        "font-bold text-slate-900",
                        task.status === 'completed' && "line-through text-slate-400"
                      )}>
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                          <CalendarIcon size={12} />
                          {task.dueDate}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                          <Clock size={12} />
                          {task.dueTime}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="text-slate-200 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
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
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowAdd(false)}>
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-t-[32px] p-6 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900">New Task</h3>
                <button onClick={() => setShowAdd(false)} className="text-slate-400">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Task Title</label>
                  <Input 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Blood pressure check"
                    className="rounded-xl border-slate-100 h-12"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Due Date</label>
                    <Input 
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="rounded-xl border-slate-100 h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Due Time</label>
                    <Input 
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="rounded-xl border-slate-100 h-12"
                    />
                  </div>
                </div>

                <Button onClick={handleAddTask} className="w-full h-14 rounded-2xl font-bold text-lg mt-4">
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
