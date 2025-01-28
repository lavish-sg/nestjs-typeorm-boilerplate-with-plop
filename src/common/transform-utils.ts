export class TransformUtils {
  static generateUserFriendlyId(prefix: string, id: number): string {
    const incrementalId = id.toString();
    return `${prefix}/${incrementalId}`;
  }
  static generateBidUserFriendlyId(id: number): string {
    const incrementalId = id.toString().padStart(2, '0');
    return incrementalId;
  }
}
