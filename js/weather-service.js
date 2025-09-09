import { API_KEY, KELVIN_OFFSET } from "./config.js";

export async function getWeatherForCities(cities) {
  return await Promise.all(
    cities.map((city) =>
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`
      ).then((res) => res.json())
    )
  );
}

export async function getWeatherForCity(cityName) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}`;
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error("Network response was not ok.");
  }
  return await response.json();
}

export function convertToCelsius(kelvinTemp) {
  return Math.floor(kelvinTemp - KELVIN_OFFSET);
}
