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
