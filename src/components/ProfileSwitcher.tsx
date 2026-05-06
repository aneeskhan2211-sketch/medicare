import React from 'react';
import { useStore } from '../store/useStore';
import { ChevronDown, Plus, User, Users } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from '@/lib/utils';

export const ProfileSwitcher: React.FC = () => {
  const { profiles, activeProfileId, setActiveProfile } = useStore();
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-2xl border border-slate-200/50 hover:bg-white transition-all outline-none cursor-pointer">
        <Avatar className="w-6 h-6 border border-white shadow-sm">
          <AvatarImage src={activeProfile.avatar} />
          <AvatarFallback className="text-[10px] font-bold" style={{ backgroundColor: activeProfile.color, color: '#fff' }}>
            {activeProfile.name[0]}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-bold text-slate-700">{activeProfile.name}</span>
        <ChevronDown size={14} className="text-slate-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 rounded-2xl p-2 shadow-xl border-slate-100">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1.5">
            Switch Profile
          </DropdownMenuLabel>
          {profiles.map((profile) => (
            <DropdownMenuItem
              key={profile.id}
              onClick={() => setActiveProfile(profile.id)}
              className={cn(
                "flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors",
                activeProfileId === profile.id ? "bg-indigo-50 text-indigo-600" : "hover:bg-slate-50"
              )}
            >
              <Avatar className="w-8 h-8 border border-white shadow-sm">
                <AvatarImage src={profile.avatar} />
                <AvatarFallback className="text-xs font-bold" style={{ backgroundColor: profile.color, color: '#fff' }}>
                  {profile.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-bold">{profile.name}</span>
                <span className="text-[10px] opacity-70">{profile.age} years • {profile.gender}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="my-1 bg-slate-100" />
        <DropdownMenuItem className="flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-indigo-50 text-indigo-600 transition-colors">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <Plus size={16} />
          </div>
          <span className="text-sm font-bold">Add Family Member</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
