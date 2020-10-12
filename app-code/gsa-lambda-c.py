import os
import json
import boto3
from decimal import Decimal
from datetime import datetime as dt

# setting up client for dynamodb
table_name = os.getenv('DYNAMODB_TABLE')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(table_name)

def lambda_handler(message, context):
    
    payload = message['Payload']

    sum = int(payload['firstVal']) + int(payload['secondVal'])
    sequence_label = payload['sequenceLabel']
    
    response = table.put_item(
        Item = {
            'fib_value': Decimal(sum),
            'sequence_label': sequence_label
        }
    )
    
    return response

