import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wifi, WifiOff, Search, Bluetooth, Usb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface IoTDevice {
  id: string;
  name: string;
  type: 'ESP32' | 'Arduino' | 'Raspberry Pi';
  status: 'connected' | 'disconnected' | 'connecting';
  sensors: string[];
  lastSeen?: Date;
}

interface DeviceConnectionDialogProps {
  onDeviceConnect: (deviceId: string) => void;
  children: React.ReactNode;
}

export const DeviceConnectionDialog: React.FC<DeviceConnectionDialogProps> = ({ 
  onDeviceConnect, 
  children 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [selectedConnectionType, setSelectedConnectionType] = useState<'wifi' | 'bluetooth' | 'usb'>('wifi');
  const { toast } = useToast();

  // Simulated device discovery - In real implementation, this would use WebSerial, WebBluetooth, or network discovery
  const simulateDeviceDiscovery = () => {
    const mockDevices: IoTDevice[] = [
      {
        id: 'esp32-001',
        name: 'Farm Sensor Node 1',
        type: 'ESP32',
        status: 'disconnected',
        sensors: ['temperature', 'humidity', 'soil_moisture'],
        lastSeen: new Date(Date.now() - 5 * 60 * 1000)
      },
      {
        id: 'esp32-002', 
        name: 'Weather Station',
        type: 'ESP32',
        status: 'disconnected',
        sensors: ['temperature', 'humidity', 'rainfall', 'light_intensity'],
        lastSeen: new Date(Date.now() - 2 * 60 * 1000)
      },
      {
        id: 'arduino-001',
        name: 'Soil Monitor',
        type: 'Arduino',
        status: 'disconnected',
        sensors: ['ph_level', 'nitrogen', 'phosphorous', 'potassium'],
        lastSeen: new Date(Date.now() - 10 * 60 * 1000)
      }
    ];
    
    return mockDevices;
  };

  const scanForDevices = async () => {
    setIsScanning(true);
    setDevices([]);
    
    try {
      // Real implementation would depend on connection type:
      if (selectedConnectionType === 'usb') {
        // Use WebSerial API
        if ('serial' in navigator) {
          toast({
            title: "USB Serial Detection",
            description: "Please connect your device via USB and grant permission when prompted.",
          });
          // const port = await navigator.serial.requestPort();
          // Real USB serial communication would happen here
        } else {
          toast({
            title: "USB Serial Not Supported",
            description: "Your browser doesn't support WebSerial API. Try Chrome/Edge.",
            variant: "destructive"
          });
        }
      } else if (selectedConnectionType === 'bluetooth') {
        // Use WebBluetooth API
        if ('bluetooth' in navigator) {
          toast({
            title: "Bluetooth Discovery",
            description: "Scanning for Bluetooth LE devices...",
          });
          // const device = await navigator.bluetooth.requestDevice({
          //   filters: [{ services: ['environmental_sensing'] }]
          // });
          // Real Bluetooth communication would happen here
        } else {
          toast({
            title: "Bluetooth Not Supported",
            description: "Your browser doesn't support WebBluetooth API.",
            variant: "destructive"
          });
        }
      } else {
        // WiFi/Network discovery
        toast({
          title: "Network Discovery",
          description: "Scanning for IoT devices on local network...",
        });
        // Real network discovery would use mDNS or specific protocols
      }

      // Simulate scanning delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, show mock devices
      const discoveredDevices = simulateDeviceDiscovery();
      setDevices(discoveredDevices);
      
      toast({
        title: "Scan Complete",
        description: `Found ${discoveredDevices.length} devices`,
      });
      
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Could not scan for devices. Check permissions and try again.",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const connectToDevice = async (device: IoTDevice) => {
    setDevices(prev => prev.map(d => 
      d.id === device.id ? { ...d, status: 'connecting' } : d
    ));

    try {
      // Real connection logic would go here
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setDevices(prev => prev.map(d => 
        d.id === device.id ? { ...d, status: 'connected' } : d
      ));
      
      onDeviceConnect(device.id);
      
      toast({
        title: "Device Connected",
        description: `Successfully connected to ${device.name}`,
      });
      
      setIsOpen(false);
    } catch (error) {
      setDevices(prev => prev.map(d => 
        d.id === device.id ? { ...d, status: 'disconnected' } : d
      ));
      
      toast({
        title: "Connection Failed", 
        description: `Could not connect to ${device.name}`,
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gray-900/95 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <Search className="w-5 h-5 mr-2 text-blue-400" />
            Find IoT Devices
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Connection Type Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300">Connection Type</h3>
            <div className="flex gap-2">
              {[
                { type: 'wifi' as const, label: 'WiFi/Network', icon: Wifi },
                { type: 'bluetooth' as const, label: 'Bluetooth LE', icon: Bluetooth },
                { type: 'usb' as const, label: 'USB Serial', icon: Usb }
              ].map(({ type, label, icon: Icon }) => (
                <Button
                  key={type}
                  variant={selectedConnectionType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedConnectionType(type)}
                  className="text-xs"
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Scan Button */}
          <Button 
            onClick={scanForDevices}
            disabled={isScanning}
            className="w-full"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Scan for Devices
              </>
            )}
          </Button>

          {/* Device List */}
          {devices.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-300">Discovered Devices</h3>
              <div className="space-y-2">
                {devices.map((device) => (
                  <Card key={device.id} className="bg-black/20 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium text-white">{device.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {device.type}
                            </Badge>
                            <Badge 
                              variant={device.status === 'connected' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {device.status === 'connected' ? (
                                <><Wifi className="w-3 h-3 mr-1" /> Connected</>
                              ) : device.status === 'connecting' ? (
                                <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Connecting</>
                              ) : (
                                <><WifiOff className="w-3 h-3 mr-1" /> Disconnected</>
                              )}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-400">
                            Sensors: {device.sensors.join(', ')}
                          </div>
                          {device.lastSeen && (
                            <div className="text-xs text-gray-500">
                              Last seen: {device.lastSeen.toLocaleTimeString()}
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => connectToDevice(device)}
                          disabled={device.status === 'connecting' || device.status === 'connected'}
                        >
                          {device.status === 'connected' ? 'Connected' : 'Connect'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Info Note */}
          <div className="text-xs text-gray-500 bg-gray-800/50 p-3 rounded-lg">
            <p className="mb-2"><strong>Note:</strong> Real device connection requires:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>WiFi:</strong> Devices must be on same network with HTTP API endpoints</li>
              <li><strong>Bluetooth LE:</strong> Devices must advertise Environmental Sensing service</li>
              <li><strong>USB Serial:</strong> Devices must support serial communication protocol</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};