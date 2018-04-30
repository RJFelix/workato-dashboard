import * as dynamoDb from '../../lib/dynamodb';
import { success, failure } from '../../lib/response';

export async function main(event, context, callback) {
    const params = {
        TableName: 'wd_recipes',
        Key: {
            userId: event.requestContext.identity.cognitoIdentityId,
            recipeId: event.pathParameters.id,
        },
    };

    try {
        const result = await dynamoDb.perform('get', params);
        if(result.Item) {
            callback(null, success(result.Item));
        } else {
            callback(null, failure({ status: false, error: 'Recipe not found.' }));
        }
    } catch(e) {
        console.log(e);
        callback(null, failure({ status: false, error: 'Problem getting recipe from database.' }));
    }
}