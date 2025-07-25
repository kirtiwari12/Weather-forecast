const apiKey = "1444e1ddb7eefe262deb2ce6d16666b4";
const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const weatherMap = {
  clear: {
    icon: "fa-sun",
    bgColor: "var(--weather-clear)",
    bgImage: "clear.gif",
  },
  clouds: {
    icon: "fa-cloud",
    bgColor: "var(--weather-clouds)",
    bgImage: "clouds.gif",
  },
  rain: {
    icon: "fa-cloud-showers-heavy",
    bgColor: "var(--weather-rain)",
    bgImage: "rain.gif",
  },
  snow: {
    icon: "fa-snowflake",
    bgColor: "var(--weather-snow)",
    bgImage: "snow.gif",
  },
  fog: {
    icon: "fa-smog",
    bgColor: "var(--weather-fog)",
    bgImage: "fog.gif",
  },
  night: {
    icon: "fa-moon",
    bgColor: "var(--weather-night)",
    bgImage: "night.gif",
  },
  thunderstorm: {
    icon: "fa-cloud-bolt",
    bgColor: "var(--weather-thunderstorm)",
    bgImage: "thunderstorm.gif",
  },
  haze: {
    icon: "fa-smog",
    bgColor: "var(--weather-haze)",
    bgImage: "haze.gif",
  },
  mist: {
    icon: "fa-cloud-rain",
    bgColor: "var(--weather-mist)",
    bgImage: "mist.gif",
  },
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
  const noResultDiv = document.getElementById("noResult");
  noResultDiv.classList.add("hidden");
  noResultDiv.classList.remove("noResultWrapper");
  document.getElementById("currentResult").classList.remove("hidden");
}

function handleError(error) {
  console.log("API failed:", error);
  showErrorMessage("Location not found");
}

function showErrorMessage(message) {
  document.getElementsByTagName("body")[0].style.backgroundImage = "";
  const noResultDiv = document.getElementById("noResult");
  noResultDiv.classList.remove("hidden");
  noResultDiv.classList.add("noResultWrapper");
  noResultDiv.getElementsByTagName("h3")[0].innerHTML = message;
  document.getElementById("currentResult").classList.add("hidden");
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
    updateLocationInURL({});
    showErrorMessage("Search for a location to see its weather");
    return;
  }
  if (locationFromInput && !isCurrentLocation) {
    updateLocationInURL({ location: locationFromInput });
  }

  const tempUnit = document.getElementById("tempUnit").value;
  const units = tempUnit === "C" ? "metric" : "imperial";
  let baseUrl = `https://api.openweathermap.org/data/2.5/forecast?appid=${apiKey}&units=${units}&`;

  if (isCurrentLocation) {
    baseUrl += `lat=${lat}&lon=${lon}`;
  } else {
    baseUrl += `q=${locationFromInput}`;
  }

  let res;
  try {
    res = await (await fetch(baseUrl)).json();
    if (res.cod !== "200") {
      handleError();
      return;
    }
  } catch (error) {
    handleError();
    return;
  }

  const currentDetails = {
    name: res.city.name,
    temp: res.list[0].main.temp + unitsMap[units].temp,
    humidity: res.list[0].main.humidity + "%",
    wind: res.list[0].wind.speed + unitsMap[units].wind,
    sunrise: getTime(res.city.sunrise),
    sunset: getTime(res.city.sunset),
    weather: res.list[0].weather[0].main.toLowerCase(),
  };

  document.getElementsByTagName("body")[0].style.backgroundImage = `url(./img/${
    weatherMap[currentDetails.weather].bgImage
  })`;

  if (isCurrentLocation) {
    document.getElementById("userLocation").value = currentDetails.name;
  }

  const currentResultDiv = document.getElementById("currentResult");
  currentResultDiv.querySelector("h3").innerHTML = currentDetails.name;
  currentResultDiv.getElementsByClassName("tempValue")[0].innerHTML =
    currentDetails.temp;
  currentResultDiv.getElementsByClassName("windValue")[0].innerHTML =
    currentDetails.wind;
  currentResultDiv.getElementsByClassName("humidityValue")[0].innerHTML =
    currentDetails.humidity;
  currentResultDiv.getElementsByClassName("sunrise/sunsetValue")[0].innerHTML =
    currentDetails.sunrise + "/" + currentDetails.sunset;

  // hide no result message
  hideNoResult();

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
  document.getElementById("recentSearch").value = "";
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

function handleSearchBtnClick() {
  document.getElementById("recentSearch").value = "";
  getWeatherData();
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

  const textInput = document.getElementById("userLocation");

  textInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleSearchBtnClick();
    }
  });

  recentSelect.addEventListener("change", (e) => {
    const recentValue = e.target.value;

    if (textInput.value.trim() !== recentValue) {
      textInput.value = recentValue;
      getWeatherData();
    }
  });

  // add event listener to search when search button is clicked
  document
    .getElementById("searchBtn")
    .addEventListener("click", handleSearchBtnClick);

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
