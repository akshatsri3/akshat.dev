"use client";

import * as React from "react";
import { Cloud, CloudRain, Sun, Moon, CloudSnow, CloudLightning } from "lucide-react";

export function WeatherTimeWidget() {
  const [time, setTime] = React.useState<string>("");
  const [weather, setWeather] = React.useState<{ temp: number; code: number } | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    
    // Initial time update
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();

    // Set interval to update time every second
    const timer = setInterval(updateTime, 1000);

    // Fetch weather silently using IP geolocation
    const fetchWeather = async () => {
      try {
        // 1. Get location from IP silently
        const geoRes = await fetch("https://get.geojs.io/v1/ip/geo.json");
        const geoData = await geoRes.json();
        const { latitude, longitude } = geoData;

        // 2. Fetch weather from Open-Meteo
        if (latitude && longitude) {
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
          );
          const weatherData = await weatherRes.json();
          if (weatherData.current_weather) {
            setWeather({
              temp: Math.round(weatherData.current_weather.temperature),
              code: weatherData.current_weather.weathercode,
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch weather data:", error);
      }
    };

    fetchWeather();

    return () => clearInterval(timer);
  }, []);

  if (!mounted) return null;

  const getWeatherIcon = (code: number) => {
    // Open-Meteo WMO Weather interpretation codes
    if (code === 0) {
      const hour = new Date().getHours();
      const isNight = hour < 6 || hour > 18;
      return isNight ? <Moon className="size-3.5 text-neutral-300" /> : <Sun className="size-3.5 text-yellow-400" />;
    }
    if (code >= 1 && code <= 3) return <Cloud className="size-3.5 text-neutral-400" />;
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return <CloudRain className="size-3.5 text-blue-400" />;
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return <CloudSnow className="size-3.5 text-blue-200" />;
    if (code >= 95 && code <= 99) return <CloudLightning className="size-3.5 text-yellow-500" />;
    
    return <Sun className="size-3.5 text-yellow-400" />;
  };

  return (
    <div className="flex items-center gap-2 px-3 h-10 rounded-full glass border-primary/20 hover:border-primary/50 text-neutral-400 text-sm shadow-lg shadow-primary/10 transition-all duration-300 cursor-default">
      {weather && (
        <>
          <div className="flex items-center gap-1.5 max-sm:hidden">
            {getWeatherIcon(weather.code)}
            <span className="font-medium tracking-tight">{weather.temp}°C</span>
          </div>
          <span className="text-neutral-500 max-sm:hidden">•</span>
        </>
      )}
      <span className="font-medium tracking-tight min-w-[60px] text-center">{time}</span>
    </div>
  );
}
