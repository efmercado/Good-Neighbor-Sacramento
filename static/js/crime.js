var crime ="https://services5.arcgis.com/54falWtcpty3V47Z/arcgis/rest/services/general_offenses_year3/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json"

d3.json(crime, function(data){
    console.log("crimmmeeee", data)
    var beat = data.features.map(object => object.attributes.Beat)
    console.log(beat)
    
});