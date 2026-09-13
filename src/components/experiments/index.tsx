'use client';

import React from 'react';
import {
  MenelausExp, CevaExp, DesarguesExp, PascalExp, PappusExp
} from './exp-01-05.tsx';
import {
  BrianchonExp, PtolemyExp, BrahmaguptaExp, PowerExp, ZhangjiaoExp
} from './exp-06-10.tsx';
import {
  SimsonExp, SteinerExp, StewartExp, BrocardExp, MiquelExp
} from './exp-11-15.tsx';
import {
  ButterflyExp, MongeExp, RadicalExp, CaseyExp, FeuerbachExp
} from './exp-16-20.tsx';
import {
  GaussBodenmillerExp, PonceletExp, MorleyExp, SawayamaExp, ThebaultExp
} from './exp-21-25.tsx';
import {
  DescartesExp, DrozFarnyExp, SondatExp, ErdosMordellExp, BarrowExp
} from './exp-26-30.tsx';

export interface ExperimentComponentProps {
  onChallengeProgress?: (progress: number, completed: boolean) => void;
}

export const EXPERIMENT_REGISTRY: Record<string, React.ComponentType<ExperimentComponentProps>> = {
  menelaus: MenelausExp,
  ceva: CevaExp,
  desargues: DesarguesExp,
  pascal: PascalExp,
  pappus: PappusExp,
  brianchon: BrianchonExp,
  ptolemy: PtolemyExp,
  brahmagupta: BrahmaguptaExp,
  power: PowerExp,
  'power-of-point': PowerExp,
  zhangjiao: ZhangjiaoExp,
  simson: SimsonExp,
  steiner: SteinerExp,
  stewart: StewartExp,
  brocard: BrocardExp,
  miquel: MiquelExp,
  butterfly: ButterflyExp,
  monge: MongeExp,
  radical: RadicalExp,
  'radical-axis': RadicalExp,
  casey: CaseyExp,
  feuerbach: FeuerbachExp,
  gaussboden: GaussBodenmillerExp,
  'gauss-bodenmiller': GaussBodenmillerExp,
  poncelet: PonceletExp,
  morley: MorleyExp,
  sawayama: SawayamaExp,
  thebault: ThebaultExp,
  descartes: DescartesExp,
  drozfarny: DrozFarnyExp,
  'droz-farny': DrozFarnyExp,
  sondat: SondatExp,
  erdsmordell: ErdosMordellExp,
  'erdos-mordell': ErdosMordellExp,
  barrow: BarrowExp,
};
