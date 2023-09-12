import React from "react";
import TextareaAutosize from "react-textarea-autosize";
import { arweave, getTopicString } from "../lib/api";
import "font-awesome/css/font-awesome.min.css";

// make it post for image 🟡

export const NewPost = (props) => {
  const [imageCategory, setImageCategory] = React.useState("");
  const [imageContent, setImageContent] = React.useState("");
  const [imageTopic, setImageTopic] = React.useState("");
  // const [postValue, setPostValue] = React.useState("");
  const [imageFile, setImageFile] = React.useState(null); // 🟡
  const [isPosting, setIsPosting] = React.useState(false);
  const [generateTagsDisabled, setGenerateTagsDisabled] = React.useState(true);
  const [isLoadingTags, setIsLoadingTags] = React.useState(false); // Added for the spinner
  const [isLoadingUpload, setIsLoadingUpload] = React.useState(false);

  // function dataURLToBuffer(dataURL) {
  //   const base64 = dataURL.split(",")[1];
  //   const binaryString = window.atob(base64);
  //   const length = binaryString.length;
  //   const buffer = new Uint8Array(length);

  //   for (let i = 0; i < length; i++) {
  //     buffer[i] = binaryString.charCodeAt(i);
  //   }

  //   return buffer;
  // }

  function onTopicChanged(e) {
    let input = e.target.value;
    let dashedTopic = getTopicString(input);
    setImageTopic(dashedTopic);
  }

  function onCategoryChanged(e) {
    let input = e.target.value;
    let dashedTopic = getTopicString(input);
    setImageCategory(dashedTopic);
  }

  function onContentChanged(e) {
    let input = e.target.value;
    let dashedTopic = getTopicString(input);
    setImageContent(dashedTopic);
  }

  // blob to buffer
  function blobToBuffer(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function () {
        resolve(new Uint8Array(reader.result));
      };
      reader.onerror = function () {
        reject(new Error("Error reading blob as buffer"));
      };
      reader.readAsArrayBuffer(blob);
    });
  }

  // 🟡 Posting to arweave blockchain
  async function onPostButtonClicked() {
    setIsPosting(true);
    // get image buffer from server
    let imageBuffer = "";
    if (imageFile) {
      // send imageFile to server
      const form = document.createElement("form");
      // Set the enctype attribute to "multipart/form-data"
      form.setAttribute("enctype", "multipart/form-data");
      const formData = new FormData(form);
      formData.append("image", imageFile);

      await fetch("http://localhost:4000/get-buffer", {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          // Check if the response status is OK (200)
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }

          // Read the response as a binary blob
          return response.blob();
        })
        .then((blobData) => {
          // Convert the binary blob to a buffer (Uint8Array)
          return blobToBuffer(blobData);
        })
        .then((buffer) => {
          // Now you can work with the received buffer
          console.log(buffer);
          imageBuffer = buffer;

          // You can use the buffer for further processing, like displaying an image
          // displayImageFromBuffer(buffer);
        })
        .catch((err) => {
          console.log(err);
        });
    }

    let tx = await arweave.createTransaction({ data: imageBuffer });
    tx.addTag("App-Name", "AlphaMarketplace");
    tx.addTag("Content-Type", "image/png");
    tx.addTag("Version", "1.0.1");
    tx.addTag("Type", "file");
    // add as many tags as needed
    if (imageCategory) {
      tx.addTag("Category", imageCategory);
    }
    if (imageContent) {
      tx.addTag("Content", imageContent);
    }
    if (imageTopic) {
      tx.addTag("Topic", imageTopic);
    }

    try {
      await window.arweaveWallet.dispatch(tx).then((res) => {
        // print transaction response
        console.log(res);
        setImageCategory("");
        setImageContent("");
        setImageTopic("");
      });
    } catch (err) {
      console.error(err);
    }
    setIsLoadingUpload(false); // End loading
    setIsPosting(false);
  }

  async function generateTags(e) {
    e.preventDefault();
    setIsLoadingTags(true); // Start loading
    setGenerateTagsDisabled(true);
    // Request server for tags using cloud vision API

    if (imageFile) {
      // send imageFile to server
      const form = document.createElement("form");
      // Set the enctype attribute to "multipart/form-data"
      form.setAttribute("enctype", "multipart/form-data");
      const formData = new FormData(form);
      formData.append("image", imageFile);

      // formData.append("category", imageCategory);
      // formData.append("content", imageContent);
      // formData.append("topic", imageTopic);
      const response = await fetch("http://localhost:4000/upload", {
        method: "POST",
        body: formData,
      }).catch((err) => {
        console.log(err);
        setGenerateTagsDisabled(false);
        onCategoryChanged({
          target: {
            value: "Tag1",
          },
        });
        onTopicChanged({
          target: {
            value: "Tag3",
          },
        });
        onContentChanged({
          target: {
            value: "Tag2",
          },
        });
      });
      const data = await response.json();

      // set tags
      let length = data.length;
      length >= 1 &&
        onCategoryChanged({
          target: {
            value: data[0],
          },
        });
      length >= 2 &&
        onContentChanged({
          target: {
            value: data[1],
          },
        });
      length >= 3 &&
        onTopicChanged({
          target: {
            value: data[2],
          },
        });
    }
    setIsLoadingTags(false); // End loading
    setGenerateTagsDisabled(false);
  }

  let isDisabled = !imageTopic || !imageCategory || !imageContent;

  if (props.isLoggedIn) {
    if (isPosting) {
      return (
        <div className="newPost">
          <div className="newPostScrim" />
          {/* <TextareaAutosize value={postValue} readOnly={true} /> */}
          {/* A form to post an image */}
          <div className="newPost-postRow">
            <div className="topic">
              #
              <input
                type="text"
                placeholder="category"
                className="topicInput"
                value={imageCategory}
                disabled={true}
              />
            </div>
            <div className="topic">
              #
              <input
                type="text"
                placeholder="content"
                className="topicInput"
                value={imageContent}
                disabled={true}
              />
            </div>
            <div className="topic">
              #
              <input
                type="text"
                placeholder="topic"
                className="topicInput"
                value={imageTopic}
                disabled={true}
              />
            </div>
            <div>
              <button className="submitButton" disabled={true}>
                Post
              </button>
            </div>
          </div>
        </div>
      );
    } else if (isLoadingUpload) {
      return (
        <div className="newPost loading">
          <i className="fa fa-spinner fa-spin fa-3x"></i>
        </div>
      );
      //🟡
    } else {
      return (
        <div className="newPost">
          {/* <TextareaAutosize
            value={postValue}
            onChange={(e) => setPostValue(e.target.value)}
            rows="1"
            placeholder="What do you have to post?"
          />❌ */}
          <form className="mb-3">
            <input
              type="file"
              name="image"
              accept="image/png"
              onChange={(e) => {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = () => {
                  setImageFile(file);
                  // console.log(file);
                  setGenerateTagsDisabled(false);
                  // console.log(reader);
                };
              }}
            />
            <div className="newPost-postRow mt-3">
              <div
                className="topic"
                style={{ color: imageCategory && "rgb( 80, 162, 255)" }}
              >
                #
                <input
                  type="text"
                  placeholder="category"
                  className="topicInput"
                  value={imageCategory}
                  onChange={(e) => onCategoryChanged(e)}
                />
              </div>
              <div
                className="topic"
                style={{ color: imageContent && "rgb( 80, 162, 255)" }}
              >
                #
                <input
                  type="text"
                  placeholder="content"
                  className="topicInput"
                  value={imageContent}
                  onChange={(e) => onContentChanged(e)}
                />
              </div>
              <div
                className="topic"
                style={{ color: imageContent && "rgb( 80, 162, 255)" }}
              >
                #
                <input
                  type="text"
                  placeholder="topic"
                  className="topicInput"
                  value={imageTopic}
                  onChange={(e) => onTopicChanged(e)}
                />
              </div>
              <div>
                {/* <button
                className="submitButton"
                disabled={isDisabled}
                onClick={onPostButtonClicked}
              >
                Post
              </button> */}
              </div>
            </div>
            <div className="flex gap-8 justify-start w-[50%]">
              <button
                className="submitButton"
                disabled={generateTagsDisabled || isLoadingTags}
                onClick={generateTags}
              >
                {isLoadingTags ? "Loading..." : "Generate Tags"}
              </button>

              <button
                className="submitButton"
                disabled={isDisabled}
                onClick={onPostButtonClicked}
              >
                Upload
              </button>
            </div>
          </form>
        </div>
      );
    }
  } else {
    return (
      <div className="darkRow">Connect your wallet to start posting...</div>
    );
  }
};
