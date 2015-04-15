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
    return MetaData.query(ancestor=pkdata_key(dataset)).get()

## Actual data sets

class Datapoint(ndb.Model):
    date = ndb.DateProperty(indexed=False)
    value = ndb.FloatProperty(indexed=False)

class Party(ndb.Model):
    name = ndb.StringProperty(indexed=True)
    color = ndb.StringProperty(indexed=False)
    data = ndb.StructuredProperty(Datapoint, repeated=True, indexed=False)

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

def _uniq_by_ts(tvs):
    if len(tvs) == 0: return []
    if len(tvs) == 1: return tvs
    if tvs[0][0] == tvs[1][0]: return _uniq_by_ts(tvs[1:])
    return [tvs[0]] + _uniq_by_ts(tvs[1:])

def _clean_raw(raw):
    tformat = '%Y/%m/%d'

    sd = sorted(raw, key=lambda tv: tv[0])
    cd = [(datetime.strptime(t, tformat), v) for t, v in sd]
    fd = [(t, v) for t, v in cd if t.year >= 2006]
    ud = _uniq_by_ts(fd)
    return ud

def store_data(dataset, data):
    key = pkdata_key(dataset)
    for pi in data:
        n = pi['name']
        c = pi['color']
        p = Party(parent=key, name=n, color=c)
        raw = _clean_raw(pi['datapoints'])
        data = [Datapoint(parent=key, date=t, value=v) for t, v in raw]
        ndb.put_multi(data)
        p.data = data
        p.put()

def fetch_data(dataset):
    return Party.query(ancestor=pkdata_key(dataset)).fetch()

def _copy_datapoints(ds, dataset):
    key = pkdata_key(dataset)
    return [Datapoint(parent=key, date=d.date, value=d.value) for d in ds]

def _copy_party(party, dataset):
    data = _copy_datapoints(party.data, dataset)
    return Party(parent=pkdata_key(dataset), name=party.name, color=party.color, data=data)

def copy_data(from_ds, to_ds):
    clear_data(to_ds)

    ps = fetch_data(from_ds)
    for p in ps:
        np = _copy_party(p, to_ds)
        ndb.put_multi(np.data)
        np.put()

    md = fetch_metadata(from_ds)
    nmd = MetaData(parent=pkdata_key(to_ds), url=md.url, yml=md.yml)
    nmd.put()

