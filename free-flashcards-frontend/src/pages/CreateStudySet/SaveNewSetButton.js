export default function SaveNewSetButton({save}) {
    // this probably doesn't need to be its own component, may remove it if it proves unnecessary after the
    //  CreateStudySet component is fully implemented
    return <button className="save-button" onClick={save}>Save</button>
}