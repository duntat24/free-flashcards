export default function AddFlashcardButton({addCard}) {
    // this may be removed as a component, currently it's a component in case more functionality needs to be added
    return <button className="add-flashcard-button" onClick={addCard}>Add Card</button>;
}