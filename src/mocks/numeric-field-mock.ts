import { NumericField } from "../types/type";

export type MeasurementUnit =
  | '%' | 'cm' | 'm' | 'mm' | 'inch'
  | 'kg' | 'g' | 'lb'
  | '$' | '₩' | '€' | '¥'
  | 's' | 'min' | 'hr'
  | '°C' | '°F'
  | 'ml' | 'l';

export const numericExamples: NumericField[] = [
  { value: 3.4567, unit: '%', decimalPlaces: 2 },
  { value: 180.25, unit: 'cm', decimalPlaces: 1 },
  { value: 75.123, unit: '$', decimalPlaces: 1 },
  { value: 12999.99, unit: '₩', decimalPlaces: 0 },
  { value: 36.689, unit: '°C', decimalPlaces: 1 },
  { value: 1.23456, unit: 'l', decimalPlaces: 3 }
];