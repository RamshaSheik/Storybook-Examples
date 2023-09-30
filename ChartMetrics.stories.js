import { SCENARIO_COLORS } from "@/constants/colors";
import ChartMetrics from "./ChartMetrics";
import { getBandedGradient } from "./colors";
import { getStackedChartMetrics } from "./helpers";

export default {
  title: "Charts/ChartMetrics",
  component: ChartMetrics,
  decorators: [
    (Story) => (
      <div className="ChartPanel">
        <Story />
      </div>
    ),
  ],
  parameters: {
    design: {
      type: "figma",
      url: "designURL",
    },
  },
};

const MOCK_SCENARIOS = [
  {
    name: "Base",
    color: SCENARIO_COLORS[0],
  },
  {
    name: "Comparison",
    color: SCENARIO_COLORS[2],
  },
];

const MOCK_BASE_DATA = [
  {
    name: "Item 1",
    data: [100],
    scenario: "Base",
  },
  {
    name: "Item 2",
    data: [200],
    scenario: "Base",
  },
  {
    name: "Item 3",
    data: [75],
    scenario: "Base",
  },
];
const baseColors = getBandedGradient(SCENARIO_COLORS[0], MOCK_BASE_DATA.length);
const baseDataWithColors = MOCK_BASE_DATA.map((slice, idx) => ({
  ...slice,
  color: baseColors[idx],
}));

const MOCK_COMPARE_DATA = [
  {
    name: "Item 1",
    data: [50],
    scenario: "Comparison",
  },
  {
    name: "Item 2",
    data: [230],
    scenario: "Comparison",
  },
  {
    name: "Item 3",
    data: [325],
    scenario: "Comparison",
  },
];
const compareColors = getBandedGradient(
  SCENARIO_COLORS[2],
  MOCK_COMPARE_DATA.length
);
const compareDataWithColors = MOCK_COMPARE_DATA.map((slice, idx) => ({
  ...slice,
  color: compareColors[idx],
}));

const Template = ({ data, ...args }) => (
  <ChartMetrics
    {...args}
    data={data}
    metrics={getStackedChartMetrics(data)}
    scenarios={MOCK_SCENARIOS}
  />
);

export const Default = Template.bind({});
Default.args = {
  data: [baseDataWithColors, compareDataWithColors],
};
