import React, { useState, useRef, useEffect } from 'react';
import { TrendingUp, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { SensorData } from '../AgriTechDashboard';

interface SensorTrendsProps {
  data: SensorData[];
}

const sensorColors = {
  soil_moisture: '#3b82f6',
  temperature: '#ef4444',
  humidity: '#06b6d4',
  ph_level: '#8b5cf6',
  light_intensity: '#eab308',
  rainfall: '#3b82f6',
  nitrogen: '#10b981',
  phosphorous: '#f97316',
  potassium: '#6366f1',
};

const sensorLabels = {
  soil_moisture: 'Soil Moisture',
  temperature: 'Temperature',
  humidity: 'Humidity',
  ph_level: 'pH Level',
  light_intensity: 'Light (lux)',
  rainfall: 'Rainfall',
  nitrogen: 'Nitrogen (N)',
  phosphorous: 'Phosphorous (P)',
  potassium: 'Potassium (K)',
};

export const SensorTrends: React.FC<SensorTrendsProps> = ({ data }) => {
  // Check if we have meaningful data (not just empty timestamp objects)
  const hasValidData = data && data.length > 0 && data.some(item => 
    item.soil_moisture !== undefined || 
    item.temperature !== undefined || 
    item.humidity !== undefined
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visibleSeries, setVisibleSeries] = useState<Record<string, boolean>>({
    soil_moisture: true,
    temperature: true,
    humidity: true,
    ph_level: false,
    light_intensity: false,
    rainfall: false,
    nitrogen: false,
    phosphorous: false,
    potassium: false,
  });


  const toggleSeries = (key: string) => {
    setVisibleSeries(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasValidData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= 10; i++) {
      const y = padding + (chartHeight / 10) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    for (let i = 0; i <= 12; i++) {
      const x = padding + (chartWidth / 12) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }

    // Draw time series
    Object.entries(visibleSeries).forEach(([key, visible]) => {
      if (!visible) return;

      const values = data.map(d => d[key as keyof SensorData] as number).filter(v => v !== undefined);
      if (values.length === 0) return;

      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min || 1;

      ctx.strokeStyle = sensorColors[key as keyof typeof sensorColors];
      ctx.lineWidth = 2;
      ctx.beginPath();

      values.forEach((value, index) => {
        const x = padding + (chartWidth / (values.length - 1)) * index;
        const y = height - padding - ((value - min) / range) * chartHeight;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
    });

    // Draw axes labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Last 24 Hours', width / 2, height - 5);
    
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Sensor Values', 0, 0);
    ctx.restore();
  }, [data, visibleSeries, hasValidData]);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
          Sensor Trends Over Time
        </CardTitle>
        <p className="text-sm text-gray-400">Last 24 hours</p>
      </CardHeader>
      <CardContent>
        {hasValidData ? (
          <>
            <div className="mb-4">
              <canvas
                ref={canvasRef}
                className="w-full h-64 rounded-lg bg-black/20"
                style={{ width: '100%', height: '256px' }}
              />
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              {Object.entries(sensorLabels).map(([key, label]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={visibleSeries[key]}
                    onCheckedChange={() => toggleSeries(key)}
                    className="border-white/20"
                  />
                  <div className="flex items-center space-x-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: sensorColors[key as keyof typeof sensorColors] }}
                    />
                    <label
                      htmlFor={key}
                      className="text-sm text-gray-300 cursor-pointer"
                    >
                      {label}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-400">No sensor data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};