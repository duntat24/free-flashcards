import unittest
from api_calls_helper import *
import json
import binascii
import base64

class FlashcardRouteTests(unittest.TestCase):

    """
    This module tests functionality in the FlashcardController that is accessible through the API
    Note that POST and DELETE requests are accessed through the StudySet route because they require modifying the array of objectIDs in the set
    Before executing this file, launch the API with "npm test" in the free-flashcards-backend directory 
        Note: using "npm start" will not work because the production environment uses a different port from the testing environment, but trying to put test data in the production db is questionable
    There are several hard-coded object ids in this files. These should vary based on the values in your testing database.
    """

    def setUp(self): # executed before every test, we're just using it to make sure the nonexistent and invalid id variables are initialized
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

        get_rest_call(self, f"http://localhost:3002/cards/{self.nonexistent_id}", expected_code=404)
        # the assertion that the resource shouldn't be found (404 response) is done inside the get_rest_call method

    def test_get_card_invalid_id(self):
        # This method tests attempting to get a card with an id that is incorrectly formatted. 
        # This should give a different response code than a validly formatted id that doesn't exist

        get_rest_call(self, f"http://localhost:3002/cards/{self.invalid_id}", expected_code=400)
        # the assertion that the provided id is invalid (400 response) is done inside the get_rest_call method
    
    def test_get_card_exists(self):
        # This method tests getting a card where the id matches an id existing in the db

        request_objectid = "66eceaca1120acdb2fca8ef8" # NOTE: This id is based on test data that was MANUALLY PLACED into the db - it will vary if run in a different environment
        get_result = get_rest_call(self, f"http://localhost:3002/cards/{request_objectid}")
        
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
        header = {"Content-Type": "application/json"} # This header results in the user string being interpreted as a JSON

        put_rest_call(self, f"http://localhost:3002/cards/{self.nonexistent_id}", 
                      request_parameters=updated_card_string, request_header=header, expected_code=404)
        
    def test_put_card_invalid_id(self):
        # This method tests attempting to make a PUT request with an id that is invalidly formatted
        # This should give a different response code than a validly formatted id that doesn't exist

        updated_card_body = {"prompt": "seems I've been", "response": "edited", "userResponseType": "drawn"}
        updated_card_string = json.dumps(updated_card_body) # This converts the dictionary to a json in string format
        header = {"Content-Type": "application/json"} # This header results in the user string being interpreted as a JSON

        put_rest_call(self, f"http://localhost:3002/cards/{self.invalid_id}", 
                      request_parameters=updated_card_string, request_header=header, expected_code=400)
        
    def test_put_card_valid_id_and_body(self):
        # This method tests attempting to make a PUT request with an id that exists in the db

        updated_card_body = {"prompt": "seems I've been", "response": "edited", "userResponseType": "drawn"}
        updated_card_string = json.dumps(updated_card_body) # This converts the dictionary to a json in string format
        header = {"Content-Type": "application/json"} # This header results in the user string being interpreted as a JSON

        put_response = put_rest_call(self, f"http://localhost:3002/cards/{self.put_card_id}", 
                      request_parameters=updated_card_string, request_header=header)
        
        # The prompt, response, and userResponse type should be identical
        # We can't assert the request body will equal our post body because the __v field may differ unexpectedly
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
        header = {"Content-Type": "application/json"} # This header results in the user string being interpreted as a JSON

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
        header = {"Content-Type": "application/json"} # This header results in the user string being interpreted as a JSON

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
        header = {"Content-Type": "application/json"} # This header results in the user string being interpreted as a JSON

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
        header = {"Content-Type": "application/json"} # This header results in the user string being interpreted as a JSON

        put_rest_call(self, f"http://localhost:3002/cards/{self.put_card_id}", 
                      request_parameters=updated_card_string, request_header=header, expected_code=400)
        
    def test_put_card_contains_file(self):
        # This method tests attempting to make a PUT request that contains a file on an existing id
        # This is not a valid operation through the cards/:id PUT route and should produce an error

        with open(self.wav_file_path, "rb") as attached_file: # rb lets us read the file in binary format
            file = {"file": attached_file}
            put_rest_call(self, f"http://localhost:3002/cards/{self.put_card_id}", attached_files=file, expected_code=422)

    
    def test_add_file_to_card_doesnt_exist(self):
        # This method tests attempting to add a file to a card with an id that doesn't exist in the db
        # This should give a different response code than an invalidly formatted id

        with open(self.wav_file_path, "rb") as attached_file: # rb lets us read the file in binary format
            file = {"file": ("attachment", attached_file, "audio/wav")}
            body = {"partOfPrompt": "true"} # we need to include this or the request format is invalid

            post_rest_call(self, f"http://localhost:3002/cards/{self.nonexistent_id}/file", 
                             expected_code=404, attached_files=file, request_parameters=body)
            # the assertion that the resource shouldn't be found (404 response) is done inside the get_rest_call method

    def test_add_file_to_card_invalid_id(self):
        # This method tests attempting to add a file to a card with an invalidly formatted id
        # This should give a different response code than a validly formatted id that doesn't exist in the db

        with open(self.wav_file_path, "rb") as attached_file: # rb lets us read the file in binary format
            file = {"file": ("attachment", attached_file, "audio/wav")}
            body = {"partOfPrompt": "true"} # we need to include this or the request format is invalid

            post_rest_call(self, f"http://localhost:3002/cards/{self.invalid_id}/file", 
                             expected_code=400, attached_files=file, request_parameters=body)
            # the assertion that the provided id is invalid (400 response) is done inside the get_rest_call method
    
    def test_add_file_to_card_wav(self): 
        # This method tests attempting to add a .wav file to a card with an id that exists in the db

        with open(self.wav_file_path, "rb") as attached_file: # rb lets us read the file in binary format
            file = {"file": ("attachment", attached_file, "audio/wav")}
            body = {"partOfPrompt": "true"} # we need to include this or the request format is invalid

            post_result = post_rest_call(self, f"http://localhost:3002/cards/{self.file_card_id}/file",
                              attached_files=file, request_parameters=body)
        
            self.assertEqual(self.file_card_id, post_result["_id"],
                             f"Expected id of '{self.file_card_id}' but instead got '{post_result["_id"]}'")

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

            get_result = get_rest_call(self, f"http://localhost:3002/cards/{self.file_card_id}")
            compare_file_to_response(self, self.svg_file_path, get_result["file"]["data"]["data"])

    def test_add_file_to_card_too_large(self):
        # This method tests attempting to add a file with a size > 0.5 mb to a card with an id that exists in the db
        # This is invalid because we constrain the size of files on flashcards to 0.5 mb

        with open(self.too_large_file_path, "rb") as attached_file:
            file = {"file": ("attachment", attached_file, "image/bmp")}
            body = {"partOfPrompt": "true"} # we need to include this or the request format is invalid

            post_rest_call(self, f"http://localhost:3002/cards/{self.file_card_id}/file",
                              attached_files=file, request_parameters=body, expected_code=422)
            # we are attaching a file that is larger than the accepted size (500 kb) so we expect a 422 error

    def test_add_file_to_card_pdf(self):
         # This method tests attempting to add a .pdf file to a card with an id that exists in the db
         # A pdf is just one instance of a file with an invalid mimetype, but it is the most likely to be confused with an image type
         
         with open(self.pdf_file_path, "rb") as attached_file:
            file = {"file": ("attachment", attached_file, "application/pdf")}
            body = {"partOfPrompt": "true"} # we need to include this or the request format is invalid

            post_rest_call(self, f"http://localhost:3002/cards/{self.file_card_id}/file",
                              attached_files=file, request_parameters=body, expected_code=415)
            # we are attaching a type of file that is not supported so we should get a 415 HTTP error

    def test_add_file_to_card_tif(self):
        # This method tests attempting to add a .tif file to a card with an id that exists in the db
        # This is invalid because tif files are not displayable in many browsers, so users shouldn't see that tif files upload successfully
        
        with open(self.tif_file_path, "rb") as attached_file:
            file = {"file": ("attachment", attached_file, "image/tiff")}
            body = {"partOfPrompt": "true"} # we need to include this or the request format is invalid

            post_rest_call(self, f"http://localhost:3002/cards/{self.file_card_id}/file",
                              attached_files=file, request_parameters=body, expected_code=415)
            # we are attaching a type of file that is not supported so we should get a 415 HTTP error

    def test_add_file_to_card_no_part_of_prompt(self):
        # This method attempts adding a file to a card without indicating whether it is part of the card's prompt or not
        # This is invalid because users must indicate if an attached file is part of a prompt or part of a response
        
        with open(self.svg_file_path, "rb") as attached_file:
            file = {"file": ("attachment", attached_file, "image/svg")}

            post_rest_call(self, f"http://localhost:3002/cards/{self.file_card_id}/file",
                              attached_files=file, expected_code=400)

 #TODO: Add test cases for...
        # ALSO: add special error messages if assert statements fail
        # Add comments indicating reason for test case e.g. what users cannot do

def compare_file_to_response(test, file_path, response_file_data, checked_bytes=500):
    """
    This method compares a locally stored file passed through the file_path with binary data contained in a response
    Args:
        test: a method in a TestCase class
        file_path (str): the path to the file being compared
        response_file_data (array): this is an array of binary data returned as part of a GET request to a DB entry that contains a file
        checked_bytes (int): This defines how many bytes are compared. We don't want or need to compare the entire file
    """
    with open(file_path, "rb") as local_file:
        file_base64_contents = binascii.b2a_base64(local_file.read())[:checked_bytes]
        request_binary_string = bytes(response_file_data)
        request_base64_string = base64.b64encode(request_binary_string)[:checked_bytes]
        test.assertEqual(file_base64_contents, request_base64_string, "The file contents of the received file do not match the locally stored copy of this file")

