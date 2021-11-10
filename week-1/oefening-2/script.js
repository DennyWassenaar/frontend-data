const width = 800;
const height = 600;

// Creates sources <svg> element
const svg = d3.select('body').append('svg')
.attr('width', width)
.attr('height', height);

const g = svg.append('g')
.attr('transform', `translate(${width/2}, ${height/2})`);

const data = [1, 2, 0.5, 1, 1.5];

const radius = Math.min(width, height) / 2;

const color = d3.scaleOrdinal(d3.schemeCategory10);

const arc = d3.arc()
.outerRadius(radius - 10)
.innerRadius(0);

const pie = d3.pie();

const pied_data = pie(data);

const arcs = g.selectAll('.arc').data(pied_data).join(
  (enter) => enter.append('path')
  .attr('class', 'arc')
  .style('stroke', 'white')
);

arcs.attr('d', arc)
  .style('fill', (d, i) => color(i));