import * as dynamoDb from '../../lib/dynamodb';
import { success, failure } from '../../lib/response';

export async function main(event, context, callback) {
    const params = {
        TableName: 'wd_users',
        Key: {
            userId: event.pathParameters.id,
        }
    };

    try {
        const result = await dynamoDb.perform('get', params);
        if(result.Item) {
            callback(null, success(result.Item));
        } else {
            callback(null, failure({ status: false, error: "User not found." }));
        }
    } catch(e) {
        console.log('oh no')
        console.log(e);
        console.log(params);
        callback(null, failure({status: false}));
    }
}