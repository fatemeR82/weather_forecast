import { API_KEY, AUTO_CLOSE_DURATION } from "./config.js";
import { showToast, shuffleArray } from "./utils.js";
import { getWeatherForCities, convertToCelsius } from "./weather-service.js";

let hottestCity;
let hottestTemperature;
let coldestCity;
let coldestTemperature;
let averageWeather = 0;
let citiesSelect = [];
let isInSelectionMode = false;

export function initCityList() {
  loadCities(false);
  setupEventListeners();
}

function setupEventListeners() {
  const statisticalReportBtn = document.getElementById("citiesReport");
  if (statisticalReportBtn) {
    statisticalReportBtn.addEventListener("click", handleReportButtonClick);
  }
}

function handleReportButtonClick() {
  const statisticalReportBtn = document.getElementById("citiesReport");

  if (!isInSelectionMode) {
    isInSelectionMode = true;
    statisticalReportBtn.textContent = "View report";
    loadCities(true);
  } else {
    citiesSelect = Array.from(
      document.querySelectorAll(".select-city:checked")
    ).map((input) => input.value);

    if (citiesSelect.length > 0) {
      getWeather();
    } else {
      showToast("Please select at least one city.");
    }
  }
}

async function loadCities(check) {
  try {
    const response = await fetch("cities.json");
    if (!response.ok) {
      throw new Error("Error loading city information");
    }

    const data = await response.json();
    const randomizedProducts = shuffleArray(data.cities);

    if (!check) {
      renderCities(randomizedProducts);
    } else {
      CitySelectionMode(randomizedProducts);
    }
  } catch (error) {
    console.error("Error:", error);
    const citiesGrid = document.querySelector(".city-grid");
    if (citiesGrid) {
      citiesGrid.innerHTML =
        '<div class="error-message"><i class="fas fa-exclamation-circle"></i><p>Error loading cities</p></div>';
    }
  }
}

function renderCities(cities) {
  const citiesGrid = document.querySelector(".city-grid");
  if (!citiesGrid) return;

  citiesGrid.innerHTML = "";

  cities.forEach((city) => {
    const cityElement = document.createElement("div");
    cityElement.className = "city";
    cityElement.innerHTML = `
      <a href="city.html?id=${city.name}" class="city-link">
        <div class="city-image-container">
          <div class="city-image-wrapper">
            <img src="${city.image}" alt="${city.name}" class="city-image">
          </div>
        </div>
        <div class="city-content">
          <h3>${city.name}</h3>
        </div>
      </a>
    `;
    citiesGrid.appendChild(cityElement);
  });
}

function CitySelectionMode(cities) {
  const citiesGrid = document.querySelector(".city-grid");
  if (!citiesGrid) return;

  citiesGrid.innerHTML = "";

  cities.forEach((city) => {
    const cityElement = document.createElement("div");
    cityElement.className = "city city-selection-mode";
    cityElement.innerHTML = `
      <div class="city-image-container">
        <div class="city-image-wrapper">
          <img src="${city.image}" alt="${city.name}" class="city-image">
          <input type="checkbox" name="city" value="${city.name}" class="select-city"/>
        </div>
      </div>
      <div class="city-content">
        <h3>${city.name}</h3>
      </div>
    `;
    citiesGrid.appendChild(cityElement);
  });
}

async function getWeather() {
  try {
    const results = await getWeatherForCities(citiesSelect);

    results.forEach((data, index) => {
      let temp = convertToCelsius(data.main.temp);
      averageWeather += temp;

      if (index === 0) {
        hottestCity = citiesSelect[index];
        coldestCity = citiesSelect[index];
        hottestTemperature = temp;
        coldestTemperature = temp;
      } else {
        if (temp > hottestTemperature) {
          hottestCity = citiesSelect[index];
          hottestTemperature = temp;
        }
        if (temp < coldestTemperature) {
          coldestCity = citiesSelect[index];
          coldestTemperature = temp;
        }
      }
    });

    averageWeather /= citiesSelect.length;
    showReport();
  } catch (error) {
    console.error("Error:", error);
    showToast("Error fetching weather data. Please try again.");
  }
}

function handleOutsideClick(event) {
  const modal = document.getElementById("city-weather-report-modal");
  if (event.target == modal) {
    modal.style.display = "none";
    resetToInitialState();
    window.removeEventListener("click", handleOutsideClick);
  }
}

function showReport() {
  const result = document.getElementById("result");
  result.innerHTML = "";
  result.innerHTML = `
    <div class="weather-report">
      <div class="report-item">
        <h3>hottestCity:</h3>
        <p>${hottestCity} (${hottestTemperature}°C)</p>
      </div>
      <div class="report-item">
        <h3>coldestCity:</h3>
        <p>${coldestCity} (${coldestTemperature}°C)</p>
      </div>
      <div class="report-item">
        <h3>averageWeather:</h3>
        <p>${averageWeather.toFixed(1)}°C</p>
      </div>
    </div>`;

  const modal = document.getElementById("city-weather-report-modal");
  const closeBtn = document.querySelector(".modal-close");
  modal.style.display = "block";

  window.removeEventListener("click", handleOutsideClick);
  window.addEventListener("click", handleOutsideClick);

  setTimeout(() => {
    modal.style.display = "none";
    resetToInitialState();
    window.removeEventListener("click", handleOutsideClick);
  }, AUTO_CLOSE_DURATION);

  closeBtn.addEventListener("click", function () {
    modal.style.display = "none";
    resetToInitialState();
    window.removeEventListener("click", handleOutsideClick);
  });
}

function resetToInitialState() {
  isInSelectionMode = false;
  document.getElementById("citiesReport").textContent = "Statistical report";
  hottestCity = undefined;
  hottestTemperature = undefined;
  coldestCity = undefined;
  coldestTemperature = undefined;
  averageWeather = 0;
  citiesSelect = [];
  document.getElementById("result").innerHTML = "";
  loadCities(false);
}

document.addEventListener("DOMContentLoaded", initCityList);
