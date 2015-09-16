
function handleData(data, fields) {
    var keys = fields.filter(function(f) { return f != "TIMESTAMP"; });
    var rows = data
        .map(function(o) {
            return keys.map(function(k) { return o[k]; });
        })
        .filter(function(r) {
            // Papa Parse returns an empty string ("") for missing values.
            return r.some(function(v) { return v !== ""; });
        });
    drawLineChart(keys, rows);
    drawScatterplotMatrix(keys, rows);
}

function drawLineChart(keys, rows) {
    var chart = c3.generate({
        bindto: "#line-chart",
        data: {
            rows: [keys].concat(rows)
        },
        point: { r: 1.5 }
    });
};

function drawScatterplotMatrix(keys, rows) {
    var cols = keys
        .map(function(k, i) {
            return rows.map(function(r) { return r[i]; });
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

    // Fetch and parse CSV + handle
    Papa.parse("/pk.csv", {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: function(results) {
            handleData(results.data, results.meta.fields);
        }
    });
});
