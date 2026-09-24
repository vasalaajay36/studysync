import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Tasks from "./components/Tasks";
import Subjects from "./components/Subjects";
import StudySessions from "./components/StudySessions";
import CodingPlatforms from "./components/CodingPlatforms";

// Keep the server-side JSESSIONID attached to every Spring Boot API request.
// The backend scopes tasks, subjects, sessions and coding profiles to the
// authenticated student, so all React screens must send the session cookie.
const nativeFetch = window.fetch.bind(window);

window.fetch = (input, init = {}) => {
  const url =
    typeof input === "string"
      ? input
      : input instanceof Request
      ? input.url
      : "";

  if (url.startsWith("http://localhost:8080/api/")) {
    return nativeFetch(input, {
      ...init,
      credentials: "include",
    });
  }

  return nativeFetch(input, init);
};

function App() {
  const path = window.location.pathname;

  if (path === "/dashboard") {
    return <Dashboard />;
  }

  if (path === "/tasks") {
    return <Tasks />;
  }

  if (path === "/subjects") {
    return <Subjects />;
  }

  if (path === "/study-sessions") {
    return <StudySessions />;
  }

  if (path === "/coding-platforms") {
    return <CodingPlatforms />;
  }

  return <Login />;
}

export default App;
