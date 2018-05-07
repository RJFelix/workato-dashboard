import fetch from 'node-fetch';
import * as dynamoDb from '../../lib/dynamodb';
import { success, failure } from '../../lib/response';

export async function main(event, context, callback) {
    const params = {
        TableName: 'wd_recipes',
        IntexName: 'Monitored',
        KeyConditionExpression: 'monitor = :monitor',
        ExpressionAttributeValues: {
            ':monitor': true,
        },
        ProjectionExpression: 'userId, workatoId, lastChecked, lastStatus, checkInterval, nagAlerts, sendAlerts, alertSent, recipeId, apiToken, workatoEmail',
    }

    try {
        const result = dynamoDb.perform('query', params);
        if(!result.Items || result.Items.length === 0) {
            console.log('No monitored recipes found.')
            return callback(null);
        }
        // find recipes that should be checked now
        const now = Date.now();
        const allRecipes = result.Items;
        const shouldBeChecked = allRecipes.filter(r => r.lastChecked + r.checkInterval <= now);

        // group by user
        const byUser = new Map();
        for(let recipe of shouldBeChecked) {
            const user = byUser.get(recipe.userId);
            // user exists
            if(user) {
                // mutating the recipes array here
                user.recipes.push(recipe);
            } else {
            // user does not exist, create them
                const newUser = {
                    recipes: [],
                    apiToken: recipe.apiToken,
                    workatoEmail: recipe.workatoEmail,
                }
                byUser.set(recipe.userId, newUser);
            }
        }

        // query Workato for each user
        const alerts = [];
        const recipeUpdates = [];
        for(let [userId, user] of byUser) {
            const res = await fetch(`https://www.workato.com/api/recipes?user_token=${user.apiToken}&user_email=${user.workatoEmail}`);
            const recipes = await res.json().items;
            user.recipes.forEach(rec => {
                const thisRec = recipes.find(r => r.id === rec.workatoId);
                if(thisRec) {
                    let alertSent = rec.alertSent;
                    if(!thisRec.running) {
                        // should alert if:
                        // alertSent false
                        // nagAlerts on
                        // nagAlerts off, lastStatus true
                        if(!rec.alertSent
                            || rec.nagAlerts
                            || !rec.lastStatus) {
                            // add an alert
                            const a = {
                                workatoEmail: rec.workatoEmail,
                                recipeName: thisRec.name,
                            }
                            alerts.push(a);
                            alertSent = true;
                        }
                    } else {
                        alertSent = false;
                    }
                    const updatedRec = {
                        userId: rec.userId,
                        recipeId: rec.recipeId,
                        lastChecked: now,
                        lastStatus: thisRec.running,
                        alertSent, 
                    };
                    recipeUpdates.push(updatedRec);
                } else {
                    // recipe must have been deleted?
                    console.log(`Recipe with id ${rec.workatoId} not found.`);
                }
            });
        }
        // group alerts by email
        const alertsByEmail = alerts.reduce((byEmail, alert) => {
            if(byEmail[alert.workatoEmail]) {
                byEmail[alert.workatoEmail].push(alert.recipeName);
            } else {
                byEmail[alert.workatoEmail] = [alert.recipeName];
            }
            return byEmail;
        });
        // TODO: actually send an email here
        for(email in alertsByEmail) {
            if(alertsByEmail.hasOwnProperty(email)) {
                console.log(`*** SEND ALERT TO ${email} -- RECIPES OFFLINE ${alertsByEmail[email].join(',')}`);
            }
        }
        // update the DB
        // wtf DynamoDB doesn't support batch updates?
        // what a money grab.
        const updates = recipeUpdates.map(ru => {
            const u = dynamoDb.updateFrom({
                lastChecked: ru.lastChecked,
                lastStatus: ru.lastStatus,
                alertSent: ru.alertSent,
            });
            return {
                TableName: 'wd_recipes',
                Key: {
                    userId: ru.userId,
                    recipeId: ru.recipeId,
                },
                UpdateExpression: u.expression,
                ExpressionAttributeValues: u.attributeValues,
                ReturnValues: 'NONE',
            }
        });
        updates.forEach(u => dynamoDb.perform('update', u));
        callback(null);
    } catch(e) {
        console.log(e);
        callback(null);
    }
}