import uuid from 'uuid';
import fetch from 'node-fetch';
import * as dynamoDb from '../../lib/dynamodb';
import { success, failure } from '../../lib/response';

export async function main(event, context, callback) {
    const data = JSON.parse(event.body);

    let user;
    try {
        const userParams = {
            TableName: 'wd_users',
            Key: {
                userId: event.requestContext.identity.cognitoIdentityId,
            },
        };
        const result = await dynamoDb.perform('get', userParams);
        if(!result.Item) {
            return callback(null, failure({ status: false, error: 'User not found.' }));
        }
        if(!result.Item.apiToken) {
            return callback(null, failure({ status: false, error: 'User does not have a Workato API token.' }));
        }
        user = result.Item;
    } catch(e) {
        return callback(null, failure({ status: false, error: 'Problem getting user from database.' }));
    }

    let recipeInfo;
    try {
        const workatoRes = await fetch(`https://www.workato.com/api/recipes/${data.workatoId}?user_token=${user.apiToken}&user_email=${user.workatoEmail}`);
        recipeInfo = await workatoRes.json();
        console.log(recipeInfo);
    } catch(e) {
        console.log(e);
        return callback(null, failure({ status: false, error: 'Problem getting recipe info from Workato.' }));
    }

    const params = {
        TableName: 'wd_recipes',
        Item: {
            userId: event.requestContext.identity.cognitoIdentityId,
            workatoId: data.workatoId,
            workatoName: recipeInfo.name,
            nickname: data.nickname,
            lastChecked: Date.now(),
            lastStatus: recipeInfo.running,
            monitor: false,
            checkInterval: 86400000, // 1 day
            nagAlerts: false,
            sendAlerts: false,
            alertSent: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            recipeId: uuid.v4(),
            apiToken: user.apiToken,
            workatoEmail: user.workatoEmail,
        }
    };

    try {
        await dynamoDb.perform('put', params);
        callback(null, success(params.Item));
    } catch(e) {
        console.log(e);
        callback(null, failure({ status: false, error: 'Problem inserting recipe into database.' }));
    }

}