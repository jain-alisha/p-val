import { useEffect, useRef } from 'react';
import { select, Selection } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { bin, Bin } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';

export default function Histogram({
  pValues,
  alpha,
}: {
  pValues: number[];
  alpha: number;
}) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current || pValues.length === 0) return;

    const width = 680;
    const height = 320;
    const margin = { top: 10, right: 24, bottom: 34, left: 44 };

    const svg = select(ref.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .classed('max-w-full', true);

    svg.selectAll('*').remove();

    const x = scaleLinear().domain([0, 1]).range([margin.left, width - margin.right]);

    const bins: Bin<number, number>[] = bin()
      .domain(x.domain() as [number, number])
      .thresholds(40)(pValues);

    const y = scaleLinear()
      .domain([0, Math.max(...bins.map((b) => b.length))])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // GRID
    svg
      .append('g')
      .attr('stroke', 'currentColor')
      .attr('stroke-opacity', 0.08)
      .selectAll('line')
      .data(y.ticks(6))
      .join('line')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .attr('y1', (d) => y(d))
      .attr('y2', (d) => y(d));

    // X axis
    svg
      .append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(axisBottom(x).ticks(10))
      .call((g: Selection<SVGGElement, unknown, null, undefined>) =>
        g
          .append('text')
          .attr('x', width - margin.right)
          .attr('y', -6)
          .attr('text-anchor', 'end')
          .attr('fill', 'currentColor')
          .text('p-value'),
      );

    // Y axis
    svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(axisLeft(y).ticks(6))
      .call((g: Selection<SVGGElement, unknown, null, undefined>) => g.select('.domain').remove());

    // Bars (rose for p<α, indigo otherwise)
    svg
      .selectAll<SVGRectElement, Bin<number, number>>('rect')
      .data(bins)
      .join('rect')
      .attr('x', (d) => x(d.x0!))
      .attr('y', (d) => y(d.length))
      .attr('width', (d) => Math.max(0, x(d.x1!) - x(d.x0!) - 1))
      .attr('height', (d) => y(0) - y(d.length))
      .attr('rx', 2)
      .attr('fill', (d) => (d.x1! <= alpha ? '#f43f5e' : '#6366f1')); // rose-500 / indigo-500

    // α line
    svg
      .append('line')
      .attr('x1', x(alpha))
      .attr('x2', x(alpha))
      .attr('y1', margin.top)
      .attr('y2', height - margin.bottom)
      .attr('stroke', 'currentColor')
      .attr('stroke-dasharray', '4 2');

    svg
      .append('text')
      .attr('x', x(alpha) + 6)
      .attr('y', margin.top + 14)
      .attr('font-weight', 600)
      .attr('fill', 'currentColor')
      .text(`α = ${alpha}`);
  }, [pValues, alpha]);

  return (
    <figure className="overflow-x-auto border rounded-xl bg-white/70 dark:bg-zinc-800/50 shadow-sm">
      <svg ref={ref} />
      <figcaption className="text-center text-sm py-2 text-zinc-600 dark:text-zinc-400">
        Histogram of simulated p-values (red &lt; α)
      </figcaption>
    </figure>
  );
}
