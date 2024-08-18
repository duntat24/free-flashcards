const StudySet = require("../Models/StudySet.model");

/*
    This will likely need to interface with the FlashcardController and may even take over the 
    responsibilities of the FlashcardRoute, as users will generally be interacting with the application 
    via their sets and considering how they're modifying their sets
*/

const mongoose = require("mongoose");
const express = require("express");
const createError = require("http-errors");

// define the needed functions in the module exports
module.exports = {
    createStudySet : async (request, response, next) => { // add a study set to the database
        console.log(request.body);
        try {
            const set = new StudySet({"title": request.body.title, "cards": []}); // raises a 400 error if no title is included
            const result = await set.save();
            response.send(result);
        } catch (error) {
            console.log(error.message);
            if (error.name === "ValidationError") { // catching invalid input
                next(createError(400, error.message)) // error code for BAD REQUEST
            }
            next(error);
        }
    },
}