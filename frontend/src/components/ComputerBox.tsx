import { CSSProperties, PointerEvent, useRef, useState } from "react";
import styles from "../styles.module.css";

type DragState = {
  pointerId: number;
  rect: DOMRect;
  offsetX: number;
  offsetY: number;
};

export type ComputerBoxProps = {
  name: string;
  onDrop: (row: number, col: number) => void;
  style?: CSSProperties;
};

export function ComputerBox({ name, onDrop, style }: ComputerBoxProps) {
  const dragState = useRef<DragState | null>(null);
  const [dragging, setDragging] = useState(false);

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragState.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      dragState.current = {
        pointerId: e.pointerId,
        rect,
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
    if (dragState.current?.pointerId === e.pointerId) {
      e.currentTarget.style.left = `${e.clientX - dragState.current.offsetX}px`;
      e.currentTarget.style.top = `${e.clientY - dragState.current.offsetY}px`;
    }
  };
  const handlePointerEnd = (e: PointerEvent<HTMLDivElement>) => {
    const state = dragState.current;
    if (state?.pointerId === e.pointerId) {
      dragState.current = null;
      setDragging(false);

      e.currentTarget.style.left = "";
      e.currentTarget.style.top = "";
      e.currentTarget.style.width = "";
      e.currentTarget.style.height = "";

      if (e.type === "pointercancel") {
        return;
      }
      const parent = e.currentTarget.parentElement?.getBoundingClientRect();
      if (!parent) {
        return;
      }
      onDrop(
        Math.floor((e.clientY - parent.top) / 40),
        Math.floor((e.clientX - parent.left) / 60)
      );
    }
  };

  return (
    <div
      className={`${styles.computer} ${dragging ? styles.dragging : ""}`}
      style={style}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    >
      {name}
    </div>
  );
}
