import React from 'react';
import { Commentary as CommentaryType } from '../../types';
import Card from '../common/Card';
import './Commentary.scss';

interface CommentaryProps {
  commentary: CommentaryType[];
}

const Commentary: React.FC<CommentaryProps> = ({ commentary }) => {
  // Group commentary by overs
  const commentaryByOver: { [key: string]: CommentaryType[] } = {};
  
  commentary.forEach(ball => {
    const overKey = `${ball.innings_number}.${ball.over_number}`;
    if (!commentaryByOver[overKey]) {
      commentaryByOver[overKey] = [];
    }
    commentaryByOver[overKey].push(ball);
  });
  
  // Sort overs in descending order (most recent first)
  const sortedOvers = Object.keys(commentaryByOver).sort((a, b) => {
    const [aInnings, aOver] = a.split('.').map(Number);
    const [bInnings, bOver] = b.split('.').map(Number);
    
    if (aInnings !== bInnings) {
      return bInnings - aInnings;
    }
    return bOver - aOver;
  });
  
  return (
    <Card title="Commentary" className="commentary">
      {sortedOvers.map(overKey => {
        const [inningsNumber, overNumber] = overKey.split('.').map(Number);
        const balls = commentaryByOver[overKey].sort((a, b) => b.ball_number - a.ball_number);
        
        return (
          <div key={overKey} className="commentary__over">
            <div className="commentary__over-header">
              <span className="commentary__over-number">
                Innings {inningsNumber}, Over {overNumber}
              </span>
            </div>
            
            <div className="commentary__balls">
              {balls.map(ball => (
                <div 
                  key={`${ball.innings_number}.${ball.over_number}.${ball.ball_number}`} 
                  className={`commentary__ball ${ball.is_wicket ? 'commentary__ball--wicket' : ''} ${ball.is_boundary ? 'commentary__ball--boundary' : ''}`}
                >
                  <div className="commentary__ball-header">
                    <span className="commentary__ball-number">
                      {overNumber}.{ball.ball_number}
                    </span>
                    <span className={`commentary__ball-runs ${ball.runs_scored > 0 ? 'commentary__ball-runs--scored' : ''}`}>
                      {ball.runs_scored} {ball.runs_scored === 1 ? 'run' : 'runs'}
                    </span>
                  </div>
                  <div className="commentary__text">
                    {ball.commentary_text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      
      {sortedOvers.length === 0 && (
        <div className="commentary__empty">
          <p>No commentary available for this match.</p>
        </div>
      )}
    </Card>
  );
};

export default Commentary;