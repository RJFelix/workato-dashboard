import AWS from 'aws-sdk';

AWS.config.update({ region: 'us-east-1'});

export function perform(action, params) {
    const dynamoDb = new AWS.DynamoDB.DocumentClient();
    return dynamoDb[action](params).promise();
}

export function updateFrom(params) {
    const exprItems = Object.entries(params).map(([k, v]) => {
        if(v === undefined)
            return '';
        return `${k} = :${k}`
    }).join('');
    if(exprItems.length === 0) {
        throw new Error('No update specified.');
    }
    const expression = 'SET ' + exprItems;
    const attributeValues = Object.entries(params).map(([k, v]) => {
        if(v === undefined) {
            return {};
        }
        return {
            [`:${k}`]: v,
        };
    }).reduce((out, cur) => ({ ...out, ...cur }));

    return { expression, attributeValues };
} 
