import aiohttp
import json
import re
import yaml
import zipfile
import io
import os
from typing import Dict, Any, List, Optional

from app.core.config import settings

async def fetch_json_from_jsonp(url: str, callback_name: str) -> Dict[str, Any]:
    """
    Fetch JSONP data and convert it to JSON by removing the callback wrapper.
    
    Args:
        url: URL to fetch data from
        callback_name: Name of the JSONP callback function to remove
        
    Returns:
        Parsed JSON data as a dictionary
    """
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status != 200:
                raise Exception(f"Failed to fetch data from {url}: {response.status}")
            
            text = await response.text()
            
            # Remove the JSONP callback wrapper
            pattern = rf"{callback_name}\((.*)\);"
            match = re.search(pattern, text, re.DOTALL)
            
            if not match:
                raise Exception(f"Failed to extract JSON from JSONP: {text[:100]}...")
            
            json_str = match.group(1)
            return json.loads(json_str)

async def fetch_match_schedule() -> Dict[str, Any]:
    """Fetch match schedule data"""
    return await fetch_json_from_jsonp(settings.MATCH_SCHEDULE_URL, "MatchSchedule")

async def fetch_team_standings() -> Dict[str, Any]:
    """Fetch team standings data"""
    return await fetch_json_from_jsonp(settings.TEAM_STANDINGS_URL, "GroupStandings")

async def fetch_top_run_scorers() -> Dict[str, Any]:
    """Fetch top run scorers data"""
    return await fetch_json_from_jsonp(settings.TOP_SCORERS_URL, "TopRunScorers")

async def fetch_most_wickets() -> Dict[str, Any]:
    """Fetch most wickets data"""
    return await fetch_json_from_jsonp(settings.MOST_WICKETS_URL, "MostWickets")

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