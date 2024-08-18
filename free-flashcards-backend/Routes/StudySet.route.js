const express = require("express");

const router = express.Router();

const StudySetController = require("../Controllers/StudySet.Controller");

// the route: root/sets

router.post('/', StudySetController.createStudySet); // creates a new study set

module.exports = router;
