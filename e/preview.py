
import webapp2

class NewDataPreview(webapp2.RequestHandler):
    def get(self):
        self.response.headers['Content-Type'] = 'text/plain'        
        self.response.write("New data preview")


application = webapp2.WSGIApplication([
    ('/preview', NewDataPreview),
], debug=True)

