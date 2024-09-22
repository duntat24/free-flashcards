import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function StudyFlashcards({studySets}) {
    /*

        TODO: Will need to use the id route parameter that is provided to identify the correct study set from the list of sets

    */

    // this component will contain functionality to study user sets.

    // need to add functionality to draw responses and record audio responses
    
    // this holds the current card being studied
    const [currentCardIndex, setCurrentCardIndex] = useState(0); // a study set with no cards should never be saved, so this shouldn't cause an error
    // this boolean indicates whether the user is being prompted or seeing the card's answer
    const [onPromptSide, setOnPromptSide] = useState(true);
    // this holds the study set - we need to be able to fetch the cards from the ids contained on the homepage, so we need to be able to update the set we are passed down
    const [studiedSet, setStudiedSet] = useState(getStudiedSet(useParams().id, studySets));
    

    useEffect(() => { // we need to fetch the cards in the targeted study set
        //console.log(studiedSet);
        const cardsUrl = "http://localhost:3001/cards/"; // just need to append a card's id to make this a get request
        
        if (studiedSet === null || studiedSet === undefined) { // if the targeted study set doesn't exist we shouldnt be trying to fetch its cards
            return;
        }
        Promise.all(
            studiedSet.cardIds.map((cardId) => axios.get(`${cardsUrl}${cardId}`)) 
        ).then((data) => { // letting all the promises resolve before continuing
            let addedCards = data.map((card) => {
                if (card.data.file !== undefined) { // if the card contains a file
                    let cardFile = card.data.file;
                    return {prompt: card.data.prompt, response: card.data.response, userResponseType: card.data.userResponseType,
                            fileJSON: {data: arrayBufferToBase64(cardFile.data.data), 
                                       fileType: cardFile.fileType, partOfPrompt: cardFile.partOfPrompt}};
                } 
                return {prompt: card.data.prompt, response: card.data.response, userResponseType: card.data.userResponseType}
            });
            setStudiedSet({...studiedSet, cards: addedCards});
            console.log(addedCards);
        }).catch((error) => {
            console.log(error);
        })
        // console.log(newCards); // this doesn't have the returned value because the promise isn't resolved yet
        
    // eslint-disable-next-line
    }, []); // we only want to fetch & update the cards one time so we don't include a dependency array
    
    function decreaseCardIndex() {
        if (currentCardIndex === 0) { // avoiding making the index negative
            setCurrentCardIndex(studiedSet.cards.length - 1); // going to the end of the set
        } else {
            setCurrentCardIndex(currentCardIndex - 1);
        }
        setOnPromptSide(true); // we should always start on the prompt side when we change cards
    }
    function increaseCardIndex() {
        setCurrentCardIndex((currentCardIndex + 1) % studiedSet.cards.length); // wrapping back to 0
        setOnPromptSide(true); // we should always start on the prompt side when we change cards
    }
    // this function handles producing the JSX for a flashcard and handles if the card contains a file or not
    function getCardJSX() {
        const currentCard = studiedSet.cards[currentCardIndex];
        const standardJSX = <h2 className="flashcard-text">{onPromptSide ? currentCard.prompt : currentCard.response}</h2>
        if (currentCard.fileJSON === undefined) { // if the card doesn't have a file our job is easy
            return standardJSX;
        }
        if (currentCard.fileJSON.partOfPrompt !== onPromptSide) { // if the file isn't on our displayed side we just return the standard jsx
            return standardJSX;
        }
        const fileJSX = generateFileJSX(currentCard.fileJSON.fileType, currentCard.fileJSON.data);
        return <>
            {standardJSX}
            {fileJSX}
            <br/>
        </>
    }
    
    //console.log(studiedSet);
    let pageContent; // we will use this to stop the application from crashing if the targeted study set doesn't exist
    if (studiedSet === null || studiedSet === undefined) {
        pageContent = <h1>This study set doesn't seem to exist...</h1>
    } else if (studiedSet.cards === undefined) {
        pageContent = <>
            <h1 className="set-title">Studying: {studiedSet.title}</h1>
            <div className="current-flashcard">
                <button onClick={() => setOnPromptSide(!onPromptSide)} className="flip-flashcard">Flip</button>
            </div>
        </>
    } else {
        pageContent = <>    
            <h1 className="set-title">Studying: {studiedSet.title}</h1>
            <div className="current-flashcard">
                {getCardJSX()}
                <button onClick={() => setOnPromptSide(!onPromptSide)} className="flip-flashcard">Flip</button>
            </div>
        
            <button onClick={decreaseCardIndex} className="flashcard-navigation">Back</button>
            <button onClick={increaseCardIndex} className="flashcard-navigation">Next</button>
            <br/>
        </>
    }
    return <div className="study-page">
        {pageContent}
        <Link to="/" className="home-link">Back</Link>
    </div>
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

// this function generates the JSX to display a file 
function generateFileJSX(mimetype, fileString) {
    const mimetypeTokens = mimetype.split("/"); // mimetypes are of the form {type}/{format} e.g. image/png 
    if (mimetypeTokens[0] === "image") {
        return <img src={`data:image/${mimetypeTokens[1]};base64,${fileString}`} alt="upload"/>
    } else if (mimetypeTokens[0] === "audio") {
        return <audio controls="controls" src={`data:audio/${mimetypeTokens[1]};base64,${fileString}`}/>
    }
}