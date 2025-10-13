#!/usr/bin/env python3
"""
Core Episode Detection Engine
Fetches episodes from Spotify API, filters trailers, and identifies new episodes
"""

import json
import os
from datetime import datetime
from spotify_auth import SpotifyAuth, load_config

class EpisodeDetector:
    """Main class for detecting new podcast episodes"""

    def __init__(self, config):
        self.config = config
        self.auth = SpotifyAuth(
            config['spotify']['client_id'],
            config['spotify']['client_secret']
        )
        self.trailer_keywords = config['settings']['trailer_keywords']

    def is_trailer(self, episode):
        """Determine if an episode is a trailer based on various criteria"""
        # Handle None or invalid episode data
        if not episode or not isinstance(episode, dict):
            print("⚠️  Invalid episode data received")
            return True

        title = episode.get('name', '').lower()

        # Check for trailer keywords in title
        for keyword in self.trailer_keywords:
            if keyword in title:
                print(f"🚫 Filtering trailer: '{episode.get('name')}' (keyword: {keyword})")
                return True

        return False

    def fetch_show_episodes(self, show_id, limit=50):
        """Fetch episodes for a specific show from Spotify API"""
        print(f"📡 Fetching episodes for show: {show_id}")

        # Validate show_id format
        if not show_id or len(show_id) != 22:
            print(f"❌ Invalid show ID format: {show_id}")
            return []

        try:
            # Get show episodes
            episodes_data = self.auth.make_request(
                f"/shows/{show_id}/episodes",
                params={
                    'limit': limit,
                    'market': 'US'  # You can change this if needed
                }
            )

            # Add a check to ensure the response is valid
            if not episodes_data or not isinstance(episodes_data, dict):
                print(f"⚠️  Invalid or empty response from Spotify API for show {show_id}. Skipping.")
                return []

            # Check if we got a valid response with items
            if 'items' not in episodes_data:
                print(f"⚠️  No 'items' field in response for show {show_id}. Response: {episodes_data}")
                return []

            episodes = []
            for episode in episodes_data.get('items', []):
                if not self.is_trailer(episode):
                    episodes.append(episode)

            print(f"✅ Found {len(episodes)} valid episodes (filtered {len(episodes_data.get('items', [])) - len(episodes)} trailers)")

            return episodes

        except Exception as e:
            error_msg = str(e)
            if "400" in error_msg:
                print(f"❌ Invalid show ID or Bad Request for {show_id}: {error_msg}")
                print(f"💡 This show ID might be incorrect or the show might not exist")
            elif "NoneType" in error_msg:
                print(f"❌ NoneType error for show {show_id}: {error_msg}")
                print(f"💡 This usually means the API response was None")
            else:
                print(f"❌ Failed to fetch episodes for show {show_id}: {error_msg}")
            return []

    def load_existing_episodes(self, series_name):
        """Load existing episodes from JSON file"""
        filename = f"data/{series_name}_episodes.json"

        try:
            if os.path.exists(filename):
                with open(filename, 'r', encoding='utf-8-sig') as f:
                    data = json.load(f)
                    episodes = data.get('episodes', [])
                    print(f"📂 Loaded {len(episodes)} existing episodes from {filename}")
                    return episodes
            else:
                print(f"📂 No existing file found: {filename}")
                return []

        except Exception as e:
            print(f"❌ Error loading existing episodes from {filename}: {e}")
            return []

    def get_episode_key(self, episode):
        """Generate a unique key for episode comparison"""
        # Handle None or invalid episode data
        if not episode or not isinstance(episode, dict):
            return None

        # Extract Spotify episode ID from either 'id' field (Spotify API) or 'spotify_embed_url' (existing JSON)
        if episode.get('id'):
            return episode.get('id')
        elif episode.get('spotify_embed_url'):
            # Extract ID from URL: https://open.spotify.com/embed/episode/{ID}
            url = episode.get('spotify_embed_url', '')
            if '/episode/' in url:
                return url.split('/episode/')[-1]
        return None

    def find_new_episodes(self, spotify_episodes, existing_episodes):
        """Compare Spotify episodes with existing data to find new ones"""
        existing_keys = {self.get_episode_key(ep) for ep in existing_episodes if self.get_episode_key(ep) is not None}
        print(f"📊 Found {len(existing_keys)} existing episode keys")

        new_episodes = []
        for episode in spotify_episodes:
            episode_key = self.get_episode_key(episode)
            episode_name = episode.get('name', 'Unknown') if episode else 'None'

            if episode_key is None:
                print(f"⚠️  Episode '{episode_name}' has no valid key, skipping")
                continue

            if episode_key not in existing_keys:
                new_episodes.append(episode)
                print(f"🆕 New episode found: '{episode_name}' (Key: {episode_key})")
            else:
                print(f"📋 Existing episode: '{episode_name}' (Key: {episode_key})")

        print(f"✅ Total new episodes: {len(new_episodes)}")
        return new_episodes

    def check_all_shows(self):
        """Check all shows for new episodes"""
        print("🔍 Starting episode detection for all shows...\n")

        all_new_episodes = {}

        for series_name, show_id in self.config['shows'].items():
            print(f"🎙️  Checking series: {series_name}")

            # Fetch latest episodes from Spotify
            spotify_episodes = self.fetch_show_episodes(show_id)

            # Load existing episodes
            existing_episodes = self.load_existing_episodes(series_name)

            # Find new episodes
            new_episodes = self.find_new_episodes(spotify_episodes, existing_episodes)

            if new_episodes:
                all_new_episodes[series_name] = new_episodes
                print(f"✅ Found {len(new_episodes)} new episodes for {series_name}")
            else:
                print(f"✅ No new episodes for {series_name}")

            print("-" * 50)

        total_new = sum(len(episodes) for episodes in all_new_episodes.values())
        print(f"\n🎉 Episode detection complete! Found {total_new} new episodes across all series")

        return all_new_episodes

def main():
    """Main function for testing the episode detector"""
    try:
        config = load_config()
        detector = EpisodeDetector(config)

        # Test authentication
        print("🔐 Testing Spotify authentication...")
        detector.auth.get_access_token()
        print("✅ Authentication successful\n")

        # Check for new episodes
        new_episodes = detector.check_all_shows()

        # Print summary
        if new_episodes:
            print("\n📋 New Episodes Summary:")
            for series, episodes in new_episodes.items():
                print(f"  {series}: {len(episodes)} new episodes")
                for episode in episodes[:3]:  # Show first 3
                    print(f"    • {episode.get('name')}")
                if len(episodes) > 3:
                    print(f"    ... and {len(episodes) - 3} more")
        else:
            print("\n📋 No new episodes found")

    except Exception as e:
        print(f"❌ Episode detection failed: {e}")
        return 1

    return 0

if __name__ == "__main__":
    exit(main())
