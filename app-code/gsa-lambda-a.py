# Lambda A: 
# read DB to avoid used names
# read S3 to get first unused name, then return it to step function

import os
import json
import boto3

def lambda_handler(event, context):

    table_name = os.getenv('DYNAMODB_TABLE')
    bucket_name = os.getenv('S3_BUCKET')

    s3 = boto3.resource('s3')
    obj = s3.Object(bucket_name, 'names.txt')
    body = obj.get()['Body'].read().decode("utf-8")
    
    names = body.splitlines()
    
    # setting up client for dynamodb
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(table_name)
    
    for name in names:
        response = table.get_item(
            Key={
                'sequence_label': name
            }
        )
        
        # skip already used names
        if not response.get("Item"):
            return {
                'statusCode': 200,
                'sequenceLabel': name
            }
    
    # reached the end of file, all names were used
    return {
        'statusCode': 200,
        'sequenceLabel': None
    }
