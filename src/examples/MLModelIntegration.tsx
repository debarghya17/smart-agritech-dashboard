import React from 'react';
import { PlantMonitoring } from '@/components/dashboard/PlantMonitoring';
import { PlantAnalysis } from '@/hooks/usePlantAnalysis';

// Example 1: Custom ML Model with API endpoint
const customMLAnalyzer = async (imageData: string | File): Promise<PlantAnalysis> => {
  try {
    // Convert File to base64 if needed
    let base64Image: string;
    if (imageData instanceof File) {
      base64Image = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(imageData);
      });
    } else {
      base64Image = imageData;
    }

    // Call your ML model API
    const response = await fetch('/api/plant-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY'
      },
      body: JSON.stringify({
        image: base64Image,
        model_version: 'v2.1'
      })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const result = await response.json();

    return {
      diseaseStatus: result.disease_detected ? 'suspected' : 'healthy',
      growthPrediction: result.growth_analysis || 'Analysis completed',
      recommendations: result.recommendations || ['No specific recommendations'],
      confidence: result.confidence || 0
    };
  } catch (error) {
    console.error('ML Analysis failed:', error);
    throw error;
  }
};

// Example 2: TensorFlow.js Model Integration
const tensorflowAnalyzer = async (imageData: string | File): Promise<PlantAnalysis> => {
  try {
    // Load your TensorFlow model (you'll need to add @tensorflow/tfjs)
    // const model = await tf.loadLayersModel('/models/plant-disease-model.json');
    
    // Preprocess image
    // const tensor = tf.browser.fromPixels(imageElement)
    //   .resizeNearestNeighbor([224, 224])
    //   .expandDims(0)
    //   .div(255.0);
    
    // Make prediction
    // const prediction = model.predict(tensor) as tf.Tensor;
    // const predictionData = await prediction.data();
    
    // For now, return mock data
    return {
      diseaseStatus: 'healthy',
      growthPrediction: 'TensorFlow.js analysis completed',
      recommendations: ['Model-based recommendations'],
      confidence: 85
    };
  } catch (error) {
    console.error('TensorFlow analysis failed:', error);
    throw error;
  }
};

// Example 3: Hugging Face Transformers Integration
const huggingFaceAnalyzer = async (imageData: string | File): Promise<PlantAnalysis> => {
  try {
    // You can use @huggingface/transformers for browser-based ML
    // const classifier = await pipeline('image-classification', 'your-plant-model');
    // const result = await classifier(imageData);
    
    return {
      diseaseStatus: 'healthy',
      growthPrediction: 'Hugging Face model analysis',
      recommendations: ['AI-powered recommendations'],
      confidence: 92
    };
  } catch (error) {
    console.error('Hugging Face analysis failed:', error);
    throw error;
  }
};

// Usage Examples Component
export const MLIntegrationExamples: React.FC = () => {
  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold text-white mb-4">ML Model Integration Examples</h2>
      
      {/* Default Plant Monitoring (uses built-in color analysis) */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">Default Analysis</h3>
        <PlantMonitoring mode="realtime" />
      </div>

      {/* Custom API Integration */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">Custom API Integration</h3>
        <PlantMonitoring 
          mode="realtime" 
          customAnalyzer={customMLAnalyzer}
          mlConfig={{
            endpoint: '/api/plant-analysis',
            apiKey: 'your-api-key',
            timeout: 10000
          }}
        />
      </div>

      {/* TensorFlow.js Integration */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">TensorFlow.js Integration</h3>
        <PlantMonitoring 
          mode="realtime" 
          customAnalyzer={tensorflowAnalyzer}
        />
      </div>

      {/* Hugging Face Integration */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">Hugging Face Integration</h3>
        <PlantMonitoring 
          mode="realtime" 
          customAnalyzer={huggingFaceAnalyzer}
        />
      </div>
    </div>
  );
};

export default MLIntegrationExamples;