const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FlashcardSchema = new Schema({
    prompt: { 
        type: String,
        required: true
    },
    response: { // TODO: need types of responses such as audio or drawn responses (images)
        type: String,
        require: true
    }
});

const Flashcard = mongoose.model('flashcard', FlashcardSchema);
module.exports = Flashcard;