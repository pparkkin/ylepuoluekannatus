
function partyColor(party) {
    return "#1e90ff";
}

function handleData(data, fields) {
    console.log(data);
    console.log(fields);

    /*
    var keys = fields
    var rows = data
        .map(function(o) {
            return keys.map(function(k) { return o[k]; });
        })
        .filter(function(r) {
            // Filter empty rows
            // Papa Parse returns an empty string ("") for missing values.
            return r.slice(1).some(function(v) { return v !== ""; });
        });
    drawLineChart(keys, rows);
    drawScatterplotMatrix(keys, rows);
    */
}

function drawLineChart(keys, rows) {
    var chart = c3.generate({
        bindto: "#line-chart",
        data: {
            x: 'TIMESTAMP',
            rows: [keys].concat(rows)
        },
        axis: {
            x: {
                type: 'timeseries',
                tick: { format: '%Y-%m-%d' }
            }
        },
        point: { r: 1.5 }
    });
};

function drawScatterplotMatrix(keys, rows) {
    // keys = keys[1:] (remove TIMESTAMP)
    var keys = keys.slice(1);
    var cols = keys
        .map(function(k, i) {
            // i+1 to skip TIMESTAMP column
            return rows.map(function(r) { return r[i+1]; });
        });
    drawScatterplots(keys, cols);
    drawCoefficientTable(keys, cols);
}

function drawScatterplots(keys, cols) {
    for (var i = 0; i < keys.length; i++) {
        for (var j = 0; j < keys.length; j++) {
            var spname = "scatterplot_" + i + "_" + j;
            var spdiv = '<div id="' + spname + '"></div>';
            $("#scatterplot-matrix").append(spdiv);
            if (i == j) {
                drawHistogram(spname, keys[i], cols[i]);
            } else {
                drawScatterplot(spname, keys[i], keys[j], cols[i], cols[j]);
            }
        }
    }
}

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


function drawScatterplot(div, key1, key2, data1, data2) {
    var xs = {};
    xs[key2] = key1;
    var columns = [
        [key1].concat(data1),
        [key2].concat(data2)
    ];
    var plot = c3.generate({
        bindto: "#"+div,
        data: {
            xs: xs,
            columns: columns,
            type: "scatter"
        },
        axis: {
            x: { label: key1 },
            y: { label: key2 }
        },
        legend: { show: false },
        tooltip: {
            contents: function(d) {
                var out = '<table class="c3-tooltip">';
                out += "<tr>";
                out += '<td class="name">' + key1 + '</td>';
                out += '<td class="value">' + d[0]["x"] + "</td>";
                out += "</tr>";
                out += "<tr>";
                out += '<td class="name">' + key2 + '</td>';
                out += '<td class="value">' + d[0]["value"] + "</td>";
                out += "</tr>";
                out += "</table>";
                return out;
            }
        },
        size: {
            width: $(window).width()/10,
            height: $(window).width()/10
        }
    });

}

function drawHistogram(div, key, data) {
    var cols = jStat.histogram(data, 10);

    var plot = c3.generate({
        bindto: "#"+div,
        size: {
            width: $(window).width()/10,
            height: $(window).width()/10
        },
        legend: { show: false },
        tooltip: { show: false },
        data: {
            columns: [[key].concat(cols)],
            type: 'bar'
        }
    });

}

function floatCompare(a, b) {
    return a - b;
}

function makeLinePlotGroup() {
    // Line Charts
    var xScale = new Plottable.Scales.Time();
    var yScale = new Plottable.Scales.Linear();

    var xAxis = new Plottable.Axes.Time(xScale, "bottom");
    var yAxis = new Plottable.Axes.Numeric(yScale, "left");

    var colorScale = new Plottable.Scales.Color();

    var plots = new Plottable.Components.Group();
    var legend = new Plottable.Components.Legend(colorScale);
    legend.maxEntriesPerRow(Infinity);

    var table = new Plottable.Components.Table([
        [yAxis, plots],
        [null, xAxis],
        [null, legend]
    ]);

    table.renderTo("svg#line");

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
