export default function ExpandedSetList({set, setStudiedSet, deleteFlashcardSet}) {
    // this converts all the card prompts in the set into list items that can then be displayed
    let displaySet = set.cards.map(card => (
        <li key={card.id} className="expanded-display-card">{card.prompt}</li>
    ));
    // by displaying the content as a figure, figcaption allows the list of prompts to easily be titled
    // the delete button should probably have a confirmation popup so users don't accidentally delete their sets
    return <figure>
        <figcaption><b>{set.title}</b></figcaption>
        <button onClick={() => setStudiedSet(set)} className="begin-studying">Study</button>
        <button onClick={() => deleteFlashcardSet(set.id)} className="delete-set">Delete</button>
        <figcaption>Prompts:</figcaption>
        <ul className="expanded-set-list">
            {displaySet}
        </ul>
    </figure>
}