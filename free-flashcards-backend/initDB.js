const mongoose = require("mongoose");

module.exports = (launchMode) => {
    let connectionURI;
    if (launchMode === "production") {
        connectionURI = process.env.mongodbProductionURI;
    } else if (launchMode === "test") {
        connectionURI = process.env.mongodbTestURI;
    }
    // connecting to a local instance of MongoDB contained in the URI in the .env file
    mongoose.connect(connectionURI).then(() => {
        console.log("connected to mongodb!")
    }).catch(error => console.log(error.message)); 

    // fires every time mongoose connects, 'once' can be used to only run once
    mongoose.connection.on("connected", () => {
        console.log("Mongoose connected to db");
    });

    mongoose.connection.on("error", (error) => {
        console.log(error.message);
    });

    mongoose.connection.on("disconnected", () => {
        console.log("Mongoose connection is disconnected");
    })

    process.on('SIGINT',()=>{
        mongoose.connection.close().then(()=>{
            console.log('Mongoose is disconnected due to app termination');
            process.exit(0);
        });
    });
}