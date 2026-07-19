// Self-registration of the built-in en/ko/ja locale bundles.
import "./locales";

// ── Theme ──
export * from "./theme";

// ── Layout primitives ──
export {
  Card,
  cardVariants,
  Container,
  Flex,
  Grid,
  Heading,
  headingVariants,
  Section,
  Stack,
  stackVariants,
  Text,
  textVariants,
} from "./primitives";
export type {
  CardProps,
  CardVariants,
  ContainerProps,
  ContainerSize,
  FlexProps,
  GridProps,
  GridColumns,
  GridGap,
  HeadingProps,
  HeadingVariants,
  SectionProps,
  StackProps,
  StackVariants,
  TextProps,
  TextVariants,
} from "./primitives";

// ── Controls ──
export * from "./controls";

// ── Overlays (sheet-first) ──
export * from "./overlays";

// ── Navigation & inputs ──
export * from "./inputs";

// ── Page skeletons ──
export * from "./screen";

// ── List grammar ──
export * from "./entity-list";

// ── Field namespaces (same consumption shape as the web kit) ──
export * as FormFields from "./form-fields";
export * as DetailFields from "./detail-fields";

// ── Utilities ──
export { cn, toTestId } from "./utils/cn";
