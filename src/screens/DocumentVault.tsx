import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Search, Plus, Folder, File, Download, Trash2, ShieldCheck, ChevronRight, HardDrive } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export const DocumentVault: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { reports, profiles, activeProfileId, addReport, deleteReport } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');

  const filteredDocs = reports.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || doc.type === filterType;
    const matchesYear = filterYear === 'all' || doc.year?.toString() === filterYear;
    const matchesProfile = doc.profileId === activeProfileId;
    return matchesSearch && matchesType && matchesYear && matchesProfile;
  });

  const years = Array.from(new Set(reports.map(r => r.year))).sort((a, b) => b - a);
  const activeProfileName = profiles.find(p => p.id === activeProfileId)?.name || 'Profile';

  const handleUpload = () => {
    // Simulation of file picker
    toast.info("Integrating secure storage...", {
      description: "Secure upload is initializing. This is a HIPAA compliant vault."
    });
    
    // Auto-adding a dummy Doc for demonstration
    setTimeout(() => {
        addReport({
            id: Math.random().toString(36).substr(2, 9),
            profileId: activeProfileId,
            title: `New Prescription ${new Date().getFullYear()}`,
            date: new Date().toISOString(),
            year: new Date().getFullYear(),
            category: 'Prescription',
            summary: 'Uploaded from vault interface',
            type: 'prescription',
            patientName: activeProfileName
          });
          toast.success("Document added to your vault!");
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col bg-background p-6">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-display font-bold">Document Vault</h2>
          <p className="text-muted-foreground text-sm">Secure medical records for {activeProfileName}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
          <ChevronRight className="rotate-90" />
        </Button>
      </header>

      {/* Storage Stats */}
      <Card className="border-none bg-primary/5 rounded-[24px] mb-6 shadow-sm overflow-hidden border border-primary/10">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
              <HardDrive size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Encrypted Storage</p>
              <p className="text-sm font-bold text-foreground">12.4 MB of 500 MB used</p>
            </div>
          </div>
          <Badge className="bg-emerald-500 text-white border-none shadow-sm flex gap-1">
            <ShieldCheck size={10} /> SECURE
          </Badge>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="space-y-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input 
            placeholder="Search documents..." 
            className="pl-10 rounded-xl bg-card border-border h-11"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="h-9 min-w-[120px] rounded-lg bg-card border-border text-xs font-bold uppercase transition-all">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="prescription">Prescriptions</SelectItem>
              <SelectItem value="lab_result">Lab Results</SelectItem>
              <SelectItem value="insurance">Insurance</SelectItem>
              <SelectItem value="scan">Scans</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="h-9 min-w-[100px] rounded-lg bg-card border-border text-xs font-bold uppercase transition-all">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map(y => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ScrollArea className="flex-1 -mx-6 px-6">
        <div className="space-y-4 pb-32">
          {filteredDocs.length > 0 ? (
            filteredDocs.map((doc) => (
              <Card key={doc.id} className="border-none bg-card hover:bg-muted/30 transition-colors rounded-[24px] overflow-hidden group shadow-sm border border-border/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner",
                    doc.type === 'prescription' ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" :
                    doc.type === 'lab_result' ? "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400" :
                    doc.type === 'insurance' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" :
                    "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
                  )}>
                    {doc.type === 'prescription' ? <FileText size={24} /> : 
                     doc.type === 'insurance' ? <ShieldCheck size={24} /> : <File size={24} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-bold text-foreground truncate">{doc.title}</h4>
                      <Badge variant="outline" className="text-[8px] px-1 h-3.5 border-border uppercase font-bold text-muted-foreground">{doc.year}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium truncate uppercase tracking-widest">{doc.category || doc.type}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10">
                      <Download size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10" onClick={() => deleteReport(doc.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground/30">
                <Folder size={40} />
              </div>
              <div>
                <p className="font-bold text-foreground">No documents found</p>
                <p className="text-sm text-muted-foreground">Search or upload your first medical record</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Floating Action Button */}
      <div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-[110]">
        <Button onClick={handleUpload} className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-500/30">
          <Plus size={20} className="mr-2" /> Upload New Document
        </Button>
      </div>
    </div>
  );
};

const cn = (...args: any[]) => args.filter(Boolean).join(' ');
