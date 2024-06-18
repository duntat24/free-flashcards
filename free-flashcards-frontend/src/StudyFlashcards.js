export default function StudyFlashcards({setStudiedSet}) {
    return <>
        <button onClick={() => setStudiedSet(null)} className="stop-studying">Back</button>
    </>
}