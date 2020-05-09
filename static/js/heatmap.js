// Creating a new svg for the heatmap
var svgHeat = d3.select("#heat-map").append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Adding a group the the SVG heatmap
var heatGroup = svgHeat.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Importing crime data from the crime.js crime link
d3.json(crime, function(crimeData){

    // Navigating through the json objects to display relevant data features
    var crimeData = crimeData.features.map(crimeData => crimeData.attributes)
    
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
        .padding(0.01);

    heatGroup.append("g")
        .call(d3.axisBottom(x))
        .attr("transform", `translate(0, ${chartHeight})`)

    heatGroup.append("g")
        .call(d3.axisTop(x))

    // Building the y scales and axis:
    var y = d3.scaleBand()
        .domain(myVars)
        .range([chartHeight, 0])
        .padding(0.01);

    heatGroup.append("g")
        .call(d3.axisLeft(y))

    // Building the color scale
    var myColor = d3.scaleLinear()
        .domain([1,100])
        .range(["white", "#0daf89"])

    // Appending the heatmap
    heatGroup.selectAll(".heat")
        .data(crimeCountArr)
        .enter()
        .append("rect")
        .classed("heat", true)
        .attr("x", d => x(d[1]))
        .attr("y", d => y(d[0]))
        .attr("width", x.bandwidth() )
        .attr("height", y.bandwidth() )
        .style("fill", function(d) { return myColor(d[2])} )

});

