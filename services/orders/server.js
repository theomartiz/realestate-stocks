const koa = require('koa');
const koaRouter = require('@koa/router');

const db = require("./db.json");
const fs = require("fs");
const { createOrder, getAllOrders, getOrderById, removeOrderById, updateOrderById } = require('./orders_lib.js');

let router = koaRouter();
let app = new koa();
const BASE_URL = "/api/orders"

const bodyParser  = require('koa-bodyparser');
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