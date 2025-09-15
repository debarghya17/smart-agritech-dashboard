import { useState, useCallback } from 'react';

export interface PlantAnalysis {
  diseaseStatus: 'unknown' | 'healthy' | 'suspected';
  growthPrediction: string;
  recommendations: string[];
  confidence: number;
}

export interface MLModelConfig {
  endpoint?: string;
  apiKey?: string;
  modelName?: string;
  timeout?: number;
}

export interface AnalysisHookReturn {
  analysis: PlantAnalysis | null;
  isAnalyzing: boolean;
  error: string | null;
  analyzeImage: (imageData: string | File) => Promise<void>;
  reset: () => void;
}

// Default fallback analysis function
const defaultAnalyzeImage = async (imageData: string): Promise<PlantAnalysis> => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
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

export const usePlantAnalysis = (
  customAnalyzer?: (imageData: string | File) => Promise<PlantAnalysis>,
  config?: MLModelConfig
): AnalysisHookReturn => {
  const [analysis, setAnalysis] = useState<PlantAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeImage = useCallback(async (imageData: string | File) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      let dataUrl: string;
      
      // Convert File to base64 if needed
      if (imageData instanceof File) {
        dataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(imageData);
        });
      } else {
        dataUrl = imageData;
      }
      
      // Use custom analyzer if provided, otherwise fallback to default
      const result = customAnalyzer 
        ? await customAnalyzer(dataUrl)
        : await defaultAnalyzeImage(dataUrl);
      
      setAnalysis(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      setAnalysis({
        diseaseStatus: 'unknown',
        growthPrediction: 'Analysis failed. Please try again.',
        recommendations: ['Ensure good lighting', 'Position camera closer to plant'],
        confidence: 0
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [customAnalyzer]);

  const reset = useCallback(() => {
    setAnalysis(null);
    setError(null);
    setIsAnalyzing(false);
  }, []);

  return {
    analysis,
    isAnalyzing,
    error,
    analyzeImage,
    reset
  };
};