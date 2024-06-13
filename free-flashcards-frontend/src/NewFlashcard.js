export default function NewFlashcard({card, removeCard, updateCard}) {
    // these are all list items, but wrapping them in <li> tags here leads to an error 
    // where react thinks they don't have key attributes

    // {"prompt" + (card.id + 1)} gives each input field a unique id so htmlFor can associate correctly
    return <> 
        <label htmlFor={"prompt" + (card.id + 1)}>Prompt:</label><br/>
        <input type="text" name="prompt" id={"prompt" + (card.id + 1)} value={card.prompt} 
            onChange={(e) => updateCard(e.target.value, card.response, card.id)}/><br/>
        
        <label htmlFor={"response" + (card.id + 1)}>Response:</label><br/>
        <input type="text" name="response" id={"response" + (card.id + 1)} value={card.response}
            onChange={(e) => updateCard(card.prompt, e.target.value, card.id)}/><br/>
        
        <button className="delete-new-flaschard-button" onClick={() => removeCard(card.id)}>Del</button>
    </>
}