const koa = require('koa');
const koaRouter = require('@koa/router');

let router = koaRouter();
let app = new koa();

app.use(async (ctx,next) => {
    const start = new Date;
    await next();
    const ms = new Date - start;
    console.log('%s %s - %sms', ctx.method, ctx.url, ms);
});

router.get('/api/users', async (ctx) => {
    ctx.body = "List of users...";
});


router.get('/api/', async (ctx) => {
    ctx.body = "API ready to receive requests";
});

router.get('/', async (ctx) => {
    ctx.body = "Ready to receive requests";
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);