const koa = require('koa');
const koaRouter = require('@koa/router');
const bodyParser  = require('koa-bodyparser');
const db = require('./db.json');


const { createWallet, getAllWallets, getWalletById, removeWalletById, updateWalletById, getWalletValueByProjectId, getWalletValueByUserId, exchangeWalletToWallet } = require('./wallets.fs');
const {getProjectById} = require('../projects/projects.fs');

// Load the AWS SDK for Node.js
 const AWS = require('aws-sdk');
 // Set the region
 AWS.config.update({region: 'us-east-1'});
 AWS.config.credentials
 // Create SQS service object
 const sqs = new AWS.SQS({apiVersion: 'latest'});
 // Replace with your accountid and the queue name you setup
 const accountId = '595534413965';
 const queueName = 'walletsQueue.fifo';
 const queueUrl = `https://sqs.us-east-1.amazonaws.com/${accountId}/${queueName}`;


 // Setup the receiveMessage parameters
 const params = {
     QueueUrl: queueUrl,
     MaxNumberOfMessages: 1,
     VisibilityTimeout: 5,
     WaitTimeSeconds: 5
 };


let router = koaRouter();
let app = new koa();
app.use(bodyParser());
const BASE_URL = '/api/wallets';


app.use(async (ctx,next) => {
    const start = new Date;
    await next();
    const ms = new Date - start;
    console.log('%s %s - %sms', ctx.method, ctx.url, ms);
});

//Get All wallets
router.get(BASE_URL, async (ctx) => {
  //Return the list of all projects in the db
  ctx.body = await getAllWallets();
});

//Get the wallet of a user
router.get(BASE_URL + '/:userId', async (ctx) => {
    //To get the param by removing the ":"
    var id = ctx.params.userId.replace(":", "");
    var wallet = await getWalletById(id);

    if(wallet != null){
        ctx.body = wallet;
    }else{
        ctx.body = "No user found with such ID";
        ctx.status = 406;
    }
});

//Delete the wallet of a user
router.delete(BASE_URL + '/:userId', async (ctx) => {
    //To get the param by removing the ":"
    var id = ctx.params.userId.replace(":", "");
    var walletToRemove = db.wallets.find((wallet) => wallet.userId == id);
    if(walletToRemove != null){
        await removeWalletById(id);
        ctx.body = "Wallet of the user with id: " + id + " removed from database"
    }else{
        ctx.body = "No user found with such ID";
        ctx.status = 406;
    }
});

//Create the wallet of a user
router.post(BASE_URL + '/:userId', async  (ctx) =>{
    var id = parseInt(ctx.params.userId.replace(":", ""));
    var wallet = ctx.request.body;

    await createWallet(wallet, id);
    ctx.body = "The following object has been added to the database : \n" + JSON.stringify(wallet, null, 2);
});

//Modify the wallet of a user
router.put(BASE_URL + '/:userId', async  (ctx) =>{

    var newWallet = ctx.request.body;
    var id = ctx.params.userId.replace(":", "");
    var result = await updateWalletById(newWallet, id);

    if(result != -1){
        ctx.body = "Wallet of the user with id: " + id + " has been updated."
    }else{
        ctx.body = "No user found with such ID";
        ctx.status = 406;
    }
});

//Get the value of the shares of a project owned by a user
router.get(BASE_URL + '/:userId' + '/sharesValue' + '/:projectId', async (ctx) => {
    //To get the param by removing the ":"
    var userId = ctx.params.userId.replace(":", "");
    var projectId = ctx.params.projectId.replace(":", "");

    var partOwned = await getWalletValueByProjectId(userId, projectId);

    var project = await getProjectById(projectId);
    var stockPrice = project.stockPrice;

    if(partOwned != -1){
      ctx.body = "This user has: " + (partOwned) + " shares of the project:" + projectId
      + " which is equal to $" + (stockPrice*partOwned);
    }else{
      ctx.body = "This user does not have shares in this project";
      ctx.status = 406;
    }
});

//Get the value of the shares owned by a user
router.get(BASE_URL + '/:userId' + '/sharesValue', async (ctx) => {
    //To get the param by removing the ":"
    var userId = ctx.params.userId.replace(":", "");

    var projects = await getWalletValueByUserId(userId);

    var totalValue = 0;

    if(projects != -1){

      for (var i = 0; i < projects.length; i++) {
        var project = await getProjectById(projects[i].projectId);
        var stockPrice = project.fundingObjective;

        totalValue += (stockPrice*(projects[i].partOwned));
      }

      ctx.body = "This user has in his wallet the equivalent of : $" + totalValue + " in shares";
    }else{
      ctx.body = "This user does not have shares in any projects";
      ctx.status = 406;
    }
});


receiveMessageFromQueue();

 function receiveMessageFromQueue(){
     sqs.receiveMessage(params, (err, data) => {
         if (err) {
             console.log(err, err.stack);
           } else {
             if (!data.Messages) {
               console.log('Nothing to process');
               return receiveMessageFromQueue();
             }

             //TODO: DO THINGS TO UPDATE PROJECTS
             console.log(data.Messages[0].Body)
             let userInfos = JSON.parse(data.Messages[0].Body).Message;
             console.log("userInfos: " + userInfos);
             //createUser(JSON.parse(userInfos));
             console.log("---------")
             exchangeWalletToWallet(JSON.parse(userInfos));

             console.log("---------")
             console.log(data);

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
