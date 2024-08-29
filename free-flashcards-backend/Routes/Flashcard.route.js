const express = require("express");

const router = express.Router();

const FlashcardController = require("../Controllers/Flashcard.Controller");

router.get('/:id', FlashcardController.findFlashcardById); // gets a single flashcard matching the specified id

module.exports = router;