#!/usr/bin/env python3
"""
Data Formatter Module
Converts Spotify API episode data to match existing JSON format
"""

import json
import re
from datetime import datetime
from spotify_auth import load_config

class EpisodeFormatter:
    """Formats Spotify API episode data to match existing JSON structure"""

    def __init__(self, config):
        self.config = config

    def format_date(self, spotify_date):
        """Convert Spotify date format (YYYY-MM-DD) to DD-MM-YY"""
        try:
            # Spotify returns dates in format: "2024-09-11T00:00:00.000Z"
            # Extract just the date part
            date_str = spotify_date.split('T')[0] if 'T' in spotify_date else spotify_date

            # Parse and reformat
            date_obj = datetime.strptime(date_str, '%Y-%m-%d')
            formatted_date = date_obj.strftime('%d-%m-%y')

            return formatted_date
        except Exception as e:
            print(f"⚠️  Error formatting date '{spotify_date}': {e}")
            return spotify_date  # Return original if parsing fails

    def format_duration(self, duration_ms):
        """Convert milliseconds to MM:SS format"""
        try:
            total_seconds = duration_ms // 1000
            minutes = total_seconds // 60
            seconds = total_seconds % 60

            if minutes >= 60:
                hours = minutes // 60
                minutes = minutes % 60
                return f"{hours}:{minutes:02d}:{seconds:02d}"
            else:
                return f"{minutes}:{seconds:02d}"

        except Exception as e:
            print(f"⚠️  Error formatting duration {duration_ms}: {e}")
            return "00:00"

    def clean_description(self, description):
        """Clean and standardize episode descriptions"""
        if not description:
            return ""

        # Remove extra whitespace
        description = re.sub(r'\s+', ' ', description.strip())

        # Remove HTML tags if any
        description = re.sub(r'<[^>]+>', '', description)

        # Truncate very long descriptions (some podcasts have very long ones)
        if len(description) > 1000:
            description = description[:997] + "..."

        return description

    def generate_embed_url(self, episode_id):
        """Generate Spotify embed URL from episode ID"""
        return f"https://open.spotify.com/embed/episode/{episode_id}"

    def determine_episode_number(self, series_name, existing_episodes):
        """Determine the next episode number for a series"""
        if not existing_episodes:
            return 1

        # Find the highest episode number
        max_number = 0
        for episode in existing_episodes:
            episode_num = episode.get('episode_number', 0)
            if isinstance(episode_num, int) and episode_num > max_number:
                max_number = episode_num

        return max_number + 1

    def generate_file_path(self, series_name):
        """Generate file path in the format used by existing data"""
        # Based on existing patterns, seems to use CSV files with series names
        # Convert series name format: shalom-bayis-hebrew → Shalom Bayis Hebrew
        display_name = series_name.replace('-', ' ').title()

        # Handle special cases
        if series_name == 'shmiras-halashon':
            display_name = 'Shmiras Halashon'
        elif series_name == 'mesilas-yesharim':
            display_name = 'Mesilas Yesharim'
        elif series_name == 'shmiras-einayim':
            display_name = 'Shmiras Einayim'

        return f"data\\{display_name}_episodes.csv"

    def format_episode(self, spotify_episode, series_name, episode_number=None):
        """Format a single Spotify episode to match existing structure"""
        try:
            # Ensure episode_number is an integer
            if episode_number is None:
                episode_number = 1

            # Handle potential None values in spotify_episode
            episode_id = spotify_episode.get('id') or 'unknown'
            episode_name = spotify_episode.get('name') or 'Unknown Title'
            description = spotify_episode.get('description') or ''
            release_date = spotify_episode.get('release_date') or ''
            duration_ms = spotify_episode.get('duration_ms') or 0

            formatted_episode = {
                "title": episode_name,
                "description": self.clean_description(description),
                "date": self.format_date(release_date),
                "length": self.format_duration(duration_ms),
                "spotify_embed_url": self.generate_embed_url(episode_id),
                "series": series_name,
                "episode_number": int(episode_number),  # Ensure it's an integer
                "file_path": self.generate_file_path(series_name)
            }

            return formatted_episode

        except Exception as e:
            print(f"⚠️  Warning: Error formatting episode '{spotify_episode.get('name', 'Unknown') if spotify_episode else 'Unknown'}': {e}")
            # Return a minimal valid episode instead of None
            return {
                "title": "Episode formatting error",
                "description": f"Error processing episode: {str(e)}",
                "date": "01-01-25",
                "length": "00:00",
                "spotify_embed_url": "https://open.spotify.com/embed/episode/error",
                "series": series_name,
                "episode_number": episode_number or 1,
                "file_path": self.generate_file_path(series_name)
            }

    def format_multiple_episodes(self, spotify_episodes, series_name, existing_episodes=None):
        """Format multiple episodes and assign proper episode numbers"""
        if existing_episodes is None:
            existing_episodes = []

        # Determine starting episode number
        next_episode_num = self.determine_episode_number(series_name, existing_episodes)

        formatted_episodes = []

        # Sort episodes by release date (newest first, so we assign numbers correctly)
        sorted_episodes = sorted(
            spotify_episodes,
            key=lambda x: x.get('release_date', ''),
            reverse=True
        )

        for spotify_episode in sorted_episodes:
            formatted = self.format_episode(spotify_episode, series_name, next_episode_num)
            if formatted:
                formatted_episodes.append(formatted)
            # Always increment episode number, even if formatting failed
            next_episode_num += 1

        return formatted_episodes

def main():
    """Test the data formatter"""
    try:
        config = load_config()
        formatter = EpisodeFormatter(config)

        # Test data from Spotify API format
        test_spotify_episode = {
            "id": "0sNW7o9gLiGzcETdplthPd",
            "name": "Test Episode - Understanding Your Wife",
            "description": "Test description with some <b>HTML</b> tags and   extra   spaces",
            "release_date": "2024-09-11T00:00:00.000Z",
            "duration_ms": 2429000  # 40 minutes 29 seconds
        }

        # Test formatting
        formatted = formatter.format_episode(test_spotify_episode, "shalom-bayis", 1)

        print("🎨 Data Formatter Test:")
        print(json.dumps(formatted, indent=2, ensure_ascii=False))

        # Test date formatting
        print(f"\n📅 Date format test: {formatter.format_date('2024-09-11T00:00:00.000Z')}")

        # Test duration formatting
        print(f"⏱️  Duration format test: {formatter.format_duration(2429000)}")

        print("✅ Data formatter test completed successfully!")

    except Exception as e:
        print(f"❌ Data formatter test failed: {e}")

if __name__ == "__main__":
    main()
