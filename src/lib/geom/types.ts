/**
 * Unified Geometry Types for Olympiad Math Lab
 */

export interface Pt {
  x: number;
  y: number;
}

export type Vec = Pt;

export interface Segment {
  a: Pt;
  b: Pt;
}

export interface Line {
  a: Pt;
  b: Pt;
}

export interface Circle {
  c: Pt;
  r: number;
}

export interface Triangle {
  a: Pt;
  b: Pt;
  c: Pt;
}

export interface Polygon {
  pts: Pt[];
}

export interface MeasurementItem {
  label: string;
  value: string | number;
  ok?: boolean;
  unit?: string;
  note?: string;
  tone?: 'default' | 'success' | 'warning' | 'error' | 'gold' | 'teal';
}
