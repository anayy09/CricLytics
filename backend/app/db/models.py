from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base

# Association tables
player_team_association = Table(
    'player_team_association',
    Base.metadata,
    Column('player_id', Integer, ForeignKey('players.id')),
    Column('team_id', Integer, ForeignKey('teams.id'))
)

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    team_code = Column(String, unique=True, index=True)
    name = Column(String, index=True)
    short_name = Column(String)
    logo_url = Column(String)
    primary_color = Column(String)
    secondary_color = Column(String)
    
    # Relationships
    players = relationship("Player", secondary=player_team_association, back_populates="teams")
    home_matches = relationship("Match", foreign_keys="Match.home_team_id", back_populates="home_team")
    away_matches = relationship("Match", foreign_keys="Match.away_team_id", back_populates="away_team")
    
    # Stats
    matches_played = Column(Integer, default=0)
    matches_won = Column(Integer, default=0)
    matches_lost = Column(Integer, default=0)
    matches_tied = Column(Integer, default=0)
    net_run_rate = Column(Float, default=0.0)
    points = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    player_code = Column(String, unique=True, index=True)
    name = Column(String, index=True)
    country = Column(String)
    date_of_birth = Column(DateTime)
    batting_style = Column(String)
    bowling_style = Column(String)
    role = Column(String)  # Batsman, Bowler, All-rounder, Wicket-keeper
    image_url = Column(String)
    
    # Relationships
    teams = relationship("Team", secondary=player_team_association, back_populates="players")
    batting_performances = relationship("BattingPerformance", back_populates="player")
    bowling_performances = relationship("BowlingPerformance", back_populates="player")
    
    # Career stats
    matches = Column(Integer, default=0)
    
    # Batting stats
    runs = Column(Integer, default=0)
    balls_faced = Column(Integer, default=0)
    highest_score = Column(Integer, default=0)
    fifties = Column(Integer, default=0)
    hundreds = Column(Integer, default=0)
    fours = Column(Integer, default=0)
    sixes = Column(Integer, default=0)
    batting_average = Column(Float, default=0.0)
    strike_rate = Column(Float, default=0.0)
    
    # Bowling stats
    wickets = Column(Integer, default=0)
    balls_bowled = Column(Integer, default=0)
    runs_conceded = Column(Integer, default=0)
    best_bowling_figures = Column(String)
    economy_rate = Column(Float, default=0.0)
    bowling_average = Column(Float, default=0.0)
    bowling_strike_rate = Column(Float, default=0.0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    match_code = Column(String, unique=True, index=True)
    season = Column(String)
    date = Column(DateTime)
    venue = Column(String)
    city = Column(String)
    
    home_team_id = Column(Integer, ForeignKey("teams.id"))
    away_team_id = Column(Integer, ForeignKey("teams.id"))
    
    home_team = relationship("Team", foreign_keys=[home_team_id], back_populates="home_matches")
    away_team = relationship("Team", foreign_keys=[away_team_id], back_populates="away_matches")
    
    toss_winner_id = Column(Integer, ForeignKey("teams.id"))
    toss_decision = Column(String)  # Bat or Field
    
    winner_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    win_margin = Column(Integer, nullable=True)
    win_type = Column(String, nullable=True)  # Runs, Wickets, Super Over, etc.
    
    match_status = Column(String)  # Scheduled, Live, Completed, Abandoned
    
    first_innings_score = Column(Integer, nullable=True)
    first_innings_wickets = Column(Integer, nullable=True)
    first_innings_overs = Column(Float, nullable=True)
    
    second_innings_score = Column(Integer, nullable=True)
    second_innings_wickets = Column(Integer, nullable=True)
    second_innings_overs = Column(Float, nullable=True)
    
    # Relationships
    innings = relationship("Innings", back_populates="match")
    commentary = relationship("Commentary", back_populates="match")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Innings(Base):
    __tablename__ = "innings"

    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(Integer, ForeignKey("matches.id"))
    innings_number = Column(Integer)  # 1 or 2
    batting_team_id = Column(Integer, ForeignKey("teams.id"))
    bowling_team_id = Column(Integer, ForeignKey("teams.id"))
    
    total_runs = Column(Integer, default=0)
    total_wickets = Column(Integer, default=0)
    total_overs = Column(Float, default=0.0)
    extras = Column(Integer, default=0)
    
    # Relationships
    match = relationship("Match", back_populates="innings")
    batting_performances = relationship("BattingPerformance", back_populates="innings")
    bowling_performances = relationship("BowlingPerformance", back_populates="innings")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class BattingPerformance(Base):
    __tablename__ = "batting_performances"

    id = Column(Integer, primary_key=True, index=True)
    innings_id = Column(Integer, ForeignKey("innings.id"))
    player_id = Column(Integer, ForeignKey("players.id"))
    
    runs = Column(Integer, default=0)
    balls_faced = Column(Integer, default=0)
    fours = Column(Integer, default=0)
    sixes = Column(Integer, default=0)
    strike_rate = Column(Float, default=0.0)
    
    dismissal_type = Column(String, nullable=True)  # Bowled, Caught, LBW, etc.
    dismissal_bowler_id = Column(Integer, ForeignKey("players.id"), nullable=True)
    dismissal_fielder_id = Column(Integer, ForeignKey("players.id"), nullable=True)
    
    batting_position = Column(Integer)
    
    # Relationships
    innings = relationship("Innings", back_populates="batting_performances")
    player = relationship("Player", back_populates="batting_performances")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class BowlingPerformance(Base):
    __tablename__ = "bowling_performances"

    id = Column(Integer, primary_key=True, index=True)
    innings_id = Column(Integer, ForeignKey("innings.id"))
    player_id = Column(Integer, ForeignKey("players.id"))
    
    overs = Column(Float, default=0.0)
    maidens = Column(Integer, default=0)
    runs = Column(Integer, default=0)
    wickets = Column(Integer, default=0)
    economy_rate = Column(Float, default=0.0)
    dot_balls = Column(Integer, default=0)
    
    # Relationships
    innings = relationship("Innings", back_populates="bowling_performances")
    player = relationship("Player", back_populates="bowling_performances")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Commentary(Base):
    __tablename__ = "commentary"

    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(Integer, ForeignKey("matches.id"))
    innings_number = Column(Integer)
    over_number = Column(Float)
    ball_number = Column(Integer)
    
    commentary_text = Column(String)
    runs_scored = Column(Integer)
    is_wicket = Column(Boolean, default=False)
    is_boundary = Column(Boolean, default=False)
    
    batsman_id = Column(Integer, ForeignKey("players.id"))
    bowler_id = Column(Integer, ForeignKey("players.id"))
    
    # Relationships
    match = relationship("Match", back_populates="commentary")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())