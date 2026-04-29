
import { KEYS } from 'platejs'
import {
  FontBackgroundColorPlugin,
  FontColorPlugin,
  FontSizePlugin,
  TextAlignPlugin,
} from '@platejs/basic-styles/react'

/**
 * Font styles kit for text formatting
 * Includes: FontSize, FontColor, FontBackgroundColor, TextAlign
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const FontStylesKit: any[] = [
  // Font size - injects fontSize style to leaf nodes
  FontSizePlugin.configure({
    inject: {
      nodeProps: {
        nodeKey: KEYS.fontSize,
        styleKey: 'fontSize',
      },
    },
  }),
  // Font color - injects color style to leaf nodes
  FontColorPlugin.configure({
    inject: {
      nodeProps: {
        nodeKey: KEYS.color,
        styleKey: 'color',
      },
    },
  }),
  // Background color - injects backgroundColor style to leaf nodes
  FontBackgroundColorPlugin.configure({
    inject: {
      nodeProps: {
        nodeKey: KEYS.backgroundColor,
        styleKey: 'backgroundColor',
      },
    },
  }),
  // Text align - injects textAlign style to block nodes
  TextAlignPlugin.configure({
    inject: {
      nodeProps: {
        defaultNodeValue: 'left',
        nodeKey: 'align',
        styleKey: 'textAlign',
        validNodeValues: ['left', 'center', 'right', 'justify'],
      },
      targetPlugins: [KEYS.p, KEYS.h1, KEYS.h2, KEYS.h3, KEYS.h4, KEYS.h5, KEYS.h6, KEYS.blockquote],
    },
  }),
]

/**
 * Default font sizes for the font size dropdown
 */
export const FONT_SIZES = [
  { label: '10', value: '10px' },
  { label: '12', value: '12px' },
  { label: '14', value: '14px' },
  { label: '16', value: '16px' },
  { label: '18', value: '18px' },
  { label: '20', value: '20px' },
  { label: '24', value: '24px' },
  { label: '28', value: '28px' },
  { label: '32', value: '32px' },
  { label: '36', value: '36px' },
  { label: '48', value: '48px' },
]

/**
 * Default colors for font color picker (organized by color groups)
 */
export const FONT_COLORS = [
  // Grayscale row
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#ffffff',
  // Primary colors row
  '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff',
  // Accent colors row
  '#9900ff', '#ff00ff', '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3',
  // Light accent row
  '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc', '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599',
  // Pastel row
  '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd', '#cc4125', '#e06666',
  // Vivid row
  '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0',
]

/**
 * Default colors for background/highlight color picker
 */
export const HIGHLIGHT_COLORS = [
  // Clear/transparent
  'transparent',
  // Light backgrounds
  '#fef08a', // yellow
  '#bbf7d0', // green
  '#bfdbfe', // blue
  '#fecaca', // red
  '#e9d5ff', // purple
  '#fed7aa', // orange
  '#d1d5db', // gray
  // More pastel backgrounds
  '#fef3c7', // amber
  '#dcfce7', // emerald
  '#dbeafe', // sky
  '#fce7f3', // pink
  '#f3e8ff', // violet
  '#ffedd5', // light orange
  '#f1f5f9', // slate
  '#ecfeff', // cyan
]
