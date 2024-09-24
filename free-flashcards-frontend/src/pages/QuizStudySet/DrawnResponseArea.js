import { useEffect, useRef, useState } from 'react'

export default function DrawnResponseArea({setDrawnResponse}) {

    // this will hold our canvas so we can access and display it later
    const canvasRef = useRef(null); 
    
    // this will hold information about how we draw on the canvas - text color, line style, etc - as well as our current action being performed
    const contextRef = useRef(null); 

    const [isDrawing, setIsDrawing] = useState(false);
    
    // this variable can be toggled when we need to reset the canvas
    const [reset, setReset] = useState(false);

    // sets up the canvas when the component mounts and resets the canvas when the value of 'reset' is toggled
    useEffect(() => {
        const canvas = canvasRef.current; 
        canvas.width = window.innerWidth / 3; // innerWidth is the browser viewport width
        canvas.height = window.innerWidth / 3; // the drawing area will be a square side length = 1/3rd the browser's height
        canvas.style.width = `${window.innerWidth / 3}px`;
        canvas.style.height = `${window.innerWidth / 3}px`;

        const context = canvas.getContext("2d"); // this allows us to draw on the canvas
        context.lineCap = "round"; // line endings are round, this makes it look better
        context.strokeStyle = "black"; // defining the color we draw in
        context.lineWidth = 2; // defining how large the strokes are

        contextRef.current = context;
        setDrawnResponse(""); // when this functionality is invoked we shouldn't have an image to display, this ensures that reset will also clear the response image in the QuizStudySet component

        // by making this depend on the reset state variable, we reset our canvas and canvas context every time
        // the value of reset changes, allowing us to freely reset the drawing whenever we need to
    }, [reset]); 

    // invoked when the mouse is pressed, this begins a new path on the canvas
    function startDrawing(event) {
        // getting the coordinates of the mouse when the event occurred
        const {offsetX, offsetY} = event.nativeEvent;       

        contextRef.current.beginPath(); // begins drawing a new path
        contextRef.current.moveTo(offsetX, offsetY); // moves the path to the position of the mouse
        setIsDrawing(true);
    }

    // invoked when the mouse is released, this stops the path currently being drawn on the canvas
    function stopDrawing() {
        contextRef.current.closePath(); // ends the current path being drawn
        setIsDrawing(false);

        // once we stop drawing we want to save our changes - this exports a data url that can be used to display our response
        const canvasDataURL = canvasRef.current.toDataURL();
        setDrawnResponse(canvasDataURL);
    }

    // This function draws on the canvas as the user drags the mouse
    function draw(event) {
        if (!isDrawing) { // we only want to draw on the canvas if we are drawing (ie mouse is down)
            return;
        }
        // getting the coordinates of the mouse when the event occurred
        const {offsetX, offsetY} = event.nativeEvent;
        
        // drawing a line to the target mouse coordinates
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
    }

    return <>
        <canvas
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseMove={draw}
            ref={canvasRef}
            className="drawing-canvas"
        />
        <br/>
        <button onClick={() => setReset(!reset)}>Reset</button>
    </>
}