import db from "./db.json"
import * as fs from "fs";

export const createWallet = async (newWallet, id) => {
    var wallet = {
        userId : id,
        projects: newWallet.projects,
    }

    db.wallets.push(wallet);

    var data = JSON.stringify(db, null, 2);
    fs.writeFile("db.json", data, finished);

    function finished(){
        console.log("Wallet: db updated")
    }

}

export const getAllWallets = async () => {
    return db.wallets;
}

export const getWalletById = async (id) => {
    return db.wallets.find((wallet) => wallet.userId == id);
}

export const updateWalletById = async (newWallet, oldWalletId) => {
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

export const removeWalletById = async (id) => {
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

export const getWalletValueByProjectId = async (userId, projectId) => {
    var wallet = db.wallets.find((wallet) => wallet.userId == userId);

    var partOwnedIndex = wallet.projects.findIndex((project) => project.projectId == projectId);

    if (partOwnedIndex >= 0) {
      var partOwned = wallet.projects[partOwnedIndex].partOwned;
      return partOwned;
    }else{
      return -1;
    }
}


export const getWalletValueByUserId = async (userId) => {
    var wallet = db.wallets.find((wallet) => wallet.userId == userId);

    if (wallet != null) {
      return wallet.projects;
    }else{
      return -1;
    }
}

export const exchangeWalletToWallet = async (jsonQuery) => {
    //Find the wallet with given id in the db
    var userIdBuy= jsonQuery.userIdBuy;
    var userIdSell= jsonQuery.userIdSell;
    var projectId= jsonQuery.projectId;
    var amount= jsonQuery.amount;


    console.log('Wallet: userIdBuy: ' + userIdBuy);
    console.log('Wallet: userIdSell: ' + userIdSell);
    console.log('Wallet: projectId: ' + projectId);
    console.log('Wallet: amount: ' + amount);


    var walletBuy = await getWalletById(userIdBuy);

    if (userIdSell != null) {
      var walletSell = await getWalletById(userIdSell);
      console.log('Wallet: walletSell: ' + walletSell.userId);
      var walletSellPartOwned = await getWalletValueByProjectId(userIdSell, projectId);

      console.log('Wallet: walletSellPartOwned: ' + walletSellPartOwned);
    }

    console.log('Wallet: walletBuy: ' + walletBuy.userId);


    //If the seller has the shares
    if ((walletSellPartOwned == null || walletSellPartOwned != -1) && walletSellPartOwned >= amount) {
      if(walletSellPartOwned != null){
        var partOwnedIndexSell = walletSell.projects.findIndex((project) => project.projectId == projectId);
        walletSell.projects[partOwnedIndexSell].partOwned = parseInt(walletSell.projects[partOwnedIndexSell].partOwned) - parseInt(amount);

        console.log('Wallet: partOwnedIndexSell: ' + partOwnedIndexSell);
        console.log('Wallet: partOwnedSellAfterTransaction: ' + walletSell.projects[partOwnedIndexSell].partOwned);

        db.wallets.splice(partOwnedIndexSell, 1, walletSell);

      }


      var partOwnedIndexBuy = walletBuy.projects.findIndex((project) => project.projectId == projectId);

      console.log('Wallet: partOwnedIndexBuy: ' + partOwnedIndexBuy);

      //If the buyer already has shares
      if(partOwnedIndexBuy != -1){
        walletBuy.projects[partOwnedIndexBuy].partOwned = parseInt(walletBuy.projects[partOwnedIndexBuy].partOwned) + parseInt(amount);

        console.log('Wallet: partOwnedBuy: ' + walletBuy.projects[partOwnedIndexBuy].partOwned);

      }else{
        var length = walletBuy.projects.length;

        var project = {
            projectId : parseInt(projectId),
            partOwned: parseInt(amount),
        };

        walletBuy.projects[length] = project;

        console.log('Wallet: partOwnedBuy: ' + walletBuy.projects[length].partOwned);

      }

      db.wallets.splice(partOwnedIndexBuy, 1, walletBuy);

      var data = JSON.stringify(db, null, 2);
      fs.writeFile("db.json", data, finished);

    }else{
      console.log("Wallet: Seller wallet doesnt have enough shares")
      return -1;
    }

    function finished(){
        console.log("Wallet: db updated")
    }

}
