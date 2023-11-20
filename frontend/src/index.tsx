import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./global.css";
import { Computer } from "./types";

const A = "A".codePointAt(0) ?? -1;
const computers: Computer[] = [];
for (let i = 0; i < 4; i++) {
  const row = 7 - i * 2;
  for (let j = 0; j < (i < 2 ? 5 : 6); j++) {
    computers.push({
      name: `${String.fromCodePoint(A + i)}${j + 1}`,
      row,
      col: j,
      id: Math.random(),
    });
  }
}
for (let i = 0; i < 4; i++) {
  computers.push({
    name: `E${i + 1}`,
    row: 7 - i * 2,
    col: 7,
    id: Math.random(),
  });
}

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <App initComputers={computers} />
  </StrictMode>
);
