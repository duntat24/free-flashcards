const Flashcard = require("../Models/Flashcard.model");

const mongoose = require("mongoose");
const express = require("express");
const createError = require("http-errors");

// define the needed functions in the module's exports 
module.exports = {
    testMethod : async (request, response, next) => {
        try {
            const results = await Flashcard.find(); // getting all cards, should definitely limit this in the future but this is for testing purposes
            response.send(results);
        } catch (error) {
            console.log(error.message);
            response.status(500);
            response.send("internal server error")
        }
        console.log("TEST SUCCEESS!")
    },

    createFlashcard : async (request, response, next) => { // add a flashcard to the database
        console.log(request.body);
        try {
            const card = new Flashcard(request.body); // this works, assuming the input is valid
            const result = await card.save();
            response.send(result);
        } catch (error) {
            console.log(error.message);
            if (error.name === "ValidationError") { // catching invalid input
                next(createError(422, error.message))
            }
            next(error);
        }
    }
}