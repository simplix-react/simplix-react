// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, it, expect } from "vitest";

afterEach(cleanup);

import {
  EyeIcon,
  PencilIcon,
  PanelRightCloseIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XIcon,
  CaretDownIcon,
  CalendarIcon,
  CalendarDotIcon,
  CalendarDotsIcon,
  HashIcon,
  CheckIcon,
  ChecksIcon,
  EqualsIcon,
  NotEqualsIcon,
  GreaterThanIcon,
  LessThanIcon,
  GreaterThanOrEqualIcon,
  LessThanOrEqualIcon,
  BracketsSquareIcon,
  IntersectIcon,
  ExcludeIcon,
  TextAlignLeftIcon,
  ToggleLeftIcon,
  FunnelIcon,
  ArrowLeftIcon,
  ColumnsIcon,
  MapPinIcon,
  SunIcon,
  MoonIcon,
  LocateIcon,
  TextAlignRightIcon,
  PlusIcon,
  ArrowUpDownIcon,
  ArrowRightLeftIcon,
  FolderTreeIcon,
  IdCardIcon,
  UnlinkIcon,
  ChevronsUpDownIcon,
  AlertTriangleIcon,
  ChevronsDownUpIcon,
} from "../../crud/shared/icons";

const allIcons = [
  { name: "EyeIcon", Component: EyeIcon },
  { name: "PencilIcon", Component: PencilIcon },
  { name: "PanelRightCloseIcon", Component: PanelRightCloseIcon },
  { name: "TrashIcon", Component: TrashIcon },
  { name: "MagnifyingGlassIcon", Component: MagnifyingGlassIcon },
  { name: "XIcon", Component: XIcon },
  { name: "CaretDownIcon", Component: CaretDownIcon },
  { name: "CalendarIcon", Component: CalendarIcon },
  { name: "CalendarDotIcon", Component: CalendarDotIcon },
  { name: "CalendarDotsIcon", Component: CalendarDotsIcon },
  { name: "HashIcon", Component: HashIcon },
  { name: "CheckIcon", Component: CheckIcon },
  { name: "ChecksIcon", Component: ChecksIcon },
  { name: "EqualsIcon", Component: EqualsIcon },
  { name: "NotEqualsIcon", Component: NotEqualsIcon },
  { name: "GreaterThanIcon", Component: GreaterThanIcon },
  { name: "LessThanIcon", Component: LessThanIcon },
  { name: "GreaterThanOrEqualIcon", Component: GreaterThanOrEqualIcon },
  { name: "LessThanOrEqualIcon", Component: LessThanOrEqualIcon },
  { name: "BracketsSquareIcon", Component: BracketsSquareIcon },
  { name: "IntersectIcon", Component: IntersectIcon },
  { name: "ExcludeIcon", Component: ExcludeIcon },
  { name: "TextAlignLeftIcon", Component: TextAlignLeftIcon },
  { name: "ToggleLeftIcon", Component: ToggleLeftIcon },
  { name: "FunnelIcon", Component: FunnelIcon },
  { name: "ArrowLeftIcon", Component: ArrowLeftIcon },
  { name: "ColumnsIcon", Component: ColumnsIcon },
  { name: "MapPinIcon", Component: MapPinIcon },
  { name: "SunIcon", Component: SunIcon },
  { name: "MoonIcon", Component: MoonIcon },
  { name: "LocateIcon", Component: LocateIcon },
  { name: "TextAlignRightIcon", Component: TextAlignRightIcon },
  { name: "PlusIcon", Component: PlusIcon },
  { name: "ArrowUpDownIcon", Component: ArrowUpDownIcon },
  { name: "ArrowRightLeftIcon", Component: ArrowRightLeftIcon },
  { name: "FolderTreeIcon", Component: FolderTreeIcon },
  { name: "IdCardIcon", Component: IdCardIcon },
  { name: "UnlinkIcon", Component: UnlinkIcon },
  { name: "ChevronsUpDownIcon", Component: ChevronsUpDownIcon },
  { name: "AlertTriangleIcon", Component: AlertTriangleIcon },
  { name: "ChevronsDownUpIcon", Component: ChevronsDownUpIcon },
];

describe("Shared Icons", () => {
  for (const { name, Component } of allIcons) {
    it(`${name} renders an SVG element`, () => {
      const { container } = render(<Component />);
      const svg = container.querySelector("svg");
      expect(svg).toBeTruthy();
      expect(svg?.getAttribute("aria-hidden")).toBe("true");
    });

    it(`${name} accepts className prop`, () => {
      const { container } = render(<Component className="custom-icon" />);
      const svg = container.querySelector("svg");
      expect(svg?.getAttribute("class")).toContain("custom-icon");
    });
  }
});
