const GOOGLE_GEOCODING_URL = 'https://maps.googleapis.com/maps/api/geocode/json?';
const SUN_TIME_URL = 'https://api.sunrise-sunset.org/json?';
const OPENWEATHER_URL = 'https://api.openweathermap.org/data/2.5/forecast?';
const GEOCODING_API_KEY = 'AIzaSyCURxb9nsZKOIeFoWRCA_rBMbzprn78-u0';
const OPENWEATHER_API_KEY = '97298e560c6b1c04128a3ba4ac01a690';
let count = 0;
let weekday = new Array(7); weekday[0] = "Sunday"; weekday[1] = "Monday"; weekday[2] = "Tuesday"; weekday[3] = "Wednesday"; weekday[4] = "Thursday"; weekday[5] = "Friday"; weekday[6] = "Saturday";

//function to get data from Google Geocoding API
function getGeocodingData(searchInput) {
	
	let query = {
		address: searchInput,
		key: GEOCODING_API_KEY
	}
		$.getJSON(GOOGLE_GEOCODING_URL, query, function(data) {
			let latitudeNum = data.results[0].geometry.location.lat;
			let longitudeNum = data.results[0].geometry.location.lng;
			console.log("This is the geocoding data: " + latitudeNum + " & " + longitudeNum);
			let currentDate = new Date();
			let day = currentDate.getDate(); 
			let monthIndex = currentDate.getMonth() + 1; 
			let year = currentDate.getFullYear(); 
			let completeDate = year + "-" + monthIndex + "-" + day;
			getSunData(latitudeNum, longitudeNum, completeDate);
				 day++;
				completeDate = year + "-" + monthIndex + "-" + day;
			getSunData(latitudeNum, longitudeNum, completeDate);
				 day++;
				completeDate = year + "-" + monthIndex + "-" + day;
			getSunData(latitudeNum, longitudeNum, completeDate);
			getWeatherData(latitudeNum, longitudeNum);
			//localTimeZonesConversion();
		}).fail(function (errorMessage) {
			console.log('another error here');
		});
}

//function to get data from Sunrise Sunset API (NO APIKEY NEEDED)
function getSunData(latitude, longitude, date) {
	const query = {
		lat: latitude,
		lng: longitude,
		date: date
	}
	$.getJSON(SUN_TIME_URL, query, displaySunTimes);
}

//function to display sunrise/sunset times
function displaySunTimes(data) {
	let sunriseTime = data.results.sunrise;
	let sunsetTime = data.results.sunset;
	console.log("SunTimes jsonp callback is working: " + sunriseTime + " & " + sunsetTime);
	let todayDate = new Date();
	let utcSunriseVariable = sunriseTime;
	let utcSunsetVariable = sunsetTime;
	let newSunriseDate = new Date(todayDate.getFullYear() + "-" + (todayDate.getMonth() + 1) + "-" + (todayDate.getDate() + count) + " " + utcSunriseVariable);
	let newSunsetDate = new Date(todayDate.getFullYear() + "-" + (todayDate.getMonth() + 1) + "-" + (todayDate.getDate() + 1 + count) + " " + utcSunsetVariable);

	newSunriseDate.setUTCHours(newSunriseDate.getHours());
	newSunriseDate.setUTCMinutes(newSunriseDate.getMinutes());
	newSunsetDate.setUTCHours(newSunsetDate.getHours());
	newSunsetDate.setUTCMinutes(newSunsetDate.getMinutes());

	//Just keep the date & time from date
	let displaySunriseTime = `${newSunriseDate}`.slice(0,24);
	let displaySunsetTime = `${newSunsetDate}`.slice(16, 24);
	
	formatTimeToStandardTime(displaySunsetTime);
	//get next day times
	//let nextDaySunriseTime = new Date(todayDate.getFullYear() + "-" + (todayDate.getMonth() + 1) + "-" + (todayDate.getDate() + 1) + " " + utcSunriseVariable);
	//console.log(nextDaySunriseTime);
	
		let dayName = 'Today';
		let dayNumber = todayDate.getDay() + count;
		if (dayNumber == 7) {
			dayNumber = 0;
		}
			if (count > 0) {
				dayName = weekday[dayNumber];
			}
	$('.js-sunrise-sunset-times').append(`<h2>${dayName}</h2><p>Sunrise Time: ${displaySunriseTime}</p>
		<p>Sunset Time: ${displaySunsetTime}</p>`);
	count++;

}

//functino to convert military time to standard time (it works only when printing to console but doesn't actually convert time in DOM)
function formatTimeToStandardTime(timeToConvert) {
	let timeArray = timeToConvert.split(":");
	console.log(timeArray);

	let timeValue;

	let hours = Number(timeArray[0]);
	let minutes = Number(timeArray[1]);
	let seconds = Number(timeArray[2]);

		if (hours > 0 && hours <= 12) {
	  timeValue= "" + hours;
	} else if (hours > 12) {
	  timeValue= "" + (hours - 12);
	} else if (hours == 0) {
	  timeValue= "12";
	}
	 
	timeValue += (minutes < 10) ? ":0" + minutes : ":" + minutes;  // get minutes
	timeValue += (seconds < 10) ? ":0" + seconds : ":" + seconds;  // get seconds
	timeValue += (hours >= 12) ? " P.M." : " A.M.";  // get AM/PM
	console.log(timeValue);
}

/*function getNextTwoDaysTimes(sunrise, sunset, time) {
	let tmrwsTimes = new Date(sunrise.getFullYear() + "-" + (sunrise.getMonth() + 1) + "-" + (sunrise.getDate() + 1)) + " " + time;
	console.log(tmrwsTimes);
}*/

//function to get data from OpenWeatherMap API
function getWeatherData(lat, long) {
	const query = {
		lat: lat,
		lon: long,
		units: `imperial`,
		APPID: OPENWEATHER_API_KEY
	}
	$.getJSON(OPENWEATHER_URL, query, renderWeatherData);
}

//function to render weather results 
function renderWeatherData(data) {
	$('.js-weather-section').html(displayWeatherInfo(data));
}

//function to display weather info
function displayWeatherInfo(data) {
	let newHtml = "";
	
	//16 covers  hrs of 2 days
	for (let i = 1; i <= 16; i++) {
		let timeDisplay = data.list[i].dt_txt.slice(10, 19);

		if (i <= 8) {
				newHtml += `<div class="hourlyWeatherTop">
					<p>Time: ${timeDisplay}</p><p>Temp: ${Math.round(data.list[i].main.temp)}</p>
					<img src="http://openweathermap.org/img/w/${data.list[i].weather[0].icon}.png">
					<p>${data.list[i].weather[0].description}</p>
					<p>Wind: ${Math.round(data.list[i].wind.speed)} mph</p>
					</div>`;
		} else if (i > 8 && i <= 16) {
			newHtml += `<div class="hourlyWeatherBottom">
					<p>Time: ${timeDisplay}</p><p>Temp: ${Math.round(data.list[i].main.temp)}</p>
					<img src="http://openweathermap.org/img/w/${data.list[i].weather[0].icon}.png">
					<p>${data.list[i].weather[0].description}</p>
					<p>Wind: ${Math.round(data.list[i].wind.speed)} mph</p>
					</div>`;
		}
	}
		return newHtml;
}

//function to submit input 
/*function submitButton() {
	$('.searchButton').on('click', function(event) {
		event.preventDefault();
		let locationSearch = $('#js-location-input').val();
		//locationSearch.val("");
		console.log(locationSearch);
		getGeocodingData(locationSearch);
	});
}*/

//function for submit button
function submitButton() {
	$('.js-search-location').submit(function(event) {
		event.preventDefault();
		let queryTarget = $(event.currentTarget).find('#js-location-input');
		let locationSearch = queryTarget.val();
		queryTarget.val("");
		console.log(locationSearch);
		getGeocodingData(locationSearch);

	})
}

$(submitButton);












