/**
 * Map functionality
 * Handles map initialization and interactions
 */
class WeatherMap {
  constructor() {
    this.map = null;
    this.currentMarker = null;
    this.initialize();
  }
  
  /**
   * Initialize the map with default settings
   */
  initialize() {
    // Create map instance
    this.map = L.map("map").setView(
      [CONFIG.defaultMapView.latitude, CONFIG.defaultMapView.longitude], 
      CONFIG.defaultMapView.zoom
    );
    
    // Add tile layer
    L.tileLayer(`https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${CONFIG.mapTilerKey}`, {
      attribution: '© MapTiler © OpenStreetMap contributors',
      tileSize: 512,
      zoomOffset: -1
    }).addTo(this.map);
    
    // Add map click event
    this.map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      this.setMarker(lat, lng);
      weatherService.getWeather(lat, lng);
      this.reverseGeocode(lat, lng);
    });
  }
  
  /**
   * Set a marker on the map
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   */
  setMarker(lat, lon) {
    if (this.currentMarker) this.currentMarker.remove();
    
    const customIcon = L.divIcon({
      className: 'custom-map-marker',
      html: '<i class="fas fa-map-marker-alt" style="font-size: 24px; color: #1a73e8;"></i>',
      iconSize: [24, 40],
      iconAnchor: [12, 40]
    });
    
    this.currentMarker = L.marker([lat, lon], { icon: customIcon }).addTo(this.map);
    
    // Add a subtle pulse animation
    const pulseCircle = L.circle([lat, lon], {
      color: '#1a73e8',
      fillColor: '#1a73e8',
      fillOpacity: 0.3,
      radius: 1000,
      weight: 1
    }).addTo(this.map);
    
    // Animate the pulse
    const animatePulse = () => {
      pulseCircle.setStyle({ fillOpacity: 0.5 });
      setTimeout(() => {
        pulseCircle.setStyle({ fillOpacity: 0.1 });
      }, 500);
    };
    
    animatePulse();
    const pulseInterval = setInterval(animatePulse, 1500);
    
    // Clear the animation after 5 seconds
    setTimeout(() => {
      clearInterval(pulseInterval);
      pulseCircle.remove();
    }, 5000);
  }
  
  /**
   * Geocode a location from coordinates
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   */
  reverseGeocode(lat, lon) {
    uiController.showLoader();
    
    fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${CONFIG.geoapifyKey}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.features && data.features.length > 0) {
          const placeName = data.features[0].properties.formatted;
          document.getElementById("search").value = placeName;
          document.getElementById("current-location").textContent = this.formatLocationName(data.features[0].properties);
          uiController.updateCurrentDate();
        }
        uiController.hideLoader();
      })
      .catch(err => {
        console.error("Reverse geocoding failed:", err);
        uiController.hideLoader();
        uiController.showError("Couldn't retrieve location information");
      });
  }
  
  /**
   * Format location name from geocoding result
   * @param {Object} properties - Location properties from geocoding
   * @returns {string} Formatted location name
   */
  formatLocationName(properties) {
    const parts = [];
    
    if (properties.city) {
      parts.push(properties.city);
    } else if (properties.county) {
      parts.push(properties.county);
    }
    
    if (properties.state) {
      parts.push(properties.state);
    }
    
    if (properties.country) {
      parts.push(properties.country);
    }
    
    return parts.join(', ');
  }
  
  /**
   * Handle search by location name
   * @param {string} location - Location name to search
   */
  searchByLocation(location) {
    if (!location) return;
    
    uiController.showLoader();
    
    fetch(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(location)}&apiKey=${CONFIG.geoapifyKey}`)
      .then(res => res.json())
      .then(data => {
        if (data.features && data.features.length > 0) {
          const lat = data.features[0].geometry.coordinates[1];
          const lon = data.features[0].geometry.coordinates[0];
          this.map.setView([lat, lon], 13);
          this.setMarker(lat, lon);
          weatherService.getWeather(lat, lon);
          document.getElementById("current-location").textContent = this.formatLocationName(data.features[0].properties);
          uiController.updateCurrentDate();
        } else {
          uiController.showError("Location not found");
        }
        uiController.hideLoader();
      })
      .catch(() => {
        uiController.hideLoader();
        uiController.showError("Error searching for location");
      });
  }
  
  /**
   * Get current user location
   */
  getCurrentLocation() {
    if (navigator.geolocation) {
      uiController.showLoader();
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          this.map.setView([lat, lon], 13);
          this.setMarker(lat, lon);
          weatherService.getWeather(lat, lon);
          this.reverseGeocode(lat, lon);
          uiController.hideLoader();
        },
        () => {
          uiController.hideLoader();
          uiController.showError("Unable to retrieve your location");
        },
        { timeout: 10000 }
      );
    } else {
      uiController.showError("Geolocation is not supported by your browser");
    }
  }
}

// Initialize map
const mapController = new WeatherMap();