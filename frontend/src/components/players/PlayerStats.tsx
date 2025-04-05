import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { PlayerStats as PlayerStatsType } from '../../types';
import Card from '../common/Card';
import './PlayerStats.scss';

interface PlayerStatsProps {
  stats: PlayerStatsType;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ stats }) => {
  const battingChartRef = useRef<SVGSVGElement>(null);
  const bowlingChartRef = useRef<SVGSVGElement>(null);
  const venueChartRef = useRef<SVGSVGElement>(null);
  const careerChartRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (battingChartRef.current) {
      createBattingChart();
    }
    
    if (bowlingChartRef.current) {
      createBowlingChart();
    }
    
    if (venueChartRef.current) {
      createVenueChart();
    }
    
    if (careerChartRef.current) {
      createCareerChart();
    }
  }, [stats]);
  
  const createBattingChart = () => {
    // Only create chart if player has batting stats
    if (stats.player.stats.batting.runs === 0) return;
    
    const svg = d3.select(battingChartRef.current);
    svg.selectAll('*').remove();
    
    const width = 300;
    const height = 300;
    const margin = 50;
    
    // Create radar chart for batting stats
    const features = ['Runs', 'Average', 'Strike Rate', 'Boundaries', 'Consistency'];
    const numFeatures = features.length;
    const angleSlice = (Math.PI * 2) / numFeatures;
    
    // Scale for each feature
    const rScale = d3.scaleLinear()
      .range([0, width / 2 - margin])
      .domain([0, 100]);
    
    // Calculate normalized values (0-100)
    const maxRuns = 800; // Adjust based on your data
    const maxAvg = 60;
    const maxSR = 200;
    const maxBoundaries = 100; // 4s + 6s
    const maxConsistency = 100; // Based on 50s and 100s
    
    const normalizedValues = [
      Math.min(100, (stats.player.stats.batting.runs / maxRuns) * 100),
      Math.min(100, (stats.player.stats.batting.average / maxAvg) * 100),
      Math.min(100, (stats.player.stats.batting.strike_rate / maxSR) * 100),
      Math.min(100, ((stats.player.stats.batting.fours + stats.player.stats.batting.sixes) / maxBoundaries) * 100),
      Math.min(100, ((stats.player.stats.batting.fifties * 0.5 + stats.player.stats.batting.hundreds) / maxConsistency) * 100)
    ];
    
    // Create the container
    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);
    
    // Draw the grid lines
    const gridLevels = 5;
    const axisGrid = g.append('g').attr('class', 'axis-grid');
    
    for (let j = 0; j < gridLevels; j++) {
      const levelFactor = (j + 1) / gridLevels;
      
      // Draw the circles
      axisGrid.append('circle')
        .attr('r', levelFactor * (width / 2 - margin))
        .attr('class', 'grid-circle')
        .style('fill', 'none')
        .style('stroke', '#ddd')
        .style('stroke-dasharray', '3,3');
      
      // Add labels for each level
      axisGrid.append('text')
        .attr('x', 4)
        .attr('y', -levelFactor * (width / 2 - margin))
        .attr('dy', '0.4em')
        .style('font-size', '10px')
        .style('fill', '#999')
        .text(Math.round(levelFactor * 100) + '%');
    }
    
    // Draw the axes
    const axes = g.append('g').attr('class', 'axes');
    
    features.forEach((feature, i) => {
      const angle = i * angleSlice;
      const lineX = Math.cos(angle - Math.PI / 2) * (width / 2 - margin);
      const lineY = Math.sin(angle - Math.PI / 2) * (width / 2 - margin);
      
      // Draw axis line
      axes.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', lineX)
        .attr('y2', lineY)
        .style('stroke', '#ddd')
        .style('stroke-width', 1);
      
      // Add axis label
      axes.append('text')
        .attr('x', Math.cos(angle - Math.PI / 2) * (width / 2 - margin + 10))
        .attr('y', Math.sin(angle - Math.PI / 2) * (width / 2 - margin + 10))
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .text(feature);
    });
    
    // Draw the radar chart shape
    const radarLine = d3.lineRadial<number>()
      .radius(d => rScale(d))
      .angle((d, i) => i * angleSlice);
    
    g.append('path')
      .datum(normalizedValues)
      .attr('class', 'radar-area')
      .attr('d', radarLine as any)
      .style('fill', 'rgba(76, 175, 80, 0.5)')
      .style('stroke', '#4CAF50')
      .style('stroke-width', 2);
    
    // Add dots at each data point
    g.selectAll('.radar-dot')
      .data(normalizedValues)
      .enter()
      .append('circle')
      .attr('class', 'radar-dot')
      .attr('r', 4)
      .attr('cx', (d, i) => rScale(d) * Math.cos(i * angleSlice - Math.PI / 2))
      .attr('cy', (d, i) => rScale(d) * Math.sin(i * angleSlice - Math.PI / 2))
      .style('fill', '#4CAF50');
  };
  
  const createBowlingChart = () => {
    // Only create chart if player has bowling stats
    if (stats.player.stats.bowling.wickets === 0) return;
    
    const svg = d3.select(bowlingChartRef.current);
    svg.selectAll('*').remove();
    
    const width = 300;
    const height = 300;
    const margin = 50;
    
    // Create radar chart for bowling stats
    const features = ['Wickets', 'Economy', 'Average', 'Strike Rate', 'Dot Balls'];
    const numFeatures = features.length;
    const angleSlice = (Math.PI * 2) / numFeatures;
    
    // Scale for each feature
    const rScale = d3.scaleLinear()
      .range([0, width / 2 - margin])
      .domain([0, 100]);
    
    // Calculate normalized values (0-100)
    const maxWickets = 30;
    const maxEconomy = 12; // Lower is better, so we invert
    const maxAvg = 40; // Lower is better, so we invert
    const maxSR = 30; // Lower is better, so we invert
    const maxDotBalls = 200;
    
    const normalizedValues = [
      Math.min(100, (stats.player.stats.bowling.wickets / maxWickets) * 100),
      Math.min(100, 100 - (stats.player.stats.bowling.economy_rate / maxEconomy) * 100), // Inverted
      Math.min(100, 100 - (stats.player.stats.bowling.average / maxAvg) * 100), // Inverted
      Math.min(100, 100 - (stats.player.stats.bowling.strike_rate / maxSR) * 100), // Inverted
      Math.min(100, (stats.player.stats.bowling.balls_bowled * 0.4 / maxDotBalls) * 100) // Estimate dot balls as 40% of balls
    ];
    
    // Create the container
    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);
    
    // Draw the grid lines
    const gridLevels = 5;
    const axisGrid = g.append('g').attr('class', 'axis-grid');
    
    for (let j = 0; j < gridLevels; j++) {
      const levelFactor = (j + 1) / gridLevels;
      
      // Draw the circles
      axisGrid.append('circle')
        .attr('r', levelFactor * (width / 2 - margin))
        .attr('class', 'grid-circle')
        .style('fill', 'none')
        .style('stroke', '#ddd')
        .style('stroke-dasharray', '3,3');
      
      // Add labels for each level
      axisGrid.append('text')
        .attr('x', 4)
        .attr('y', -levelFactor * (width / 2 - margin))
        .attr('dy', '0.4em')
        .style('font-size', '10px')
        .style('fill', '#999')
        .text(Math.round(levelFactor * 100) + '%');
    }
    
    // Draw the axes
    const axes = g.append('g').attr('class', 'axes');
    
    features.forEach((feature, i) => {
      const angle = i * angleSlice;
      const lineX = Math.cos(angle - Math.PI / 2) * (width / 2 - margin);
      const lineY = Math.sin(angle - Math.PI / 2) * (width / 2 - margin);
      
      // Draw axis line
      axes.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', lineX)
        .attr('y2', lineY)
        .style('stroke', '#ddd')
        .style('stroke-width', 1);
      
      // Add axis label
      axes.append('text')
        .attr('x', Math.cos(angle - Math.PI / 2) * (width / 2 - margin + 10))
        .attr('y', Math.sin(angle - Math.PI / 2) * (width / 2 - margin + 10))
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .text(feature);
    });
    
    // Draw the radar chart shape
    const radarLine = d3.lineRadial<number>()
      .radius(d => rScale(d))
      .angle((d, i) => i * angleSlice);
    
    g.append('path')
      .datum(normalizedValues)
      .attr('class', 'radar-area')
      .attr('d', radarLine as any)
      .style('fill', 'rgba(244, 67, 54, 0.5)')
      .style('stroke', '#F44336')
      .style('stroke-width', 2);
    
    // Add dots at each data point
    g.selectAll('.radar-dot')
      .data(normalizedValues)
      .enter()
      .append('circle')
      .attr('class', 'radar-dot')
      .attr('r', 4)
      .attr('cx', (d, i) => rScale(d) * Math.cos(i * angleSlice - Math.PI / 2))
      .attr('cy', (d, i) => rScale(d) * Math.sin(i * angleSlice - Math.PI / 2))
      .style('fill', '#F44336');
  };
  
  const createVenueChart = () => {
    const svg = d3.select(venueChartRef.current);
    svg.selectAll('*').remove();
    
    const width = 400;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 60, left: 40 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    // Filter venues with at least 1 innings
    const venues = stats.venue_stats.batting
      .filter(v => v.innings >= 1)
      .sort((a, b) => b.runs - a.runs)
      .slice(0, 5);
    
    if (venues.length === 0) return;
    
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
    const x = d3.scaleBand()
      .domain(venues.map(v => v.venue))
      .range([0, chartWidth])
      .padding(0.2);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(venues, d => d.runs) || 100])
      .range([chartHeight, 0]);
    
    // Add X axis
    g.append('g')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .attr('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('font-size', '10px');
    
    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .attr('font-size', '10px');
    
    // Add bars
    g.selectAll('.bar')
      .data(venues)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.venue) || 0)
      .attr('y', d => y(d.runs))
      .attr('width', x.bandwidth())
      .attr('height', d => chartHeight - y(d.runs))
      .attr('fill', '#4CAF50');
    
    // Add labels
    g.selectAll('.label')
      .data(venues)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => (x(d.venue) || 0) + x.bandwidth() / 2)
      .attr('y', d => y(d.runs) - 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .text(d => d.runs);
    
    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .text('Runs by Venue');
  };
  
  const createCareerChart = () => {
    const svg = d3.select(careerChartRef.current);
    svg.selectAll('*').remove();
    
    const width = 400;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    // For a real application, we would have career progression data over time
    // Here we'll just create a simple line chart with the current stats
    
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
    // Create some dummy data for career progression
    const data = [
      { match: 1, runs: stats.career_progression.runs * 0.1, wickets: stats.career_progression.wickets * 0.1 },
      { match: 5, runs: stats.career_progression.runs * 0.3, wickets: stats.career_progression.wickets * 0.3 },
      { match: 10, runs: stats.career_progression.runs * 0.5, wickets: stats.career_progression.wickets * 0.5 },
      { match: 15, runs: stats.career_progression.runs * 0.7, wickets: stats.career_progression.wickets * 0.7 },
      { match: stats.career_progression.matches, runs: stats.career_progression.runs, wickets: stats.career_progression.wickets }
    ];
    
    const x = d3.scaleLinear()
      .domain([0, stats.career_progression.matches])
      .range([0, chartWidth]);
    
    const yRuns = d3.scaleLinear()
      .domain([0, stats.career_progression.runs * 1.1])
      .range([chartHeight, 0]);
    
    const yWickets = d3.scaleLinear()
      .domain([0, stats.career_progression.wickets * 1.1 || 10])
      .range([chartHeight, 0]);
    
    // Add X axis
    g.append('g')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(d3.axisBottom(x).ticks(5))
      .attr('font-size', '10px');
    
    // Add Y axis for runs
    g.append('g')
      .call(d3.axisLeft(yRuns).ticks(5))
      .attr('font-size', '10px');
    
    // Add Y axis for wickets
    g.append('g')
      .attr('transform', `translate(${chartWidth}, 0)`)
      .call(d3.axisRight(yWickets).ticks(5))
      .attr('font-size', '10px');
    
    // Add runs line
    const runsLine = d3.line<any>()
      .x(d => x(d.match))
      .y(d => yRuns(d.runs));
    
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#4CAF50')
      .attr('stroke-width', 2)
      .attr('d', runsLine);
    
    // Add wickets line
    const wicketsLine = d3.line<any>()
      .x(d => x(d.match))
      .y(d => yWickets(d.wickets));
    
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#F44336')
      .attr('stroke-width', 2)
      .attr('d', wicketsLine);
    
    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - margin.right - 100}, ${margin.top})`);
    
    legend.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 20)
      .attr('y2', 0)
      .attr('stroke', '#4CAF50')
      .attr('stroke-width', 2);
    
    legend.append('text')
      .attr('x', 25)
      .attr('y', 4)
      .attr('font-size', '10px')
      .text('Runs');
    
    legend.append('line')
      .attr('x1', 0)
      .attr('y1', 15)
      .attr('x2', 20)
      .attr('y2', 15)
      .attr('stroke', '#F44336')
      .attr('stroke-width', 2);
    
    legend.append('text')
      .attr('x', 25)
      .attr('y', 19)
      .attr('font-size', '10px')
      .text('Wickets');
  };
  
  return (
    <div className="player-stats">
      <div className="player-stats__row">
        <Card title="Batting Performance" className="player-stats__card">
          <div className="player-stats__chart">
            <svg ref={battingChartRef} width="300" height="300" viewBox="0 0 300 300"></svg>
          </div>
          <div className="player-stats__summary">
            <div className="player-stats__summary-item">
              <span className="player-stats__summary-label">Runs</span>
              <span className="player-stats__summary-value">{stats.player.stats.batting.runs}</span>
            </div>
            <div className="player-stats__summary-item">
              <span className="player-stats__summary-label">Average</span>
              <span className="player-stats__summary-value">
                {stats.player.stats.batting.average.toFixed(2)}
              </span>
            </div>
            <div className="player-stats__summary-item">
              <span className="player-stats__summary-label">Strike Rate</span>
              <span className="player-stats__summary-value">
                {stats.player.stats.batting.strike_rate.toFixed(2)}
              </span>
            </div>
            <div className="player-stats__summary-item">
              <span className="player-stats__summary-label">Highest</span>
              <span className="player-stats__summary-value">
                {stats.player.stats.batting.highest_score}
              </span>
            </div>
            <div className="player-stats__summary-item">
              <span className="player-stats__summary-label">50s / 100s</span>
              <span className="player-stats__summary-value">
                {stats.player.stats.batting.fifties} / {stats.player.stats.batting.hundreds}
              </span>
            </div>
            <div className="player-stats__summary-item">
              <span className="player-stats__summary-label">4s / 6s</span>
              <span className="player-stats__summary-value">
                {stats.player.stats.batting.fours} / {stats.player.stats.batting.sixes}
              </span>
            </div>
          </div>
        </Card>
        
        <Card title="Bowling Performance" className="player-stats__card">
          <div className="player-stats__chart">
            <svg ref={bowlingChartRef} width="300" height="300" viewBox="0 0 300 300"></svg>
          </div>
          <div className="player-stats__summary">
            <div className="player-stats__summary-item">
              <span className="player-stats__summary-label">Wickets</span>
              <span className="player-stats__summary-value">{stats.player.stats.bowling.wickets}</span>
            </div>
            <div className="player-stats__summary-item">
              <span className="player-stats__summary-label">Economy</span>
              <span className="player-stats__summary-value">
                {stats.player.stats.bowling.economy_rate.toFixed(2)}
              </span>
            </div>
            <div className="player-stats__summary-item">
              <span className="player-stats__summary-label">Average</span>
              <span className="player-stats__summary-value">
                {stats.player.stats.bowling.average.toFixed(2)}
              </span>
            </div>
            <div className="player-stats__summary-item">
              <span className="player-stats__summary-label">Strike Rate</span>
              <span className="player-stats__summary-value">
                {stats.player.stats.bowling.strike_rate.toFixed(2)}
              </span>
            </div>
            <div className="player-stats__summary-item">
              <span className="player-stats__summary-label">Best</span>
              <span className="player-stats__summary-value">
                {stats.player.stats.bowling.best_bowling_figures}
              </span>
            </div>
            <div className="player-stats__summary-item">
              <span className="player-stats__summary-label">Balls</span>
              <span className="player-stats__summary-value">
                {stats.player.stats.bowling.balls_bowled}
              </span>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="player-stats__row">
        <Card title="Venue Performance" className="player-stats__card player-stats__card--full">
          <div className="player-stats__venues">
            <svg ref={venueChartRef} width="100%" height="200" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet"></svg>
          </div>
        </Card>
      </div>
      
      <div className="player-stats__row">
        <Card title="Career Progression" className="player-stats__card player-stats__card--full">
          <div className="player-stats__career">
            <svg ref={careerChartRef} width="100%" height="200" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet"></svg>
          </div>
        </Card>
      </div>
      
      <div className="player-stats__row">
        <Card title="Performance Against Teams" className="player-stats__card player-stats__card--full">
          <div className="player-stats__teams">
            <table className="player-stats__table">
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Innings</th>
                  <th>Runs</th>
                  <th>Avg</th>
                  <th>SR</th>
                  <th>Wickets</th>
                  <th>Econ</th>
                  <th>Avg</th>
                </tr>
              </thead>
              <tbody>
                {stats.team_stats.map(team => (
                  <tr key={team.team.id}>
                    <td>{team.team.name}</td>
                    <td>{team.batting.innings}</td>
                    <td>{team.batting.runs}</td>
                    <td>{team.batting.average.toFixed(2)}</td>
                    <td>{team.batting.strike_rate.toFixed(2)}</td>
                    <td>{team.bowling.wickets}</td>
                    <td>{team.bowling.economy.toFixed(2)}</td>
                    <td>{team.bowling.average === Infinity ? '-' : team.bowling.average.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PlayerStats;