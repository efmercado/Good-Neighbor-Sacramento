function modalContentChange(district){

  var districtName = "";
  var zips = [];
  var uniqueZips = [];

  document.getElementById("zipcodes").innerHTML = "";
  document.getElementById("listingprice").innerHTML = "";
  document.getElementById("daysinmarket").innerHTML = "";
  
    d3.json("/districts_beats", function(data) {
      data.filter(function(d){
      
        if (d.district == district ){

          districtName = d.district_name;

          d3.select('#safetyranking').html("");
          d3.select('#safetyranking2').html("");


          // var elem = document.createElement("img");
          var src = `../static/img/district${district}.jpg`;
          // elem.src = `../static/img/district${district}.jpg`;
          // elem.classList.add = 'img-thumbnail-xx';

          d3.select('#safetyranking')
          .append('img')
          .attr('class', 'img-thumbnail-xx')
          .attr('src', src);

          var topCounter = 0;
          for ( i=0; i<beatCrimeCount2.length; i++ ){
            for ( j=0; j<beatCrimeCount2[i].length; j++ ){
              if (beatCrimeCount2[i][j][0] == district){

                  beatInfo = data.filter(function(d){ return (d.beat == beatCrimeCount2[i][j][1] && d.district == district) })
                  
                  topCounter++;

                  // d3.select('#safetyranking')
                  // .append('br');
                  d3.select('#safetyranking2')
                  .append('br');


                  d3.select('#safetyranking2')
                  .append("h5").text('#' + topCounter + ' Beat ' + beatCrimeCount2[i][j][1] + ' - ' + beatInfo[0].neighborhood);

                  d3.select('#safetyranking2')
                  .append("h6").text('Crime Count : ' + beatCrimeCount2[i][1]);

                }
              }
            }
          }
        })

      // Sets the district's overview title
      d3.select('#overview-title').html("");
      d3.select('#overview-title')
          .append("h2").text(`District ${district}: ${districtName} | Overview`);

    });

    d3.json("/districts_zip", function(data) {
      

      district_zips = data.filter(function(d){ return (d.Police_District == district)})

      // zips.push(district_zips.Zip_Code);

      district_zips.forEach(function(item) {
        zips.push(item.Zip_Code);
      })

      var unique = function(xs) {
        return xs.filter(function(x, i) {
          return xs.indexOf(x) === i
        })
      };

      uniqueZips = unique(zips);

      uniqueZips.forEach(function(item){
        document.getElementById("zipcodes").innerHTML += `${item} `;
      });

    });

    d3.json("/sac_realestate", function(data) {

      realEstate = data.filter(function(d){ return (uniqueZips.includes(d.postal_code))});

      var medListingPrice = d3.median(realEstate, function(d) { return d.median_listing_price; });
      medListingPrice = numberWithCommas(medListingPrice);
      document.getElementById("listingprice").innerHTML = `$ ${medListingPrice} `;
      

      var avgDaysInMarket = d3.mean(realEstate, function(d) { return d.median_days_on_market; });
      avgDaysInMarket = avgDaysInMarket.toFixed(2);
      document.getElementById("daysinmarket").innerHTML = `${avgDaysInMarket} `;

      function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }

    });
}