import React, { useState, useEffect, useRef } from "react";
import FoodAnimation from "./FoodAnimation.jsx";
import { dvh, minWindowHeight } from "../utils.js";

function Forest({ currentSpeakerName, isPaused }) {

    //Zooming variables
    const [zoomInOnBeing, setZoomInOnBeing] = useState(null);
    const containerRef = useRef(null);
    const [zoomInValue, setZoomInValue] = useState(1);
    const [transformOrigin, setTransformOrigin] = useState([0, 0]);
    const [translate, setTranslate] = useState([0, 0]);
    const [animateTransformOrigin, setAnimateTransformOrigin] = useState(false);
    const [disableAnimations, setDisableAnimations] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setDisableAnimations(true);
        };
        window.addEventListener('resize', handleResize);
        // Cleanup function to remove the event listener
        return () => window.removeEventListener('resize', handleResize);
    }, []); // Empty dependency array ensures this effect runs only once on mount and unmount

    const characters = [//Ratio is video width / height
        { ref: useRef(null), name: "Pine", height: 30, left: 8, bottom: 16, ratio: 2500 / 4000 },
        { ref: useRef(null), name: "Salmon", height: 7, left: 16, bottom: 10, ratio: 3000 / 2100 },
        { ref: useRef(null), name: "Boletus", height: 9, left: 27, bottom: 6, ratio: 1 },
        { ref: useRef(null), name: "Log", height: 6, left: -3, bottom: 33, ratio: 2000 / 2160 },
        { ref: useRef(null), name: "Birch", height: 24, left: -28, bottom: 26, ratio: 1500 / 2500 },
        { ref: useRef(null), name: "Beetle", height: 7, left: -13, bottom: 31, ratio: 1850 / 1600 },
        { ref: useRef(null), name: "Reindeer", height: 15, left: -25, bottom: 51, ratio: 2500 / 3000 },
        { ref: useRef(null), name: "Flaming Pine", height: 15, left: -70, bottom: 20, ratio: 1 },
        { ref: useRef(null), name: "Reindeer House", height: 25, left: -70, bottom: 60, ratio: 3000 / 3750 },
        { ref: useRef(null), name: "Insect", height: 5, left: -35, bottom: 50, ratio: 2500 / 1500 }
    ];

    const container = {
        position: "absolute",
        backgroundColor: "black",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: "-3",
        transform: `scale(${zoomInValue}) translate(${translate[0]}, ${translate[1]})`,
        transformOrigin: `${transformOrigin[0]} ${transformOrigin[1]}`,
        transition: !disableAnimations && `transform 2s ease-out, transform-origin ${animateTransformOrigin ? "2s" : "0.0001s"} ease-out`
    };


    useEffect(() => {
        //find the current speaker in the list of characters
        const found = characters.find((char) => char.name === currentSpeakerName);
        if (found) {
            setZoomInOnBeing(found);
        } else {
            setZoomInOnBeing(null);
        }
    }, [currentSpeakerName]);

    useEffect(() => {
        if (zoomInOnBeing) {
            //Zoom in so that character is 70% of height
            const zoom = 70 / zoomInOnBeing.height;

            //Pixel calculations would be
            // const container = containerRef.current.getBoundingClientRect();
            // const screenHeight = container.height;
            // const screenWidth = container.width;
            // const box = zoomInOnBeing.ref.current.getBoundingClientRect();
            // const left = box.left + (box.right - box.left) / 2;
            // const top = box.top + (box.bottom - box.top) / 2;
            // const translateLeft = (screenWidth / 2 - left) / zoom;
            // const translateTop = (screenHeight / 2 - top) / zoom;

            //Which when calculated into dvh and vw values gives
            const left = zoomInOnBeing.left + ((zoomInOnBeing.height * zoomInOnBeing.ratio) / 2); //dvh offset from 50vw
            const top = 100 - zoomInOnBeing.bottom - zoomInOnBeing.height / 2; //dvh
            const translateLeft = -(zoomInOnBeing.left + zoomInOnBeing.height * zoomInOnBeing.ratio / 2) / zoom; //dvh
            const translateTop = (-50 + zoomInOnBeing.bottom + zoomInOnBeing.height / 2) / zoom; //dvh

            //Cap everything at the minimum zoom
            const sign = Math.sign(zoomInOnBeing.left) === 1 ? "+" : "-"; //left or right side of middle
            const cappedLeft = `calc(50vw ${sign} max(${Math.abs(left) + dvh}, ${minWindowHeight * Math.abs(left) / 100}px))`;//Left value needs calc
            const cappedTop = `max(${top + dvh}, ${top * minWindowHeight / 100 + "px"})`;
            const minOrMax = Math.sign(zoomInOnBeing.left) === 1 ? "min" : "max"; //left or right side of middle
            const cappedTranslateLeft = `${minOrMax}(${translateLeft + dvh}, ${translateLeft * minWindowHeight / 100 + "px"})`;
            const minOrMax2 = top > 50 ? "min" : "max"; //top or bottom half of screen
            const cappedTranslateTop = `${minOrMax2}(${translateTop + dvh}, ${translateTop * minWindowHeight / 100 + "px"})`;

            setZoomInValue(zoom);
            setTransformOrigin([cappedLeft, cappedTop]);
            setTranslate([cappedTranslateLeft, cappedTranslateTop]);
        } else {//Zoom out
            setZoomInValue(1);
            setTranslate([0, 0]);
        }
        //If we are zooming in from an actual zoom out state, don't animate the change of transform origin.
        if (window.getComputedStyle(containerRef.current).transform === "matrix(1, 0, 0, 1, 0, 0)") {
            setAnimateTransformOrigin(false);
        } else {
            setAnimateTransformOrigin(true);
        }
        setDisableAnimations(false);
    }, [zoomInOnBeing]);

    function l(amount) {
        //Position is from center, minus percentage of view height
        //capped at 300px view height, which is our minimum
        const sign = Math.sign(amount) === 1 ? "+" : "-";
        return `calc(50% ${sign} max(${Math.abs(amount) + dvh}, ${minWindowHeight * Math.abs(amount) / 100}px)`;
    }

    return (
        <div style={container} ref={containerRef}>
            <div style={{ zIndex: "-5", height: "80%", alignSelf: "flex-end", position: "relative", top: "12%" }}>
                <FoodAnimation character={{ name: "River" }} isPaused={isPaused} />
            </div>
            {characters.map((character, index) => (
                <Being
                    key={index}
                    name={character.name}
                    ref={character.ref}
                    height={character.height + "%"}
                    left={l(character.left)}
                    bottom={character.bottom + "%"}
                    isPaused={isPaused}
                    currentSpeakerName={currentSpeakerName}
                />))}
        </div >
    );
}

function Being({ name, ref, height, left, bottom, isPaused, currentSpeakerName }) {
    return (
        <div ref={ref} style={{ position: "absolute", height: height, left: left, bottom: bottom }}>
            <FoodAnimation character={{ name: name }} isPaused={isPaused} currentSpeakerName={currentSpeakerName} />
        </div>
    );
}

export default Forest;
