import os
import urllib
import cgi

import webapp2
import jinja2

from google.appengine.api import users
from google.appengine.ext import ndb

import model

DEFAULT_VIEW_NAME = 'default_view'

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

class MainPage(webapp2.RequestHandler):
    def get(self):
        model.populate_db()
        data = model.fetch_data()

        view_name = self.request.get('view', DEFAULT_VIEW_NAME)

        template_values = {
            'data': data
        }

        template = JINJA_ENVIRONMENT.get_template('index.html')

        self.response.write(template.render(template_values))


application = webapp2.WSGIApplication([
    ('/test', MainPage),
], debug=True)

