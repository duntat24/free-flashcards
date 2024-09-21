import unittest
from api_calls_helper import *
import json

class StudySetRouteTests(unittest.TestCase):

    def setUp(self):
        self.id_doesnt_exist = "66ecea881120acdb2fca8ef9" # Study set id that doesn't exist in the db
        self.id_invalid = "invalid" # This is not a valid format for an object id

        self.tested_set_id = "66ecea881120acdb2fca8ef3" # id for the set we modify & access, but we do not delete this
        self.unmodified_set_id = "66ef2fcda9385af3ff0545bf" # This set is not modified and exists to verify that getting all study sets successfully returns multiple sets

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
        header = {"Content-Type": "application/json"} # This header results in the string being interpreted as a JSON
        
        post_response = post_rest_call(self, "http://localhost:3002/sets", request_parameters=created_set_string, 
                                       request_header=header)
        self.assertEqual(created_set_body["title"], post_response["title"], 
                         f"Expected created set to have title '{created_set_body["title"]}' but instead got title '{post_response["title"]}'")
        
        delete_rest_call(self, f"http://localhost:3002/sets/{post_response["_id"]}") # deleting the set we create to avoid bloating the test db
    
    def test_create_study_set_no_title(self):
        # This method tests attempting to create a study set with no title field in the request. Sets must have a title to be displayed to users

        created_set_body = {"notATitle": "no"}
        created_set_string = json.dumps(created_set_body) # This converts the dictionary to a json in string format
        header = {"Content-Type": "application/json"} # This header results in the string being interpreted as a JSON
        
        post_rest_call(self, "http://localhost:3002/sets", request_parameters=created_set_string, request_header=header, expected_code=400)

    def test_create_study_set_empty_title(self):
        # This method tests attempting to create a study set with a title field of an empty string in the request

        created_set_body = {"title": ""}
        created_set_string = json.dumps(created_set_body) # This converts the dictionary to a json in string format
        header = {"Content-Type": "application/json"} # This header results in the string being interpreted as a JSON
        
        post_rest_call(self, "http://localhost:3002/sets", request_parameters=created_set_string, request_header=header, expected_code=400)

    def test_create_study_set_whitespace_title(self):
        # This method tests attempting to create a study set with a title field that contains only whitespace characters

        created_set_body = {"title": " \t\n "}
        created_set_string = json.dumps(created_set_body) # This converts the dictionary to a json in string format
        header = {"Content-Type": "application/json"} # This header results in the string being interpreted as a JSON
        
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
        header = {"Content-Type": "application/json"} # This header results in the string being interpreted as a JSON
        
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
        expected_get_404_message = "Study Set does not exist" # We need to verify that this 404 code is because the resource doesn't exist, not because of an invalid URL
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
        header = {"Content-Type": "application/json"} # This header results in the string being interpreted as a JSON

        put_response = put_rest_call(self, f"http://localhost:3002/sets/{self.id_doesnt_exist}", 
                      request_parameters=updated_set_string, request_header=header, expected_code=404)
        expected_put_404_message = "Study set does not exist" # We need to verify that this 404 code is because the resource doesn't exist, not because of an invalid URL
        self.assertEqual(expected_put_404_message, put_response["error"]["message"])

    def test_update_study_set_invalid_id(self):
        # This method tests attempting to update the title of a study set with an invalidly formatted id
        # This should give different response code from attempting to update a study set with an invalidly formatted id

        updated_set_title = {"title": "A brand new title"}
        updated_set_string = json.dumps(updated_set_title) # This converts the dictionary to a json in string format
        header = {"Content-Type": "application/json"} # This header results in the string being interpreted as a JSON

        put_rest_call(self, f"http://localhost:3002/sets/{self.id_invalid}", request_parameters=updated_set_string, 
                      request_header=header, expected_code=400)

    def test_update_study_set_no_title(self):
        # This method tests attempting to update a study set without providing a title field
        updated_set_title = {"notATitle": "nooo"}
        updated_set_string = json.dumps(updated_set_title) # This converts the dictionary to a json in string format
        header = {"Content-Type": "application/json"} # This header results in the string being interpreted as a JSON

        put_response = put_rest_call(self, f"http://localhost:3002/sets/{self.tested_set_id}", request_parameters=updated_set_string, 
                                        request_header=header, expected_code=400)
        expected_set_no_title_message = "Sets must have a title" # a nonexistent title field produces a different status message than an only whitespace title field
        self.assertEqual(expected_set_no_title_message, put_response["error"]["message"], 
                         f"Expected 400 error message of '{expected_set_no_title_message}' but instead got '{put_response["error"]["message"]}'")

    def test_update_study_set_blank_title(self):
        # This method tests attempting to update a study set's title while providing an empty string in the title field

        updated_set_title = {"title": ""}
        updated_set_string = json.dumps(updated_set_title) # This converts the dictionary to a json in string format
        header = {"Content-Type": "application/json"} # This header results in the string being interpreted as a JSON

        put_response = put_rest_call(self, f"http://localhost:3002/sets/{self.tested_set_id}", request_parameters=updated_set_string, 
                                        request_header=header, expected_code=400)
        expected_set_no_title_message = "Set title must contain non-whitespace characters" # a nonexistent title field produces a different status message than an only whitespace title field
        self.assertEqual(expected_set_no_title_message, put_response["error"]["message"], 
                         f"Expected 400 error message of '{expected_set_no_title_message}' but instead got '{put_response["error"]["message"]}'")

    def test_update_study_set_whitespace_title(self):
        # This method tests attempting to update a study set's title while providing a string composed only of whitespace characters in the title field
        updated_set_title = {"title": ""}
        updated_set_string = json.dumps(updated_set_title) # This converts the dictionary to a json in string format
        header = {"Content-Type": "application/json"} # This header results in the string being interpreted as a JSON

        put_response = put_rest_call(self, f"http://localhost:3002/sets/{self.tested_set_id}", request_parameters=updated_set_string, 
                                        request_header=header, expected_code=400)
        expected_set_no_title_message = "Set title must contain non-whitespace characters" # a nonexistent title field produces a different status message than an only whitespace title field
        self.assertEqual(expected_set_no_title_message, put_response["error"]["message"], 
                         f"Expected 400 error message of '{expected_set_no_title_message}' but instead got '{put_response["error"]["message"]}'")

    def test_update_study_set_exists(self):
        # This method tests attempting to update the title of a study set that exists in the db

        updated_set_title = {"title": "A brand new title"}
        updated_set_string = json.dumps(updated_set_title) # This converts the dictionary to a json in string format
        header = {"Content-Type": "application/json"} # This header results in the string being interpreted as a JSON

        put_response = put_rest_call(self, f"http://localhost:3002/sets/{self.tested_set_id}", request_parameters=updated_set_string, 
                                        request_header=header)
        self.assertEqual(updated_set_title["title"], put_response["title"],
                         f"Expected newly created title of '{updated_set_title["title"]}' but instead got '{put_response["title"]}'")

    def test_add_card_to_study_set_doesnt_exist(self):
        # This method tests attempting to add a card to a study set with an id not present in the db
        # This should give different response code from attempting to add a card with an invalidly formatted id

        created_card_body = {"prompt": "Uh oh", "response": "Oh no", "userResponseType": "text"}
        created_card_string = json.dumps(created_card_body) # This converts the dictionary to a json in string format
        header = {"Content-Type": "application/json"} # This header results in the string being interpreted as a JSON

        post_result = post_rest_call(self, f"http://localhost:3002/sets/{self.id_doesnt_exist}", request_parameters=created_card_string,
                                       request_header=header, expected_code=404)
        post_404_expected_message = "Study Set does not exist" # We need to verify that this 404 code is because the resource doesn't exist, not because of an invalid URL
        self.assertEqual(post_404_expected_message, post_result["error"]["message"],
                         f"Expected a 404 message of '{post_404_expected_message}' but instead got '{post_result["error"]["message"]}'")

    def test_add_card_to_study_set_invalid_id(self):
        # This method tests attempting to add a card to a study set with an invalidly formatted id 
        # This should give different response code from attempting to add a card with an id not present in the db
        
        created_card_body = {"prompt": "Uh oh", "response": "Oh no", "userResponseType": "text"}
        created_card_string = json.dumps(created_card_body) # This converts the dictionary to a json in string format
        header = {"Content-Type": "application/json"} # This header results in the string being interpreted as a JSON

        post_rest_call(self, f"http://localhost:3002/sets/{self.id_invalid}", request_parameters=created_card_string,
                                       request_header=header, expected_code=400)

    def test_delete_card_from_study_set_doesnt_exist(self):
        # This method tests attempting to delete a card from a study set with a set id not present in the db
        # This should give different response code than attempting to delete a card with an invalidly formatted set id

        # Checking that the study set doesn't exist takes priority over checking that the card id exists, so we don't need to have a valid card id to pass
        delete_response = delete_rest_call(self, f"http://localhost:3002/sets/{self.id_doesnt_exist}/{self.id_doesnt_exist}", 
                                           expected_code=404)
        expected_set_404_message = "Study set does not exist"  # We need to verify that this 404 code is because the resource doesn't exist, not because of an invalid URL
        self.assertEqual(expected_set_404_message, delete_response["error"]["message"],
                         f"Expected a 404 response message of '{expected_set_404_message}' but instead got '{delete_response["error"]["message"]}'")

    def test_delete_card_from_study_set_invalid_id(self):
        # This method tests attempting to delete a card from a study set with an invalidly formatted set id
        # This should give different response code than attempting to delete a card with a set id that doesn't exist
       
        # Checking that the study set doesn't exist takes priority over checking that the card id exists, so we don't need to have a valid card id to pass
        delete_rest_call(self, f"http://localhost:3002/sets/{self.id_invalid}/{self.id_doesnt_exist}", 
                                           expected_code=400)
        
    def test_delete_card_from_study_set_card_doesnt_exist(self):
        # This method tests attempting to delete a card from a study set with a card id not present in the db
        # This should give different response code than attempting to delete a card with an invalidly formatted card id
        
        delete_response = delete_rest_call(self, f"http://localhost:3002/sets/{self.tested_set_id}/{self.id_doesnt_exist}",
                                            expected_code=404)
        expected_card_404_message = "Flashcard does not exist"  # We need to verify that this 404 code is because the resource doesn't exist, not because of an invalid URL
        self.assertEqual(expected_card_404_message, delete_response["error"]["message"],
                         f"Expected a 404 response message of '{expected_card_404_message}' but instead got '{delete_response["error"]["message"]}'")

    def test_delete_card_from_study_set_card_invalid_id(self):
        # This method tests attempting to delete a card from a study set with an invalidly formatted card id
        # This should give different response code than attempting to delete a card with a card id that doesn't exist
        
        delete_rest_call(self, f"http://localhost:3002/sets/{self.tested_set_id}/{self.id_invalid}",
                            expected_code=400)

    def test_add_card_and_delete_card_to_study_set_exists(self):
        # This method tests attempting to add a card to a study set with a valid set id, then tests attempting to delete that card 
        # We are bundling these two features into one test so we can ensure that the state of the test db after our test is the same as before we executed it
        # If we separated this into two tests we would either not be able to guarantee that, or we would be repeating a lot of our test code across those two methods

        created_card_body = {"prompt": "Uh oh", "response": "Oh no", "userResponseType": "text"}
        created_card_string = json.dumps(created_card_body) # This converts the dictionary to a json in string format
        header = {"Content-Type": "application/json"} # This header results in the string being interpreted as a JSON

        # we are assuming the added card will be in the 4th position in the array - this could be susceptible to changes to the testing db
        added_card_id = post_rest_call(self, f"http://localhost:3002/sets/{self.tested_set_id}", request_parameters=created_card_string,
                                       request_header=header)["cards"][3]
        
        # Getting the card to verify it has been added properly
        stored_card_data = get_rest_call(self, f"http://localhost:3002/cards/{added_card_id}")
        self.assertEqual(created_card_body["prompt"], stored_card_data["prompt"], 
                         f"Expected prompt '{created_card_body["prompt"]}' but instead got '{stored_card_data["prompt"]}'")
        self.assertEqual(created_card_body["response"], stored_card_data["response"], 
                         f"Expected response '{created_card_body["response"]}' but instead got '{stored_card_data["response"]}'")
        self.assertEqual(created_card_body["userResponseType"], stored_card_data["userResponseType"], 
                         f"Expected user response type of '{created_card_body["userResponseType"]}' but instead got '{stored_card_data["userResponseType"]}'")

        # Deleting the added card from the db. We should get a 404 when trying to directly access the card & its id should be present when fetching the set it was added to
        delete_rest_call(self, f"http://localhost:3002/sets/{self.tested_set_id}/{added_card_id}")

        get_card_result = get_rest_call(self, f"http://localhost:3002/cards/{added_card_id}", expected_code=404)
        expected_card_404_message = "Flashcard does not exist" # We need to verify that this 404 code is because the resource doesn't exist, not because of an invalid URL
        self.assertEqual(expected_card_404_message, get_card_result["error"]["message"])

        # Verifying that the added card's id is not present in the target set's array of its contained card ids
        get_set_result = get_rest_call(self, f"http://localhost:3002/sets/{self.tested_set_id}")
        set_card_ids = get_set_result["cards"]
        self.assertFalse(added_card_id in set_card_ids) 

    def test_add_set_quiz_score_doesnt_exist(self):
        # This method tests adding a quiz score to a study set with an id that doesn't exist in the db
        # This should produce a different error code than using an invalidly formatted id

        added_score_body = {"addedQuizScore": "0.5"}
        added_score_string = json.dumps(added_score_body) # This converts the dictionary to a json in string format
        header = {"Content-Type": "application/json"} # This header results in the string being interpreted as a JSON

        post_response = post_rest_call(self, f"http://localhost:3002/sets/{self.id_doesnt_exist}/quiz", 
                                       request_parameters=added_score_string, request_header=header, expected_code=404)
        expected_set_post_404_message = "Study Set does not exist" # We need to ensure the 404 is caused by the targeted resource not existing in the db and not targeting an API route that doesn't exist
        self.assertEqual(expected_set_post_404_message, post_response["error"]["message"],
                         f"Expected 404 status message of '{expected_set_post_404_message}' but instead got '{post_response["error"]["message"]}'")

    def test_add_set_quiz_score_invalid_id(self):
        # This method tests adding a quiz score to a study set with an invalidly formatted id
        # This should produce a different error code than using an id that doesn't exist in the db

        added_score_body = {"addedQuizScore": "0.5"}
        added_score_string = json.dumps(added_score_body) # This converts the dictionary to a json in string format
        header = {"Content-Type": "application/json"} # This header results in the string being interpreted as a JSON

        post_response = post_rest_call(self, f"http://localhost:3002/sets/{self.id_invalid}/quiz", 
                                       request_parameters=added_score_string, request_header=header, expected_code=400)
        expected_set_post_400_message = "invalid study set id" # We need to ensure the 400 is caused by an invalidly formatted object id, not the other possible causes of a 400 for this route
        self.assertEqual(expected_set_post_400_message, post_response["error"]["message"],
                         f"Expected 400 status message of '{expected_set_post_400_message}' but instead got '{post_response["error"]["message"]}'")

    def test_add_set_quiz_score_no_score(self):
        # This method tests attempting to add a quiz score without including the added quiz score in the request

        added_score_body = {"notAQuizScore": "0.5"}
        added_score_string = json.dumps(added_score_body) # This converts the dictionary to a json in string format
        header = {"Content-Type": "application/json"} # This header results in the string being interpreted as a JSON

        post_response = post_rest_call(self, f"http://localhost:3002/sets/{self.tested_set_id}/quiz", 
                                       request_parameters=added_score_string, request_header=header, expected_code=400)
        expected_set_post_400_message = "No quiz score provided" # We need to ensure the 400 is caused by no quiz score being included, not the other possible causes of a 400 for this route
        self.assertEqual(expected_set_post_400_message, post_response["error"]["message"],
                         f"Expected 400 status message of '{expected_set_post_400_message}' but instead got '{post_response["error"]["message"]}'")

    def test_add_set_quiz_score_not_a_number_string(self):
        # This method tests attempting to add a quiz score and including sending a string that isn't a number

        added_score_body = {"addedQuizScore": "abc"}
        added_score_string = json.dumps(added_score_body) # This converts the dictionary to a json in string format 
        header = {"Content-Type": "application/json"} # This header results in the string being interpreted as a JSON

        post_response = post_rest_call(self, f"http://localhost:3002/sets/{self.tested_set_id}/quiz", 
                                       request_parameters=added_score_string, request_header=header, expected_code=400)
        expected_set_post_400_message = "Provided quiz score is not a number" # We need to ensure the 400 is caused by the provided quiz score not being a valid number
        self.assertEqual(expected_set_post_400_message, post_response["error"]["message"],
                         f"Expected 400 status message of '{expected_set_post_400_message}' but instead got '{post_response["error"]["message"]}'")

    def test_add_set_quiz_score_mixed_numbers_and_letters_string(self):
        # This method tests attempting to add a quiz score and including sending a string that isn't a number

        added_score_body = {"addedQuizScore": "abc123"}
        added_score_string = json.dumps(added_score_body) # This converts the dictionary to a json in string format 
        header = {"Content-Type": "application/json"} # This header results in the string being interpreted as a JSON

        post_response = post_rest_call(self, f"http://localhost:3002/sets/{self.tested_set_id}/quiz", 
                                       request_parameters=added_score_string, request_header=header, expected_code=400)
        expected_set_post_400_message = "Provided quiz score is not a number" # We need to ensure the 400 is caused by the provided quiz score not being a valid number
        self.assertEqual(expected_set_post_400_message, post_response["error"]["message"],
                         f"Expected 400 status message of '{expected_set_post_400_message}' but instead got '{post_response["error"]["message"]}'")
        
    def test_add_set_quiz_score_whitespace_string(self):
        # This method tests attempting to add a quiz score and including sending a string that isn't a number

        added_score_body = {"addedQuizScore": " \t\n "}
        added_score_string = json.dumps(added_score_body) # This converts the dictionary to a json in string format 
        header = {"Content-Type": "application/json"} # This header results in the string being interpreted as a JSON

        post_response = post_rest_call(self, f"http://localhost:3002/sets/{self.tested_set_id}/quiz", 
                                       request_parameters=added_score_string, request_header=header, expected_code=400)
        expected_set_post_400_message = "Provided quiz score is not a number" # We need to ensure the 400 is caused by the provided quiz score not being a valid number
        self.assertEqual(expected_set_post_400_message, post_response["error"]["message"],
                         f"Expected 400 status message of '{expected_set_post_400_message}' but instead got '{post_response["error"]["message"]}'")
    
    def test_add_quiz_score_too_high(self):
        # This method tests attempting to add a quiz score higher than the accepted range [0, 1]

        added_score_body = {"addedQuizScore": "1.5"}
        added_score_string = json.dumps(added_score_body) # This converts the dictionary to a json in string format 
        header = {"Content-Type": "application/json"} # This header results in the string being interpreted as a JSON

        post_response = post_rest_call(self, f"http://localhost:3002/sets/{self.tested_set_id}/quiz", 
                                       request_parameters=added_score_string, request_header=header, expected_code=422)
        expected_set_post_422_message = "Provided quiz score must be the fraction of correct answers and must be between 0 and 1" # We need to ensure the 422 is caused by the number not being within the accepted range
        self.assertEqual(expected_set_post_422_message, post_response["error"]["message"],
                         f"Expected 422 status message of '{expected_set_post_422_message}' but instead got '{post_response["error"]["message"]}'")
        
    def test_add_quiz_score_too_low(self):
        # This method tests attempting to add a quiz score lower than the accepted range [0, 1]

        added_score_body = {"addedQuizScore": "-0.5"}
        added_score_string = json.dumps(added_score_body) # This converts the dictionary to a json in string format 
        header = {"Content-Type": "application/json"} # This header results in the string being interpreted as a JSON

        post_response = post_rest_call(self, f"http://localhost:3002/sets/{self.tested_set_id}/quiz", 
                                       request_parameters=added_score_string, request_header=header, expected_code=422)
        expected_set_post_422_message = "Provided quiz score must be the fraction of correct answers and must be between 0 and 1" # We need to ensure the 422 is caused by the number not being within the accepted range
        self.assertEqual(expected_set_post_422_message, post_response["error"]["message"],
                         f"Expected 422 status message of '{expected_set_post_422_message}' but instead got '{post_response["error"]["message"]}'")

    def test_add_set_quiz_score_integer(self):
        # This method tests attempting to add a quiz score with an integer, which should be accepted

        # We want to get the initial state of the set to ensure that a value was actually added to the array
        get_response = get_rest_call(self, f"http://localhost:3002/sets/{self.tested_set_id}")

        added_score_body = {"addedQuizScore": "1"}
        added_score_string = json.dumps(added_score_body) # This converts the dictionary to a json in string format 
        header = {"Content-Type": "application/json"} # This header results in the string being interpreted as a JSON

        post_response = post_rest_call(self, f"http://localhost:3002/sets/{self.tested_set_id}/quiz", 
                                       request_parameters=added_score_string, request_header=header)
        # We can't delete quiz scores from the db, so we need to get the quiz score we added from where it should be in the array (at the end) since we can't guarantee a precise index where it'll be
            # users shouldn't be able to erase their quiz history whether deliberately or accidentally
        
        # Verifying that exactly one quiz score was added to the array
        resulting_scores = post_response["quizScores"]
        initial_scores = get_response["quizScores"]
        self.assertEqual(len(initial_scores) + 1, len(resulting_scores),
                         f"Expected resulting number of quiz scores to be {len(initial_scores) + 1} but instead got {len(resulting_scores)}")

        # Verifying that our quiz score was added to the end of the array, we need to cast to float because python automatically turns the response from the client into a number
        self.assertEqual(float(added_score_body["addedQuizScore"]), resulting_scores[len(resulting_scores) - 1],
                         f"Expected added quiz score to be {added_score_body["addedQuizScore"]} but instead got {resulting_scores[len(resulting_scores) - 1]}")
        
    def test_add_set_quiz_score_float(self):
        # This method tests attempting to add a quiz score with a float, which should be accepted

        # We want to get the initial state of the set to ensure that a value was actually added to the array
        get_response = get_rest_call(self, f"http://localhost:3002/sets/{self.tested_set_id}")

        added_score_body = {"addedQuizScore": "0.5"}
        added_score_string = json.dumps(added_score_body) # This converts the dictionary to a json in string format 
        header = {"Content-Type": "application/json"} # This header results in the string being interpreted as a JSON

        post_response = post_rest_call(self, f"http://localhost:3002/sets/{self.tested_set_id}/quiz", 
                                       request_parameters=added_score_string, request_header=header)
        # We can't delete quiz scores from the db, so we need to get the quiz score we added from where it should be in the array (at the end) since we can't guarantee a precise index where it'll be
            # users shouldn't be able to erase their quiz history whether deliberately or accidentally
        
        # Verifying that exactly one quiz score was added to the array
        resulting_scores = post_response["quizScores"]
        initial_scores = get_response["quizScores"]
        self.assertEqual(len(initial_scores) + 1, len(resulting_scores),
                         f"Expected resulting number of quiz scores to be {len(initial_scores) + 1} but instead got {len(resulting_scores)}")

        # Verifying that our quiz score was added to the end of the array, we need to cast to a float because python automatically turns the response from the client into a number
        self.assertEqual(float(added_score_body["addedQuizScore"]), resulting_scores[len(resulting_scores) - 1],
                         f"Expected added quiz score to be {added_score_body["addedQuizScore"]} but instead got {resulting_scores[len(resulting_scores) - 1]}")

    # TODO: we need to add functionality for an array of quiz scores (floats) that the user can add & remove from
    
    # TODO (for test_flashcard_route.py): Need to verify that 404 messages are for the targeted resource and not caused by attempting to hit a route that doesn't exist
        # Also need to update the comment for the 'header' - mentions a 'user string', not sure where this typo came from