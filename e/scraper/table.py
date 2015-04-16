# coding: utf8
import operator

from lxml import html

def drop_while(pred, elem):
    if elem is None:
        return elem
    if not pred(elem):
        return elem
    return drop_while(pred, elem.getnext())

def take_until(pred, elem):
    if elem is None:
        return []
    if pred(elem):
        return []
    rest = take_until(pred, elem.getnext())
    rest.append(elem)
    return rest

# get the correct table rows
def results_from(elem):
    def first_row(e):
        #print e # debug
        if e is None: return False
        if 'style' not in e.attrib: return False
        #print e.attrib['style'] # debug
        return 'height:13.35pt' in e.attrib['style']
    def last_row(e):
        return e is None

    fst = drop_while((lambda e: not first_row(e)), elem)
    #print fst # debug
    rows = take_until(last_row, fst)
    #print rows # debug

    return rows

def text_value(td):
    txt = [e.text for e in td.iterdescendants()]
    return reduce(operator.add, filter(None, txt), '')

def to_float_list(ts):
    fs = []
    ts = [s.strip() for s in ts]
    ts = filter(lambda s: len(s) > 1, ts)
    for t in ts:
        try:
            fs.append(float(t.replace(',', '.')))
        except ValueError:
            #print '"%s"' % t # debug
            fs.append(None)
    return fs

def results_from_row(row):
    tds = row.getchildren()
    if len(tds) < 2: return None
    ptd = text_value(tds[0])
    ptd = ptd if ptd != u'Vihreät' else 'VIHR'
    vtds = tds[1:]
    return (ptd, to_float_list([text_value(vtd) for vtd in vtds]))

# extract values from the rows
def compile_results(rs):
    return [results_from_row(r) for r in rs]

def scrape(pk, tree, d):
    d['head'] = tree.xpath(d['xpath'])[0]
    fstchld = d['head'].getchildren()[0]
    results = compile_results(results_from(fstchld))
    #print d['year']
    for p, vs in results:
        for t, v in zip(d['dates'], vs):
            pk.add_point(t, p, v)


