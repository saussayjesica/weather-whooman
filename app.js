/*
  WEATHER APP:

  1. Log out the current temperature for Sydney's latitude and longitude
    (hint: complete the getWeather function, returning a promise with the result from the API call, use that promise to then log the result)
  2. Convert the temperature from kelvin to degrees celsius
  3. Add a form(input box) on index.html that allows a user to search for any city's weather and logs out the result.
    (hint: google maps api from previous example)
  4. Display the result of the users search on the DOM.
  5. Display the type of weather too (cloudy, sunny, etc -- check the response)

  --BONUS ROUND--
  6. Add a loading indicator until you're ready to display the information for the city.
  7. Make it pretty, ideas:
    * Change the background of the page to reflect the temperature
    * Add pictures to represent the type of weather -- clouds, the sun, etc.
    * Request a new temperature every few minutes (hint: setInterval)
    * Animate when the weather changes.
    *


*/

const weatherUrl = "http://api.openweathermap.org/data/2.5/weather";
const apiKey = "72af66db614bf9fd03583352142dd7a7";
const mapsApi = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
const timeApi = 'https://maps.googleapis.com/maps/api/timezone/json?location=';
const timeKey = "AIzaSyDkuURelOYEXrtQPJFXVd4nsLls28NgzZg";
const targetDate = new Date() // Current date/time of user computer
const timestamp = targetDate.getTime()/1000 + targetDate.getTimezoneOffset() * 60 // Current UTC date/time expressed as seconds since midnight, January 1, 1970 UTC


function getLatLng(location) {
  return fetch(mapsApi + location)
  .then(res => res.json())
  .then(body => {
    return(body.results[0].geometry.location)
  })
}


function getTime(lat, lng){
  const timeUrl = `${timeApi}${lat},${lng}&timestamp=${timestamp}&key=${timeKey}`
  return fetch(timeUrl)
  .then(res => res.json())
  .then(body => {
    let offsets = body.dstOffset * 1000 + body.rawOffset * 1000 // get DST and time zone offsets in milliseconds
    let localdate = new Date(timestamp * 1000 + offsets) // Date object containing current time of Tokyo (timestamp + dstOffset + rawOffset)
    let cityTime = localdate.toLocaleString()
    return cityTime
  })
}


function getWeather(lat, lng) {
  const url = `${weatherUrl}?lat=${lat}&lon=${lng}&APPID=${apiKey}`
  return fetch(url)
  .then(res => res.json())
  .then(body => {
    let weatherResults = {};
    weatherResults.temp = Math.round(body.main.temp - 273.15)
    weatherResults.type = body.weather[0].id
    weatherResults.description = body.weather[0].description
    weatherResults.name = body.name
    return weatherResults
  })
}


function sunShower() {
    return `
    <div class="icon sun-shower">
      <div class="cloud"></div>
      <div class="sun">
        <div class="rays"></div>
      </div>
      <div class="rain"></div>
    </div>
    `
}

function storm() {
    return `
  <div class="icon thunder-storm">
    <div class="cloud"></div>
    <div class="lightning">
      <div class="bolt"></div>
      <div class="bolt"></div>
    </div>
  </div>
  `
}

function cloud() {
    return `
  <div class="icon cloudy">
    <div class="cloud"></div>
    <div class="cloud"></div>
  </div>
  `
}

function snow() {
    return `
  <div class="icon flurries">
    <div class="cloud"></div>
    <div class="snow">
      <div class="flake"></div>
      <div class="flake"></div>
    </div>
  </div>
  `
}

function sun() {
    return `
  <div class="icon sunny">
    <div class="sun">
      <div class="rays"></div>
    </div>
  </div>
  `
}

function rain() {
    return `
  <div class="icon rainy">
    <div class="cloud"></div>
    <div class="rain"></div>
  </div>
  `
}

let state = {temp: '', type: '', name: '', description: '', timeInCity: ''}

const container = document.querySelector('#container')

function pageLoadRender(element, data){
  element.innerHTML = `
    <div class="main-form">
      <h2>Weather WhooMan<h2>
      <image src="icon.png" class="logo"/>
      <input type="text" placeholder="Enter a city" value="" id="city">
      <input type="submit" value="Search" id="btn">
    </div>
  `
}

function render(element, data, fn){
  element.innerHTML = `
    <div class="main-form">
      <h2>Weather WhooMan<h2>
      <image src="icon.png" class="logo"/>
      <input type="text" placeholder="Enter a city" value="" id="city">
      <input type="submit" value="Search" id="btn">
      <div>
        <p id= name>${data.name}</p>
        <p id= time>${data.timeInCity}</p>
        <p id= description>${data.description}</p>
        <p id= temperature>${data.temp}<span id="degree">&#176;</span></p>
      </div>
      ${fn}
    </div>
  `
}

function weatherIcon (res) {
  if (res.type >= 200 && res.type <= 232 || res.type >= 900 && res.type <= 906) {
    return storm()
  } else if (res.type >= 300 && res.type <= 321) {
    return sunShower()
  } else if (res.type >= 500 && res.type <= 531 || res.type >= 701 && res.type <= 781) {
    return rain()
  } else if (res.type >= 600 && res.type <= 622) {
    return snow()
  } else if (res.type == 800) {
    return sun()
  } else if (res.type >= 801 && res.type <= 804) {
    return cloud()
  }
}


delegate('body', 'click', '#btn', event => {
    let text = document.querySelector('#city').value
    getLatLng(text)
    .then(res => {
      let latitude = res.lat
      let longitude = res.lng
      getWeather(res.lat, res.lng)
      .then(res => {
        const image = weatherIcon(res)
        state.temp = res.temp
        state.type = res.type
        state.name = res.name
        state.description = res.description
          getTime(latitude, longitude)
           .then(res => {
             state.timeInCity = res

                     console.log(state)
            render(container, state, image)
        })
      })
    })
  .catch(err => {
    state.temp = "Something went wrong"
    console.log(err)
    render(container, state, weatherIcon(res))
  })
})







pageLoadRender(container, state)
