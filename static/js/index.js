function makeCharts() {

    var group = makeLinePlotGroup();
    var spm = makeScatterPlotMatrix();
    addDragBox(group, spm);
    return {
      'line': group,
      'scatter': spm
    };
}

function fetchData(f) {
    d3.csv("/pk.csv", function (error, data) {
//        console.log(data);
        var parseDate = d3.time.format("%Y-%m-%d").parse;
        var partyNames = d3
          .keys(data[0])
          .filter(function (key) { return key !== "TIMESTAMP"; });
        var parties = partyNames.map(function (name) {
            return data.map(function (d) {
                return {
                   date: parseDate(d.TIMESTAMP),
                   value: parseFloat(d[name]),
                   name: name
                };
            });
        });

        f(parties);
    });
}

function log_time(start, end, op) {
  console.log(op + ": " + (end - start));
}

function time_op(f, op) {
  var start = Date.now();
  f();
  var end = Date.now();
  log_time(start, end, op);
}

$(function() {
    console.log("Hello, World!")

    var charts = makeCharts();

    fetchData(function(parties) {
      time_op(function () {
        addLinePlots(charts['line'], parties);
      }, "addLinePlots");
      time_op(function () {
        renderLinePlotGroup(charts['line']);
      }, "renderLinePlotGroup");
      time_op(function () {
        addScatterPlots(charts['scatter'], parties);
      }, "addScatterPlots");
      time_op(function () {
        renderScatterPlotMatrix(charts['scatter']);
      }, "renderScatterPlotMatrix");
    });

});
