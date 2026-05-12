import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Cloud, Sun, CloudRain, MapPin, Loader2 } from 'lucide-react';
import { fetchWeather, WeatherData } from '../services/weatherService';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export const WeatherWidget: React.FC = () => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const data = await fetchWeather(position.coords.latitude, position.coords.longitude);
                    setWeather(data);
                    setLoading(false);
                },
                () => {
                    setLoading(false);
                }
            );
        } else {
            setLoading(false);
        }
    }, []);

    if (loading) return <Card className="p-4 flex items-center justify-center h-24"><Loader2 className="animate-spin text-primary" /></Card>;
    if (!weather) return null;

    const Icon = weather.condition.includes('Rain') || weather.condition.includes('Drizzle') ? CloudRain : 
                 weather.condition.includes('Clear') || weather.condition.includes('Sun') ? Sun : Cloud;
    
    // Background animation variants
    const getBackgroundStyles = () => {
        const cond = weather.condition.toLowerCase();
        if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('thunderstorm')) {
            return {
                bg: "bg-gradient-to-br from-blue-400/20 to-indigo-500/20",
                accent: "text-blue-500",
                animation: "animate-pulse"
            };
        } else if (cond.includes('clear') || cond.includes('sun')) {
            return {
                bg: "bg-gradient-to-br from-amber-400/20 to-orange-500/20",
                accent: "text-amber-500",
                animation: "animate-spin-slow"
            };
        } else {
            return {
                bg: "bg-gradient-to-br from-slate-300/20 to-slate-500/20",
                accent: "text-slate-500",
                animation: "animate-pulse"
            };
        }
    };

    const styles = getBackgroundStyles();

    return (
        <Card className={cn(
            "relative p-5 flex items-center justify-between border-none rounded-[32px] overflow-hidden group transition-all duration-500",
            styles.bg,
            "backdrop-blur-xl border border-white/20 shadow-lg"
        )}>
            {/* Dynamic Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {weather.condition.toLowerCase().includes('rain') && (
                    <div className="absolute inset-0 opacity-30">
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-[1px] h-4 bg-blue-400"
                                initial={{ y: -20, x: i * 80 }}
                                animate={{ y: 200 }}
                                transition={{ 
                                    duration: 0.8, 
                                    repeat: Infinity, 
                                    delay: i * 0.1,
                                    ease: "linear"
                                }}
                            />
                        ))}
                    </div>
                )}
                { (weather.condition.toLowerCase().includes('clear') || weather.condition.toLowerCase().includes('sun')) && (
                    <motion.div 
                        className="absolute -top-10 -right-10 w-40 h-40 bg-amber-400/30 rounded-full blur-3xl"
                        animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                    />
                )}
                { weather.condition.toLowerCase().includes('cloud') && (
                    <div className="absolute inset-0 opacity-20">
                        <motion.div 
                            className="absolute top-2 left-10 w-24 h-12 bg-white rounded-full blur-xl"
                            animate={{ x: [0, 100, 0] }}
                            transition={{ duration: 15, repeat: Infinity }}
                        />
                        <motion.div 
                            className="absolute bottom-2 right-10 w-32 h-16 bg-white rounded-full blur-xl"
                            animate={{ x: [0, -80, 0] }}
                            transition={{ duration: 20, repeat: Infinity }}
                        />
                    </div>
                )}
            </div>
            
            <div className="flex items-center gap-4 relative z-10">
                <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={cn("p-4 rounded-3xl backdrop-blur-md border border-white/20 shadow-inner", styles.accent, "bg-white/30")}
                >
                    <Icon size={28} strokeWidth={2.5} />
                </motion.div>
                <div>
                    <motion.p 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl font-black font-display tracking-tight text-foreground"
                    >
                        {weather.temp}°
                    </motion.p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">{weather.condition}</p>
                </div>
            </div>

            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-end gap-1 relative z-10"
            >
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/10 shadow-sm">
                    <MapPin size={10} className="text-primary" />
                    <span className="text-[10px] font-black text-foreground/80 uppercase tracking-tight">{weather.location}</span>
                </div>
                <p className="text-[9px] font-bold text-muted-foreground mr-1">Updated just now</p>
            </motion.div>
        </Card>
    );
};
