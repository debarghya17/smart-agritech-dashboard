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

// Get weather data from OpenWeatherMap free service using location
const getWeatherFromCoords = async (lat: number, lon: number): Promise<WeatherData> => {
  try {
    // Using free weather API that doesn't require key for basic data
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=4`);
    const data = await response.json();
    
    // Get location name using reverse geocoding
    let locationName = 'Current Location';
    try {
      const geoResponse = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
      const geoData = await geoResponse.json();
      locationName = geoData.city || geoData.locality || geoData.principalSubdivision || 'Current Location';
    } catch (e) {
      console.log('Could not get location name');
    }
    
    const weatherCodeToCondition = (code: number) => {
      if (code <= 3) return 'Clear';
      if (code <= 48) return 'Cloudy';
      if (code <= 67) return 'Rainy';
      if (code <= 77) return 'Snowy';
      return 'Cloudy';
    };
    
    const days = ['Yesterday', 'Today', 'Tomorrow', 'Day 4'];
    
    return {
      location: locationName,
      current: {
        temp: Math.round(data.current.temperature_2m),
        condition: weatherCodeToCondition(data.current.weather_code),
        humidity: data.current.relative_humidity_2m,
        windSpeed: Math.round(data.current.wind_speed_10m),
        icon: weatherCodeToCondition(data.current.weather_code).toLowerCase()
      },
      forecast: data.daily.weather_code.slice(0, 4).map((code: number, index: number) => ({
        day: days[index],
        high: Math.round(data.daily.temperature_2m_max[index]),
        low: Math.round(data.daily.temperature_2m_min[index]),
        condition: weatherCodeToCondition(code),
        icon: weatherCodeToCondition(code).toLowerCase()
      }))
    };
  } catch (error) {
    console.error('Weather fetch error:', error);
    return {
      location: 'Weather unavailable',
      current: { temp: 0, condition: 'Unknown', humidity: 0, windSpeed: 0, icon: 'cloudy' },
      forecast: []
    };
  }
};

const defaultWeatherData: WeatherData = {
  location: 'Enable location for weather',
  current: {
    temp: 25,
    condition: 'Unknown',
    humidity: 50,
    windSpeed: 10,
    icon: 'cloudy'
  },
  forecast: [
    { day: 'Yesterday', high: 25, low: 18, condition: 'Unknown', icon: 'cloudy' },
    { day: 'Today', high: 27, low: 20, condition: 'Unknown', icon: 'cloudy' },
    { day: 'Tomorrow', high: 29, low: 22, condition: 'Unknown', icon: 'cloudy' },
    { day: 'Day 4', high: 24, low: 17, condition: 'Unknown', icon: 'cloudy' }
  ]
};

export const WeatherCard: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData>(defaultWeatherData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWeatherData = async () => {
      setIsLoading(true);
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const weatherData = await getWeatherFromCoords(latitude, longitude);
            setWeather(weatherData);
            setIsLoading(false);
          },
          (error) => {
            console.log('Location access denied or failed:', error.message);
            setWeather(prev => ({ ...prev, location: 'Location access denied' }));
            setIsLoading(false);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
        );
      } else {
        setWeather(prev => ({ ...prev, location: 'Geolocation not supported' }));
        setIsLoading(false);
      }
    };

    fetchWeatherData();
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