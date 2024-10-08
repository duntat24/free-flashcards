const StudySet = require("../Models/StudySet.model");
const FlashcardController = require("../Controllers/Flashcard.Controller");
const mongoose = require("mongoose");
const createError = require("http-errors");

// define the needed functions in the module exports
module.exports = {

    // this method should only hit a USERS' study sets in an actual system, but at the moment the system 
    // is only intended to have 1 user per instance of itself
    getAllStudySets : async (request, response, next) => { // this method is necessary so the client can know what ids it needs to be accessing
        try {
            const sets = await StudySet.find();
            response.send({study_sets: sets});
        } catch (error) {
            next(error); // some sort of internal server error would have to happen for an error here
        }
    },

    createStudySet : async (request, response, next) => { // add a study set to the database
        try {
            const title = request.body.title;
            if (title === undefined || title === null) { // we make this check here instead of in schema validation because we also need to ensure that the title doesn't contain only whitespace
                next(createError(400, "Sets must have a title"));
                return;
            }
            if (title.trim() === "") { // checking if the title contains only whitespace characters
                next(createError(400, "Set title must contain non-whitespace characters"));
                return;
            }
            const set = new StudySet({"title": request.body.title}); // raises a 400 error if no title is included
            const result = await set.save();
            response.send(result);
        } catch (error) {
            console.log(error.message);
            next(error);
        }
    },

    deleteStudySetById : async (request, response, next) => { // delete a study set from the database
        try {
            const deletedId = request.params.id; 
            const result = await StudySet.findByIdAndDelete(deletedId); 
            if (result === null) { // this triggers if the id is formatted correctly, but doesn't map to any products
                next(createError(404, "Study Set does not exist"));
            } else {
                const deletedCards = result.cards;
                let errorOccurred = false;
                // deleting all the cards in the set to avoid cards in the DB with no references to them
                for (let i = 0; i < deletedCards.length; i++) { 
                    let status = {name : 0};
                    await FlashcardController.deleteCard(deletedCards[i], status, next);
                    if (status.name !== 200) { // if all validation rules of the DB and API are followed then no errors should occur, but if one does occur we want to know about it
                        errorOccurred = true;
                    }
                }
                if (!errorOccurred) {
                    response.send(result);
                }
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

    updateStudySetTitle : async (request, response, next) => { // update the title of a study set with a specified id
        try {
            const options = {new: true}; // we return the newly modified set title
            const updatedId = request.params.id;
            const title = request.body.title;
            if (title === undefined || title === null) { // we make this check here instead of in schema validation because we also need to ensure that the title doesn't contain only whitespace
                next(createError(400, "Sets must have a title"));
                return;
            }
            if (title.trim() === "") { // checking if the title contains only whitespace characters
                next(createError(400, "Set title must contain non-whitespace characters"));
                return;
            }
            const result = await StudySet.findByIdAndUpdate(updatedId, {title: title}, options);
            if (result === null) { // no set was found matching the provided id
                next(createError(404, "Study set does not exist")); 
            } else {
                response.send(result);
            }
        } catch (error) {
            console.log(error.message);
            if (error instanceof mongoose.CastError) { // triggers if provided id is not formatted correctly
                next(createError(400, "invalid study set id"));
            } 
            next(error); 
        }
    },

    addCardToSet : async (request, response, next) => { // add a card to the study set with the specified id
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
            await FlashcardController.createNewFlashcard(flashcardBody.prompt, flashcardBody.response, flashcardBody.userResponseType, createdId, next);

            if (createdId._id !== " ") { // checking if an error occurred and the id field wasn't updated
                studySet.cards.push(createdId._id); // adding the id to the sets' array of ids
                const result = await studySet.save();
                response.send(result);
            } // if this if block isn't executed then a 422 or 500 occurred on the method call
        } catch (error) {
            console.log(error.message);
            if (error instanceof mongoose.CastError) { // triggers if provided id is not formatted correctly
                next(createError(400, "invalid study set id"));
            } 
            next(error); 
        }
    },

    deleteCardFromSet : async (request, response, next) => { // delete the specified flashcard from the set with the specified id
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
            } 
            next(error);
        }
    },

    addQuizScore : async (request, response, next) => {
        try {
            const targetedSetId = request.params.id;
            const studySet = await StudySet.findById(targetedSetId);
            if (studySet === null) { // the provided id doesn't match any study set in the db
                next(createError(404, "Study Set does not exist"));
                return;
            }
            let addedQuizScore = request.body.addedQuizScore;
            if (addedQuizScore === undefined || addedQuizScore === null) { // verifying that the request body actually contains a quiz score to add
                next(createError(400, "No quiz score provided"));
                return;
            }
            addedQuizScore = parseFloat(addedQuizScore);
            if (isNaN(addedQuizScore)) { // verifying that the sent quiz score is a number
                next(createError(400, "Provided quiz score is not a number"));
                return;
            }   
            if (addedQuizScore < 0 || addedQuizScore > 1) { // the quiz score must be a float between 0 and 1 indicating the fraction of correct answers
                next(createError(422, "Provided quiz score must be the fraction of correct answers and must be between 0 and 1"));
                return;
            }
            // if we get here then the quiz score is valid and can be added to the study set
            studySet.quizScores.push(addedQuizScore); 
            const result = await studySet.save();
            response.send(result);
        } catch (error) {
            console.log(error.message);
            if (error instanceof mongoose.CastError) { // triggers if provided objectid doesn't have a valid format
                next(createError(400, "invalid study set id"));
            }
            next(error);
        }
    }
}