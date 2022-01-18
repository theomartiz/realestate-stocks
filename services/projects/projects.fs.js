
var fs = require('fs');
const db = require('./db.json');

const createProject = async (newProject) => {
    //We retrieve the first id that is available
    var firstAvailableId = getFirstAvailableId(db.projects);
    
    var project = {
        id : firstAvailableId,
        name: newProject.name,
        buildingType: newProject.buildingType,
        address: newProject.address,
        fundingObjective: newProject.fundingObjective,
        currentFunding: newProject.currentFunding,
        description: newProject.description,
        expectedYield: newProject.expectedYield,
        postDate: newProject.postDate,
        endDate: newProject.endDate,
        contributions: newProject.contributions,
    }

    db.projects.push(project);

    var data = JSON.stringify(db, null, 2);
    fs.writeFile("db.json", data, finished);

    function finished(){
        console.log("db updated")
    }
        
}

const getAllProjects = async () => {
    return db.projects;
}

const getProjectById = async (id) => {
    return db.projects.find((project) => project.id == id);
}

const updateProjectById = async (newProject, oldProjectId) => {
    //Find the project with given id in the db
    var projectToUpdateIndex = db.projects.findIndex((proj) => proj.id == oldProjectId);

    if(projectToUpdateIndex != -1){
        
        var project = {
            id : parseInt(oldProjectId),
            name: newProject.name,
            buildingType: newProject.buildingType,
            address: newProject.address,
            fundingObjective: newProject.fundingObjective,
            currentFunding: newProject.currentFunding,
            description: newProject.description,
            expectedYield: newProject.expectedYield,
            postDate: newProject.postDate,
            endDate: newProject.endDate,
            contributions: newProject.contributions,
        }
        db.projects.splice(projectToUpdateIndex, 1, project);

        var data = JSON.stringify(db, null, 2);
        fs.writeFile("db.json", data, finished);
    }else{
        return -1;
    }
   
    function finished(){
        console.log("Project with id: " + project.id + " has been updated.");
    }
}

const removeById = async (id) => {
    //Find the project with given id in the db
    var projectIndex = db.projects.findIndex((project) => project.id == id);
    if(projectIndex >= 0){
        db.projects.splice(projectIndex, 1);
        var data = JSON.stringify(db, null, 2);
        fs.writeFile("db.json", data, finished);     
    }else{
        return -1;
    }
   
    function finished(){
        console.log("Project with id: " + id + " removed from database.");
    }

}

function getFirstAvailableId(array){
    for(var i = 1; i <= array.length; i++){
        if(array.findIndex((obj) => obj.id == i) == -1){
            return i;
        }
    }
    return  array.length + 1;
}

module.exports = 
{
    createProject,
    getAllProjects,
    getProjectById,
    removeById,
    updateProjectById
}