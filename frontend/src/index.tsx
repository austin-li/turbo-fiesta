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
      id: `${String.fromCodePoint(A + i)}${j + 1}`,
      row,
      col: j,
    });
  }
}
for (let i = 0; i < 4; i++) {
  computers.push({
    id: `E${i + 1}`,
    row: 7 - i * 2,
    col: 7,
  });
}
computers.push({
  id: `hello`,
  row: 0,
  col: 7,
});

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <App initComputers={computers} />
  </StrictMode>
);
