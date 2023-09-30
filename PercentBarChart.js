import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import {
  HighchartsChart,
  YAxis,
  XAxis,
  BarSeries,
  Chart,
} from 'react-jsx-highcharts';
import Highcharts from 'highcharts';
import PropTypes from 'prop-types';
import { JSX_OPTIONS } from '@/components/Charts/chartDefaults';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import COLORS from '@/constants/colorPalette';
import { classNames, formatPercent } from '@/helpers';
import useElementSize from '@/hooks/useElementSize';
import ChartRefContainer from './ChartRefContainer';
import { getBandedGradient, getComparisonPatternFill } from './colors';
import './PercentBarChart.scss';

const DATA_LABEL_OFFSET = 30;

const PLOT_OPTIONS = {
  bar: {
    borderColor: '#fff',
    borderWidth: 1,
    dataLabels: {
      align: 'right',
      borderWidth: 0,
      enabled: true,
      fontSize: '12px',
      fontWeight: 600,
      formatter() {
        return formatPercent(this.percentage);
      },
      style: {
        textOutline: false,
      },
      verticalAlign: 'top',
    },
    groupPadding: 0.225,
    pointPadding: 0.05,
    stacking: 'percent',
  },
};

const PLOT_LINE = {
  color: Highcharts.Color(COLORS.finmarkBlue).setOpacity(0.5).get('rgba'),
  width: 1,
};

const yAxisConfig = {
  tickInterval: 10,
  labels: {
    formatter() {
      return formatPercent(this.value);
    },
  },
  plotLines: [
    { ...PLOT_LINE, value: 0 },
    { ...PLOT_LINE, value: 100 },
  ],
};

function StackedBarSeries({ data, index, colors }) {
  const { scenario } = useMemo(() => data[0] ?? {}, [data]);

  const steppedColors = useMemo(
    () => getBandedGradient(scenario.color, data.length),
    [data.length, scenario],
  );

  const custom = useMemo(() => ({ scenario }), [scenario]);

  const dataLabels = useMemo(
    () => ({
      color: scenario.color,
      y: index ? DATA_LABEL_OFFSET : -DATA_LABEL_OFFSET,
    }),
    [index, scenario],
  );

  return data.map((series, idx) => {
    const id = series.id ?? series.name;
    const mappedColor = colors?.[id] ?? steppedColors[idx];
    const color =
      index > 0 ? getComparisonPatternFill(mappedColor) : mappedColor;

    return (
      <BarSeries
        key={series.name}
        index={index}
        name={series.name}
        color={color}
        data={series.data}
        dataLabels={dataLabels}
        jsxOptions={JSX_OPTIONS}
        stack={scenario.name}
        custom={custom}
      />
    );
  });
}

/**
 * Renders a horizontal bar chart with values stacked as a percentage.
 *
 * @example
 *   <PercentBarChart
 *     data={[baseSeries, compareSeries]}
 *     data-testid="foo"
 *     tooltip={<ChartTooltip />}
 *   />;
 */
const PercentBarChart = forwardRef(
  (
    {
      className,
      'data-testid': dataTestId,
      onChartCreated,
      plotOptions = PLOT_OPTIONS,
      data,
      tooltip,
      loading,
      colors,
      ...props
    },
    ref,
  ) => {
    const container = useRef(null);
    const [chartApi, setChartApi] = useState();

    useEffect(() => {
      return () => onChartCreated?.(null);
    }, [onChartCreated]);

    const { contentRect } = useElementSize(container);
    useEffect(() => {
      if (!chartApi || !contentRect) return;
      chartApi.setSize(null, null, false);
    }, [chartApi, contentRect]);

    return (
      <div className={classNames('PercentBarChart', className)} ref={container}>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <HighchartsChart
            containerProps={{ 'data-testid': dataTestId, ...props }}
            plotOptions={plotOptions}
          >
            <ChartRefContainer
              onChartCreated={(chart) => {
                // eslint-disable-next-line no-param-reassign -- predates description requirement
                if (ref) ref.current = chart;
                setChartApi(chart);
                onChartCreated?.(chart);
              }}
            />
            {tooltip}
            <Chart inverted />
            <XAxis visible={false} />
            <YAxis {...yAxisConfig}>
              {data.map(
                (series, idx) =>
                  !!series.length && (
                    <StackedBarSeries
                      key={idx === 0 ? 'base' : 'compare'}
                      data={series}
                      index={idx}
                      colors={colors}
                    />
                  ),
              )}
            </YAxis>
          </HighchartsChart>
        )}
      </div>
    );
  },
);

PercentBarChart.propTypes = {
  /** Data to populate the chart */
  'data': PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        data: PropTypes.arrayOf(PropTypes.any).isRequired,
        name: PropTypes.string.isRequired,
        scenario: PropTypes.shape({
          color: PropTypes.string.isRequired,
          name: PropTypes.string.isRequired,
        }).isRequired,
      }),
    ),
  ).isRequired,
  /** Unique ID for selecting the element in unit/integration tests */
  'data-testid': PropTypes.string.isRequired,
  /** Additional class(es) to apply to the element */
  'className': PropTypes.string,
  /**
   * Callback for accessing the chart object from the parent, to pass to
   * dependent components such as the legend or export button
   *
   * @param {Highcharts.Chart} chart
   */
  'onChartCreated': PropTypes.func,
  /** Highcharts plot configuration */
  'plotOptions': PropTypes.objectOf(PropTypes.any),
  /** Component to render the tooltip */
  'tooltip': PropTypes.node,
  /** Whether or not a loading indicator should be displayed */
  'loading': PropTypes.bool,
  /** Color map for items on the chart */
  'colors': PropTypes.object,
};

export default PercentBarChart;
