import { useState } from 'react';

export default function NewFlashcard({card, removeCard, updateCard}) {
    const MAX_FILE_SIZE = 500000; // defines maximum file size in bytes

    // this variable contains a file that may be associated with this flashcard
    const [file, setFile] = useState(null);
    // this variable contains whether the associated file is meant to be displayed with the prompt or the response
    // a value of null indicates that nothing has been selected and/or no file has been uploaded
    const [fileIsPrompt, setFileIsPrompt] = useState(null);


    function handleUploadChange(event) { // puts files attached to the component's form into the file state variable
        const changedFile = event.target.files[0];

        const validateFileResult = validateFileInput(changedFile, MAX_FILE_SIZE);
        if (validateFileResult === null) {
            setFile(null);
            setFileIsPrompt(null);
            updateCard(card.prompt, card.response, card.id, {file: null, isPrompt: null});
        } else if (validateFileResult === "") { // validateFileInput returns the appropriate error message if a file input is invalid
            setFile(changedFile);
            updateCard(card.prompt, card.response, card.id, {file: changedFile, isPrompt: card.fileJSON.isPrompt});
        } else {
            alert(validateFileResult);
            event.target.value = null;
            setFile(null);
            setFileIsPrompt(null);
            updateCard(card.prompt, card.response, card.id, {file: null, isPrompt: null});
        }
    }

    function promptFileAssociationChange() {
        setFileIsPrompt(true);
        updateCard(card.prompt, card.response, card.id, {file: card.fileJSON.file, isPrompt: true});
    }

    function responseFileAssociationChange() {
        setFileIsPrompt(false);
        updateCard(card.prompt, card.response, card.id, {file: card.fileJSON.file, isPrompt: false});
    }

    let fileAssociationJSX = <>
        <input type="radio" id="prompt" name="file-association" value="prompt" onChange={promptFileAssociationChange}/>
        <label htmlFor="prompt">Prompt</label>
        <input type="radio" id="response" name="file-association" value="response" onChange={responseFileAssociationChange}/>
        <label htmlFor="response">Response</label>
        <br/>
    </>

    // this JSX is ultimately wrapped by <li> tags in an external method as react doesn't recognize keys properly if we return from inside this component
    // {"prompt" + (card.id + 1)} gives each input field a unique id so htmlFor can associate correctly
    return <> 
        <label htmlFor={"prompt" + (card.id + 1)}>Prompt: </label> <input type="text" name="prompt" id={"prompt" + (card.id + 1)} value={card.prompt} 
            onChange={(e) => updateCard(e.target.value, card.response, card.id, {file: file, isPrompt: fileIsPrompt})}/>
        
        <label htmlFor={"response" + (card.id + 1)}>Response: </label>
        <input type="text" name="response" id={"response" + (card.id + 1)} value={card.response}
            onChange={(e) => updateCard(card.prompt, e.target.value, card.id, {file: file, isPrompt: fileIsPrompt})}/>
        
        <input type="file" onChange={handleUploadChange}/>
        {file === null ? <></> : fileAssociationJSX}
        
        <button className="delete-new-flaschard-button" onClick={() => removeCard(card.id)}>Del</button>
        <p>{fileIsPrompt === null ? "Null" : fileIsPrompt ? "Prompt" : "Response"}</p>
    </>
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