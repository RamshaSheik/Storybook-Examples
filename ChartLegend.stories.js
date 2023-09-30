import { useState } from 'react';
import { StackedColumn as StackedColumnChart } from '@/components/Charts/DateChart/DateChart.stories';
import ChartLegend from './ChartLegend';

export default {
  title: 'Charts/ChartLegend',
  component: ChartLegend,
};

const Template = (args) => {
  const [chart, setChart] = useState();
  return (
    <>
      <ChartLegend chart={chart} {...args} />
      <StackedColumnChart
        onChartCreated={setChart}
        {...StackedColumnChart.args}
      />
    </>
  );
};

export const Default = Template.bind({});
Default.args = {
  'data-testid': 'default',
};
