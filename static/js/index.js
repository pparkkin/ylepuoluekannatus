
var WIDTH_FACTOR = 0.9;

/*
function drawCoefficientTable(keys, cols) {
    var th = '<tr id="rhos-th"></tr>';
    $("#rhos").append(th);
    $("#rhos-th").append("<th></th>");
    for (var i = 0; i < keys.length; i++) {
        var thd = "<th>"+keys[i]+"</th>";
        $("#rhos-th").append(thd);
    }

    for (var i = 0; i < keys.length; i++) {
        var trid = "rhos-row-"+i;
        var tr = '<tr id="'+trid+'"></tr>';
        $("#rhos").append(tr);
        $("#"+trid).append("<th>"+keys[i]+"</th>");
        for (var j = 0; j < keys.length; j++) {
            if (i != j) {
                var r = jStat.corrcoeff(cols[i], cols[j]);
                var td = rhoTd(r);
            } else {
                var td = "<td>-</td>";
            }
            $("#"+trid).append(td);
        }
    }
}

function rhoTd(r) {
    if (r < -0.8) {
        var td = '<td class="strongneg">'+r.toFixed(2)+"</td>";
    } else if (r > 0.8) {
        var td = '<td class="strongpos">'+r.toFixed(2)+"</td>";
    } else {
        var td = '<td>'+r.toFixed(2)+"</td>";
    }
    return td;
}
*/

function makeLinePlotGroup() {
    // Line Charts
    var xScale = new Plottable.Scales.Time();
    var yScale = new Plottable.Scales.Linear();

    var xAxis = new Plottable.Axes.Time(xScale, "bottom");
    var yAxis = new Plottable.Axes.Numeric(yScale, "left");

    var colorScale = new Plottable.Scales.Color()
        .domain(["MUU", "KOK", "RKP", "KD", "VIHR", "SDP", "KESK", "VAS", "PERUSS"])
        .range(["#666666", "#6495ED", "#007ac9", "#0135A5", "#61bf1a", "#E11931", "#95C11F", "#ed1c24", "#004DFF"]);

    var plots = new Plottable.Components.Group();
    var legend = new Plottable.Components.Legend(colorScale);
    legend.maxEntriesPerRow(Infinity);

    var table = new Plottable.Components.Table([
        [yAxis, plots],
        [null, xAxis],
        [null, legend]
    ]);

    table.renderTo("svg#line");

    var w = $("#line").parent().width();
    $("#line").attr("width", WIDTH_FACTOR * w);

    return {
        plots: plots,
        xScale: xScale,
        yScale: yScale,
        colorScale: colorScale
    };
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

function makeScatterPlotMatrix() {
    var table = new Plottable.Components.Table();

    table.renderTo("svg#scatter");

    var w = $("#scatter").parent().width();
    $("#scatter").attr("width", WIDTH_FACTOR * w);
    $("#scatter").attr("height", WIDTH_FACTOR * w);
    table.redraw();

    return {
        plot: table
    };

}

function addScatterPlots(spm, parties) {
    var table = spm.plot;

    var data = parties.map(function (p) {
        return parties.map(function (r) {
            return p.map(function (_, k) {
                return { x: r[k].value, y: p[k].value };
            });
        });
    });

    data.forEach(function (row, i) {
        row.forEach(function (col, j) {
            var xScale = new Plottable.Scales.Linear();
            var yScale = new Plottable.Scales.Linear();

            var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
            var yAxis = new Plottable.Axes.Numeric(yScale, "left");

            var plot = new Plottable.Plots.Scatter()
                .addDataset(new Plottable.Dataset(data[i][j]))
                .x(function (d) { return d.x; }, xScale)
                .y(function (d) { return d.y; }, yScale);

            table.add(new Plottable.Components.Table(
                        [[yAxis, plot],
                         [null, xAxis]]), i, j);
        });
    });

}

function makeCharts() {

    var group = makeLinePlotGroup();
    var spm = makeScatterPlotMatrix();

    d3.csv("/pk.csv", function (error, data) {
//        console.log(data);
        var parseDate = d3.time.format("%Y-%m-%d").parse;
        var partyNames = d3.keys(data[0]).filter(function (key) { return key !== "TIMESTAMP"; });
        var parties = partyNames.map(function (name) {
            return data.map(function (d) {
                return { date: parseDate(d.TIMESTAMP), value: parseFloat(d[name]), name: name };
            });
        });

        addLinePlots(group, parties);
        addScatterPlots(spm, parties);
    });

}


$(function() {
    console.log("Hello, World!")

    // Tabs
    $('.tabs .tab-links a').on('click', function(e) {
        var curHref = $(this).attr('href');
        $('.tabs ' + curHref)
            .show()
            .siblings().hide();
        $(this).parent('li')
            .addClass('active')
            .siblings().removeClass('active');
        e.preventDefault();
    });

    makeCharts();

});
