
var fs = require('fs');
const db = require('./db.json');

const createWallet = async (newWallet, id) => {
    var wallet = {
        userId : id,
        projects: newWallet.projects,
    }

    db.wallets.push(wallet);

    var data = JSON.stringify(db, null, 2);
    fs.writeFile("db.json", data, finished);

    function finished(){
        console.log("db updated")
    }

}

const getAllWallets = async () => {
    return db.wallets;
}

const getWalletById = async (id) => {
    return db.wallets.find((wallet) => wallet.userId == id);
}

const updateWalletById = async (newWallet, oldWalletId) => {
    //Find the wallet with given id in the db
    var walletToUpdateIndex = db.wallets.findIndex((wall) => wall.userId == oldWalletId);

    if(walletToUpdateIndex != -1){

        var wallet = {
            id : parseInt(oldWalletId),
            projects: newWallet.projects,
        }
        db.wallets.splice(walletToUpdateIndex, 1, wallet);

        var data = JSON.stringify(db, null, 2);
        fs.writeFile("db.json", data, finished);
    }else{
        return -1;
    }

    function finished(){
        console.log("Wallet of the user with id: " + wallet.userId + " has been updated.");
    }
}

const removeWalletById = async (id) => {
    //Find the wallet with given id in the db
    var walletIndex = db.wallets.findIndex((wallet) => wallet.userId == id);
    if(walletIndex >= 0){
        db.wallets.splice(walletIndex, 1);
        var data = JSON.stringify(db, null, 2);
        fs.writeFile("db.json", data, finished);
    }else{
        return -1;
    }

    function finished(){
        console.log("Wallet of the user with id: " + id + " removed from database.");
    }

}

const getWalletValueByProjectId = async (userId, projectId) => {
    var wallet = db.wallets.find((wallet) => wallet.userId == userId);

    var partOwnedIndex = wallet.projects.findIndex((project) => project.projectId == projectId);

    if (partOwnedIndex >= 0) {
      var partOwned = wallet.projects[partOwnedIndex].partOwned;
      return partOwned;
    }else{
      return -1;
    }
}


const getWalletValueByUserId = async (userId) => {
    var wallet = db.wallets.find((wallet) => wallet.userId == userId);

    if (wallet != null) {
      return wallet.projects;
    }else{
      return -1;
    }


}



module.exports =
{
    createWallet,
    getAllWallets,
    getWalletById,
    removeWalletById,
    updateWalletById,
    getWalletValueByProjectId,
    getWalletValueByUserId
}
