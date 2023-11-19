import { CSSProperties } from "react";
import styles from "../styles.module.css";

export type Side = "top" | "bottom" | "left" | "right";
const other: Record<Side, Side> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

export type LabelBoxProps = {
  content: string;
  onChange: (content: string) => void;
  side: Side;
};

export function LabelBox({ content, onChange, side }: LabelBoxProps) {
  const vertical = side === "left" || side === "right";
  return (
    <div
      className={styles.label}
      style={{
        [side]: "unset",
        [other[side]]: "100%",
        flexDirection: vertical ? "column" : "row",
      }}
    >
      <input
        aria-label={`Label for ${side} wall`}
        className={styles.labelInput}
        placeholder=" "
        style={{
          writingMode: vertical ? "vertical-rl" : "horizontal-tb",
        }}
        value={content}
        onChange={(e) => onChange(e.currentTarget.value)}
      />
    </div>
  );
}
