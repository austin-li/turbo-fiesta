import { useEffect, useRef, useState } from "react";
import { ComputerBox } from "./components/ComputerBox";
import styles from "./styles.module.css";
import { Computer, HEIGHT, Label, WIDTH } from "./types";
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
    response: string;
  };
};
type QueueMessage = {
  serial_num: string;
  id: number;
};
type Message = {
  computers: ComputersMessage;
  queue: QueueMessage[];
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

  const [queue, setQueue] = useState<QueueMessage[]>([]);

  useEffect(() => {
    let ws: WebSocket;
    function connect() {
      ws = new WebSocket(WS_URL);
      ws.addEventListener("message", (e) => {
        const { computers, queue }: Message = JSON.parse(e.data);
        setComputerStatuses(computers);
        setQueue(queue);
      });
      ws.addEventListener("close", connect);
    }
    connect();
    return () => {
      ws.removeEventListener("close", connect);
      ws.close();
    };
  }, []);

  const games = new Set(
    Object.values(computerStatuses).flatMap((status) => status.games)
  );

  return (
    <div className={styles.columns}>
      <aside className={styles.sidebar}>
        <h2>Queue</h2>
        {queue.length > 0 ? (
          <ul>
            {queue.map(({ id, serial_num }) => (
              <li className={styles.queueEntry} key={id}>
                <div className={styles.id}>
                  {(id % 100).toString().padStart(2, "0")}
                </div>
                <div className={styles.sn}>{serial_num}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p>The queue is empty right now.</p>
        )}
        <h2>Games</h2>
        {games.size > 0 ? (
          <ul>
            {[...games].sort().map((game) => (
              <li key={game}>{game}</li>
            ))}
          </ul>
        ) : (
          <p>No games playing right now.</p>
        )}
      </aside>
      <main className={styles.main}>
        <h2 className={styles.heading}>Manage layout</h2>
        <div
          className={styles.computers}
          style={{
            "--rows": rows,
            "--cols": cols,
          }}
          onDoubleClick={(e) => {
            if (e.target !== e.currentTarget) {
              return;
            }
            e.preventDefault();
            const rect = e.currentTarget.getBoundingClientRect();
            const row = Math.floor((e.clientY - rect.top) / HEIGHT);
            const col = Math.floor((e.clientX - rect.left) / WIDTH);
            if (
              !computers.find(
                (computer) => computer.row === row && computer.col === col
              )
            ) {
              setComputers([
                ...computers,
                {
                  row,
                  col,
                  name: `PC ${computers.length + 1}`,
                  id: Math.random(),
                },
              ]);
            }
          }}
        >
          {computers.map(({ row, col, name, id }, i) => {
            const status = computerStatuses[name];
            return (
              <ComputerBox
                name={name}
                onRename={(name) => {
                  setComputers(computers.with(i, { row, col, name, id }));
                }}
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
                        ? { row: newRow, col: newCol, name, id }
                        : // Swap with existing computer
                          computer.row === newRow && computer.col === newCol
                          ? { row, col, name: computer.name, id }
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
                isBad={!!status?.response.includes("<PROHIBITED>")}
                summary={
                  status?.response.replace(/ *<[A-Z]+>/g, "") || undefined
                }
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
          <LabelBox
            content={labelRight}
            onChange={setLabelRight}
            side="right"
          />
        </div>
      </main>
    </div>
  );
}
