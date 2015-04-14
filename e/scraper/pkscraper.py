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

def scrape(pk, url, yml):
    tree = html.parse(url)
    descr = yaml.load_all(yml)
    for d in descr:
        scrape_xpath(pk, tree, d)




