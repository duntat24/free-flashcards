const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StudySetSchema = new Schema({
    title: {
        type: String,
        required: true
    }, 
    cards: [Schema.Types.ObjectId]
});


const StudySet = mongoose.model('studyset', StudySetSchema);
module.exports = StudySet;