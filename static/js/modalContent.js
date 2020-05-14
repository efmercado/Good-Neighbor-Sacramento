
function modalContentChange(district){

    d3.select('#safetyranking').html("");
    d3.select('#safetyranking')
        .append("h3").text('Neighborhood Safety Ranking');
      
    var topCounter = 0;
    for ( i=0; i<beatCrimeCount2.length; i++ )
      {
        for ( j=0; j<beatCrimeCount2[i].length; j++ )
        {
         
          if (beatCrimeCount2[i][j][0] == district)
          {
            topCounter++;
            console.log("Top " + topCounter);
            console.log( beatCrimeCount2[i][j][0] + beatCrimeCount2[i][j][1] + " = "+ beatCrimeCount2[i][1]);

            d3.select('#safetyranking')
            .append('br');
            d3.select('#safetyranking')
            .append('br');


            d3.select('#safetyranking')
            .append("h6").text('#' + topCounter + ' Beat ' + beatCrimeCount2[i][j][1]);

            d3.select('#safetyranking')
            .append("h7").text('Crime Count : ' + beatCrimeCount2[i][1]);


          }
          
        }
      }

}