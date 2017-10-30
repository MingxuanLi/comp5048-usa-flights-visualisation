/**
 * Created by mingxuanli on 29/10/17.
 */

var analysis_type = null;
var selectedAirport = null;
var startYear = 2000;
var endYear = 2009;

var width = 960,
    height = 136,
    cellSize = 17;

var formatPercent = d3.format(".1%");

var color = d3.scaleQuantize()
    .domain([0, 1])
    .range([
        "#66bd63",
        "#d9ef8b",
        "#fee08b",
        "#fdae61",
        "#f68a68",
        "#f46d43",
        "#df5952",
        "#db443c",
        "#d73027",
        "#c12b23",
        "#a50026"
    ]);

var svg = d3.select("div.svg")
    .selectAll("svg")
    .data(d3.range(startYear, endYear))
    .enter().append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

svg.append("text")
    .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .attr("text-anchor", "middle")
    .text(function(d) { return d; });

var rect = svg.append("g")
    .attr("fill", "none")
    .attr("stroke", "#ccc")
    .selectAll("rect")
    .data(function(d) { return d3.timeDays(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
    .enter().append("rect")
    .attr("width", cellSize)
    .attr("height", cellSize)
    .attr("x", function(d) { return d3.timeWeek.count(d3.timeYear(d), d) * cellSize; })
    .attr("y", function(d) { return d.getDay() * cellSize; })
    .datum(d3.timeFormat("%Y-%m-%d"));

svg.append("g")
    .attr("fill", "none")
    .attr("stroke", "#000")
    .selectAll("path")
    .data(function(d) { return d3.timeMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
    .enter().append("path")
    .attr("d", pathMonth);

function pathMonth(t0) {
    var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
        d0 = t0.getDay(), w0 = d3.timeWeek.count(d3.timeYear(t0), t0),
        d1 = t1.getDay(), w1 = d3.timeWeek.count(d3.timeYear(t1), t1);
    return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
        + "H" + w0 * cellSize + "V" + 7 * cellSize
        + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
        + "H" + (w1 + 1) * cellSize + "V" + 0
        + "H" + (w0 + 1) * cellSize + "Z";
}

var drawGraph = function(){
    if(selectedAirport && analysis_type){
        d3.json("dataset/performance/airports_" + selectedAirport + ".json", function(err, json){
            var data = d3.nest()
                .key(function(d) {
                    return d.year + '-' + (d.month + '').padStart(2, "0") + '-' + (d.day_of_month + '').padStart(2, "0");
                })
                .rollup(function(d) {
                    var value = 0;
                    var maxVal = 0;
                    switch(analysis_type){
                        case "percent_of_arr_delay":
                            value = d[0].num_of_out_delayed_flights / d[0].num_of_out_flights;
                            break;
                        case "percent_of_dep_delay":
                            value = d[0].num_of_in_delayed_flights / d[0].num_of_in_flights;
                            break;
                        default:
                            maxVal = _.maxBy(json, analysis_type)[analysis_type];
                            value = d[0][analysis_type] < 0 ? 0 : (d[0][analysis_type] / maxVal) ;
                            break;
                    }
                    return value;
                })
                .object(json);

            rect.filter(function(d) { return d in data; })
                .attr("fill", function(d) {
                    return color(data[d]);
                })
                .append("title")
                .text(function(d) { return d + ": " + formatPercent(data[d]); });
        });
    }
};

var listenValueChange = function(){
    $('.select-airport').change(function(){
        selectedAirport = $('.select-airport').find(':selected').val();
        drawGraph();
    });
    $('.select-type').change(function() {
        analysis_type = $('.select-type').find(':selected').val();
        drawGraph();
    });
};

listenValueChange();