import { TransformUtils } from '../transform-utils';

describe('TransformUtils', () => {
  describe('generateUserFriendlyId', () => {
    it('should correctly pad numbers less than 4 digits', () => {
      expect(TransformUtils.generateUserFriendlyId('R', 1)).toBe('R0001');
      expect(TransformUtils.generateUserFriendlyId('R', 12)).toBe('R0012');
      expect(TransformUtils.generateUserFriendlyId('R', 123)).toBe('R0123');
    });

    it('should not pad numbers with 4 or more digits', () => {
      expect(TransformUtils.generateUserFriendlyId('R', 1234)).toBe('R1234');
      expect(TransformUtils.generateUserFriendlyId('R', 12345)).toBe('R12345');
      expect(TransformUtils.generateUserFriendlyId('R', 123456789)).toBe('R123456789');
    });

    it('should handle different prefixes correctly', () => {
      expect(TransformUtils.generateUserFriendlyId('B', 56)).toBe('B0056');
      expect(TransformUtils.generateUserFriendlyId('U', 78)).toBe('U0078');
    });
  });
});
