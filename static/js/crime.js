var crime ="https://services5.arcgis.com/54falWtcpty3V47Z/arcgis/rest/services/general_offenses_year3/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json"
var crimeData;
var dataTest;

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
    .classed("svgBar", true)
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svgBar.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

var svgLine = d3.select("#line-graph").append("svg")
    .classed("svgLine", true)
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var lineGroup = svgLine.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

var svgHeat = d3.select("#heat-map").append("svg")
    .classed("svgHeat", true)
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var heatGroup = svgHeat.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Importing the Sacramento crime data
function init() {

    d3.selectAll(".svgLine").remove()
    d3.selectAll(".svgBar").remove()
    d3.selectAll(".svgHeat").remove()

    // Using the D3 library to read in crime json
    d3.json(crime, function(data){

        dataTest = data

        // Navigating through the json objects to display relevant data features
        crimeData = dataTest.features.map(crimeData => crimeData.attributes)

        var districts = crimeData.map(object => object.Police_District)
        var uniqueDistricts = [...new Set(districts)]
        uniqueDistricts.unshift("All")

        uniqueDistricts.sort(function(a,b){
            return a - b
        })
        
        // Parsing date/time string formatted data and converting to a js datetime object
        crimeData.forEach(function(data){
            data.Occurence_Date = new Date(data.Occurence_Date)
        })

        // Calling functions to display initial charts
        crimeBarChart(crimeData)
        crimeLineGraph(crimeData)
        heatMapChart(crimeData)

        // Setting the different options
        var options = d3.select("#selDataset");
        uniqueDistricts.forEach(name => options.append("option").text(name))


    });
}

function handleDistrictChange(value) {

    d3.selectAll(".svgLine").remove()
    d3.selectAll(".svgBar").remove()
    d3.selectAll(".svgHeat").remove()
    
    var filteredDataSet = crimeData.filter(crime => crime.Police_District == value)

    if(value === "All"){
        crimeBarChart(crimeData)
        crimeLineGraph(crimeData)
        heatMapChart(crimeData)
    }
    else{
    crimeBarChart(filteredDataSet)
    crimeLineGraph(filteredDataSet)
    heatMapChart(filteredDataSet)
    }
}

function whenClicked(e) {
    // e = event
    console.log(e.target.feature.properties.DISTRICT);
    var district = e.target.feature.properties.DISTRICT;
    console.log(district);
    handleDistrictChange(district);

    document.getElementById("D1").click();

    // You can make your ajax call declaration here
    //$.ajax(... 
  }

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
function crimeLineGraph(crimeData){

    var svgLine = d3.select("#line-graph").append("svg")
        .classed("svgBar", true)
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    var lineGroup = svgLine.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Creating a pseudo callback function to format the js datetime object 
    const monthName = item => moment(item.Occurence_Date, 'MM/DD/YYYY').format('YYYY-MM-DD');
        
    // Grouping crime data by date and creating an array of offenses
    const crimeByDate = _(crimeData)
        .groupBy(monthName)
        .mapValues(items => _.map(items, 'Offense_Category'))
        .value()

    // Storing an array of arrays that hold date and offense dictionary
    var crimeByDateArr = Object.entries(dictionary(Object.entries(crimeByDate)));

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

     // Creating axes labels
     lineGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (chartHeight*.6))
        .attr("dy", "1em")
        .attr("class", "axisText")
        .text("Crime Count")

    lineGroup.append("text")
        .attr("transform", `translate(${chartWidth*0.5}, ${chartHeight + 45})`)
        .attr("class", "axisText")
        .attr("anchor-text", "middle")
        .text("Date")

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

function crimeBarChart(crimeData){

    var svgBar = d3.select("#bar-graph").append("svg")
    .classed("svgBar", true)
    .attr("width", svgWidth)
    .attr("height", svgHeight);

    var chartGroup = svgBar.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Creating a list of all offenses
    var crimes = crimeData.map(object => object.Offense_Category)

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

    // Creating axes labels
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (chartHeight*.6))
        .attr("dy", "1em")
        .attr("class", "axisText")
        .text("Crime Count")

    chartGroup.append("text")
        .attr("transform", `translate(${chartWidth*0.45}, ${chartHeight + 100})`)
        .attr("class", "axisText")
        .attr("anchor-text", "middle")
        .text("Offense Category")

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
        .attr("fill", "grey")

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
                .attr("fill", "grey")
            toolTip.hide(d, this)
        })
}

function heatMapChart(crimeData) {

    var svgHeat = d3.select("#heat-map").append("svg")
        .classed("svgHeat", true)
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    var heatGroup = svgHeat.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Parsing date/time string formatted data and converting to a js datetime object
    crimeData.forEach(function(data){
        data.Occurence_Date = new Date(data.Occurence_Date)
    })

    // Creating a pseudo callback function to format the js datetime object 
    const hour = item => moment(item.Occurence_Date).format('hh a')

    // Creating an additional callback function that will also format the js datetime object
    const timeGroups = (() => {
        const dayName = (item) => moment(item.Occurence_Date).format('ddd'),
              hour = (item) => moment(item.Occurence_Date).format('hh a')
        return {
            dayName,
            hour
        }
    })();

    // Grouping crime data by day
    var crimeByDay = _.groupBy(crimeData, timeGroups['dayName'])

    var crimeCountArr = []
    Object.entries(crimeByDay).forEach(function(object){

        // Grouping crime data by hour
        var groupedOffensesByTime = _(object[1])
            .groupBy(hour)
            .mapValues(items => _.map(items, 'Offense_Category'))
            .value()
        
        // Counting the number of unique items in an array
        var offenseObjectCount = Object.entries(dictionary(Object.entries(groupedOffensesByTime)))
        
        // Parsing in day, time, and count data into a single array
        for(var i=0; i<offenseObjectCount.length; i++){
            crimeCountArr.push([object[0], offenseObjectCount[i][0], objectIter(offenseObjectCount)[i]])
        }
        return crimeCountArr
    })

    // Labels for x and y axis
    var myVars = ["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"]
    var myGroups = ["12 am", "01 am", "02 am", "03 am", "04 am", "05 am", "06 am", "07 am", "08 am", "09 am",
    "10 am", "11 am", "12 pm", "01 pm", "02 pm", "03 pm", "04 pm", "05 pm", "06 pm", "07 pm", 
    "08 pm", "09 pm", "10 pm", "11 pm",]


    // Building the x scales and axis:
    var x = d3.scaleBand()
        .domain(myGroups)
        .range([0, chartWidth])
        .padding(0.08);

    heatGroup.append("g")
        .call(d3.axisBottom(x))
        .attr("transform", `translate(0, ${chartHeight})`)

    heatGroup.append("g")
        .call(d3.axisTop(x))

    // Building the y scales and axis:
    var y = d3.scaleBand()
        .domain(myVars)
        .range([chartHeight, 0])
        .padding(0.08);

    heatGroup.append("g")
        .call(d3.axisLeft(y))

    // Building the color scale
    var myColor = d3.scaleLinear()
        .domain([1,40])
        .range(["white", "#CC0000"])

    // Creating axes labels
    heatGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (chartHeight*.6))
        .attr("dy", "1em")
        .attr("class", "axisText")
        .text("Day of the Week")
 
    heatGroup.append("text")
        .attr("transform", `translate(${chartWidth*0.5}, ${chartHeight + 45})`)
        .attr("class", "axisText")
        .attr("anchor-text", "middle")
        .text("Time")

    // Initializing toolTip
    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([-20, 0])
        .html(function(d) {
            return `Day: ${d[0]} <br> Time: ${d[1]} <br> Count: ${d[2]}`
        })

    // Creating the tooltil in heatGroup
    heatGroup.call(toolTip)
    
    // Appending the heatmap
    var rectGroup = heatGroup.selectAll(".heat")
        .data(crimeCountArr)
        .enter()
        .append("rect")
        .classed("heat", true)
        .attr("x", d => x(d[1]))
        .attr("y", d => y(d[0]))
        .attr("width", x.bandwidth() )
        .attr("height", y.bandwidth() )
        .attr("fill", function(d) { return myColor(d[2])} )

    rectGroup.on("mouseover", function(d) {
        d3.select(this)
            .transition()
            .duration(600)
            .attr("fill", "#CC0000")
        toolTip.show(d, this)
    })

    rectGroup.on("mouseout", function(d) {
        d3.select(this)
          .transition()
          .duration(600)
          .attr("fill", function(d) { return myColor(d[2])} )
        toolTip.hide(d, this)
    })
}

init()