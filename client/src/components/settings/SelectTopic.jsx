import React, { useState, useRef, useEffect } from "react";
import ResetWarning from "../overlays/ResetWarning";
import topicData from "../../prompts/topics.json";
import { capitalizeFirstLetter, toTitleCase, useMobile, useMobileXs } from "../../utils";

//Freeze original topicData to make it immutable
Object.freeze(topicData);
for (let i = 0; i < topicData.topics.length; i++) {
  Object.freeze(topicData.topics[i]);
}

function SelectTopic({
  onContinueForward,
  currentTopic,
  onReset,
  onCancel
}) {

  const [selectedTopic, setSelectedTopic] = useState({
    title: "",
    description: "",
    prompt: "",
  });
  const [hoverTopic, setHoverTopic] = useState({});
  const [customTopic, setCustomTopic] = useState("");
  const [displayWarning, setDisplayWarning] = useState(false);
  const topicTextareaRef = useRef(null);
  const isMobile = useMobile();
  const isMobileXs = useMobileXs();

  const topics = [
    ...topicData.topics,
    { title: "custom topic", prompt: "", description: "" },
  ];

  // useEffect hook to listen for changes in currentTopic
  useEffect(() => {
    if (currentTopic?.prompt) {
      let reSelectTopic = topics.find((topic) => topic.title === currentTopic.title);
      if(currentTopic?.title === 'custom topic'){
        setCustomTopic(currentTopic.description);
        reSelectTopic.prompt = currentTopic.description;
        reSelectTopic.description = currentTopic.description;
      }
      selectTopic(reSelectTopic);
      
    }
  }, [currentTopic]); // Dependency array includes only currentTopic

  // Function to set selectedTopic and focus on textarea if needed
  function selectTopic(topic) {
    // Check if the topic is in the predefined list or not
    const topicExists = topics.some(
      (t) => t.title.toLowerCase() === topic.title.toLowerCase()
    );

    if (topicExists) {
      setSelectedTopic(topic);
    } else {
      // If the topic is not in the list, consider it a custom topic
      setCustomTopic(topic.title.substring(0, 150)); // Set the unrecognized topic as the custom topic
      setSelectedTopic({
        title: "custom topic",
        prompt: "",
        description: "",
      }); // Automatically select "custom topic"
    }

    // Focus on the textarea if "custom topic" is selected
    if (!topicExists || topic.title.toLowerCase() === "custom topic") {
      setTimeout(() => {
        topicTextareaRef.current && topicTextareaRef.current.focus();
      }, 0);
    }
  }

  // Function to handle custom topic input changes
  function handleInputTopic(e) {
    const newTopic = e.target.value;
    const capitalizedTopic = capitalizeFirstLetter(newTopic).substring(0, 150);
    setCustomTopic(capitalizedTopic);
  }

  // Function to proceed with the selected or custom topic
  function proceedForward() {
    if (currentTopic) {
      // Current topic exists which means we are changing settings
      setDisplayWarning(true);
    } else {
      let continueWithTopic = buildTopicPrompt();
      onContinueForward({ topic: continueWithTopic });
    }
  }

  function buildTopicPrompt() {
    //We need to make a structuredClone here, otherwise we just end up with a string of pointers that ends up mutating the original topicData.
    let continueWithTopic = structuredClone(selectedTopic);
    if (continueWithTopic.title.toLowerCase() === "custom topic") {
      continueWithTopic.prompt = customTopic;
      continueWithTopic.description = customTopic;
    }

    continueWithTopic.prompt = topicData.system.replace(
      "[TOPIC]",
      continueWithTopic.prompt
    );

    return continueWithTopic;
  }

  // Conditional rendering for showing the Next button
  const shouldShowNextButton =
    selectedTopic &&
    selectedTopic.title &&
    !(
      selectedTopic.title.toLowerCase() === "custom topic" &&
      !customTopic.trim()
    );

  const container = {
    width: "96vw",
    maxWidth: "850px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flexStart",
    alignItems: "center",
  };

  const doubleColumn = {
    width: "50%",
    display: "flex",
    flexDirection: "column",
    margin: "0 7px"
  };

  const textBoxStyle = {
    backgroundColor: "transparent",
    width: isMobile ? "80%" : "70%",
    color: "white",
    textAlign: "center",
    border: "0",
    fontFamily: "Tinos, serif",
    lineHeight: "1.2em",
    // fontSize: "25px",
    resize: "none",
    padding: "0",
    margin: "0",
    height: isMobile ? (isMobileXs ? "45px" : "60px") : "80px",
    display: showTextBox() ? "" : "none",
  };

  function showTextBox() {
    return selectedTopic.title === "custom topic"
      ? hoverTopic?.title && hoverTopic?.title !== "custom topic"
        ? false
        : true
      : hoverTopic?.title === "custom topic"
        ? true
        : false;
  }

  const selectButtonStyle = {
    marginBottom: isMobile ? "3px" : "15px",
    padding: isMobile ? "3px 0" : "6px 0",
  };

  return (
    <>
      {displayWarning ? (
        <ResetWarning
          message="changing topic"
          onReset={() =>
            onReset({ topic: buildTopicPrompt() })
          }
          onCancel={onCancel}
        />
      ) : (
        <div style={container}>
          <h1 style={{ marginBottom: isMobile && (isMobileXs ? "0px" : "5px") }}>THE ISSUE</h1>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "center",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: "center" }}>
              <div style={doubleColumn}>
                {topics.filter((item, index) => {
                  if (index === topics.length - 1) return false;
                  if (topics.length <= 5 + 1) return true;
                  return index < (topics.length - 1) / 2;
                }).map((topic, index) => (
                  <button
                    key={index}
                    className={
                      selectedTopic.title === topic.title ? "selected " : ""
                    }
                    onClick={() => selectTopic(topic)}
                    onMouseEnter={() => setHoverTopic(topic)}
                    onMouseLeave={() => setHoverTopic(null)}
                    style={selectButtonStyle}
                  >
                    {toTitleCase(topic.title)}
                  </button>
                ))}
              </div>
              <div style={{ ...doubleColumn, display: topics.length > 5 + 1 ? "flex" : "none" }}>
                {topics.filter((item, index) => {
                  if (index === topics.length - 1) return false;
                  if (topics.length <= 5 + 1) return false;
                  return (index >= (topics.length - 1) / 2);
                }).map((topic, index) => (
                  <button
                    key={index}
                    className={
                      selectedTopic.title === topic.title ? "selected " : ""
                    }
                    onClick={() => selectTopic(topic)}
                    onMouseEnter={() => setHoverTopic(topic)}
                    onMouseLeave={() => setHoverTopic(null)}
                    style={selectButtonStyle}
                  >
                    {toTitleCase(topic.title)}
                  </button>
                ))}
              </div>
            </div>
            {topics.slice(-1).map((topic, index) => (
              <button
                key={index}
                className={
                  selectedTopic.title === topic.title ? "selected " : ""
                }
                onClick={() => selectTopic(topic)}
                onMouseEnter={() => setHoverTopic(topic)}
                onMouseLeave={() => setHoverTopic(null)}
                style={{ ...selectButtonStyle, width: "50%" }}
              >
                {toTitleCase(topic.title)}
              </button>
            ))}
            <p
              style={{
                margin: "0",
                width: isMobile ? "80%" : "70%",
                height: showTextBox() ? "0" : isMobile ? (isMobileXs ? "45px" : "60px") : "80px",
                overflow: "hidden"
              }}
            >
              {hoverTopic?.title
                ? hoverTopic.description
                : selectedTopic
                  ? selectedTopic.description
                  : "please select an issue for the discussion"}
            </p>
          </div>
          <textarea
            ref={topicTextareaRef}
            className="unfocused"
            rows="3"
            value={customTopic}
            placeholder="Write a topic here..."
            onChange={handleInputTopic}
            style={textBoxStyle}
          />
          <button
            onClick={proceedForward}
            style={{
              marginBottom: "10px",
              visibility: shouldShowNextButton ? "" : "hidden",
            }}
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}

export default SelectTopic;
