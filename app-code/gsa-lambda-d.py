import os
import json
import boto3

# setting up client for dynamodb
table_name = os.getenv('DYNAMODB_TABLE')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(table_name)

def lambda_handler(event, context):
        
    body = json.loads(event['body'])
    
    try:
        label = body['sequence_label']
    except:
        label = None
        
    if label:
        # given a sequence_label
        # respond with the corresponding fib_value
        response = table.get_item(
            Key={
                'sequence_label': label
            }
        )
        
        item = response.get('Item')
        if item:
            return {
                'statusCode': 200,
                'body': json.dumps({'fib_value': str(item.get('fib_value'))})
            }
            
        else:
            return {
                'statusCode': 404,
                'body': "sequence_label '%s' not found in DB" % label
            }
    
    try:
        value = body['fib_value']
    except:
        value = None
        # given a fib_value
        # respond with the corresponding sequence_label(s)
        # Note: there might be multiple labels associated with a value
        
    if value != None:
        # unexpected type error handling
        if type(value) is not int:
            try:
                value = int(value)
            
            except:
                return {
                    'statusCode': 404,
                    'body': "Expected fib_value to be of type int, not %s" % type(value)
                }
        
        items = table.scan()['Items']
        
        labels = []
        for item in items:
            if item.get('fib_value') == value:
                labels.append(item.get('sequence_label'))
        
        if len(labels) == 0:
            return {
                'statusCode': 404,
                'body': "fib_value '%s' not found in DB" % value
            }
        
        elif len(labels) == 1:
            return {
                'statusCode': 200,
                'body': json.dumps({'sequence_label': labels[0]})
            }
        
        else:
            return {
                'statusCode': 200,
                'body': json.dumps({'sequence_labels': labels})
            }


    return {
        'statusCode': 404,
        'body': "Expected 'sequence_label' or 'fib_value' in request body",
        'error': json.dumps(body)
    }