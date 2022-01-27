import db from "./db.json";
import fs from "fs";

export const createOrder = async (newOrder) => {
    
    var order = {
        id : getFirstAvailableId(db),
        orderDate: newOrder.orderDate,
        userIdBuy: newOrder.userIdBuy,
        userIdSell: newOrder.userIdSell,
        projectId: newOrder.projectId,
        amount: newOrder.amount,
    }

    db.orders.push(order);

    var data = JSON.stringify(db, null, 2);
    fs.writeFile("db.json", data, finished);

    function finished(){
        console.log("db orders updated")
    }
}

export const getAllOrders = async () => {
    return db.orders;
}

export const getOrderById = async (id) => {
    return db.orders.find((order) => order.id == id);
}

export const updateOrderById = async (newOrder, oldOrderId) => {
    
    var orderToUpdateIndex = db.orders.findIndex((proj) => proj.id == oldOrderId);

    if(orderToUpdateIndex != -1){
        
        var order = {
            id : parseInt(oldOrderId),
            orderDate: newOrder.orderDate,
            userIdBuy: newOrder.userIdBuy,
            userIdSell: newOrder.userIdSell,
            projectId: newOrder.projectId,
            amount: newOrder.amount,
        }
        db.orders.splice(orderToUpdateIndex, 1, order);

        var data = JSON.stringify(db, null, 2);
        fs.writeFile("db.json", data, finished);
    }else{
        return -1;
    }
   
    function finished(){
        console.log("Order with id: " + order.id + " has been updated.");
    }
}

export const removeOrderById = async (id) => {
    
    var orderIndex = db.orders.findIndex((order) => order.id == id);
    if(orderIndex >= 0){
        db.orders.splice(orderIndex, 1);
        var data = JSON.stringify(db, null, 2);
        fs.writeFile("db.json", data, finished);     
    }else{
        return -1;
    }
   
    function finished(){
        console.log("Order with id: " + id + " removed from database.");
    }

}

function getFirstAvailableId(obj){
    return  Object.keys(obj.orders).length + 1;
}
