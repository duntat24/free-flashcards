const express = require("express");

const router = express.Router();

const FlashcardController = require("../Controllers/Flashcard.Controller");

// this route will have some originating path (e.g. /cards/) that we will extend from

router.get('/', FlashcardController.testMethod); // should print "TEST SUCCEESS!" to the server console

router.post('/', FlashcardController.createFlashcard); // adds a single flashcard

router.delete('/:id', FlashcardController.deleteFlashcard); // deletes a single flashcard with a specified objectID

router.get('/:id', FlashcardController.findFlashcardById); // gets a single flashcard matching the specified id

router.put('/:id', FlashcardController.updateFlashcard); // updates the flashcard with the specified ID, if it exists

module.exports = router;