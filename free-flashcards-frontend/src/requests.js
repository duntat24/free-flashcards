import axios from 'axios';

const setRootURL = "http://localhost:3001/sets";
const cardRootURL = "http://localhost:3001/sets";

// this method makes a request to update the title of the set matching the specified ID
// NOTE: setRootUrl should not have a trailing '/'
export async function requestUpdateSetTitle(newTitle, setRootUrl, setId) {
    const newSetData = {title: newTitle};
    return axios.put(setRootUrl + "/" + setId, newSetData).catch((error) => {
        console.log(error); // TODO need more in-depth handling of errors here
    });
}

/**
 * This method makes a request to create a new study set with a specified title and returns a promise that resolves
 * when a response is received from the server
 * 
 * @param {String} setTitle the title of the set being created
 * @returns a promise that resolves when a response is received indicating whether the set has been successfully created or not
 */
export async function requestCreateSet(setTitle) {
    return axios.post(setRootURL, {title: setTitle}).catch((error) => {
        console.log(error); // TODO: need better error handling here
    })
}

// this method updates the specified flashcard and its file
// NOTE: cardRootURL should not have a trailing '/'
export async function requestUpdateFlashcard(cardRootURL, card) {
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

/**
 * This method makes a request to create a new study flashcard with specified information and returns a promise that is fulfilled
 * when a response is received from the server. 
 * 
 * @param {String} addedSetId A string containing the ID of the set the card is being added to
 * @param {JSON} card A JSON representation of a flashcard including a prompt, response, user response type, 
 *                    and a fileJSON containing data about the file associated with the flashcard (if applicable)
 * @returns a promise that is fulfilled when a response is received indicating whether the card has been successfully created or not
 */
export async function requestAddNewFlashcard(addedSetId, card) {
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

/**
 * This function makes a request to the server to delete the set with the specified ID. It returns a promise 
 * that is fulfilled upon receiving a response
 * 
 * @param {String} setId the ID of the set being deleted 
 * @returns A promise that is fulfilled upon receiving the server's response
 */
export async function requestDeleteSet(setId) {
    return axios.delete(`${setRootURL}/${setId}`).catch((error) => {
        console.log(error);
        // TODO need proper error handling here
    })
}

// this method makes a request to delete the specified flashcard within the specified set
// NOTE: setRootURL should not have a trailing '/'
export async function requestDeleteFlashcard(setRootURL, targetSetId, card) {
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
export async function requestRemoveFlashcardFile(cardRootURL, cardId) {
    return axios.delete(`${cardRootURL}/${cardId}/file`).catch((error) => {
        console.log(error); // TODO: need proper error handling here
    });
}