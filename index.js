'use strict'





addEventListener("DOMContentLoaded", () => {

    function getCityWeather() {
        const searchForm = document.querySelector('.search__form');
        const searchInput = document.getElementById("search");
        const searchSubmitButton = document.getElementById("submit")
        const weatherBg = document.querySelector('.weather__container');
        const weatherApiKey = "522b520e650efb4da7b633302aaf0dff";
        const timezoneOffset = new Date().getTimezoneOffset();
        const timezoneOffsetInSeconds = timezoneOffset * 60;
        const ctx = document.getElementById('myChart');
        let myChart = null;


        function generateChartByDates(data) {
            let dateAndTempObj = data.list.reduce((obj, item) => {
                obj[item.dt] = item.main.temp;
                return obj;
            }, {});
            let dateUtcAndTempObj = {};
            for (let key in dateAndTempObj) {
                let newKey = 0;
                if (timezoneOffsetInSeconds < 0) {
                    newKey = parseInt(key) - timezoneOffsetInSeconds;
                } else {
                    newKey = parseInt(key) + timezoneOffsetInSeconds;
                };
                dateUtcAndTempObj[newKey] = dateAndTempObj[key];
            };


            function calculateDailyAverage(timestampTemperatures) {
                const temperaturesByDate = {};
                Object.keys(timestampTemperatures).forEach((timestamp) => {
                    const isoDate = new Date(timestamp * 1000).toISOString();
                    const [year, month, day] = isoDate.split('T')[0].split('-');
                    const formattedDate = `${month}.${day}`;

                    if (!temperaturesByDate[formattedDate]) {
                        temperaturesByDate[formattedDate] = [];
                    }
                    temperaturesByDate[formattedDate].push(timestampTemperatures[timestamp]);
                });

                const averageTemperaturesByDate = {};

                Object.keys(temperaturesByDate).forEach((date) => {
                    const temps = temperaturesByDate[date];
                    const averageTemp = temps.reduce((sum, current) => sum + current, 0) / temps.length;
                    averageTemperaturesByDate[date] = averageTemp;
                });

                return averageTemperaturesByDate;
            }

            const averageTemperaturesByDate = calculateDailyAverage(dateUtcAndTempObj);
            const chartData = {
                datasets: [{
                    label: null,
                    data: averageTemperaturesByDate,
                    borderColor: '#fff',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4
                }]
            };
            if (myChart != null) {
                myChart.destroy()
            };
            myChart = new Chart(ctx, {
                type: 'line',
                data: chartData,
                options: {
                    animations: {
                        tension: {
                            duration: 1500,
                            easing: 'easeInQuad',
                            from: 0.5,
                            to: 0.3,
                            loop: true
                        }
                    },
                    pointRadius: 0,
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            type: 'category',
                            position: 'bottom',
                            ticks: {
                                maxRotation: 0,
                                color: "#fff",
                                stepSize: 5
                            },
                            grid: {
                                display: false
                            },
                            border: {
                                display: false,
                            }
                        },
                        y: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                maxRotation: 0,
                                count: 10,
                                color: "#fff",
                                stepSize: 5,
                                font: {
                                    size: 8
                                }
                            },
                            border: {
                                display: false,
                            }
                        }
                    },
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                    }
                }
            });
        };





        function generateObjForDailyForecast(data) {
            let dateAndTempObj = data.list.reduce((obj, item) => {
                obj[item.dt] = {
                    temp: item.main.temp,
                    icon: item.weather[0].icon
                };
                return obj;
            }, {});
            let dateUtcAndTempObj = {};
            for (let key in dateAndTempObj) {
                let newKey = 0;
                if (timezoneOffsetInSeconds < 0) {
                    newKey = parseInt(key) - timezoneOffsetInSeconds;
                } else {
                    newKey = parseInt(key) + timezoneOffsetInSeconds;
                };
                dateUtcAndTempObj[newKey] = dateAndTempObj[key];
            };
            function calculateDailyAverage(timestampTemperatures) {
                let temperaturesByDate = new Map();
                Object.keys(timestampTemperatures).forEach((timestamp) => {
                    const isoDate = new Date(timestamp * 1000).toString();

                    const formattedDate = isoDate.slice(0, 3);

                    if (!temperaturesByDate.has(formattedDate)) {
                        temperaturesByDate.set(formattedDate, []);
                    }
                    temperaturesByDate.get(formattedDate).push(timestampTemperatures[timestamp]);
                });

                const averageTemperaturesByDate = new Map();
                temperaturesByDate.forEach((temps, date) => {
                    const averageTemp = temps.reduce((sum, current) => sum + current.temp, 0) / temps.length;
                    const averageIconCounts = temps.reduce((acc, item) => {
                        acc[item.icon] = (acc[item.icon] || 0) + 1;
                        return acc;
                    }, {});

                    let mostCommonIcon = '';
                    let maxCount = 0;

                    for (const icon in averageIconCounts) {
                        if (averageIconCounts[icon] > maxCount) {
                            mostCommonIcon = icon;
                            maxCount = averageIconCounts[icon];
                        }
                    }

                    averageTemperaturesByDate.set(date, {
                        temp: averageTemp,
                        icon: mostCommonIcon
                    });
                });

                return averageTemperaturesByDate;
            }

            const forecastData = calculateDailyAverage(dateUtcAndTempObj);
            console.log(forecastData);
            return forecastData;
        };


        function loadStaticCurrentWeather() {
            fetch(`https://api.openweathermap.org/data/2.5/weather?q=Paris&appid=${weatherApiKey}&units=metric`)
                .then(response => response.json())
                .then((data) => {
                    console.log(data);
                    new WeatherInfo(data, ".weather-inner__current-weather", ".weather-inner__rightblock__other-information").render();
                });
            fetch(`https://api.openweathermap.org/data/2.5/forecast?q=Paris&appid=${weatherApiKey}&units=metric`)
                .then(response => response.json())
                .then((data) => {
                    console.log(data);
                    generateChartByDates(data);
                    generateObjForDailyForecast(data).forEach((value, key) => {
                        new ForecastWeatherInfo(key, value.temp, value.icon, '.weather-inner__rightblock__daily-forecast').render();
                    });
                })
                .catch((e) => {
                    searchForm.style.borderColor = "#d44848";
                    setTimeout(() => { searchForm.style.borderColor = "#fff" }, 1000);
                    console.log(e);
                });
        }



        function getCurrentWeather() {
            const cityName = searchInput.value.trim();
            fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${weatherApiKey}&units=metric&lang=`)
                .then(response => response.json())
                .then((data) => {
                    console.log(data);
                    new WeatherInfo(data, ".weather-inner__current-weather", ".weather-inner__rightblock__other-information").render()
                    var windArrow = document.querySelector('.weather-inner__smallblock-wind-icon');
                    setTimeout(() => { windArrow.style.transform = `rotate(${data.wind.deg}deg)`; }, 150)
                }
                )
                .catch(() => {
                    searchForm.style.borderColor = "#d44848";
                    setTimeout(() => { searchForm.style.borderColor = "#fff" }, 1000);
                });
        }

        function getForecastWeather() {
            const cityName = searchInput.value.trim();
            fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${weatherApiKey}&units=metric`)
                .then(response => response.json())
                .then((data) => {
                    console.log(data);
                    generateChartByDates(data);
                    document.querySelector('.weather-inner__rightblock__daily-forecast').innerHTML = "";
                    generateObjForDailyForecast(data).forEach((value, key) => {
                        new ForecastWeatherInfo(key, value.temp, value.icon, '.weather-inner__rightblock__daily-forecast').render();
                    });
                })
                .catch((e) => {
                    searchForm.style.borderColor = "#d44848";
                    setTimeout(() => { searchForm.style.borderColor = "#fff" }, 1000);
                    console.log('server error ' + e);
                });
        }

        class ForecastWeatherInfo {
            constructor(day, temp, weatherCode, parent) {
                this.temperature = Math.round(temp);
                this.day = day;
                this.weatherCode = weatherCode;
                this.parent = document.querySelector(parent);
            };


            render() {
                let checkWeatherCode = this.weatherCode.replace(/\D/g, "");
                checkWeatherCode += "d";
                if (this.temperature > 0) {
                    this.temperature = `+${this.temperature}`;
                }
                let element = document.createElement('div');
                element.classList.add('weather__forecast__miniature')
                element.innerHTML = `                    
                    <div class="weather-inner__icon">
                        <img src="./img/${checkWeatherCode}.svg" alt="">
                    </div>
                    <div class="weather-inner-desc">
                        <div class="weather-inner-temp">
                            <span class="weather-inner-temp-num" id="temperature">${this.temperature}</span>
                        </div>
                        <div class="weather-inner-date">
                            ${this.day}
                        </div>
                    </div>
                `;
                this.parent.append(element);
            }
        }



        class WeatherInfo {
            constructor(data, parent, otherInfoParent) {
                this.temperature = Math.round(data.main.temp);
                this.cityName = data.name;
                this.timezone = data.timezone;
                this.weatherCode = data.weather[0].icon;
                this.weatherMainDesc = data.weather[0].main;
                this.weatherDesc = data.weather[0].description;
                this.windSpeed = data.wind.speed;
                this.windDegree = data.wind.deg;
                this.sunrise = data.sys.sunrise;
                this.sunset = data.sys.sunset;
                this.humidity = data.main.humidity;
                this.pressure = data.main.pressure;
                this.visibility = data.visibility;

                this.otherInfoParent = document.querySelector(otherInfoParent);
                this.parent = document.querySelector(parent);
            }

            render() {
                const currentElement = this.parent;
                if (currentElement) {
                    currentElement.innerHTML = "";
                };
                let checkWeatherCode = this.weatherCode.replace(/\D/g, "");
                if (checkWeatherCode == "01" || checkWeatherCode == "02") {
                    checkWeatherCode = this.weatherCode;
                } else {
                    checkWeatherCode += "d";
                };
                if (this.temperature > 0) {
                    this.temperature = `+${this.temperature}`;
                }

                var sunriseDate = new Date(this.sunrise * 1000);
                sunriseDate.setSeconds(sunriseDate.getSeconds() + this.timezone);
                var hoursSunrise = sunriseDate.getUTCHours();;
                var minutesSunrise = "0" + sunriseDate.getUTCMinutes();
                var formattedSunrise = hoursSunrise + ':' + minutesSunrise.substr(-2);
                var sunsetDate = new Date(this.sunset * 1000);
                sunsetDate.setSeconds(sunsetDate.getSeconds() + this.timezone);
                var hoursSunset = sunsetDate.getUTCHours();;
                var minutesSunset = "0" + sunriseDate.getUTCMinutes();
                var formattedSunset = hoursSunset + ':' + minutesSunset.substr(-2);

                var visionPrecent = Math.round(this.visibility / 100);

                weatherBg.style.backgroundImage = `url(/img/${checkWeatherCode}.png)`
                this.parent.innerHTML = `     
                    <div class="weather-inner__city-name"> 
                        <img src="./img/point.svg" style="max-width: 100%; width: 10px; margin-right: 5px;" /> ${this.cityName}
                    </div>
                    <div class="weather-inner__icon">
                        <img src="./img/${checkWeatherCode}.svg" alt="">
                    </div>
                    <div class="weather-inner-desc">
                        <div class="weather-inner-temp">
                            <span class="weather-inner-temp-num" id="temperature">${this.temperature}</span>
                        </div>
                        <div class="weather-inner-date">
                            ${this.weatherMainDesc}
                        </div>
                    </div>
                `;

                const otherCurrentElement = this.otherInfoParent;
                if (otherCurrentElement) {
                    otherCurrentElement.innerHTML = "";
                };
                this.otherInfoParent.innerHTML = `
                    <div class="weather-inner__smallblock w3">
                        <div class="weather-inner__smallblock-title">
                            Pressure
                        </div>
                        <div class="weather-inner__smallblock-pressure">
                            <img src="/img/pressure.svg" style="width: 80px; padding-bottom: 10px;"/>
                            ${this.pressure} hPa
                        </div>
                    </div>
                    <div class="weather-inner__smallblock w3">
                        <div class="weather-inner__smallblock-title">
                            Visibility
                        </div>
                        <div class="weather-inner__smallblock-visibility">
                            <img src="/img/vision.svg" style="width: 80px; padding-bottom: 4px;"/>
                            ${visionPrecent}% <br />
                            <span style="font-size: 10px;">(${this.visibility} m)</span>
                        </div>
                    </div>
                    <div class="weather-inner__smallblock w3">
                        <div class="weather-inner__smallblock-title">
                            Wind speed
                        </div>
                        <div class="weather-inner__smallblock-wind">
                            <div class="weather-inner__smallblock-wind-icon" style="transition: transform 0.5s ease; width: 55px;"><img src="/img/arrow.svg" /></div>
                            <div class="weather-inner__smallblock-wind-value">${this.windSpeed} m/s</div>
                        </div>
                    </div>
                    <div class="weather-inner__smallblock">
                        <div class="weather-inner__smallblock-title">
                            Sunrise & Sunset
                        </div>
                        <div class="weather-inner__smallblock-sun">
                            <div class="weather-inner__smallblock-sun-icon" style="width: 190px;"><img src="/img/sun.svg" /></div>
                            <div class="weather-inner__smallblock-sun-values">
                                <div class="weather-inner__smallblock-sun-value1">${formattedSunrise}</div>
                                <div class="weather-inner__smallblock-sun-value2">${formattedSunset}</div>
                            </div>
                        </div>
                    </div>
                    <div class="weather-inner__smallblock torus">
                        <div class="weather-inner__smallblock-title">
                            Humidity
                        </div>
                        <div class="weather-inner__smallblock-infographic">
                            
                        </div>
                    </div>
                `;


                if (chart != null) {
                    chart.destroy()
                };
                var chart = new Chartist.Pie('.weather-inner__smallblock-infographic', {
                    series: [this.humidity]
                }, {
                    donut: true,
                    donutWidth: 25,
                    startAngle: 270,
                    total: 200,
                    showLabel: true
                });

                chart.on('draw', function (data) {
                    if (data.type === 'slice') {
                        var pathLength = data.element._node.getTotalLength();
                        data.element.attr({
                            'stroke-dasharray': pathLength + 'px ' + pathLength + 'px'
                        });
                        var animationDefinition = {
                            'stroke-dashoffset': {
                                id: 'anim' + data.index,
                                dur: 1000,
                                from: -pathLength + 'px',
                                to: '0px',
                                easing: Chartist.Svg.Easing.easeOutQuint,
                                fill: 'freeze'
                            }
                        };
                        if (data.index !== 0) {
                            animationDefinition['stroke-dashoffset'].begin = 'anim' + (data.index - 1) + '.end';
                        }
                        data.element.attr({
                            'stroke-dashoffset': -pathLength + 'px'
                        });
                        data.element.animate(animationDefinition, false);
                    }
                });


            }
        }




        loadStaticCurrentWeather();

        searchSubmitButton.addEventListener('click', (e) => {
            e.preventDefault();
            getCurrentWeather();
            getForecastWeather();
        });



















    };






























    getCityWeather();


})