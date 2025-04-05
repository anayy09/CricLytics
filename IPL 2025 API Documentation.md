## IPL 2025 API Documentation

This document describes four API endpoints providing IPL 2025 match schedules, team standings, top run scorers, and leading wicket-takers. competition-id for IPL 2025 is 203

---

### 1. Match Schedule API

**Endpoint:**

```
https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/feeds/{competition-id}-matchschedule.js
```

Example:
```
https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/feeds/203-matchschedule.js
```

**Response Format:** JSONP (`MatchSchedule({...})`)

**Response Structure:**

- `Matchsummary` _(Array)_: Details about scheduled matches.
  - `CompetitionID` _(Integer)_: Competition identifier.
  - `MatchID` _(Integer)_: Unique match identifier.
  - `MatchTypeID` _(Integer)_: Type identifier (e.g., T20, T20 D/N).
  - `MatchType` _(String)_: Match format (e.g., `"T20 (N)"`).
  - `MatchStatus` _(String)_: Status (`"Post"` for completed, `"Upcoming"` for upcoming, `"Live"` for ongoing).
  - `MatchDate` _(String)_: Date of the match.
  - `MatchTime` _(String)_: Start time (local).
  - `GroundName` _(String)_: Venue name.
  - `HomeTeamName`, `AwayTeamName` _(String)_: Participating teams.
  - `FirstBattingSummary`, `SecondBattingSummary` _(String)_: Team scores summary.
  - `WinningTeamID` _(String)_: ID of the winning team.
  - `Comments` _(String)_: Match result comments (e.g., `"Lucknow Super Giants Won by 12 Runs"`).
  - Player details (e.g., `BowlerOvers`, `StrikerRuns`, `NonStrikerRuns`) for live data.
  - `MOM` _(String)_: Player of the match name.
  - `PostMatchCommentary` _(HTML String)_: Detailed commentary post-match.

---

### 2. Team Standings API

**Endpoint:**

```
https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/feeds/stats/{competition-id}-groupstandings.js
```

Example:
```
https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/feeds/stats/203-groupstandings.js
```

**Response Format:** JSONP (`ongroupstandings({...})`)

**Response Structure:**

- `points` _(Array)_: Standings information.
  - `TeamName` _(String)_: Team name.
  - `TeamCode` _(String)_: Short team code (e.g., `"PBKS"`).
  - `Matches` _(String)_: Total matches played.
  - `Wins`, `Loss`, `Draw`, `Tied`, `NoResult` _(String)_: Result counts.
  - `Points` _(String)_: Total points earned.
  - `NetRunRate` _(String)_: Team's net run rate.
  - `Performance` _(String)_: Recent match results (e.g., `"W,W"`).
  - `TeamLogo` _(URL String)_: Team logo image URL.
  - `PrevPosition`, `OrderNo`, `Status` _(String)_: Position and status changes compared to previous standings.

---

### 3. Top Run Scorers API

**Endpoint:**

```
https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/feeds/stats/{competition-id}-toprunsscorers.js
```

Example:
```
https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/feeds/stats/203-toprunsscorers.js
```

**Response Format:** JSONP (`ontoprunsscorers({...})`)

**Response Structure:**

- `toprunsscorers` _(Array)_: Leading run scorers.
  - `StrikerName` _(String)_: Player name.
  - `TeamName` _(String)_: Team name.
  - `Matches` _(String)_: Matches played.
  - `TotalRuns` _(String)_: Total runs scored.
  - `HighestScore` _(String)_: Best individual score.
  - `BattingAverage` _(String)_: Batting average.
  - `StrikeRate` _(String)_: Strike rate.
  - `Fours`, `Sixes` _(String)_: Count of boundaries hit.
  - `FiftyPlusRuns`, `Centuries` _(String)_: Number of 50+ and 100+ scores.
  - `PlayerId`, `StrikerID` _(String)_: Player identifiers.

---

### 4. Most Wickets API

**Endpoint:**

```
https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/feeds/stats/{competition-id}-mostwickets.js
```

Example:
```
https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/feeds/stats/203-mostwickets.js
```

**Response Format:** JSONP (`onmostwickets({...})`)

**Response Structure:**

- `mostwickets` _(Array)_: Leading wicket-takers.
  - `BowlerName` _(String)_: Player name.
  - `TeamName` _(String)_: Team name.
  - `Matches` _(String)_: Matches played.
  - `Wickets` _(String)_: Total wickets taken.
  - `Best Bowling in Innings` (`BBIW`) _(String)_: Best innings performance (e.g., `"18/4"` means 4 wickets for 18 runs).
  - `EconomyRate` _(String)_: Economy rate (runs per over).
  - `BowlingAverage` _(String)_: Average runs per wicket.
  - `BowlingSR` _(String)_: Bowling strike rate (balls per wicket).
  - `DotBallsBowled` _(String)_: Total dot balls delivered.
  - `Fours`, `Sixes` _(String)_: Boundaries conceded.
  - `PlayerId`, `BowlerID` _(String)_: Player identifiers.

---

### Usage Notes:

- APIs respond using JSONP; you'll need to parse or strip the wrapping function calls (`MatchSchedule`, `ongroupstandings`, etc.).
- Use `CompetitionID` to specify different tournaments or seasons.
- Use provided URLs directly; they're publicly accessible and do not require authentication.