const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StudySetSchema = new Schema({
    title: {
        type: String,
        required: true
    }, 
    cards: {
        type: Array,
        required: true
    }
});


const StudySet = mongoose.model('studyset', StudySetSchema);
module.exports = StudySet;