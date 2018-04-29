import uuid from 'uuid';
import AWS from 'aws-sdk';

import * as dynamoDb from '../../lib/dynamodb';
import { success, failure } from '../../lib/response';

export async function main(event, context, callback) {
    const data = JSON.parse(event.body);

    const params = {
        TableName: 'wd_users',
        Item: {
            userId: event.requestContext.identity.cognitoIdentityId,
            apiToken: data.apiToken,
            displayName: data.displayName,
            createdAt: Date.now(),
        }
    }

    try {
        await dynamoDb.perform("put", params);
        callback(null, success(params.Item));
    } catch(e) {
        console.log('oh no')
        console.log(e);
        callback(null, failure({ status: false, error: JSON.stringify(e) }));
    }
}