/**
 * Created by billy on 7/23/16.
 */


var margin = {top: 0, right: 75, bottom: 20, left: 50},
    width = 960,
    height = 500,
    min = 3,
    max = 15,
    selectX = d3.select("select#xvar"),
    slcontainer = d3.select("span#slid"),
    distfilter = d3.select("input#distfilter"),
    xvar, filt, dataSet = [], svg;

d3.json("data/msas.json", function(error, data) {
    if (error) throw error;

    // Gets the data from the jsonio created object
    tmp = data.data.data,

    // Gets variable names from the jsonio object
    varnames = data.variableNames,

    // Maps variable labels
    varlabs = d3.map(data.variableLabels),

    // Maps value labels
    vallabs = d3.map(data.valueLabels),

    // Adds event listener to the input slider
    d3.select("input#slider")
        .property("min", min)
        .property("max", max)
        .property("step", 1)
        .property("defaultValue", 5)
        .on("change", function () { histoChart() }),

    // Adds event listener to the dropdown menu
    selectX.on("change", function() { histoChart() }),

    // Selects only numeric variables to use for graph options
    graphVarNames = varnames.filter(function (d) {
        return !data.variableIsString[d];
    });

    // Populates the drop down menu
    selectX.selectAll("option")
        .data(graphVarNames)
        .enter().append("option")
        .attr("value", function (d) {
            return d;
        })
        .text(function (d) {
            return varlabs.get(d);
        });

    // Event listener for the schools only filter
    distfilter.on("change", function() { histoChart() });

    // Event listener for percent of distribution vs frequency
    d3.select("input#pctcount").on("change", function() { histoChart() });

    // Calls function used to draw graph
    histoChart();

}); // End of main function that loads data and graphs it

// Function for creating the histogram
function histoChart() {

    // Need for format the numbers that get displayed on screen
    var pctfmt = d3.select("input#pctcount").property("checked"),

        // used for the number formatting handler for axis values
        fmt;

        // If the frequency option is selected
        if (pctfmt) {

            // Format as a fixed width integer format
            fmt = d3.format("^ 3.0f");

        // If not
        } else {

            // Format as a percent value to the hundredths place
            fmt = d3.format("^ 04.2%");

        }

    // Stores the district only option
    filt = d3.select("input#distfilter").property("checked"),

    // Stores the value from the drop down menu
    xvar = d3.select("select#xvar").property("value"),

    // Empty array used to store values
    dataSet = [],

    // Add the values to the array
    tmp.forEach(function(d) { if (!isNaN(+d[xvar])) {

        // If school level only option selected
        if (filt && d["schnm"] !== "District Level") {

            // Push values into the array from schools only
            return(dataSet.push(+d[xvar]));

        // If the value is from a district
        } else if (!filt) {

            // Push all values into the array
            return(dataSet.push(+d[xvar]));

        // If the schools only filter is not selected
        } else { }

    }}); // End construction of the values array

    // Stores the value of the number of bins to try using
    var bins = +d3.select("input").property("value");

    // Remove the existing label from the slider
    d3.selectAll("p#slideLabel").remove();

    // Add text to show the range of values and the currently selected value
    slcontainer.append("p").attr("id", "slideLabel").text("Select the number of bins from " + min +  " - " + max + "   Selected : " + bins);

    // Creates the variable used to set the axis values
    var x = d3.scale.linear()
              .domain([0, d3.max(dataSet, function(d) { return d; })])
              .range([0, width]),

        // Defines the histogram function with the user selected parameters
        histogram = d3.layout.histogram()
            .bins(x.ticks(bins))
            .frequency(pctfmt),

        // Creates the data object prepped for a histogram
        data = histogram(dataSet),

        // Creates variable used to set the y value scaling
        y = d3.scale.linear()
            .domain([0, d3.max(data, function(d) { return d.y; })])
            .range([height, 0]),

        // Creates function used to draw the x-axis
        xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom"),

        // Creates function used to draw the y-axis
        yAxis = d3.svg.axis().scale(y).orient("left");

        // Removes any existing svg elements
        d3.select("div#graphArea").selectAll("svg").remove();

    // Creates the container for the graph
    svg = d3.select("div#graphArea")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Used to bind data to the bars that will be graphed
    var bar = svg.selectAll(".bar").data(data);

    // Removes bars that are not part of the current data binding
    bar.exit().remove();

    // Adds elements to the container based on the bound data
    bar.enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

    // Creates the rectangles in the graphs that show the bars
        bar.append("rect")
            .attr("x", 1)
            .attr("width", x(data[0].dx) - 1)
            .attr("height", function(d) { return height - y(d.y); });

    // Adds the values to each of the bars
    bar.append("text")
       .attr("dy", ".75em")
       .attr("y", 0)
       .attr("x", x(data[0].dx) / 2)
       .attr("text-anchor", "middle")
       .text(function(d) { return fmt(d.y); })
       .style("fill", "black")
       .style("stroke", "black")
       .style("font-size", "13");

    // Adds an x-axis to the graph
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Adds a y-axis to the graph
    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + 0 + ", 0)")
        .call(yAxis);

}; // End of function used to draw the histogram


