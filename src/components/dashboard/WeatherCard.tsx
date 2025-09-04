import React, { useState, useEffect } from 'react';
import { Cloud, MapPin, Thermometer, Droplets, Wind, Sun, CloudRain, CloudSnow } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WeatherData {
  location: string;
  current: {
    temp: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    icon: string;
  };
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
  }>;
}

const getWeatherIcon = (condition: string) => {
  switch (condition.toLowerCase()) {
    case 'sunny':
    case 'clear':
      return Sun;
    case 'cloudy':
    case 'overcast':
      return Cloud;
    case 'rainy':
    case 'rain':
      return CloudRain;
    case 'snowy':
    case 'snow':
      return CloudSnow;
    default:
      return Cloud;
  }
};

const mockWeatherData: WeatherData = {
  location: 'Location denied',
  current: {
    temp: 27,
    condition: 'Cloudy',
    humidity: 65,
    windSpeed: 12,
    icon: 'cloudy'
  },
  forecast: [
    { day: 'Yesterday', high: 25, low: 18, condition: 'Sunny', icon: 'sunny' },
    { day: 'Today', high: 27, low: 20, condition: 'Cloudy', icon: 'cloudy' },
    { day: 'Tomorrow', high: 29, low: 22, condition: 'Partly Cloudy', icon: 'cloudy' },
    { day: 'Next day', high: 24, low: 17, condition: 'Rainy', icon: 'rainy' }
  ]
};

export const WeatherCard: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData>(mockWeatherData);
  const [location, setLocation] = useState<string>('');

  useEffect(() => {
    // Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you'd use the coordinates to fetch weather
          setWeather(prev => ({ ...prev, location: 'Detected location' }));
        },
        (error) => {
          console.log('Location access denied');
        }
      );
    }
  }, []);

  const CurrentIcon = getWeatherIcon(weather.current.condition);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Cloud className="w-5 h-5 mr-2 text-blue-400" />
          Weather
        </CardTitle>
        <div className="flex items-center text-sm text-gray-400">
          <MapPin className="w-4 h-4 mr-1" />
          {weather.location}
        </div>
      </CardHeader>
      <CardContent>
        {/* Current Weather */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-3xl font-bold text-white">
                {weather.current.temp}°C
              </div>
              <div className="text-gray-300">{weather.current.condition}</div>
            </div>
            <CurrentIcon className="w-12 h-12 text-blue-400" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center text-gray-300">
              <Droplets className="w-4 h-4 mr-2" />
              {weather.current.humidity}% Humidity
            </div>
            <div className="flex items-center text-gray-300">
              <Wind className="w-4 h-4 mr-2" />
              {weather.current.windSpeed} km/h
            </div>
          </div>
        </div>

        {/* Forecast */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300 mb-3">4-Day Forecast</h4>
          {weather.forecast.map((day, index) => {
            const DayIcon = getWeatherIcon(day.condition);
            return (
              <div key={index} className="flex items-center justify-between py-2 border-b border-white/10 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <DayIcon className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300 text-sm">{day.day}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-medium">{day.high}°</span>
                  <span className="text-gray-500">{day.low}°</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};