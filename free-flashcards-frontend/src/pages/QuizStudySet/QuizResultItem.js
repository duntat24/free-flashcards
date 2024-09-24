export default function QuizResultItem({quizzedFlashcard, quizResponse, answers, updateCorrectness}) {

    // this function handles a change to the buttons that allow a user to manually mark their answers
    function handleOverrideChange(event) {
        const isCorrect = event.target.value === "correct";
        updateCorrectness(quizzedFlashcard.id, isCorrect);
    }

    // defining the JSX to display the prompt displayed to the user during the quiz
    let displayedPromptJSX;
    if (quizzedFlashcard.fileJSON === undefined) { // checking if we have no file to display
        displayedPromptJSX = <h4>Prompt: {quizzedFlashcard.prompt}</h4>
    } else if (!quizzedFlashcard.fileJSON.partOfPrompt) { // checking if the file should only displayed as part of the response
        displayedPromptJSX = <h4>Prompt: {quizzedFlashcard.prompt}</h4>
    } else {
        displayedPromptJSX = <>
            <h4>Prompt: {quizzedFlashcard.prompt}</h4>
            {generateFileJSX(quizzedFlashcard.fileJSON.fileType, quizzedFlashcard.fileJSON.data)}
        </>
    }

    // defining the JSX to display the user's response to a flashcard
    let displayedUserResponseJSX;
    if (quizzedFlashcard.userResponseType === "drawn") { // we need to know if our response data contains some sort of file
        displayedUserResponseJSX = <>
            <h4>Your response: </h4>
            <img src={quizResponse.responseData} alt="User Drawn Response"/>
        </>
    } else if (quizzedFlashcard.userResponseType === "recorded") {
        displayedUserResponseJSX = <>
            <h4>Your response: </h4>
            <audio controls="controls" src={quizResponse.responseData}/>
        </>
    } else if (quizzedFlashcard.userResponseType === "text") { // it doesn't contain a file, so we just display text
        displayedUserResponseJSX = <h4>Your response: {quizResponse.responseData}</h4>
    }

    // defining the JSX to be displayed to show the intended response defined on the flashcard
    let displayedCardResponseJSX;
    if (quizzedFlashcard.fileJSON === undefined) { // checking if we have no file to display
        displayedCardResponseJSX = <h4>Intended Response: {quizzedFlashcard.response}</h4>
    } else if (quizzedFlashcard.fileJSON.partOfPrompt) { // checking if the file should only displayed as part of the response
        displayedCardResponseJSX = <h4>Intended Response: {quizzedFlashcard.response}</h4>
    } else {
        displayedCardResponseJSX = <>
            <h4>Intended Response: {quizzedFlashcard.response}</h4>
            {generateFileJSX(quizzedFlashcard.fileJSON.fileType, quizzedFlashcard.fileJSON.data)}
        </>
    }

    // defining the JSX to display the correctness of the user's answer & allow manual grading & overriding of markings
    const matchingAnswer = findMatchingAnswer(quizzedFlashcard.id, answers);
    let displayedResultJSX = <></>;
    let answerText;
    if (matchingAnswer.answerCorrect === "unknown") {
        answerText = "unknown";
    } else { // if the answer's correctness is not unknown then it is a boolean
        answerText = matchingAnswer.answerCorrect ? "true" : "false"; 
    }
    if (matchingAnswer !== undefined) { // this condition shouldn't ever happen but better to not crash the application
        displayedResultJSX = <>
            <h4>Your answer is correct: {answerText}</h4>
            <h5 className="manual-override-text">(to mark drawn/recorded answers or override text answers) Answer is:</h5>
            
            <form>
                <input type="radio" id={"correct-override " + (quizzedFlashcard.id)} name="override-answer" value="correct" onChange={handleOverrideChange}/>
                <label htmlFor={"correct-override " + (quizzedFlashcard.id)}>Correct</label>
                <input type="radio" id={"incorrect-override " + (quizzedFlashcard.id)} name="override-answer" value="incorrect" onChange={handleOverrideChange}/>
                <label htmlFor={"incorrect-override " + (quizzedFlashcard.id)}>Incorrect</label>
            </form>
        </>
    } else {
        console.log("Couldn't find matching answer for flashcard with id of " + quizzedFlashcard.id);
    }

    return <>
        {displayedPromptJSX}
        {displayedCardResponseJSX}
        {displayedUserResponseJSX}
        {displayedResultJSX}
    </>

}

// used to find the answer corresponding to a certain id
function findMatchingAnswer(id, answers) {
    for (let i = 0; i < answers.length; i++) {
        if (answers[i].id === id) {
            return answers[i];
        }
    }
    return undefined;
}

// this function generates the needed JSX for a file using its mimetype and a base64 file string
function generateFileJSX(mimetype, fileString) {
    const mimetypeTokens = mimetype.split("/"); // mimetypes are of the form {type}/{format} e.g. image/png 
    if (mimetypeTokens[0] === "image") {
        return <img src={`data:image/${mimetypeTokens[1]};base64,${fileString}`} alt="upload"/>
    } else if (mimetypeTokens[0] === "audio") {
        return <audio controls="controls" src={`data:audio/${mimetypeTokens[1]};base64,${fileString}`}/>
    }
}