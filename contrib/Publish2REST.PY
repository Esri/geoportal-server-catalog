#!/usr/bin/python
# This python tool was created by NOAA National Centers for Environmental Information (NCEI).
# NOAA and NCEI cannot provide any warranty as to the accuracy, reliability, or completeness of the tool.
# The user is responsible for the results of any application of this tool for other than its intended purpose.
# Any questions, please contact NCEI.info@noaa.gov".

import pycurl
import urlparse
import urllib
import os
import sys
  
# Put basic authentication credentials in this file in the form username:password.
credFile = '.gptauth'
   
# The URL for the geoportal's document management API.
##url = 'https://geoportalname/rest/manage/document'
# ESRI - 2.0 url is different
url = 'http://localhost:8080/geoportal/rest/metadata/item'

# Log stream. If you plan to run this in parallel, you shouldn't write to a fixed file.
log = sys.stdout

# Debug transaction. Really noisy if you turn it on.
debug = False

# Read credentials.
auth = open(credFile, 'r')
authString = auth.read().rstrip()
auth.close()

# Parse the URL. 4 is the index of the query string.
u = list(urlparse.urlparse(url))
q = dict(urlparse.parse_qs(u[4]))

# Couple of callback functions.
def test(debugType, debugMsg):
  print "debug(%d): %s" % (debugType, debugMsg)
def ignore(buf):
  None

c = pycurl.Curl()

if (debug):
  # Dump everything.
  c.setopt(pycurl.VERBOSE, 1)
  c.setopt(pycurl.DEBUGFUNCTION, test)
else:
  # Don't dump any error output.
  c.setopt(pycurl.WRITEFUNCTION, ignore)

# Use cookies, but don't save them to a file. If they get saved then there is a race condition among parallel instances.
c.setopt(pycurl.COOKIEFILE, '') # for JSESSIONID cookie

# Set credentials for first access.
c.setopt(pycurl.USERPWD, authString)

# SSL options
c.setopt(pycurl.SSL_VERIFYPEER, 1)
c.setopt(pycurl.SSL_VERIFYHOST, 2)
c.setopt(pycurl.CAINFO, "/path/esri.pem") # needs to be modified to the location of your .pem file

# Attempt to manage a dummy file. This establishes authentication, and gets us a JSESSIONID cookie we can use.
q['id'] = 'phony-id.xml'
u[4] = urllib.urlencode(q, doseq=True)
del(q['id'])
c.setopt(c.URL, urlparse.urlunparse(u))
c.perform()

if debug:
  status = str(c.getinfo(pycurl.HTTP_CODE))
  log.write('%s %s\n' % (status, 'authentication'))

# We have now authenticated and the JSESSIONID cookie should establish all future authentication (until it expires).
# ESRI - 2.0 keep the credendial in the header , could switch this to an OAuth token
#c.unsetopt(pycurl.USERPWD)

# Switch to PUT since we're going to be sending files now.
c.setopt(pycurl.PUT, 1)

# ESRI - Set content type on the HTTP header
c.setopt(pycurl.HTTPHEADER, ["Content-type: application/xml"])

# Set auto-approve in the URL.
q['approve'] = 'true'
u[4] = urllib.urlencode(q, doseq=True)
del(q['approve'])
c.setopt(c.URL, urlparse.urlunparse(u))

# Iterate over input files.
for fname in sys.argv[1:]:
  f = open(fname, 'r')
  fsize = os.fstat(f.fileno()).st_size
  c.setopt(pycurl.INFILESIZE, fsize)
  c.setopt(pycurl.INFILE, f)
  c.perform()
  status = str(c.getinfo(pycurl.HTTP_CODE))
  log.write('%s %s\n' % (status, fname))
  f.close()

log.close()
