const Flashcard = require("../Models/Flashcard.model");
const mongoose = require("mongoose");
const createError = require("http-errors");
const mongodb = require("mongodb");
const binary = mongodb.Binary;

const MAX_FILE_SIZE = 500000; // defines maximum file size in bytes

// define the needed functions in the module's exports 
module.exports = {

    findFlashcardById: async (request, response, next) => { // used to retrieve flashcards from the DB
        try {
            const searchedId = request.params.id; // getting the id in the route parameter
            const result = await Flashcard.findById(searchedId);            
            
            if (result === null) { // id is formatted correctly, but doesn't map to any flashcards
                next(createError(404, "Flashcard does not exist"));
            } else {
                response.send(result);
            }
        } catch (error) {
            console.log(error.message);
            if (error instanceof mongoose.CastError) { // objectid is not formatted correctly
                next(createError(400, "invalid flashcard id"));
            }
            next(error);
        }
    },

    createNewFlashcard : async (cardPrompt, cardResponse, cardResponseType, createdId, next) => {
        try {
            const card = new Flashcard({prompt: cardPrompt, response: cardResponse, userResponseType: cardResponseType}); 
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

    updateFlashcard : async (request, response, next) => {
        try {
            const options = {new: true, runValidators: true}; // we return the newly created flashcard body and also run our schema validation against the attempted update
            const updatedBody = request.body;
            const updatedCardId = request.params.id;
            const result = await Flashcard.findByIdAndUpdate(updatedCardId, updatedBody, options);
            if (result === null) {
                next(createError(404, "Flashcard does not exist")); // valid id format but no matching db entry
            } else {
                response.send(result);
            }
        } catch (error) {
            console.log(error);
            if (error instanceof mongoose.CastError) { // triggers if provided objectid is not formatted correctly
                next(createError(400, "invalid flashcard id"));
            }
            if (error instanceof mongoose.Error.ValidationError) { // triggers if the updated body violates our schema - for now just if the provided userResponseType isn't supported
                next(createError(400, "invalid request body"));
            }
            next(error);
        }
    }, 

    addFileToCard : async (request, response, next) => {
        try {
            if (request.files === null) {
                next(createError(400, "No file attached"));
                return;
            }
            const addedFile = request.files.file;
            const partOfPrompt = request.body.partOfPrompt;
            if (partOfPrompt !== "false" && partOfPrompt !== "true") { // the file must be part of a prompt or response, otherwise request is invalid
                next(createError(400, "File must be part of a prompt or response"));
                return;
            }

            const cardId = request.params.id;
            const fileValidationResult = validateFileInput(addedFile);
            if (fileValidationResult.code !== 200) { // validateFileInput returns the correct server status code and message if an error occurs
                next(createError(fileValidationResult.code, fileValidationResult.message));
                return;
            }

            const fileBinary = new binary(addedFile.data); // we need to get the binary from the file to convert it to an easily stored format
            const options = {new: true};           
            const file = {fileType: addedFile.mimetype, data: fileBinary, partOfPrompt: partOfPrompt};
            const result = await Flashcard.findByIdAndUpdate(cardId, {file: file}, options);
            if (result === null) { // the id we're updating with doesn't exist in the db
                next(createError(404, "Flashcard does not exist"));
            } 
            response.send({_id: result._id}); // we don't want to send the entire binary when we update the card
        } catch (error) {
            console.log(error.message);
            if (error instanceof mongoose.CastError) {
                next(createError(400, "Invalid flashcard id"));
            }
            if (error.name === "BSONError") {
                next(createError(400, "Invalid file attached"));
            }
            next(error);
        }
    }
    
}


// this function verifies that uploaded files are within size and type constraints
// it returns the entity to be returned to the client (status code and error message, if applicable)
function validateFileInput(file) {
    let response = {code: 200, message: "OK"};
    if (file === null || file === undefined) {
        response.code = 400;
        response.message = "Request does not contain a file";
        return response; // we need to return response immediately here to not get errors for checking undefined fields
    }
    if (file.data.length > MAX_FILE_SIZE) {
        response.code = 422;
        response.message = "Attached file is too large";
    }
    const fileMimetypeArray = file.mimetype.split("/"); // separates keywords in the file's description, e.g. [image, jpeg]
    if (fileMimetypeArray[0] !== "image" && fileMimetypeArray[0] !== "audio") {
        response.code = 400
        response.message = "Attached files must be image or audio files and cannot be PDFs";
    }
    if (fileMimetypeArray[1] === "tiff" || fileMimetypeArray[1] === "tiff-fx") {
        response.code = 400
        response.message = "Attached files cannot be in the following formats: tiff";
    }

    return response;
}

