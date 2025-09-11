#!/usr/bin/env python3
"""
File Update System
Safely updates JSON episode files with backup functionality and dry-run support
"""

import json
import os
import shutil
from datetime import datetime
from pathlib import Path

class FileUpdater:
    """Handles safe updating of episode JSON files with backup support"""

    def __init__(self, backup_enabled=True, dry_run=False):
        self.backup_enabled = backup_enabled
        self.dry_run = dry_run
        self.backup_dir = "backups"
        self.updated_files = []

    def create_backup_dir(self):
        """Create backups directory if it doesn't exist"""
        if not os.path.exists(self.backup_dir):
            os.makedirs(self.backup_dir)
            print(f"📁 Created backup directory: {self.backup_dir}")

    def create_backup(self, file_path):
        """Create a timestamped backup of the file"""
        if not self.backup_enabled:
            return None

        self.create_backup_dir()

        # Generate backup filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_name = os.path.basename(file_path)
        backup_name = f"{file_name.replace('.json', '')}_backup_{timestamp}.json"
        backup_path = os.path.join(self.backup_dir, backup_name)

        try:
            shutil.copy2(file_path, backup_path)
            print(f"💾 Created backup: {backup_path}")
            return backup_path
        except Exception as e:
            print(f"⚠️  Failed to create backup for {file_path}: {e}")
            return None

    def load_existing_data(self, file_path):
        """Load existing episode data from JSON file"""
        try:
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8-sig') as f:
                    data = json.load(f)
                    episodes = data.get('episodes', [])
                    print(f"📂 Loaded {len(episodes)} existing episodes from {file_path}")
                    return episodes, data
            else:
                print(f"📂 Creating new file: {file_path}")
                return [], {"episodes": []}

        except Exception as e:
            print(f"❌ Error loading {file_path}: {e}")
            return [], {"episodes": []}

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

    def merge_episodes(self, existing_episodes, new_episodes):
        """Merge new episodes with existing ones, avoiding duplicates"""
        # Create a set of existing episode keys for quick lookup
        existing_keys = {self.get_episode_key(ep) for ep in existing_episodes if self.get_episode_key(ep) is not None}

        # Filter out duplicates from new episodes
        unique_new_episodes = []
        duplicates_found = 0

        for episode in new_episodes:
            episode_key = self.get_episode_key(episode)
            if episode_key and episode_key not in existing_keys:
                unique_new_episodes.append(episode)
            else:
                duplicates_found += 1
                if episode_key:
                    print(f"🚫 Skipped duplicate episode: {episode.get('name', 'Unknown')} (ID: {episode_key})")

        if duplicates_found > 0:
            print(f"🚫 Skipped {duplicates_found} duplicate episodes")

        # Combine and sort episodes by episode number (descending - newest first)
        all_episodes = existing_episodes + unique_new_episodes

        # Sort by episode number descending (newest episodes first)
        all_episodes.sort(key=lambda x: x.get('episode_number', 0), reverse=True)

        print(f"📋 Merged: {len(existing_episodes)} existing + {len(unique_new_episodes)} new = {len(all_episodes)} total")

        return all_episodes

    def save_file(self, file_path, data):
        """Save data to JSON file"""
        try:
            if self.dry_run:
                print(f"🔍 DRY RUN: Would save {len(data.get('episodes', []))} episodes to {file_path}")
                return True

            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)

            print(f"💾 Saved {len(data.get('episodes', []))} episodes to {file_path}")
            return True

        except Exception as e:
            print(f"❌ Failed to save {file_path}: {e}")
            return False

    def update_series_file(self, series_name, new_episodes):
        """Update a single series JSON file with new episodes"""
        file_path = f"data/{series_name}_episodes.json"

        print(f"\n🔄 Updating {series_name}...")

        # Load existing data
        existing_episodes, file_data = self.load_existing_data(file_path)

        if not new_episodes:
            print(f"📋 No new episodes to add for {series_name}")
            return True

        # Create backup if file exists
        if os.path.exists(file_path):
            backup_path = self.create_backup(file_path)
        else:
            backup_path = None

        # Merge episodes
        merged_episodes = self.merge_episodes(existing_episodes, new_episodes)

        # Update file data
        file_data['episodes'] = merged_episodes

        # Save file
        success = self.save_file(file_path, file_data)

        if success:
            self.updated_files.append({
                'series': series_name,
                'file_path': file_path,
                'backup_path': backup_path,
                'new_episodes': len(new_episodes),
                'total_episodes': len(merged_episodes)
            })
            print(f"✅ Successfully updated {series_name}")
        else:
            print(f"❌ Failed to update {series_name}")

        return success

    def update_all_files(self, new_episodes_data):
        """Update all series files with their new episodes"""
        print("🔄 Starting file updates..." + (" (DRY RUN)" if self.dry_run else ""))

        success_count = 0
        total_files = len(new_episodes_data)

        for series_name, episodes in new_episodes_data.items():
            if self.update_series_file(series_name, episodes):
                success_count += 1

        print(f"\n📊 Update Summary:")
        print(f"   Files processed: {total_files}")
        print(f"   Files updated: {success_count}")
        print(f"   Files skipped: {total_files - success_count}")

        if self.updated_files:
            print(f"\n📋 Detailed Results:")
            for update in self.updated_files:
                print(f"   {update['series']}: +{update['new_episodes']} episodes ({update['total_episodes']} total)")

        return success_count == total_files

    def get_update_summary(self):
        """Get a summary of all updates made"""
        return {
            'total_files_updated': len(self.updated_files),
            'updated_files': self.updated_files,
            'dry_run': self.dry_run
        }

def main():
    """Test the file updater system"""
    try:
        # Test with dry run
        updater = FileUpdater(backup_enabled=True, dry_run=True)

        # Sample test data
        test_new_episodes = {
            'dating': [
                {
                    "title": "Test New Episode",
                    "description": "A test episode for demonstration",
                    "date": "15-09-24",
                    "length": "25:30",
                    "spotify_embed_url": "https://open.spotify.com/embed/episode/test123",
                    "series": "dating",
                    "episode_number": 9,
                    "file_path": "data\\Dating_episodes.csv"
                }
            ]
        }

        print("🧪 Testing File Updater (DRY RUN mode):")
        success = updater.update_all_files(test_new_episodes)

        if success:
            print("✅ File updater test completed successfully!")
        else:
            print("❌ File updater test had some issues")

    except Exception as e:
        print(f"❌ File updater test failed: {e}")

if __name__ == "__main__":
    main()
