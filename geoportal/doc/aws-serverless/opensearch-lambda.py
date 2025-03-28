import boto3
import json
import requests
from requests_aws4auth import AWS4Auth


region = 'us-east-1' # For example, us-west-1
service = 'aoss'
credentials = boto3.Session().get_credentials()
awsauth = AWS4Auth(credentials.access_key, credentials.secret_key, region, service, session_token=credentials.token)

# The OpenSearch domain endpoint with https:// and without a trailing slash
host = 'https://73ndg6pb0y39khhm7ij7.us-east-1.aoss.amazonaws.com'
#host = 'https://txjwwmxxavpt5fulgmxc.us-east-1.aoss.amazonaws.com'

# Lambda execution starts here
def lambda_handler(event, context):
    print('event:', json.dumps(event))     

    reqpath = event['path']    

    if(len(reqpath) > 1):
        url = host + reqpath        
    else:
        url = host

    print("url with path",url)

    method = event['httpMethod']
    requestbody = event['body']
    
    reqBody ={}
    bulkReqIndex = url.find('_bulk')

    if requestbody :
        if bulkReqIndex >-1 :
            reqBody = requestbody
        else :
            reqBody.update(json.loads(requestbody))        

    queryParam = event['queryStringParameters']
    if queryParam:       
        index = url.find('point_in_time')
        if(index > -1):            
            keepAliveSec = queryParam['keep_alive']
            url = url+'?keep_alive='+keepAliveSec           
        else:               
            reqBody.update(queryParam)   
   
  
    # Elasticsearch 6.x requires an explicit Content-Type header
    headers = { "Content-Type": "application/json" }

    # Make the signed HTTP request
    if bulkReqIndex > -1:
        reqdata = reqBody
    else:
        reqdata = json.dumps(reqBody)

    print("request data",reqdata)

    r = requests.request(method, url, auth=awsauth, headers=headers,data=reqdata)
    print("response ",r)
    # Create the response and add some extra content to support CORS
    response = {
        "statusCode": r.status_code,
        "headers": {
            "Access-Control-Allow-Origin": '*'
        },
        "isBase64Encoded": False
    }

    # Add the search results to the response
    response['body'] = r.text
    return response
    