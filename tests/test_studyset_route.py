import unittest
from api_calls_helper import *
import json

class StudySetRouteTests(unittest.TestCase):

    def setUp(self):
        self.id_doesnt_exist = "66ecea881120acdb2fca8ef9" # Study set id that doesn't exist in the db
        self.id_invalid = "invalid" # This is not a valid format for an object id

        self.tested_set_id = "66ecea881120acdb2fca8ef3" # id for the set we modify & access, but we do not delete this
        self.unmodified_set_id = "66eef6f0933048fdcc0cd2d5" # This set is not modified and exists to verify that getting all study sets successfully returns multiple sets

    def test_study_set_get_all(self):
        # This method tests getting all the study sets in the test DB since the system is currently only designed for 1 user

        get_response = get_rest_call(self, "http://localhost:3002/sets")
        contains_tested_set = False
        contains_unmodified_set = False
        # Looping through all the returned study sets seems wrong and could cause problems if the test data set gets very large
        # However, since the returned data is a list of dictionaries and the order the information is returned in is not guaranteed, a loop seems necessary
        for study_set in get_response["study_sets"]:
            if (study_set["_id"] == self.tested_set_id):
                contains_tested_set = True
            elif (study_set["_id"] == self.unmodified_set_id):
                contains_unmodified_set = True
        self.assertTrue(contains_tested_set, "The response did not contain the id of the study set being modified by tests")
        self.assertTrue(contains_unmodified_set, "The response did not contain the id of the study set not being modified by tests")
    
    def test_create_study_set(self):
        # This method tests that we can create a study set by providing the title of the newly created set

        created_set_body = {"title": "This will be deleted"}
        created_set_string = json.dumps(created_set_body) # This converts the dictionary to a json in string format
        header = {"Content-Type": "application/json"} # This header results in the user string being interpreted as a JSON
        
        post_response = post_rest_call(self, "http://localhost:3002/sets", request_parameters=created_set_string, 
                                       request_header=header)
        self.assertEqual(created_set_body["title"], post_response["title"], 
                         f"Expected created set to have title '{created_set_body["title"]}' but instead got title '{post_response["title"]}'")
        
        delete_rest_call(self, f"http://localhost:3002/sets/{post_response["_id"]}") # deleting the set we create to avoid bloating the test db
    
    def test_create_study_set_no_title(self):
        # This method tests attempting to create a study set with no title field in the request. Sets must have a title to be displayed to users

        created_set_body = {"notATitle": "no"}
        created_set_string = json.dumps(created_set_body) # This converts the dictionary to a json in string format
        header = {"Content-Type": "application/json"} # This header results in the user string being interpreted as a JSON
        
        post_rest_call(self, "http://localhost:3002/sets", request_parameters=created_set_string, request_header=header, expected_code=400)

    def test_create_study_set_empty_title(self):
        # This method tests attempting to create a study set with a title field of an empty string in the request

        created_set_body = {"title": ""}
        created_set_string = json.dumps(created_set_body) # This converts the dictionary to a json in string format
        header = {"Content-Type": "application/json"} # This header results in the user string being interpreted as a JSON
        
        post_rest_call(self, "http://localhost:3002/sets", request_parameters=created_set_string, request_header=header, expected_code=400)

    def test_create_study_set_whitespace_title(self):
        # This method tests attempting to create a study set with a title field that contains only whitespace characters

        created_set_body = {"title": " \t\n "}
        created_set_string = json.dumps(created_set_body) # This converts the dictionary to a json in string format
        header = {"Content-Type": "application/json"} # This header results in the user string being interpreted as a JSON
        
        post_rest_call(self, "http://localhost:3002/sets", request_parameters=created_set_string, request_header=header, expected_code=400)

    def test_delete_study_set_doesnt_exist(self):
        # This method tests attempting to delete a study set with an id not present in the db
        # This should give different response code from attempting to delete a study set with an invalidly formatted id

        delete_response = delete_rest_call(self, f"http://localhost:3002/sets/{self.id_doesnt_exist}", expected_code=404)
        expected_deletion_404_message = "Study Set does not exist" # we need to ensure the 404 is caused by the resource not existing in the db, not an invalid url
        self.assertEqual(expected_deletion_404_message, delete_response["error"]["message"],
                         f"Expected 404 message of '{expected_deletion_404_message}' but instead got '{delete_response["error"]["message"]}'")

    def test_delete_study_set_invalid_id(self):
        # This method tests attempting to delete a study set with an invalidly formatted id
        # This should give different response code from attempting to delete a study set with a validly formatted id that doesn't exist

        delete_rest_call(self, f"http://localhost:3002/sets/{self.id_invalid}", expected_code=400)
        # The assert to ensure the response code is correct is done inside the method

    def test_delete_study_set_exists(self):
        # This method tests attempting to delete a study set with an id that exists in the db

        # We first create the study set that we're going to delete to ensure the target of our action always exists
        created_set_body = {"title": "This will be deleted"}
        created_set_string = json.dumps(created_set_body) # This converts the dictionary to a json in string format
        header = {"Content-Type": "application/json"} # This header results in the user string being interpreted as a JSON
        
        post_response = post_rest_call(self, "http://localhost:3002/sets", request_parameters=created_set_string, 
                                       request_header=header)
        created_set_id = post_response["_id"]

        # We then add flashcards to the created set to verify that deleting the set from the API deletes the set and all its cards
        created_card_body = {"prompt": "Uh oh", "response": "Oh no", "userResponseType": "text"}
        created_card_string = json.dumps(created_card_body) # This converts the dictionary to a json in string format
        
        first_card_id = post_rest_call(self, f"http://localhost:3002/sets/{created_set_id}", request_parameters=created_card_string, 
                                       request_header=header)["cards"][0]
        second_card_id = post_rest_call(self, f"http://localhost:3002/sets/{created_set_id}", request_parameters=created_card_string, 
                                       request_header=header)["cards"][1]
        
        # We then delete the study set and verify we can no longer access it or its flashcards
        delete_rest_call(self, f"http://localhost:3002/sets/{created_set_id}")

        # The set and all its cards should be deleted now
        set_get_response = get_rest_call(self, f"http://localhost:3002/sets/{created_set_id}", expected_code=404)
        expected_set_get_404_message = "Study Set does not exist" # we need to ensure the 404 is caused by the resource not existing in the db, not an invalid url
        self.assertEqual(expected_set_get_404_message, set_get_response["error"]["message"],
                         f"Expected 404 message of '{expected_set_get_404_message}' but instead got '{set_get_response["error"]["message"]}'")

        first_card_get_response = get_rest_call(self, f"http://localhost:3002/cards/{first_card_id}", expected_code=404)
        expected_card_get_404_message = "Flashcard does not exist" # we need to ensure the 404 is caused by the resource not existing in the db, not an invalid url
        self.assertEqual(expected_card_get_404_message, first_card_get_response["error"]["message"],
                         f"Expected 404 message of '{expected_card_get_404_message}' but instead got '{first_card_get_response["error"]["message"]}'")

        second_card_get_response = get_rest_call(self, f"http://localhost:3002/cards/{second_card_id}", expected_code=404)
        self.assertEqual(expected_card_get_404_message, second_card_get_response["error"]["message"],
                         f"Expected 404 message of '{expected_card_get_404_message}' but instead got '{second_card_get_response["error"]["message"]}'")

    def test_get_study_set_doesnt_exist(self):
        # This method tests attempting to get a study set with an id not present in the db
        # This should give different response code from attempting to get a study set with an invalidly formatted id

        get_response = get_rest_call(self, f"http://localhost:3002/sets/{self.id_doesnt_exist}", expected_code=404)
        expected_get_404_message = "Study Set does not exist"
        self.assertEqual(expected_get_404_message, get_response["error"]["message"],
                         f"Expected 404 message of '{expected_get_404_message}' but instead got '{get_response["error"]["message"]}'")

    def test_get_study_set_invalid_id(self):
        # This method tests attempting to get a study set with an invalidly formatted id
        # This should give different response code from attempting to get a study set with a validly formatted id that doesn't exist

        get_rest_call(self, f"http://localhost:3002/sets/{self.id_invalid}", expected_code=400)
        # The get_rest_call method asserts that the response code is 400, so we don't need to do anything else

    def test_get_study_set_exists(self):
        # This method tests attempting to get a study set when the id exists in the db
        
        get_response = get_rest_call(self, f"http://localhost:3002/sets/{self.unmodified_set_id}")
        expected_title = "don't modify me" # NOTE this can change depending on the test data in the test db
        self.assertEqual(expected_title, get_response["title"],
                         f"Expected title of '{expected_title}' but instead got '{get_response["title"]}")

    def test_update_study_set_doesnt_exist(self):
        # This method tests attempting to update the title of a study set with an id not present in the db
        # This should give different response code from attempting to update a study set with an invalidly formatted id
        
        updated_set_title = {"title": "A brand new title"}
        updated_set_string = json.dumps(updated_set_title) # This converts the dictionary to a json in string format
        header = {"Content-Type": "application/json"} # This header results in the user string being interpreted as a JSON

        put_response = put_rest_call(self, f"http://localhost:3002/sets/{self.id_doesnt_exist}", 
                      request_parameters=updated_set_string, request_header=header, expected_code=404)
        expected_put_404_message = "Study set does not exist"
        self.assertEqual(expected_put_404_message, put_response["error"]["message"])

    def test_update_study_set_invalid_id(self):
        # This method tests attempting to update the title of a study set with an invalidly formatted id
        # This should give different response code from attempting to update a study set with an invalidly formatted id

        updated_set_title = {"title": "A brand new title"}
        updated_set_string = json.dumps(updated_set_title) # This converts the dictionary to a json in string format
        header = {"Content-Type": "application/json"} # This header results in the user string being interpreted as a JSON

        put_rest_call(self, f"http://localhost:3002/sets/{self.id_invalid}", request_parameters=updated_set_string, 
                      request_header=header, expected_code=400)

    def test_update_study_set_exists(self):
        # This method tests attempting to update the title of a study set that exists in the db

        updated_set_title = {"title": "A brand new title"}
        updated_set_string = json.dumps(updated_set_title) # This converts the dictionary to a json in string format
        header = {"Content-Type": "application/json"} # This header results in the user string being interpreted as a JSON

        put_response = put_rest_call(self, f"http://localhost:3002/sets/{self.tested_set_id}", request_parameters=updated_set_string, 
                                        request_header=header)
        self.assertEqual(updated_set_title["title"], put_response["title"],
                         f"Expected newly created title of '{updated_set_title["title"]}' but instead got '{put_response["title"]}'")

    # TODO: (along with testing all the routes & branches) - we need to add functionality for an array of quiz scores (floats)
    # TODO (for test_flashcard_route.py): Need to verify that 404 messages are for the targeted resource and not caused by attempting to hit a route that doesn't exist