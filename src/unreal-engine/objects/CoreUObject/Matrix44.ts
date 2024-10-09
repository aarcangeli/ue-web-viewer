import type { AssetReader } from "../../AssetReader";

export type ArrayType = [
  number, // M[0][0]
  number, // M[0][1]
  number, // M[0][2]
  number, // M[0][3]
  number, // M[1][0]
  number, // M[1][1]
  number, // M[1][2]
  number, // M[1][3]
  number, // M[2][0]
  number, // M[2][1]
  number, // M[2][2]
  number, // M[2][3]
  number, // M[3][0]
  number, // M[3][1]
  number, // M[3][2]
  number, // M[3][3]
];

/**
 * Four-dimensional matrix.
 *
 *  Matrix elements are accessed with M[RowIndex][ColumnIndex].
 */
export class FMatrix44 {
  matrix: ArrayType = new Array(16).fill(0) as ArrayType;

  constructor(matrix: ArrayType | undefined = undefined) {
    if (matrix) {
      this.matrix = matrix;
    }
  }

  static makeIdentity() {
    // prettier-ignore
    return new FMatrix44([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
  }

  static fromFloat(reader: AssetReader) {
    const matrix = new FMatrix44();
    for (let i = 0; i < 16; i++) {
      matrix.matrix[i] = reader.readFloat();
    }
    return matrix;
  }

  static fromDouble(reader: AssetReader) {
    const matrix = new FMatrix44();
    for (let i = 0; i < 16; i++) {
      matrix.matrix[i] = reader.readDouble();
    }
    return matrix;
  }

  /**
   * Get the value at the specified row and column.
   * @param row
   * @param col
   */
  get(row: number, col: number) {
    return this.matrix[row * 4 + col];
  }

  toString() {
    return `FMatrix44(\n${[
      this.matrix.slice(0, 4).join(", "),
      this.matrix.slice(4, 8).join(", "),
      this.matrix.slice(8, 12).join(", "),
      this.matrix.slice(12, 16).join(", "),
    ].join("\n")}\n)`;
  }
}
