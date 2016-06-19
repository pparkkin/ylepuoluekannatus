
var WIDTH_FACTOR = 0.9;

function makeScatterPlotMatrix() {
    var table = new Plottable.Components.Table();
    return {
        plot: table
    };
}

function renderScatterPlotMatrix(matrix) {
    var table = matrix.plot;
    table.renderTo("svg#scatter");

    var w = $("#scatter").parent().width();
    $("#scatter").attr("width", WIDTH_FACTOR * w);
    $("#scatter").attr("height", WIDTH_FACTOR * w);
    table.redraw();
}

function makeScatterPlot(data, i, j, xScale, yScale) {
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
  return plot;
}

function makePartyLabel(data, i, j) {
  plot = new Plottable.Components.TitleLabel()
      .text(data[i][j][0].party);
  return plot;
}

function makeRhoLabel(data, i, j) {
  var xs = data[i][j]
      .map(function (d) { return d.x; })
      .filter(function (v) { return !isNaN(v); });
  var ys = data[i][j]
      .map(function (d) { return d.y; })
      .filter(function (v) { return !isNaN(v); });
  var r = jStat.corrcoeff(xs, ys);
  plot = new Plottable.Components.TitleLabel()
      .text(r.toFixed(2));
  return plot;
}

function makeScatterCell(data, i, j) {
  var xScale = new Plottable.Scales.Linear();
  var yScale = new Plottable.Scales.Linear();

  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var plot = null;

  if (i < j) {
    plot = makeScatterPlot(data, i, j, xScale, yScale);
  } else if (i == j) {
    plot = makePartyLabel(data, i, j);
  } else {
    plot = makeRhoLabel(data, i, j);
  }

  return new Plottable.Components.Table(
    [[yAxis, plot],
     [null, xAxis]]);
}

function addScatterPlot(table, plot, i, j) {

  table.add(plot, i, j);

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
          var cell = makeScatterCell(data, i, j);
          addScatterPlot(table, cell, i, j);
        });
    });

}
