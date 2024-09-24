import { useRef } from 'react';
import useParams from 'react-router';
import axios from 'axios';

export default function QuizResults({responses, quizzedSet}) {

    const answersRef = useRef(gradeResponses(responses, quizzedSet));

    return <h1>Results?</h1>
}

function gradeResponses(responses, quizzedSet) {
    // the responseArray will contain booleans and the id of the matching question to indicate whether the user's response was correct
    let responseArray = [];
    for (let i = 0; i < responses.length; i++) {
        if (responses[i].userResponseType !== "text") { // if the answer isn't a text answer we can't determine if it's correct
            responseArray.push({id: responses[i].id, answerCorrect: "unknown"});
            continue;
        }
        let userResponse = responses[i].responseData.toLowerCase(); // we don't care about casing, if we should then the user can override
        let intendedResponse = quizzedSet.cards[i].response.toLowerCase();
        responseArray.push({id: responses[i].id, answerCorrect: userResponse === intendedResponse});
    }
    console.log(responseArray);
    return responseArray;
}

async function postQuizResult(fractionCorrect, id) {
    const url = `http://localhost:3001/sets/${id}/quiz`; // this is the URL we will send our POST request to
    const requestBody = {addedQuizScore : fractionCorrect};
    axios.post(url, requestBody);
}