import { useState } from "react";
import { ComputerBox } from "./components/ComputerBox";
import styles from "./styles.module.css";
import { Computer, Label } from "./types";
import { LabelBox } from "./components/LabelBox";

export type AppProps = {
  initComputers?: Computer[];
  initLabels?: Label[];
};
export function App({ initComputers = [], initLabels = [] }: AppProps) {
  const [rows, setRows] = useState(11);
  const [cols, setCols] = useState(8);
  const [computers, setComputers] = useState(initComputers);
  const [labels, setLabels] = useState(initLabels);

  return (
    <main className={styles.main}>
      <div
        className={styles.computers}
        style={{
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
        }}
      >
        {computers.map(({ row, col, id }) => (
          <ComputerBox
            name={id}
            style={{ gridArea: `${row + 1} / ${col + 1}` }}
            key={id}
          />
        ))}
        {labels.map(({ content, rowStart, rowEnd, colStart, colEnd }, i) => (
          <LabelBox
            content={content}
            style={{
              gridArea: `${rowStart + 1} / ${colStart + 1} / ${rowEnd + 1} / ${
                colEnd + 1
              }`,
            }}
            key={i}
          />
        ))}
      </div>
    </main>
  );
}
