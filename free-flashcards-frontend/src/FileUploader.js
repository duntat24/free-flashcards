import { useState } from 'react';
import axios from 'axios';

export default function FileUploader() {

    const MAX_FILE_SIZE = 500000; // defines maximum file size in bytes

    const [file, setFile] = useState(null);
    const [fileString, setFileString] = useState(null); // contains URL of response file for the browser to display
    const [fileMimetype, setFileMimetype] = useState(null); // 

    function handleUploadChange(event) { // puts files attached to the component's form into the file state variable
        const changedFile = event.target.files[0];

        const validateFileResult = validateFileInput(changedFile, MAX_FILE_SIZE);
        if (validateFileResult === null) {
            setFile(null);
        } else if (validateFileResult === "") { // validateFileInput returns the appropriate error message if a file input is invalid
            setFile(changedFile);
        } else {
            alert(validateFileResult);
            event.target.value = null;
            setFile(null);
        }
    }

    function handleUploadSubmit(event) { // uploads the file attached to the form submission
        event.preventDefault(); // prevents page refresh
        if (file === null) {
            alert("Please attach a file");
            return;
        }
        if (file.name === undefined) {
            alert("Please enter a file name");
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            alert("Attached file is too large. Files must be less than 0.5 MB");
            return;
        }
        const url = "http://localhost:3001/cards/66cfd27b38e5367fabb70f8f/file" // this is ONLY FOR TESTING and should be modifiable
        const formData = new FormData();
        formData.append("file", file); 
        const requestConfiguration = {
            headers: {
              'content-type': 'multipart/form-data', // important to tell the server what is in the request
            },
        };
        axios.post(url, formData, requestConfiguration).then((response) => {
            // not doing anything with response at the moment
            alert("Uploaded successfully");
        }).catch((error) => {
            console.log(error);
            alert(error.response.data.error.message); // this should never happen if the user's javascript hasn't been modified
        });
    }

    function handleDownloadSubmit(event) {
        event.preventDefault(); // prevents page refresh 
        const url = "http://localhost:3001/cards/66cfd27b38e5367fabb70f8f"
        axios.get(url).then((response) => {
            const fileBase64String = arrayBufferToBase64(response.data.file.data.data);
            setFileString(fileBase64String);
            setFileMimetype(response.data.file.fileType);
        }).catch((error) => {
            console.log(error);
        })
    }

    let uploadedFile = (fileString && fileMimetype) ? generateUploadJSX(fileMimetype, fileString) : <></>; 
    return <>
        <form onSubmit={handleUploadSubmit}>
            <input type="file" onChange={handleUploadChange}/> <br /> <br />
            <input type="submit" value="Upload File" />
        </form>
        <form onSubmit={handleDownloadSubmit}>
            <input type="submit" value="Download File" />
        </form>
        {uploadedFile}
    </>
}

// this function returns the appropriate JSX based on the provided file type & base64 file string
/* TESTED FOR:
        PNG
        JPG
        BMP
        SVG

        MP3
        M4A
        WAV
    */
function generateUploadJSX(mimetype, fileString) {
    const mimetypeTokens = mimetype.split("/"); // mimetypes are of the form {type}/{format} e.g. image/png 
    if (mimetypeTokens[0] === "image") {
        return <img src={`data:image/${mimetypeTokens[1]};base64,${fileString}`} alt="upload"/>
    } else if (mimetypeTokens[0] === "audio") {
        return <audio controls="controls" src={`data:audio/${mimetypeTokens[1]};base64,${fileString}`}/>
    }
}

// This method takes a file buffer from a request and converts it to a Base64 string to be displayed by our application
function arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) { // by constructing our array iteratively we avoid errors from the call stack being too large
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

// this function verifies that uploaded files are within size and type constraints
// if the file does not fit within those constraints, it returns an error message to be displayed
// if it does, it returns a blank string
function validateFileInput(file, MAX_FILE_SIZE) {
    if (file === null || file === undefined) {
        return null;
    }
    if (file.size > MAX_FILE_SIZE) {
        return "Attached file is too large. Files must be less than 0.5 MB";
    }
    const fileMimetypeArray = file.type.split("/"); // separates keywords in the file's description, e.g. [image, jpeg]
    if (fileMimetypeArray[0] !== "image" && fileMimetypeArray[0] !== "audio") {
        return "Attached files must be image or audio files and cannot be PDFs";
    }
    if (fileMimetypeArray[1] === "tiff" || fileMimetypeArray[1] === "tiff-fx") { // TIFF files do not work in most browsers
        return "Attached files cannot be in the following formats: TIFF";
    }
    return "";
}