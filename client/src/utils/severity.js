/**
 * Severity is conveyed through border shade + glyph ONLY.
 * Never expose raw chromatic color values from this module —
 * every consumer picks from the shade scale.
 */
export const SEVERITIES = ['critical', 'high', 'medium', 'low'];

export const SEVERITY_GLYPH = {
  critical: '⚠',
  high:     '▲',
  medium:   '●',
  low:      '■',
};

export const SEVERITY_BORDER = {
  critical: '#ffffff',
  high:     '#a0a0a0',
  medium:   '#606060',
  low:      '#404040',
};

export const SEVERITY_BORDER_CLASS = {
  critical: 'sev-border-critical',
  high:     'sev-border-high',
  medium:   'sev-border-medium',
  low:      'sev-border-low',
};

export const SEVERITY_TEXT_CLASS = {
  critical: 'sev-text-critical',
  high:     'sev-text-high',
  medium:   'sev-text-medium',
  low:      'sev-text-low',
};

/** Dash pattern for polyline threat lines (white on black) */
export const SEVERITY_DASH = {
  critical: undefined,    // solid
  high:     '8 4',
  medium:   '4 4',
  low:      '2 4',
};

export const SEVERITY_WEIGHT = {
  critical: 2.5,
  high:     2,
  medium:   1.5,
  low:      1,
};

export const SEVERITY_RANK = { critical: 4, high: 3, medium: 2, low: 1 };

export function isSeverity(s) {
  return SEVERITIES.includes(s);
}
