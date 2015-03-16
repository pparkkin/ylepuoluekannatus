import os
import urllib
import cgi

import webapp2
import jinja2

from google.appengine.api import users
from google.appengine.ext import ndb

DEFAULT_VIEW_NAME = 'default_view'

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

def fetch_data():
    return ['hello', 'world']

class MainPage(webapp2.RequestHandler):
    def get(self):
        view_name = self.request.get('view', DEFAULT_VIEW_NAME)

        data = fetch_data()
        template_values = {
            'data': data
        }

        template = JINJA_ENVIRONMENT.get_template('index.html')

        self.response.write(template.render(template_values))

ADMIN_FORM_HTML = """\
<html>
    <body>
        <form action="/yleurl" method="post">
            <div><input type="text" name="url" /></div>
            <div><input type="submit" /></div>
        </form>
        <p><a href="%s">Logout</a></p>
    </body>
</html>
"""

class AdminPage(webapp2.RequestHandler):
    def get(self):
        if users.is_current_user_admin():
            self.response.write(ADMIN_FORM_HTML %
                    users.create_logout_url('/admin'))
        else:
            self.response.out.write('<html><body><a href="%s">Login</a></body></html>' %
                    users.create_login_url('/admin'))

def db_key(view_name=DEFAULT_VIEW_NAME):
    return ndb.Key('YLETimeline', view_name)

class YLEUrlModel(ndb.Model):
    url = ndb.StringProperty(indexed=False)

class YLEUrl(webapp2.RequestHandler):
    def post(self):
        if not users.is_current_user_admin():
            self.response.out.write('<html><body><a href="%s">Login</a></body></html>' %
                    users.create_login_url('/admin'))
            return

        url = self.request.get('url')
        yleurl = YLEUrlModel(url=url)
        yleurl.put()

        self.response.write('<html><body>')
        self.response.write(cgi.escape(url))
        self.response.write('</body></html>')

application = webapp2.WSGIApplication([
    ('/', MainPage),
    ('/admin', AdminPage),
    ('/yleurl', YLEUrl),
], debug=True)

