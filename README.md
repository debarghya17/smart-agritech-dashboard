
# 🌾 Smart AgriTech Dashboard

**Smart AgriTech Solutions** harness the power of **IoT**, **AI**, and **precision analytics** to boost crop yields while minimizing resource use—paving the way for a more sustainable and expressive future in Indian agriculture.

Live Demo: [Click Here](https://smartagritechdashboard.netlify.app)

## 🚀 Project Vision

India's agricultural legacy meets next-gen technology. This dashboard is part of a broader mission to **redefine India's global tech identity**—from service provider to innovation powerhouse. It visualizes real-time environmental data from ESP32-based sensors, enabling farmers, researchers, and innovators to make informed decisions with clarity and cultural resonance.

## 🧠 Features

- 📡 **Real-Time Sensor Integration**  
  Soil moisture, rainfall, temperature, and more—streamed live from ESP32-WROOM devices.

- 🎨 **Expressive UI/UX**  
  Designed with TailwindCSS and TypeScript for clarity, emotional nuance, and playful interaction.

- 📊 **Dynamic Data Visualization**  
  Interactive charts, status indicators, and modular panels for each sensor type.

- 🔔 **Device Discovery & Status Tracking**  
  Auto-detects when IoT devices come online and updates dashboard accordingly.

- 🌐 **Responsive & Lightweight**  
  Built with Vite for blazing-fast performance across devices.

## 🛠️ Tech Stack

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![ESP32](https://img.shields.io/badge/ESP32-WROOM-FF6F00?style=for-the-badge&logo=espressif&logoColor=white)
![Arduino](https://img.shields.io/badge/Arduino-00979D?style=for-the-badge&logo=arduino&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)

## 📦 Installation

```bash
# Clone the repo
git clone https://github.com/debarghya17/smart-agritech-dashboard.git
cd smart-agritech-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔌 ESP32 Integration

Each ESP32 device is programmed to:
- Connect to Wi-Fi on boot
- Send sensor data via HTTP POST to backend
- Trigger dashboard updates via WebSocket

Example payload:

```json
{
  "device_id": "ESP32-WROOM-01",
  "soil_moisture": 42,
  "temperature": 29.5,
  "rain_detected": false,
  "timestamp": "2025-09-04T12:00:00Z"
}
```
## 🧪 Future Enhancements

- 🔄 MQTT broker integration for scalable device messaging
- 🧭 GPS-based device mapping
- 🧬 AI-driven crop recommendations
- 🪔 Cultural UI themes (Sanskrit/Hinglish toggles, astrology overlays)

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you’d like to modify.

## 📜 License

MIT License © 2025 Debarghya Bhowmick

## 🙏 Acknowledgments

- Inspired by India's rich agricultural heritage and the spirit of innovation.
- Powered by open-source tools and a vision for expressive, impactful tech.
