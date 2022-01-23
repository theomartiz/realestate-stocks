let fs = require('fs');
const db = require('./db.json');

const createUser = async (newUser) => {
    db.users.push(newUser);
    let data = JSON.stringify(db, null, 2);
    fs.writeFile("db.json", data, finished);

    function finished(){
        console.log("User created successfully")
    }
}

const getAllUsers = async () => {
    return db.users;
}

const getUser = async (id) => {
    return db.users.find(user => user.id == id);
}

const updateUser = async (updatedUser, id) => {
    let userIndex = db.users.findIndex(user => user.id == id);

    if (userIndex != -1) {
        let user = {
            id : parseInt(id),
            firstName : updatedUser.firstName,
            lastName : updatedUser.lastName,
        }
        console.log("userindex: " +userIndex);
        db.users.splice(userIndex, 1, user);
        var data = JSON.stringify(db, null, 2);
        fs.writeFile("db.json", data, finished);
    } else {
        return -1;
    }
}

const deleteUser = async (id) => {
    let userIndex = db.users.findIndex(user => user.id == id);

    if (userIndex > -1) {
        db.users.splice(userIndex, 1);
        var data = JSON.stringify(db, null, 2);
        fs.writeFile("db.json", data, finished);
        function finished(){
            console.log("User with id: " + id + " removed from database.");
        }
    }
}

module.exports = {
    getAllUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
}