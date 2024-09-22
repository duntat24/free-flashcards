import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import axios from 'axios';

export default function QuizStudySet({studySets}) {

    const [quizzedStudySet, setQuizzedStudySet] = useState(getStudiedSet(useParams().id, studySets));
    
    useEffect(() => { // we need to fetch the cards in the targeted study set
        const cardsUrl = "http://localhost:3001/cards/"; // just need to append a card's id to make this a get request
        
        if (quizzedStudySet === null || quizzedStudySet === undefined) { // if the targeted study set doesn't exist we shouldnt be trying to fetch its cards
            return;
        }
        Promise.all(
            quizzedStudySet.cardIds.map((cardId) => axios.get(`${cardsUrl}${cardId}`)) 
        ).then((data) => { // letting all the promises resolve before continuing
            let addedCards = data.map((card) => { // creating an array containing all the fetched card data from the API
                if (card.data.file !== undefined) { // if the card contains a file
                    let cardFile = card.data.file;
                    return {prompt: card.data.prompt, response: card.data.response, userResponseType: card.data.userResponseType,
                            fileJSON: {data: arrayBufferToBase64(cardFile.data.data), 
                                       fileType: cardFile.fileType, partOfPrompt: cardFile.partOfPrompt}};
                } 
                return {prompt: card.data.prompt, response: card.data.response, userResponseType: card.data.userResponseType}
            });
            setQuizzedStudySet({...quizzedStudySet, cards: addedCards}); // adding the fetched card data to the study set
            console.log(addedCards);
        }).catch((error) => {
            console.log(error);
        })        
    // eslint-disable-next-line
    }, []); // we only want to fetch & update the cards one time so we don't include a dependency array

    let quizContent;
    console.log(quizzedStudySet);
    if (quizzedStudySet === null) {

    }
    return <>
        <h1>Quiz Page</h1>
    </>

}

// this function gets the set we're studying based on the provided id and study sets
function getStudiedSet(id, studySets) { 
    if (studySets === null) {
        return null;
    }
    for (let i = 0; i < studySets.length; i++) { // looping through to find the targeted id
        if (studySets[i].id === id) {
            return studySets[i];
        }
    }
    return null; // we can't find a matching id
}

// This method takes a file buffer from a request and converts it to a Base64 string to be displayed by our application
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) { // by constructing our array iteratively we avoid errors from the call stack being too large
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}