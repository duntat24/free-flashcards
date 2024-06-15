export default function ExpandedSetList({set}) {
    let displaySet = set.cards.map(card => (
        <li key={card.id} className="expanded-display-card">{card.prompt}</li>
    ));
    return <figure>
        <figcaption><b>{set.title}</b></figcaption>
        <button onClick={() => alert("beginning studying (placeholder)")} className="begin-studying">Study</button>
        <figcaption>Prompts:</figcaption>
        <ul className="expanded-set-list">
            {displaySet}
        </ul>
    </figure>
}