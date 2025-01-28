import { NumberUtils } from '../number-utils';

describe('NumberUtils', () => {
  describe('round', () => {
    it('should correctly round numbers according to provided decimal places', () => {
      expect(NumberUtils.round(123.2123, 0)).toBe(123);
      expect(NumberUtils.round(123.2123, 1)).toBe(123.2);
      expect(NumberUtils.round(123.2123, 2)).toBe(123.21);
      expect(NumberUtils.round(123.2123, 5)).toBe(123.2123);
      expect(NumberUtils.round(123, 2)).toBe(123.0);
      expect(NumberUtils.round(123, -1)).toBe(123);
    });
  });
});
