import { useRef, useState } from 'react';

export default function RecordResponse({setAudioData}) {

    const [isRecording, setIsRecording] = useState(false);
    // this will contain a local website URL to the audio we record which will allow us to access it later
    const [audioURL, setAudioURL] = useState(null);
    // these will contain the object that records audio and the data it produces, these do not need to update the application's appearance so we use useRef
    const mediaRecorder = useRef(null);
    const audioData = useRef([]);
  
    // Function to handle audio data availability, this is invoked once recording is complete
    function handleDataAvailable(event) { 
        // this pushes the newly created audio data (which is part of a Blob object) into the audioData array
        audioData.current.push(event.data);
    }
  
    // Invoked when recording stops, this creates a URL that can be used to display the recorded audio
    // Note that this function is always executed after handleDataAvailable because of how MediaRecorder handles its events
    function handleRecordingStop() {
        // creating a new audio URL for the recorded data and storing it
        const audioBlob = new Blob(audioData.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        setAudioData(url);
        
        audioData.current = []; // we reset the audio data in case we need to record again
    }
  
    // handles beginning recording audio by initializing a MediaRecorder and its event handlers
    async function startRecording() {
        try {
            // getting the system media stream and passing it to a new MediaRecorder object
            const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(mediaStream);
  
            // defining the recorder's event handers for when recording stops
            mediaRecorder.current.ondataavailable = handleDataAvailable;
            mediaRecorder.current.onstop = handleRecordingStop;
  
            // we begin recording once the MediaRecorder object is set up 
            mediaRecorder.current.start();
            setIsRecording(true);
        } catch (error) {
            alert("Could not access the microphone. Please grant permission to use the microphone to record responses");
        }
    }
  
    // this function handles stopping recording
    function stopRecording() { 
        mediaRecorder.current.stop(); // this invokes the handleRecordingStop function because it was set as the mediaRecorder's event handler
        setIsRecording(false);
    }
  
    return (
      <div>
        <button onClick={isRecording ? stopRecording : startRecording}>
            {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        <br/>
        {audioURL === null ? <></> : <audio controls="controls" src={audioURL}/>}
      </div>
    )
  }