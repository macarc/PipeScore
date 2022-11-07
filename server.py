# Firebase does not allow running hosting locally without
# having permission to access the production server
# This script copies the behaviour of the configuration in
# firebase.json, but allows it to run locally without permissions

from http.server import *
import re


class RequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs, directory="public")

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, must-revalidate")
        super().end_headers()

    def do_GET(self):
        if self.path.startswith("/pipescore"):
            self.path = "/pipescore.html"
        elif self.path == "/":
            self.path = "/index.html"
        elif "." not in re.search("([^/]*)$", self.path).group(0):
            self.path += ".html"
        return super().do_GET()


def run():
    addr = ("", 5000)
    httpd = HTTPServer(addr, RequestHandler)
    print("Serving on localhost:5000")
    httpd.serve_forever()


if __name__ == "__main__":
    run()
