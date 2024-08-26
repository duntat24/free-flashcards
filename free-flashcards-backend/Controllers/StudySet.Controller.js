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
    // this will need to delete all referenced flashcards from the set as well (NOT DONE)
    deleteStudySetById : async (request, response, next) => { // delete a study set from the database
        try {
            const deletedId = request.params.id; 
            const result = await StudySet.findByIdAndDelete({_id: deletedId}); // finds and deletes an entry matching the id
            if (result === null) { // this triggers if the id is formatted correctly, but doesn't map to any products
                throw createError(404, "Study Set does not exist");
            }
            response.send(result);
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
            const result = await StudySet.findById({_id: searchedId});
            if (result === null) { // this will occur if the id has a valid format but doesn't match any sets in the database
                throw createError(404, "Study Set does not exist");
            }
            response.send(result);
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
            const result = await StudySet.findByIdAndUpdate({_id: updatedId}, {title: updatedBody.title});
            if (result === null) {
                throw createError(404, "Study set does not exist"); // valid id format but no matching db entry
            }
            response.send(result);
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
            const flashcardBody = request.body; 
            var createdId = {_id: " "};
            // we are passing the createdId object by reference since returning values from the FlashcardController is difficult
            await FlashcardController.createNewFlashcard(flashcardBody.prompt, flashcardBody.response, createdId);

            if (createdId._id !== " ") { // checking if an error occurred and the id field wasn't updated
                const result = await addCardIdToSetArray(addedSetId, createdId._id); 
                response.send(result);
            } else { // error handling based on results from the helper function
                let error = {name: createdId.name, message: createdId.message};
                console.log(error.message);
                if (error.name === "ValidationError") { // input to create flashcard was invalid
                    next(createError(422, error.message));
                }
                next(error); // some other error occurred, potentially an internal server error
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
    }
}

async function addCardIdToSetArray(targetSetId, addedId) { // this is a helper function for the addCardIdToSet method
    let currentCards = (await StudySet.findById({_id: targetSetId})).cards; // getting the matching set's array of cards
    if (currentCards === null) { // the targeted set doesn't exist
        throw createError(404, "Study set does not exist");
    }
    currentCards.push(addedId);
    return await StudySet.findByIdAndUpdate({_id: targetSetId}, {cards: currentCards});
}