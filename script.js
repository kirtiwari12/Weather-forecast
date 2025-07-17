const apiKey = "1444e1ddb7eefe262deb2ce6d16666b4";
const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const weatherMap = {
  clear: { icon: "fa-sun", bgColor: "#fffb1ca8" },
  clouds: { icon: "fa-cloud", bgColor: "#009fff73" },
  rain: { icon: "fa-cloud-showers-heavy", bgColor: "#597c9ebd" },
  snow: { icon: "fa-snowflake", bgColor: "#ffffff73" },
  fog: { icon: "fa-smog", bgColor: "#e5e5e5c7" },
  night: { icon: "fa-moon", bgColor: "#00000073" },
  thunderstorm: { icon: "fa-cloud-bolt" },
  haze: { icon: "fa-smog", bgColor: "#e5e5e5c7" },
  mist: { icon: "fa-cloud-rain", bgColor: "#88c4ff9c" },
};

const unitsMap = {
  metric: {
    temp: "°C",
    wind: "m/s",
  },
  imperial: {
    temp: "°F",
    wind: "mph",
  },
};

function getTime(timestamp) {
  const date = new Date(timestamp * 1000);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${hours}:${minutes}`;
}

function getRecentSearches() {
  return JSON.parse(localStorage.getItem("recentSearch")) ?? [];
}

function saveLocationInRecent(location) {
  const recentList = getRecentSearches();
  recentList.push(location);
  localStorage.setItem("recentSearch", JSON.stringify(recentList));
  showRecentSearch();
}

function hideNoResult() {
  document.getElementById("noResult").classList.add("hidden");
  document.getElementById("noResult").classList.remove("noResultWrapper");
}

function showRecentSearch() {
  const recentSearchWrapper = document.getElementsByClassName(
    "recentSearchWrapper"
  )[0];
  recentSearchWrapper.classList.remove("hidden");
}

function updateLocationInURL(params) {
  const searchParams = new URLSearchParams(params);
  const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
  window.history.replaceState({}, "", newUrl);
}

async function getWeatherData(lat, lon) {
  const isCurrentLocation = lat !== undefined && lon !== undefined;
  const locationFromInput = document
    .getElementById("userLocation")
    .value.trim();

  if (!locationFromInput && !isCurrentLocation) {
    return;
  }

  const tempUnit = document.getElementById("tempUnit").value;
  const units = tempUnit === "C" ? "metric" : "imperial";
  let baseUrl = `https://api.openweathermap.org/data/2.5/forecast?appid=${apiKey}&units=${units}&`;

  if (isCurrentLocation) {
    baseUrl += `lat=${lat}&lon=${lon}`;
  } else {
    baseUrl += `q=${locationFromInput}`;
  }

  const res = await (await fetch(baseUrl)).json();

  const currentDetails = {
    name: res.city.name,
    temp: res.list[0].main.temp + unitsMap[units].temp,
    humidity: res.list[0].main.humidity + "%",
    wind: res.list[0].wind.speed + unitsMap[units].wind,
    sunrise: getTime(res.city.sunrise),
    sunset: getTime(res.city.sunset),
  };

  if (isCurrentLocation) {
    document.getElementById("userLocation").value = currentDetails.name;
  }

  const currentResultDiv = document.getElementById("currentResult");
  currentResultDiv.querySelector("h3").innerHTML = currentDetails.name;
  currentResultDiv.getElementsByClassName("temp")[0].innerHTML =
    currentDetails.temp;
  currentResultDiv.getElementsByClassName("wind")[0].innerHTML =
    currentDetails.wind;
  currentResultDiv.getElementsByClassName("humidity")[0].innerHTML =
    currentDetails.humidity;
  currentResultDiv.getElementsByClassName("sunrise/sunset")[0].innerHTML =
    currentDetails.sunrise + "/" + currentDetails.sunset;

  // hide no result message
  hideNoResult();
  document.getElementById("currentResult").classList.remove("hidden");

  // collect forecast data
  const forecastData = [];
  for (let i = 7; i < res.list.length; i += 8) {
    const dayData = res.list[i];

    const dayIndex = new Date(dayData.dt * 1000).getDay();
    const nextDay = {
      dayName: dayMap[dayIndex],
      temp: dayData.main.temp + unitsMap[units].temp,
      humidity: dayData.main.humidity + "%",
      wind: dayData.wind.speed + unitsMap[units].wind,
      weather: dayData.weather[0].main.toLowerCase(),
    };

    forecastData.push(nextDay);
  }

  // show forecast cards
  const forecastWrapper = document.getElementById("forecastWrapper");
  forecastWrapper.replaceChildren();

  for (let data of forecastData) {
    const weatherMapData = weatherMap[data.weather];
    const forecardCard = document.createElement("div");
    forecardCard.classList.add(
      "forecastCard",
      `bg-[${weatherMapData.bgColor}]`
    );

    // day name
    const day = document.createElement("p");
    day.innerHTML = data.dayName;
    forecardCard.appendChild(day);

    //icon
    const iconDiv = document.createElement("div");
    const icon = document.createElement("i");
    const iconName = weatherMapData.icon ?? "fa-sun";
    icon.classList.add("fa-solid", iconName);
    iconDiv.appendChild(icon);
    forecardCard.appendChild(iconDiv);

    // temp
    const temp = document.createElement("p");
    temp.innerHTML = `<i class="fa-solid fa-temperature-empty"></i> ${data.temp}`;
    forecardCard.appendChild(temp);

    // wind
    const wind = document.createElement("p");
    wind.innerHTML = `<i class="fa-solid fa-wind"></i> ${data.wind}`;
    forecardCard.appendChild(wind);

    // humidity
    const humidity = document.createElement("p");
    humidity.innerHTML = `<i class="fa-solid fa-droplet"></i> ${data.humidity}`;
    forecardCard.appendChild(humidity);

    forecastWrapper.appendChild(forecardCard);
  }

  updateLocationInURL({ location: currentDetails.name });

  const savedRecentSearches = getRecentSearches();
  //add new search to recent search list options if not already exists
  if (
    savedRecentSearches.every(
      (search) => search.toLowerCase() !== currentDetails.name.toLowerCase()
    )
  ) {
    // add to recent search list
    saveLocationInRecent(currentDetails.name);

    const recentSelect = document.getElementById("recentSearch");
    const newOption = document.createElement("option");
    newOption.value = currentDetails.name;
    newOption.innerHTML = currentDetails.name;
    newOption.classList.add("text-black");
    recentSelect.appendChild(newOption);
  }
}

function getCurrentLocation() {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      getWeatherData(lat, lon);
    },
    (error) => {
      console.error("Location error:", error);
      alert("Unable to get location. Please allow access.");
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
}

function onLoad() {
  const recentList = getRecentSearches();
  const recentSelect = document.getElementById("recentSearch");
  if (recentList.length > 0) {
    showRecentSearch();

    recentList.forEach((term) => {
      const newOption = document.createElement("option");
      newOption.value = term;
      newOption.innerHTML = term;
      newOption.classList.add("text-black");
      recentSelect.appendChild(newOption);
    });
  }

  recentSelect.addEventListener("change", (e) => {
    const textInput = document.getElementById("userLocation");
    const recentValue = e.target.value;

    if (textInput.value.trim() !== recentValue) {
      textInput.value = recentValue;
      getWeatherData();
    }
  });

  // add event onclick listener to use current location button
  document
    .getElementById("currentLocationBtn")
    .addEventListener("click", getCurrentLocation);

  // check if URL has the city, then fetch city data
  const searchParams = new URLSearchParams(window.location.search);
  const location = searchParams.get("location");
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  if (location) {
    document.getElementById("userLocation").value = location;
    getWeatherData();
  }
  if (lat && lon) {
    getWeatherData(lat, lon);
  }
}
onLoad();
