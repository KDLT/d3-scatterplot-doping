import React, { Component } from 'react';
import { scaleLinear, scaleTime } from 'd3-scale';
import { max, min, extent} from 'd3-array';
import { select, event } from 'd3-selection';
import { axisBottom, axisLeft } from 'd3-axis';
import { timeFormat, timeParse } from 'd3-time-format';
import { transition } from 'd3-transition';

class Scatterplot extends Component {
  constructor(props) {
    super(props);
    this.state = {
      height: 500,
      width: 1200,
      padding: 100,
      data: []
    };
    this.fetchData = this.fetchData.bind(this);
    this.createScatterplot = this.createScatterplot.bind(this);
  }
  componentDidMount() {
    console.log('component mounted!');
    let address = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';
    this.fetchData(address);
  };
  componentDidUpdate() {
    console.log('data on update:', this.state.data);
    this.createScatterplot(this.state.data);
  };
  fetchData(address) {
    fetch(address)
      .then(response => response.json())
      .then(data => this.setState({ data: data }));
  };
  createScatterplot(data) {
    console.log('creating scatterplot...');
    const node = this.node,
          h = this.state.height,
          w = this.state.width,
          padding = this.state.padding,
          parseTime = timeParse("%M:%S"),
          formatTime = timeFormat("%M:%S"),
          r = 12;
    // domain of xAxis
    // requires at least two arguments, 01 for january
    const yearArray = data.map(i => new Date(i.Year, 1)); 
    let start = min(extent(yearArray));
    let newStart = new Date(start.getFullYear() - 1, 1);
    let end = max(extent(yearArray));
    let newEnd = new Date(end.getFullYear() + 1, 1);
    // console.log('startyear: ',startYearDomain);
    console.log('yearArray: ',yearArray);
    const xScale = scaleTime()
                    // .domain(extent(yearArray))
                    .domain([newStart, newEnd])
                    .range([padding , w-padding]);
    const xAxis = axisBottom(xScale)
                    .ticks(10);

    const parsedYData = data.map(d => parseTime(d.Time));
    const maxTime = max(parsedYData);
    console.log('parsedYData:',parsedYData);
    console.log('maxTime:', maxTime);
    const yScale = scaleTime()
                    .domain(reverseArray(extent(parsedYData)))
                    .range([h-padding, padding])
                    .nice(10);
    const yAxis = axisLeft(yScale)
                    // .tickValues(parsedYData)
                    .tickFormat((d) => formatTime(d))

    select(node).append('g')
      .attr('id', 'x-axis')
      .attr('transform', `translate(0, ${h-padding})`)
      .call(xAxis);
    select(node).append('g')
      .attr('transform', `translate(${padding}, 0)`)
      .attr('id', 'y-axis')
      .call(yAxis);

    const tooltip = select('#tooltip');

    const handleMouseover = (d) => {
      console.log('moused over');
      tooltip.transition()
        .duration(100)
        .style('opacity', 0.9)
        .style('transform', 'scale(1)')
        .attr('data-year', d.Year)
      tooltip.html(`
        ${d.Name}: ${d.Nationality}<br/>
        Year: ${d.Year}, Time: ${d.Time}
        ${d.Doping ? `<br/><br/>${d.Doping}` : ``}
      `)
    };
    const handleMouseMove = () => {
      tooltip.style('top', `${event.pageY}`)
        .style('left', event.pageX)
    };
    const handleMouseOut = () => {
      tooltip.transition()
        .duration(50)
        .style('opacity', 0)
        .style('transform', 'scale(0)')
    };
    
    select(node).append('g')
      .attr('id', 'plot-area')
      .selectAll('circle')
      .data(data).enter()
      .append('circle')
        .attr('class', 'dot')
        .attr('r', r)
        .attr('cx', d => xScale(new Date(d.Year, 1)))
        .attr('cy', d => yScale(new Date(parseTime(d.Time))))
        .attr('data-xvalue', d => d.Year)
        .attr('data-yvalue', d => new Date(parseTime(d.Time)))
        .on('mouseover', handleMouseover)
        .on('mousemove', handleMouseMove)
        .on('mouseout', handleMouseOut)
        .style('fill', d => d.Doping ? 'red' : 'green')
    
    select(node)
      .attr('viewBox', `0 0 ${Math.max(w, h)} ${Math.min(w, h)}`)
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .append("g")
        .attr("transform", "translate(" + Math.min(w, h) / 2 + "," + Math.max(w, h) / 2 + ")");
  };
  render() {
    return(
      <div>
        <svg ref={node => this.node = node}>
          <text id='title' x='50%' y='50px'>Doping in Pro Bicycle Racing</text>
          <g id='legend'>
            <rect id='legend-square' x={this.state.width*.75} y={100} fill={'red'}></rect>
            <rect id='legend-square' x={this.state.width*.75} y={140} fill={'green'}></rect>
            <text id='legend-label' x={this.state.width*.78} y={120}>with doping allegations</text>
            <text id='legend-label' x={this.state.width*.78} y={160}>without doping allegations</text>
          </g>
          <text id='y-axis-label' style={{'transform': `translate(${this.state.padding/2}px,50%) rotate(-90deg)`}}>Time in Minutes</text>
        </svg>
        <div id='tooltip' style={{'opacity': 0}}></div>
      </div>
    );
  };
};

export default Scatterplot;

const timeStrToSeconds = (string) => {
  let mins = parseInt(string.slice(0, 2));
  let seconds = parseInt(string.slice(3));
  return (mins*60 + seconds);
}

const reverseArray = (array) => {
  let res = [];
  for (let i of array) res.unshift(i);
  return res;
}

// var svg = d3.select('.chart-container').append("svg")
//   .attr("width", '100%')
//   .attr("height", '100%')
//   .attr('viewBox', '0 0 ' + Math.min(width, height) + ' ' + Math.min(width, height))
//   .attr('preserveAspectRatio', 'xMinYMin')
//   .append("g")
//   .attr("transform", "translate(" + Math.min(width, height) / 2 + "," + Math.min(width, height) / 2 + ")");