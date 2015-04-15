import logging

from google.appengine.ext import ndb

import random
from datetime import date
from datetime import datetime

## Parent keys for data sets

DEFAULT_DATASET='default'

def pkdata_key(dataset_name=DEFAULT_DATASET):
    return ndb.Key('PKData', dataset_name)

## Meta data for data sets

class MetaData(ndb.Model):
    url = ndb.StringProperty(indexed=False)
    yml = ndb.StringProperty(indexed=False)

def store_metadata(dataset, url, yml):
    m = MetaData(parent=pkdata_key(dataset), url=url, yml=yml)
    m.put()

def fetch_metadata(dataset):
    ms = MetaData.query(ancestor=pkdata_key(dataset)).fetch()
    if len(ms) > 0:
        return (ms[0].url, ms[0].yml)
    else:
        return (None, None)

## Actual data sets

class Datapoint(ndb.Model):
    date = ndb.DateProperty(indexed=False)
    value = ndb.FloatProperty(indexed=False)

class Party(ndb.Model):
    name = ndb.StringProperty(indexed=True)
    color = ndb.StringProperty(indexed=False)
    data = ndb.StructuredProperty(Datapoint, repeated=True)

def clear_data(dataset=None):
    # clear db
    if dataset:
        ndb.delete_multi(Datapoint.query(ancestor=pkdata_key(dataset)).fetch(keys_only=True))
        ndb.delete_multi(Party.query(ancestor=pkdata_key(dataset)).fetch(keys_only=True))
        ndb.delete_multi(MetaData.query(ancestor=pkdata_key(dataset)).fetch(keys_only=True))
    else:
        ndb.delete_multi(Datapoint.query().fetch(keys_only=True))
        ndb.delete_multi(Party.query().fetch(keys_only=True))
        ndb.delete_multi(MetaData.query().fetch(keys_only=True))

def _clean_raw(raw):
    tformat = '%Y/%m/%d'

    raw = sorted(raw, key=lambda tv: tv[0])
    return [(datetime.strptime(t, tformat), v) for t, v in raw]

def store_data(dataset, data):
    key = pkdata_key(dataset)
    for pi in data:
        n = pi['name']
        c = pi['color']
        p = Party(parent=key, name=n, color=c)
        raw = _clean_raw(pi['datapoints'])
        data = [Datapoint(parent=key, date=t, value=v) for t, v in raw]
        for d in data: d.put()
        p.data = data
        p.put()

def fetch_data(dataset):
    return Party.query(ancestor=pkdata_key(dataset)).fetch()



