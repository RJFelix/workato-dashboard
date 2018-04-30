import * as dynamoDb from '../../lib/dynamodb';
import { success, failure } from '../../lib/response';

export async function main(event, context, callback) {
    const params = {
        TableName: 'wd_users',
    };
    try {
        const result = await dynamoDb.perform('scan', params);
        if(result.Items) {
            callback(null, success(result.Items))
        } else {
            callback(null, failure({ status: false, error: "No users found."}));
        }
    } catch(e) {
        callback(null, failure({ status: false }));
    }
}