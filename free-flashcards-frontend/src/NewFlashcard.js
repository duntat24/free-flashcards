export default function NewFlashcard({card, removeCard, updateCard}) {
    return <div className="new-flashcard">
        <label htmlFor="prompt">Prompt:</label><br/>
        <input type="text" name="prompt" value={card.prompt} 
            onChange={(e) => updateCard(e.target.value, card.response, card.id)}/><br/>
        <label htmlFor="response">Response:</label><br/>
        <input type="text" name="response" value={card.response}
            onChange={(e) => updateCard(card.prompt, e.target.value, card.id)}/><br/>
        <button className="delete-new-flaschard-button" onClick={() => removeCard(card.id)}>Del</button>
    </div>
}