import codecs

import yaml
from lxml import html

import paragraph
import table

def scrape_xpath(pk, tree, d):
    fmt = d['format']
    if fmt == 'paragraph':
        paragraph.scrape(pk, tree, d)
    elif fmt == 'table':
        table.scrape(pk, tree, d)
    else:
        print 'Unknown format', fmt
        d['head'] = tree.xpath(d['xpath'])
        print d['head']

def scrape(pk, h, yml):
    tree = html.fromstring(h)
    descr = yaml.load_all(yml)
    for d in descr:
        scrape_xpath(pk, tree, d)


def main(argv):
    hf = codecs.open(argv[1], encoding='latin_1')
    yf = codecs.open(argv[2], encoding='utf-8')

    coll = DataCollector()

    scrape(coll, hf.read(), yf.read())

    print coll.to_csv()

class StringBuilder:
    def __init__(self, init=''):
        self._string = init
    def add_line(self, line):
        self._string = self._string + line + '\n'
    def to_string(self):
        return self._string

class DataCollector:
    def __init__(self):
        self._results = {}
        self._parties = []
    def add_point(self, t, p, v):
        if p.upper() not in self._parties:
            self._parties.append(p.upper())
        
        ts = self._results.get(t, [])
        ts.append((p.upper(),v))
        self._results[t] = ts
    def to_csv(self):
        sb = StringBuilder()

        sb.add_line('TIMESTAMP,' + ','.join(self._parties))

        ts = self._results.keys()
        ts.sort()
        for t in ts:
            ps = self._results[t]
            vs = [al_lookup(p, ps) for p in self._parties]
            sb.add_line(t + ',' + ','.join(vs))

        return sb.to_string()

def al_lookup(p, ps):
    if ps == []: return ''
    if ps[0][0] == p: return str(ps[0][1])
    return al_lookup(p, ps[1:])

if __name__ == '__main__':
    import sys
    main(sys.argv)

