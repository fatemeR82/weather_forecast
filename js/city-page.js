import { AUTO_CLOSE_DURATION } from "./config.js";
import { getWeatherForCity, convertToCelsius } from "./weather-service.js";

let slideIndex;
let temperature;
let icon;
let slideInterval;

export function initCityDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const cityId = urlParams.get("id");
  if (cityId) {
    loadCityData(cityId);
  } else {
    showCityError("No city specified");
  }
}

async function loadCityData(cityId) {
  try {
    const response = await fetch("cities.json");
    if (!response.ok) {
      throw new Error("Error loading information");
    }

    const data = await response.json();
    const city = data.cities.find((c) => c.name === cityId);

    if (!city) {
      showCityError("The desired city was not found!");
      return;
    }

    try {
      const weatherData = await getWeatherForCity(city.name);
      temperature = convertToCelsius(weatherData.main.temp);
      icon = weatherData.weather[0].main;
      renderCityDetail(city);
    } catch (error) {
      console.error("There was a problem fetching weather data:", error);
      renderCityDetail(city, true);
    }

    document.title = `${city.name} | weather`;
  } catch (error) {
    console.error("ERROR:", error);
    showCityError("Error loading information");
  }
}

function renderCityDetail(city, weatherError = false) {
  const cityDetailSection = document.getElementById("city-detail");

  const slidesHTML = city.images
    .map(
      (image) => `
    <div class="mySlides fade">
      <img src="${image}" alt="${city.name}" style="width:100%">
    </div>
  `
    )
    .join("");

  const dotsHTML = city.images
    .map(
      (_, index) => `
    <span class="dot" data-index="${index + 1}"></span>
  `
    )
    .join("");

  cityDetailSection.innerHTML = `
    <h2>${city.name}</h2>
    <div class="city-detail-images" style="display:flex; opacity:1;">
      <div class="slideshow-container">
        ${slidesHTML}
        <a class="prev">&#10094;</a>
        <a class="next">&#10095;</a>
      </div>
    </div>
    <div style="text-align:center">
      ${dotsHTML}
    </div>
    <p>${weatherError ? "Weather data not available" : `${temperature}°C`}</p>
    <p>${weatherError ? "" : icon}</p>
  `;

  slideIndex = 1;
  showSlides(slideIndex);
  setupSlideshow();
}

function showCityError(message) {
  const cityDetailSection = document.getElementById("city-detail");
  cityDetailSection.innerHTML = `
    <div class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      <p>${message}</p>
      <a href="index.html" class="button">Return to home page</a>
    </div>
  `;
}

function setupSlideshow() {
  document
    .querySelector(".prev")
    .addEventListener("click", () => plusSlides(-1));
  document
    .querySelector(".next")
    .addEventListener("click", () => plusSlides(1));

  const dots = document.querySelectorAll(".dot");
  dots.forEach((dot) => {
    const index = parseInt(dot.dataset.index);
    dot.addEventListener("click", () => currentSlide(index));
  });

  clearInterval(slideInterval);
  slideInterval = setInterval(() => plusSlides(1), 3000);
}

function plusSlides(n) {
  showSlides((slideIndex += n));
}

function currentSlide(n) {
  showSlides((slideIndex = n));
}

function showSlides(n) {
  const slides = document.getElementsByClassName("mySlides");
  const dots = document.getElementsByClassName("dot");

  if (n > slides.length) {
    slideIndex = 1;
  }
  if (n < 1) {
    slideIndex = slides.length;
  }

  for (let i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (let i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }

  slides[slideIndex - 1].style.display = "block";
  dots[slideIndex - 1].className += " active";
}

document.addEventListener("DOMContentLoaded", initCityDetail);
