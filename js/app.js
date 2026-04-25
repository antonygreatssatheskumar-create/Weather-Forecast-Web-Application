/**
 * Main application entry point
 * Initializes the application
 */
document.addEventListener("DOMContentLoaded", () => {
  // Show default weather initially
  weatherService.showDefaultWeather();
  
  // Set current date
  uiController.updateCurrentDate();
  
  // Try to get user's location on initial load
  if (navigator.permissions) {
    navigator.permissions.query({ name: 'geolocation' }).then(result => {
      if (result.state === 'granted') {
        mapController.getCurrentLocation();
      }
    });
  }
  
  console.log("MyForecast application initialized");
});