const width = 1000,
height = 500,
padding = { top: 125, bottom: 125, left: 100, right: 75 },
legendWidth = 400,
legendHeight = 15;

const svg = d3.select("#dataviz").
append("svg").
attr("height", height + padding.top + padding.bottom).
attr("width", width + padding.left + padding.right).
style("background-color", "white");

fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json").
then(response => response.json()).
then(data => {
  const baseTemp = data.baseTemperature,
  tempData = data.monthlyVariance,
  myYears = [...new Set(d3.map(tempData, d => d.year))],
  myMonths = [...new Set(d3.map(tempData, d => d.month))],
  maxVariance = d3.max(d3.map(tempData, d => Math.abs(d.variance))),
  parseMonth = d3.timeParse('%m'),
  monthName = d3.timeFormat('%B'),
  getMonths = d => monthName(parseMonth(d));

  // console.log(tempData)

  const colorScale = d3.scaleSequential().
  interpolator(d3.interpolateRdYlBu).
  domain([maxVariance, -maxVariance]);
  // console.log(colorScale(-maxVariance))

  const xScale = d3.scaleBand().
  range([0, width]).
  domain(d3.map(tempData, d => d.year));

  const yScale = d3.scaleBand().
  range([0, height]).
  domain(d3.map(tempData, d => getMonths(d.month)));

  const heatMap = svg.append('g').
  attr('transform', `translate(${padding.left},${padding.top})`);

  const tooltip = d3.select('#dataviz').
  append('div').
  attr('id', 'tooltip').
  style('opacity', 0).
  style('background-color', 'white').
  style('padding', '8px').
  style('position', 'absolute');

  heatMap.selectAll('rect').
  data(tempData).
  enter().
  append('rect').
  attr('class', 'cell').
  attr('x', d => xScale(d.year)).
  attr('y', d => yScale(getMonths(d.month))).
  attr('width', xScale.bandwidth()).
  attr('height', yScale.bandwidth()).
  attr('data-month', d => d.month - 1).
  attr('data-year', d => d.year).
  attr('data-temp', d => d.variance).
  style('fill', d => colorScale(d.variance)).
  on('mouseenter', (e, d) => {
    tooltip.transition().
    duration(200).
    style('opacity', .8);
    tooltip.html(
    getMonths(d.month) + " " + d.year + '<br>' + (data.baseTemperature + d.variance).toFixed(1) + '&#8451;, a variance of ' + d.variance.toFixed(1) + '&#8451;').
    style('left', e.pageX + 20 + 'px').
    style('top', e.pageY - 60 + 'px').
    attr('data-year', d.year);

  }).
  on('mouseout', () => {tooltip.transition().
    duration(200).
    style('opacity', 0);
  });

  const xAxis = heatMap.append('g').
  call(d3.axisBottom(xScale).
  tickValues(xScale.domain().filter(d => !(d % 10)))).

  attr('id', 'x-axis').
  attr('transform', `translate(0,${height})`);
  // console.log(typeof(yScale))

  const yAxis = heatMap.append('g').
  call(d3.axisLeft(yScale)).
  attr('id', 'y-axis').
  style('font-size', '14px');

  heatMap.append("text").
  attr("x", width / 2).
  attr("y", -padding.top / 2).
  attr("text-anchor", "middle").
  attr('id', 'title').
  style("font-size", "22px").
  text("Monthly Global Surface Temperature Variance");
  // console.log(tempData.year)
  heatMap.append("text").
  attr("x", width / 2).
  attr("y", -padding.top / 4)
  // .attr("alignment-baseline", "hanging")
  .attr("text-anchor", "middle").
  attr('id', 'description').
  style("font-size", "19px").
  html(d3.min(myYears) + '-' + d3.max(myYears) + " with base temperature at " + data.baseTemperature + '&#8451;');

  //legend
  const linearGradient = heatMap.append('linearGradient').
  attr('id', 'linear-gradient').
  attr('x1', '0%').
  attr('y1', '0%').
  attr('x2', '100%').
  attr('y2', '0%');

  linearGradient.selectAll('stop').
  data([
  { offset: '0%', color: colorScale(-maxVariance) },
  { offset: '50%', color: colorScale(0) },
  { offset: '100%', color: colorScale(maxVariance) }]).

  enter().
  append('stop').
  attr('offset', d => d.offset).
  attr('stop-color', d => d.color);

  //create legend color bar
  const legendsvg = heatMap.append('g').
  attr('id', 'legend').
  attr('transform', `translate(${width / 2 - legendWidth / 2},${height + padding.bottom / 2})`);

  legendsvg.append('rect')
  // .attr("x", 0)
  // .attr("y", 0)
  .attr("width", legendWidth).
  attr("height", legendHeight).
  style("fill", "url(#linear-gradient)");

  const legendScale = d3.scaleLinear().
  domain([-maxVariance, maxVariance]).
  range([0, legendWidth]);

  const legendXAxis = legendsvg.append('g').
  call(d3.axisBottom(legendScale).
  tickFormat(x => x > 0 ? "+" + x.toFixed(2) + '\u00B0C' : x.toFixed(2) + '\u00B0C').
  tickValues([-maxVariance,
  -maxVariance / 2,
  0,
  maxVariance / 2,
  maxVariance])).

  attr('transform', `translate(0,${legendHeight})`);

  legendsvg.append('text').
  attr('id', 'legend-title').
  style('font-size', '15px').
  attr('x', legendWidth / 2).
  attr('y', -5).
  attr('text-anchor', 'middle').
  html('Average Global Surface Temperature Variance');








});