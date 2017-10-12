/*  This visualization was made possible by modifying code provided by:

 Scott Murray, Choropleth example from "Interactive Data Visualization for the Web"
 https://github.com/alignedleft/d3-book/blob/master/chapter_12/05_choropleth.html

 Malcolm Maclean, tooltips example tutorial
 http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html

 Mike Bostock, Pie Chart Legend
 http://bl.ocks.org/mbostock/3888852
 */

var us_states_path = "dataset/us-states.json";
var width, height, scale;
var projection, path, color, colorRanges;
var svg, tooltip;
var year = null, month = null;
var analysis_type = null;

var setupConfig = function () {
    width = 1440;
    height = 750;
    scale = 1500;
};

var setupD3 = function () {
    // D3 Projection
    projection = d3.geoAlbersUsa()
        .translate([width / 2, height / 2])    // translate to center of screen
        .scale([scale]);          // scale things down so see entire US

    // Define path generator
    path = d3.geoPath()               // path generator that will convert GeoJSON to SVG paths
        .projection(projection);  // tell path generator to use albersUsa projection


    // Define linear scale for output
    colorRanges = [
        "#00FF00",
        "#7FFF00",
        "#FFFF00",
        "#FFFF00",
        "#FF0000"
    ];
    color = d3.scaleLinear()
        .range(colorRanges);

    color.domain([...Array(colorRanges.length).keys()]); // setting the range of the input data
};

var setupSVG = function () {
    //Create SVG element and append map to the SVG
    svg = d3.select("div.svg")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    // Append Div for tooltip to SVG
    tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
};

var drawUSAMap = function () {
    // Load GeoJSON data and merge with states data
    d3.json(us_states_path, function (json) {
        // Bind the data to the SVG and create one path per GeoJSON feature
        svg.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("stroke", "#fff")
            .style("stroke-width", "1")
            .style("fill", function (d) {
                return "#D5DED9";
                // Get data value
//              var value = d.properties.visited;
//
//              if (value) {
//                   //If value exists…
//                   return color(value);
//              } else {
//                   //If value is undefined…
//                   return "rgb(213,222,217)";
//              }
            });
    });
};

var drawAirports = function (year, month) {
    d3.json("dataset/flights/flights_" + year + "_"+ month + ".json", function (flights) {
        d3.json("dataset/airports/airports.json", function (allAirports) {
            d3.json("dataset/airports/airports_" + year + "_" + month + ".json", function (displayAirports) {
                displayAirports.forEach(function (displayAirport) {
                    var airportFound = allAirports.find(function (arp) {
                        return arp.iata === displayAirport.iata;
                    });
                    displayAirport.airport = airportFound.airport;
                    displayAirport.city = airportFound.city;
                    displayAirport.country = airportFound.country;
                    displayAirport.lat = airportFound.lat;
                    displayAirport.lon = airportFound.lon;
                    displayAirport.state = airportFound.state;
                });
                svg.selectAll("circle")
                    .data(displayAirports)
                    .enter()
                    .append("circle")
                    .attr("cx", function (d) {
                        return projection([d.lon, d.lat]) ? projection([d.lon, d.lat])[0] : -100;
                    })
                    .attr("cy", function (d) {
                        return projection([d.lon, d.lat]) ? projection([d.lon, d.lat])[1] : -100;
                    })
                    .attr("r", function (d) {
                        return Math.ceil(d.num_of_flights / 10000) * 4;
//                        return Math.sqrt(d.years) * 4;
                    })
                    .sort(function (a, b) {
                        return b.num_of_flights - a.num_of_flights;
                    })
                    .style("fill", "rgb(217,91,67)")
                    .style("stroke", "#fff")
                    .style("opacity", 0.85)

                    // Modification of custom tooltip code provided by Malcolm Maclean, "D3 Tips and Tricks"
                    // http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
                    .on("mouseover", function (d) {
                        drawFlights(flights, d);
                        tooltip.transition()
                            .duration(200)
                            .style("opacity", .9);
                        tooltip.text(d.iata)
                            .style("left", (d3.event.pageX + 10) + "px")
                            .style("top", (d3.event.pageY - 14) + "px");
                    })

                    // fade out tooltip on mouse out
                    .on("mouseout", function (d) {
                        removeFlights();
                        tooltip.transition()
                            .duration(500)
                            .style("opacity", 0);
                    });
            });
        });
    });
};

// This function takes an object, the key names where it will find an array of lng/lat pairs, e.g. `[-74, 40]`
// And a bend parameter for how much bend you want in your arcs, the higher the number, the less bend.
var lngLatToArc = function (d, bend) {
    // If no bend is supplied, then do the plain square root
    bend = bend || 1;
    // `d[sourceName]` and `d[targetname]` are arrays of `[lng, lat]`
    // Note, people often put these in lat then lng, but mathematically we want x then y which is `lng,lat`

    var originLat = d.origin_lat;
    var originLon = d.origin_lon;
    var destLat = d.dest_lat;
    var destLon = d.dest_lon;

    var sourceXY = projection([originLon, originLat]);
    var targetXY = projection([destLon, destLat]);

    if (sourceXY && targetXY) {
        // Uncomment this for testing, useful to see if you have any null lng/lat values
        // if (!targetXY) console.log(d, targetLngLat, targetXY)
        var sourceX = sourceXY[0],
            sourceY = sourceXY[1];

        var targetX = targetXY[0],
            targetY = targetXY[1];

        var dx = targetX - sourceX,
            dy = targetY - sourceY,
            dr = Math.sqrt(dx * dx + dy * dy) * bend;

        // To avoid a whirlpool effect, make the bend direction consistent regardless of whether the source is east or west of the target
        var west_of_source = (targetX - sourceX) < 0;
        if (west_of_source) return "M" + targetX + "," + targetY + "A" + dr + "," + dr + " 0 0,1 " + sourceX + "," + sourceY;
        return "M" + sourceX + "," + sourceY + "A" + dr + "," + dr + " 0 0,1 " + targetX + "," + targetY;
    } else {
        return "M0,0,l0,0z";
    }
}

var drawFlights = function(flights, origin) {
    var flightsFromOrigin = _.filter(flights, {'origin': origin.iata});

    if(analysis_type){
        var valMax = _.get(_.maxBy(flights, analysis_type), analysis_type);
        var valMin = _.get(_.minBy(flights, analysis_type), analysis_type);
        var sortedFlights = _.sortBy(flights, analysis_type);
        console.log(sortedFlights);
    }

    svg.selectAll("path.arc")
        .data(flightsFromOrigin)
        .enter().append("svg:path")
        .attr("class", "arc")
        .attr("d", function (d) {
            return lngLatToArc(d, 15);
        })
        .style("stroke", function(d){
            var value = _.get(d, analysis_type);
            if(value && sortedFlights){
                var index = _.findIndex(sortedFlights, {origin: d.origin, destination: d.destination});
                // var z = Math.floor((index / flights.length) * colorRanges.length);
                var z = Math.floor(((value - valMin) / (valMax - valMin + 1)) * colorRanges.length);
                return color(z);
            }else{
                return '#D5DED9';
            }
        });
};

var removeAirports = function() {
    svg.selectAll("circle").remove();
};

var removeFlights = function() {
    svg.selectAll("path.arc").remove();
};

var drawGraph = function () {
    var selectedYear = $('.select-year').find(':selected').val();
    var selectedMonth = $('.select-month').find(':selected').val();
    if(selectedYear && selectedMonth && (selectedYear !== year || selectedMonth !== month)){
        console.log('selected year: ' + selectedYear + ', selected month: ' + selectedMonth);
        year = selectedYear;
        month = selectedMonth;
        removeAirports();
        drawAirports(year, month);
    }
};

var listenValueChange = function () {
    $('.select-year').change(function(){
        drawGraph();
    });
    $('.select-month').change(function() {
        drawGraph();
    });
    $('.select-type').change(function() {
        analysis_type = $('.select-type').find(':selected').val();
    });
};

setupConfig();
setupD3();
setupSVG();
drawUSAMap();
listenValueChange();