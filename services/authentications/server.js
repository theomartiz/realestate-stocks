import {PublishCommand} from "@aws-sdk/client-sns";
import {snsClient} from "./libs/snsClient.js";
import koaRouter from '@koa/router';
import koa from 'koa';
import bodyParser from 'koa-bodyparser';
import db from "./db.json";

import { createCredentials, updatePassword, deleteCredentials, checkCredentials} from './authentications.fs.js';

let router = koaRouter();
let app = new koa();
app.use(bodyParser());
const BASE_URL = "/api/authentications"

app.use(async (ctx,next) => {
    if (ctx.url !== "/") {
        const start = new Date;
        await next();
        const ms = new Date - start;
        console.log('%s | %s %s - %sms', start, ctx.method, ctx.url, ms);
    }
});

router.get("/", async (ctx) => {
    ctx.body = "Welcome to the authentication API";
});

router.post(BASE_URL, async (ctx) => {
    let credentials = ctx.request.body;
    console.log(credentials);
    await checkCredentials(credentials)
        .then((resultObject) => {
            try {
                ctx.body = JSON.stringify(resultObject.data, null, 2);
                ctx.status = parseInt(JSON.stringify(resultObject.code, null, 2));
            } catch (e) {
                console.log('error: ' + e);
            }
        });
});

router.post(BASE_URL + '/create', async (ctx) => {
    let fullUserInfos = ctx.request.body;
    console.log('Receiving create account request: ' + ctx.request.body);
    await createCredentials(fullUserInfos)
        .then( async (successObject) => {
            try {
                console.log("data: " + JSON.stringify(successObject.data, null, 2));
                let params = {
                    Message: JSON.stringify(successObject.data, null, 2),
                    TopicArn: "arn:aws:sns:us-east-1:595534413965:authentication.fifo",
                    MessageGroupId: "randomId",
                    MessageDeduplicationId: Object.keys(db.credentials).length.toString(),
                }

                await snsClient.send(new PublishCommand(params));
            } catch (e) {
                console.log("error: " + e);
            }
        });

    ctx.body = "Credentials created";
});

router.put(BASE_URL + '/update-password', async (ctx) => {
    let credentials = ctx.request.body;
    let credentialsToUpdate = db.credentials.find(credential => credential.email == credentials.email);

    if (credentialsToUpdate != null) {
        await updatePassword(credentials);
        ctx.body = "Password updated";
    } else {
        ctx.body = "No user found for this email"
        ctx.status = 406;
    }

});

router.delete(BASE_URL + '/delete', async (ctx) => {
    let credentials = ctx.request.body;
    let credentialsToDelete = db.credentials.find(credential => credential.email == credentials.email);

    if (credentialsToDelete != null) {
        await deleteCredentials(credentials);
        ctx.body = "Credentials deleted";
    } else {
        ctx.body = "No user found for this email"
        ctx.status = 406;
    }
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);