import { SCENARIO_COLORS } from '@/constants/colors';
import FunnelChart from './FunnelChart';
import { getBandedGradient } from './colors';

const BASE_SCENARIO = {
  name: 'Base',
  color: SCENARIO_COLORS[0],
  scenarioId: 1,
};

const COMPARE_SCENARIO = {
  name: 'Comparison',
  color: SCENARIO_COLORS[2],
  scenarioId: 2,
};

const BASE_DATA = [
  {
    name: 'Slice 1',
    y: 250,
    scenario: BASE_SCENARIO,
  },
  {
    name: 'Slice 2',
    y: 110,
    scenario: BASE_SCENARIO,
  },
  {
    name: 'Slice 3',
    y: 45,
    scenario: BASE_SCENARIO,
  },
  {
    name: 'Slice 4',
    y: 140,
    scenario: BASE_SCENARIO,
  },
  {
    name: 'Slice 5',
    y: 65,
    scenario: BASE_SCENARIO,
  },
];

const COMPARE_DATA = [
  {
    name: 'Slice 1',
    y: 150,
    scenario: COMPARE_SCENARIO,
  },
  {
    name: 'Slice 2',
    y: 180,
    scenario: COMPARE_SCENARIO,
  },
  {
    name: 'Slice 3',
    y: 95,
    scenario: COMPARE_SCENARIO,
  },
  {
    name: 'Slice 4',
    y: 200,
    scenario: COMPARE_SCENARIO,
  },
  {
    name: 'Slice 5',
    y: 15,
    scenario: COMPARE_SCENARIO,
  },
];

const colors = getBandedGradient(SCENARIO_COLORS[0], BASE_DATA.length);
const dataWithColors = BASE_DATA.map((slice, idx) => ({
  ...slice,
  color: colors[idx],
}));

const compareColors = getBandedGradient(
  SCENARIO_COLORS[2],
  COMPARE_DATA.length,
);
const compareDataWithColors = COMPARE_DATA.map((slice, idx) => ({
  ...slice,
  color: compareColors[idx],
}));

export default {
  title: 'Charts/FunnelChart',
  component: FunnelChart,
};

const Template = (args) => {
  return <FunnelChart {...args} valueFormatter={(val) => val} />;
};

export const Default = Template.bind({});
Default.args = {
  'data-testid': 'default',
  'data': dataWithColors,
};

export const WithComparison = Template.bind({});
WithComparison.args = {
  'data-testid': 'comparison',
  'data': [...dataWithColors, ...compareDataWithColors],
};
