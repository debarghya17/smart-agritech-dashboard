import React, { useRef, useEffect } from 'react';
import { Heart, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SensorData } from '../AgriTechDashboard';

interface FarmHealthIndexProps {
  data: SensorData;
}

const weights = {
  soil_moisture: 0.20,
  temperature: 0.15,
  humidity: 0.10,
  ph_level: 0.15,
  light_intensity: 0.10,
  rainfall: 0.10,
  nitrogen: 0.10,
  phosphorous: 0.05,
  potassium: 0.05,
};

const normalizeValue = (key: string, value: number | undefined): number => {
  if (value === undefined) return 0;

  // Define optimal ranges and normalize to 0-100
  const ranges: Record<string, { min: number, max: number, optimal: [number, number] }> = {
    soil_moisture: { min: 0, max: 60, optimal: [20, 40] },
    temperature: { min: 0, max: 50, optimal: [18, 32] },
    humidity: { min: 0, max: 100, optimal: [40, 70] },
    ph_level: { min: 4, max: 9, optimal: [6.0, 7.5] },
    light_intensity: { min: 0, max: 120000, optimal: [10000, 60000] },
    rainfall: { min: 0, max: 50, optimal: [1, 10] },
    nitrogen: { min: 0, max: 100, optimal: [40, 70] },
    phosphorous: { min: 0, max: 100, optimal: [40, 70] },
    potassium: { min: 0, max: 100, optimal: [40, 70] },
  };

  const range = ranges[key];
  if (!range) return 50;

  const [optMin, optMax] = range.optimal;
  
  if (value >= optMin && value <= optMax) {
    return 100; // Perfect score in optimal range
  } else if (value < optMin) {
    // Below optimal - score decreases as we move away from optimal
    const distance = (optMin - value) / (optMin - range.min);
    return Math.max(0, 100 - (distance * 80));
  } else {
    // Above optimal - score decreases as we move away from optimal
    const distance = (value - optMax) / (range.max - optMax);
    return Math.max(0, 100 - (distance * 80));
  }
};

const calculateHealthIndex = (data: SensorData): number => {
  let totalScore = 0;
  let totalWeight = 0;

  Object.entries(weights).forEach(([key, weight]) => {
    const value = data[key as keyof SensorData] as number | undefined;
    if (value !== undefined) {
      const normalizedScore = normalizeValue(key, value);
      totalScore += normalizedScore * weight;
      totalWeight += weight;
    }
  });

  return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
};

const getHealthStatus = (score: number): { text: string, color: string, icon: typeof Heart } => {
  if (score >= 80) return { text: 'Excellent', color: 'status-good', icon: Heart };
  if (score >= 60) return { text: 'Good', color: 'status-good', icon: Heart };
  if (score >= 40) return { text: 'Fair', color: 'status-warning', icon: AlertCircle };
  return { text: 'Poor', color: 'status-critical', icon: AlertCircle };
};

export const FarmHealthIndex: React.FC<FarmHealthIndexProps> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const healthScore = calculateHealthIndex(data);
  const healthStatus = getHealthStatus(healthScore);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 120;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = 45;
    const lineWidth = 8;

    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // Progress arc
    const startAngle = -Math.PI / 2; // Start from top
    const endAngle = startAngle + (2 * Math.PI * healthScore / 100);

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    
    // Gradient based on score
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    if (healthScore >= 80) {
      gradient.addColorStop(0, '#10b981');
      gradient.addColorStop(1, '#34d399');
    } else if (healthScore >= 60) {
      gradient.addColorStop(0, '#10b981');
      gradient.addColorStop(1, '#fbbf24');
    } else if (healthScore >= 40) {
      gradient.addColorStop(0, '#fbbf24');
      gradient.addColorStop(1, '#f59e0b');
    } else {
      gradient.addColorStop(0, '#ef4444');
      gradient.addColorStop(1, '#dc2626');
    }
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Score text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(healthScore.toString(), centerX, centerY - 5);
    
    ctx.font = '12px system-ui';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('Health Index', centerX, centerY + 15);
  }, [healthScore]);

  const StatusIcon = healthStatus.icon;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Heart className="w-5 h-5 mr-2 text-red-400" />
          Farm Health Index
        </CardTitle>
        <p className="text-sm text-gray-400">Composite index from sensors</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          {/* Circular Progress */}
          <canvas ref={canvasRef} className="mx-auto" />
          
          {/* Status */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <StatusIcon className="w-5 h-5" />
              <Badge className={`${healthStatus.color} text-sm px-3 py-1`}>
                {healthStatus.text}
              </Badge>
            </div>
            <p className="text-xs text-gray-400">
              Based on {Object.keys(data).filter(k => k !== 'timestamp' && data[k as keyof SensorData] !== undefined).length} sensor readings
            </p>
          </div>

          {/* Breakdown */}
          <div className="w-full space-y-2">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Contributing Factors</h4>
            {Object.entries(weights).map(([key, weight]) => {
              const value = data[key as keyof SensorData] as number | undefined;
              const score = value !== undefined ? normalizeValue(key, value) : 0;
              const isActive = value !== undefined;
              
              return (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className={`capitalize ${isActive ? 'text-gray-300' : 'text-gray-500'}`}>
                    {key.replace('_', ' ')} ({Math.round(weight * 100)}%)
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-black/40 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          score >= 80 ? 'bg-green-400' :
                          score >= 60 ? 'bg-yellow-400' :
                          score >= 40 ? 'bg-orange-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${isActive ? score : 0}%` }}
                      />
                    </div>
                    <span className={`text-xs ${isActive ? 'text-white' : 'text-gray-500'}`}>
                      {isActive ? Math.round(score) : 'NA'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};