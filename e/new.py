
import webapp2

class NewDataSource(webapp2.RequestHandler):
    def get(self):
        self.response.headers['Content-Type'] = 'text/plain'        
        self.response.write("New data source")


application = webapp2.WSGIApplication([
    ('/new', NewDataSource),
], debug=True)

