const express = require("express");
const createError = require("http-errors");
const dotenv = require("dotenv").config();

console.log(dotenv.parsed);

const app = express();
app.use(express.json()); // this allows us to do request.body and send request.body (which are jsons)

// initializeDB
require("./initDB")(); // running the arrow function in initDB

const FlashcardRoute = require("./Routes/Flashcard.route");

app.use('/cards', FlashcardRoute);

app.get('/', (request, response, next) => {
    response.send("Home page");
});

// this runs if the request type and path are not supported (e.g. a delete request on the home)
// this is not the preferred way to handle errors
app.use((request, response, next) => { 
    // creating an error response and setting a status code
    /*const error = new Error("not found");
    error.status = 404;
    next(error); // this jumps to the error handler*/
    next(createError(404, "not found"));
});

// accepted way to do it: use an error handler to deal with all the types of errors that may occur (404, 500, etc.)
// calling next(error) anywhere in our server code (including in the product route!) jumps to this error handler
app.use((error, request, response, next) => {
    response.status(error.status || 500); // if error.status is null (not set) then an internal server error has occurred (code 500)
    response.send({
        error: {
            status: error.status || 500,
            message: error.message
        }
    })
});

const PORT = process.env.port || 3000; // if the provided .env file has no port then we default to 3000
app.listen(PORT, () => {
    console.log("Server started on port " + PORT);
});

  