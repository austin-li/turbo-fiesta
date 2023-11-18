import { CSSProperties } from "react";
import styles from "../styles.module.css";

export type ComputerBoxProps = {
  name: string;
  style?: CSSProperties;
};

export function ComputerBox({ name, style }: ComputerBoxProps) {
  return (
    <div className={styles.computer} style={style}>
      {name}
    </div>
  );
}
