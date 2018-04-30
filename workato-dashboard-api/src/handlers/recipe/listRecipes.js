import * as dynamoDb from '../../lib/dynamodb';
import { success, failure } from '../../lib/response';

export async function main(event, context, callback) {
    const params = {
        TableName: 'wd_recipes',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': event.requestContext.identity.cognitoIdentityId,
        },
    };

    try {
        const results = await dynamoDb.perform('query', params);
        if(!results.Items) {
            return callback(null, failure({ status: false, error: 'Could not get recipes from database.' }));
        }
        if(results.Items.length === 0) {
            return callback(null, failure({ status: false, error: 'No recipes found for this user.' }));
        }
        return callback(null, success(results.Items));
        console.log(results);
    } catch(e) {
        console.log(e);
        callback(null, failure({ status: false, error: 'Problem fetching recipes from database.' }));
    }

}