import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { TeamStats as TeamStatsType } from '../../types';
import Card from '../common/Card';
import './TeamStats.scss';

interface TeamStatsProps {
  stats: TeamStatsType;
}

const TeamStats: React.FC<TeamStatsProps> = ({ stats }) => {
  const winLossChartRef = useRef<SVGSVGElement>(null);
  const venueChartRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (winLossChartRef.current) {
      createWinLossChart();
    }
    
    if (venueChartRef.current) {
      createVenueChart();
    }
  }, [stats]);
  
  const createWinLossChart = () => {
    const svg = d3.select(winLossChartRef.current);
    svg.selectAll('*').remove();
    
    const width = 200;
    const height = 200;
    const margin = 40;
    const radius = Math.min(width, height) / 2 - margin;
    
    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);
    
    const data = [
      { label: 'Wins', value: stats.overall.wins, color: '#4CAF50' },
      { label: 'Losses', value: stats.overall.losses, color: '#F44336' },
      { label: 'No Result', value: stats.overall.no_results, color: '#9E9E9E' }
    ];
    
    const pie = d3.pie<any>()
      .value(d => d.value)
      .sort(null);
    
    const arc = d3.arc<any>()
      .innerRadius(radius * 0.5)
      .outerRadius(radius);
    
    const arcs = g.selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');
    
    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => d.data.color);
    
    // Add labels
    arcs.append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#fff')
      .attr('font-size', '12px')
      .text(d => d.data.value > 0 ? d.data.value : '');
    
    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height - 10})`)
      .attr('text-anchor', 'middle');
    
    data.forEach((d, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(${(i - 1) * 60}, 0)`);
      
      legendItem.append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', d.color);
      
      legendItem.append('text')
        .attr('x', 16)
        .attr('y', 10)
        .attr('font-size', '10px')
        .text(d.label);
    });
  };
  
  const createVenueChart = () => {
    const svg = d3.select(venueChartRef.current);
    svg.selectAll('*').remove();
    
    const width = 400;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 60, left: 40 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
    // Filter venues with at least 2 matches
    const venues = stats.venues.filter(v => v.matches >= 2).slice(0, 5);
    
    const x = d3.scaleBand()
      .domain(venues.map(v => v.venue))
      .range([0, chartWidth])
      .padding(0.2);
    
    const y = d3.scaleLinear()
      .domain([0, 100])
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
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`))
      .attr('font-size', '10px');
    
    // Add bars
    g.selectAll('.bar')
      .data(venues)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.venue) || 0)
      .attr('y', d => y(d.win_percentage))
      .attr('width', x.bandwidth())
      .attr('height', d => chartHeight - y(d.win_percentage))
      .attr('fill', '#4CAF50');
    
    // Add labels
    g.selectAll('.label')
      .data(venues)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => (x(d.venue) || 0) + x.bandwidth() / 2)
      .attr('y', d => y(d.win_percentage) - 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .text(d => `${Math.round(d.win_percentage)}%`);
    
    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .text('Win Percentage by Venue');
  };
  
  return (
    <div className="team-stats">
      <div className="team-stats__row">
        <Card title="Overall Performance" className="team-stats__card">
          <div className="team-stats__overall">
            <div className="team-stats__chart">
              <svg ref={winLossChartRef} width="200" height="200" viewBox="0 0 200 200"></svg>
            </div>
            <div className="team-stats__summary">
              <div className="team-stats__summary-item">
                <span className="team-stats__summary-label">Matches</span>
                <span className="team-stats__summary-value">{stats.overall.matches}</span>
              </div>
              <div className="team-stats__summary-item">
                <span className="team-stats__summary-label">Win Rate</span>
                <span className="team-stats__summary-value">
                  {stats.overall.win_percentage.toFixed(1)}%
                </span>
              </div>
              <div className="team-stats__summary-item">
                <span className="team-stats__summary-label">Points</span>
                <span className="team-stats__summary-value team-stats__summary-value--highlight">
                  {stats.overall.points}
                </span>
              </div>
              <div className="team-stats__summary-item">
                <span className="team-stats__summary-label">Net RR</span>
                <span className={`team-stats__summary-value ${stats.overall.net_run_rate >= 0 ? 'team-stats__summary-value--positive' : 'team-stats__summary-value--negative'}`}>
                  {stats.overall.net_run_rate.toFixed(3)}
                </span>
              </div>
            </div>
          </div>
        </Card>
        
        <Card title="Batting & Bowling" className="team-stats__card">
          <div className="team-stats__performance">
            <div className="team-stats__performance-section">
              <h4 className="team-stats__performance-title">Batting</h4>
              <div className="team-stats__performance-stats">
                <div className="team-stats__performance-stat">
                  <span className="team-stats__performance-label">Total Runs</span>
                  <span className="team-stats__performance-value">{stats.batting.total_runs}</span>
                </div>
                <div className="team-stats__performance-stat">
                  <span className="team-stats__performance-label">Average</span>
                  <span className="team-stats__performance-value">
                    {stats.batting.batting_average.toFixed(2)}
                  </span>
                </div>
                <div className="team-stats__performance-stat">
                  <span className="team-stats__performance-label">Run Rate</span>
                  <span className="team-stats__performance-value">
                    {stats.batting.run_rate.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="team-stats__performance-section">
              <h4 className="team-stats__performance-title">Bowling</h4>
              <div className="team-stats__performance-stats">
                <div className="team-stats__performance-stat">
                  <span className="team-stats__performance-label">Wickets</span>
                  <span className="team-stats__performance-value">{stats.bowling.wickets_taken}</span>
                </div>
                <div className="team-stats__performance-stat">
                  <span className="team-stats__performance-label">Average</span>
                  <span className="team-stats__performance-value">
                    {stats.bowling.bowling_average.toFixed(2)}
                  </span>
                </div>
                <div className="team-stats__performance-stat">
                  <span className="team-stats__performance-label">Economy</span>
                  <span className="team-stats__performance-value">
                    {stats.bowling.economy_rate.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="team-stats__row">
        <Card title="Venue Performance" className="team-stats__card team-stats__card--full">
          <div className="team-stats__venues">
            <svg ref={venueChartRef} width="100%" height="200" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet"></svg>
          </div>
        </Card>
      </div>
      
      <div className="team-stats__row">
        <Card title="Top Performers" className="team-stats__card team-stats__card--full">
          <div className="team-stats__top-performers">
            <div className="team-stats__top-performers-section">
              <h4 className="team-stats__top-performers-title">Batsmen</h4>
              <div className="team-stats__top-performers-list">
                {stats.top_performers.batsmen.map((player, index) => (
                  <div key={player.id} className="team-stats__top-performer">
                    <span className="team-stats__top-performer-rank">{index + 1}</span>
                    <span className="team-stats__top-performer-name">{player.name}</span>
                    <span className="team-stats__top-performer-stat">{player.runs} runs</span>
                    <span className="team-stats__top-performer-stat">Avg: {player.average.toFixed(2)}</span>
                    <span className="team-stats__top-performer-stat">SR: {player.strike_rate.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="team-stats__top-performers-section">
              <h4 className="team-stats__top-performers-title">Bowlers</h4>
              <div className="team-stats__top-performers-list">
                {stats.top_performers.bowlers.map((player, index) => (
                  <div key={player.id} className="team-stats__top-performer">
                    <span className="team-stats__top-performer-rank">{index + 1}</span>
                    <span className="team-stats__top-performer-name">{player.name}</span>
                    <span className="team-stats__top-performer-stat">{player.wickets} wickets</span>
                    <span className="team-stats__top-performer-stat">Avg: {player.average.toFixed(2)}</span>
                    <span className="team-stats__top-performer-stat">Econ: {player.economy_rate.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TeamStats;