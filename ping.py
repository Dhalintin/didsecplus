import requests

def lambda_handler(event, context):
    url = https://didsecplus.onrender.com"
    try:
        response = requests.get(url)
        print(f"Pinged {url}: Status {response.status_code}")
    except Exception as e:
        print(f"Error pinging {url}: {e}")
    return {'statusCode': 200}