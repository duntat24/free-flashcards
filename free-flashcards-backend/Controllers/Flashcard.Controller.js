const Flashcard = require("../Models/Flashcard.model");

const mongoose = require("mongoose");
const express = require("express");
const createError = require("http-errors");

// define the needed functions in the module's exports 
module.exports = {
    createFlashcard : async (request, response, next) => { // add a flashcard to the database
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
    },

    deleteFlashcard : async (request, response, next) => {
        try {
            const deletedId = request.params.id; 
            const result = await Flashcard.findByIdAndDelete({_id: deletedId}); // finds and deletes an entry matching the id
            if (result === null) { // this triggers if the id is formatted correctly, but doesn't map to any products
                throw createError(404, "Flashcard does not exist");
            }
            response.send(result);
        } catch (error) {
            console.log(error.message);
            if (error instanceof mongoose.CastError) { // this triggers if the objectid is not formatted correctly
                next(createError(400, "invalid flashcard id"));
            }
            next(error)
        }
    },

    findFlashcardById: async (request, response, next) => { // :id lets us get the id
        try {
            const searchedId = request.params.id; // getting the id in the route parameter
            const result = await Flashcard.findById(searchedId); // findById searches by the provided id
            if (result === null) { // this triggers if the id is formatted correctly, but doesn't map to any products
                throw createError(404, "Flashcard does not exist");
            }
            response.send(result);
        } catch (error) {
            console.log(error.message);
            if (error instanceof mongoose.CastError) { // this triggers if the objectid is not formatted correctly
                next(createError(400, "invalid flashcard id"));
            }
            next(error);
        }
    },

    updateFlashcard : async (request, response, next) => { // :id lets us get the id
        try {
            const updatedId = request.params.id;
            const updatedBody = request.body;
            const options = {new: true}; // this results in the newly updated flashcard being returned, otherwise the replaced entry is returned
            const result = await Flashcard.findByIdAndUpdate({_id: updatedId}, {prompt: updatedBody.prompt, response: updatedBody.response}, options);
            if (result === null) {
                throw createError(404, "Flaschard does not exist"); // valid id format but no matching db entry
            }
            response.send(result);
        } catch (error) {
            console.log(error.message);
            if (error instanceof mongoose.CastError) { // triggers if objectid is not formatted correctly
                next(createError(400, "invalid flashcard id"));
            } else if (error.name === "ValidationError") {
                next(createError(422, error.message));
            }
            next(error); 
        }
    },

    createNewFlashcard : async (cardPrompt, cardResponse, createdId, next) => {
        try {
            const card = new Flashcard({prompt: cardPrompt, response: cardResponse}); 
            const result = await card.save();
            createdId._id = result._id;
        } catch (error) {
            console.log(error.message);
            if (error.name === "ValidationError") { // input to create flashcard was invalid
                next(createError(422, error.message));
            }
            next(error); // some other error occurred, potentially HTTP 500 
        }
    },

    deleteCard : async (cardId, status, next) => {
        try {
            const result = await Flashcard.findByIdAndDelete(cardId); // finds and deletes an entry matching the id
            if (result === null) { // this triggers if the id is formatted correctly, but doesn't map to any products
                next(createError(404, "Flashcard does not exist"));
                status.name = 404;
            } else {
                status.name = 200; // if result isn't null then something was deleted successfully
            }
        } catch (error) {
            console.log(error.message);
            console.log(error.name);
            if (error instanceof mongoose.CastError) { // this triggers if the objectid is not formatted correctly
                next(createError(400, "invalid flashcard id"));
            }
            next(error);
        }
    }
    
}

