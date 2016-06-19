
var WIDTH_FACTOR = 0.9;

function makeLinePlotGroup() {
    // Line Charts
    var xScale = new Plottable.Scales.Time();
    var yScale = new Plottable.Scales.Linear();

    var xAxis = new Plottable.Axes.Time(xScale, "bottom");
    var yAxis = new Plottable.Axes.Numeric(yScale, "left");

    var colorScale = new Plottable.Scales.Color()
        .domain([
          "KESK",
          "KOK",
          "SDP",
          "VIHR",
          "PERUSS",
          "VAS",
          "RKP",
          "KD",
          "MUU"
        ])
        .range([
          "green",
          "blue",
          "red",
          "chartreuse",
          "goldenrod",
          "deeppink",
          "palegreen",
          "powderblue",
          "pink"
        ]);

    var plots = new Plottable.Components.Group();
    var legend = new Plottable.Components.Legend(colorScale);
    legend.maxEntriesPerRow(Infinity);

    var table = new Plottable.Components.Table([
        [yAxis, plots],
        [null, xAxis],
        [null, legend]
    ]);

    return {
        plot: table,
        plots: plots,
        xScale: xScale,
        yScale: yScale,
        colorScale: colorScale
    };
}

function renderLinePlotGroup(group) {
    var table = group.plot;

    table.renderTo("svg#line");

    var w = $("#line").parent().width();
    $("#line").attr("width", WIDTH_FACTOR * w);
    table.redraw();
}

function addLinePlots(group, parties) {
    var plots = group.plots;
    var xScale = group.xScale;
    var yScale = group.yScale;
    var colorScale = group.colorScale;

    parties.forEach(function (party) {
        var line = new Plottable.Plots.Line()
                .addDataset(new Plottable.Dataset(party, { name: party[0].name }))
                .x(function (d) { return d.date; }, xScale)
                .y(function (d) { return d.value; }, yScale)
                .attr("stroke", function(d) { return d.name; }, colorScale)
                .attr("stroke-width", 1)
                .autorangeMode("y");
        var scatter = new Plottable.Plots.Scatter()
                .addDataset(new Plottable.Dataset(party, { name: party[0].name }))
                .x(function (d) { return d.date; }, xScale)
                .y(function (d) { return d.value; }, yScale)
                .attr("stroke", function(d) { return d.name; }, colorScale)
                .attr("fill", function(d) { return d.name; }, colorScale)
                .attr("opacity", 1)
                .size(2);

        plots.append(line);
        plots.append(scatter);
    });
}
