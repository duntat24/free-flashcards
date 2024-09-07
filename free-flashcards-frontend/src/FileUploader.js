import { useState } from 'react';
import axios from 'axios';

export default function FileUploader() {

    const MAX_FILE_SIZE = 500000; // defines maximum file size in bytes

    const [file, setFile] = useState(null);
    const [fileString, setFileString] = useState(null); // contains URL of response file for the browser to display
    const [fileMimetype, setFileMimetype] = useState(null); // 

    function handleUploadChange(event) { // puts files attached to the component's form into the file state variable
        const changedFile = event.target.files[0];
        if (changedFile === undefined) {
            setFile(null);
        } else if (changedFile.size > MAX_FILE_SIZE) {
            alert("Attached file is too large. Files be less than 0.5 MB");
            event.target.value = null;
            setFile(null);
        } else {
            setFile(changedFile);
        }


        // TODO: Enforce upload types (require image/ or audio/ prefix on the image mimetype)
        // This prevents invalid uploads (executables, code, pdfs)


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
            alert("Attached file is too large. Files must have be less than 0.5 MB");
            return;
        }
        const url = "http://localhost:3001/cards/66cfd27b38e5367fabb70f8f/file" // this is ONLY FOR TESTING and should be modifiable
        const formData = new FormData();
        formData.append("file", file); 
        formData.append("fileName", file.fileName);
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
        });
    }

    function handleDownloadSubmit(event) {
        event.preventDefault(); // prevents page refresh 
        const url = "http://localhost:3001/cards/66cfd27b38e5367fabb70f8f"
        axios.get(url).then((response) => {
            //const fileBase64String = btoa(String.fromCharCode(...new Uint8Array(response.data.file.data.data)));
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
            <input type="text" name="name" placeholder="File Name.." /><br />
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
    TIFF does not work in all browsers. These uploads should not be allowed so as to not confuse users
    */
function generateUploadJSX(mimetype, fileString) {
    const mimetypeTokens = mimetype.split("/"); // mimetypes are of the form {type}/{format} e.g. image/png 
    if (mimetypeTokens[0] === "image") {
        return <img src={`data:image/${mimetypeTokens[1]};base64,${fileString}`} alt="upload"/>
    } else if (mimetypeTokens[0] === "audio") {
        return <audio controls="controls" src={`data:audio/${mimetypeTokens[1]};base64,${fileString}`}/>
    }
}

function arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa(binary);
}