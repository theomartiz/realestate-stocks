// Load the AWS SDK for Node.js
import AWS from "aws-sdk";
import koa from 'koa';
import koaRouter from '@koa/router';
import bodyParser from 'koa-bodyparser';
import db from "./db.json";
// Set the region
AWS.config.update({region: 'us-east-1'});
AWS.config.credentials
// Create SQS service object
const sqs = new AWS.SQS({apiVersion: 'latest'});
// Replace with your accountid and the queue name you setup
const accountId = '595534413965';
const queueName = 'userQueue.fifo';
const queueUrl = `https://sqs.us-east-1.amazonaws.com/${accountId}/${queueName}`;

// Setup the receiveMessage parameters
const params = {
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 1,
    VisibilityTimeout: 5,
    WaitTimeSeconds: 20
};


import { getAllUsers, getUser, createUser, updateUser, deleteUser} from './users.fs.js';


let router = koaRouter();
let app = new koa();
const BASE_URL = '/api/users'

app.use(bodyParser());
app.use(async (ctx,next) => {
    if (ctx.url !== "/") {
        const start = new Date;
        await next();
        const ms = new Date - start;
        console.log('%s | %s %s - %sms', start, ctx.method, ctx.url, ms);
    }
});

router.get("/", async (ctx) => {
    ctx.body = "Welcome to the users service";
});

/**
 * [GET] get all users
 */
router.get(BASE_URL, async (ctx) => {
    ctx.body = await getAllUsers();
});

/**
 * [GET] get user for id
 */
router.get(BASE_URL + '/:id', async (ctx) => {
    let id = ctx.params.id.replace(":", "");
    let user = await getUser(id);

    if (user != null) {
        ctx.body = user;
    } else {
        ctx.body = "No user with that id";
        ctx.status = 404;
    }
});

/**
 * [POST] create user
 */
router.post(BASE_URL, async (ctx) => {
    let user = ctx.request.body;
    await createUser(user);
    ctx.body = "User created: \n" + JSON.stringify(user, null, 2);
});

router.put(BASE_URL + '/:id', async (ctx) => {
    let userInfos = ctx.request.body;
    console.log("userInfos " + userInfos);
    let id = ctx.params.id.replace(":", "");
    let user = db.users.find(user => user.id == id);

    if (user != null) {
        await updateUser(userInfos, id);
        ctx.body = "User " + id + " updated";
    } else {
        ctx.body = "No user with that id";
        ctx.status = 404;
    }
});

router.delete(BASE_URL + '/:id', async (ctx) => {
    let id = ctx.params.id.replace(":", "");
    let user = db.users.find(user => user.id == id);

    if (user != null) {
        await deleteUser(id).then(() => ctx.body = "User " + id + " deleted");

    } else {
        ctx.body = "No user with that id";
        ctx.status = 404;
    }
});

receiveMessageFromQueue();

function receiveMessageFromQueue() {
    console.log('Pulling from users queue from sqs');
    sqs.receiveMessage(params, (err, data) => {
        if (err) {
            console.log(err, err.stack);
        } else {
            if (!data.Messages) {
                console.log('Nothing to process');
                return receiveMessageFromQueue();
            }

            console.log("Received data: ", data.Messages[0].Body);
            let userInfos = JSON.parse(data.Messages[0].Body).Message;
            console.log("userInfos: " + userInfos);
            createUser(JSON.parse(userInfos));

            const deleteParams = {
                QueueUrl: queueUrl,
                ReceiptHandle: data.Messages[0].ReceiptHandle
            };
            sqs.deleteMessage(deleteParams, (err, data) => {
                if (err) {
                    console.log(err, err.stack);
                } else {
                    console.log('Successfully deleted message from queue');
                    return receiveMessageFromQueue();
                }
            });
        }
    });
}

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);