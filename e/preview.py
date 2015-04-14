import os

import webapp2
import jinja2

import model

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

PREVIEW_DATASET = 'preview'
LIVE_DATASET = 'live'

class NewDataPreview(webapp2.RequestHandler):
    def get(self):
        (url, yml) = model.fetch_metadata(PREVIEW_DATASET)

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

        data = model.fetch_data(PREVIEW_DATASET)

        template_values = {
            'url': url,
            'yml': yml,
            'data': data,
        }

        template = JINJA_ENVIRONMENT.get_template('preview.html')

        self.response.write(template.render(template_values))


application = webapp2.WSGIApplication([
    ('/preview', NewDataPreview),
], debug=True)

