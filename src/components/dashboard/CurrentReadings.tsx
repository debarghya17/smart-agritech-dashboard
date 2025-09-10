import React from 'react';
import { Droplets, Thermometer, Wind, Zap, Sun, CloudRain, Leaf, Beaker, Target, Download, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SensorData, DashboardMode } from '../AgriTechDashboard';
import { DeviceConnectionDialog } from './DeviceConnectionDialog';
import { useToast } from '@/hooks/use-toast';

interface CurrentReadingsProps {
  data: SensorData;
  mode: DashboardMode;
}

const sensorConfig = [
  { key: 'soil_moisture', label: 'Soil Moisture', unit: '%', icon: Droplets, color: 'text-blue-400' },
  { key: 'temperature', label: 'Temperature', unit: '°C', icon: Thermometer, color: 'text-red-400' },
  { key: 'humidity', label: 'Humidity', unit: '%', icon: Wind, color: 'text-cyan-400' },
  { key: 'ph_level', label: 'pH Level', unit: 'pH', icon: Beaker, color: 'text-purple-400' },
  { key: 'light_intensity', label: 'Light Intensity', unit: 'lux', icon: Sun, color: 'text-yellow-400' },
  { key: 'rainfall', label: 'Rainfall', unit: 'mm', icon: CloudRain, color: 'text-blue-500' },
  { key: 'nitrogen', label: 'Nitrogen (N)', unit: 'mg/kg', icon: Leaf, color: 'text-green-400' },
  { key: 'phosphorous', label: 'Phosphorous (P)', unit: 'mg/kg', icon: Target, color: 'text-orange-400' },
  { key: 'potassium', label: 'Potassium (K)', unit: 'mg/kg', icon: Zap, color: 'text-indigo-400' },
];

const getStatus = (key: string, value: number | undefined) => {
  if (value === undefined) return 'NA';
  
  const thresholds: Record<string, { good: [number, number], warning: [number, number][] }> = {
    soil_moisture: { good: [20, 40], warning: [[10, 20], [40, 55]] },
    temperature: { good: [18, 32], warning: [[10, 18], [32, 40]] },
    humidity: { good: [40, 70], warning: [[25, 40], [70, 85]] },
    ph_level: { good: [6.0, 7.5], warning: [[5.5, 6.0], [7.5, 8.0]] },
    light_intensity: { good: [10000, 60000], warning: [[5000, 10000], [60000, 90000]] },
    rainfall: { good: [1, 10], warning: [[0, 1], [10, 25]] },
    nitrogen: { good: [40, 70], warning: [[20, 40], [70, 85]] },
    phosphorous: { good: [40, 70], warning: [[20, 40], [70, 85]] },
    potassium: { good: [40, 70], warning: [[20, 40], [70, 85]] },
  };

  const config = thresholds[key];
  if (!config) return 'good';

  const [goodMin, goodMax] = config.good;
  if (value >= goodMin && value <= goodMax) return 'good';

  const isWarning = config.warning.some(([min, max]) => value >= min && value <= max);
  return isWarning ? 'warning' : 'critical';
};

const formatValue = (value: number | undefined, unit: string) => {
  if (value === undefined) return 'NA';
  if (unit === 'lux') return value.toLocaleString();
  return value.toFixed(1);
};

const downloadCSV = (data: SensorData) => {
  const headers = ['timestamp', ...sensorConfig.map(s => s.key)];
  const row = [
    data.timestamp,
    ...sensorConfig.map(s => data[s.key as keyof SensorData] ?? 'NA')
  ];
  
  const csv = [headers.join(','), row.join(',')].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `readings-${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export const CurrentReadings: React.FC<CurrentReadingsProps> = ({ data, mode }) => {
  const { toast } = useToast();

  const handleDeviceConnect = (deviceId: string) => {
    toast({
      title: "Device Connected",
      description: `Connected to device ${deviceId}. Real-time data will now be available.`,
    });
    // In real implementation, this would establish connection and start data streaming
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Droplets className="w-5 h-5 mr-2 text-blue-400" />
          Current Sensor Readings
        </CardTitle>
        <p className="text-sm text-gray-400">
          Last update: {new Date(data.timestamp).toLocaleString()}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {sensorConfig.map(({ key, label, unit, icon: Icon, color }) => {
            const value = data[key as keyof SensorData] as number | undefined;
            const status = getStatus(key, value);
            const statusClass = status === 'good' ? 'status-good' : 
                              status === 'warning' ? 'status-warning' : 
                              status === 'critical' ? 'status-critical' : 'bg-gray-500/20 text-gray-400';
            
            return (
              <div key={key} className="bg-black/20 rounded-lg p-3 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <Badge className={`text-xs px-2 py-1 ${statusClass}`}>
                    {status === 'NA' ? 'NA' : status.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-sm text-gray-300 mb-1">{label}</div>
                <div className="text-lg font-bold text-white">
                  {formatValue(value, unit)} {value !== undefined && unit}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 pt-4 border-t border-white/10">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => downloadCSV(data)}
            className="text-white border-white/20 hover:bg-white/10"
          >
            <Download className="w-4 h-4 mr-2" />
            Download CSV
          </Button>
          
          {mode === 'realtime' && (
            <DeviceConnectionDialog onDeviceConnect={handleDeviceConnect}>
              <Button 
                variant="outline" 
                size="sm"
                className="text-white border-white/20 hover:bg-white/10"
              >
                <Search className="w-4 h-4 mr-2" />
                Find Devices
              </Button>
            </DeviceConnectionDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
};