export type Computer = {
  id: string;
  row: number;
  col: number;
};

export type Label = {
  rowStart: number;
  rowEnd: number;
  colStart: number;
  colEnd: number;
  content: string;
};

export const WIDTH = 90;
export const HEIGHT = 60;
