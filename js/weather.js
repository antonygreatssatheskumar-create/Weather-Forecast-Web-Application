/**
 * Weather Service
 * Handles fetching and processing weather data
 */
class WeatherService {
  constructor() {
    this.currentWeatherData = null;
  }
  
  /**
   * Get weather data for a location
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   */
  getWeather(lat, lon) {
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${lon}?unitGroup=metric&key=${CONFIG.weatherApiKey}&contentType=json&include=hours`;
    
    uiController.showLoader();
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data && data.days) {
          this.currentWeatherData = data;
          this.displayWeather(data.days.slice(0, 7));
          this.updateCurrentWeather(data.days[0]);
          uiController.showWeatherOverview();
        } else {
          uiController.showError("No weather data found");
        }
        uiController.hideLoader();
      }).catch((error) => {
        console.error("Error fetching weather:", error);
        uiController.hideLoader();
        uiController.showError("Error fetching weather data");
      });
  }
  
  /**
   * Display weather cards
   * @param {Array} days - Array of daily weather data
   */
  displayWeather(days) {
    const weatherDiv = document.getElementById("weather");
    weatherDiv.innerHTML = "";
    
    days.forEach((day, index) => {
      const date = new Date(day.datetime);
      const card = document.createElement("div");
      card.className = "weather-card";
      card.setAttribute("data-index", index);
      
      const label = index === 0 ? "Today" : 
                    index === 1 ? "Tomorrow" :
                    date.toLocaleDateString("en-US", { weekday: "short" });
      
      const videoName = this.matchWeatherFile(day.icon, CONFIG.weatherVideoMap);
      const imageName = this.matchWeatherFile(day.icon, CONFIG.weatherImageMap);
      
      card.innerHTML = `
        <video autoplay muted loop playsinline>
          <source src="videos/${videoName}" type="video/mp4" />
        </video>
        <div class="overlay"></div>
        <div class="weather-card-content">
          <div>
            <div class="weather-card-day">${label}</div>
            <div class="weather-card-date">${date.toLocaleDateString("en-US", {
              month: "short", day: "numeric"
            })}</div>
          </div>
          <div>
            <img src="image/${imageName}" alt="${day.conditions}" class="weather-card-icon">
            <div class="weather-card-temp">${Math.round(day.temp)}°C</div>
            <div class="weather-card-conditions">${day.conditions}</div>
          </div>
        </div>
      `;
      
      card.addEventListener("click", () => {
        this.showWeatherDetails(day, index);
      });
      
      weatherDiv.appendChild(card);
    });
  }
  
  /**
   * Update current weather overview
   * @param {Object} today - Today's weather data
   */
  updateCurrentWeather(today) {
    const currentTemp = document.getElementById("current-temp");
    const currentIcon = document.getElementById("current-icon");
    const currentConditions = document.getElementById("current-conditions");
    
    currentTemp.textContent = `${Math.round(today.temp)}°C`;
    currentIcon.src = `image/${this.matchWeatherFile(today.icon, CONFIG.weatherImageMap)}`;
    currentConditions.textContent = today.conditions;
  }
  
  /**
   * Show detailed weather information
   * @param {Object} day - Daily weather data
   * @param {number} index - Day index
   */
  showWeatherDetails(day, index) {
    const detailsContent = document.getElementById("details-content");
    const date = new Date(day.datetime);
    const dayLabel = index === 0 ? "Today" : 
                    index === 1 ? "Tomorrow" :
                    date.toLocaleDateString("en-US", { weekday: "long" });
    
    let hourlyForecast = '';
    
    // Get hourly data (limit to 24 hours)
    if (day.hours) {
      hourlyForecast = '<div class="hourly-forecast">';
      day.hours.forEach((hour, i) => {
        if (i % 3 === 0) { // Show every 3 hours to save space
          const hourTime = new Date(hour.datetime).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            hour12: true 
          });
          const hourIcon = this.matchWeatherFile(hour.icon, CONFIG.weatherImageMap);
          
          hourlyForecast += `
            <div class="hourly-item">
              <div class="hourly-time">${hourTime}</div>
              <img src="image/${hourIcon}" alt="${hour.conditions}" class="hourly-icon">
              <div class="hourly-temp">${Math.round(hour.temp)}°C</div>
            </div>
          `;
        }
      });
      hourlyForecast += '</div>';
    }
    
    detailsContent.innerHTML = `
      <h2>${dayLabel}, ${date.toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric"
      })}</h2>
      <div class="current-temp-container" style="margin: 1rem 0;">
        <img src="image/${this.matchWeatherFile(day.icon, CONFIG.weatherImageMap)}" 
             alt="${day.conditions}" style="width: 60px; height: 60px;">
        <div id="current-temp" style="font-size: 42px;">${Math.round(day.temp)}°C</div>
      </div>
      <p style="margin-bottom: 1.5rem;">${day.description || day.conditions}</p>
      
      <div class="detail-section">
        <h3>Hourly Forecast</h3>
        ${hourlyForecast}
      </div>
      
      <div class="detail-section">
        <h3>Daily Details</h3>
        <div class="detail-row">
          <span class="detail-label">Feels Like</span>
          <span class="detail-value">${Math.round(day.feelslike)}°C</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Humidity</span>
          <span class="detail-value">${day.humidity}%</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Wind</span>
          <span class="detail-value">${day.windspeed} km/h</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">UV Index</span>
          <span class="detail-value">${day.uvindex}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Sunrise</span>
          <span class="detail-value">${new Date(day.sunrise).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          })}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Sunset</span>
          <span class="detail-value">${new Date(day.sunset).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          })}</span>
        </div>
      </div>
      
      <div class="detail-section">
        <h3>Temperature Range</h3>
        <div class="detail-row">
          <span class="detail-label">High</span>
          <span class="detail-value">${Math.round(day.tempmax)}°C</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Low</span>
          <span class="detail-value">${Math.round(day.tempmin)}°C</span>
        </div>
      </div>
      
      <div class="detail-section">
        <h3>Precipitation</h3>
        <div class="detail-row">
          <span class="detail-label">Probability</span>
          <span class="detail-value">${day.precipprob || 0}%</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Amount</span>
          <span class="detail-value">${day.precip || 0} mm</span>
        </div>
      </div>
    `;
    
    uiController.showWeatherDetails();
  }
  
  /**
   * Get the correct video or image file for a weather condition
   * @param {string} icon - Weather icon code
   * @param {Object} map - Mapping of icon codes to file names
   * @returns {string} File name
   */
  matchWeatherFile(icon, map) {
    if (!icon) return map["cloudy"];
    return map[icon.toLowerCase().trim()] || map["cloudy"];
  }
  
  /**
   * Show default weather types
   */
  showDefaultWeather() {
    const weatherDiv = document.getElementById("weather");
    weatherDiv.innerHTML = "";
    
    CONFIG.defaultWeatherTypes.forEach((type) => {
      const card = document.createElement("div");
      card.className = "weather-card";
      
      card.innerHTML = `
        <video autoplay muted loop playsinline>
          <source src="videos/${type}.mp4" type="video/mp4" />
        </video>
        <div class="overlay"></div>
        <div class="weather-card-content">
          <div class="weather-card-day">${type.toUpperCase()}</div>
          <div>
            <img src="image/${type}.png" alt="${type}" class="weather-card-icon">
            <div class="weather-card-temp">--°C</div>
            <div class="weather-card-conditions">Sample</div>
          </div>
        </div>
      `;
      
      weatherDiv.appendChild(card);
    });
  }
}

// Initialize weather service
const weatherService = new WeatherService();