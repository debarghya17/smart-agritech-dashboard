import { useState, useRef, useCallback } from 'react';

export interface CameraHookReturn {
  isConnected: boolean;
  isCapturing: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  connectCamera: () => Promise<void>;
  disconnectCamera: () => void;
  captureImage: () => Promise<string | null>;
  error: string | null;
}

export const useCamera = (): CameraHookReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const connectCamera = useCallback(async () => {
    try {
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'environment'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsConnected(true);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Camera access denied';
      setError(errorMessage);
      console.error('Camera access denied:', err);
    }
  }, []);

  const disconnectCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsConnected(false);
    setError(null);
  }, []);

  const captureImage = useCallback(async (): Promise<string | null> => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Camera or canvas not available');
      return null;
    }
    
    setIsCapturing(true);
    setError(null);
    
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas context not available');
      }
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data as base64
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      return imageData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Image capture failed';
      setError(errorMessage);
      console.error('Image capture failed:', err);
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, []);

  return {
    isConnected,
    isCapturing,
    videoRef,
    canvasRef,
    connectCamera,
    disconnectCamera,
    captureImage,
    error
  };
};