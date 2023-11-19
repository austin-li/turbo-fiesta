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
  style?: CSSProperties;
};

export function LabelBox({
  content,
  onChange,
  side,
  style = {},
}: LabelBoxProps) {
  return (
    <input
      className={styles.label}
      placeholder=" "
      style={{
        ...style,
        [side]: "unset",
        [other[side]]: "100%",
        writingMode:
          side === "left" || side === "right" ? "vertical-rl" : "sideways-lr",
      }}
      value={content}
      onChange={(e) => onChange(e.currentTarget.value)}
    />
  );
}
