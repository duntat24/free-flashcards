import unittest
from api_calls_helper import *
import json
import binascii
import base64

class FlashcardRouteTests(unittest.TestCase):

    """
    This module tests functionality in the FlashcardController that is accessible through the API
    Note that POST and DELETE requests for flashcards are accessed through the StudySet route because they require modifying the array of objectIDs in the set, so we aren't testing that functionality here
    Before executing this file, launch the API with "npm test" in the free-flashcards-backend directory 
        Note: using "npm start" will not work because the production environment uses a different port from the testing environment since we should avoid mixing test and production data 
    There are several hard-coded object ids in this file. These should vary based on the values in your testing database.
    """

    def setUp(self): 
        # executed before every test, we ensure that certain values that multiple tests rely on that may change can be modified if needed

        self.nonexistent_id = "66cfd27b38e5367fabb70f8d" # this is a valid format but doesn't match any flashcard db entries
        self.invalid_id = "invalid" # this is not a valid objectid format
        self.file_card_id = "66edb6a0debf1f33640321e6" # This is the objectid of the card we are going to modify by adding files to 
        self.put_card_id = "66ecf15ffd9b0d57db2ad364" # This is the objectid of the card we modify with PUT requests

        # Defining the file paths for files we may use multiple times so we only need to change them here if they change
        self.wav_file_path = "./files/CantinaBand3.wav" 
        self.jpg_file_path = "./files/jpeg-home.jpg"
        self.mp3_file_path = "./files/t-rex-roar.mp3"
        self.bmp_file_path = "./files/test_bmp_multicolor.bmp"
        self.gif_file_path = "./files/test_gif.gif"
        self.svg_file_path = "./files/test_svg.svg"

        self.too_large_file_path = "./files/test_bmp.bmp"
        self.pdf_file_path = "./files/test_pdf.pdf"
        self.tif_file_path = "./files/test_tif.tif"

    def test_get_card_not_exists(self):
        # This method tests attempting to get a card with an id that doesn't exist in the db
        # This should give a different response code than an invalidly formatted id

        get_response = get_rest_call(self, f"http://localhost:3002/cards/{self.nonexistent_id}", expected_code=404)
        expected_card_get_404_message = "Flashcard does not exist" # We need to check that this message is returned because we can also get a 404 if the URL we use doesn't match any URL supplied by the API
        self.assertEqual(expected_card_get_404_message, get_response["error"]["message"],
                         f"Expected 404 status message of '{expected_card_get_404_message}' but instead got '{get_response["error"]["message"]}'")

    def test_get_card_invalid_id(self):
        # This method tests attempting to get a card with an id that is incorrectly formatted. 
        # This should give a different response code than a validly formatted id that doesn't exist

        get_rest_call(self, f"http://localhost:3002/cards/{self.invalid_id}", expected_code=400)
        # the assertion that the provided id is invalid (400 response) is done inside the get_rest_call method
    
    def test_get_card_exists(self):
        # This method tests getting a card where the id matches an id existing in the db

        request_objectid = "66eceaca1120acdb2fca8ef8" # NOTE: This id is based on test data that was MANUALLY PLACED into the db - it will vary if run in a different environment
        get_result = get_rest_call(self, f"http://localhost:3002/cards/{request_objectid}")
        
        # NOTE: The expected values being checked in these assertions were manually placed in the test db - it will vary if run in a different environment
        self.assertEqual("Hello", get_result["prompt"], 
                         f"Expected prompt 'Hello' but instead got '{get_result["prompt"]}'")
        self.assertEqual("Can you hear me", get_result["response"], 
                         f"Expected response 'Can you hear me' but instead got '{get_result["response"]}'")
        self.assertEqual("text", get_result["userResponseType"], 
                         f"Expected user response type of 'text' but instead got '{get_result["userResponseType"]}'")
    
    def test_put_card_not_exists(self):
        # This method tests attempting to make a PUT request with an id not present in the db    
        # This should give a different response code than an invalidly formatted id 

        updated_card_body = {"prompt": "seems I've been", "response": "edited", "userResponseType": "drawn"}
        updated_card_string = json.dumps(updated_card_body) # This converts the dictionary to a json in string format
        header = {"Content-Type": "application/json"} # This header results in the string being interpreted as a JSON

        put_response = put_rest_call(self, f"http://localhost:3002/cards/{self.nonexistent_id}", 
                      request_parameters=updated_card_string, request_header=header, expected_code=404)
        expected_card_put_404_message = "Flashcard does not exist" # We need to make sure the 404 is caused by the card not existing and not using the wrong URL
        self.assertEqual(expected_card_put_404_message, put_response["error"]["message"],
                         f"Expected 404 status message of '{expected_card_put_404_message}' but instead got '{put_response["error"]["message"]}'")
        
    def test_put_card_invalid_id(self):
        # This method tests attempting to make a PUT request with an id that is invalidly formatted
        # This should give a different response code than a validly formatted id that doesn't exist

        updated_card_body = {"prompt": "seems I've been", "response": "edited", "userResponseType": "drawn"}
        updated_card_string = json.dumps(updated_card_body) # This converts the dictionary to a json in string format
        header = {"Content-Type": "application/json"} # This header results in the string being interpreted as a JSON

        put_response = put_rest_call(self, f"http://localhost:3002/cards/{self.invalid_id}", 
                      request_parameters=updated_card_string, request_header=header, expected_code=400)
        expected_put_card_400_message = "invalid flashcard id" # There are two different 400 status messages when doing a PUT on a flashcard, we need to make sure we get the right one
        self.assertEqual(expected_put_card_400_message, put_response["error"]["message"],
                         f"Expected 400 status message of '{expected_put_card_400_message}' but isntead got '{put_response["error"]["message"]}'")    
        
    def test_put_card_valid_id_and_body(self):
        # This method tests attempting to make a PUT request with an id that exists in the db

        updated_card_body = {"prompt": "seems I've been", "response": "edited", "userResponseType": "drawn"}
        updated_card_string = json.dumps(updated_card_body) # This converts the dictionary to a json in string format
        header = {"Content-Type": "application/json"} # This header results in the string being interpreted as a JSON

        put_response = put_rest_call(self, f"http://localhost:3002/cards/{self.put_card_id}", 
                      request_parameters=updated_card_string, request_header=header)
        
        # The prompt, response, and userResponse type should be identical
        # We can't assert the request body will exactly match our updated body because the __v field may differ unexpectedly or we may add new fields to the card
        self.assertEqual(updated_card_body["prompt"], put_response["prompt"],
                         f"Expected prompt of '{updated_card_body["prompt"]}' but instead got '{put_response["prompt"]}'")
        self.assertEqual(updated_card_body["response"], put_response["response"],
                         f"Expected response of '{updated_card_body["response"]}' but instead got '{put_response["response"]}'")
        self.assertEqual(updated_card_body["userResponseType"], put_response["userResponseType"],
                         f"Expected user response type of '{updated_card_body["userResponseType"]}' but instead got '{put_response["userResponseType"]}'")

    def test_put_card_no_promt(self):
        # This method tests attempting to make a PUT request that doesn't contain a prompt on an existing id
        # This is a valid operation and should update the included fields

        updated_card_body = {"response": "changed", "userResponseType": "drawn"}
        updated_card_string = json.dumps(updated_card_body) # This converts the dictionary to a json in string format
        header = {"Content-Type": "application/json"} # This header results in the string being interpreted as a JSON

        put_response = put_rest_call(self, f"http://localhost:3002/cards/{self.put_card_id}", 
                      request_parameters=updated_card_string, request_header=header)
        
        # The included fields in the PUT should be modified
        self.assertEqual(updated_card_body["response"], put_response["response"],
                         f"Expected response of '{updated_card_body["response"]}' but instead got '{put_response["response"]}'")
        self.assertEqual(updated_card_body["userResponseType"], put_response["userResponseType"],
                         f"Expected user response type of '{updated_card_body["userResponseType"]}' but instead got '{put_response["userResponseType"]}'")

    def test_put_card_no_response(self):
        # This method tests attempting to make a PUT request that doesn't contain a response on an existing id
        # This is a valid operation and should update the included fields

        updated_card_body = {"prompt": "something has", "userResponseType": "drawn"}
        updated_card_string = json.dumps(updated_card_body) # This converts the dictionary to a json in string format
        header = {"Content-Type": "application/json"} # This header results in the string being interpreted as a JSON

        put_response = put_rest_call(self, f"http://localhost:3002/cards/{self.put_card_id}", 
                      request_parameters=updated_card_string, request_header=header)
        
        # The included fields in the PUT should be modified
        self.assertEqual(updated_card_body["prompt"], put_response["prompt"],
                         f"Expected prompt of '{updated_card_body["prompt"]}' but instead got '{put_response["prompt"]}'")
        self.assertEqual(updated_card_body["userResponseType"], put_response["userResponseType"],
                         f"Expected user response type of '{updated_card_body["userResponseType"]}' but instead got '{put_response["userResponseType"]}'")

    def test_put_card_no_user_response_type(self):
        # This method tests attempting to make a PUT request that doesn't contain a user response type on an existing id
        # This is a valid operation and should update the included fields

        updated_card_body = {"prompt": "something has", "response": "changed"}
        updated_card_string = json.dumps(updated_card_body) # This converts the dictionary to a json in string format
        header = {"Content-Type": "application/json"} # This header results in the string being interpreted as a JSON

        put_response = put_rest_call(self, f"http://localhost:3002/cards/{self.put_card_id}", 
                      request_parameters=updated_card_string, request_header=header)
        
        # The included fields in the PUT should be modified
        self.assertEqual(updated_card_body["prompt"], put_response["prompt"],
                         f"Expected prompt of '{updated_card_body["prompt"]}' but instead got '{put_response["prompt"]}'")
        self.assertEqual(updated_card_body["response"], put_response["response"],
                         f"Expected response of '{updated_card_body["response"]}' but instead got '{put_response["response"]}'")
    
    def test_put_card_invalid_user_response_type(self):
        # This method tests attempting to make a PUT request that contains an invalid user response type on an existing id 
        # The only accepted response types are 'text', 'drawn', and 'recorded' - all others should result in an error

        updated_card_body = {"prompt": "seems I've been", "response": "edited", "userResponseType": "INVALID"}
        updated_card_string = json.dumps(updated_card_body) # This converts the dictionary to a json in string format
        header = {"Content-Type": "application/json"} # This header results in the string being interpreted as a JSON

        put_response = put_rest_call(self, f"http://localhost:3002/cards/{self.put_card_id}", 
                      request_parameters=updated_card_string, request_header=header, expected_code=400)
        expected_put_card_400_message = "invalid request body" # There are two different 400 status messages when doing a PUT on a flashcard, we need to make sure we get the right one
        self.assertEqual(expected_put_card_400_message, put_response["error"]["message"],
                         f"Expected 400 status message of '{expected_put_card_400_message}' but isntead got '{put_response["error"]["message"]}'")    
        
    def test_put_card_contains_file(self):
        # This method tests attempting to make a PUT request that contains a file on an existing id
        # This is not a valid operation when done through the cards/:id PUT route and should produce an error

        with open(self.wav_file_path, "rb") as attached_file: # rb lets us read the file in binary format
            file = {"file": attached_file}
            put_rest_call(self, f"http://localhost:3002/cards/{self.put_card_id}", attached_files=file, expected_code=422)
    
    def test_add_file_to_card_doesnt_exist(self):
        # This method tests attempting to add a file to a card with an id that doesn't exist in the db
        # This should give a different response code than an invalidly formatted id

        with open(self.wav_file_path, "rb") as attached_file: # rb lets us read the file in binary format
            file = {"file": ("attachment", attached_file, "audio/wav")}
            body = {"partOfPrompt": "true"} # we need to include this or the request format is invalid

            post_response = post_rest_call(self, f"http://localhost:3002/cards/{self.nonexistent_id}/file", 
                             attached_files=file, request_parameters=body, expected_code=404)
            expected_add_file_404_message = "Flashcard does not exist" # We need to ensure the 404 is caused by the resource not existing and not using the wrong URL
            self.assertEqual(expected_add_file_404_message, post_response["error"]["message"],
                             f"Expected 404 status message of '{expected_add_file_404_message}' but instead got '{post_response["error"]["message"]}'")

    def test_add_file_to_card_invalid_id(self):
        # This method tests attempting to add a file to a card with an invalidly formatted id
        # This should give a different response code than a validly formatted id that doesn't exist in the db

        with open(self.wav_file_path, "rb") as attached_file: # rb lets us read the file in binary format
            file = {"file": ("attachment", attached_file, "audio/wav")}
            body = {"partOfPrompt": "true"} # we need to include this or the request format is invalid

            post_response = post_rest_call(self, f"http://localhost:3002/cards/{self.invalid_id}/file", 
                             attached_files=file, request_parameters=body, expected_code=400)
            expected_add_file_400_message = "Invalid flashcard id" # We need to ensure the 400 error is caused by the id being invalid and not another cause
            self.assertEqual(expected_add_file_400_message, post_response["error"]["message"],
                             f"Expected 400 status message of '{expected_add_file_400_message}' but instead got '{post_response["error"]["message"]}'")
    
    def test_add_file_to_card_wav(self): 
        # This method tests attempting to add a .wav file to a card with an id that exists in the db

        with open(self.wav_file_path, "rb") as attached_file: # rb lets us read the file in binary format
            file = {"file": ("attachment", attached_file, "audio/wav")}
            body = {"partOfPrompt": "true"} # we need to include this or the request format is invalid

            post_result = post_rest_call(self, f"http://localhost:3002/cards/{self.file_card_id}/file",
                              attached_files=file, request_parameters=body)
        
            self.assertEqual(self.file_card_id, post_result["_id"],
                             f"Expected id of '{self.file_card_id}' but instead got '{post_result["_id"]}'")

            # Our POST appears to have worked, but we want to verify that the file was actually uploaded to the card
            get_result = get_rest_call(self, f"http://localhost:3002/cards/{self.file_card_id}")
            compare_file_to_response(self, self.wav_file_path, get_result["file"]["data"]["data"])
    
    def test_add_file_to_card_jpg(self):
        # This method tests attempting to add a .jpg file to a card with an id that exists in the db

        with open(self.jpg_file_path, "rb") as attached_file:
            file = {"file": ("attachment", attached_file, "image/jpeg")}
            body = {"partOfPrompt": "true"} # we need to include this or the request format is invalid

            post_result = post_rest_call(self, f"http://localhost:3002/cards/{self.file_card_id}/file",
                              attached_files=file, request_parameters=body)
            
            self.assertEqual(self.file_card_id, post_result["_id"],
                             f"Expected id of '{self.file_card_id}' but instead got '{post_result["_id"]}'")

            # Our POST appears to have worked, but we want to verify that the file was actually uploaded to the card
            get_result = get_rest_call(self, f"http://localhost:3002/cards/{self.file_card_id}")
            compare_file_to_response(self, self.jpg_file_path, get_result["file"]["data"]["data"])

    def test_add_file_to_card_mp3(self):
        # This method tests attempting to add a .mp3 file to a card with an id that exists in the db

        with open(self.mp3_file_path, "rb") as attached_file:
            file = {"file": ("attachment", attached_file, "audio/mp3")} 
            body = {"partOfPrompt": "true"} # we need to include this or the request format is invalid

            post_result = post_rest_call(self, f"http://localhost:3002/cards/{self.file_card_id}/file",
                              attached_files=file, request_parameters=body)
            
            self.assertEqual(self.file_card_id, post_result["_id"],
                             f"Expected id of '{self.file_card_id}' but instead got '{post_result["_id"]}'")

            # Our POST appears to have worked, but we want to verify that the file was actually uploaded to the card
            get_result = get_rest_call(self, f"http://localhost:3002/cards/{self.file_card_id}")
            compare_file_to_response(self, self.mp3_file_path, get_result["file"]["data"]["data"])

    def test_add_file_to_card_bmp(self):
        # This method tests attempting to add a .bmp file to a card with an id that exists in the db

        with open(self.bmp_file_path, "rb") as attached_file:
            file = {"file": ("attachment", attached_file, "image/bmp")}
            body = {"partOfPrompt": "true"} # we need to include this or the request format is invalid

            post_result = post_rest_call(self, f"http://localhost:3002/cards/{self.file_card_id}/file",
                              attached_files=file, request_parameters=body)
            
            self.assertEqual(self.file_card_id, post_result["_id"],
                             f"Expected id of '{self.file_card_id}' but instead got '{post_result["_id"]}'")

            # Our POST appears to have worked, but we want to verify that the file was actually uploaded to the card
            get_result = get_rest_call(self, f"http://localhost:3002/cards/{self.file_card_id}")
            compare_file_to_response(self, self.bmp_file_path, get_result["file"]["data"]["data"])

    def test_add_file_to_card_gif(self):
        # This method tests attempting to add a .gif file to a card with an id that exists in the db

        with open(self.gif_file_path, "rb") as attached_file:
            file = {"file": ("attachment", attached_file, "image/gif")}
            body = {"partOfPrompt": "true"} # we need to include this or the request format is invalid

            post_result = post_rest_call(self, f"http://localhost:3002/cards/{self.file_card_id}/file",
                              attached_files=file, request_parameters=body)
            
            self.assertEqual(self.file_card_id, post_result["_id"],
                             f"Expected id of '{self.file_card_id}' but instead got '{post_result["_id"]}'")

            # Our POST appears to have worked, but we want to verify that the file was actually uploaded to the card
            get_result = get_rest_call(self, f"http://localhost:3002/cards/{self.file_card_id}")
            compare_file_to_response(self, self.gif_file_path, get_result["file"]["data"]["data"])

    def test_add_file_to_card_svg(self):
        # This method tests attempting to add a .svg file to a card with an id that exists in the db

        with open(self.svg_file_path, "rb") as attached_file:
            file = {"file": ("attachment", attached_file, "image/svg")}
            body = {"partOfPrompt": "true"} # we need to include this or the request format is invalid

            post_result = post_rest_call(self, f"http://localhost:3002/cards/{self.file_card_id}/file",
                              attached_files=file, request_parameters=body)
            
            self.assertEqual(self.file_card_id, post_result["_id"],
                             f"Expected id of '{self.file_card_id}' but instead got '{post_result["_id"]}'")

            # Our POST appears to have worked, but we want to verify that the file was actually uploaded to the card
            get_result = get_rest_call(self, f"http://localhost:3002/cards/{self.file_card_id}")
            compare_file_to_response(self, self.svg_file_path, get_result["file"]["data"]["data"])

    def test_add_file_to_card_too_large(self):
        # This method tests attempting to add a file with a size > 0.5 mb to a card with an id that exists in the db
        # This is invalid because we constrain the size of files on flashcards to 0.5 mb

        with open(self.too_large_file_path, "rb") as attached_file:
            file = {"file": ("attachment", attached_file, "image/bmp")}
            body = {"partOfPrompt": "true"} # we need to include this or the request format is invalid

            post_response = post_rest_call(self, f"http://localhost:3002/cards/{self.file_card_id}/file",
                              attached_files=file, request_parameters=body, expected_code=422)
            expected_add_file_422_message = "Attached file is too large" # We need to verify the 422 error is caused by the file being too large 
            self.assertEqual(expected_add_file_422_message, post_response["error"]["message"],
                             f"Expected 422 status message of '{expected_add_file_422_message}' but instead got '{post_response["error"]["message"]}'")

    def test_add_file_to_card_pdf(self):
         # This method tests attempting to add a .pdf file to a card with an id that exists in the db
         # A pdf is just one instance of a file with an invalid mimetype, but it is the most likely to be confused with an image type
         
         with open(self.pdf_file_path, "rb") as attached_file:
            file = {"file": ("attachment", attached_file, "application/pdf")}
            body = {"partOfPrompt": "true"} # we need to include this or the request format is invalid

            post_response = post_rest_call(self, f"http://localhost:3002/cards/{self.file_card_id}/file",
                              attached_files=file, request_parameters=body, expected_code=415)
            expected_add_file_415_message = "Attached files must be image or audio files and cannot be PDFs" # We need to verify this 415 error is caused by the attached file being a PDF
            self.assertEqual(expected_add_file_415_message, post_response["error"]["message"],
                             f"Expected 415 status message of '{expected_add_file_415_message}' but instead got '{post_response["error"]["message"]}'")

    def test_add_file_to_card_tif(self):
        # This method tests attempting to add a .tif file to a card with an id that exists in the db
        # This is invalid because tif files are not displayable in many browsers, so users shouldn't see that tif files upload successfully
        
        with open(self.tif_file_path, "rb") as attached_file:
            file = {"file": ("attachment", attached_file, "image/tiff")}
            body = {"partOfPrompt": "true"} # we need to include this or the request format is invalid

            post_response = post_rest_call(self, f"http://localhost:3002/cards/{self.file_card_id}/file",
                              attached_files=file, request_parameters=body, expected_code=415)
            expected_add_file_415_message = "Attached files cannot be in the following formats: tiff" # We want to verify this 415 error was caused by trying to attach a .tif file
            self.assertEqual(expected_add_file_415_message, post_response["error"]["message"],
                             f"Expected 415 status message of '{expected_add_file_415_message}' but instead got '{post_response["error"]["message"]}'")

    def test_add_file_to_card_no_part_of_prompt(self):
        # This method attempts adding a file to a card without indicating whether it is part of the card's prompt or not
        # This is invalid because users must indicate if an attached file is part of a prompt or part of a response
        
        with open(self.svg_file_path, "rb") as attached_file:
            file = {"file": ("attachment", attached_file, "image/svg")}

            post_response = post_rest_call(self, f"http://localhost:3002/cards/{self.file_card_id}/file",
                              attached_files=file, expected_code=400)
            expected_add_file_400_message = "File must be part of a prompt or response" # We need to verify this 400 error was caused by not indicating whether the file was part of a prompt or response
            self.assertEqual(expected_add_file_400_message, post_response["error"]["message"],
                             f"Expected 400 status message of '{expected_add_file_400_message}' but instead got '{post_response["error"]["message"]}'")
    
    def test_add_file_to_card_no_file(self):
        # This method attempts to add a card to a file without including a file in the request
        body = {"partOfPrompt": "true"} # we need to include this or the request format is invalid
        
        post_response = post_rest_call(self, f"http://localhost:3002/cards/{self.file_card_id}/file", 
                                       request_parameters=body, expected_code=400)
        expected_add_file_400_message = "No file attached" # We need to verify the 400 error is caused by not including a file in the request
        self.assertEqual(expected_add_file_400_message, post_response["error"]["message"],
                         f"Expected 400 status message of '{expected_add_file_400_message}' but instead got '{post_response["error"]["message"]}'")

    def test_delete_file_from_card_doesnt_exist(self):
        # This method tests attempting to delete a file from a card with an id that doesn't exist in the db
        # This should give a different response code than an invalidly formatted id

        delete_response = delete_rest_call(self, f"http://localhost:3002/cards/{self.nonexistent_id}/file", expected_code=404)
        expected_delete_file_404_message = "Flashcard does not exist" # We need to verify that the 404 was caused by the card not existing and not using the wrong URL
        self.assertEqual(expected_delete_file_404_message, delete_response["error"]["message"],
                         f"Expected 404 status message of '{expected_delete_file_404_message}' but instead got '{delete_response["error"]["message"]}'")

    def test_delete_file_from_card_invalid_id(self):
        # This method tests attempting to delete a file from a card with an id that is incorrectly formatted. 
        # This should give a different response code than a validly formatted id that doesn't exist

        delete_response = delete_rest_call(self, f"http://localhost:3002/cards/{self.invalid_id}/file", expected_code=400)
        expected_delete_file_400_message = "invalid flashcard id" # We need to verify the 400 error was caused by the invalid id and not something else 
        self.assertEqual(expected_delete_file_400_message, delete_response["error"]["message"],
                         f"Expected 400 status message of '{expected_delete_file_400_message}' but instead got '{delete_response["error"]["message"]}'")

    def test_delete_file_from_card_exists(self):
        # This method tests attempting to delete a file from a card with an id that exists in the db
        # It first sends a file to the flashcard that will have a file deleted from it to ensure that there will be something to delete
        
        with open(self.svg_file_path, "rb") as attached_file:
            file = {"file": ("attachment", attached_file, "image/svg")}
            body = {"partOfPrompt": "true"} # we need to include this or the request format is invalid
        
            post_rest_call(self, f"http://localhost:3002/cards/{self.file_card_id}/file",
                              attached_files=file, request_parameters=body)

        delete_response = delete_rest_call(self, f"http://localhost:3002/cards/{self.file_card_id}/file")

        get_response = get_rest_call(self, f"http://localhost:3002/cards/{self.file_card_id}")
        with self.assertRaises(KeyError): # a file field should not exist in the get responses
            get_response["file"]

        compare_file_to_response(self, self.svg_file_path, delete_response["data"]["data"])
    
    def test_delete_file_from_card_no_file(self):
        # This method tests attempting to delete a file from a card with an id that exists in the db but doesn't have a file
        # This operation shouldn't be performable by a user through normal application use, but is still not a valid operation

        delete_response = delete_rest_call(self, f"http://localhost:3002/cards/{self.put_card_id}/file", expected_code=422)
        expected_delete_file_422_message = "Card indicated for file removal has no file"
        self.assertEqual(expected_delete_file_422_message, delete_response["error"]["message"],
                         f"Expected 422 status message of '{expected_delete_file_422_message}' but instead got '{delete_response["error"]["message"]}'")

def compare_file_to_response(test, file_path, response_file_data, checked_bytes=500):
    """
    This method compares a locally stored file passed through the file_path with binary data contained in a response
    Args:
        test: a method in a TestCase class
        file_path (str): the path to the file being compared
        response_file_data (array): this is an array of binary data returned as part of a GET request to a DB entry that contains a file
        checked_bytes (int): --OPTIONAL-- This defines how many bytes are compared. We don't want or need to compare the entire file
    """
    with open(file_path, "rb") as local_file:
        file_base64_contents = binascii.b2a_base64(local_file.read())[:checked_bytes]
        request_binary_string = bytes(response_file_data)
        request_base64_string = base64.b64encode(request_binary_string)[:checked_bytes]
        test.assertEqual(file_base64_contents, request_base64_string, "The file contents of the received file do not match the locally stored copy of this file")
