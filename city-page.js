let slideIndex;
const apiKey = "a83839a38ef75ebd8f1fbff9d737a47a";
let temperature;
let icon;
const kelvin = 273.15;

document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const cityId = urlParams.get("id");
  loadCityData(cityId);
});

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
    let apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city.name}&appid=${apiKey}`;

    fetch(apiUrl)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Network response was not ok.");
        }
      })
      .then((data) => {
        temperature = Math.floor(data.main.temp - kelvin);
        icon = data.weather[0].main;
        renderCityDetail(city);
      })
      .catch((error) => {
        console.error("There was a problem fetching weather data:", error);
      });

    document.title = `${city.name} | weather`;
  } catch (error) {
    console.error("ERRoR", error);
    showCityError("Error loading information");
  }
}

function renderCityDetail(city) {
  const cityDetailSection = document.getElementById("city-detail");
  cityDetailSection.innerHTML = `
      <h2>${city.name}</h2>
      <div class="city-detail-images" style="display:flex; opacity:1;">
        <div class="slideshow-container">
          <div class="mySlides fade">
            <img src="${city.images[0]}" alt="${city.name}" style="width:100%">
          </div>
          <div class="mySlides fade">
            <img src="${city.images[1]}" alt="${city.name}" style="width:100%">
          </div>
          <div class="mySlides fade">
            <img src="${city.images[2]}" alt="${city.name}" style="width:100%">
          </div>
          <div class="mySlides fade">
            <img src="${city.images[3]}" alt="${city.name}" style="width:100%">
          </div>
        </div>
        <a class="prev">&#10094;</a>
        <a class="next">&#10095;</a>
      </div> 
 
      <div style="text-align:center">
        <span class="dot" onclick="currentSlide(1)"></span>
        <span class="dot" onclick="currentSlide(2)"></span>
        <span class="dot" onclick="currentSlide(3)"></span>
        <span class="dot" onclick="currentSlide(3)"></span>
      </div>
      <p>${temperature}°C</p>
      <p> ${icon}</p>
           `;
  slideIndex = 1;
  showSlides(slideIndex);

  document
    .querySelector(".prev")
    .addEventListener("click", () => plusSlides(-1));
  document
    .querySelector(".next")
    .addEventListener("click", () => plusSlides(1));

  const dots = document.querySelectorAll(".dot");
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => currentSlide(index + 1));
  });
  setInterval(() => plusSlides(1), 3000);
}

function showCityError(message) {
  const cityDetailSection = document.getElementById("city-detail");
  cityDetailSection.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
            <a href="index0.html" class="button">Return to home page</a>
        </div>
    `;
}
function plusSlides(n) {
  showSlides((slideIndex += n));
}

function currentSlide(n) {
  showSlides((slideIndex = n));
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  let dots = document.getElementsByClassName("dot");
  if (n > slides.length) {
    slideIndex = 1;
  }
  if (n < 1) {
    slideIndex = slides.length;
  }
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex - 1].style.display = "block";
  dots[slideIndex - 1].className += " active";
}
