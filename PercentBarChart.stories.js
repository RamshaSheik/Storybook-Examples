import "@/components/Charts/ExpandedViewChart.scss";
import { SCENARIO_COLORS } from "@/constants/colors";
import PercentBarChart from "./PercentBarChart";

export default {
  title: "Charts/PercentBarChart",
  component: PercentBarChart,
  decorators: [
    (Story) => (
      <div className="ExpandedView_ChartWrapper ExpandedView_ChartWrapper-barChart">
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
  argTypes: {
    plotOptions: { table: { disable: true } },
  },
};

const BASE_SCENARIO = {
  name: "Base",
  color: SCENARIO_COLORS[0],
};

const COMPARE_SCENARIO = {
  name: "Comparison",
  color: SCENARIO_COLORS[2],
};

const MOCK_BASE_DATA = [
  {
    name: "Item 1",
    data: [100],
    scenario: BASE_SCENARIO,
  },
  {
    name: "Item 2",
    data: [200],
    scenario: BASE_SCENARIO,
  },
  {
    name: "Item 3",
    data: [75],
    scenario: BASE_SCENARIO,
  },
];

const MOCK_COMPARE_DATA = [
  {
    name: "Item 1",
    data: [50],
    scenario: COMPARE_SCENARIO,
  },
  {
    name: "Item 2",
    data: [230],
    scenario: COMPARE_SCENARIO,
  },
  {
    name: "Item 3",
    data: [325],
    scenario: COMPARE_SCENARIO,
  },
];

const Template = (args) => <PercentBarChart {...args} />;

export const Default = Template.bind({});
Default.args = {
  "data-testid": "default",
  data: [MOCK_BASE_DATA],
};

export const WithComparison = Template.bind({});
WithComparison.args = {
  "data-testid": "default",
  data: [MOCK_BASE_DATA, MOCK_COMPARE_DATA],
};
