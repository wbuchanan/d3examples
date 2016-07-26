/**
 * Created by billy on 7/23/16.
 */


var margin = {top: 25, right: 50, bottom: 50, left: 100},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    x = d3.scale.ordinal()
          .rangeRoundBands([0, width], .1),
    y = d3.scale.linear()
          .range([height, 0]),
    xAxis = d3.svg.axis()
              .scale(x)
              .orient("bottom"),
    yAxis = d3.svg.axis()
              .scale(y)
              .orient("left")
              .ticks(10),
    svg = d3.select("body").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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

    nester = d3.nest().key(function(d) { if (d.wowaive !== ".n" && d.wowaive !== ".p" && d.wowaive !== "") { return d.wowaive ;}; })
               .sortKeys(d3.descending)
               .rollup(function(leaves) {
                        return {
                            "mean" : d3.mean(leaves, function(d) { return +d.totpts; }),
                            "sd" : d3.deviation(leaves, function(d) { return +d.totpts; })
                        }
               }).entries(tmp);

    x.domain(nester.map(function(d) { return d.key; }));
    y.domain([0, d3.max(nester, function(d) { return d.values.mean; })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("x", -150)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Average Total Points");

    svg.selectAll(".bar")
        .data(nester)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.key); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.values.mean); })
        .attr("height", function(d) { return height - y(d.values.mean); });
});
