/**
 * UI Controller
 * Handles UI interactions and animations
 */
class UIController {
  constructor() {
    this.initializeEventListeners();
    this.isDarkMode = false;
    this.checkPreferredTheme();
  }
  
  /**
   * Set up event listeners
   */
  initializeEventListeners() {
    // Search button
    document.getElementById("search-btn").addEventListener("click", () => {
      const location = document.getElementById("search").value.trim();
      if (location) {
        mapController.searchByLocation(location);
      }
    });
    
    // Current location button
    document.getElementById("current-location-btn").addEventListener("click", () => {
      mapController.getCurrentLocation();
    });
    
    // Search input events
    const searchInput = document.getElementById("search");
    const autocompleteList = document.getElementById("autocomplete-list");
    
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const location = searchInput.value.trim();
        if (location) {
          mapController.searchByLocation(location);
          autocompleteList.style.display = "none";
        }
      }
    });
    
    searchInput.addEventListener("input", this.handleSearchInput);
    
    // Clear search button
    document.getElementById("clear-search").addEventListener("click", () => {
      searchInput.value = "";
      autocompleteList.style.display = "none";
      document.getElementById("clear-search").style.opacity = "0";
    });
    
    // Close details button
    document.getElementById("close-details").addEventListener("click", () => {
      this.hideWeatherDetails();
    });
    
    // Theme toggle
    document.getElementById("theme-switch").addEventListener("change", () => {
      this.toggleTheme();
    });
    
    // Click outside autocomplete to close it
    document.addEventListener("click", (e) => {
      if (!searchInput.contains(e.target) && !autocompleteList.contains(e.target)) {
        autocompleteList.style.display = "none";
      }
    });
  }
  
  /**
   * Handle search input and autocomplete
   */
  handleSearchInput = debounce(function() {
    const input = document.getElementById("search").value;
    const list = document.getElementById("autocomplete-list");
    
    // Show clear button if input has text
    document.getElementById("clear-search").style.opacity = input ? "1" : "0";
    
    list.innerHTML = "";
    
    if (input.length < 3) {
      list.style.display = "none";
      return;
    }
    
    fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${input}&limit=5&apiKey=${CONFIG.geoapifyKey}`)
      .then(res => res.json())
      .then(data => {
        if (data.features && data.features.length > 0) {
          list.style.display = "block";
          
          data.features.forEach(place => {
            const div = document.createElement("div");
            div.textContent = place.properties.formatted;
            div.addEventListener("click", () => {
              document.getElementById("search").value = place.properties.formatted;
              list.style.display = "none";
              const lat = place.geometry.coordinates[1];
              const lon = place.geometry.coordinates[0];
              mapController.map.setView([lat, lon], 13);
              mapController.setMarker(lat, lon);
              weatherService.getWeather(lat, lon);
            });
            list.appendChild(div);
          });
        } else {
          list.style.display = "none";
        }
      })
      .catch(() => {
        list.style.display = "none";
      });
  }, 300);
  
  /**
   * Show loader
   */
  showLoader() {
    document.getElementById("loader").style.display = "flex";
  }
  
  /**
   * Hide loader
   */
  hideLoader() {
    document.getElementById("loader").style.display = "none";
  }
  
  /**
   * Show weather overview
   */
  showWeatherOverview() {
    const overview = document.querySelector(".weather-overview");
    overview.classList.add("show");
  }
  
  /**
   * Update current date
   */
  updateCurrentDate() {
    const dateElement = document.getElementById("current-date");
    const now = new Date();
    dateElement.textContent = now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }
  
  /**
   * Show weather details
   */
  showWeatherDetails() {
    document.getElementById("weather-details").classList.add("show");
  }
  
  /**
   * Hide weather details
   */
  hideWeatherDetails() {
    document.getElementById("weather-details").classList.remove("show");
  }
  
  /**
   * Show error toast
   * @param {string} message - Error message
   */
  showError(message) {
    const toast = document.getElementById("error-toast");
    const messageEl = document.getElementById("error-message");
    
    messageEl.textContent = message;
    toast.classList.add("show");
    
    // Hide after 5 seconds
    setTimeout(() => {
      toast.classList.remove("show");
    }, 5000);
  }
  
  /**
   * Toggle theme between light and dark
   */
  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle("dark-theme", this.isDarkMode);
    
    // Save preference
    localStorage.setItem("darkMode", this.isDarkMode);
  }
  
  /**
   * Check user's preferred theme
   */
  checkPreferredTheme() {
    // Check local storage first
    const storedTheme = localStorage.getItem("darkMode");
    
    if (storedTheme !== null) {
      this.isDarkMode = storedTheme === "true";
    } else {
      // Check system preference
      this.isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    
    // Apply theme
    document.body.classList.toggle("dark-theme", this.isDarkMode);
    document.getElementById("theme-switch").checked = this.isDarkMode;
  }
}

/**
 * Debounce function to limit how often a function is called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

/**
 * Toggle about modal
 */
function toggleAboutModal() {
  const modal = document.getElementById("about-modal");
  if (modal.style.display === "block") {
    modal.style.display = "none";
  } else {
    modal.style.display = "block";
  }
}

// Initialize UI controller
const uiController = new UIController();