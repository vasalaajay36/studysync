import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Tasks from "./components/Tasks";
import Subjects from "./components/Subjects";
import StudySessions from "./components/StudySessions";
import CodingPlatforms from "./components/CodingPlatforms";

// Keep the server-side session cookie attached to every same-origin API request.
// The Vite proxy sends /api requests to Spring Boot during local development.
const nativeFetch = window.fetch.bind(window);
window.fetch = (input, init = {}) => {
  const requestUrl = input instanceof Request ? input.url : String(input);
  let isApiRequest = false;
  try {
    isApiRequest = new URL(requestUrl, window.location.origin).pathname.startsWith("/api/");
  } catch {
    // Let fetch report malformed URLs normally.
  }

  return nativeFetch(input, isApiRequest
    ? { ...init, credentials: "include" }
    : init);
};

function App() {
  const path = window.location.pathname;

  if (path === "/dashboard") return <Dashboard />;
  if (path === "/tasks") return <Tasks />;
  if (path === "/subjects") return <Subjects />;
  if (path === "/study-sessions") return <StudySessions />;
  if (path === "/coding-platforms") return <CodingPlatforms />;

  return <Login />;
}

export default App;
