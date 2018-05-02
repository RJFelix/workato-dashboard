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
    dynamoDb.perform('deleteItem', params);
    callback(null, success({}));
  } catch(e) {
    console.log(e);
    callback(null, failure({ status: false, error: 'Could not delete item from database.' }));
  }
}