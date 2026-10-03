# Weather App 🌦️

A beginner-friendly weather app built with HTML, CSS, and vanilla JavaScript.
It fetches real, live weather data from the OpenWeatherMap API.

## Features

- Search weather by city name (button click or Enter key)
- "Use My Location" button (browser geolocation)
- City, country, temperature, condition, and weather icon
- Feels like, humidity, wind speed, pressure, visibility
- Sunrise and sunset in the city's local time
- Loading state while data is being fetched
- Friendly error messages (empty input, invalid city, network/API problems)
- Responsive design for mobile, tablet, and desktop

## Technologies Used

- HTML5
- CSS3 (Flexbox, Grid, media queries)
- JavaScript (fetch, async/await, try/catch, JSON, DOM)

## API Used

[OpenWeatherMap – Current Weather Data](https://openweathermap.org/current)

## How to Get an API Key

1. Create a free account at https://openweathermap.org
2. Verify your email
3. Go to your profile menu → **My API keys**
4. Copy your key

> New keys may take a few minutes to a couple of hours to activate.

## Where to Put the API Key

Open `js/script.js` and replace the placeholder:

```javascript
const API_KEY = "YOUR_API_KEY";
```

with your real key:

```javascript
const API_KEY = "abc123yourrealkey";
```

## How to Run

1. Download or clone this project.
2. Add your API key (see above).
3. Open `index.html` in your browser
   (or use the VS Code "Live Server" extension — recommended,
   because browser location features work best on `localhost`).

## ⚠️ Important: API Key Security

This is a frontend-only learning project, so the API key sits inside
browser JavaScript. **Anyone can view it** using browser DevTools, so it is
not truly secret. That is acceptable for learning with a free key.

In a real production app, API keys should be kept on a backend/server
(in environment variables), and the frontend should call your server, which
then calls the weather API.

Do not commit a real key to a public GitHub repository. Use the
placeholder in the committed version, or regenerate the key if exposed.

## Future Improvement Ideas

- Remember the last searched city using Local Storage
- Search history list
- Toggle between °C and °F
- 5-day forecast (using the forecast endpoint)
- Change background based on weather or day/night
- Debounced city suggestions while typing
- Move the API call to a backend to protect the key