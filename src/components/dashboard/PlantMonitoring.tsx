import React, { useState, useRef } from 'react';
import { Camera, CameraOff, Activity, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardMode } from '../AgriTechDashboard';

interface PlantMonitoringProps {
  mode: DashboardMode;
}

interface PlantAnalysis {
  diseaseStatus: 'unknown' | 'healthy' | 'suspected';
  growthPrediction: string;
  recommendations: string[];
  confidence: number;
}

const mockAnalysis: PlantAnalysis = {
  diseaseStatus: 'healthy',
  growthPrediction: 'Optimal growth conditions detected. Expected yield increase of 15% based on current health metrics.',
  recommendations: [
    'Maintain current irrigation schedule',
    'Monitor for early signs of nutrient deficiency',
    'Consider additional nitrogen supplementation in 2 weeks',
    'Implement pest monitoring protocol'
  ],
  confidence: 87
};

export const PlantMonitoring: React.FC<PlantMonitoringProps> = ({ mode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [analysis, setAnalysis] = useState<PlantAnalysis | null>(mode === 'simulated' ? mockAnalysis : null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const connectCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsConnected(true);
        
        if (mode === 'simulated') {
          // Simulate analysis after connection
          setIsAnalyzing(true);
          setTimeout(() => {
            setAnalysis(mockAnalysis);
            setIsAnalyzing(false);
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      alert('Camera access denied. Please enable camera permissions to use plant monitoring.');
    }
  };

  const disconnectCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsConnected(false);
    if (mode === 'realtime') {
      setAnalysis(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'suspected':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default:
        return <X className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'status-good';
      case 'suspected':
        return 'status-warning';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <Activity className="w-5 h-5 mr-2 text-orange-400" />
            Real-Time Plant Monitoring
          </div>
          <div className="flex space-x-2">
            {!isConnected ? (
              <Button
                onClick={connectCamera}
                size="sm"
                variant="outline"
                className="text-white border-white/20 hover:bg-white/10"
              >
                <Camera className="w-4 h-4 mr-2" />
                Connect Camera
              </Button>
            ) : (
              <Button
                onClick={disconnectCamera}
                size="sm"
                variant="outline"
                className="text-white border-white/20 hover:bg-white/10"
              >
                <CameraOff className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            )}
          </div>
        </CardTitle>
        <p className="text-sm text-gray-400">Camera connect / disease detection (stub)</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Camera Feed */}
          <div className="relative">
            <div className="w-full h-48 bg-black/40 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden">
              {isConnected ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-gray-400">
                  <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Camera not connected</p>
                </div>
              )}
            </div>
            
            {isConnected && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                  Live
                </Badge>
              </div>
            )}
          </div>

          {/* Analysis Results */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-300">Analysis Results</h4>
            
            {isAnalyzing ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-2"></div>
                <p className="text-sm text-gray-400">Analyzing plant health...</p>
              </div>
            ) : analysis ? (
              <div className="space-y-3">
                {/* Disease Status */}
                <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/10">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(analysis.diseaseStatus)}
                    <span className="text-sm text-gray-300">Disease Status:</span>
                  </div>
                  <Badge className={getStatusColor(analysis.diseaseStatus)}>
                    {analysis.diseaseStatus.charAt(0).toUpperCase() + analysis.diseaseStatus.slice(1)}
                  </Badge>
                </div>

                {/* Growth Prediction */}
                <div className="p-3 bg-black/20 rounded-lg border border-white/10">
                  <h5 className="text-sm font-medium text-gray-300 mb-2">Growth Prediction:</h5>
                  <p className="text-sm text-white">{analysis.growthPrediction}</p>
                </div>

                {/* Recommendations */}
                <div className="p-3 bg-black/20 rounded-lg border border-white/10">
                  <h5 className="text-sm font-medium text-gray-300 mb-2">Recommendations:</h5>
                  <ul className="space-y-1">
                    {analysis.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-white flex items-start">
                        <span className="text-green-400 mr-2">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Confidence */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Confidence:</span>
                  <span className="text-white font-medium">{analysis.confidence}%</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {mode === 'realtime' 
                    ? 'Connect camera and IoT sensors for real-time analysis'
                    : 'No analysis data available'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};