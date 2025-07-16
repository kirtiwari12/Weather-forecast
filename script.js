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

async function getWeatherData() {
  const location = document.getElementById("userLocation").value;
  const tempUnit = document.getElementById("tempUnit").value;

  const units = tempUnit === "C" ? "metric" : "imperial";

  const baseUrl = `https://api.openweathermap.org/data/2.5/weather?appid=${apiKey}&units=${units}&q=${location}`;

  const res = await (await fetch(baseUrl)).json();

  console.log("response", res);

  const details = {
    name: res.name,
    temp: res.main.temp + unitsMap[units].temp,
    humidity: res.main.humidity + "%",
    wind: res.wind.speed + unitsMap[units].wind,
    sunrise: getTime(res.sys.sunrise),
    sunset: getTime(res.sys.sunset),
  };

  const currentWeatherDiv = document.getElementById("currentWeather");
  currentWeatherDiv.getElementsByClassName("temp")[0].innerHTML = details.temp;
  currentWeatherDiv.getElementsByClassName("wind")[0].innerHTML = details.wind;
  currentWeatherDiv.getElementsByClassName("humidity")[0].innerHTML =
    details.humidity;
  currentWeatherDiv.getElementsByClassName("sunrise/sunset")[0].innerHTML =
    details.sunrise + "/" + details.sunset;

  // hide no result message
  document.getElementById("noResult").classList.add("hidden");
  document.getElementById("currentResult").classList.remove("hidden");
}
