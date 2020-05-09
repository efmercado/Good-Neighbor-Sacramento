var link = "static/data/police_beats.geojson"

// Creating the map object
var myMap2 = L.map("map", {
  center: [38.5816, -121.4944],
  zoom: 10
});

  // Adding the tile layer
L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets",
  accessToken: API_KEY
}).addTo(myMap2);
  
  
// Grabbing the GeoJSON data
d3.json(link, function(data) {

  // Grapping the crime data
  d3.json(crime, function(crimeData) {

    // Navigating through the json objects to display relevant data features
    var crimeData = crimeData.features.map(crimeData => crimeData.attributes)

    // Grouping crime data by Beat
    const groupedBeat = _.groupBy(crimeData, 'Beat')

    // Creating an array of offense for each Beat
    const crimeByBeat =  _.mapValues(groupedBeat, items => _.map(items, 'Offense_Category'))
  
    // Counting the number of offenses for each beat and storing in a dictionary
    var beatDictionary = {}
    Object.entries(crimeByBeat).forEach(function(item){
        var beat = item[0];

        beatDictionary[beat] = parameterCount(item[1])
           
    })
    
    // Converting beatDictionary into an array
    var beatArr = Object.entries(beatDictionary)
    
    // Storing beat and offense count into an array of arrays
    var beatCrimeCount = []
    for(var i=0; i<beatArr.length; i++){

        beatCrimeCount.push([beatArr[i][0], objectIter(beatArr)[i]])
    }
    
    // First sorting beatCrimeCount by letter
    beatCrimeCount.sort(function(a,b){
      
      if(a[0][1] < b[0][1]) { return -1; }
      if(a[0][1] > b[0][1]) { return 1; }

        return 0;
    });

    // Sorting once again by number
    beatCrimeCount.sort(function(a,b) {
        return a[0][0] - b[0][0];
    });

    // Creating a new GeoJSON dictionary/object that will hold crime count by beat
    dataDictionary = data.features.map(object => object.properties)
    
    // Adding the crime count by beat onto the GeoJSON dictionary/object
    beatCrimeCount.forEach((item, i) => dataDictionary[i]["Crime__Count"] = item[1])
        
    // Creating a GeoJSON layer with the retrieved GeoJSON data
    geojson = L.choropleth(data, {

      // Defining what propety in the features to use
      valueProperty: "Crime__Count",

      // Setting the color Scale
      scale: ["#ffffb2", "#b10026"],

      // Number of breaks in step range
      steps: 10,

      // q for quartile, e for equidistant, k for k-means this case we are using quartile
      mode: "q",

      // Adding style
      style: {
        // Border color
        color: "#fff",
        weight: 1,
        fillOpacity: 0.8
      },

      // Bindind a pop-up to each layer
      onEachFeature: function(feature, layer){
        layer.bindPopup(`Beat: ${feature.properties.BEAT} <hr> Crime Count: ${feature.properties.Crime__Count}`)
      }
      }).addTo(myMap2)

      // Creating legend
      var legend = L.control({position: "bottomright"});
        
      legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        var limits = geojson.options.limits;
        var colors = geojson.options.colors;
        var labels = []

        // Add min & max
        var legendInfo = "<h1>Crime Count</h1>"+
        "<div class=\"labels\">"+
          "<div class=\"min\">" + limits[0] + "</div>" +
          "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
          "</div>";

        div.innerHTML = legendInfo;

        limits.forEach(function(limit, index) {
          labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
        });

        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        return div;

      }
      
      // Appending legend
      legend.addTo(myMap2)
    })

});