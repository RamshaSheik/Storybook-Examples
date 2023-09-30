import { useCallback, useEffect, useMemo, useState } from 'react';
import { Chart, FunnelSeries } from 'react-jsx-highcharts';
import Highcharts from 'highcharts';
import HighchartsFunnel from 'highcharts/modules/funnel';
import PropTypes from 'prop-types';
import PartToWholeChart from '@/components/Charts/PartToWholeChart';
import { getComparisonPatternFill } from '@/components/Charts/colors';

HighchartsFunnel(Highcharts);

const MARGINS = [10, 2, 10, 2];
const SVG_NS = 'http://www.w3.org/2000/svg';

function getClipPathForSeries(x = '0') {
  const clipPath = document.createElementNS(SVG_NS, 'clipPath');
  const rect = document.createElementNS(SVG_NS, 'rect');
  rect.setAttributeNS(null, 'x', x);
  rect.setAttributeNS(null, 'y', '0');
  rect.setAttributeNS(null, 'height', '100%');
  rect.setAttributeNS(null, 'width', '50%');
  clipPath.appendChild(rect);
  return clipPath;
}

function handleRedraw() {
  const { box } = this.renderer;
  const clipBaseId = 'clipBase';
  if (this.series.length < 2 || box.getElementById(clipBaseId)) return;

  // Create SVG clip paths for hiding half of each scenario's funnel,
  // to make room for the other scenario
  const clipBase = getClipPathForSeries();
  clipBase.id = clipBaseId;
  box.appendChild(clipBase);
  const clipCompare = getClipPathForSeries('50%');
  clipCompare.id = 'clipCompare';
  box.appendChild(clipCompare);
}

/**
 * Creates a funnel chart
 *
 * @example
 *   <FunnelChart
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
function FunnelChart({ data, plotOptions, valueFormatter, ...props }) {
  const [hasLegend, setHasLegend] = useState(false);
  const [activeSeries, setActiveSeries] = useState();

  const dataByScenario = useMemo(() => {
    if (!data) return [];
    const scenarioMap = data.reduce((scenarios, series) => {
      const { scenario, y } = series;
      if (!scenario) return scenarios;
      const { scenarioId } = scenario;

      const isComparison =
        scenarios.size && [...scenarios.keys()][0] !== scenarioId;

      // Funnel charts don't work right with negative values,
      // so we force them to display as 0
      const updatedSeries =
        y < 0
          ? {
              ...series,
              y: 0,
              rawY: y,
            }
          : {
              ...series,
              color: isComparison
                ? getComparisonPatternFill(series.color)
                : series.color,
            };

      const scenarioSeries = scenarios.get(scenarioId) ?? [];
      return scenarios.set(scenarioId, [...scenarioSeries, updatedSeries]);
    }, new Map());
    return [...scenarioMap.values()];
  }, [data]);

  useEffect(() => setActiveSeries(null), [data]);

  const dataLabels = useMemo(
    () => ({
      ...plotOptions?.series?.dataLabels,
      enabled: !hasLegend,
      formatter() {
        const { name, rawY } = this.point;
        return `${name}&nbsp;-&nbsp;
          <b>${valueFormatter(rawY ?? this.y, { name })}</b>`;
      },
    }),
    [hasLegend, plotOptions, valueFormatter],
  );

  const events = useMemo(
    () => ({
      afterAnimate() {
        if (this.chart.series.length < 2) return;
        this.group.element.setAttribute(
          'clip-path',
          `url(#${this.index ? 'clipCompare' : 'clipBase'})`,
        );
      },
      mouseOver: ({ target }) => setActiveSeries(target),
    }),
    [],
  );

  const handleResize = useCallback(
    ({ series: [firstSeries] }) =>
      setHasLegend(!firstSeries.options.dataLabels.enabled),
    [],
  );

  const hasComparison = dataByScenario.length > 1;
  const allowHover = hasLegend && hasComparison;

  const dataLabelsLeft = useMemo(
    () => ({
      ...dataLabels,
      position: 'left',
    }),
    [dataLabels],
  );

  const states = useMemo(
    () => ({
      hover: {
        enabled: allowHover,
        brightness: 0,
      },
      inactive: {
        enabled: allowHover,
        opacity: 0.4,
      },
    }),
    [allowHover],
  );

  return (
    <PartToWholeChart
      activeSeries={activeSeries}
      onResize={handleResize}
      plotOptions={plotOptions}
      showScenario={hasComparison}
      valueFormatter={valueFormatter}
      {...props}
    >
      <Chart margin={MARGINS} onRedraw={handleRedraw} />
      {dataByScenario.map((series, idx) => (
        <FunnelSeries
          key={series[0].scenario.name}
          data={series}
          dataLabels={idx === 0 && hasComparison ? dataLabelsLeft : dataLabels}
          index={idx}
          name={series[0].scenario.name}
          states={states}
          events={events}
        />
      ))}
    </PartToWholeChart>
  );
}

FunnelChart.propTypes = {
  /** Data to populate the chart */
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      y: PropTypes.number.isRequired,
    }),
  ),
  /** Highcharts plot configuration */
  plotOptions: PropTypes.objectOf(PropTypes.any),
  /** Formats the values for the slice labels */
  valueFormatter: PropTypes.func,
};

export default FunnelChart;
