/* eslint-disable prefer-const */
import { SearchGroup, SearchCondition } from '@src/types/boolean-serach';
import { and, or, not, like, eq, select } from 'sql-bricks';
import logger from './logger';
import { BooleanSearchFieldException } from '@src/interceptors/exception.interceptor';

class SearchExpressionParser {
  private pos: number = 0;
  private tokens: string[] = [];

  parse(expression: string): SearchGroup {
    this.tokenize(expression);
    return this.parseGroup();
  }

  private tokenize(expression: string): void {
    this.tokens = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < expression.length; i++) {
      const char = expression[i];

      if (char === '"') {
        inQuotes = !inQuotes;
        continue;
      }

      if (!inQuotes && (char === '(' || char === ')')) {
        if (current.trim()) {
          this.tokens.push(current.trim());
        }
        this.tokens.push(char);
        current = '';
        continue;
      }

      if (!inQuotes && char === ' ' && current.trim()) {
        this.tokens.push(current.trim());
        current = '';
        continue;
      }

      if (char !== ' ' || inQuotes) {
        current += char;
      }
    }

    if (current.trim()) {
      this.tokens.push(current.trim());
    }

    this.pos = 0;
  }

  private parseGroup(): SearchGroup {
    const items: (SearchCondition | SearchGroup)[] = [];
    let currentOp: 'AND' | 'OR' = 'AND';
    let isNot = false;

    while (this.pos < this.tokens.length) {
      const token = this.tokens[this.pos];

      if (token === '(') {
        this.pos++;
        const group = this.parseGroup();
        items.push(group);
      } else if (token === ')') {
        this.pos++;
        break;
      } else if (token === 'AND' || token === 'OR') {
        currentOp = token as 'AND' | 'OR';
        this.pos++;
      } else if (token === 'NOT') {
        isNot = true;
        this.pos++;
      } else if (token.includes(':')) {
        let [field, value] = token.split(':');
        const hasFieldNot = field.includes('NOT');
        field = field.replace('NOT', '').trim();

        const condition: SearchCondition = {
          field,
          operator:
            isNot || hasFieldNot
              ? value.includes('*')
                ? 'NOT LIKE'
                : 'NOT'
              : value.includes('*')
                ? 'LIKE'
                : '=',
          value: value.replace(/^\"|\"$/g, ''),
        };

        items.push(condition);
        this.pos++;
        isNot = false;
      } else {
        this.pos++;
      }
    }

    return {
      op: currentOp,
      items,
    };
  }

  toSqlBricks(searchGroup: SearchGroup, implementedFeilds: Record<string, string | string[]>): any {
    return this.buildSqlBricksExpression(searchGroup, implementedFeilds);
  }

  private buildSqlBricksExpression(
    group: SearchGroup | SearchCondition,
    implementedFeilds: Record<string, string | string[]>
  ): any {
    if ('field' in group) {
      const fieldName = implementedFeilds[group.field];
      const value = group.value.toLowerCase();

      // Create the LOWER() wrapper for the field
      // check if this value can be lowercased or not (if it is a number or boolean or date it should not be lowercased)
      let lowerField: string;
      if (!implementedFeilds['NO_CASE_VALS'].includes(group.field)) {
        lowerField = `LOWER(${fieldName})`;
      } else {
        lowerField = fieldName as string;
      }

      switch (group.operator) {
        case 'LIKE':
          return like(lowerField, value.replace(/\*/g, '%'));
        case 'NOT LIKE':
          return not(like(lowerField, value.replace(/\*/g, '%')));
        case 'NOT':
          return not(eq(lowerField, value));
        default:
          return eq(lowerField, value);
      }
    }

    if (group.op === 'NOT') {
      return not(this.buildSqlBricksExpression(group.items[0], implementedFeilds));
    }

    const expressions = group.items.map((item) =>
      this.buildSqlBricksExpression(item, implementedFeilds)
    );
    return group.op === 'AND' ? and(...expressions) : or(...expressions);
  }

  public getBooleanSearchSql(
    keyword: string,
    mainTable: string,
    implementedFeilds: Record<string, string | string[]>
  ): { query: string; whereCondition: string } {
    const parser = new SearchExpressionParser();
    const parsedJson = parser.parse(keyword);
    const isValid = this.validateFeilds(parsedJson, implementedFeilds);
    if (!isValid) {
      logger.error({ message: 'Invalid search fields' });
    }
    const sqlBricksExpr = parser.toSqlBricks(parsedJson, implementedFeilds);
    const query = select().from(mainTable).where(sqlBricksExpr).toString();
    const whereCondition = query.split('WHERE')[1];

    if (whereCondition) {
      const regex = /^\(.*\)$/;

      if (!regex.test(whereCondition)) {
        return { query, whereCondition: `(${whereCondition})` };
      }
    }
    return { query, whereCondition };
  }

  private validateFeilds(
    parsedJson: SearchGroup,
    implementedFeilds: Record<string, string | string[]>
  ): boolean {
    const validFields = Object.keys(implementedFeilds);
    const extractedFields = this.parsedFeilds(parsedJson);
    for (const field of extractedFields) {
      if (!validFields.includes(field)) {
        throw new BooleanSearchFieldException(`Field name ${field} is not implemented`);
      }
    }
    return true;
  }

  public parsedFeilds(obj: any) {
    let fields = [];
    if (obj.field) {
      fields.push(obj.field);
    }
    if (Array.isArray(obj.items)) {
      obj.items.forEach((item) => {
        fields = fields.concat(this.parsedFeilds(item));
      });
    }

    return fields;
  }
}

export { SearchExpressionParser };
