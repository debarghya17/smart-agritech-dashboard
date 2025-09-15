import React, { useState } from 'react';
import { Camera, CameraOff, Activity, AlertTriangle, CheckCircle, X, Scan } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardMode } from '../AgriTechDashboard';
import { usePlantAnalysis, PlantAnalysis as IPlantAnalysis, MLModelConfig } from '@/hooks/usePlantAnalysis';
import { useCamera } from '@/hooks/useCamera';

interface PlantMonitoringProps {
  mode: DashboardMode;
  // Optional custom ML model analyzer function
  customAnalyzer?: (imageData: string | File) => Promise<IPlantAnalysis>;
  // Optional ML model configuration
  mlConfig?: MLModelConfig;
}

interface PlantAnalysis {
  diseaseStatus: 'unknown' | 'healthy' | 'suspected';
  growthPrediction: string;
  recommendations: string[];
  confidence: number;
}

const mockAnalysis: IPlantAnalysis = {
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

// Simulated plant images for demo
const simulatedPlantImages = [
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1574927601542-48d69bc0c70b?w=400&h=300&fit=crop'
];

// Basic plant disease detection using browser APIs
const analyzeImage = async (imageData: string): Promise<PlantAnalysis> => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simple color analysis for health detection
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  
  return new Promise((resolve) => {
    img.onload = () => {
      canvas.width = 100;
      canvas.height = 100;
      ctx?.drawImage(img, 0, 0, 100, 100);
      
      const imageDataArray = ctx?.getImageData(0, 0, 100, 100);
      const data = imageDataArray?.data || new Uint8ClampedArray();
      
      let greenSum = 0;
      let yellowSum = 0;
      let brownSum = 0;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Analyze color composition
        if (g > r && g > b) greenSum++;
        if (r > 150 && g > 150 && b < 100) yellowSum++;
        if (r > 100 && g < 80 && b < 80) brownSum++;
      }
      
      const totalPixels = data.length / 4;
      const healthScore = (greenSum / totalPixels) * 100;
      const diseaseIndicator = (yellowSum + brownSum) / totalPixels * 100;
      
      let diseaseStatus: 'healthy' | 'suspected' | 'unknown' = 'healthy';
      let recommendations = ['Continue current care routine'];
      
      if (diseaseIndicator > 15) {
        diseaseStatus = 'suspected';
        recommendations = [
          'Investigate potential fungal infection',
          'Reduce watering frequency',
          'Improve air circulation',
          'Consider organic fungicide treatment'
        ];
      } else if (healthScore < 30) {
        diseaseStatus = 'suspected';
        recommendations = [
          'Check soil nutrient levels',
          'Ensure adequate lighting',
          'Monitor for pest damage',
          'Consider fertilizer application'
        ];
      }
      
      const confidence = Math.min(95, Math.max(60, healthScore + (100 - diseaseIndicator)));
      
      resolve({
        diseaseStatus,
        growthPrediction: healthScore > 60 
          ? `Healthy plant detected. Growth rate appears optimal with ${Math.round(healthScore)}% vegetation coverage.`
          : `Plant shows signs of stress. Estimated growth reduction of ${Math.round(100-healthScore)}%.`,
        recommendations,
        confidence: Math.round(confidence)
      });
    };
    
    img.src = imageData;
  });
};

export const PlantMonitoring: React.FC<PlantMonitoringProps> = ({ 
  mode, 
  customAnalyzer,
  mlConfig 
}) => {
  const [simulatedImage, setSimulatedImage] = useState<string>(simulatedPlantImages[0]);
  const [hasScanned, setHasScanned] = useState(false);
  
  // Use custom hooks for camera and analysis
  const { 
    isConnected, 
    videoRef, 
    canvasRef, 
    connectCamera: connectCameraHook, 
    disconnectCamera: disconnectCameraHook, 
    captureImage 
  } = useCamera();
  
  const { 
    analysis, 
    isAnalyzing, 
    analyzeImage, 
    reset: resetAnalysis 
  } = usePlantAnalysis(customAnalyzer, mlConfig);

  const connectCamera = async () => {
    if (mode === 'simulated') {
      // Use random simulated image
      const randomImage = simulatedPlantImages[Math.floor(Math.random() * simulatedPlantImages.length)];
      setSimulatedImage(randomImage);
      
      // Simulate analysis for demo mode
      await analyzeImage(randomImage);
      return;
    }

    // Real camera connection
    await connectCameraHook();
    resetAnalysis();
    setHasScanned(false);
  };

  const captureAndAnalyze = async () => {
    setHasScanned(true);
    
    const imageData = await captureImage();
    if (imageData) {
      await analyzeImage(imageData);
    }
  };

  const disconnectCamera = () => {
    disconnectCameraHook();
    setHasScanned(false);
    if (mode === 'realtime') {
      resetAnalysis();
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
        <CardTitle className="text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center">
            <Activity className="w-5 h-5 mr-2 text-orange-400" />
            <span className="text-sm sm:text-base">Real-Time Plant Monitoring</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {!isConnected ? (
              <Button
                onClick={connectCamera}
                size="sm"
                variant="outline"
                className="text-white border-white/20 hover:bg-white/10 text-xs sm:text-sm"
              >
                <Camera className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Connect Camera
              </Button>
            ) : (
              <div className="flex gap-2">
                {mode === 'realtime' && (
                  <Button
                    onClick={captureAndAnalyze}
                    size="sm"
                    disabled={isAnalyzing}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm"
                  >
                    <Scan className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    {isAnalyzing ? 'Scanning...' : 'Scan Plant'}
                  </Button>
                )}
                <Button
                  onClick={disconnectCamera}
                  size="sm"
                  variant="outline"
                  className="text-white border-white/20 hover:bg-white/10 text-xs sm:text-sm"
                >
                  <CameraOff className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Disconnect
                </Button>
              </div>
            )}
          </div>
        </CardTitle>
        <p className="text-xs sm:text-sm text-gray-400">
          {mode === 'realtime' ? 'Real-time plant disease detection' : 'Simulated plant monitoring'}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Camera Feed */}
          <div className="relative">
            <div className="w-full h-48 sm:h-56 md:h-64 bg-black/40 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden relative">
              {isConnected ? (
                mode === 'simulated' ? (
                  <img
                    src={simulatedImage}
                    alt="Simulated plant"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    {/* Scanner overlay for real mode */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="border-2 border-green-400 border-dashed rounded-lg w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center bg-green-400/5">
                        <div className="text-center text-green-400">
                          <Scan className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                          <p className="text-xs font-medium">Scan Area</p>
                        </div>
                      </div>
                    </div>
                  </>
                )
              ) : (
                <div className="text-center text-gray-400 p-4">
                  <Camera className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-xs sm:text-sm">Camera not connected</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {mode === 'realtime' ? 'Connect to start real-time monitoring' : 'Connect to view simulated data'}
                  </p>
                </div>
              )}
            </div>
            
            {isConnected && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1 sm:mr-2 animate-pulse" />
                  {mode === 'simulated' ? 'Demo' : 'Live'}
                </Badge>
              </div>
            )}
          </div>
          
          {/* Hidden canvas for real-time analysis */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Analysis Results */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-300">Analysis Results</h4>
            
            {isAnalyzing ? (
              <div className="text-center py-6 sm:py-8">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-green-400 mx-auto mb-2"></div>
                <p className="text-xs sm:text-sm text-gray-400">
                  {mode === 'realtime' ? 'Analyzing plant health...' : 'Processing simulation...'}
                </p>
              </div>
            ) : analysis && (mode === 'simulated' || (hasScanned && mode === 'realtime')) ? (
              <div className="space-y-3">
                {/* Disease Status */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-black/20 rounded-lg border border-white/10">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(analysis.diseaseStatus)}
                    <span className="text-xs sm:text-sm text-gray-300">Disease Status:</span>
                  </div>
                  <Badge className={getStatusColor(analysis.diseaseStatus) + " text-xs"}>
                    {analysis.diseaseStatus.charAt(0).toUpperCase() + analysis.diseaseStatus.slice(1)}
                  </Badge>
                </div>

                {/* Growth Prediction */}
                <div className="p-3 bg-black/20 rounded-lg border border-white/10">
                  <h5 className="text-xs sm:text-sm font-medium text-gray-300 mb-2">Growth Prediction:</h5>
                  <p className="text-xs sm:text-sm text-white leading-relaxed">{analysis.growthPrediction}</p>
                </div>

                {/* Recommendations */}
                <div className="p-3 bg-black/20 rounded-lg border border-white/10">
                  <h5 className="text-xs sm:text-sm font-medium text-gray-300 mb-2">Recommendations:</h5>
                  <ul className="space-y-1">
                    {analysis.recommendations.map((rec, index) => (
                      <li key={index} className="text-xs sm:text-sm text-white flex items-start">
                        <span className="text-green-400 mr-2 mt-0.5">•</span>
                        <span className="leading-relaxed">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Confidence */}
                <div className="flex items-center justify-between text-xs sm:text-sm p-2 bg-black/10 rounded">
                  <span className="text-gray-400">Analysis Confidence:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 sm:w-20 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${analysis.confidence}%` }}
                      />
                    </div>
                    <span className="text-white font-medium">{analysis.confidence}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {mode === 'realtime' && !hasScanned ? (
                  // Show NA values for real mode before scanning
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-black/20 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-2">
                        <X className="w-5 h-5 text-gray-400" />
                        <span className="text-xs sm:text-sm text-gray-300">Disease Status:</span>
                      </div>
                      <Badge className="bg-gray-500/20 text-gray-400 text-xs">N/A</Badge>
                    </div>
                    
                    <div className="p-3 bg-black/20 rounded-lg border border-white/10">
                      <h5 className="text-xs sm:text-sm font-medium text-gray-300 mb-2">Growth Prediction:</h5>
                      <p className="text-xs sm:text-sm text-gray-400">N/A - Scan plant to get prediction</p>
                    </div>
                    
                    <div className="p-3 bg-black/20 rounded-lg border border-white/10">
                      <h5 className="text-xs sm:text-sm font-medium text-gray-300 mb-2">Recommendations:</h5>
                      <p className="text-xs sm:text-sm text-gray-400">N/A - Scan plant to get recommendations</p>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs sm:text-sm p-2 bg-black/10 rounded">
                      <span className="text-gray-400">Analysis Confidence:</span>
                      <span className="text-gray-400">N/A</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6 sm:py-8 text-gray-400">
                    <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs sm:text-sm px-2">
                      {mode === 'realtime' 
                        ? 'Connect camera and click "Scan Plant" for real-time analysis'
                        : 'Connect camera to view simulated plant monitoring'
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};