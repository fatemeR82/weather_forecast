const apiKey = "a83839a38ef75ebd8f1fbff9d737a47a";
let hottestCity;
let hottestTemperature;
let coldestCity;
let coldestTemperature;
let averageWeather = 0;
let citiesSelect = [];
let isInSelectionMode = false;

document.addEventListener("DOMContentLoaded", function () {
  loadCities(false);
  const statisticalReportBtn = document.getElementById("citiesReport");
  if (statisticalReportBtn) {
    statisticalReportBtn.addEventListener("click", function () {
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
    });
  }
});
function showToast(message, duration = 3000) {
  const existingToast = document.querySelector(".toast-notification");
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement("div");
  toast.className = "toast-notification";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
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
      const randomizedProducts = shuffleArray(data.cities);
      renderCities(randomizedProducts);
    } else {
      CitySelectionMode(randomizedProducts, data);
    }
  } catch (error) {
    console.error("Error:", error);
    const citiesGrid = document.querySelector(".city-grid");
    citiesGrid.innerHTML =
      '<div class="error-message"><i class="fas fa-exclamation-circle"></i><p>Error loading cities</p></div>';
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
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function CitySelectionMode(cities) {
  const citiesGrid = document.querySelector(".city-grid");
  if (!citiesGrid) return;

  citiesGrid.innerHTML = "";

  cities.forEach((city) => {
    const cityElement = document.createElement("div");
    cityElement.className = "city";
    cityElement.innerHTML = `
          <label>
            <input type="checkbox" name="city" value="${city.name}" class="select-city""/>
                <div class="city-image-container">
                    <div class="city-image-wrapper">
                        <img src="${city.image}" alt="${city.name}" class="city-image">
                    </div>
                </div>
                <div class="city-content">
                    <h3>${city.name}</h3>
                </div>
          </label>
        `;
    citiesGrid.appendChild(cityElement);
  });
}
async function getWeather() {
  let results = await Promise.all(
    citiesSelect.map((city) =>
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`
      ).then((res) => res.json())
    )
  );

  results.forEach((data, index) => {
    let temp = Math.floor(data.main.temp - 273.15);
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
}

function showReport() {
  const result = document.getElementById("result");
  result.innerHTML = "";
  result.innerHTML = `
     <div class="weather-report">
        <div class="report-item">
          <h3>گرم‌ترین شهر:</h3>
          <p>${hottestCity} (${hottestTemperature}°C)</p>
        </div>
        <div class="report-item">
          <h3>سردترین شهر:</h3>
          <p>${coldestCity} (${coldestTemperature}°C)</p>
        </div>
        <div class="report-item">
          <h3>میانگین دما:</h3>
          <p>${averageWeather.toFixed(1)}°C</p>
        </div>
      </div>`;

  const modal = document.getElementById("city-weather-report-modal");
  const closeBtn = document.querySelector(".modal-close");
  modal.style.display = "block";

  setTimeout(() => {
    modal.style.display = "none";
    resetToInitialState();
  }, 4000);

  closeBtn.addEventListener("click", function () {
    modal.style.display = "none";
    resetToInitialState();
  });

  window.addEventListener("click", function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
      resetToInitialState();
      window.removeEventListener("click", handleOutsideClick);
    }
  });
}
function resetToInitialState() {
  isInSelectionMode = false;
  document.getElementById("citiesReport").textContent = "Statistical report";
  hottestCity = 0;
  hottestTemperature = 0;
  coldestCity = 0;
  coldestTemperature = 0;
  averageWeather = 0;
  citiesSelect = [];
  result.innerHTML = "";
  loadCities(false);
}
