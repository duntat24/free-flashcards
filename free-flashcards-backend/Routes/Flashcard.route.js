const express = require("express");

const router = express.Router();

const FlashcardController = require("../Controllers/Flashcard.Controller");

router.get('/:id', FlashcardController.findFlashcardById); // gets a single flashcard matching the specified id

router.post('/:id/file', FlashcardController.addFileToCard); // adds a file to the flashcard with the specified id

// We aren't able to hit this route for some reason...
router.delete('/:id/file', FlashcardController.deleteFileFromCard); // adds a file to the flashcard with the specified id

router.put('/:id', FlashcardController.updateFlashcard); // updates the flashcard with the specified id

module.exports = router;