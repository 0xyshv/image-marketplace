import React from "react";
import {
  Routes,
  Route,
  Outlet,
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { WalletSelectButton } from "./components/WalletSelectButton";
import { ProfileButton } from "./components/ProfileButton";
import { Posts } from "./components/Posts";
import { ProgressSpinner } from "./components/ProgressSpinner";
import { TopicSearch } from "./components/TopicSearch";
import { UserSearch } from "./components/UserSearch";
import "./App.css";
import { buildQuery, arweave, createPostInfo, delayResults } from "./lib/api";
import { NewPost } from "./components/NewPost";

async function waitForNewPosts(txid) {
  let count = 0;
  let foundPost = null;
  let posts = [];

  while (!foundPost) {
    count += 1;
    console.log(`attempt ${count}`);
    await (2000 * count);
    posts = await getPostInfos();
    foundPost = posts.find((p) => p.txid === txid);
  }

  let i = posts.indexOf(foundPost);
  posts.unshift(posts.splice(i, 1)[0]);
  return posts;
}

async function getPostInfos(ownerAddress, topic, category, content) {
  // get query array
  const queryArray = buildQuery({
    address: ownerAddress,
    topic,
    category,
    content,
  });
  // itearte and post query in parallel for queryArray
  const resultsDefault = await arweave.api
    .post("/graphql", queryArray[0])
    .catch((err) => {
      console.error("GraphQL query failed");
      throw new Error(err);
    });
  const topicResults = await arweave.api
    .post("/graphql", queryArray[1])
    .catch((err) => {
      console.error("GraphQL query failed");
      throw new Error(err);
    });
  const categoryResults = await arweave.api
    .post("/graphql", queryArray[2])
    .catch((err) => {
      console.error("GraphQL query failed");
      throw new Error(err);
    });
  const contentResults = await arweave.api
    .post("/graphql", queryArray[3])
    .catch((err) => {
      console.error("GraphQL query failed");
      throw new Error(err);
    });

  let edges = [];
  edges = resultsDefault?.data?.data?.transactions?.edges || [];
  edges = edges.concat(topicResults?.data?.data?.transactions?.edges || []);
  edges = edges.concat(categoryResults?.data?.data?.transactions?.edges || []);
  edges = edges.concat(contentResults?.data?.data?.transactions?.edges || []);

  console.log(edges);
  return await delayResults(
    100,
    edges.map((edge) => createPostInfo(edge.node))
  );
}

const App = () => {
  const [isWalletConnected, setIsWalletConnected] = React.useState(false);
  const [postInfos, setPostInfos] = React.useState([]);
  const [isSearching, setIsSearching] = React.useState(false);
  async function waitForPost(txid) {
    setIsSearching(true);
    let posts = await waitForNewPosts(txid);
    setPostInfos(posts);
    setIsSearching(false);
  }
  React.useEffect(() => {
    setIsSearching(true);
    getPostInfos().then((posts) => {
      setPostInfos(posts);
      setIsSearching(false);
    });
  }, []);

  return (
    <div id="app">
      <div id="content">
        <aside className="flex flex-row justify-around pt-2">
          <Navigation />
          <WalletSelectButton
            setIsConnected={() => setIsWalletConnected(true)}
          />
          {/* <ProfileButton isWalletConnected={isWalletConnected} /> */}
        </aside>
        <main>
          <Routes>
            <Route
              path="/"
              name="home"
              element={
                <Home
                  isWalletConnected={isWalletConnected}
                  isSearching={isSearching}
                  postInfos={postInfos}
                  onPostMessage={waitForPost}
                />
              }
            />
            <Route path="/search" element={<Topics />}>
              <Route path="/search/" element={<TopicSearch />} />
              <Route path=":topic" element={<TopicResults />} />
            </Route>
            <Route path="/creators" element={<Users />}>
              <Route path="/creators/" element={<UserSearch />} />
              <Route path=":addr" element={<UserResults />} />
            </Route>
          </Routes>
        </main>
      </div>
    </div>
  );
};

const Home = (props) => {
  return (
    <>
      <header>Home</header>
      <NewPost
        isLoggedIn={props.isWalletConnected}
        onPostMessage={props.onPostMessage}
      />
      {props.isSearching && <ProgressSpinner />}
      <Posts postInfos={props.postInfos} />

      {/* <h1 className="text-3xl font-bold underline text-red-600">
        Hello world!
      </h1> */}
    </>
  );
};

const Topics = (props) => {
  return (
    <>
      <header>Search image</header>
      <Outlet />
    </>
  );
};

const Users = () => {
  return (
    <>
      <header>Creators</header>
      <Outlet />
    </>
  );
};

const TopicResults = () => {
  const [topicPostInfos, setTopicPostInfos] = React.useState([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const { topic } = useParams();
  // const location = useLocation();
  // const queryParams = new URLSearchParams(location.search);
  // // Access specific query parameters
  // const tagName = queryParams.get("tagName");
  // const tagValue = queryParams.get("tagValue");

  const navigate = useNavigate();

  const onTopicSearch = (topic) => {
    navigate(`/search/${topic}`);
  };

  React.useEffect(() => {
    setIsSearching(true);
    setTopicPostInfos([]);
    try {
      getPostInfos(null, topic, topic, topic).then((posts) => {
        setTopicPostInfos(posts);
        setIsSearching(false);
      });
    } catch (error) {
      console.logErrorg(error);
      setIsSearching(false);
    }
  }, [topic]);
  return (
    <>
      <TopicSearch searchInput={topic} onSearch={onTopicSearch} />
      {isSearching && <ProgressSpinner />}
      <Posts postInfos={topicPostInfos} />
    </>
  );
};

function UserResults() {
  const [userPostInfos, setUserPostInfos] = React.useState([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const { addr } = useParams();
  const navigate = useNavigate();

  const onUserSearch = (address) => {
    navigate(`/creators/${address}`);
  };

  React.useEffect(() => {
    setIsSearching(true);
    try {
      getPostInfos(addr).then((posts) => {
        setUserPostInfos(posts);
        setIsSearching(false);
      });
    } catch (error) {
      console.logErrorg(error);
      setIsSearching(false);
    }
  }, [addr]);
  return (
    <>
      <UserSearch searchInput={addr} onSearch={onUserSearch} />
      {isSearching && <ProgressSpinner />}
      <Posts postInfos={userPostInfos} />
    </>
  );
}

export default App;
