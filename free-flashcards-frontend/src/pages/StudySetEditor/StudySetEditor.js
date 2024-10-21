import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import axios from 'axios';
import EditableFlashcard from './EditableFlashcard';

export default function StudySetEditor({studySets, updateSet, requestStudySets, setRequestStudySets}) {
 
    const [modifiedSet, setModifiedSet] = useState(null); //useState(getModifiedSet(useParams().id, studySets));
    const nextCardIdRef = useRef(1);
    const targetedSetId = useParams().id;

    // this hook to fetches the cards in the targeted study set ONLY when the component mounts
    useEffect(() => { 
        const cardsUrl = "http://localhost:3001/cards/"; // just need to append a card's id to make this a get request

        const newModifiedSet = getModifiedSet(targetedSetId, studySets);
        if (newModifiedSet === null || newModifiedSet === undefined) { // if the targeted study set doesn't exist we shouldnt be trying to fetch its cards
            return;
        }
        Promise.all(
            newModifiedSet.cardIds.map((cardId) => axios.get(`${cardsUrl}${cardId}`)) 
        ).then((data) => { // letting all the promises resolve before continuing
            let addedCards = data.map((card) => { // creating an array containing all the fetched card data from the API
                if (card.data.file !== undefined) { // if the card contains a file
                    let cardFile = card.data.file;
                    return {prompt: card.data.prompt, response: card.data.response, id: card.data._id, 
                            userResponseType: card.data.userResponseType, modificationStatus: "unchanged", fileStatus: "unchanged",
                            fileJSON: {data: arrayBufferToBase64(cardFile.data.data), 
                                       fileType: cardFile.fileType, partOfPrompt: cardFile.partOfPrompt}};
                } 
                return {prompt: card.data.prompt, response: card.data.response, id: card.data._id, 
                        userResponseType: card.data.userResponseType, modificationStatus: "unchanged", fileStatus: "unchanged"}
            });
            setModifiedSet({...newModifiedSet, cards: addedCards}); // adding the fetched card data to the study set
        }).catch((error) => {
            console.log(error);
        })        
    // eslint-disable-next-line
    }, []); // we only want to fetch & update the cards one time so we don't include a dependency array

    // this adds a blank card to the set we're modifying
    function addCard() { 
        updateCards([...modifiedSet.cards, {id: nextCardIdRef.current, prompt: "", response: "", 
                    fileJSON: null, userResponseType: "text", modificationStatus: "new", fileStatus: "unchanged"}]);
        nextCardIdRef.current += 1;
    }

    // this results in the specified card not being displayed and being deleted from the study set when a user saves their changes
    function removeCard(removedId) {
        // finding the card with the removed id
        const removedCard = modifiedSet.cards.filter(card => card.id === removedId)[0]; // we access the 0th index because .filter returns an array, in this case the array is always of length 1
        updateCard(removedCard.prompt, removedCard.response, removedCard.id, removedCard.fileJSON, 
                   removedCard.userResponseType, "deleted", "deleted"); // setting the card's modification status to deleted
    }

    // this updates a flashcard with the provided ID and sets its fields based on the passed parameters
    function updateCard(newPrompt, newResponse, cardId, newFileJSON, newUserResponseType, newModificationStatus, newFileStatus) { // this is used to update cards when the user edits a prompt or response
        updateCards(modifiedSet.cards.map(card => {
            if (card.id === cardId) {
                if (card.modificationStatus === "new") {
                    newModificationStatus = "new";
                }
                return {id: cardId, prompt: newPrompt, response: newResponse, fileJSON: newFileJSON, 
                    userResponseType: newUserResponseType, modificationStatus: newModificationStatus, fileStatus: newFileStatus}
            }
            return card;
        }));
    }

    function updateCards(newCardArray) {
        setModifiedSet({...modifiedSet, cards: newCardArray});
    }

    function updateSetTitle(newTitle) {
        setModifiedSet({...modifiedSet, title: newTitle});
    }

    // this function makes PUT requests to the API to save our modified study set
    function makeUpdateRequest() {

        // first need to validate that all the cards have a valid state - non-empty prompt and response, indicate whether file is for a prompt or response
        if (!validateCards(modifiedSet.cards) || modifiedSet.title === "") {
            alert("Please ensure all entered data is valid"); // there should be more graceful error handling than this
            return;

            // 1. Using alert may be intrusive, can test both with and without
            // 2. Clearly indicate which fields are invalid & why
            // (should do this later, for now just get base functionality up)

        }
        const setPutURL = "http://localhost:3001/sets";
        const cardsPutURL = "http://localhost:3001/cards";
        const newSetData = {title: modifiedSet.title};
        
        console.log(setPutURL);
        console.log(cardsPutURL);
        console.log(newSetData);

        console.log(modifiedSet);
        // TODO: Refactor this request, this is difficult to understand and hard to do proper error handling with

        /*
        axios.post(setPostURL, newSetData).then((response) => {
            const newSetId = response.data._id; // we need the id of the newly created set so we can POST our flashcards to it
            
            // executing this logic after the response is received ensures we've received the set ID to post to
            const cardPostURL = "http://localhost:3001/sets/" + newSetId;
            const addFileRootUrl = "http://localhost:3001/cards" // need to add the targeted card id and the ending "/file"
            for (let i = 0; i < modifiedSet.cards.length; i++) {
                let card = modifiedSet.cards[i];
                axios.post(cardPostURL, {prompt: card.prompt, response: card.response, 
                        userResponseType: card.userResponseType}).then((response) => {
                            // we can't guarantee how many cards will be in the array because of race conditions, but we can guarantee that the card id will be at the end of the array
                            let responseCards = response.data.cards;
                            const addedCardId = responseCards[responseCards.length - 1]; 
                            
                            // if the added card also contains a file we need to add it as well
                            if (card.fileJSON.file !== null) {
                                const formData = new FormData();
                                formData.append("file", card.fileJSON.file); 
                                formData.append("partOfPrompt", card.fileJSON.isPrompt);
                                const requestConfiguration = {
                                    headers: {
                                      'content-type': 'multipart/form-data', // important to tell the server what is in the request
                                    },
                                };
                                axios.post(`${addFileRootUrl}/${addedCardId}/file` , formData, requestConfiguration).then((response) => {    
                                    console.log(response);
                                    // we should do something to indicate the request was sucessful
                                }).catch((error) => {
                                    console.log(error);
                                    // if the request fails we should indicate it somehow
                                });
                            }
                        }).catch((error) => {
                            console.log(error);
                            return; // we need more graceful handling than this, we don't want to partially post a set to the API
                        });
            }
        }).catch((error) => {
            console.log(error);
            return; // we should immediately break out of our attempt to create a set if our request fails
        });

        setRequestStudySets(!requestStudySets); // attempting to save refreshes the application's stored study sets
        /*
            The above statement does not always successfully refresh the application's display - sometimes the set does not appear, sometimes it appears with 0 flashcards
            TODO: Likely a race condition, research effective solution
        */
        //window.location.href = "http://localhost:3000"; // redirecting to the home page
    }
    
    let cardList = <></>;
    if (modifiedSet !== null) {
        // this contains the JSX for the interface to allow users to modify the flashcards that will be modified in the set
        cardList = modifiedSet.cards.filter(card => card.modificationStatus !== "deleted").map(card => {
            return <li key={card.id} className="new-flashcard"> 
                        <EditableFlashcard
                            card={card}
                            removeCard={removeCard}
                            updateCard={updateCard}
                        />
                    </li>
        });
    } 
    
    if (modifiedSet === null) {
        return <><h3>Loading...</h3></>
    }
    return <div className="edited-flashcard-set">
        <label htmlFor="set-title">Set Title:</label>
        <button className="add-flashcard-button" onClick={addCard}>Add Card</button><br/>
        <input type="text" name="set-title" id="set-title" value={modifiedSet ? modifiedSet.title : "No title :("} 
            onChange={(e) => updateSetTitle(e.target.value)}></input>
        <ul className="new-card-list">
            {cardList}
        </ul>
        <button className="edit-termination-button" onClick={makeUpdateRequest}>Save Changes</button>
        <button className="edit-termination-button" onClick={() => window.location.href="http://localhost:3000"}>
            Discard Changes</button>
    </div>
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

// this function gets the set we're modifying based on the passed id and study sets
function getModifiedSet(id, studySets) { 
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

// this method validates the provided array of cards so they can be stored on the server
function validateCards(cards) {
    if (cards.length === 0) { // sets should initially contain at least 1 card, fewer than that doesn't make sense
        return false;
    }
    for (let i = 0; i < cards.length; i++) {
        const currentCard = cards[i];
        // NOTE: not clear if the prompt and/or response should be allowed to be empty if there is a file displayed as part of the prompt or response
        if (currentCard.prompt === "" || currentCard.response === "") { // prompt and response can't be empty
            return false;
        }
        if (currentCard.fileJSON !== null) {
            if (currentCard.fileJSON.file !== null && currentCard.fileJSON.isPrompt === null) { // user must indicate where a file should be displayed as part of a card 
                return false;
            }
        }
    }
    return true; // all cards are valid if we get here
}