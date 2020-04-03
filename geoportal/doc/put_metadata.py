#!/usr/bin/python
# crawls a folder structure of XML files and publishes those to Geoportal Sever 2.x

import os
import sys
import httplib
from base64 import b64encode


# The URL for the geoportal 2.x's API.
connection = httplib.HTTPConnection('www.example.com')
userAndPass = b64encode(b"username:password").decode("ascii")
headers = {'Authorization': 'Basic %s' % userAndPass, 'Content-type': 'application/xml'}

# Log stream
log = sys.stdout


def publish_metadata(f_name):
    f = open(f_name, 'r')
    body_content = f.read()
    connection.request('PUT', '/geoportal/rest/metadata/item', body_content, headers)
    result = connection.getresponse()
    result.read()
    log.write('%s %s\n' % (result.status, f.name))
    f.close()


# Iterate over input files.
for dir_path, dir_names, file_names in os.walk("C:/example/path/to/metadata", True):
    for filename in file_names:
        theItem = os.path.join(dir_path, filename)
        publish_metadata(theItem)

log.close()
