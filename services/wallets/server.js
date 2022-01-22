const koa = require('koa');
const koaRouter = require('@koa/router');
const bodyParser  = require('koa-bodyparser');
const db = require('./db.json');


const { createWallet, getAllWallets, getWalletById, removeWalletById, updateWalletById, getWalletValueByProjectId, getWalletValueByUserId } = require('./wallets.fs');
const {getProjectById} = require('../projects/projects.fs');

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
    var fundingObjective = project.fundingObjective;

    if(partOwned != -1){
      ctx.body = "This user has: " + (partOwned*100) + "% of the project:" + projectId
      + " which is equal to $" + (fundingObjective*partOwned);
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
        var fundingObjective = project.fundingObjective;

        totalValue += (fundingObjective*(projects[i].partOwned));
      }

      ctx.body = "This user has in his wallet the equivalent of : $" + totalValue + " in shares";
    }else{
      ctx.body = "This user does not have shares in any projects";
      ctx.status = 406;
    }
});


app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);
