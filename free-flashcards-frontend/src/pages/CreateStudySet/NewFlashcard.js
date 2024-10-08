import { useState } from 'react';

export default function NewFlashcard({card, removeCard, updateCard}) {
    const MAX_FILE_SIZE = 500000; // defines maximum file size in bytes

    // this contains a file that may be associated with this flashcard
    const [file, setFile] = useState(null);

    // this function handles a change to the uploaded file when the user either adds a new file or removes their attached file
    function handleUploadChange(event) { 
        const changedFile = event.target.files[0];

        const validateFileResult = validateFileInput(changedFile, MAX_FILE_SIZE);
        if (validateFileResult === null) { // this means there is no file attached to the card
            setFile(null);
            updateCard(card.prompt, card.response, card.id, {file: null, isPrompt: null}, card.userResponseType);
        } else if (validateFileResult === "") { // validateFileInput returns the appropriate error message if a file input is invalid
            setFile(changedFile);
            updateCard(card.prompt, card.response, card.id, {file: changedFile, isPrompt: card.fileJSON.isPrompt}, card.userResponseType);
        } else { // this means the validateFileResult method returned some sort of error message and we should respond appropriately
            alert(validateFileResult);
            event.target.value = null;
            setFile(null);
            updateCard(card.prompt, card.response, card.id, {file: null, isPrompt: null}, card.userResponseType);
        }
    }
    // this function handles a change with the radio button that defines whether an attached file should be displayed as part of a prompt or response
    function handleFileAssociationChange(event) {
        const isPrompt = event.target.value === "prompt"; // indicates whether the file will be associated with a prompt or a response
        updateCard(card.prompt, card.response, card.id, {file: card.fileJSON.file, isPrompt: isPrompt}, card.userResponseType);
    }
    // this function handles a change with the dropdown that determines what type of response the user should give for the flashcard
    function handleResponseTypeChange(event) {
        updateCard(card.prompt, card.response, card.id, card.fileJSON, event.target.value);
    }
    // this function handles a change to the value of the 'prompt' field
    function handlePromptChange(event) {
        updateCard(event.target.value, card.response, card.id, card.fileJSON, card.userResponseType);
    } 
    // this function handles a change to the value of the 'response' field
    function handleResponseChange(event) {
        updateCard(card.prompt, event.target.value, card.id, card.fileJSON, card.userResponseType);
    } 

    // this JSX defines a radio button that allows a user to indicate whether an attached field should be displayed with the card's prompt or response
    let fileAssociationJSX = <>
        <input type="radio" id={"file-for-prompt" + (card.id)} name="file-association" value="prompt" 
            onChange={handleFileAssociationChange}/>
        <label htmlFor={"file-for-prompt" + (card.id)}>Prompt</label>
        <input type="radio" id={"file-for-response" + (card.id)} name="file-association" value="response" 
            onChange={handleFileAssociationChange}/>
        <label htmlFor={"file-for-prompt" + (card.id)}>Response</label>
        <br/>
    </>

    // this JSX is ultimately wrapped by <li> tags in an external method as react doesn't recognize keys properly if we return from inside this component
    return <form> 
        <label htmlFor={"prompt" + (card.id + 1)}>Prompt: </label> <input type="text" name="prompt" id={"prompt" + (card.id + 1)} value={card.prompt} 
            onChange={handlePromptChange}/>
        
        <label htmlFor={"response" + (card.id + 1)}>Response: </label>
        <input type="text" name="response" id={"response" + (card.id + 1)} value={card.response}
            onChange={handleResponseChange}/>
        
        <label htmlFor={"response-type" + (card.id + 1)}>Response type: </label>
        <select name="response-type" id={"response-type" + (card.id + 1)} onChange={handleResponseTypeChange}>
            <option value="text">Text</option>
            <option value="drawn">Drawn Image</option>
            <option value="recorded">Record Audio</option>
        </select>
        
        <input type="file" onChange={handleUploadChange}/>
        {file === null ? <></> : fileAssociationJSX}
        
        <button className="delete-new-flaschard-button" onClick={() => removeCard(card.id)}>Del</button>
    </form>
}

// this function verifies that uploaded files are within size and type constraints
// if the file does not fit within those constraints, it returns an error message to be displayed
// if it does, it returns a blank string
function validateFileInput(file, MAX_FILE_SIZE) {
    if (file === null || file === undefined) {
        return null;
    }
    if (file.size > MAX_FILE_SIZE) {
        return "Attached file is too large. Files must be less than 0.5 MB";
    }
    const fileMimetypeArray = file.type.split("/"); // separates keywords in the file's description, e.g. [image, jpeg]
    if (fileMimetypeArray[0] !== "image" && fileMimetypeArray[0] !== "audio") {
        return "Attached files must be image or audio files and cannot be PDFs";
    }
    if (fileMimetypeArray[1] === "tiff" || fileMimetypeArray[1] === "tiff-fx") { // TIFF files do not work in most browsers
        return "Attached files cannot be in the following formats: TIFF";
    }
    return "";
}