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

// Importing the Sacramento crime data
d3.json(crime, function(crimeData){

    // Navigating through the json objects to display relevant data features
    var crimeData = crimeData.features.map(crimeData => crimeData.attributes)
    
    // Parsing date/time string formatted data and converting to a js datetime object
    crimeData.forEach(function(data){
        data.Occurence_Date = new Date(data.Occurence_Date)
    })

    // Creating a list of all offenses
    var crimes = crimeData.map(object => object.Offense_Category)

    // Calling a custom function to create a bar graph
    crimeBarChart(crimes)

    // Creating a pseudo callback function to format the js datetime object 
    const monthName = item => moment(item.Occurence_Date, 'MM/DD/YYYY').format('YYYY-MM-DD');
    
    // Grouping crime data by date and creating an array of offenses
    const crimeByDate = _(crimeData)
        .groupBy(monthName)
        .mapValues(items => _.map(items, 'Offense_Category'))
        .value()

    // Calling a custom function to create a line graph
    crimeLineGraph(crimeByDate)
});

// This function will count the number of unique items in an array and store them in a dictionary
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

// Will take in an array of arrays and create a dictionary
function dictionary(array){

    var newDictionary = {};

    array.forEach(function(item){
        var date = item[0];

        newDictionary[date] = parameterCount(item[1])
    })
    return newDictionary
}

// Will take in the second item of the smaller array and if its a dictionary/object with values
// it will count and store those values in a new array
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

// Function to create a time series line graph
function crimeLineGraph(crimeObject){

    // Storing an array of arrays that hold date and offense dictionary
    var crimeByDateArr = Object.entries(dictionary(Object.entries(crimeObject)));

    // Creating a new array that exclusively holds date and offense count
    var crimeCountArr = []
    for(var i=0; i<crimeByDateArr.length; i++){
        
        crimeCountArr.push([crimeByDateArr[i][0], objectIter(crimeByDateArr)[i]])
    }

    // Using d3 to create a callback function that will parse and convert a string back to a date
    var parseTime = d3.timeParse("%Y-%e-%d");

    // Creating a x-axis time scale callback function
    var xTimeScale = d3.scaleTime()
        .domain(d3.extent(crimeCountArr, d => parseTime(d[0])))
        .range([0, chartWidth]);

    // Creating a y-axis linear scale callback function
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(objectIter(crimeByDateArr))])
        .range([chartHeight, 0])

    // Additional callback functions for x and y axis
    var bottomAxis = d3.axisBottom(xTimeScale).tickFormat(d3.timeFormat("%b-%d"))
    var leftAxis = d3.axisLeft(yLinearScale)

    // Appending the x axis
    lineGroup.append("g")
        .call(bottomAxis)
        .attr("transform", `translate(0, ${chartHeight})`)

    // Appending the y axis
    lineGroup.append("g")
        .call(leftAxis)

    // Creating a callback function that will set the x and y values of the line
    var drawLine = d3.line()
        .x(crimeDate => xTimeScale((parseTime(crimeDate[0]))))
        .y(crimeDate => yLinearScale(crimeDate[1]));

    // Appending the line onto the graph
    lineGroup.append("path")
        .attr("d", drawLine(crimeCountArr))
        .classed("line dark-red", true)

    // Initializing Tooltip
    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([-10, 0])
        .html(function(d) {
            return `Date: ${d[0]} <br> Number of Cases: ${d[1]}`
    })

    // Creating the tooltip in chartGroup
    chartGroup.call(toolTip);

    // Appending circles to data points
    var circlesGroup = lineGroup.selectAll("circle")
        .data(crimeCountArr)
        .enter()
        .append("circle")
        .attr("cx", d => xTimeScale(parseTime(d[0])))
        .attr("cy", d => yLinearScale(d[1]))
        .attr("r", "8")
        .attr("fill", "gold")
        .attr("stroke-width", "1")
        .attr("stroke", "black")

    // Adding event listeners with transitions
    circlesGroup.on("mouseover", function(d) {
        d3.select(this)
          .transition()
          .duration(600)
          .attr("r", "14")
          .attr("fill", "red")
        toolTip.show(d, this)
    })
        .on("mouseout", function(d) {
            d3.select(this)
              .transition()
              .duration(600)
              .attr("r", "8")
              .attr("fill", "gold")
            toolTip.hide(d, this)
        })

}

function crimeBarChart(crimes){

    // Storing a new dictionary/object that holds the offense and count
    var crimeObject = parameterCount(crimes);
    
    // Creating an array of arrays from the previous object that will later be sorted
    var sortableCrimeArray = [];
    for (var offense in crimeObject){
        sortableCrimeArray.push([offense, crimeObject[offense]])
    };
    
    // Sorting the array
    sortableCrimeArray.sort(function(a,b){
        return b[1] - a[1]
    })
    
    // Creating a callback function for an x-axis that holds string values 
    var xScale = d3.scaleBand()
        .domain(sortableCrimeArray.map(offense => offense[0]))
        .range([0, chartWidth])
        .padding(0.1)
    
    // Creating a y-axis linear scale callback function 
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(sortableCrimeArray.map(offense => offense[1]))])
        .range([chartHeight, 0])

    // Additional callback functions for the x and y axis
    var xAxis = d3.axisBottom(xScale)
    var yAxis = d3.axisLeft(yScale)

    // Appending the y-axis
    chartGroup.append("g")
        .call(yAxis)
    
    // Appending the x-axis and adding text formatting
    chartGroup.append("g")
        .call(xAxis)
        .attr("transform", `translate(0, ${chartHeight})`)
        .selectAll("text")
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start")
        .attr("y", 0)
        .attr("x", 8)
        .attr("dy", ".35em")

    // Initializing toolTip
    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([-10, 0])
        .html(function(d) {
            return `Offense: ${d[0]} <br> Count: ${d[1]}`
        })
 
    // Creating the tooltip in chartGroup
    chartGroup.call(toolTip);

    // Appending the rectancles to the graph
    var barsGroup = chartGroup.selectAll(".bar")
        .data(sortableCrimeArray).enter()
        .append("rect").classed("bar", true)
        .attr("x", d => xScale(d[0]))
        .attr("y", d => yScale(d[1]))
        .attr("height", d => chartHeight - yScale(d[1]))
        .attr("width", xScale.bandwidth())
        .attr("fill", "black")

    // Create "mouseover/mouseout" event listeners to display/hide tooltip and transitions
    barsGroup.on("mouseover", function(d) {
        d3.select(this)
            .transition()
            .duration(200)
            .attr("fill", "#CC0000")
        toolTip.show(d, this)          
    })
        .on("mouseout", function(d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("fill", "black")
            toolTip.hide(d, this)
        })
}