/**
 * Created by billy on 6/2/16.
 */
var dataSet = [], tmp, prevState = [];
d3.json("data/msas.json", function(error, data) {
    if (error) throw error;
    tmp = data.data.data;
    varnames = data.variableNames;
    varlabs = d3.map(data.variableLabels);
    vallabs = d3.map(data.valueLabels);

    graphVarNames = varnames.filter(function (d) {
        return !data.variableIsString[d];
    });
    
    selectX = d3.select("body").append("div")
        .append("span")
        .attr("class", "col-xs-12 col-md-4")
        .text("Variable of Interest: ")
        .append("select")
        .attr("id", "xvar")
        .attr("onchange", "histo()");

    selectX.selectAll("option")
        .data(graphVarNames)
        .enter().append("option")
        .attr("value", function (d) {
            return d;
        })
        .text(function (d) {
            return varlabs.get(d);
        });

    var min = 3, max = 25;
    d3.select("div").append("table").attr("class", "col-sm-3").append("tr").attr("id", "slidermin").append("td").text(min);
    d3.select("#slidermin").append("td").append("input").attr("type", "range")
        .property("min", min)
        .property("max", max)
        .property("step", 1)
        .property("defaultValue", 5)
        .attr("id", "slider")
        .on("change", function () {
            d3.select("#selval").remove();
            d3.select("div table").append("tr").append("td").attr("colspan", 3).attr("id", "selval").text("Selected Value: " + d3.select(this).property("value"));
            histo();
        });
    d3.select("#slidermin").append("td").attr("id", "slidermax").text(max);

    d3.select("body").select("div")
        .append("span")
        .attr("class", "col-xs-12 col-md-4")
        .attr("id", "dfiltername")
        .text("Show Schools Only? ");
//        .on("click", histo());


    distfilter = d3.selectAll("span#dfiltername").append("input")
        .attr("id", "distfilter")
        .attr("type", "checkbox")
        .attr("value", "dfilter")
        .property("checked", true)
        .on("click", histo);

    d3.select("#dfiltername").append("span").attr("id", "cntfreq")
        .text("Show Number of Observations : ");

    displayOpt = d3.selectAll("span#cntfreq").append("input")
        .attr("id", "pctcount")
        .attr("type", "checkbox")
        .property("checked", false)
        .on("click", histo);

    histo();

});


function histo() {

    var filt = d3.select("input#distfilter").property("checked"),
        xvar = d3.select("select#xvar").property("value"),
        possibleValues;


    tmp.forEach(function(d) { if (!isNaN(+d[xvar])) {
        if (filt && d["schnm"] !== "District Level") dataSet.push(d[xvar]);
        else if (filt && d["schnm"] === "District Level") dataSet.push(null);
        else dataSet.push(+d[xvar]);
    }});

    possibleValues = $.grep(dataSet, function(v, k){
        if (v !== null) return $.inArray(v, dataSet) === k;
    });

    if (prevState.length !== 0) {
        d3.selectAll("g.bars").data(prevState).exit().remove();
        d3.selectAll("g.x.axis").data(prevState).exit().remove();
    }

    d3.select("body")
        .datum(dataSet)
        .call(histogramChart());

    prevState = dataSet;
}