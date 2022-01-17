const koa = require('koa');
const koaRouter = require('@koa/router');
const bodyParser  = require('koa-bodyparser');

const { createProject, getAllProjects, getProjectById, removeById, updateProjectById } = require('./projects.fs');


let router = koaRouter();
let app = new koa();
app.use(bodyParser());
const BASE_URL = '/api/projects';


app.use(async (ctx,next) => {
    const start = new Date;
    await next();
    const ms = new Date - start;
    console.log('%s %s - %sms', ctx.method, ctx.url, ms);
});

router.get(BASE_URL, async (ctx) => {
    //Return the list of all projects in the db
    ctx.body = await getAllProjects();
});

router.get(BASE_URL + '/:projectId', async (ctx) => {
    //To get the param by removing the ":"
    var id = ctx.params.projectId.replace(":", "");
    ctx.body = await getProjectById(id);
});

router.delete(BASE_URL + '/:projectId', async (ctx) => {
    //To get the param by removing the ":"
    var id = ctx.params.projectId.replace(":", "");
    await removeById(id);
    ctx.body = "Project with id: " + id + " removed from database"
});


router.post(BASE_URL, async  (ctx) =>{
    var project = ctx.request.body;
    await createProject(project);
    ctx.body = "The following object has been added to the database : \n" + JSON.stringify(project, null, 2);
});

router.put(BASE_URL + '/:projectId', async  (ctx) =>{
    var project = ctx.request.body;
    await updateProjectById(project);
    ctx.body = "The following object has been updated in the database : \n" + JSON.stringify(project, null, 2)
});


app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);