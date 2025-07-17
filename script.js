const apiKey = "1444e1ddb7eefe262deb2ce6d16666b4";

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

async function getWeatherData() {
  const location = document.getElementById("userLocation").value.trim();

  if (!location) {
    return;
  }

  const savedRecentSearches = getRecentSearches();
  //add new search to recent search list options if not already exists
  if (
    savedRecentSearches.every(
      (search) => search.toLowerCase() !== location.toLowerCase()
    )
  ) {
    // add to recent search list
    saveLocationInRecent(location);

    const recentSelect = document.getElementById("recentSearch");
    const newOption = document.createElement("option");
    newOption.value = location;
    newOption.innerHTML = location;
    newOption.classList.add("text-black");
    recentSelect.appendChild(newOption);
  }

  const tempUnit = document.getElementById("tempUnit").value;

  const units = tempUnit === "C" ? "metric" : "imperial";

  const baseUrl = `https://api.openweathermap.org/data/2.5/forecast?appid=${apiKey}&units=${units}&q=${location}`;

  const res = await (await fetch(baseUrl)).json();

  const currentDetails = {
    name: res.city.name,
    temp: res.list[0].main.temp + unitsMap[units].temp,
    humidity: res.list[0].main.humidity + "%",
    wind: res.list[0].wind.speed + unitsMap[units].wind,
    sunrise: getTime(res.city.sunrise),
    sunset: getTime(res.city.sunset),
  };

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
    document.getElementById("userLocation").value = e.target.value;
    getWeatherData();
  });
}
onLoad();
