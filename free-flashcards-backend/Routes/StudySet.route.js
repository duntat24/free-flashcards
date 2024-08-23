const express = require("express");

const router = express.Router();

const StudySetController = require("../Controllers/StudySet.Controller");

// handles requests on the route <root>/sets

router.post('/', StudySetController.createStudySet); // creates a new study set

router.delete('/:id', StudySetController.deleteStudySet); // deletes the study set matching the provided id

module.exports = router;
