export default function NewFlashcard({card, removeCard}) {
    return <div class="new-flashcard">
        <label htmlFor="prompt">Prompt:</label><br/>
        <input type="text" name="prompt" value={card.prompt}/><br/>
        <label htmlFor="response">Response:</label><br/>
        <input type="text" name="response" value={card.response}/><br/>
        <button class="delete-new-flaschard-button" onClick={() => removeCard(card.id)}>Del</button>
    </div>
}