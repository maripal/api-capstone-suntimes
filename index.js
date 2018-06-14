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
			//variables for get sun data function date parameter
			let currentDate = new Date();
			let day = currentDate.getDate(); 
			let monthIndex = currentDate.getMonth() + 1; 
			let year = currentDate.getFullYear(); 
			let completeDate = year + "-" + monthIndex + "-" + day;
			//get today's times
			getSunData(latitudeNum, longitudeNum, completeDate);
			//get tomorrow's times
				 day++;
				completeDate = year + "-" + monthIndex + "-" + day;
			getSunData(latitudeNum, longitudeNum, completeDate);
			//get day after tomorrow's times
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
	let displaySunriseTime = `${newSunriseDate}`.slice(0,21);
	let displaySunsetTime = `${newSunsetDate}`.slice(16, 24);
	
	displaySunsetTime = formatTimeToStandardTime(displaySunsetTime);
	
	let dayName = 'Today';
		let dayNumber = todayDate.getDay() + count;
		if (dayNumber === 7) {
			dayNumber = 0;
		} else if (dayNumber === 8) {
			dayNumber = 1;
		} else if (count > 0) {
				dayName = weekday[dayNumber];
			}
		
	$('.js-sunrise-sunset-times').append(`<div class="sun-times-display">
										<h2>${dayName}</h2><p>Sunrise Time: ${displaySunriseTime}</p>
										<p>Sunset Time: ${displaySunsetTime}</p>
										</div>`);
	
	count++;
}

//function to convert military time to standard time (it works only when printing to console but doesn't actually convert time in DOM)
function formatTimeToStandardTime(timeToConvert) {
	let timeArray = timeToConvert.split(":");

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
	//timeValue += (seconds < 10) ? ":0" + seconds : ":" + seconds;  // get seconds
	timeValue += (hours >= 12) ? " P.M." : " A.M.";  // get AM/PM
	
	console.log(timeValue);
	return timeValue;
}

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
			timeDisplay = formatTimeToStandardTime(timeDisplay);

		if (i <= 8) {
				newHtml += `<div class="hourlyWeatherTop">
					<p class="weather-info">${timeDisplay}</p><p class="weather-info">${Math.round(data.list[i].main.temp) + '&#8457;'}</p>
					<img class = "weatherIcon" src="http://openweathermap.org/img/w/${data.list[i].weather[0].icon}.png">
					</div>`;
		} else if (i > 8 && i <= 16) {
			newHtml += `<div class="hourlyWeatherBottom">
					<p class="weather-info">${timeDisplay}</p><p class="weather-info">${Math.round(data.list[i].main.temp) + '&#8457;'}</p>
					<img class="weatherIcon" src="http://openweathermap.org/img/w/${data.list[i].weather[0].icon}.png">
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












