export interface WeatherData {
  temp: number;
  condition: string;
  location: string;
}

export const fetchWeather = async (lat: number, lon: number): Promise<WeatherData> => {
  const cacheKey = `weather_${lat.toFixed(2)}_${lon.toFixed(2)}`;
  const cached = localStorage.getItem(cacheKey);
  const cachedTime = localStorage.getItem(`${cacheKey}_time`);
  
  if (cached && cachedTime && Date.now() - parseInt(cachedTime) < 10 * 60 * 1000) {
    return JSON.parse(cached);
  }

  try {
    const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
    if (!response.ok) throw new Error('Failed to fetch weather');
    const data = await response.json();
    
    localStorage.setItem(cacheKey, JSON.stringify(data));
    localStorage.setItem(`${cacheKey}_time`, Date.now().toString());
    
    return data;
  } catch (error) {
    console.error("Weather API error:", error);
    if (cached) return JSON.parse(cached);
    return { temp: 25, condition: 'Sunny', location: 'Mumbai' };
  }
};
