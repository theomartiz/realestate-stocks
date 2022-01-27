import db from "./db.json"
import * as fs from "fs";

export const createProject = async (newProject) => {
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

export const getAllProjects = async () => {
    return db.projects;
}

export const getProjectById = async (id) => {
    return db.projects.find((project) => project.id == id);
}

export const updateProjectById = async (newProject, oldProjectId) => {
    //Find the project with given id in the db
    var projectToUpdateIndex = db.projects.findIndex((proj) => proj.id == oldProjectId);

    if(projectToUpdateIndex != -1){

        var project = {
            id : parseInt(oldProjectId),
            name: newProject.name,
            buildingType: newProject.buildingType,
            address: newProject.address,
            totalStocks: newProject.totalStocks,
            stockPrice: newProject.stockPrice,
            availableStocks: newProject.availableStocks,
            description: newProject.description,
            postDate: newProject.postDate,
            contributors: newProject.contributors,
        }
        db.projects.splice(projectToUpdateIndex, 1, project);

        var data = JSON.stringify(db, null, 2);
        fs.writeFile("db.json", data, finished);
    }else{
        idNotFound();
        return -1;
    }

    function finished(){
        console.log("Project with id: " + project.id + " has been updated.");
    }

    function idNotFound(){
        console.log("Project with id: " + project.id + " inexistant.");
    }
}

export const removeById = async (id) => {
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

export function getFirstAvailableId(array){
    for(var i = 1; i <= array.length; i++){
        if(array.findIndex((obj) => obj.id == i) == -1){
            return i;
        }
    }
    return  array.length + 1;
}

