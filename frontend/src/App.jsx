import { useEffect, useState } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Tasks from "./components/Tasks";
import Subjects from "./components/Subjects";
import StudySessions from "./components/StudySessions";
import CodingPlatforms from "./components/CodingPlatforms";
import StudyTimer from "./components/StudyTimer";

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

  const requestInit = isApiRequest
    ? { ...init, credentials: "include" }
    : init;

  return nativeFetch(input, requestInit).then((response) => {
    if (
      isApiRequest &&
      response.status === 401 &&
      !new URL(requestUrl, window.location.origin).pathname.startsWith("/api/auth/") &&
      window.location.pathname !== "/"
    ) {
      localStorage.removeItem("student");
      window.location.assign("/");
    }
    return response;
  });
};

function ProtectedPage({ children }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let active = true;

    fetch("/api/auth/me")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("unauthenticated");
        }

        const student = await response.json();
        if (active) {
          localStorage.setItem("student", JSON.stringify(student));
          setStatus("authenticated");
        }
      })
      .catch(() => {
        localStorage.removeItem("student");
        if (active) {
          window.location.replace("/");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (status !== "authenticated") {
    return (
      <main style={{ padding: "3rem", textAlign: "center" }}>
        Checking your StudySync session...
      </main>
    );
  }

  return (
    <>
      {children}
      <StudyTimer />
    </>
  );
}

function App() {
  const path = window.location.pathname;

  if (path === "/dashboard") {
    return <ProtectedPage><Dashboard /></ProtectedPage>;
  }
  if (path === "/tasks") {
    return <ProtectedPage><Tasks /></ProtectedPage>;
  }
  if (path === "/subjects") {
    return <ProtectedPage><Subjects /></ProtectedPage>;
  }
  if (path === "/study-sessions") {
    return <ProtectedPage><StudySessions /></ProtectedPage>;
  }
  if (path === "/coding-platforms") {
    return <ProtectedPage><CodingPlatforms /></ProtectedPage>;
  }

  return <Login />;
}

export default App;
