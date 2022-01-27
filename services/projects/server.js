import koa from 'koa';
import koaRouter from '@koa/router';
import bodyParser from 'koa-bodyparser';
import db from "./db.json";

import { createProject, getAllProjects, getProjectById, removeById, updateProjectById } from './projects.fs.js';

// Load the AWS SDK for Node.js
import AWS from "aws-sdk";
// Set the region
AWS.config.update({region: 'us-east-1'});
AWS.config.credentials
// Create SQS service object
const sqs = new AWS.SQS({apiVersion: 'latest'});
// Replace with your accountid and the queue name you setup
const accountId = '595534413965';
const queueName = 'projectsQueue.fifo';
const queueUrl = `https://sqs.us-east-1.amazonaws.com/${accountId}/${queueName}`;


// Setup the receiveMessage parameters
const params = {
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 1,
    VisibilityTimeout: 5,
    WaitTimeSeconds: 20
};

let router = koaRouter();
let app = new koa();
app.use(bodyParser());
const BASE_URL = '/api/projects';


app.use(async (ctx,next) => {
    if (ctx.url !== "/") {
        const start = new Date;
        await next();
        const ms = new Date - start;
        console.log('%s | %s %s - %sms', start, ctx.method, ctx.url, ms);
    }
});

router.get("/", async (ctx) => {
    ctx.body = "Welcome to the projects service";
});

router.get(BASE_URL, async (ctx) => {
    //Return the list of all projects in the db
    ctx.body = await getAllProjects();
});

router.get(BASE_URL + '/:projectId', async (ctx) => {
    //To get the param by removing the ":"
    var id = ctx.params.projectId.replace(":", "");
    var project = await getProjectById(id); 
    
    if(project != null){
        ctx.body = project;
    }else{
        ctx.body = "No project found with such ID";
        ctx.status = 406;
    }
});

router.delete(BASE_URL + '/:projectId', async (ctx) => {
    //To get the param by removing the ":"
    var id = ctx.params.projectId.replace(":", "");
    var projectToRemove = db.projects.find((project) => project.id == id);
    if(projectToRemove != null){
        await removeById(id);
        ctx.body = "Project with id: " + id + " removed from database"
    }else{
        ctx.body = "No project found with such ID";
        ctx.status = 406;
    }
});  


router.post(BASE_URL, async  (ctx) =>{
    var project = ctx.request.body;
    await createProject(project);
    ctx.body = "The following object has been added to the database : \n" + JSON.stringify(project, null, 2);
});

router.put(BASE_URL + '/:projectId', async  (ctx) =>{
    
    var newProject = ctx.request.body;
    var id = ctx.params.projectId.replace(":", "");
    var result = await updateProjectById(newProject, id);
    
    if(result != -1){      
        ctx.body = "Project with id: " + id + " has been updated."
    }else{
        ctx.body = "No project found with such ID";
        ctx.status = 406;
    }
});

receiveMessageFromQueue();

function receiveMessageFromQueue(){
    sqs.receiveMessage(params, (err, data) => {
        console.log('Projects: Polling messages from funding queue...');
        if (err) {
            console.log(err, err.stack);
          } else {
            if (!data.Messages) { 
              console.log('Projects: Nothing to process in funding queue');
              return receiveMessageFromQueue();          
            }
            
            //TODO: DO THINGS TO UPDATE PROJECTS                
            var jsonBody = JSON.parse(data.Messages[0].Body);
            var order = JSON.parse(jsonBody.Message);
            console.log("Projects: Received order with id: " + order.projectId + data);
            completeProjectOrder(order.projectId, order.amount);

            const deleteParams = {
              QueueUrl: queueUrl,
              ReceiptHandle: data.Messages[0].ReceiptHandle
            };
            sqs.deleteMessage(deleteParams, (err, data) => {
              if (err) {
                console.log(err, err.stack);
              } else {
                console.log('Projects: Message has been treated and successfully deleted from queue');
                return receiveMessageFromQueue();                
              }
            });
        }  
    });              
}

async function  completeProjectOrder(projectId, orderStockAmount){
    var project = await getProjectById(projectId);

    if (project.availableStocks >= orderStockAmount){
        var updatedProject = {
            id : parseInt(projectId),
            name: project.name,
            buildingType: project.buildingType,
            address: project.address,
            totalStocks: project.totalStocks,
            stockPrice: project.stockPrice,
            availableStocks: (project.availableStocks - orderStockAmount),
            description: project.description,
            postDate: project.postDate,
            contributors: project.contributors,
        }
        updateProjectById(updatedProject, projectId);
        console.log("Projects: Purchase completed successfully, they are " + (project.availableStocks - orderStockAmount) + " stocks left for this project.");
    }else{
        console.log("Projects: Purchase canceled, they are only " + project.availableStocks + " stocks available!");
    }

}
   

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);