function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

const PREFIX = "(?:(?=\\p{Lu})|\\b)";

export class PatternQuery {
  private readonly query: string;
  private readonly regex: RegExp;

  constructor(query: string) {
    this.query = query.toLowerCase();
    let queryInsensitive = PREFIX;
    for (let i = 0; i < query.length; i++) {
      const upper = query[i].toUpperCase();
      const lower = query[i].toLowerCase();
      if (upper !== lower) {
        queryInsensitive += `[${escapeRegExp(upper + lower)}]`;
      } else {
        queryInsensitive += lower;
      }
    }
    this.regex = new RegExp(queryInsensitive, "u");
  }

  /**
   * Check if the value matches the query.
   * @param value
   */
  match(value: string) {
    return value.match(this.regex) !== null;
  }

  /**
   * Split the value into parts based on the query.
   * Even parts are the parts that match the query.
   * Odd parts are the parts that don't match the query.
   */
  splitParts(value: string): string[] {
    const match = value.match(this.regex);
    if (match && match.index !== undefined) {
      return [
        value.substring(0, match.index),
        value.substring(match.index, match.index + this.query.length),
        value.substring(match.index + this.query.length),
      ];
    } else {
      return [value];
    }
  }
}
