export { SearchCondition, SearchGroup };

interface SearchCondition {
  field: string;
  operator: string; // '=' | 'LIKE' | 'NOT' | 'NOT LIKE'
  value: string;
}

interface SearchGroup {
  op: 'AND' | 'OR' | 'NOT';
  items: (SearchCondition | SearchGroup)[];
}
