const Flashcard = require("../Models/Flashcard.model");
const mongoose = require("mongoose");
const createError = require("http-errors");

// define the needed functions in the module's exports 
module.exports = {

    findFlashcardById: async (request, response, next) => { // used to retrieve flashcards from the DB
        // NOTE: this is the only FlashcardController method exposed by the API - all other methods are used by 
        //       the StudySetController
        try {
            const searchedId = request.params.id; // getting the id in the route parameter
            const result = await Flashcard.findById(searchedId); // findById searches by the provided id
            if (result === null) { // id is formatted correctly, but doesn't map to any flashcards
                throw createError(404, "Flashcard does not exist");
            }
            response.send(result);
        } catch (error) {
            console.log(error.message);
            if (error instanceof mongoose.CastError) { // objectid is not formatted correctly
                next(createError(400, "invalid flashcard id"));
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
            if (error.name === "ValidationError") { // invalid post request body, likely misnamed or missing field
                next(createError(400, error.message));
            }
            next(error);
        }
    },

    deleteCard : async (cardId, status, next) => {
        try {
            const result = await Flashcard.findByIdAndDelete(cardId); // finds and deletes an entry matching the id
            if (result === null) { // id is formatted correctly, but doesn't map to any flashcards
                next(createError(404, "Flashcard does not exist"));
                status.name = 404;
            } else {
                status.name = 200; // if result isn't null then something was deleted successfully
            }
        } catch (error) {
            console.log(error.message);
            if (error instanceof mongoose.CastError) { // objectid is not formatted correctly
                next(createError(400, "invalid flashcard id"));
            }
            next(error);
        }
    },

    updateCard : async(cardId, updatedBody, status, next) => {
        try {
            const options = {new: true}; // this results in the newly updated flashcard being returned, otherwise the replaced entry is returned
            const result = await Flashcard.findByIdAndUpdate(cardId, updatedBody, options);
            if (result === null) {
                next(createError(404, "Flaschard does not exist")); // valid id format but no matching db entry
                status.code = 404;
            } else {
                status.code = 200;
                status.body = result;
            }
        } catch (error) {
            console.log(error.message);
            if (error instanceof mongoose.CastError) { // triggers if objectid is not formatted correctly
                next(createError(400, "invalid flashcard id"));
            } 
            next(error); 
        }
    }
    
}

