import { useEffect, useRef, useState } from "react";
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

type ComputersMessage = {
  [seat: string]: {
    idle_count: number;
    use_count: number;
    games: string[];
  };
};
type Message = {
  computers: ComputersMessage;
  queue: {}[];
};

const WS_URL = `ws://${window.location.hostname}:3000/`;

export type AppProps = {
  initComputers?: Computer[];
};
export function App({ initComputers = [] }: AppProps) {
  const [rows, setRows] = useState(9);
  const [cols, setCols] = useState(8);
  const [computers, setComputers] = useState(initComputers);
  const [computerStatuses, setComputerStatuses] = useState<ComputersMessage>(
    {}
  );

  const [labelTop, setLabelTop] = useState("Garage");
  const [labelBottom, setLabelBottom] = useState("Cafe");
  const [labelLeft, setLabelLeft] = useState("");
  const [labelRight, setLabelRight] = useState("");

  useEffect(() => {
    let ws: WebSocket;
    function connect() {
      ws = new WebSocket(WS_URL);
      ws.addEventListener("message", (e) => {
        const { computers, queue }: Message = JSON.parse(e.data);
        setComputerStatuses(computers);
      });
      ws.addEventListener("close", connect);
    }
    connect();
    return () => {
      ws.removeEventListener("close", connect);
      ws.close();
    };
  }, []);

  return (
    <main className={styles.main}>
      <h2 className={styles.heading}>Manage layout</h2>
      <div
        className={styles.computers}
        style={{
          "--rows": rows,
          "--cols": cols,
        }}
        onDoubleClick={(e) => {
          e.preventDefault();
        }}
      >
        {computers.map(({ row, col, id }, i) => {
          const status = computerStatuses[id];
          return (
            <ComputerBox
              name={id}
              onDrop={(newRow, newCol) => {
                if (
                  newRow < 0 ||
                  newRow >= rows ||
                  newCol < 0 ||
                  newCol >= cols
                ) {
                  setComputers(computers.toSpliced(i, 1));
                  return;
                }
                setComputers(
                  computers.map((computer, index) =>
                    index === i
                      ? { row: newRow, col: newCol, id }
                      : // Swap with existing computer
                        computer.row === newRow && computer.col === newCol
                        ? { row, col, id: computer.id }
                        : computer
                  )
                );
              }}
              status={
                status
                  ? status.idle_count > 0
                    ? { type: "idle", time: status.idle_count }
                    : { type: "used", time: status.use_count }
                  : { type: "offline" }
              }
              games={status?.games ?? []}
              style={{ gridArea: `${row + 1} / ${col + 1}` }}
              key={id}
            />
          );
        })}
        <LabelBox content={labelTop} onChange={setLabelTop} side="top" />
        <LabelBox
          content={labelBottom}
          onChange={setLabelBottom}
          side="bottom"
        />
        <LabelBox content={labelLeft} onChange={setLabelLeft} side="left" />
        <LabelBox content={labelRight} onChange={setLabelRight} side="right" />
      </div>
    </main>
  );
}
