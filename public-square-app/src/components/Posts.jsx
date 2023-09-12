import React from "react";
import { Link } from "react-router-dom";
import { maxMessageLength, abbreviateAddress, getPostTime } from "../lib/api";

export const Posts = (props) => {
  return (
    <div className="grid grid-rows-3">
      {props.postInfos.map((postInfo) => (
        <PostItem key={postInfo.txid} postInfo={postInfo} />
      ))}
    </div>
  );
};

const PostItem = (props) => {
  const [postMessage, setPostMessage] = React.useState("");
  const [statusMessage, setStatusMessage] = React.useState("");
  const [ownerName, setOwnerName] = React.useState("");
  const [ownerHandle, setOwnerHandle] = React.useState("");
  const [imgSrc, setImgSrc] = React.useState(
    props.postInfo.imgSrc || "img_avatar.png"
  );

  React.useEffect(() => {
    const getAccountInfo = async () => {
      setOwnerName(abbreviateAddress(props.postInfo.owner));
      const info = await props.postInfo.account;
      if (info?.handle?.startsWith("@")) {
        props.postInfo.imgSrc = info.profile.avatarURL;
        setImgSrc(info.profile.avatarURL);
        setOwnerName(info.profile.name);
        setOwnerHandle(info.handle);
      } else {
        setOwnerName(info.handle);
      }
    };
    getAccountInfo();
  }, [props.postInfo]);

  const renderTopic = (topic) => {
    if (topic)
      return (
        <Link to={`/search/${topic}`} className="postTopic">
          #{topic}
        </Link>
      );
  };

  // Two new tags render 🟡
  const renderCategory = (topic) => {
    if (topic)
      return (
        <Link to={`/search/${topic}`} className="postTopic">
          #{topic}
        </Link>
      );
  };
  const renderContent = (topic) => {
    if (topic)
      return (
        <Link to={`/search/${topic}`} className="postTopic">
          #{topic}
        </Link>
      );
  };

  React.useEffect(() => {
    let isCancelled = false;

    const getPostMessage = async () => {
      setPostMessage(
        "s".repeat(
          Math.min(Math.max(props.postInfo.length - 75, 0), maxMessageLength)
        )
      );
      const response = await props.postInfo.request;
      let newStatus = "";
      let newPostMessage = "";

      switch (response?.status) {
        case 200:
        case 202:
          props.postInfo.message = response.data.toString();
          newPostMessage = props.postInfo.message;
          break;
        case 404:
          newStatus = "Not Found";
          break;
        default:
          newStatus = props.postInfo?.error || "missing data";
      }

      if (!isCancelled) {
        setPostMessage(newPostMessage);
        setStatusMessage(newStatus);
      }
    };

    if (!props.postInfo.message) {
      setStatusMessage("loading...");

      if (props.postInfo.error) {
        setPostMessage("");
        setStatusMessage(props.postInfo.error);
      } else {
        getPostMessage();
      }
    }

    return () => {
      isCancelled = true;
    };
  }, [props.postInfo]);

  return (
    <div className="postItem">
      <div className="postLayout">
        <img className="profileImage" src={imgSrc} alt="Profile" />
        <div>
          <div className="postOwnerRow">
            <Link to={`/creators/${props.postInfo.owner}`}>{ownerName}</Link>
            <span className="gray">
              {" "}
              <span className="handle">{ownerHandle}</span> •{" "}
            </span>
            <time>{getPostTime(props.postInfo.timestamp)}</time>
          </div>
          <div className="postRow">
            {props.postInfo.message || postMessage}
            {statusMessage && <div className="status"> {statusMessage}</div>}
          </div>
          {renderTopic(props.postInfo.topic)}
          {renderCategory(props.postInfo.category)}
          {renderContent(props.postInfo.content)}
        </div>
      </div>
    </div>
  );
};
