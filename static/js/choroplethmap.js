
var link = "../static/data/police_beats.geojson"
var districts = "../static/data/police_districts.geojson"

var beatCrimeCount2 = [];

// Creating the map object
// var myMap2 = L.map("map", {
//   center: [38.5816, -121.4944],
//   zoom: 10
// });

  // Adding the tile layer
var runBikeHike = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.run-bike-hike",
  accessToken: API_KEY
});

var light = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox/light-v10',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: API_KEY
});

var beatsCrime = {};

// ---------------------------------------------------------------------------------------- //

// Grabbing the GeoJSON data
d3.json(link, function(data) {

  // Grapping the crime data
  d3.json(crime, function(crimeData) {

    // Navigating through the json objects to display relevant data features
    var crimeData = crimeData.features.map(crimeData => crimeData.attributes)

    var crimeData = crimeData.filter(crime => crime.Beat != null)
    var crimeData = crimeData.filter(crime => crime.Beat != "UI")

    // Grouping crime data by Beat
    const groupedBeat = _.groupBy(crimeData, 'Beat')
    console.log(groupedBeat)
    console.log("groupedBeat", groupedBeat)

    // Creating an array of offense for each Beat
    const crimeByBeat =  _.mapValues(groupedBeat, items => _.map(items, 'Offense_Category'))
    console.log("crimeBybeat", crimeByBeat)
  
    // Counting the number of offenses for each beat and storing in a dictionary
    var beatDictionary = {}
    Object.entries(crimeByBeat).forEach(function(item){
        var beat = item[0];

        beatDictionary[beat] = parameterCount(item[1])
           
    })
    
    console.log(beatDictionary)


    // Converting beatDictionary into an array
    var beatArr = Object.entries(beatDictionary)
    console.log("beatArr", beatArr)
    
    // Storing beat and offense count into an array of arrays
    var beatCrimeCount = []
    for(var i=0; i<beatArr.length; i++){

        beatCrimeCount.push([beatArr[i][0], objectIter(beatArr)[i]])
    }
    console.log("beatCrimeCount", beatCrimeCount)

    //console.log(beatCrimeCount);
   
    //console.log(arr);

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

    console.log("1", beatCrimeCount)
    //Joy's Code

    
    beatCrimeCount2 = [... beatCrimeCount];

    beatCrimeCount2.sort(function(a, b) {
      return a[1] - b[1];
    });

    console.log("2", beatCrimeCount2);
    //console.log(beatCrimeCount2);

    

    //End: Joy's code
    console.log("daataaa", data)
    console.log(data.features)

    testData = data.features
    data.features.forEach(property => console.log(property.properties))

    // Creating a new GeoJSON dictionary/object that will hold crime count by beat
    dataDictionary = data.features.map(object => object.properties)
    console.log("geoJson", data)
    console.log("dataDictionary", dataDictionary)
    
    // Adding the crime count by beat onto the GeoJSON dictionary/object
    beatCrimeCount.forEach((item, i) => dataDictionary[i]["Crime__Count"] = item[1])
  
// ---------------------------------------------------------------------------------------- //
        
    // Creating a GeoJSON layer with the retrieved GeoJSON data
    var geojson = L.choropleth(data, {

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
              })

    d3.json(districts, function(districtData) {

      // Grouping crime data by District
      const groupedDistrict = _.groupBy(crimeData, 'Police_District')
      

      // Creating an array of offense for each District
      const crimeByDistrict =  _.mapValues(groupedDistrict, items => _.map(items, 'Offense_Category'))

      // Counting the number of offenses for each district and storing in a dictionary
      var districtDictionary = {}
      Object.entries(crimeByDistrict).forEach(function(item){
        var district = item[0];

        districtDictionary[district] = parameterCount(item[1])
           
      })

      // Converting districtDictionary into an array
      var districtArr = Object.entries(districtDictionary)

      // Storing district and offense count into an array of arrays
      var districtCrimeCount = []
      for(var i=0; i<districtArr.length; i++){

          districtCrimeCount.push([districtArr[i][0], objectIter(districtArr)[i]])
      }

      
      // // Creating a new GeoJSON dictionary/object that will hold crime count by district
      districtDataDictionary = districtData.features.map(object => object.properties)
      

      // // Adding the crime count by district onto the GeoJSON dictionary/object
      for(var i=0; i< (districtCrimeCount.length -1); i++){
        districtDataDictionary[i]["Crime__Count"] = districtCrimeCount[i][1]
      }
      
      // Creating a GeoJSON layer with the retrieved data
      var district = L.choropleth(districtData, {
        
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
          color: "#ffffb2",
          weight: 1,
          fillOpacity: 0.8
        },
    
        // Bindind a pop-up to each layer
        onEachFeature: function(feature, layer)
          {
            // layer.bindPopup(`District: ${feature.properties.DISTRICT} <hr> Crime Count: ${feature.properties.Crime__Count}`);
            layer.on({
              click: whenClicked
              });
            
          }

        })

      var baseMaps = {
        "Green": runBikeHike,
        "Light": light
      } 

      var overlayMaps = {
        "Beats": geojson,
        "Districts": district
      }

      // Creating the map object
      var myMap2 = L.map("map", {
        center: [38.5816, -121.4944],
        zoom: 10,
        layers: [runBikeHike, district]
      });
      
      L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
      }).addTo(myMap2)

// ------------------------------------------------------------------------------------------ //
      // Creating legend
      var legend = L.control({position: "bottomright"});
        
      legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        var limits = geojson.options.limits;
        var colors = geojson.options.colors;
        var labels = []

        // Add min & max
        var legendInfo = "<center>Crime count from Jan 2020 to today</center>"+
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

  })
});