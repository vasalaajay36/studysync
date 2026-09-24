import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Tasks from "./components/Tasks";
import Subjects from "./components/Subjects";
import StudySessions from "./components/StudySessions";
import CodingPlatforms from "./components/CodingPlatforms";

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
