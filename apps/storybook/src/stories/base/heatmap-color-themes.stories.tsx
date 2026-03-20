import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TimeRangeSelector, HEATMAP_THEMES } from "@simplix-react/ui";
import type { HeatmapColorTheme, TimeRangeValue } from "@simplix-react/ui";

const themeKeys = Object.keys(HEATMAP_THEMES) as HeatmapColorTheme[];

const now = new Date();
const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

async function mockFetchCounts(_from: Date, _to: Date, bucketCount: number): Promise<number[]> {
  // Deterministic pattern: bell curve + some spikes
  return Array.from({ length: bucketCount }, (_, i) => {
    const center = bucketCount / 2;
    const distance = Math.abs(i - center) / center;
    const base = Math.round((1 - distance * distance) * 40);
    const spike = i % 7 === 0 ? 15 : 0;
    return Math.max(0, base + spike);
  });
}

function ThemeCard({ theme }: { theme: HeatmapColorTheme }) {
  const [value, setValue] = useState({ from: startOfDay, to: endOfDay });
  return (
    <div>
      <div style={{ marginBottom: 6, fontSize: 13, fontWeight: 600, textTransform: "capitalize" }}>
        {theme}
      </div>
      <TimeRangeSelector
        value={value}
        onChange={(range: TimeRangeValue) => setValue({ from: range.from, to: range.to })}
        fetchCounts={mockFetchCounts}
        colorTheme={theme}
      />
    </div>
  );
}

function PaletteSwatches({ theme }: { theme: HeatmapColorTheme }) {
  const palette = HEATMAP_THEMES[theme];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 600, textTransform: "capitalize" }}>{theme}</span>
      <div style={{ display: "flex", gap: 2 }}>
        {palette.light.map((color: string, i: number) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <div
              style={{ width: 32, height: 20, borderRadius: 4, background: color, border: "1px solid #e2e8f0" }}
              title={`Light ${i}: ${color}`}
            />
            <div
              style={{ width: 32, height: 20, borderRadius: 4, background: palette.dark[i], border: "1px solid #334155" }}
              title={`Dark ${i}: ${palette.dark[i]}`}
            />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 2, fontSize: 9, color: "#94a3b8" }}>
        <span style={{ width: 32, textAlign: "center" }}>0</span>
        <span style={{ width: 32, textAlign: "center" }}>low</span>
        <span style={{ width: 32, textAlign: "center" }}></span>
        <span style={{ width: 32, textAlign: "center" }}></span>
        <span style={{ width: 32, textAlign: "center" }}></span>
        <span style={{ width: 32, textAlign: "center" }}>max</span>
      </div>
    </div>
  );
}

const meta = {
  title: "Base/Inputs/Heatmap Color Themes",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllThemes: Story = {
  name: "All Themes",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1100 }}>
      {themeKeys.map((theme) => (
        <ThemeCard key={theme} theme={theme} />
      ))}
    </div>
  ),
};

export const PaletteComparison: Story = {
  name: "Palette Comparison",
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
      {themeKeys.map((theme) => (
        <PaletteSwatches key={theme} theme={theme} />
      ))}
    </div>
  ),
};

export const SideBySide: Story = {
  name: "Side by Side",
  render: () => {
    const [themeA, setThemeA] = useState<HeatmapColorTheme>("slate");
    const [themeB, setThemeB] = useState<HeatmapColorTheme>("blue");
    const [valueA, setValueA] = useState({ from: startOfDay, to: endOfDay });
    const [valueB, setValueB] = useState({ from: startOfDay, to: endOfDay });

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 1100 }}>
        <div style={{ display: "flex", gap: 16, fontSize: 13 }}>
          <label>
            Theme A:{" "}
            <select value={themeA} onChange={(e) => setThemeA(e.target.value as HeatmapColorTheme)}>
              {themeKeys.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label>
            Theme B:{" "}
            <select value={themeB} onChange={(e) => setThemeB(e.target.value as HeatmapColorTheme)}>
              {themeKeys.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
        </div>
        <TimeRangeSelector
          value={valueA}
          onChange={(range: TimeRangeValue) => setValueA({ from: range.from, to: range.to })}
          fetchCounts={mockFetchCounts}
          colorTheme={themeA}
        />
        <TimeRangeSelector
          value={valueB}
          onChange={(range: TimeRangeValue) => setValueB({ from: range.from, to: range.to })}
          fetchCounts={mockFetchCounts}
          colorTheme={themeB}
        />
      </div>
    );
  },
};
