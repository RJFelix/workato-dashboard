import * as dynamoDb from '../../lib/dynamodb';
import { success, failure } from '../../lib/response';

export async function main(event, context, callback) {
    const data = JSON.parse(event.body);
    const update = dynamoDb.updateFrom({ apiToken: data.apiToken, displayName: data.displayName });
    let params;
    try {
        params = {
            TableName: 'wd_users',
            Key: {
                userId: event.pathParameters.id,
            },
            UpdateExpression: update.expression,
            ExpressionAttributeValues: update.attributeValues,
            ReturnValues: "ALL_NEW",
        };
    } catch(e) {
        callback(null, failure({ status: false, error: 'Updated user missing.' }));
    }

    try {
        const result = await dynamoDb.perform('update', params);
        callback(null, success(result.Attributes));
    } catch(e) {
        console.log(e);
        callback(null, failure({ status: false }));
    }
}