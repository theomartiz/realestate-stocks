import fs from 'fs';
import db from './db.json';

export const createCredentials = async (fullUserInfos) => {
    let credentials = {
        id: getFirstAvailableId(db.credentials),
        email: fullUserInfos.email,
        password: fullUserInfos.password,
    }

    let userInfos = {
        id: credentials.id,
        firstName: fullUserInfos.firstName,
        lastName: fullUserInfos.lastName,
    }

    db.credentials.push(credentials);
    let data = JSON.stringify(db, null, 2);
    fs.writeFile("db.json", data, finished);

    function finished(){
        console.log("Credentials created successfully")
        console.log("Pushing user infos to authentication.fifo topic on SNS.")
    }

    return new Promise((resolve, reject) => {
        const successObject = {
            msg: "Success",
            data: userInfos,
        }
        resolve(successObject);
    })
}

export const updatePassword = async (updatedCredentials) => {
    let index = db.credentials.findIndex(credential => credential.email == updatedCredentials.email);
    if (index > -1) {
        let credentials = {
            email : updatedCredentials.email,
            password: updatedCredentials.password,
        }

        db.credentials.splice(index, 1, credentials);
        let data = JSON.stringify(db, null, 2);
        fs.writeFile("db.json", data, finished);
        function finished(){
            console.log("Credentials updated");
        }
    } else {
        return -1;
    }
}

export const deleteCredentials = async (credentials) => {
    let index = db.credentials.findIndex(credential => credential.email == credentials.email);
    if (index > -1) {
        db.credentials.splice(index, 1);
        var data = JSON.stringify(db, null, 2);
        fs.writeFile("db.json", data, finished);
        function finished(){
            console.log("Credentials removed from database.");
        }
    } else {
        return -1;
    }
}

export const checkCredentials = async (credentials) => {
    let emailIndex = db.credentials.findIndex(credential =>
            credential.email == credentials.email
    );
    let passwordIndex = db.credentials.findIndex(credential =>
        credential.password == credentials.password
    );
    let userId = db.credentials.find(credential => credential.email == credentials.email).id;


    return new Promise((resolve, reject) => {
        if (emailIndex > -1 && passwordIndex > -1  && emailIndex == passwordIndex) {
            const successObject = {
                msg: "User connected",
                data: userId,
                code: 200,
            };
            resolve(successObject);
            console.log(successObject.msg + ": " + successObject.data);
        } else {
           const failedObject = {
               msg: "Wrong email or password",
               data: "null",
               code: 400,
           };
            console.log("Wrong email or password");
            resolve(failedObject);
        }

    })
}

function getFirstAvailableId(array){
    for(var i = 1; i <= array.length; i++){
        if(array.findIndex((obj) => obj.id == i) == -1){
            return i;
        }
    }
    return  array.length + 1;
}
