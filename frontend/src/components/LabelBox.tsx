import { CSSProperties } from "react";
import styles from "../styles.module.css";

export type LabelBoxProps = {
  content: string;
  onChange: (content: string) => void;
  style?: CSSProperties;
};

export function LabelBox({ content, onChange, style }: LabelBoxProps) {
  return (
    <input
      className={styles.label}
      style={style}
      value={content}
      onChange={(e) => onChange(e.currentTarget.value)}
    />
  );
}
