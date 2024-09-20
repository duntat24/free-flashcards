import unittest
from api_calls_helper import *

class FlashcardControllerTests(unittest.TestCase):

    # We should have a clean way to initialize test data here

    def test_get_card_not_exists(self):
        request_objectid = "66cfd27b38e5367fabb70f8d" # this is a valid object id format, but doesn't match any flashcard in the db
        get_rest_call(self, f"http://localhost:3001/cards/{request_objectid}", expected_code = 404)
        # the assertion that the resource shouldn't be found (404 response) is done inside the get_rest_call method

    def test_get_card_invalid_id(self):
        request_objectid = "invalid" # this is not a validly formatted id
        get_rest_call(self, f"http://localhost:3001/cards/{request_objectid}", expected_code=400)
        # the assertion that the provided id is invalid (400 response) is done inside the get_rest_call method
    