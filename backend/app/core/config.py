from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database settings
    DATABASE_URL: str = "postgresql://postgres:Arpan%4001@localhost:5432/ipl2025"
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # API settings
    API_PREFIX: str = "/api"
    
    # Data source URLs
    MATCH_SCHEDULE_URL: str = "https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/feeds/203-matchschedule.js"
    TEAM_STANDINGS_URL: str = "https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/feeds/stats/203-groupstandings.js"
    TOP_SCORERS_URL: str = "https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/feeds/stats/203-toprunsscorers.js"
    MOST_WICKETS_URL: str = "https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/feeds/stats/203-mostwickets.js"
    
    # Cricsheet data URL
    CRICSHEET_IPL_URL: str = "https://cricsheet.org/downloads/ipl.zip"
    
    class Config:
        env_file = ".env"

settings = Settings()