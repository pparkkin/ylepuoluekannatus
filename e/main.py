import os

import webapp2
import jinja2

import model

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

DATASET = 'live'

class MainDataView(webapp2.RequestHandler):
    def get(self):
        m = model.fetch_metadata(DATASET)

        data = model.fetch_data(DATASET)

        template_values = {
            'data': data,
        }

        template = JINJA_ENVIRONMENT.get_template('main.html')

        self.response.write(template.render(template_values))


application = webapp2.WSGIApplication([
    ('/', MainDataView),
], debug=True)

