// ============================================================
// Weather App - Vanilla JavaScript
// ============================================================

// 1. CONFIGURATION ------------------------------------------
// Paste your OpenWeatherMap API key here.
// NOTE: A key in frontend code is NOT secret (see README).
const API_KEY = "abc553e7b995027a5646b15b830bfc63";
const API_URL = "https://api.openweathermap.org/data/2.5/weather";

// Friendly messages shown to users (never raw technical errors)
const ERROR_MESSAGES = {
  EMPTY_INPUT: "Please enter a city name.",
  CITY_NOT_FOUND: "City not found. Please check the spelling and try again.",
  API_KEY_ERROR:
    "The app is not configured correctly. Please check the API key setup.",
  RATE_LIMIT: "Too many requests right now. Please wait a moment and try again.",
  SERVER_ERROR: "The weather service is having problems. Please try again later.",
  NETWORK_ERROR: "Network problem. Please check your internet connection.",
  INVALID_RESPONSE: "Received unexpected data from the weather service.",
  LOCATION_DENIED: "Location access was denied. You can search by city instead.",
  LOCATION_UNAVAILABLE: "Could not get your location. Please search by city instead.",
  LOCATION_UNSUPPORTED: "Your browser does not support location.",
  UNKNOWN: "Something went wrong. Please try again.",
};

// 2. DOM ELEMENTS -------------------------------------------
const searchForm = document.querySelector("#search-form");
const cityInput = document.querySelector("#city-input");
const searchBtn = document.querySelector("#search-btn");
const locationBtn = document.querySelector("#location-btn");

const loadingEl = document.querySelector("#loading");
const errorEl = document.querySelector("#error");
const weatherCard = document.querySelector("#weather-card");

const cityNameEl = document.querySelector("#city-name");
const iconEl = document.querySelector("#weather-icon");
const temperatureEl = document.querySelector("#temperature");
const conditionEl = document.querySelector("#condition");
const feelsLikeEl = document.querySelector("#feels-like");
const humidityEl = document.querySelector("#humidity");
const windEl = document.querySelector("#wind");
const pressureEl = document.querySelector("#pressure");
const visibilityEl = document.querySelector("#visibility");
const sunriseEl = document.querySelector("#sunrise");
const sunsetEl = document.querySelector("#sunset");

// 3. UI HELPER FUNCTIONS ------------------------------------
function showLoading() {
  loadingEl.classList.remove("hidden");
  searchBtn.disabled = true;
  locationBtn.disabled = true;
}

function hideLoading() {
  loadingEl.classList.add("hidden");
  searchBtn.disabled = false;
  locationBtn.disabled = false;
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.classList.remove("hidden");
  weatherCard.classList.add("hidden");
}

function clearError() {
  errorEl.textContent = "";
  errorEl.classList.add("hidden");
}

// 4. DATA CONVERSION HELPERS --------------------------------
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// "BD" -> "Bangladesh" (falls back to the code if not supported)
function getCountryName(countryCode) {
  try {
    const names = new Intl.DisplayNames(["en"], { type: "region" });
    return names.of(countryCode) || countryCode;
  } catch (error) {
    return countryCode;
  }
}

// Meters per second -> kilometers per hour
function msToKmh(speedMs) {
  return Math.round(speedMs * 3.6);
}

// Meters -> kilometers (one decimal place)
function metersToKm(meters) {
  return (meters / 1000).toFixed(1);
}

// Unix timestamp (UTC seconds) -> readable time in the CITY'S local time.
// timezoneOffset = seconds the city is ahead of/behind UTC (from the API).
function formatCityTime(unixSeconds, timezoneOffset) {
  const cityDate = new Date((unixSeconds + timezoneOffset) * 1000);
  return cityDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC", // we already added the offset manually
  });
}

// 5. API FUNCTIONS ------------------------------------------
// Sends the request and returns the parsed JSON.
// queryString examples: "q=Dhaka"  or  "lat=23.8&lon=90.4"
async function fetchWeather(queryString) {
  // Make sure the API key was actually set
  if (!API_KEY || API_KEY === "YOUR_API_KEY") {
    throw new Error("API_KEY_ERROR");
  }

  const url = `${API_URL}?${queryString}&units=metric&appid=${API_KEY}`;

  // fetch() sends the HTTP request. It only rejects on network failure.
  const response = await fetch(url);

  // Check the HTTP status code ourselves
  if (!response.ok) {
    if (response.status === 404) throw new Error("CITY_NOT_FOUND");
    if (response.status === 401) throw new Error("API_KEY_ERROR");
    if (response.status === 429) throw new Error("RATE_LIMIT");
    if (response.status >= 500) throw new Error("SERVER_ERROR");
    throw new Error("UNKNOWN");
  }

  // Convert the response body (JSON text) into a JavaScript object
  try {
    return await response.json();
  } catch (error) {
    throw new Error("INVALID_RESPONSE");
  }
}

// Pick only the values we need and convert units.
function extractWeatherData(data) {
  // Validate that the response has the shape we expect
  const isValid =
    data &&
    data.main &&
    data.wind &&
    data.sys &&
    Array.isArray(data.weather) &&
    data.weather.length > 0;

  if (!isValid) {
    throw new Error("INVALID_RESPONSE");
  }

  return {
    city: data.name,
    country: getCountryName(data.sys.country),
    temperature: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    windSpeed: msToKmh(data.wind.speed),
    visibility: metersToKm(data.visibility ?? 0),
    condition: capitalize(data.weather[0].description),
    iconUrl: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
    sunrise: formatCityTime(data.sys.sunrise, data.timezone),
    sunset: formatCityTime(data.sys.sunset, data.timezone),
  };
}

// 6. RENDER FUNCTION ----------------------------------------
function renderWeather(weather) {
  cityNameEl.textContent = `${weather.city}, ${weather.country}`;
  iconEl.src = weather.iconUrl;
  iconEl.alt = weather.condition;
  temperatureEl.textContent = `${weather.temperature}°C`;
  conditionEl.textContent = weather.condition;
  feelsLikeEl.textContent = `${weather.feelsLike}°C`;
  humidityEl.textContent = `${weather.humidity}%`;
  windEl.textContent = `${weather.windSpeed} km/h`;
  pressureEl.textContent = `${weather.pressure} hPa`;
  visibilityEl.textContent = `${weather.visibility} km`;
  sunriseEl.textContent = weather.sunrise;
  sunsetEl.textContent = weather.sunset;

  weatherCard.classList.remove("hidden");
}

// 7. MAIN FLOW ----------------------------------------------
// Runs the whole flow: loading -> fetch -> extract -> render -> error handling
async function getWeather(queryString) {
  clearError();
  showLoading();

  try {
    const data = await fetchWeather(queryString);
    const weather = extractWeatherData(data);
    renderWeather(weather);
  } catch (error) {
    // Log the technical error for the developer (console only)
    console.error("Weather error:", error);

    // Show a friendly message to the user
    if (error instanceof TypeError) {
      // fetch() throws a TypeError when the network fails
      showError(ERROR_MESSAGES.NETWORK_ERROR);
    } else {
      showError(ERROR_MESSAGES[error.message] || ERROR_MESSAGES.UNKNOWN);
    }
  } finally {
    // Runs whether the request succeeded or failed
    hideLoading();
  }
}

// 8. EVENT HANDLERS -----------------------------------------
function handleSearch(event) {
  event.preventDefault(); // stop the form from reloading the page

  const city = cityInput.value.trim();

  // Validate input
  if (city === "") {
    showError(ERROR_MESSAGES.EMPTY_INPUT);
    return;
  }

  getWeather(`q=${encodeURIComponent(city)}`);
}

function handleUseLocation() {
  if (!("geolocation" in navigator)) {
    showError(ERROR_MESSAGES.LOCATION_UNSUPPORTED);
    return;
  }

  clearError();
  showLoading();

  navigator.geolocation.getCurrentPosition(
    // Success: we got coordinates
    (position) => {
      const { latitude, longitude } = position.coords;
      getWeather(`lat=${latitude}&lon=${longitude}`);
    },
    // Failure: permission denied, timeout, etc.
    (error) => {
      hideLoading();
      if (error.code === error.PERMISSION_DENIED) {
        showError(ERROR_MESSAGES.LOCATION_DENIED);
      } else {
        showError(ERROR_MESSAGES.LOCATION_UNAVAILABLE);
      }
    }
  );
}

// 9. EVENT LISTENERS ----------------------------------------
// One "submit" listener handles BOTH the Search button click and Enter key
searchForm.addEventListener("submit", handleSearch);
locationBtn.addEventListener("click", handleUseLocation);