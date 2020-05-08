// Creating map object
var myMap2 = L.map("map", {
    center: [38.5816, -121.4944],
    zoom: 10
  });

  // Adding tile layer
  L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  }).addTo(myMap2);
  
  // Uncomment this link local geojson for when data.beta.nyc is down
  var link = "static/data/police_beats.geojson"
  
  // Grabbing our GeoJSON data..
  d3.json(link, function(data) {

    d3.json(crime, function(crimeData) {
        var crimeData = crimeData.features.map(crimeData => crimeData.attributes)
        const groupedBeat = _.groupBy(crimeData, 'Beat')

        const crimeByBeat =  _.mapValues(groupedBeat, items => _.map(items, 'Offense_Category'))

        var beatDictionary = {}
        Object.entries(crimeByBeat).forEach(function(item){
            var beat = item[0];

            beatDictionary[beat] = parameterCount(item[1])
           
        })
      
        var beatArr = Object.entries(beatDictionary)

        var beatCrimeCount = []
        for(var i=0; i<beatArr.length; i++){

            beatCrimeCount.push([beatArr[i][0], objectIter(beatArr)[i]])
        }
        
        dataDictionary = data.features.map(object => object.properties)
        
        beatCrimeCount.sort(function(a,b){
          if(a[0][1] < b[0][1]) { return -1; }
          if(a[0][1] > b[0][1]) { return 1; }
          return 0;
        })
        beatCrimeCount.sort(function(a,b) {
            return a[0][0] - b[0][0];
        });
        
        beatCrimeCount.forEach((item, i) => dataDictionary[i]["Crime__Count"] = item[1])
        
        // Creating a GeoJSON layer with the retrieved data

        geojson = L.choropleth(data, {

          // Defining what propety in the features to use
          valueProperty: "Crime__Count",

          // Setting the color Scale
          scale: ["#ffffb2", "#b10026"],

          // Number of breaks in step range
          steps: 10,

          // q for quartile, e for equidistant, k for k-means
          mode: "q",

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
        
        legend.addTo(myMap2)

    })

});