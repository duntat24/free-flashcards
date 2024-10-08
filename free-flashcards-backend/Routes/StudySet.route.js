const express = require("express");

const router = express.Router();

const StudySetController = require("../Controllers/StudySet.Controller");
const StudySet = require("../Models/StudySet.model");

// handles requests on the route <root>/sets

router.get('/', StudySetController.getAllStudySets); // gets all study sets

router.post('/', StudySetController.createStudySet); // creates a new study set

router.delete('/:id', StudySetController.deleteStudySetById); // deletes the study set matching the provided id

router.get('/:id', StudySetController.getStudySetById); // gets a study study set matching the provided id

router.put('/:id', StudySetController.updateStudySetTitle); // updates the title of the study set with the provided id

router.post('/:id', StudySetController.addCardToSet); // adds a flashcard to the study set with the specified id

router.delete('/:set_id/:card_id', StudySetController.deleteCardFromSet); // deletes the specified card from the set

router.post('/:id/quiz', StudySetController.addQuizScore); // add a new quiz score to the specified study set

module.exports = router;
