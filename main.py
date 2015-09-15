import webapp2
import jinja2

from google.appengine.api import urlfetch

import os.path

pkurl = "https://docs.google.com/spreadsheets/d/12nE_Wwv6iV9bcf1M7bzSmDHzH6DG7M5a-X1X2SZRQcA/pub?output=csv"

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)+"/templates"),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

class MainPage(webapp2.RequestHandler):
    def get(self):
        template = JINJA_ENVIRONMENT.get_template("index.html")
        self.response.write(template.render())

class CsvApi(webapp2.RequestHandler):
    def get(self):
        resp = urlfetch.fetch(pkurl)
        if resp.status_code == 200:
            self.response.write(resp.content)
        else:
            self.response.status_int = 500

app = webapp2.WSGIApplication([
    ("/", MainPage),
    ("/pk.csv", CsvApi),
], debug = False)
