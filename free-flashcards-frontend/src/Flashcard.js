

export default function Flashcard() {
    return <div class="flashcard">
        <label htmlFor="prompt">Prompt:</label><br/>
        <input type="text" name="prompt"/><br/>
        <label htmlFor="response">Response:</label><br/>
        <input type="text" name="response"/><br/>
    </div>
}