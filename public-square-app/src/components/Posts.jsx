import React from "react";
import { Link } from "react-router-dom";
import { maxMessageLength, abbreviateAddress, getPostTime } from "../lib/api";

export const Posts = (props) => {
  return (
    <div className="grid grid-cols-3 gap-2">
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

  const contentSrc = props.postInfo.contentSrc || "img_avatar.png";

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
        <Link to={`/search/${topic}`} className="postTopic  whitespace-nowrap">
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

  // convert One-Time-1 to 1
  function convertLicenseFee(licenseFee) {
    if (licenseFee) {
      return licenseFee.split("-")[2];
    }
  }

  return (
    <div className="postItem ">
      <img className="rounded-lg h-[200px]" src={contentSrc} alt="Profile" />
      {props.postInfo.licenseFee && (
        <div className="flex flex-end mt-3 gap-2">
          <div className="font-bold text-blue-500 bg-slate-100 rounded-lg px-2">
            UDL License
          </div>
          <div className="font-bold text-white bg-green-500 rounded-lg px-2">
            Fee : {convertLicenseFee(props.postInfo.licenseFee)} $U
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 grid-flow-row h-16">
        {renderTopic(props.postInfo.topic)}
        {renderCategory(props.postInfo.category)}
        {renderContent(props.postInfo.content)}
      </div>
      <div className="postLayout pt-4">
        <img className="profileImage" src={imgSrc} alt="Profile" />
        <div className="postOwnerRow">
          <Link to={`/creators/${props.postInfo.owner}`}>{ownerName}</Link>
          <div className="gray">
            {" "}
            <span className="handle">{ownerHandle}</span> •{" "}
            <time>{getPostTime(props.postInfo.timestamp)}</time>
          </div>
        </div>
        {/* <div className="postRow">
            {props.postInfo.message || postMessage}
            {statusMessage && <div className="status"> {statusMessage}</div>}
          </div>❌ */}
      </div>
    </div>
  );
};
