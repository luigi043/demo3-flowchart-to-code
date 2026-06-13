import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Reset default browser styles
const style = document.createElement("style");
style.textContent = `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { overflow: hidden; }`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
