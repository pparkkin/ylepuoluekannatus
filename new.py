import os

from google.appengine.api import urlfetch

import webapp2
import jinja2

import model

from scraper import pkscraper


JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

DATASET = 'preview'

## Data collector is passed to scraper to populate with data

class DataCollector:
    def __init__(self):
        self._results = {}
    def add_point(self, t, p, v):
        pkey = p.upper()
        if pkey in self._results.keys():
            party = self._results[pkey]
        else:
            party = []
            pass
        party.append((t,v))
        self._results[pkey] = party
    def select_party(self, pp):
        return self._results.get(pp.upper(), None)

pcolors = [
    ("KOK", "cornflowerblue"),
    ("SDP", "rgb(225, 25, 49)"),
    ("KESK", "rgb(149, 193, 31)"),
    ("PERUSS", "rgb(0, 35, 149)"),
    ("VIHR", "rgb(97, 191, 26)"),
    ("VAS", "#ed1c24"),
]

def scrape_data(url, yml):
    dc = DataCollector()
    res = urlfetch.fetch(url)
    if res.status_code == 200:
        pkscraper.scrape(dc, res.content, yml)
    return dc

def store_data(dataset, dc):
    data = []
    for n, c in pcolors:
        pi = {
            'name': n,
            'color': c,
            'datapoints': dc.select_party(n),
        }
        data.append(pi)
    model.store_data(dataset, data)

## Handlers for /new

class NewDataSource(webapp2.RequestHandler):
    def get(self):
        m = model.fetch_metadata(DATASET)

        template_values = {
            'url': m.url if m != None else '',
            'yml': m.yml if m != None else '',
        }

        template = JINJA_ENVIRONMENT.get_template('new.html')
        self.response.write(template.render(template_values))

    def post(self):
        url = self.request.get('url')
        #url = "http://www.yle.fi/tvuutiset/uutiset/upics/liitetiedostot/YLE_puoluekannatus_maalis15.htm"
        yml = self.request.get('yml')
        #yml = file('pk.yaml').read()

        dc = scrape_data(url, yml)
        model.clear_data(DATASET)
        #model.clear_data() # Nuclear! For testing.
        store_data(DATASET, dc)
        model.store_metadata(DATASET, url, yml)

        self.redirect('/preview')


application = webapp2.WSGIApplication([
    ('/new', NewDataSource),
], debug=True)

