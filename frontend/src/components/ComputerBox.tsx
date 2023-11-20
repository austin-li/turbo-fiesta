import { CSSProperties, PointerEvent, useRef, useState } from "react";
import styles from "../styles.module.css";
import { HEIGHT, WIDTH } from "../types";

export type Status =
  | { type: "offline" }
  | { type: "idle"; time: number }
  | { type: "used"; time: number };

type DragState = {
  pointerId: number;
  rect: DOMRect;
  dragging: boolean;
  initX: number;
  initY: number;
  offsetX: number;
  offsetY: number;
};

export type ComputerBoxProps = {
  name: string;
  onRename: (name: string) => void;
  onDrop: (row: number, col: number) => void;
  status: Status;
  games: string[];
  isBad: boolean;
  summary?: string;
  style?: CSSProperties;
};

export function ComputerBox({
  name,
  onRename,
  onDrop,
  status,
  games,
  isBad,
  summary,
  style,
}: ComputerBoxProps) {
  const dragState = useRef<DragState | null>(null);
  const [dragging, setDragging] = useState(false);

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLInputElement) {
      return;
    }
    if (!dragState.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      dragState.current = {
        pointerId: e.pointerId,
        rect,
        dragging: true,
        initX: e.clientX,
        initY: e.clientY,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
      };
      setDragging(true);
      e.currentTarget.setPointerCapture(e.pointerId);
      e.currentTarget.style.width = `${dragState.current.rect.width}px`;
      e.currentTarget.style.height = `${dragState.current.rect.height}px`;
    }
    handlePointerMove(e);
  };
  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.parentElement) {
      return;
    }
    if (dragState.current?.pointerId === e.pointerId) {
      // if (!dragState.current.dragging) {
      //   if (Math.hypot(e.clientX - e.initX));
      // }
      if (dragState.current.dragging) {
        e.currentTarget.parentElement.style.left = `${
          e.clientX - dragState.current.offsetX
        }px`;
        e.currentTarget.parentElement.style.top = `${
          e.clientY - dragState.current.offsetY
        }px`;
      }
    }
  };
  const handlePointerEnd = (e: PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.parentElement) {
      return;
    }
    const state = dragState.current;
    if (state?.pointerId === e.pointerId) {
      dragState.current = null;
      setDragging(false);

      e.currentTarget.parentElement.style.left = "";
      e.currentTarget.parentElement.style.top = "";
      e.currentTarget.style.width = "";
      e.currentTarget.style.height = "";

      if (e.type === "pointercancel") {
        return;
      }
      const parent =
        e.currentTarget.parentElement.parentElement?.getBoundingClientRect();
      if (!parent) {
        return;
      }
      onDrop(
        Math.floor(
          (e.clientY - state.offsetY + state.rect.height / 2 - parent.top) /
            HEIGHT
        ),
        Math.floor(
          (e.clientX - state.offsetX + state.rect.width / 2 - parent.left) /
            WIDTH
        )
      );
    }
  };

  return (
    <div
      className={`${styles.computerWrapper} ${dragging ? styles.dragging : ""}`}
      style={style}
    >
      <div
        className={styles.computer}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <input
          className={styles.name}
          value={name}
          onChange={(e) => onRename(e.currentTarget.value)}
          disabled={dragging}
        />
        <div
          className={`${styles.status} ${
            status.type === "used" ? styles.inUse : ""
          }`}
        >
          {status.type === "used"
            ? `In use (${status.time}s)`
            : status.type === "idle"
              ? `Idle (${status.time}s)`
              : "Offline"}
        </div>
        {isBad && <span className={styles.bad}>⚠️</span>}
      </div>
      {games.length > 0 && (
        <div className={`${styles.popup} ${styles.gamesWrapper}`}>
          <div className={styles.games}>
            <h2 className={styles.gamesHeading}>Games</h2>
            {games.map((game) => (
              <div className={styles.game} key={game}>
                {game}
              </div>
            ))}
          </div>
        </div>
      )}
      {summary !== undefined && (
        <div className={`${styles.popup} ${styles.summaryWrapper}`}>
          <div className={styles.summary}>{summary}</div>
        </div>
      )}
    </div>
  );
}
