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
}