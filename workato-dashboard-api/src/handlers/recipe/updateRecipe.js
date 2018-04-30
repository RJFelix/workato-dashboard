import * as dynamoDb from '../../lib/dynamodb';
import { success, failure } from '../../lib/response';

export async function main(event, context, callback) {
    const data = JSON.parse(event.body);
    let params;
    try {
        const update = dynamoDb.updateFrom({
            nickname: data.nickname,
            checkInterval: data.checkInterval,
            nagAlerts: data.nagAlerts,
            sendAlerts: data.sendAlerts,
            monitor: data.monitor,
            updatedAt: Date.now(),
        });
        params = {
            TableName: 'wd_recipes',
            Key: {
                userId: event.requestContext.identity.cognitoIdentityId,
                recipeId: event.pathParameters.id,
            },
            UpdateExpression: update.expression,
            ExpressionAttributeValues: update.attributeValues,
            ReturnValues: 'ALL_NEW',
        };
    } catch(e) {
        console.log(e);
        callback(null, failure({ status: false, error: 'No recipe update provided.' }));
    }

    try {
        const result = await dynamoDb.perform('update', params);
        callback(null, success(result.Attributes));
    } catch(e) {
        console.log(e);
        callback(null, failure({ status: false, error: 'Problem updating recipe.' }));
    }
}