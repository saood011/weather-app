const proxy = "https://cors-anywhere.herokuapp.com/";

const searchRequest = () => {
  searchItem = document.getElementById("searchInput").value || "berlin";
  const apiSearch = `https://api.openweathermap.org/data/2.5/weather?q=${searchItem}&APPID=1e3ea3790d993992bae81ae76f408156&units=metric`;
  fetch(apiSearch)
    .then(searchData => {
      return searchData.json();
    })
    .then(searchResult => {
      console.log(searchResult);
      document.querySelector(".modal-title").innerHTML =
        searchResult.name + "  ";
      document.querySelector(".modal-description").innerHTML =
        "&nbsp; " + searchResult.weather[0].main;
      document.querySelector("#modalTemp").innerHTML =
        searchResult.main.temp + "&#176" + " C";
      document.querySelector("#modal-max-temp").innerHTML =
        searchResult.main.temp_max + "&#176" + " C";
      document.querySelector("#modal-min-temp").innerHTML =
        searchResult.main.temp_min + "&#176" + " C";

      document.querySelector("#modal-humidity").innerHTML =
        searchResult.main.humidity + "%";
      document.querySelector("#modal-country").innerHTML =
        searchResult.sys.country;
      const searchdt = new Date(
        (searchResult.timezone + searchResult.dt) * 1000
      );
      document.querySelector("#modal-date").innerHTML = searchdt.toUTCString();
      document.querySelector("#modal-img").src =
        "http://openweathermap.org/img/w/" +
        searchResult.weather[0].icon +
        ".png";
    });
};
window.addEventListener("load", () => {
  let long;
  let lat;
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      long = position.coords.longitude;
      lat = position.coords.latitude;
      const api = `${proxy}https://api.darksky.net/forecast/987c6b10a913f6d355b4e2518601487b/${lat},${long}`;
      const api2 = `https://api.openweathermap.org/data/2.5/weather?q=dusseldorf&APPID=1e3ea3790d993992bae81ae76f408156&units=metric`;
      fetch(api2)
        .then(data2 => {
          return data2.json();
        })
        .then(finaldata2 => {
          console.log(finaldata2);
          document.getElementById("zone").textContent = finaldata2.name;
        });
      fetch(api)
        .then(data => {
          return data.json();
        })
        .then(finalData => {
          console.log(finalData);
          let celsius = Math.floor(
            ((finalData.currently.temperature - 32) * 5) / 9
          );
          let feels = Math.round(
            ((finalData.currently.apparentTemperature - 32) * 5) / 9
          );
          let cdt = new Date(finalData.currently.time * 1000)
            .toString()
            .split(" ");
          setTimeout(() => {
            document.querySelector("#icon").src =
              "./icons/SVG/" + finalData.currently.icon + ".svg";
          }, 3000);

          document.querySelector("#temp").innerHTML = celsius + "&deg;" + "C";
          //document.querySelector('#zone').textContent = finalData.timezone;
          document.querySelector("#sum").textContent =
            finalData.currently.summary +
            "  " +
            Math.round(finalData.currently.precipProbability * 100) +
            "%";
          document.querySelector("#time").innerHTML =
            "Realfeel&reg; : " + feels + "&deg;" + "C";
          document.querySelector("#sum-day").innerHTML =
            "<b>Today's forecast:</b> " + finalData.hourly.summary;
          document.querySelector("#footer").innerHTML =
            'copyright &copy; SA7 Inc. 2019 Designed and Engineered by M Saood A <span id="update"> Last updated on: ' +
            +cdt[2] +
            "-" +
            cdt[1] +
            ", " +
            cdt[4] +
            "</span>";

          //Handlebar temp for weekly and hourly forecast//
          let hourly = finalData.hourly; // access hourly obj
          console.log(hourly);
          let daily = finalData.daily; // access daily obj with array;
          console.log(daily);

          var days = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday"
          ];

          // Updating time format in API.
          for (let j in hourly.data) {
            let hourlyTime = new Date(hourly.data[j].time * 1000);
            hourly.data[j].time =
              hourlyTime.getHours() +
              ":" +
              hourlyTime.getMinutes() +
              "0" +
              " " +
              days[hourlyTime.getDay()] +
              " " +
              hourlyTime.getDate() +
              "/" +
              (hourlyTime.getMonth() + 1);

            let hourlyTemp = Math.round(
              ((hourly.data[j].temperature - 32) * 5) / 9
            );
            hourly.data[j].temperature = hourlyTemp + "°" + "C";

            let rain = Math.round(hourly.data[j].precipProbability * 100) + "%";
            hourly.data[j].precipProbability = rain;
          }

          // Updating date format from timestamp to standard for each obj
          for (let i in daily.data) {
            let dailyDate = new Date(daily.data[i].time * 1000);
            daily.data[i].time =
              dailyDate.getDate() +
              "-" +
              (dailyDate.getMonth() + 1) +
              "-" +
              dailyDate.getFullYear() +
              ", " +
              days[dailyDate.getDay()];

            //Converting tempHigh F to C degree from API
            let dailyTempHigh = Math.round(
              ((daily.data[i].temperatureHigh - 32) * 5) / 9
            );
            daily.data[i].temperatureHigh = dailyTempHigh + "°" + "C";

            //Converting tempLow F to C degree from API
            let dailyTempLow = Math.round(
              ((daily.data[i].temperatureLow - 32) * 5) / 9
            );
            daily.data[i].temperatureLow = dailyTempLow + "°" + "C";

            let rainWeekly =
              Math.round(daily.data[i].precipProbability * 100) + "%";
            daily.data[i].precipProbability = rainWeekly;
          }

          //Handlerbar compiler for hourly forecast
          $(document).ready(function() {
            var WeekTemp = $("#myTemplate-hourly").html();
            var hourlyRender = Handlebars.compile(WeekTemp);

            $("#content").html(hourlyRender(hourly));
          });

          //Handlebar template compiler for weekly forecast
          $(document).ready(function() {
            var libTemp = $("#myTemplate").html();
            var dailyrender = Handlebars.compile(libTemp);

            $("#hourly-content").html(dailyrender(daily));
          });
        });
    });
  }
});
