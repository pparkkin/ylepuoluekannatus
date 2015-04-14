import os

import webapp2
import jinja2

import model

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

DATASET = 'preview'

class NewDataSource(webapp2.RequestHandler):
    def get(self):
        template = JINJA_ENVIRONMENT.get_template('new.html')
        self.response.write(template.render())

    def post(self):
        url = self.request.get('url')
        yml = self.request.get('yml')
        model.clear_db()
        model.store_metadata(DATASET, url, yml)
        self.redirect('/preview')


application = webapp2.WSGIApplication([
    ('/new', NewDataSource),
], debug=True)

