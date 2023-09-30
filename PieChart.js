import { useCallback, useMemo, useState } from 'react';
import { Chart, PieSeries } from 'react-jsx-highcharts';
import PropTypes from 'prop-types';
import PartToWholeChart from '@/components/Charts/PartToWholeChart';
import { JSX_OPTIONS } from '@/components/Charts/chartDefaults';
import { COMPARE_PATTERN_COLOR } from '@/components/Charts/colors';
import metricFormatters from '@/helpers/metricFormatters';

const MARGINS = [0, 2, 0, 2];
const NO_LABEL_MARGINS = [-5, -5, -5, -5];
const PLOT_OPTIONS_DEFAULT = {};

function getComparisonPattern(backgroundColor) {
  return {
    pattern: {
      path: {
        d: [
          'M3,2a1,1 0 1,0 2,0a1,1 0 1,0 -2,0',
          'M0,5a1,1 0 1,0 2,0a1,1 0 1,0 -2,0',
        ],
        fill: COMPARE_PATTERN_COLOR,
        strokeWidth: 0,
      },
      width: 6,
      height: 6,
      backgroundColor,
    },
  };
}

/**
 * Creates a pie chart
 *
 * @example
 *   <PieChart
 *    id="foo"
 *    colors={['#ff0000', ...]}
 *    data={[
 *      {
 *        name: 'Foo',
 *        y: 2500
 *      }
 *      ...
 *    ]}
 *   />
 */
function PieChart({
  data,
  isComparison,
  plotOptions = PLOT_OPTIONS_DEFAULT,
  valueFormatter = metricFormatters.count,
  ...props
}) {
  const [margins, setMargins] = useState(MARGINS);

  const seriesData = useMemo(() => {
    if (!isComparison) return data;

    return data.map(({ color, ...attrs }) => ({
      ...attrs,
      color: getComparisonPattern(color),
    }));
  }, [data, isComparison]);

  const dataLabels = useMemo(
    () => ({
      ...plotOptions.series?.dataLabels,
      formatter() {
        const { name, rawY } = this.point;
        return `${this.point.name}&nbsp;-&nbsp;
          <b>${valueFormatter(rawY ?? this.y, { name })}</b>`;
      },
    }),
    [plotOptions, valueFormatter],
  );

  const handleResize = useCallback((chartApi) => {
    const [{ options }] = chartApi.series;
    setMargins(options.dataLabels.enabled ? MARGINS : NO_LABEL_MARGINS);
  }, []);

  return (
    <PartToWholeChart
      onResize={handleResize}
      plotOptions={plotOptions}
      valueFormatter={valueFormatter}
      {...props}
    >
      <Chart margin={margins} />
      <PieSeries
        data={seriesData}
        dataLabels={dataLabels}
        name={seriesData[0].scenario?.name}
        jsxOptions={JSX_OPTIONS}
      />
    </PartToWholeChart>
  );
}

PieChart.propTypes = {
  /** Data to populate the chart */
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      scenario: PropTypes.objectOf(PropTypes.any),
      y: PropTypes.number.isRequired,
    }),
  ),
  /** Whether the chart represents a comparison scenario */
  isComparison: PropTypes.bool,
  /** Highcharts plot configuration */
  plotOptions: PropTypes.objectOf(PropTypes.any),
  /** Formats the values for the slice labels */
  valueFormatter: PropTypes.func,
};

export default PieChart;
