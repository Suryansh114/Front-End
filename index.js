// SELECT ELEMENTS
const iconElement = document.querySelector(".weather-icon");
const tempElement = document.querySelector(".temperature-value p");
const descElement = document.querySelector(".temperature-description p");
const locationElement = document.querySelector(".location p");
const notificationElement = document.querySelector(".notification");
const loadingElement = document.getElementById("loading");
const cityInput = document.getElementById("city-input");

// WEATHER DATA OBJECT
const weather = {
    temperature: { unit: "celsius" }
};

const API_KEY = "8f7254c1134ffa9e2cddf7c1c7fec0dd";

// INIT: Get location weather if geolocation supported
if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(setPosition, showError);
} else {
    showNotification("Browser doesn't support Geolocation");
}

// SET USER POSITION
function setPosition(position) {
    const { latitude, longitude } = position.coords;
    getWeatherByCoords(latitude, longitude);
}

// SHOW ERROR
function showError(error) {
    showNotification(error.message);
}

// DISPLAY NOTIFICATION
function showNotification(message) {
    notificationElement.style.display = "block";
    notificationElement.innerHTML = `<p>${message}</p>`;
}

// FETCH WEATHER BY COORDINATES
async function getWeatherByCoords(lat, lon) {
    const api = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    await fetchWeather(api);
}

// FETCH WEATHER BY CITY NAME
async function getWeatherByCity() {
    const city = cityInput.value.trim();
    if (!city) return;

    const api = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    await fetchWeather(api);
}

// FETCH & PROCESS WEATHER DATA
async function fetchWeather(api) {
    loadingElement.style.display = "block";
    notificationElement.style.display = "none";

    try {
        const response = await fetch(api);
        const data = await response.json();

        if (data.cod !== 200) {
            showNotification(data.message);
            return;
        }

        // Populate weather data
        weather.temperature.value = Math.floor(data.main.temp);
        weather.description = data.weather[0].description;
        weather.iconId = data.weather[0].icon;
        weather.city = data.name;
        weather.country = data.sys.country;

        displayWeather();
    } catch (error) {
        showNotification("Failed to fetch weather data");
    } finally {
        loadingElement.style.display = "none";
    }
}

// DISPLAY TO UI
function displayWeather() {
    iconElement.innerHTML = `<img src="icons/${weather.iconId || "unknown"}.png" />`;
    tempElement.innerHTML = `${weather.temperature.value}°<span>${weather.temperature.unit === "celsius" ? "C" : "F"}</span>`;
    descElement.innerHTML = weather.description;
    locationElement.innerHTML = `${weather.city}, ${weather.country}`;
}

// CONVERT TO FAHRENHEIT
function celsiusToFahrenheit(temp) {
    return (temp * 9) / 5 + 32;
}

// TOGGLE °C/°F ON CLICK
tempElement.addEventListener("click", () => {
    if (weather.temperature.value === undefined) return;

    if (weather.temperature.unit === "celsius") {
        let fahrenheit = Math.floor(celsiusToFahrenheit(weather.temperature.value));
        tempElement.innerHTML = `${fahrenheit}°<span>F</span>`;
        weather.temperature.unit = "fahrenheit";
    } else {
        tempElement.innerHTML = `${weather.temperature.value}°<span>C</span>`;
        weather.temperature.unit = "celsius";
    }
});
// Allow Enter key to trigger city search
cityInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        getWeatherByCity();
    }
});
