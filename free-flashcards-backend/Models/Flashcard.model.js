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
    }
});

// TODO: need types of responses such as audio or drawn responses (images)

const Flashcard = mongoose.model('flashcard', FlashcardSchema);
module.exports = Flashcard;