
import webapp2

class MainDataView(webapp2.RequestHandler):
    def get(self):
        self.response.headers['Content-Type'] = 'text/plain'        
        self.response.write("Main data view")


application = webapp2.WSGIApplication([
    ('/', MainDataView),
], debug=True)

