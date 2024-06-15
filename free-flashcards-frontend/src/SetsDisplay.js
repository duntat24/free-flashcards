import { useState } from 'react';
import ExpandedSetList from './ExpandedSetList';

export default function SetsDisplay({flashcardSets}) {

    // clicking a list item should change it to the expanded state and set the expanded item (if any) to be collapsed
    // an expanded list item should display all of its prompts but won't show its response to not spoil answers for users
    const [expandedItemId, updateExpandedItemId] = useState(null); 
    
    function setExpandedItemId(id) {
        if (id === expandedItemId) {
            updateExpandedItemId(null);
        } else {
            updateExpandedItemId(id);
        }
    }
    
    // the displayed sets in collapsed state should be larger so they're easier to click, clicking an expanded set should probably collapse it
    let displayedSets = flashcardSets.map(set => (
        // checks if a set is the expanded set and sets style and displayed content as approrpiate
        <li onClick={() => setExpandedItemId(set.id)} key={set.id} 
        className={set.id === expandedItemId ? "expanded-displayed-set ": "collapsed-displayed-set"}>
                {set.id === expandedItemId ? 
                <ExpandedSetList set={set}/> : 
                "Title: " + set.title + ". Cards: " + set.cards.length}
        </li>
    ));

    return <div className="sets-display">
        <ul className="sets-list">
            {displayedSets}
        </ul>
    </div>;
}