import unittest
from api_calls_helper import *

class FlashcardRouteTests(unittest.TestCase):

    """
    This module tests functionality in the FlashcardController that is accessible through the API
    Note that POST and DELETE requests are accessed through the StudySet route because they require modifying the array of objectIDs in the set
    Before executing this file, launch the API with "npm test" in the free-flashcards-backend directory 
        Note: using "npm start" will not work because the production environment uses a different port from the testing environment, but trying to put test data in the production db is questionable 
    """

    def test_get_card_not_exists(self):
        request_objectid = "66cfd27b38e5367fabb70f8d" # this is a valid object id format, but doesn't match any flashcard in the db
        get_rest_call(self, f"http://localhost:3002/cards/{request_objectid}", expected_code = 404)
        # the assertion that the resource shouldn't be found (404 response) is done inside the get_rest_call method

    def test_get_card_invalid_id(self):
        request_objectid = "invalid" # this is not a validly formatted id
        get_rest_call(self, f"http://localhost:3002/cards/{request_objectid}", expected_code=400)
        # the assertion that the provided id is invalid (400 response) is done inside the get_rest_call method
    
    def test_get_card_exists(self):
        request_objectid = "66eceaca1120acdb2fca8ef8" # NOTE: This id is based on test data that was MANUALLY PLACED into the db - it will vary if run in a different environment
        get_result = get_rest_call(self, f"http://localhost:3002/cards/{request_objectid}")
        self.assertEqual("Hello", get_result["prompt"])
        self.assertEqual("Can you hear me", get_result["response"])
        self.assertEqual("text", get_result["userResponseType"])