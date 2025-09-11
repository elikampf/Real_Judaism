#!/usr/bin/env python3
"""
Local Setup Helper for Episode Detection System
Helps set up environment variables and test the system locally
"""

import os
import json
from pathlib import Path

def setup_environment():
    """Help user set up local environment variables"""
    print("🎵 Spotify Episode Detection - Local Setup")
    print("=" * 50)

    # Check if .env file exists
    env_file = Path('.env')
    if env_file.exists():
        print("✅ .env file found!")
        load_dotenv = input("Load existing .env file? (y/n): ").lower().strip()
        if load_dotenv == 'y':
            print("📝 Loading .env file...")
            from dotenv import load_dotenv
            load_dotenv()
            print("✅ Environment variables loaded from .env")
            return True

    # Get Spotify credentials from user
    print("\n🔐 Spotify API Setup:")
    print("Get your credentials from: https://developer.spotify.com/dashboard")

    client_id = input("Enter your Spotify Client ID: ").strip()
    client_secret = input("Enter your Spotify Client Secret: ").strip()

    if not client_id or not client_secret:
        print("❌ Both Client ID and Client Secret are required!")
        return False

    # Set environment variables
    os.environ['SPOTIFY_CLIENT_ID'] = client_id
    os.environ['SPOTIFY_CLIENT_SECRET'] = client_secret

    # Save to .env file
    save_env = input("Save credentials to .env file for future use? (y/n): ").lower().strip()
    if save_env == 'y':
        with open('.env', 'w') as f:
            f.write(f"SPOTIFY_CLIENT_ID={client_id}\n")
            f.write(f"SPOTIFY_CLIENT_SECRET={client_secret}\n")
            f.write("DRY_RUN=false\n")
        print("💾 Credentials saved to .env file")

    print("✅ Environment variables set successfully!")
    return True

def test_system():
    """Test the system with current configuration"""
    print("\n🧪 Testing System Configuration...")
    print("-" * 30)

    try:
        # Test config loading
        from spotify_auth import load_config
        config = load_config()
        print("✅ Configuration loaded successfully")

        # Test Spotify authentication
        from spotify_auth import SpotifyAuth
        auth = SpotifyAuth(config['spotify']['client_id'], config['spotify']['client_secret'])
        token = auth.get_access_token()
        print("✅ Spotify API authentication successful")

        # Test episode detection
        from episode_detector import EpisodeDetector
        detector = EpisodeDetector(config)
        print("✅ Episode detector initialized")

        # Test data formatter
        from data_formatter import EpisodeFormatter
        formatter = EpisodeFormatter(config)
        print("✅ Data formatter initialized")

        print("\n🎉 All systems operational!")
        return True

    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def main():
    """Main setup function"""
    print("Welcome to the Spotify Episode Detection Setup!")
    print("This will help you configure the system for local use.\n")

    # Check if config file exists
    config_file = Path('episode_detector_config.json')
    if not config_file.exists():
        print("❌ episode_detector_config.json not found!")
        print("Please make sure you're in the correct project directory.")
        return

    # Setup environment
    if setup_environment():
        # Test the system
        if test_system():
            print("\n🚀 Setup Complete!")
            print("You can now run:")
            print("  python episode_update.py --verbose          # Full update")
            print("  python episode_update.py --dry-run --verbose # Safe test")
            print("  python episode_update.py --series dating     # Single series")
        else:
            print("\n❌ Setup completed but testing failed.")
            print("Please check your Spotify credentials and try again.")
    else:
        print("\n❌ Setup cancelled.")

if __name__ == "__main__":
    main()
