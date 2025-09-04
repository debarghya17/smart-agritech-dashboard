import React, { useState, useEffect } from 'react';
import { Header } from './dashboard/Header';
import { CurrentReadings } from './dashboard/CurrentReadings';
import { SensorTrends } from './dashboard/SensorTrends';
import { WeatherCard } from './dashboard/WeatherCard';
import { CropChatbot } from './dashboard/CropChatbot';
import { PlantMonitoring } from './dashboard/PlantMonitoring';
import { FarmHealthIndex } from './dashboard/FarmHealthIndex';

export type SensorData = {
  timestamp: string;
  soil_moisture?: number;
  temperature?: number;
  humidity?: number;
  ph_level?: number;
  light_intensity?: number;
  rainfall?: number;
  nitrogen?: number;
  phosphorous?: number;
  potassium?: number;
};

export type DashboardMode = 'realtime' | 'simulated';

const AgriTechDashboard = () => {
  const [mode, setMode] = useState<DashboardMode>('simulated');
  const [currentData, setCurrentData] = useState<SensorData>({
    timestamp: new Date().toISOString(),
  });
  const [historicalData, setHistoricalData] = useState<SensorData[]>([]);

  // Generate simulated data
  const generateSimulatedData = (): SensorData => ({
    timestamp: new Date().toISOString(),
    soil_moisture: Math.random() * 55 + 5,
    temperature: Math.random() * 35 + 10,
    humidity: Math.random() * 75 + 20,
    ph_level: Math.random() * 4 + 4.5,
    light_intensity: Math.random() * 119500 + 500,
    rainfall: Math.random() * 50,
    nitrogen: Math.random() * 100,
    phosphorous: Math.random() * 100,
    potassium: Math.random() * 100,
  });

  const handleModeChange = (newMode: DashboardMode) => {
    setMode(newMode);
    if (newMode === 'realtime') {
      // Reset to minimal data for realtime mode
      setCurrentData({ timestamp: new Date().toISOString() });
      setHistoricalData([]);
    }
  };

  const handleRefreshData = () => {
    // Clear all existing data
    setHistoricalData([]);
    // Generate fresh data
    if (mode === 'simulated') {
      setCurrentData(generateSimulatedData());
    } else {
      // Reset realtime data
      setCurrentData({ timestamp: new Date().toISOString() });
    }
  };

  // Simulate sensor data
  useEffect(() => {
    if (mode === 'simulated') {
      const interval = setInterval(() => {
        const newData = generateSimulatedData();
        setCurrentData(newData);
        setHistoricalData(prev => [...prev.slice(-23), newData]);
      }, 2000);

      // Initialize with some historical data
      if (historicalData.length === 0) {
        const initial = Array.from({ length: 24 }, (_, i) => ({
          ...generateSimulatedData(),
          timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
        }));
        setHistoricalData(initial);
      }

      return () => clearInterval(interval);
    } else {
      // Realtime mode - reset to empty data
      setCurrentData({ timestamp: new Date().toISOString() });
    }
  }, [mode, historicalData.length]);

  useEffect(() => {
    // Ensure page starts at top
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="min-h-screen farm-bg">
      <Header 
        mode={mode} 
        onModeChange={handleModeChange}
        onRefreshData={handleRefreshData}
      />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1 */}
          <div className="space-y-6">
            <CurrentReadings data={currentData} mode={mode} />
            <WeatherCard />
          </div>
          
          {/* Column 2 */}
          <div className="space-y-6">
            <SensorTrends data={historicalData} />
            <CropChatbot currentData={currentData} />
          </div>
          
          {/* Column 3 */}
          <div className="space-y-6">
            <PlantMonitoring mode={mode} />
            <FarmHealthIndex data={currentData} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AgriTechDashboard;