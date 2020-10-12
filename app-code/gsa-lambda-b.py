import os
import json
import boto3
from decimal import *
from datetime import datetime as dt

# setting up client for dynamodb
table_name = os.getenv('DYNAMODB_TABLE')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(table_name)

# scanning dynamodb table for items and get count
def scan_result():
    scan = table.scan()
    return scan['Items'], scan['ScannedCount']

def lambda_handler(message, context):
    
    items, count = scan_result()
    
    sequence_label = message['Payload']['sequenceLabel']
    
    # base case: if zero or one values exist, return 0 and db item count
    if(count <= 1):
        first_val, second_val = 0, count
    else:
        # sorting items based on fib_val descending to get 2 max values
        get_fib_value = lambda i: int(i['fib_value'])
        max_vals = sorted(items, key = get_fib_value, reverse=True)[:2]
        first_val = max_vals[0]['fib_value']
        second_val = max_vals[1]['fib_value']


    response = {
        'sequenceLabel': sequence_label,
        'firstVal': str(first_val),
        'secondVal': str(second_val),
        'timestamp': dt.now().strftime("%Y-%m-%d %H-%M-%S"),
        'statusCode': 200
    }
    
    return response

