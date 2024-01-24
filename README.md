# Weather web application on native JS
![https://github.com/whereismym1nd/weather-web-app/blob/main/img/Screenshot_26.png?raw=true]

This application works on the basis of JSON data from the server openweathermap.org . 

It shows the current weather, additional information on the current weather (such as pressure, wind speed and direction, visibility, etc.), as well as the weather forecast for the next 6 days in the form of a graph and in the form of cards. The graph was made using charts.js .

However, the weather forecast has a small margin of error, since I took the average temperature for each day, based on the free data that I could get from openweathermap.org

The information in this application is updated dynamically when the city is requested in the search bar.

The blocks were written using JavaScript classes, and requests to the server are processed using fetch()
