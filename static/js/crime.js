var crime ="https://services5.arcgis.com/54falWtcpty3V47Z/arcgis/rest/services/general_offenses_year3/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json"

// Setting up our chart
var svgWidth = 800;
var svgHeight = 500;

var margin = {
    top: 20,
    bottom: 120,
    left: 60,
    right: 40
};

var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;


// Creating an SVG wrapper, appending the SVG group, and shifting by left and top margins
var svgBar = d3.select("#bar-graph").append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svgBar.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

var svgLine = d3.select("#line-graph").append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var lineGroup = svgLine.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);


d3.json(crime, function(crimeData){
    var crimeData = crimeData.features.map(crimeData => crimeData.attributes)

    crimeData.forEach(function(data){
        data.Occurence_Date = new Date(data.Occurence_Date)
        // data.Occurence_Date = data.Occurence_Date.toLocaleDateString()
    })

    var beat = crimeData.map(object => object.Beat)
    var crimes = crimeData.map(object => object.Offense_Category)

    // console.log(beat)
    
    crimeBarChart(crimes)

    const monthName = item => moment(item.Occurence_Date, 'MM/DD/YYYY').format('YYYY-MM-DD');
    const crimeByDate = _(crimeData)
        .groupBy(monthName)
        .mapValues(items => _.map(items, 'Offense_Category'))
        .value()

    crimeLineGraph(crimeByDate)

});

function dictionary(array){

    var newDictionary = {};

    array.forEach(function(item){
        var date = item[0];

        newDictionary[date] = parameterCount(item[1])
    })
    return newDictionary
}

function objectIter(arr){
    var array = arr.map(data => data[1])
    var newArray = []
    array.forEach(function(arrayItem) {
        count = 0
        for(const [key, value] of Object.entries(arrayItem)){
            count += value
        }
        newArray.push(count)
    })
    return newArray
};

function crimeLineGraph(crimeObject){

    var crimeByDateArr = JSON.parse(JSON.stringify(Object.entries(dictionary(Object.entries(crimeObject)))));

    var crimeCountArr = []
    for(var i=0; i<crimeByDateArr.length; i++){
        
        crimeCountArr.push([crimeByDateArr[i][0], objectIter(crimeByDateArr)[i]])
    }

    var parseTime = d3.timeParse("%Y-%e-%d");

    var xTimeScale = d3.scaleTime()
        .domain(d3.extent(crimeCountArr, d => parseTime(d[0])))
        .range([0, chartWidth]);

    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(objectIter(crimeByDateArr))])
        .range([chartHeight, 0])

    var bottomAxis = d3.axisBottom(xTimeScale).tickFormat(d3.timeFormat("%d-%b"))
    var leftAxis = d3.axisLeft(yLinearScale)

    lineGroup.append("g")
        .call(bottomAxis)
        .attr("transform", `translate(0, ${chartHeight})`)

    lineGroup.append("g")
        .call(leftAxis)

    var drawLine = d3.line()
        .x(crimeDate => xTimeScale((parseTime(crimeDate[0]))))
        .y(crimeDate => yLinearScale(crimeDate[1]));

    lineGroup.append("path")
        .attr("d", drawLine(crimeCountArr))
        .classed("line blue", true)
}


function parameterCount(array){

    var parameterFrequency = {};

    array.forEach(function(parameter){
        var currentParameter = parameter;

        if(currentParameter in parameterFrequency){
            parameterFrequency[currentParameter] += 1;
        }
        else {
            parameterFrequency[currentParameter] = 1;
        }
    })
    return parameterFrequency
}

function crimeBarChart(crimes){

    var crimeObject = JSON.parse(JSON.stringify(parameterCount(crimes)));
    
    var xScale = d3.scaleBand()
        .domain(Object.keys(crimeObject))
        .range([0, chartWidth])
        .padding(0.1)
    
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(Object.values(crimeObject))])
        .range([chartHeight, 0])

    var xAxis = d3.axisBottom(xScale)
    var yAxis = d3.axisLeft(yScale)

    chartGroup.append("g")
        .call(yAxis)
    
    chartGroup.append("g")
        .call(xAxis)
        .attr("transform", `translate(0, ${chartHeight})`)
        .selectAll("text")
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start")
        .attr("y", 0)
        .attr("x", 8)
        .attr("dy", ".35em")

    chartGroup.selectAll(".bar")
        .data(Object.entries(crimeObject)).enter()
        .append("rect").classed("bar", true)
        .attr("x", d => xScale(d[0]))
        .attr("y", d => yScale(d[1]))
        .attr("height", d => chartHeight - yScale(d[1]))
        .attr("width", xScale.bandwidth())
}