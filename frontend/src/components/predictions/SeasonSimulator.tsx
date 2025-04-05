import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { SeasonSimulation } from '../../types';
import Card from '../common/Card';
import './SeasonSimulator.scss';

interface SeasonSimulatorProps {
  simulation: SeasonSimulation;
}

const SeasonSimulator: React.FC<SeasonSimulatorProps> = ({ simulation }) => {
  const chartRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (chartRef.current) {
      createChart();
    }
  }, [simulation]);
  
  const createChart = () => {
    const svg = d3.select(chartRef.current);
    svg.selectAll('*').remove();
    
    const width = 600;
    const height = 400;
    const margin = { top: 40, right: 100, bottom: 60, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    // Sort teams by championship percentage
    const sortedTeams = [...simulation.teams].sort((a, b) => b.championship_percentage - a.championship_percentage);
    
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
    // Create scales
    const x = d3.scaleLinear()
      .domain([0, 100])
      .range([0, chartWidth]);
    
    const y = d3.scaleBand()
      .domain(sortedTeams.map(t => t.team.name))
      .range([0, chartHeight])
      .padding(0.2);
    
    // Add X axis
    g.append('g')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => `${d}%`))
      .selectAll('text')
      .attr('font-size', '12px');
    
    // Add X axis label
    g.append('text')
      .attr('x', chartWidth / 2)
      .attr('y', chartHeight + 40)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .text('Championship Probability (%)');
    
    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .attr('font-size', '12px');
    
    // Add bars for championship percentage
    g.selectAll('.championship-bar')
      .data(sortedTeams)
      .enter()
      .append('rect')
      .attr('class', 'championship-bar')
      .attr('x', 0)
      .attr('y', d => y(d.team.name) || 0)
      .attr('width', d => x(d.championship_percentage))
      .attr('height', y.bandwidth())
      .attr('fill', '#4CAF50');
    
    // Add labels for championship percentage
    g.selectAll('.championship-label')
      .data(sortedTeams)
      .enter()
      .append('text')
      .attr('class', 'championship-label')
      .attr('x', d => x(d.championship_percentage) + 5)
      .attr('y', d => (y(d.team.name) || 0) + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('font-size', '12px')
      .text(d => `${d.championship_percentage.toFixed(1)}%`);
    
    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text(`Championship Probability (${simulation.simulations.toLocaleString()} simulations)`);
  };
  
  return (
    <Card title="Season Simulator" className="season-simulator">
      <div className="season-simulator__info">
        <p>
          Based on {simulation.simulations.toLocaleString()} simulated seasons, 
          taking into account team strength, remaining schedule, and historical performance.
        </p>
      </div>
      
      <div className="season-simulator__chart">
        <svg ref={chartRef} width="100%" height="400" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid meet"></svg>
      </div>
      
      <div className="season-simulator__table-container">
        <table className="season-simulator__table">
          <thead>
            <tr>
              <th>Team</th>
              <th>Playoff %</th>
              <th>Championship %</th>
            </tr>
          </thead>
          <tbody>
            {simulation.teams
              .sort((a, b) => b.championship_percentage - a.championship_percentage)
              .map(team => (
                <tr key={team.team.id}>
                  <td className="season-simulator__team-name">{team.team.name}</td>
                  <td className="season-simulator__percentage">
                    <div className="season-simulator__percentage-bar">
                      <div 
                        className="season-simulator__percentage-fill season-simulator__percentage-fill--playoff" 
                        style={{ width: `${team.playoff_percentage}%` }}
                      ></div>
                    </div>
                    <span className="season-simulator__percentage-value">
                      {team.playoff_percentage.toFixed(1)}%
                    </span>
                  </td>
                  <td className="season-simulator__percentage">
                    <div className="season-simulator__percentage-bar">
                      <div 
                        className="season-simulator__percentage-fill season-simulator__percentage-fill--championship" 
                        style={{ width: `${team.championship_percentage}%` }}
                      ></div>
                    </div>
                    <span className="season-simulator__percentage-value">
                      {team.championship_percentage.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default SeasonSimulator;