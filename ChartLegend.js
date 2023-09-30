import { useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import PropTypes from 'prop-types';
import { chartTypes } from '@/components/Charts/constants';
import Link from '@/components/common/Link';
import TooltipTextOverflow from '@/components/common/TooltipTextOverflow';
import { classNames } from '@/helpers';
import './ChartLegend.scss';

/**
 * @typedef {{
 *   name: string;
 *   index: number;
 *   colors: Highcharts.Point['color'][];
 *   value?: number;
 * }} LegendItem
 */

/** @type {(entities: Highcharts.Point[]) => LegendItem[]} */
function getLegendItems(entities) {
  return entities.reduce((accum, current) => {
    if (current.options.showInLegend === false) return accum;

    // On comparison series, color is a pattern object
    const color = current.color.pattern?.backgroundColor ?? current.color;

    const existingItem = accum.find(({ name }) => current.name === name);

    if (!existingItem) {
      accum.push({
        name: current.name,
        index: current.index,
        colors: [color],
        value: current.rawY ?? current.y,
      });
    } else if (!existingItem.colors.includes(color)) {
      existingItem.colors.splice(current.options.index, 0, color);
    }
    return accum;
  }, []);
}

function ItemBullet({ color }) {
  return (
    <span
      className="ChartLegend_ItemBullet"
      style={{ backgroundColor: color }}
    />
  );
}

/**
 * @typedef {{
 *   'activeSeries'?: Highcharts.Series;
 *   'chart': Highcharts.Chart | undefined;
 *   'className'?: string;
 *   'data-testid': string;
 *   'maxItems'?: number;
 *   'valueFormatter'?: (value: number, context: Object) => string;
 *   'reverse'?: boolean;
 *   'showMoreUrl'?: string;
 * }} ChartLegendProps
 */

/**
 * Creates a bulleted legend for a chart
 *
 * @example
 *   <ChartLegend chart={chart} data-testid="foo" />;
 *
 * @type {(props: ChartLegendProps) => React.ReactElement}
 */
function ChartLegend({
  activeSeries,
  chart,
  className,
  maxItems,
  valueFormatter,
  reverse = false,
  showMoreUrl,
  ...props
}) {
  /**
   * @type {[
   *   LegendItem[],
   *   React.Dispatch<React.SetStateAction<LegendItem[]>>,
   * ]}
   */
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!chart) {
      if (items.length) {
        setItems([]);
      }
      return null;
    }

    const handleRender = ({ target: { series } }) => {
      if (!series.length) return;

      const selectedSeries = activeSeries ?? series[0];
      const entities = [chartTypes.FUNNEL, chartTypes.PIE].includes(
        selectedSeries.options.type,
      )
        ? selectedSeries.points
        : series;
      setItems(
        reverse ? getLegendItems(entities).reverse() : getLegendItems(entities),
      );
    };
    Highcharts.addEvent(chart, 'redraw', handleRender);

    return () => Highcharts.removeEvent(chart, 'redraw', handleRender);
  }, [activeSeries, chart, items.length, reverse]);

  useEffect(() => {
    const series = activeSeries ?? chart?.series?.[0];
    if (series?.points) setItems(getLegendItems(series.points));
  }, [activeSeries, chart]);

  return (
    <>
      <ul className={classNames('ChartLegend', className)} {...props}>
        {items.slice(0, maxItems).map(({ colors, name, value, index }) => (
          <li key={index} className="ChartLegend_Item">
            {colors.map((color) => (
              <ItemBullet key={color} color={color} />
            ))}
            {name && (
              <TooltipTextOverflow
                className="ChartLegend_ItemLabel"
                data-testid={`${name}-tooltip`}
                label={name}
                placement="top"
              />
            )}
            {valueFormatter && (
              <>
                &nbsp;-&nbsp;
                <span className="ChartLegend_ItemValue">
                  {valueFormatter(value, { name })}
                </span>
              </>
            )}
          </li>
        ))}
      </ul>
      {items.length > maxItems && showMoreUrl && (
        <Link className="ChartLegend_ShowMoreLink" to={showMoreUrl}>
          Show More
        </Link>
      )}
    </>
  );
}

ChartLegend.propTypes = {
  /**
   * Series for which the legend should be shown. Used to toggle between
   * scenarios on hover in funnel charts.
   */
  'activeSeries': PropTypes.instanceOf(Highcharts.Series),
  /** The Highcharts chart repesented by the legend */
  'chart': PropTypes.instanceOf(Highcharts.Chart),
  /** Additional class(es) to apply to the legend */
  'className': PropTypes.string,
  /** Unique ID for selecting the button in unit/integration tests */
  'data-testid': PropTypes.string.isRequired,
  /** Maximum number of items to display */
  'maxItems': PropTypes.number,
  /**
   * URL for the Show More link shown when the full legend cannot be displayed.
   * Link will be ommitted if undefined.
   */
  'showMoreUrl': PropTypes.string,
  /**
   * Formats the total of each series next to its name. If omitted, the total
   * will not be shown.
   */
  'valueFormatter': PropTypes.func,
  /** Whether to reverse legends items */
  'reverse': PropTypes.bool,
};

export default ChartLegend;
