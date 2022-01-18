const koa = require('koa');
const koaRouter = require('@koa/router');
const bodyParser  = require('koa-bodyparser');
const db = require('./db.json');

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


app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);