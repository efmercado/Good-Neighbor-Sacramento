// Creating map object
var myMap = L.map("map", {
    center: [38.5816, -121.4944],
    zoom: 11
  });
  
  // Adding tile layer
  L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  }).addTo(myMap);
  
  // Uncomment this link local geojson for when data.beta.nyc is down
  var link = "static/data/police_districts.geojson"
  
  
  // Grabbing our GeoJSON data..
  d3.json(link, function(data) {
  
    var areas = data.features.map(data => data.properties.DISTRICT)
  
    console.log(areas)
    console.log(data)
    // Creating a GeoJSON layer with the retrieved data
    console.log(L.geoJson(data))
    L.geoJson(data).addTo(myMap);
  });
  