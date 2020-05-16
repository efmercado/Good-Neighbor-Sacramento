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

          d3.select('#safetyranking')
          .append("h3").text('Neighborhood Safety Ranking');

          var elem = document.createElement("img");
          var src = `../static/img/district${district}.jpg`;
          elem.src = `../static/img/district${district}.jpg`;
          elem.classList.add = 'img-thumbnail-xx';
    
          d3.select('#safetyranking')
          .append('br')
          .append('br');

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
                  // console.log("Top " + topCounter);
                  // console.log( beatCrimeCount2[i][j][0] + beatCrimeCount2[i][j][1] + " = "+ beatCrimeCount2[i][1]);

                  d3.select('#safetyranking')
                  .append('br');
                  d3.select('#safetyranking')
                  .append('br');


                  d3.select('#safetyranking')
                  .append("h5").text('#' + topCounter + ' Beat ' + beatCrimeCount2[i][j][1] + ' - ' + beatInfo[0].neighborhood);

                  d3.select('#safetyranking')
                  .append("h7").text('Crime Count : ' + beatCrimeCount2[i][1]);

                }
              }
            }
          }
        })

      // console.log(districtName);

      // Sets the district's overview title
      d3.select('#overview-title').html("");
      d3.select('#overview-title')
          .append("h3").text(`District ${district}: ${districtName} | Overview`);

    });

    d3.json("/districts_zip", function(data) {
      

      district_zips = data.filter(function(d){ return (d.Police_District == district)})

      // console.log(district_zips);
      // zips.push(district_zips.Zip_Code);
      // console.log(zips);

      district_zips.forEach(function(item) {
        // console.log(item.Zip_Code);
        zips.push(item.Zip_Code);
      })

      var unique = function(xs) {
        return xs.filter(function(x, i) {
          return xs.indexOf(x) === i
        })
      };

      uniqueZips = unique(zips);

      // console.log(uniqueZips);


      uniqueZips.forEach(function(item){
        document.getElementById("zipcodes").innerHTML += `${item} `;
      });


      

    });

    d3.json("/sac_realestate", function(data) {

      realEstate = data.filter(function(d){ return (uniqueZips.includes(d.postal_code))});
      // console.log(realEstate);


      var medListingPrice = d3.median(realEstate, function(d) { return d.median_listing_price; });
      // console.log(medListingPrice);
      medListingPrice = numberWithCommas(medListingPrice);
      document.getElementById("listingprice").innerHTML = `$ ${medListingPrice} `;
      

      var avgDaysInMarket = d3.mean(realEstate, function(d) { return d.median_days_on_market; });
      // console.log(avgDaysInMarket);
      avgDaysInMarket = avgDaysInMarket.toFixed(2);
      document.getElementById("daysinmarket").innerHTML = `${avgDaysInMarket} `;

      function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }




    });

    
    


    

}