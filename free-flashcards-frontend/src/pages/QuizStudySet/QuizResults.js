import { useRef } from 'react';
import useParams from 'react-router';
import axios from 'axios';
import QuizResultItem from './QuizResultItem';

export default function QuizResults({responses, quizzedSet}) {

    // this contains the users answers and their updates to whether their answers are correct or not
    const answersRef = useRef(gradeResponses(responses, quizzedSet));

    

    
    // this function is used to update the correctness of a response - allows users to mark the correctness of drawn & recorded submissions and allows overriding of submission results
    function updateCorrectness(id, isCorrect) {
        answersRef.current = answersRef.current.map((answer) => {
            return id === answer.id? {...answer, answerCorrect: isCorrect} : answer
        });
    }

    // this method verifies that the results all have a correctness value and then sends the results of the quiz to the API
    function submitResults() {
        //console.log(useParams().id);
    }

    let displayedResponses = [];
    for (let i = 0; i < responses.length; i++) {
        const matchingCard = quizzedSet.cards[i];
        displayedResponses.push({questionNumber: (i + 1), 
                                questionContent: <QuizResultItem quizzedFlashcard={matchingCard} quizResponse={responses[i]} updateCorrectness={updateCorrectness} answers={answersRef.current}/>});
    }

    return <>
        <h1>Quiz Results</h1>
        {displayedResponses.map((response) => {
            return <>
                <h1 className="quiz-question-number" key={response.questionNumber}>{response.questionNumber}</h1>
                {response.questionContent}
            </>
        })}
        <br/>
        <button className="submit-quiz-result-button" onClick={submitResults}>Submit Results</button>
    </>
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
    return responseArray;
}

async function postQuizResult(fractionCorrect, id) {
    const url = `http://localhost:3001/sets/${id}/quiz`; // this is the URL we will send our POST request to
    const requestBody = {addedQuizScore : fractionCorrect};
    axios.post(url, requestBody);
}