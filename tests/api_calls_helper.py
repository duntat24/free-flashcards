import requests

"""
This file provides methods to make HTTP calls to the application API when we execute our backend tests
Each method requires an expected status code when making the request, which defaults to 200 OK
"""

# For API calls using GET, request parameters and header are default to 'empty'
def get_rest_call(test, url, request_parameters = {}, request_header = {}, expected_code = 200):
    response = requests.get(url, request_parameters, headers = request_header)

    # this assertEqual relies on the calling test method passing itself to this method
    test.assertEqual(expected_code, response.status_code,
                     f"Response code to {url} GET was {response.status_code} instead of {expected_code}")
    return response.json()

# For API calls using POST, request parameters and header are default to 'empty'
def post_rest_call(test, url, request_parameters = {}, request_header = {}, expected_code = 200):
    response = requests.post(url, request_parameters, headers = request_header)

     # this assertEqual relies on the calling test method passing itself to this method
    test.assertEqual(expected_code, response.status_code,
                     f"Response code to {url} POST was {response.status_code} instead of {expected_code}")
    return response.json()

# For API calls using PUT, request parameters and header default to 'empty'
def put_rest_call(test, url, request_parameters = {}, request_header = {}, expected_code = 200):
    response = requests.put(url, request_parameters, headers = request_header)

     # this assertEqual relies on the calling test method passing itself to this method
    test.assertEqual(expected_code, response.status_code,
                     f"Response code to {url} PUT was {response.status_code} instead of {expected_code}")
    return response.json()

# For API calls using DELETE, request header defaults to 'empty'
def delete_rest_call(test, url, request_header = {}, expected_code = 200):
    response = requests.delete(url, headers = request_header)

     # this assertEqual relies on the calling test method passing itself to this method
    test.assertEqual(expected_code, response.status_code,
                     f"Response code to {url} DELETE was {response.status_code} instead of {expected_code}")
    return response.json()
