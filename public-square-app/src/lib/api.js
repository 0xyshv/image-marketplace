import Arweave from "arweave";
import Account from "arweave-account";
export const arweave = Arweave.init({});
export const account = new Account({
  cacheIsActivated: true,
  cacheSize: 100,
  cacheTime: 3600000, // 3600000ms => 1 hour cache duration
});
export const maxMessageLength = 1024;

export const isWellFormattedAddress = (input) => {
  const re = /^[a-zA-Z0-9_]{43}$/;
  return re.test(input);
};

export const createPostInfo = (node) => {
  const ownerAddress = node.owner.address;
  const height = node.block ? node.block.height : -1;
  const timestamp = node?.block?.timestamp
    ? parseInt(node.block.timestamp, 10) * 1000
    : -1;
  const topicTag = node.tags && node.tags.find((a) => a.name === "Topic");
  // two more tags render 🟡
  const categoryTag = node.tags && node.tags.find((a) => a.name === "Category");
  const contentTag = node.tags && node.tags.find((a) => a.name === "Content");
  const topic = topicTag ? topicTag.value : null;
  const category = categoryTag ? categoryTag.value : null;
  const content = contentTag ? contentTag.value : null;
  const postInfo = {
    txid: node.id,
    owner: ownerAddress,
    account: account.get(ownerAddress),
    topic: topic,
    // two more tags render 🟡
    category: category,
    content: content,

    height: height,
    length: node.data.size,
    timestamp: timestamp,
    request: null,
  };
  if (postInfo.length <= maxMessageLength) {
    postInfo.request = arweave.api
      .get(`/${node.id}`, { timeout: 10000 })
      .catch(() => {
        postInfo.error = "timeout loading data";
      });
  } else {
    postInfo.error = `message is too large (exceeds ${
      maxMessageLength / 1024
    }kb)`;
  }
  return postInfo;
};

export const buildQuery = ({
  count,
  address,
  topic,
  category,
  content,
} = {}) => {
  count = Math.min(100, count || 100);
  let ownersFilter = "";
  if (address) {
    ownersFilter = `owners: ["${address}"],`;
  }
  let queryArray = [];

  let topicFilter = "";
  if (topic) {
    topicFilter = `{
      name: "Topic",
      values: ["${topic}"]
    },`;
  }

  let categoryFilter = "";
  if (category) {
    categoryFilter = `{
      name: "Category",
      values: ["${category}"]
    },`;
  }

  let contentFilter = "";
  if (content) {
    contentFilter = `{
      name: "Content",
      values: ["${content}"]
    },`;
  }

  // build dynamic query 🟡
  const queryObjectDefault = {
    query: `{
      transactions(first: ${count}, ${ownersFilter}
        tags: [
          {
            name: "App-Name",
            values: ["PublicSquare"]
          },
          {
            name: "Content-Type",
            values: ["text/plain"]
          }
    ]
      ) {
     edges {
       node {
         id
         owner {
           address
         }
         data {
           size
         }
         block {
           height
           timestamp
         }
         tags {
           name,
           value
         }
       }
     }
   }
 }`,
  };

  queryArray.push(queryObjectDefault);

  const queryObjectTopic = topicFilter
    ? {
        query: `{
      transactions(first: ${count}, ${ownersFilter}
        tags: [
          {
            name: "App-Name",
            values: ["PublicSquare"]
          },
          {
            name: "Content-Type",
            values: ["text/plain"]
          },
          ${topicFilter}
    ]
      ) {
     edges {
       node {
         id
         owner {
           address
         }
         data {
           size
         }
         block {
           height
           timestamp
         }
         tags {
           name,
           value
         }
       }
     }
   }
 }`,
      }
    : "";

  if (queryObjectTopic) queryArray.push(queryObjectTopic);

  const queryObjectCategory = categoryFilter
    ? {
        query: `{
      transactions(first: ${count}, ${ownersFilter}
        tags: [
          {
            name: "App-Name",
            values: ["PublicSquare"]
          },
          {
            name: "Content-Type",
            values: ["text/plain"]
          },
          ${categoryFilter}
    ]
      ) {
     edges {
       node {
         id
         owner {
           address
         }
         data {
           size
         }
         block {
           height
           timestamp
         }
         tags {
           name,
           value
         }
       }
     }
   }
 }`,
      }
    : "";

  if (queryObjectCategory) queryArray.push(queryObjectCategory);

  const queryObjectContent = contentFilter
    ? {
        query: `{
      transactions(first: ${count}, ${ownersFilter}
        tags: [
          {
            name: "App-Name",
            values: ["PublicSquare"]
          },
          {
            name: "Content-Type",
            values: ["text/plain"]
          },
          ${contentFilter}
    ]
      ) {
     edges {
       node {
         id
         owner {
           address
         }
         data {
           size
         }
         block {
           height
           timestamp
         }
         tags {
           name,
           value
         }
       }
     }
   }
 }`,
      }
    : "";
  if (queryObjectContent) queryArray.push(queryObjectContent);

  return queryArray;
};

// in miliseconds
var units = {
  year: 24 * 60 * 60 * 1000 * 365,
  month: (24 * 60 * 60 * 1000 * 365) / 12,
  day: 24 * 60 * 60 * 1000,
  hour: 60 * 60 * 1000,
  minute: 60 * 1000,
  second: 1000,
};

var rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export const getRelativeTime = (ts1, ts2) => {
  var elapsed = ts1 - ts2;
  // "Math.abs" accounts for both "past" & "future" scenarios
  for (var u in units)
    if (Math.abs(elapsed) > units[u] || u === "second")
      return rtf.format(Math.round(elapsed / units[u]), u);
};

export const getPostTime = (timestamp) => {
  if (timestamp < 0) {
    return "pending...";
  }
  return getRelativeTime(timestamp, Date.now());
};

export const abbreviateAddress = (address) => {
  if (!address) return address;
  const firstFive = address.substring(0, 5);
  const lastFour = address.substring(address.length - 4);
  return `${firstFive}..${lastFour}`;
};

export const getTopicString = (input) => {
  let dashedTopic = (input || "")
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return dashedTopic;
};

export const delay = (t) => {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve();
    }, t);
  });
};

export const delayResults = (milliseconds, results) => {
  return delay(milliseconds).then(function () {
    return results;
  });
};
