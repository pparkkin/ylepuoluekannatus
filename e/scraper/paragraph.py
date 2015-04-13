from lxml import html

def take_while(pred, elem):
    #print elem, pred(elem) # debug
    if elem is None:
        return []
    if not pred(elem):
        return []
    #print 'go' # debug
    rest = take_while(pred, elem.getnext())
    #print elem, ' ++ ', rest # debug
    rest.append(elem)
    return rest

def results_from(elem):
    def lh_check(e):
        if e is None: return False
        if 'style' not in e.attrib: return False
        return 'line-height:24.0pt' in e.attrib['style']

    n = elem.getnext()

    while n is not None:
        if lh_check(n):
            rest = take_while(lh_check, n.getnext())
            rest.append(n)
            return rest
        n = n.getnext()

    return []

def flatten(l):
    return [item for sublist in l for item in sublist]

def all_text(elem):
    t = elem.text
    if t is not None and t.strip() != '':
        hd = [t.strip()]
    else:
        hd = []
    #print hd # debug

    rst = [all_text(c) for c in elem.getchildren()]
    rst = flatten(rst)
    rst = filter(None, rst)

    t = elem.tail
    if t is not None and t.strip() != '':
        tl = [t.strip()]
    else:
        tl = []
    #print tl # debug

    out = hd + rst + tl

    #print out # debug
    return out

def to_float_list(ts):
    fs = []
    ts = [s.strip() for s in ts]
    ts = filter(lambda s: len(s) > 1, ts)
    for t in ts:
        try:
            fs.append(float(t.replace(',', '.')))
        except ValueError:
            #print '"%s"' % t # debug
            #fs.append(None)
            pass
    return fs

def compile_results(rs):
    dd = {}
    for ts in [all_text(r) for r in rs]:
        if len(ts) < 2: continue
        dd[ts[0]] = to_float_list(ts[1:])
    return dd

def scrape(pk, tree, d):
    d['head'] = tree.xpath(d['xpath'])[0]
    results = compile_results(results_from(d['head']))
    #print d['year']
    for p in results:
        for t, v in zip(d['dates'], results[p]):
            pk.add_point(t, p, v)


