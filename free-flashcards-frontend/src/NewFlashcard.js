export default function NewFlashcard({prompt, response}) {
    return <div class="new-flashcard">
        <label htmlFor="prompt">Prompt:</label><br/>
        <input type="text" name="prompt" value={prompt}/><br/>
        <label htmlFor="response">Response:</label><br/>
        <input type="text" name="response" value={response}/><br/>
    </div>
}