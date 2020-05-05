var crime ="https://services5.arcgis.com/54falWtcpty3V47Z/arcgis/rest/services/general_offenses_year3/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json"
var crime2 = "https://services5.arcgis.com/54falWtcpty3V47Z/arcgis/rest/services/general_offenses_year3/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json"

d3.json(crime2, function(data){
    console.log("crimmmeeee", data)
    var beat = data.features.map(object => object.attributes.Beat)
    var crimes = data.features.map(object => object.attributes.Offense_Category)
    var codes = data.features.map(object => object.attributes.Offense_Code)
    var time = data.features.map(object => object.attributes.Occurence_Date)
    var converted_times = time.map(time => new Date(time))
    var unique_crimes = [...new Set(crime)]
    var unique_codes = [...new Set(codes)]

    // console.log(beat)
    // console.log(crimes)
    // console.log("unique crimes", unique_crimes)
    // console.log("unique codes", unique_codes)
    // console.log(time)
    // console.log("time", converted_times)

    function crimeCount(array){

        var crimeFrequency = {};

        array.forEach(function(crime){
            var currentCrime = crime;

            if(currentCrime in crimeFrequency){
                crimeFrequency[currentCrime] += 1;
            }
            else {
                crimeFrequency[currentCrime] = 1;
            }
        })
        console.log(crimeFrequency);
        return crimeFrequency
    }

    crimeCount(crimes)
    crimeCount(codes)

});