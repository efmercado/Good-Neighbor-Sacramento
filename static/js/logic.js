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
  
  // Function that will determine the color of a neighborhood based on the district it belongs to
  function chooseColor(district) {
      switch (district) {
        case 1:
          return "yellow";
        case 2:
            return "red";
        case 3:
            return "orange";
        case 4:
            return "green";
        case 5:
            return "purple";
        case 6:
            return "blue";
        default:
            return "black" ;
      }
  }

  // Grabbing our GeoJSON data..
  d3.json(link, function(data) {
    // Creating a GeoJSON layer with the retrieved data
    L.geoJson(data, {
        // Style each feature (in this case a district)
        style: function(feature) {
            return {
                color: "white",
                fillColor: chooseColor(feature.properties.DISTRICT),
                fillOpacity: 0.5,
                weight: 1.5
            };
        },
        // Called on each feature
        onEachFeature: function(feature, layer) {
            // Set mouse events to change map styling
            layer.on({
                // When a user's mouse touches a map feature, the mouseover event calls this function, that feature's opacity changes to 90% so that it stands out
                mouseover: function(event) {
                    layer = event.target;
                    layer.setStyle({
                        fillOpacity: 0.9
                    });
                },
                // When the cursor no longer hovers over a map feature - when the mouseout event occurs - the feature's opacity reverts back to 50%
                mouseout: function(event) {
                    layer = event.target;
                    layer.setStyle({
                        fillOpacity: 0.5
                    });
                },
                // When a feature (district) is clicked, it is enlarged to fit the screen
                click: function(event) {
                    myMap.fitBounds(event.target.getBounds());
                }
            });
            // Giving each feature a pop-up with information pertinent to it
            layer.bindPopup(`District: ${feature.properties.DISTRICT}`)
        }
    }).addTo(myMap);

    var legend = L.control({position: "bottomright"});

    legend.onAdd = function (myMmap) {
    
        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 1, 2, 3, 4, 5, 6],
            labels = [];
        
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + chooseColor(grades[i] + 1) + '"></i> ' + 
                (grades[i + 1] ? + grades[i + 1] + '<br>' : 'Undefined');
        }
        return div;
    };
    
    // legend.addTo(myMap);
    
  });
  