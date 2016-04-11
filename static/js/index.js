
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
                return { x: r[k].value, y: p[k].value, date: r[k].date, party: r[k].name };
            });
        });
    });

    data.forEach(function (row, i) {
        row.forEach(function (col, j) {
            var xScale = new Plottable.Scales.Linear();
            var yScale = new Plottable.Scales.Linear();

            var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
            var yAxis = new Plottable.Axes.Numeric(yScale, "left");

            var plot = null;

            if (i < j) {
                var ds = new Plottable.Dataset(data[i][j]);
                plot = new Plottable.Plots.Scatter()
                    .addDataset(ds)
                    .x(function (d, i, ds) {
                        var md = ds.metadata();
                        if (!md.left || !md.right) return d.x;
                        if (md.left < d.date && d.date < md.right) return d.x;
                        return null;
                    }, xScale)
                    .y(function (d, i, ds) {
                        var md = ds.metadata();
                        if (!md.left || !md.right) return d.y;
                        if (md.left < d.date && d.date < md.right) return d.y;
                        return null;
                    }, yScale);
            } else if (i == j) {
                plot = new Plottable.Components.TitleLabel()
                    .text(data[i][j][0].party);
            } else {
                var xs = data[i][j]
                    .map(function (d) { return d.x; })
                    .filter(function (v) { return !isNaN(v); });
                var ys = data[i][j]
                    .map(function (d) { return d.y; })
                    .filter(function (v) { return !isNaN(v); });
                var r = jStat.corrcoeff(xs, ys);
                plot = new Plottable.Components.TitleLabel()
                    .text(r.toFixed(2));
            }

            table.add(new Plottable.Components.Table(
                        [[yAxis, plot],
                         [null, xAxis]]), i, j);

        });
    });

}

function scatterplotAt(spm, r, c) {
    var t = spm.componentAt(r, c);
    if (!t) {
        console.error("Scatter plot table "+t+" at ("+r+", "+c+")");
        return null;
    }
    var p = t.componentAt(0, 1);
    return p;
}

function addDragBox(group, spm) {
    var dragbox = new Plottable.Components.XDragBoxLayer();
    var xScale = group.xScale;
    dragbox.onDragEnd(function (box) {
        var left = box.topLeft.x;
        var right = box.bottomRight.x;
        //console.log({ left: left, right: right });
        var clear = false;
        if (left == right) clear = true;

        //console.log(clear);
        var nr = spm.plot._nRows;
        var nc = spm.plot._nCols;
        for (var r = 0; r < nr; r++) {
            for (var c = 0; c < nc; c++) {
                if (r < c) {
                    var sp = scatterplotAt(spm.plot, r, c);
                    if (!sp) {
                        continue;
                    }
                    var ds = sp.datasets();
                    if (clear) {
                        ds[0].metadata({});
                    } else {
                        var leftD = xScale.invert(left);
                        var rightD = xScale.invert(right);
                        //console.log({ left: leftD, right: rightD });
                        var md = ds[0].metadata();
                        md.left = leftD;
                        md.right = rightD;
                        ds[0].metadata(md);
                    }
                } else if (c < r) {
                    var leftD = xScale.invert(left);
                    var rightD = xScale.invert(right);
                    var sp = scatterplotAt(spm.plot, c, r);
                    if (!sp) {
                        continue;
                    }
                    var ds = sp.datasets()[0];
                    var d = ds.data()
                        .filter(function (o) {
                            return (leftD < o.date && o.date < rightD);
                        });
                    var xs = d
                        .map(function (o) { return o.x; })
                        .filter(function (v) { return !isNaN(v); });
                    var ys = d
                        .map(function (o) { return o.y; })
                        .filter(function (v) { return !isNaN(v); });
                    var rho = jStat.corrcoeff(xs, ys);
                    var t = scatterplotAt(spm.plot, r, c);
                    t.text(rho.toFixed(2));
                }
            }
        }
    });
    group.plots.append(dragbox);
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
        addDragBox(group, spm);
    });

}


$(function() {
    console.log("Hello, World!")

    // Tabs
    /*
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
    */

    makeCharts();

});
