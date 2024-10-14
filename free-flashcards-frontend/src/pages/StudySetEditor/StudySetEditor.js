import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

export default function StudySetEditor({studySet, updateSet}) {
 
    const [modifiedSet, setModifiedSet] = useState([]);
    const [cards, updateCards] = useState(studySet.cards);
    const nextCardIdRef = useRef(1);

    // this hook to fetches the cards in the targeted study set ONLY when the component mounts
    useEffect(() => { 
        const cardsUrl = "http://localhost:3001/cards/"; // just need to append a card's id to make this a get request
        
        if (studySet === null || studySet === undefined) { // if the targeted study set doesn't exist we shouldnt be trying to fetch its cards
            return;
        }
        Promise.all(
            studySet.cardIds.map((cardId) => axios.get(`${cardsUrl}${cardId}`)) 
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
            setModifiedSet({...studySet, cards: addedCards}); // adding the fetched card data to the study set
            console.log(addedCards);
        }).catch((error) => {
            console.log(error);
        })        
    // eslint-disable-next-line
    }, []); // we only want to fetch & update the cards one time so we don't include a dependency array

    // this adds a blank card to the newly created set
    function addCard() { 
        updateCards([...cards, {id: nextCardIdRef.current, prompt: "", response: "", fileJSON: {file: null, isPrompt: null}, userResponseType: "text"}]);
        nextCardIdRef.current += 1;
    }

    // this removes the card with the specified id from the list of cards being added to the new stud yset
    function removeCard(removedId) {
        updateCards(cards.filter(card => card.id !== removedId)); // finding and removing the card with the specified id
    }

    // this updates a flashcard with the provided ID and sets its fields based on the passed parameters
    function updateCard(newPrompt, newResponse, cardId, newFileJSON, newUserResponseType) { // this is used to update cards when the user edits a prompt or response
        updateCards(cards.map(card => 
            card.id === cardId ? {id: cardId, prompt: newPrompt, response: newResponse, 
                                  fileJSON: newFileJSON, userResponseType: newUserResponseType}: card
        ));
    }
    
    return <><h1>Editing</h1>
        <button>Save Changes</button>
        <button>Discard Changes</button>
    </>
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