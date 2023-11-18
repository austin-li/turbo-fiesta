import { CSSProperties } from "react";
import styles from "../styles.module.css";

export type LabelBoxProps = {
  content: string;
  style?: CSSProperties;
};

export function LabelBox({ content, style }: LabelBoxProps) {
  return (
    <textarea className={styles.label} style={style} value={content}></textarea>
  );
}
