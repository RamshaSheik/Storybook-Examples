import { useMemo } from 'react';
import PropTypes from 'prop-types';
import LetterIcon from '@/components/common/LetterIcon';
import { classNames } from '@/helpers';
import metricFormatters from '@/helpers/metricFormatters';
import { isEmptyOrNull } from '@/helpers/validators';
import { ReactComponent as VarianceIcon } from '@/assets/icons/svg/variance_icon.svg';
import './ChartMetrics.scss';

const EMPTY_VALUE = '--';

function MetricValue({
  className,
  color,
  'data-testid': dataTestId,
  name,
  value,
  ...props
}) {
  return (
    <td
      className={classNames(
        'ChartMetrics_Cell',
        'ChartMetrics_Cell-value',
        className,
      )}
      {...props}
    >
      <div className="ChartMetrics_CellContent">
        {color && (
          <span
            className="ChartMetrics_Bullet"
            style={{ color }}
            aria-hidden="true"
          />
        )}
        {value && <span className="ChartMetrics_ValueLabel">{name}</span>}
        <span className="ChartMetrics_Value" data-testid={dataTestId}>
          {value}
        </span>
      </div>
    </td>
  );
}

/**
 * Renders a table of value comparisons between scenarios. Used within the chart
 * tooltip or as an addendum to a chart.
 *
 * @example
 *   <ChartMetrics
 *    data={[
 *      {
 *        foo: 123,
 *        y: 456
 *      },
 *      ...
 *    ]}
 *    metrics={[
 *      {
 *        key: 'foo',
 *        name: 'Foo'
 *      },
 *      {
 *        isMainMetric: true,
 *        key: 'y'
 *        name: 'Total'
 *      }
 *    ]}
 *    scenarios={[
 *      {
 *        name: 'Base',
 *        color: '#f00'
 *      }
 *    ]}
 *   />
 */
function ChartMetrics({
  data,
  'data-testid': dataTestId,
  metrics,
  scenarios,
  valueFormatter = metricFormatters.monetary,
}) {
  const totals = useMemo(() => {
    return data
      .filter((entry) => Array.isArray(entry))
      .map((series) =>
        series.reduce((total, { data: [value] }) => total + value, 0),
      );
  }, [data]);

  return (
    <div className="ChartMetrics" data-testid={dataTestId}>
      <table className="ChartMetrics_Table">
        <thead className="ChartMetrics_Head">
          <tr className="ChartMetrics_Row">
            <td className="ChartMetrics_Cell-label" />
            {scenarios.map(({ color, name }, idx) => {
              return (
                <th
                  key={name}
                  className="ChartMetrics_Scenario"
                  aria-label={name}
                  style={{ color }}
                >
                  <LetterIcon
                    string={name}
                    color={color}
                    className="LetterIcon-sm"
                    data-testid={`${dataTestId}-${name}-icon`}
                  />
                  <div
                    className="ChartMetrics_ScenarioTotal"
                    data-testid={`${dataTestId}-${name}-total`}
                  >
                    {valueFormatter(totals[idx])}
                  </div>
                </th>
              );
            })}
            {scenarios.length > 1 && (
              <th className="ChartMetrics_Scenario ChartMetrics_Scenario-variance">
                <VarianceIcon className="VarianceIcon" />
                <div
                  className="ChartMetrics_ScenarioTotal"
                  data-testid={`${dataTestId}-total-variance`}
                >
                  {valueFormatter(
                    totals.reduce((variance, total) => -variance - total, 0),
                  )}
                </div>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="ChartMetrics_Body">
          {metrics.map(
            ({
              colors,
              exclude,
              getValue,
              isMainMetric,
              key,
              name,
              formatter = valueFormatter,
            }) => {
              let varianceValue = 0;
              return (
                !exclude?.(data) && (
                  <tr
                    key={name}
                    className={classNames(
                      'ChartMetrics_Row',
                      isMainMetric && 'ChartMetrics_Row-main',
                    )}
                  >
                    <th
                      className="ChartMetrics_Cell ChartMetrics_Cell-label"
                      data-testid={`${dataTestId}-${name}-label`}
                    >
                      {name}:
                    </th>
                    {data.map((point, idx) => {
                      const scenario = scenarios[idx];
                      let value;
                      if (point) {
                        const getValueFunc =
                          typeof getValue === 'object'
                            ? getValue[scenario.name]
                            : getValue;
                        value = getValueFunc ? getValueFunc(point) : point[key];
                      }

                      varianceValue = !isEmptyOrNull(value)
                        ? value - varianceValue
                        : 0 - varianceValue;

                      return (
                        <MetricValue
                          key={scenario.name}
                          color={colors?.[scenario.name]}
                          data-testid={`${dataTestId}-${scenario.name}-${name}-value`}
                          name={name}
                          style={{ color: scenario.color }}
                          value={
                            !isEmptyOrNull(value)
                              ? formatter(value)
                              : EMPTY_VALUE
                          }
                        />
                      );
                    })}
                    {scenarios.length > 1 && (
                      <MetricValue
                        className="ChartMetrics_Cell-variance"
                        data-testid={`${dataTestId}-${name}-variance`}
                        name={name}
                        value={
                          !Number.isNaN(varianceValue)
                            ? formatter(
                                varianceValue === 0
                                  ? varianceValue
                                  : varianceValue * -1,
                              )
                            : EMPTY_VALUE
                        }
                      />
                    )}
                  </tr>
                )
              );
            },
          )}
        </tbody>
      </table>
    </div>
  );
}

ChartMetrics.propTypes = {
  /** Chart data to populate the metrics */
  'data': PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  ),
  /** Unique ID for selecting the metrics in unit/integration tests */
  'data-testid': PropTypes.string.isRequired,
  /** Schema describing the metrics to display */
  'metrics': PropTypes.arrayOf(
    PropTypes.shape({
      /**
       * Optional map of legend colors by scenario. Corresponds to series colors
       * in stacked column and percent bar charts.
       */
      colors: PropTypes.objectOf(PropTypes.string),
      /**
       * Optional function determining whether a metric should be included in
       * the rendered list
       *
       * @param {Object[]} data metrics data
       * @returns {bool} Whether the metric should be rendered
       */
      exclude: PropTypes.func,
      /**
       * Formats the metric value for display. Defaults to the valueFormatter
       * prop.
       *
       * @param {number} value Value to format
       * @returns {string} Formatted value
       */
      formatter: PropTypes.func,
      /**
       * Optional function to retrieve the value, if key is not provided
       *
       * @param {Highcharts.Point} point
       * @returns {number}
       */
      getValue: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
      /** Whether the metric should be highlighted in the list */
      isMainMetric: PropTypes.bool,
      /** Name of the data prop containing the metric value */
      key: PropTypes.string,
      /** Label for the metric */
      name: PropTypes.string.isRequired,
    }),
  ).isRequired,
  /** Array of scenarios for which to compare each metric */
  'scenarios': PropTypes.arrayOf(
    PropTypes.shape({
      color: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }),
  ).isRequired,
  /**
   * Formats the metric values and totals for display. Can be overridden in the
   * metrics array. Defaults to monetary.
   *
   * @param {number} value Value to format
   * @returns {string} Formatted value
   */
  'valueFormatter': PropTypes.func,
};

export default ChartMetrics;
