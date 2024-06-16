export default function ExpandedSetList({set}) {
    // this converts all the card prompts in the set into list items that can then be displayed
    let displaySet = set.cards.map(card => (
        <li key={card.id} className="expanded-display-card">{card.prompt}</li>
    ));
    // by displaying the content as a figure, figcaption allows the list of prompts to easily be titled
    return <figure>
        <figcaption><b>{set.title}</b></figcaption>
        <button onClick={() => alert("beginning studying (placeholder)")} className="begin-studying">Study</button>
        <figcaption>Prompts:</figcaption>
        <ul className="expanded-set-list">
            {displaySet}
        </ul>
    </figure>
}