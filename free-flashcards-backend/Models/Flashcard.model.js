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
    file: { // note that a file is not required - cards are permitted to only have a text prompt & response
        fileType: { // we need to know how to construct the file data based on its format
            type: String
        }, 
        data: {
            type: Buffer
        }
    }
});

// TODO: need types of responses such as audio or drawn responses (images)

const Flashcard = mongoose.model('flashcard', FlashcardSchema);
module.exports = Flashcard;