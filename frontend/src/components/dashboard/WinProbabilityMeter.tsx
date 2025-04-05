import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { WinProbability } from '../../types';
import Card from '../common/Card';
import './WinProbabilityMeter.scss';

interface WinProbabilityMeterProps {
  winProbability: WinProbability;
  homeTeam: { name: string; primary_color: string } | null;
  awayTeam: { name: string; primary_color: string } | null;
}

const WinProbabilityMeter: React.FC<WinProbabilityMeterProps> = ({ 
  winProbability, 
  homeTeam, 
  awayTeam 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    const width = 300;
    const height = 20;
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    
    const homeProb = winProbability.home_team_probability;
    const awayProb = winProbability.away_team_probability;
    
    // Create gradient
    const defs = svg.append('defs');
    
    const gradient = defs.append('linearGradient')
      .attr('id', 'win-probability-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');
    
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', homeTeam?.primary_color || '#4CAF50');
    
    gradient.append('stop')
      .attr('offset', `${homeProb * 100}%`)
      .attr('stop-color', homeTeam?.primary_color || '#4CAF50');
    
    gradient.append('stop')
      .attr('offset', `${homeProb * 100}%`)
      .attr('stop-color', awayTeam?.primary_color || '#F44336');
    
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', awayTeam?.primary_color || '#F44336');
    
    // Draw bar
    svg.append('rect')
      .attr('x', margin.left)
      .attr('y', margin.top)
      .attr('width', width - margin.left - margin.right)
      .attr('height', height - margin.top - margin.bottom)
      .attr('rx', 5)
      .attr('ry', 5)
      .style('fill', 'url(#win-probability-gradient)');
    
    // Add marker for current probability
    svg.append('line')
      .attr('x1', margin.left + (width - margin.left - margin.right) * homeProb)
      .attr('y1', margin.top - 5)
      .attr('x2', margin.left + (width - margin.left - margin.right) * homeProb)
      .attr('y2', height + 5)
      .style('stroke', '#333')
      .style('stroke-width', 2);
    
  }, [winProbability, homeTeam, awayTeam]);
  
  return (
    <Card title="Win Probability" className="win-probability-meter">
      <div className="win-probability-meter__teams">
        <div className="win-probability-meter__team">
          <span className="win-probability-meter__team-name">{homeTeam?.name || 'Home Team'}</span>
          <span className="win-probability-meter__team-prob">
            {Math.round(winProbability.home_team_probability * 100)}%
          </span>
        </div>
        <div className="win-probability-meter__team">
          <span className="win-probability-meter__team-name">{awayTeam?.name || 'Away Team'}</span>
          <span className="win-probability-meter__team-prob">
            {Math.round(winProbability.away_team_probability * 100)}%
          </span>
        </div>
      </div>
      
      <div className="win-probability-meter__chart">
        <svg ref={svgRef} width="100%" height="40" viewBox="0 0 300 40" preserveAspectRatio="xMidYMid meet"></svg>
      </div>
      
      <p className="win-probability-meter__message">{winProbability.message}</p>
    </Card>
  );
};

export default WinProbabilityMeter;