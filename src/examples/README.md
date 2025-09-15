# ML Model Integration Guide

The Plant Monitoring component now supports easy integration with custom ML models. Here's how to use it:

## Basic Usage

```tsx
import { PlantMonitoring } from '@/components/dashboard/PlantMonitoring';

// Default usage with built-in color analysis
<PlantMonitoring mode="realtime" />
```

## Custom ML Model Integration

```tsx
import { PlantMonitoring } from '@/components/dashboard/PlantMonitoring';
import { PlantAnalysis } from '@/hooks/usePlantAnalysis';

const customAnalyzer = async (imageData: string | File): Promise<PlantAnalysis> => {
  // Your ML model logic here
  const result = await yourMLModel.predict(imageData);
  
  return {
    diseaseStatus: result.isHealthy ? 'healthy' : 'suspected',
    growthPrediction: result.growthAnalysis,
    recommendations: result.recommendations,
    confidence: result.confidence
  };
};

<PlantMonitoring 
  mode="realtime" 
  customAnalyzer={customAnalyzer}
  mlConfig={{
    endpoint: 'your-api-endpoint',
    apiKey: 'your-api-key',
    timeout: 10000
  }}
/>
```

## Hooks Available

### usePlantAnalysis
- Manages analysis state and processing
- Supports custom analyzer functions
- Handles errors and loading states

### useCamera
- Manages camera connection and capture
- Provides video and canvas refs
- Handles permissions and errors

## Integration Examples

1. **REST API Integration**: Call your ML model via HTTP API
2. **TensorFlow.js**: Run models directly in the browser
3. **Hugging Face Transformers**: Use pre-trained models client-side
4. **Custom WebGL/WASM**: Integrate high-performance models

See `MLModelIntegration.tsx` for complete examples.

## Key Features

- ✅ Easy ML model swapping
- ✅ Built-in camera handling
- ✅ Error handling and fallbacks
- ✅ Real-time and simulated modes
- ✅ Responsive design
- ✅ TypeScript support