import type { ComponentType } from "react";

import {
  EqualsIcon,
  NotEqualsIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  GreaterThanIcon,
  LessThanIcon,
  GreaterThanOrEqualIcon,
  LessThanOrEqualIcon,
  BracketsSquareIcon,
  IntersectIcon,
  ExcludeIcon,
  CheckIcon,
  XIcon,
} from "../shared/icons";
import { SearchOperator } from "./filter-types";

export interface OperatorMeta {
  icon: ComponentType<{ className?: string }>;
  symbol: string;
  labelKey: string;
}

export const operatorConfig: Record<SearchOperator, OperatorMeta> = {
  [SearchOperator.EQUALS]: { icon: EqualsIcon, symbol: "=", labelKey: "operator.equals" },
  [SearchOperator.NOT_EQUALS]: { icon: NotEqualsIcon, symbol: "\u2260", labelKey: "operator.notEquals" },
  [SearchOperator.CONTAINS]: { icon: TextAlignLeftIcon, symbol: "\u220B", labelKey: "operator.contains" },
  [SearchOperator.NOT_CONTAINS]: { icon: ExcludeIcon, symbol: "\u220C", labelKey: "operator.notContains" },
  [SearchOperator.STARTS_WITH]: { icon: TextAlignLeftIcon, symbol: "^", labelKey: "operator.startsWith" },
  [SearchOperator.ENDS_WITH]: { icon: TextAlignRightIcon, symbol: "$", labelKey: "operator.endsWith" },
  [SearchOperator.GREATER_THAN]: { icon: GreaterThanIcon, symbol: ">", labelKey: "operator.greaterThan" },
  [SearchOperator.LESS_THAN]: { icon: LessThanIcon, symbol: "<", labelKey: "operator.lessThan" },
  [SearchOperator.GREATER_THAN_OR_EQUAL]: { icon: GreaterThanOrEqualIcon, symbol: "\u2265", labelKey: "operator.greaterOrEqual" },
  [SearchOperator.LESS_THAN_OR_EQUAL]: { icon: LessThanOrEqualIcon, symbol: "\u2264", labelKey: "operator.lessOrEqual" },
  [SearchOperator.IN]: { icon: BracketsSquareIcon, symbol: "\u2208", labelKey: "operator.in" },
  [SearchOperator.NOT_IN]: { icon: ExcludeIcon, symbol: "\u2209", labelKey: "operator.notIn" },
  [SearchOperator.BETWEEN]: { icon: IntersectIcon, symbol: "\u2194", labelKey: "operator.between" },
  [SearchOperator.NOT_BETWEEN]: { icon: ExcludeIcon, symbol: "\u21AE", labelKey: "operator.notBetween" },
  [SearchOperator.IS_NULL]: { icon: XIcon, symbol: "\u2205", labelKey: "operator.isEmpty" },
  [SearchOperator.IS_NOT_NULL]: { icon: CheckIcon, symbol: "\u2203", labelKey: "operator.isNotEmpty" },
  [SearchOperator.IS_TRUE]: { icon: CheckIcon, symbol: "\u2713", labelKey: "operator.isTrue" },
  [SearchOperator.IS_FALSE]: { icon: XIcon, symbol: "\u2717", labelKey: "operator.isFalse" },
};
