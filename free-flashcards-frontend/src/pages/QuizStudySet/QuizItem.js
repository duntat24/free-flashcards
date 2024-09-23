

export default function QuizItem({quizzedFlashcard, updateQuizResponse}) {
    // we will need a paramter to allow us to move state upwards - the quiz page class needs to know what the responses are

    function handleResponseChange(event) {
        updateQuizResponse(quizzedFlashcard.id, event.target.value);
    }

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

    let responseJSX;
    if (quizzedFlashcard.userResponseType === "text") {
        responseJSX = <>
            <label htmlFor={quizzedFlashcard.id}>Response: </label>
            <input type="text" name="response" id={quizzedFlashcard.id} onChange={handleResponseChange}/>
        </>
    }
    
    return <>
        {promptJSX}
        {responseJSX}
    </>
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