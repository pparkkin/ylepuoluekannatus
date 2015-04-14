import os

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

## Handlers for /new

class NewDataSource(webapp2.RequestHandler):
    def get(self):
        template = JINJA_ENVIRONMENT.get_template('new.html')
        self.response.write(template.render())

    def post(self):
        #url = self.request.get('url')
        url = "http://www.yle.fi/tvuutiset/uutiset/upics/liitetiedostot/YLE_puoluekannatus_maalis15.htm"
        #yml = self.request.get('yml')
        yml = file('pk.yaml').read()

## Scraping...
        dc = DataCollector()
        pkscraper.scrape(dc, url, yml)
## End scraping ...

        model.clear_data()

## Push data...
        data = []
        for n, c in pcolors:
            pi = {
                'name': n,
                'color': c,
                'datapoints': dc.select_party(n),
            }
            data.append(pi)
        model.store_data(DATASET, data)
## End push data...

        model.store_metadata(DATASET, url, yml)
        self.redirect('/preview')


application = webapp2.WSGIApplication([
    ('/new', NewDataSource),
], debug=True)

