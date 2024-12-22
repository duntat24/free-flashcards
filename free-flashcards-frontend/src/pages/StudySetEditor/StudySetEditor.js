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
                if (card.modificationStatus === "new") { // important to ensure the card is still marked as new when it's sent as a request
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
        const setURL = "http://localhost:3001/sets";
        const cardURL = "http://localhost:3001/cards";
        requestUpdateSetTitle(modifiedSet.title, setURL, modifiedSet.id);
        Promise.all(
            modifiedSet.cards.map((card) => {
                if (card.modificationStatus === "unchanged") { return Promise.resolve(" ") } // we don't want to make a request for an unmodified card
                else if (card.modificationStatus === "new") {
                    return requestAddNewFlashcard(setURL, modifiedSet.id, card);
                } else if (card.modificationStatus === "deleted") {
                    return requestDeleteFlashcard(setURL, modifiedSet.id, card);
                } else { // if we get here then the card is an existing card that has been edited
                    return requestUpdateFlashcard(cardURL, card);
                }
            })
        ).then(() => {
            alert("Set updated successfully!");
        }).catch((error) => {
            alert("An error occurred. Check the console");
            console.log(error);
        })

        setRequestStudySets(!requestStudySets); // attempting to save refreshes the application's stored study sets
        /*
            The above statement does not always successfully refresh the application's display - sometimes the set does not appear, sometimes it appears with 0 flashcards
            TODO: Likely a race condition, research effective solution
        */
        // window.location.href = "http://localhost:3000"; // redirecting to the home page only on success
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
        <label htmlFor="set-title">Set Title:   </label>
        <input type="text" name="set-title" id="set-title" value={modifiedSet ? modifiedSet.title : "No title :("} 
            onChange={(e) => updateSetTitle(e.target.value)}></input> <br/>
        <button className="add-flashcard-button" onClick={addCard}>Add Card</button><br/>
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
        if (currentCard.fileJSON !== null && currentCard.fileJSON !== undefined) {
            if (currentCard.fileJSON.file !== null && currentCard.fileJSON.isPrompt === null) { // user must indicate where a file should be displayed as part of a card 
                return false;
            }
        }
    }
    return true; // all cards are valid if we get here
}

// this method makes a request to update the title of the set matching the specified ID
// NOTE: setRootUrl should not have a trailing '/'
async function requestUpdateSetTitle(newTitle, setRootUrl, setId) {
    const newSetData = {title: newTitle};
    return axios.put(setRootUrl + "/" + setId, newSetData).catch((error) => {
        console.log(error); // TODO need more in-depth handling of errors here
    });
}

// this method updates the specified flashcard and its file
// NOTE: cardRootURL should not have a trailing '/'
async function requestUpdateFlashcard(cardRootURL, card) {
    return axios.put(cardRootURL + "/" + card.id, {prompt: card.prompt, response: card.response, 
        userResponseType: card.userResponseType}).then(() => {
            if (card.fileJSON.fileStatus === "deleted") {
                requestRemoveFlashcardFile(cardRootURL, card.id)
            } else if (card.fileJSON.fileStatus === "added" || card.fileJSON.fileStatus === "edited") {
                requestAddFlashcardFile(card.id, card.fileJSON);
            }  
        }).catch((error) => {
            console.log(error); // TODO: need better error handling here
        });
}

// this method makes a request to add a new flashcard to a set with the root of the URL, the ID of the set, and the card's data
// NOTE: setRootUrl should not have a trailing '/'
async function requestAddNewFlashcard(setRootURL, addedSetId, card) {
    return axios.post(setRootURL + "/" + addedSetId, {prompt: card.prompt, response: card.response, 
        userResponseType: card.userResponseType}).then((response) => {
            if (card.fileJSON !== null) { // this means there is a file in the newly created card that we have to create
                let responseCards = response.data.cards;
                const addedCardId = responseCards[responseCards.length - 1]; // we can't guarantee how many cards will be in the array, but we can guarantee that our newly added card will be at the end
                requestAddFlashcardFile(addedCardId, card.fileJSON);
            }
    }).catch((error) => {
        console.log(error);
        // TODO need proper error handling here
    });
}

// this method makes a request to delete the specified flashcard within the specified set
// NOTE: setRootURL should not have a trailing '/'
async function requestDeleteFlashcard(setRootURL, targetSetId, card) {
    return axios.delete(`${setRootURL}/${targetSetId}/${card.id}`).catch((error) => {
        console.log(error);
        // TODO need proper error handling here
    })
}

// this function returns a promise that contains a request to add a file to the specified flashcard
// NOTE: This functionality is needed in many places, extract to a module & export?
async function requestAddFlashcardFile(cardId, addedFileJSON) {
    const formData = new FormData();
    formData.append("file", addedFileJSON.file); 
    formData.append("partOfPrompt", addedFileJSON.isPrompt);
    const requestConfiguration = {
        headers: {
            'content-type': 'multipart/form-data', // important to tell the server what is in the request
        },
    };
    const fileRootURL = "http://localhost:3001/cards"
    return axios.post(`${fileRootURL}/${cardId}/file` , formData, requestConfiguration).catch((error) => {
        console.log(error);
        // TODO need better error handling
    });
}

// this function removes any attached file from the specified card
async function requestRemoveFlashcardFile(cardRootURL, cardId) {
    return axios.delete(`${cardRootURL}/${cardId}/file`).catch((error) => {
        console.log(error); // TODO: need proper error handling here
    });
}