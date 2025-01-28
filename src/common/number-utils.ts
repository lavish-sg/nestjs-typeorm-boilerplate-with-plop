export class NumberUtils {
  static round(number: number, decimalPlaces: number): number {
    const factor = Math.pow(10, decimalPlaces < 0 ? 0 : decimalPlaces);
    return Math.round(number * factor) / factor;
  }
}
