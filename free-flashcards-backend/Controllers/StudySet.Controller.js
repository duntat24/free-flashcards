const StudySet = require("../Models/StudySet.model");
const FlashcardController = require("../Controllers/Flashcard.Controller");

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

    testConnection : async (request, response, next) => {
        response.send(request.body);
    },

    createStudySet : async (request, response, next) => { // add a study set to the database
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
    // this will need to delete all referenced flashcards from the set as well (NOT DONE)
    deleteStudySetById : async (request, response, next) => { // delete a study set from the database
        try {
            const deletedId = request.params.id; 
            const result = await StudySet.findByIdAndDelete(deletedId); // finds and deletes an entry matching the id
            if (result === null) { // this triggers if the id is formatted correctly, but doesn't map to any products
                next(createError(404, "Study Set does not exist"));
            } else {
                response.send(result);
            }
        } catch (error) {
            console.log(error.message);
            if (error instanceof mongoose.CastError) { // this triggers if the objectid is not formatted correctly
                next(createError(400, "invalid study set id"));
            }
            next(error)
        }
    },

    getStudySetById : async (request, response, next) => { // get a study set from the database matching a specific id
        try {
            const searchedId = request.params.id;
            const result = await StudySet.findById(searchedId);
            if (result === null) { // this will occur if the id has a valid format but doesn't match any sets in the database
                next(createError(404, "Study Set does not exist"));
            } else {
                response.send(result);
            }
        } catch (error) {
            console.log(error.message);
            if (error instanceof mongoose.CastError) { // this triggers if the objectid is not formatted correctly
                next(createError(400, "invalid study set id"));
            }
            next(error);
        }
    },

    updateStudySetTitle : async (request, response, next) => {
        try {
            const updatedId = request.params.id;
            const updatedBody = request.body; // this method only needs the title from the body
            const result = await StudySet.findByIdAndUpdate(updatedId, {title: updatedBody.title});
            if (result === null) { 
                next(createError(404, "Study set does not exist")); 
            } else {
                response.send(result);
            }
        } catch (error) {
            console.log(error.message);
            if (error instanceof mongoose.CastError) { // triggers if provided id is not formatted correctly
                next(createError(400, "invalid study set id"));
            } else if (error.name === "ValidationError") { // request body is somehow invalid
                next(createError(422, error.message));
            }
            next(error); 
        }
    },

    addCardToSet : async (request, response, next) => {
        try {
            const addedSetId = request.params.id;
            const studySet = await StudySet.findById(addedSetId);
            if (studySet === null) { // if it's null then no entry in the db matches the provided id
                next(createError(404, "Study Set does not exist"));
                return;
            } 
            const flashcardBody = request.body; 
            let createdId = {_id: " "};
            // we are passing the createdId object by reference since returning values from the FlashcardController is difficult
            // we pass next so the helper function can do error handling itself
            await FlashcardController.createNewFlashcard(flashcardBody.prompt, flashcardBody.response, createdId, next);

            if (createdId._id !== " ") { // checking if an error occurred and the id field wasn't updated
                studySet.cards.push(createdId._id); // adding the id to the sets' array of ids
                const result = await studySet.save();
                response.send(result);
            } // if this if block isn't executed then a 422 or 500 occurred on the method call
        } catch (error) {
            console.log(error.message);
            if (error instanceof mongoose.CastError) { // triggers if provided id is not formatted correctly
                next(createError(400, "invalid study set id"));
            } else if (error.name === "ValidationError") { // request body is somehow invalid
                next(createError(422, error.message));
            }
            next(error); 
        }
    },

    deleteCardFromSet : async (request, response, next) => {
        try {
            const modifiedSetId = request.params.set_id;
            const deletedCardId = request.params.card_id;
            const studySet = await StudySet.findById(modifiedSetId);
            if (studySet === null) { // if it's null then no entry in the db matches the provided id
                next(createError(404, "Study set does not exist"));
                return;
            }
            let status = {name: 0};
            // passing status object to allow the arrow function in the controller to modify it as a 'return'
            await FlashcardController.deleteCard(deletedCardId, status, next);
            if (status.name === 200) { // if the status code is OK after deleting the card 
                studySet.cards.remove(deletedCardId);
                const result = await studySet.save();
                response.send(result);
            } 
        } catch (error) {
            console.log(error.message);
            if (error instanceof mongoose.CastError) { // triggers if provided id is not formatted correctly
                next(createError(400, "invalid study set id"));
            } else if (error.name === "ValidationError") { // request body is somehow invalid
                next(createError(422, error.message));
            } 
            next(error);
        }
    },

    updateCardInSet : async (request, response, next) => {
        try {
            const modifiedSetId = request.params.set_id;
            const updatedCardId = request.params.card_id;
            const studySet = await StudySet.findById(modifiedSetId);
            if (studySet === null) { // no entry in the db matches the provided study set id
                next(createError(404, "Study set does not exist"));
                return;
            }
            let status = {code: 0};
            // passing status object to allow the arrow function in the controller to modify it as a 'return'
            await FlashcardController.updateCard(updatedCardId, request.body, status, next);
            if (status.code === 200) { // if the status code is 200, the card was successfully updated. 
                response.send(status.body);
            } // if the code is not 200 then an error was caught and handled inside the FlashcardController 
        } catch (error) { // not much is happening in this controller other than fetching the study set so we don't need to do much error handling
            console.log(error.message);
            if (error instanceof mongoose.CastError) {
                next(createError(400, "Invalid study set id"));
            }
            next(error);
        }
    }
}