import {PublishCommand } from "@aws-sdk/client-sns";
import {snsClient } from "./snsClient.js";

import koa from 'koa';
import koaRouter from '@koa/router';

import db from "./db.json";
import fs from "fs";
import {createOrder, getAllOrders, getOrderById, removeOrderById, updateOrderById} from './orders_lib.js';

let router = koaRouter();
let app = new koa();
const BASE_URL = "/api/orders"

import bodyParser from 'koa-bodyparser';
app.use(bodyParser());

app.use(async (ctx,next) => {
    const start = new Date;
    await next();
    const ms = new Date - start;
    console.log('%s %s - %sms', ctx.method, ctx.url, ms);
});


router.get(BASE_URL, async (ctx) => {
    ctx.body = await getAllOrders();
});

router.get(BASE_URL + '/:orderId', async (ctx) => {
    
    var id = ctx.params.orderId.replace(":", "");
    var order = await getOrderById(id);
    
    if(order != null){
        ctx.body = order;
    }else{
        ctx.body = "No order found with such ID";
        ctx.status = 406;
    }
});


router.post(BASE_URL, async (ctx) => {
    await createOrder(ctx.request.body);
    ctx.body = "The following object has been added to the database : \n" + JSON.stringify(ctx.request.body, null, 2);
    
    if (ctx.request.body.userIdSell == 0) {

        var params = {
            Message: JSON.stringify(ctx.request.body, null, 2), // MESSAGE_TEXT
            MessageGroupId: "OrdersFunding",
            MessageDeduplicationId: Object.keys(db.orders).length,
            TopicArn: "arn:aws:sns:us-east-1:595534413965:ordersFunding.fifo", //TOPIC_ARN
        };
        
        const run = async () => {
            try {
            const data = await snsClient.send(new PublishCommand(params));
            console.log("Pushing order number",Object.keys(db.orders).length,"to ordersFunding on SNS.");
            return data; // For unit tests.
            } catch (err) {
            console.log("Cannot push order number",Object.keys(db.orders).length,"to ordersFunding on SNS.");
            }
        };
        run();

        var params = {
            Message: JSON.stringify(ctx.request.body, null, 2), // MESSAGE_TEXT
            MessageGroupId: "OrdersRunning",
            MessageDeduplicationId: Object.keys(db.orders).length,
            TopicArn: "arn:aws:sns:us-east-1:595534413965:ordersRunning.fifo", //TOPIC_ARN
        };
        
        const run2 = async () => {
            try {
            const data = await snsClient.send(new PublishCommand(params));
            console.log("Pushing order number",Object.keys(db.orders).length,"to ordersRunning on SNS.");
            return data; // For unit tests.
            } catch (err) {
                console.log("Cannot push order number",Object.keys(db.orders).length,"to ordersRunning on SNS.");
            }
        };
        run2();
        
    }
    else{

        var params = {
            Message: JSON.stringify(ctx.request.body, null, 2), // MESSAGE_TEXT
            MessageGroupId: "OrdersRunning",
            MessageDeduplicationId: Object.keys(db.orders).length,
            TopicArn: "arn:aws:sns:us-east-1:595534413965:ordersRunning.fifo", //TOPIC_ARN
        };
        
        const run = async () => {
            try {
            const data = await snsClient.send(new PublishCommand(params));
            console.log("Pushing order number",Object.keys(db.orders).length,"to ordersRunning on SNS.");
            return data; // For unit tests.
            } catch (err) {
                console.log("Cannot push order number",Object.keys(db.orders).length,"to ordersRunning on SNS.");
            }
        };
        run();
    }

});

router.put(BASE_URL + '/:orderId', async  (ctx) =>{
    
    var newOrder = ctx.request.body;
    var id = ctx.params.orderId.replace(":", "");
    var result = await updateOrderById(newOrder, id);
    
    if(result != -1){      
        ctx.body = "Order with id: " + id + " has been updated."
    }else{
        ctx.body = "No order found with such ID";
        ctx.status = 406;
    }
});

router.delete(BASE_URL + '/:orderId', async (ctx) => {
    //To get the param by removing the ":"
    var id = ctx.params.orderId.replace(":", "");
    var orderToRemove = db.orders.find((order) => order.id == id);
    if(orderToRemove != null){
        await removeOrderById(id);
        ctx.body = "Order with id: " + id + " removed from database"
    }else{
        ctx.body = "No order found with such ID";
        ctx.status = 406;
    }
});  


app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);