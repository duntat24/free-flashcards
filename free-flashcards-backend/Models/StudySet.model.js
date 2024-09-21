const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StudySetSchema = new Schema({
    title: {
        type: String,
        required: true
    }, 
    cards: {
        type: [Schema.Types.ObjectId],
        required: true
    },
    quizScores: {
        type: [Number],
        required: true
    }
});


const StudySet = mongoose.model('studyset', StudySetSchema);
module.exports = StudySet;