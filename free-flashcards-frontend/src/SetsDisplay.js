export default function SetsDisplay({flashcardSets}) {
    flashcardSets.map(set => (console.log(set.title + " : " + set.cards.length + " card(s).")));
    let displayedSets = flashcardSets.map(set => (
        <li key={set.id}>
            Title: {set.title}. {set.cards.length} card(s)
        </li>
    ));
    return <div className="sets-display">
        <ul className="sets-list">
            {displayedSets}
        </ul>
    </div>;
}