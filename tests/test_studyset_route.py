import unittest
from api_calls_helper import *
import json

class StudySetRouteTests(unittest.TestCase):

    def setUp(self):
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
    '''
    def test_create_study_set(self):
        # This method tests that we can create a study set by providing the title of the newly created set

        created_set_body = {"title": "A whole new set"}
        created_set_string = json.dumps(created_set_body) # This converts the dictionary to a json in string format
        header = {"Content-Type": "application/json"} # This header results in the user string being interpreted as a JSON
        
        post_response = post_rest_call(self, "http://localhost:3002/sets", request_parameters=created_set_string, 
                                       request_header=header)
        self.assertEqual(created_set_body["title"], post_response["title"], 
                         f"Expected created set to have title '{created_set_body["title"]}' but instead got title '{post_response["title"]}'")
        
        # TODO: This method should delete the study set it creates to avoid bloating the test db
    '''
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

    # TODO: (along with testing all the routes & branches) - we need to add functionality for an array of quiz scores (floats)