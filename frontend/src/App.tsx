import { useState } from "react";
import { ComputerBox } from "./components/ComputerBox";
import styles from "./styles.module.css";
import { Computer, Label } from "./types";
import { LabelBox } from "./components/LabelBox";

// https://stackoverflow.com/a/70398145
declare module "react" {
  interface CSSProperties {
    [key: `--${string}`]: string | number;
  }
}

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
          "--rows": rows,
          "--cols": cols,
        }}
      >
        {computers.map(({ row, col, id }, i) => (
          <ComputerBox
            name={id}
            onDrop={(row, col) =>
              setComputers(computers.with(i, { row, col, id }))
            }
            style={{ gridArea: `${row + 1} / ${col + 1}` }}
            key={id}
          />
        ))}
        {labels.map(({ content, rowStart, rowEnd, colStart, colEnd }, i) => (
          <LabelBox
            content={content}
            onChange={(content) =>
              setLabels(
                labels.with(i, { content, rowStart, rowEnd, colStart, colEnd })
              )
            }
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
