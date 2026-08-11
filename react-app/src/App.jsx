import { useEffect, useState } from "react";
import Home from "./Home.jsx";
import Chat from "./Chat.jsx";

function getRoute() {
  return window.location.hash.startsWith("#/chat") ? "chat" : "home";
}

export default function App() {
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const onHash = () => setRoute(getRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return route === "chat" ? (
    <Chat onHome={() => { window.location.hash = "#/"; }} />
  ) : (
    <Home onChat={() => { window.location.hash = "#/chat"; }} />
  );
}
