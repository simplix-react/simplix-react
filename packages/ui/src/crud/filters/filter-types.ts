/** Search operators supported by searchable-jpa backend */
export enum SearchOperator {
  EQUALS = "equals",
  NOT_EQUALS = "notEquals",
  CONTAINS = "contains",
  NOT_CONTAINS = "notContains",
  STARTS_WITH = "startsWith",
  ENDS_WITH = "endsWith",
  GREATER_THAN = "greaterThan",
  LESS_THAN = "lessThan",
  GREATER_THAN_OR_EQUAL = "greaterThanOrEqualTo",
  LESS_THAN_OR_EQUAL = "lessThanOrEqualTo",
  IN = "in",
  NOT_IN = "notIn",
  BETWEEN = "between",
  NOT_BETWEEN = "notBetween",
  IS_NULL = "isNull",
  IS_NOT_NULL = "isNotNull",
  IS_TRUE = "isTrue",
  IS_FALSE = "isFalse",
}

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

/** Date operators that require range selection vs single date */
export const dateOperatorConfig: Record<string, { requiresRange: boolean }> = {
  [SearchOperator.EQUALS]: { requiresRange: false },
  [SearchOperator.NOT_EQUALS]: { requiresRange: false },
  [SearchOperator.GREATER_THAN]: { requiresRange: false },
  [SearchOperator.LESS_THAN]: { requiresRange: false },
  [SearchOperator.GREATER_THAN_OR_EQUAL]: { requiresRange: false },
  [SearchOperator.LESS_THAN_OR_EQUAL]: { requiresRange: false },
  [SearchOperator.BETWEEN]: { requiresRange: true },
  [SearchOperator.NOT_BETWEEN]: { requiresRange: true },
};

/** Select operators that allow multiple selection */
export const selectOperatorConfig: Record<string, { allowMultiple: boolean }> = {
  [SearchOperator.EQUALS]: { allowMultiple: false },
  [SearchOperator.NOT_EQUALS]: { allowMultiple: false },
  [SearchOperator.IN]: { allowMultiple: true },
  [SearchOperator.NOT_IN]: { allowMultiple: true },
};

/** Display order for text filter operators */
export const textOperatorOrder: SearchOperator[] = [
  SearchOperator.CONTAINS,
  SearchOperator.NOT_CONTAINS,
  SearchOperator.EQUALS,
  SearchOperator.NOT_EQUALS,
  SearchOperator.STARTS_WITH,
  SearchOperator.ENDS_WITH,
];

/** Display order for number filter operators */
export const numberOperatorOrder: SearchOperator[] = [
  SearchOperator.EQUALS,
  SearchOperator.NOT_EQUALS,
  SearchOperator.GREATER_THAN,
  SearchOperator.GREATER_THAN_OR_EQUAL,
  SearchOperator.LESS_THAN,
  SearchOperator.LESS_THAN_OR_EQUAL,
  SearchOperator.BETWEEN,
  SearchOperator.NOT_BETWEEN,
];
