"use strict";

let controller = new AbortController();
const signal = controller.signal;



function fetchData(url, signal) {
  return fetch(url, { signal })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .catch(error => {
      if (error.name === 'AbortError') {
        // Request was aborted
        console.log('Fetch aborted');
      } else {
        // Handle other errors
        console.error('Error fetching data:', error.message);
      }
    });
}

function fetchDataT(url, signal, timeout = 5000) {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Fetch timeout')), timeout)
  );

  return Promise.race([
    fetch(url, { signal }),
    timeoutPromise
  ])
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .catch(error => {
      if (error.name === 'AbortError') {
        // Request was aborted
        console.log('Fetch aborted');
      } else {
        // Handle other errors
        console.error('Error fetching data:', error.message);
      }
    });
}

function fetchDataWithCancellation(url) {
  controller.abort();
  const newController = new AbortController();
  controller = newController;
  const newSignal = newController.signal;
  return fetchDataT(url, newSignal);
}



function fetch_city_weather(lat, lon){


const apiUrl = `https://www.7timer.info/bin/api.pl?lon=${lon}&lat=${lat}&product=civillight&output=json`;

fetchDataWithCancellation(apiUrl)
  .then(data => {
    console.log('Data:', data);
    build_weather_tb(data);
  })
  .catch(error => {
    console.error('Error:', error);
    build_weather_tb({});
  });
}


function city_weather_fake(){
  const data = {
    "product" : "civillight" ,
    "init" : "2023111500" ,
    "dataseries" : [
      {
        "date" : 20231115,
        "weather" : "ishower",
        "temp2m" : {
          "max" : 10,
          "min" : 6
        },
        "wind10m_max" : 3
      },
      {
        "date" : 20231116,
        "weather" : "lightrain",
        "temp2m" : {
          "max" : 8,
          "min" : 4
        },
        "wind10m_max" : 3
      },
      {
        "date" : 20231117,
        "weather" : "lightrain",
        "temp2m" : {
          "max" : 6,
          "min" : 4
        },
        "wind10m_max" : 3
      },
      {
        "date" : 20231118,
        "weather" : "cloudy",
        "temp2m" : {
          "max" : 7,
          "min" : 3
        },
        "wind10m_max" : 4
      },
      {
        "date" : 20231119,
        "weather" : "mcloudy",
        "temp2m" : {
          "max" : 11,
          "min" : 7
        },
        "wind10m_max" : 4
      },
      {
        "date" : 20231120,
        "weather" : "lightrain",
        "temp2m" : {
          "max" : 10,
          "min" : 8
        },
        "wind10m_max" : 4
      },
      {
        "date" : 20231121,
        "weather" : "lightrain",
        "temp2m" : {
          "max" : 9,
          "min" : 6
        },
        "wind10m_max" : 3
      }
    ]
  };
  return data;
}

function query_weather(lat, lon, place){
  const container = document.getElementById("forecast-tb");
  container.innerHTML='Loading...';
  const place_name_hr = document.getElementById('weather_place_name');
  place_name_hr.innerText = place;
  const main = document.getElementById('main');
  main.classList.remove('hide');

  fetch_city_weather(lat, lon);
}
function build_weather_tb(data){
  //const data = city_weather_fake();
  console.log(data);


  const container = document.getElementById("forecast-tb");

  if(typeof data === typeof undefined || data.length == 0) {
    container.innerText = 'Error fetching weather data...';
    return;
  }

  container.innerHTML= '';

  let temp_min= Math.min(...(data.dataseries.map(a => parseInt (a.temp2m.min) )));
  let temp_max=Math.max(...(data.dataseries.map(a => parseInt (a.temp2m.max) )));
  let temp_width = temp_max - temp_min;


  console.log(temp_min);
  console.log(temp_max);

  data.dataseries.forEach(
      (item, index, arr) =>{
        //console.log(item,index,arr);
        const t_offset = Math.floor(((item.temp2m.min - temp_min)*100)/temp_width);
        const t_width = Math.floor(((item.temp2m.max - item.temp2m.min)*100)/temp_width);;


        const hr_date =    (new Date (`${item.date}`.replace(/^(\d{4})(\d{2})(\d{2})/,'$1-$2-$3')) ).toLocaleDateString('en-us', { weekday:"short", month:"short", day:"numeric"}) ;
            //.toDateString();
        const div = `<div class="frcst-day">
            <div>${hr_date}</div>
            <div class="weather ${item.weather}" title="${item.weather}"></div>
            <div style="text-align: right;">${item.temp2m.min}&deg</div>
            <div class="temp">
                <div class="tempbar">
                    <div class="tempbarday" style="width:${t_width}px;margin-left:${t_offset}px;"></div>
                </div>
            </div>
            <div>${item.temp2m.max}&deg</div>
        </div>`;
        container.innerHTML+=div;
      }
  );
}

function show_palces(Country){
  document.getElementById('invite').classList.add('hide');
  document.getElementById('invite2').classList.remove('hide');
  document.querySelectorAll('.places')?.forEach(x => x.classList.add('hide'));

  const div = document.getElementById(`${Country}`);
  div.classList.remove('hide');

}