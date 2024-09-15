const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FlashcardSchema = new Schema({
    prompt: { 
        type: String,
        required: true
    },
    response: { 
        type: String,
        require: true
    },
    userResponseType: { // this indicates whether a user responds to a prompt by typing, drawing, or recording their response
        type: String,
        require: true
    }, 
    file: { // note that a file is not required - cards are permitted to only have a text prompt & response
        fileType: { // we need to know how to construct the file data based on its format
            type: String
        }, 
        data: { // the actual data contents of the file 
            type: Buffer
        },
        partOfPrompt: { // indicates whether this file should be displayed as part of a card's prompt or response
            type: Boolean
        }
    }
});

// TODO: need types of responses such as audio or drawn responses (images)

const Flashcard = mongoose.model('flashcard', FlashcardSchema);
module.exports = Flashcard;