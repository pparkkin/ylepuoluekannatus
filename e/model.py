
from google.appengine.ext import ndb

import random
from datetime import date

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

def create_fake_data(n=20):
    return [Datapoint(date=date(2015, 3, (i+1)), value=(random.random() * 30)) for i in range(n)]

def populate_db():
    # clear db
    ndb.delete_multi(Datapoint.query().fetch(keys_only=True))
    ndb.delete_multi(Party.query().fetch(keys_only=True))

    parties = [
        ("KOK", "cornflowerblue"),
        ("SDP", "rgb(225, 25, 49)"),
        ("KESK", "rgb(149, 193, 31)"),
        ("PERUSS", "rgb(0, 35, 149)"),
        ("VIHR", "rgb(97, 191, 26)"),
        ("VAS", "#ed1c24"),
    ]

    for n, c in parties:
        p = Party(parent=pkdata_key(), name=n, color=c)
        data = create_fake_data()
        for d in data: d.put()
        p.data = data
        p.put()

def fetch_data():
    return Party.query().fetch()



