import logging

from google.appengine.ext import ndb

import random
from datetime import date
from datetime import datetime

import yaml

from scraper import pkscraper

DEFAULT_DATASET='default'

def pkdata_key(dataset_name=DEFAULT_DATASET):
    return ndb.Key('PKData', dataset_name)

class Datapoint(ndb.Model):
    date = ndb.DateProperty()
    value = ndb.FloatProperty()

class Party(ndb.Model):
    name = ndb.StringProperty(indexed=True)
    color = ndb.StringProperty(indexed=False)
    data = ndb.StructuredProperty(Datapoint, repeated=True)

class DataCollector:
    # Rickshaw data looks like this:
    # series:
    # {
    #   name: 'SDP',
    #   color: 'red',
    #   data: [
    #     {x: 0, y: 22},
    #     {x: 1, y: 16},
    #     ...
    #   ]
    # }
    def __init__(self):
        self._results = {}
    def add_point(self, t, p, v):
        pkey = p.upper()
        if pkey in self._results.keys():
            # fetch party
            party = self._results[pkey]
        else:
            # create party
            party = []
            pass
        # add data point (t, v)
        party.append((t,v))
        self._results[pkey] = party
    def select_party(self, pp):
        return self._results.get(pp.upper(), None)
#    def select_time(self, tt):
#        res = []
#        for t, p, v in self._results:
#            if t == tt: res.append((t, p, v))
#        return res

def create_fake_data(n=20):
    return [Datapoint(date=date(2015, 3, (i+1)), value=(random.random() * 30)) for i in range(n)]

def read_yaml():
    stream = file('pk.yaml')
    return yaml.load_all(stream)

def populate_db():
    # clear db
    ndb.delete_multi(Datapoint.query().fetch(keys_only=True))
    ndb.delete_multi(Party.query().fetch(keys_only=True))

    pcolors = [
        ("KOK", "cornflowerblue"),
        ("SDP", "rgb(225, 25, 49)"),
        ("KESK", "rgb(149, 193, 31)"),
        ("PERUSS", "rgb(0, 35, 149)"),
        ("VIHR", "rgb(97, 191, 26)"),
        ("VAS", "#ed1c24"),
    ]

    pkurl = "http://www.yle.fi/tvuutiset/uutiset/upics/liitetiedostot/YLE_puoluekannatus_maalis15.htm"
    dc = DataCollector()
    # read yaml
    descr = read_yaml()
    pkscraper.scrape(dc, pkurl, descr)

    tformat = '%Y/%m/%d'

    for n, c in pcolors:
        p = Party(parent=pkdata_key(), name=n, color=c)
        data = [Datapoint(date=datetime.strptime(t, tformat), value=v) for t, v in dc.select_party(n)]
        for d in data: d.put()
        p.data = data
        p.put()

def fetch_data():
    return Party.query().fetch()



