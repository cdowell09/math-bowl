import { Problem } from '../../types';

type ConversionType = {
  from: string;
  to: string;
  factor: number;
  maxValue: number;
};

const conversions: ConversionType[] = [
  // Length
  { from: 'm', to: 'cm', factor: 100, maxValue: 10 },
  { from: 'm', to: 'mm', factor: 1000, maxValue: 5 },
  { from: 'cm', to: 'mm', factor: 10, maxValue: 100 },
  { from: 'km', to: 'm', factor: 1000, maxValue: 5 },
  // Mass
  { from: 'kg', to: 'g', factor: 1000, maxValue: 5 },
  // Volume
  { from: 'L', to: 'mL', factor: 1000, maxValue: 5 },
];

export function generateMetricConversion(): Problem {
  const conversion = conversions[Math.floor(Math.random() * conversions.length)];
  const value = Math.floor(Math.random() * conversion.maxValue) + 1;
  const answer = value * conversion.factor;

  return {
    id: crypto.randomUUID(),
    display: `${value} ${conversion.from} = ___ ${conversion.to}`,
    answer: answer,
    type: 'metricConversions',
    typeName: 'Metric Conversions'
  };
}
