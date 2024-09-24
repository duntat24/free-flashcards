import RecordResponse from './RecordResponse';
import DrawnResponseArea from './DrawnResponseArea';

export default function QuizItem({quizzedFlashcard, updateQuizResponse}) {

    // this function updates the user's response to the question contained by this component 
    function handleResponseChange(event) {
        updateQuizResponse(quizzedFlashcard.id, event.target.value);
    }
    // this function updates the data stored when a user needs to draw or record a response to a quiz prompt
    function handleFileResponse(data) {
        updateQuizResponse(quizzedFlashcard.id, data);
    }

    // this contains the JSX to display the prompt for the question
    let promptJSX;
    if (quizzedFlashcard.fileJSON === null || quizzedFlashcard.fileJSON === undefined ) { 
        promptJSX = <h3 className="quiz-question">{quizzedFlashcard.prompt}</h3>
    } else if (!quizzedFlashcard.fileJSON.partOfPrompt) { // there is a file as part of the card, but it should not be displayed with the prompt
        promptJSX = <h3 className="quiz-question">{quizzedFlashcard.prompt}</h3>
    } else {
        promptJSX = <>
            <h3 className="quiz-question">{quizzedFlashcard.prompt}</h3>
            {generateFileJSX(quizzedFlashcard.fileJSON.fileType, quizzedFlashcard.fileJSON.data,)}<br/>
        </>
    }

    // this contains the JSX to allow a user to respond to a question 
    let responseJSX;
    if (quizzedFlashcard.userResponseType === "text") {
        responseJSX = <>
            <label htmlFor={quizzedFlashcard.id}>Response: </label>
            <input type="text" name="response" id={quizzedFlashcard.id} onChange={handleResponseChange}/>
        </>
    } else if (quizzedFlashcard.userResponseType === "recorded") {
        responseJSX = <RecordResponse setAudioData={handleFileResponse}/>
    } else if (quizzedFlashcard.userResponseType === "drawn") {
        responseJSX = <DrawnResponseArea setDrawnResponse={handleFileResponse}/>
    }
    
    return <div className="quiz-question-container" key={quizzedFlashcard.id}>
        {promptJSX}
        {responseJSX}
    </div>
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