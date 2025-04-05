import aiohttp
import json
import re
import yaml
import zipfile
import io
import os
from typing import Dict, Any, List, Optional

from app.core.config import settings

async def fetch_jsonp(url: str) -> Dict[Any, Any]:
    """Fetch JSONP data and convert to JSON"""
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            jsonp = await response.text()
            
            # Extract JSON data from JSONP response
            json_str = re.search(r'\((.*)\)', jsonp).group(1)
            return json.loads(json_str)

async def fetch_match_schedule() -> Dict[Any, Any]:
    """Fetch match schedule data"""
    data = await fetch_jsonp(settings.MATCH_SCHEDULE_URL)
    return {"Matches": data.get("Matchsummary", [])}

async def fetch_team_standings() -> Dict[Any, Any]:
    """Fetch team standings data"""
    data = await fetch_jsonp(settings.TEAM_STANDINGS_URL)
    return {"Teams": data.get("points", [])}

async def fetch_top_run_scorers() -> Dict[Any, Any]:
    """Fetch top run scorers data"""
    data = await fetch_jsonp(settings.TOP_SCORERS_URL)
    return {"Batsmen": data.get("toprunsscorers", [])}

async def fetch_most_wickets() -> Dict[Any, Any]:
    """Fetch most wickets data"""
    data = await fetch_jsonp(settings.MOST_WICKETS_URL)
    return {"Bowlers": data.get("mostwickets", [])}

async def download_cricsheet_data(output_dir: str = "data/cricsheet") -> List[Dict[str, Any]]:
    """
    Download and extract IPL match data from Cricsheet
    
    Args:
        output_dir: Directory to save extracted YAML files
        
    Returns:
        List of parsed YAML data for all matches
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    async with aiohttp.ClientSession() as session:
        async with session.get(settings.CRICSHEET_IPL_URL) as response:
            if response.status != 200:
                raise Exception(f"Failed to download Cricsheet data: {response.status}")
            
            # Read zip file content
            content = await response.read()
            
            # Extract zip file
            with zipfile.ZipFile(io.BytesIO(content)) as zip_ref:
                zip_ref.extractall(output_dir)
            
            # Parse all YAML files
            yaml_files = [f for f in os.listdir(output_dir) if f.endswith('.yaml')]
            match_data = []
            
            for yaml_file in yaml_files:
                file_path = os.path.join(output_dir, yaml_file)
                with open(file_path, 'r') as f:
                    try:
                        data = yaml.safe_load(f)
                        match_data.append(data)
                    except yaml.YAMLError as e:
                        print(f"Error parsing {yaml_file}: {e}")
            
            return match_data