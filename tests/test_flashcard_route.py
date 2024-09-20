import unittest
from api_calls_helper import *
import json

class FlashcardRouteTests(unittest.TestCase):

    """
    This module tests functionality in the FlashcardController that is accessible through the API
    Note that POST and DELETE requests are accessed through the StudySet route because they require modifying the array of objectIDs in the set
    Before executing this file, launch the API with "npm test" in the free-flashcards-backend directory 
        Note: using "npm start" will not work because the production environment uses a different port from the testing environment, but trying to put test data in the production db is questionable 
    """

    def setUp(self): # executed before every test, we're just using it to make sure the nonexistent and invalid id variables are initialized
        self.nonexistent_id = "66cfd27b38e5367fabb70f8d" # this is a valid format but doesn't match any flashcard db entries
        self.invalid_id = "invalid" # this is not a valid objectid format
    
    def test_get_card_not_exists(self):
        get_rest_call(self, f"http://localhost:3002/cards/{self.nonexistent_id}", expected_code = 404)
        # the assertion that the resource shouldn't be found (404 response) is done inside the get_rest_call method

    def test_get_card_invalid_id(self):
        get_rest_call(self, f"http://localhost:3002/cards/{self.invalid_id}", expected_code=400)
        # the assertion that the provided id is invalid (400 response) is done inside the get_rest_call method
    
    def test_get_card_exists(self):
        request_objectid = "66eceaca1120acdb2fca8ef8" # NOTE: This id is based on test data that was MANUALLY PLACED into the db - it will vary if run in a different environment
        get_result = get_rest_call(self, f"http://localhost:3002/cards/{request_objectid}")
        
        self.assertEqual("Hello", get_result["prompt"])
        self.assertEqual("Can you hear me", get_result["response"])
        self.assertEqual("text", get_result["userResponseType"])

    def test_put_card_not_exists(self):        
        updated_card_body = {"prompt": "seems I've been", "response": "edited", "userResponseType": "drawn"}
        updated_card_string = json.dumps(updated_card_body) # This converts the dictionary to a json in string format
        header = {"Content-Type": "application/json"} # This header results in the user string being interpreted as a JSON

        put_rest_call(self, f"http://localhost:3002/cards/{self.nonexistent_id}", 
                      request_parameters=updated_card_string, request_header=header, expected_code=404)
        
    def test_put_card_invalid_id(self):
        updated_card_body = {"prompt": "seems I've been", "response": "edited", "userResponseType": "drawn"}
        updated_card_string = json.dumps(updated_card_body) # This converts the dictionary to a json in string format
        header = {"Content-Type": "application/json"} # This header results in the user string being interpreted as a JSON

        put_rest_call(self, f"http://localhost:3002/cards/{self.invalid_id}", 
                      request_parameters=updated_card_string, request_header=header, expected_code=400)
        
    def test_put_card_valid_id_and_body(self):
        edited_objectid = "66ecf15ffd9b0d57db2ad364"

        updated_card_body = {"prompt": "seems I've been", "response": "edited", "userResponseType": "drawn"}
        updated_card_string = json.dumps(updated_card_body) # This converts the dictionary to a json in string format
        header = {"Content-Type": "application/json"} # This header results in the user string being interpreted as a JSON

        put_response = put_rest_call(self, f"http://localhost:3002/cards/{edited_objectid}", 
                      request_parameters=updated_card_string, request_header=header)
        
        # The prompt, response, and userResponse type should be identical
        # We can't assert the request body will equal our post body because the __v field may differ unexpectedly
        self.assertEqual(updated_card_body["prompt"], put_response["prompt"])
        self.assertEqual(updated_card_body["response"], put_response["response"])
        self.assertEqual(updated_card_body["userResponseType"], put_response["userResponseType"])

    def test_put_card_no_promt(self):
        edited_objectid = "66ecf15ffd9b0d57db2ad364"

        updated_card_body = {"response": "changed", "userResponseType": "drawn"}
        updated_card_string = json.dumps(updated_card_body) # This converts the dictionary to a json in string format
        header = {"Content-Type": "application/json"} # This header results in the user string being interpreted as a JSON

        put_response = put_rest_call(self, f"http://localhost:3002/cards/{edited_objectid}", 
                      request_parameters=updated_card_string, request_header=header)
        
        # The included fields in the PUT should be modified
        self.assertEqual(updated_card_body["response"], put_response["response"])
        self.assertEqual(updated_card_body["userResponseType"], put_response["userResponseType"])

    def test_put_card_no_response(self):
        edited_objectid = "66ecf15ffd9b0d57db2ad364"

        updated_card_body = {"prompt": "something has", "userResponseType": "drawn"}
        updated_card_string = json.dumps(updated_card_body) # This converts the dictionary to a json in string format
        header = {"Content-Type": "application/json"} # This header results in the user string being interpreted as a JSON

        put_response = put_rest_call(self, f"http://localhost:3002/cards/{edited_objectid}", 
                      request_parameters=updated_card_string, request_header=header)
        
        # The included fields in the PUT should be modified
        self.assertEqual(updated_card_body["prompt"], put_response["prompt"])
        self.assertEqual(updated_card_body["userResponseType"], put_response["userResponseType"])

    def test_put_card_no_user_response_type(self):
        edited_objectid = "66ecf15ffd9b0d57db2ad364"

        updated_card_body = {"prompt": "something has", "response": "changed"}
        updated_card_string = json.dumps(updated_card_body) # This converts the dictionary to a json in string format
        header = {"Content-Type": "application/json"} # This header results in the user string being interpreted as a JSON

        put_response = put_rest_call(self, f"http://localhost:3002/cards/{edited_objectid}", 
                      request_parameters=updated_card_string, request_header=header)
        
        # The included fields in the PUT should be modified
        self.assertEqual(updated_card_body["prompt"], put_response["prompt"])
        self.assertEqual(updated_card_body["response"], put_response["response"])
    
    def test_put_card_invalid_user_response_type(self):
        edited_objectid = "66ecf15ffd9b0d57db2ad364"

        updated_card_body = {"prompt": "seems I've been", "response": "edited", "userResponseType": "INVALID"}
        updated_card_string = json.dumps(updated_card_body) # This converts the dictionary to a json in string format
        header = {"Content-Type": "application/json"} # This header results in the user string being interpreted as a JSON

        put_rest_call(self, f"http://localhost:3002/cards/{edited_objectid}", 
                      request_parameters=updated_card_string, request_header=header, expected_code=400)
        
        
        #TODO: Add test cases for...
        #   PUT: Verify that a PUT request to a card containing a file works correctly and that trying to include a file in a PUT doesn't apply
        #   POST: Test cases for adding a file to a card
        # ALSO: add special error messages if assert statements fail