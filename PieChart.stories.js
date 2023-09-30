import { SCENARIO_COLORS } from '@/constants/colors';
import PieChart from './PieChart';
import { getBandedGradient } from './colors';

const MOCK_DATA = [
  {
    name: 'Slice 1',
    y: 250,
  },
  {
    name: 'Slice 2',
    y: 110,
  },
  {
    name: 'Slice 3',
    y: 45,
  },
  {
    name: 'Slice 4',
    y: 140,
  },
  {
    name: 'Slice 5',
    y: 65,
  },
];
const colors = getBandedGradient(SCENARIO_COLORS[0], MOCK_DATA.length);
const dataWithColors = MOCK_DATA.map((slice, idx) => ({
  ...slice,
  color: colors[idx],
}));

export default {
  title: 'Charts/PieChart',
  component: PieChart,
};

const Template = (args) => {
  return <PieChart {...args} valueFormatter={(val) => val} />;
};

export const Default = Template.bind({});
Default.args = {
  'data-testid': 'default',
  'data': dataWithColors,
};
