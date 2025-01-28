export class DateConstants {
  static todayMinDate(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  static todayExample: string = new Date().toISOString().substring(0, 10);
}
