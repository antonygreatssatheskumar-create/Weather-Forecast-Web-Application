/**
 * API Configuration
 * Contains API keys and configuration settings
 */
const CONFIG = {
  // API Keys
  weatherApiKey: "2VXNCLWCN2QYBZTHRJU89EP8Q",
  geoapifyKey: "31c0e0d4695445579cfb1285cca53c0f",
  mapTilerKey: "Ghh540QtpAwfQXmNL9w6",
  
  // Default Map Settings
  defaultMapView: {
    latitude: 20.5937,
    longitude: 78.9629,
    zoom: 5
  },
  
  // Weather Video Mapping
  weatherVideoMap: {
    "clear-day": "clear.mp4",
    "clear-night": "clear.mp4",
    "partly-cloudy-day": "cloudy.mp4",
    "partly-cloudy-night": "cloudy.mp4",
    "cloudy": "cloudy.mp4",
    "rain": "rain.mp4",
    "snow": "snow.mp4",
    "fog": "fog.mp4",
    "wind": "wind.mp4",
    "thunderstorm": "storm.mp4"
  },
  
  // Weather Image Mapping
  weatherImageMap: {
    "clear-day": "clear.png",
    "clear-night": "clear.png",
    "partly-cloudy-day": "cloudy.png",
    "partly-cloudy-night": "cloudy.png",
    "cloudy": "cloudy.png",
    "rain": "rain.png",
    "snow": "snow.png",
    "fog": "fog.png",
    "wind": "wind.png",
    "thunderstorm": "storm.png"
  },
  
  // Default Weather Types (for initial display)
  defaultWeatherTypes: ["clear", "cloudy", "rain", "snow", "storm", "wind", "fog"]
};