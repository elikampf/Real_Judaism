#!/usr/bin/env python3
"""
Spotify API Authentication Module
Handles OAuth2 authentication and token management for Spotify Web API
"""

import json
import base64
import requests
import os
from datetime import datetime, timedelta
import time

class SpotifyAuth:
    """Handles Spotify API authentication and token management"""

    def __init__(self, client_id, client_secret):
        self.client_id = client_id
        self.client_secret = client_secret
        self.access_token = None
        self.token_expires = None
        self.base_url = "https://api.spotify.com/v1"

    def _get_auth_header(self):
        """Generate base64 encoded authorization header"""
        auth_string = f"{self.client_id}:{self.client_secret}"
        auth_bytes = auth_string.encode('ascii')
        auth_base64 = base64.b64encode(auth_bytes).decode('ascii')
        return {'Authorization': f'Basic {auth_base64}'}

    def _is_token_valid(self):
        """Check if current access token is still valid"""
        if not self.access_token or not self.token_expires:
            return False
        # Add 5 minute buffer to avoid edge cases
        return datetime.now() < (self.token_expires - timedelta(minutes=5))

    def get_access_token(self):
        """Get or refresh access token"""
        if self._is_token_valid():
            return self.access_token

        print("🔄 Getting new Spotify access token...")

        auth_url = "https://accounts.spotify.com/api/token"
        headers = self._get_auth_header()
        data = {'grant_type': 'client_credentials'}

        try:
            response = requests.post(auth_url, headers=headers, data=data)
            response.raise_for_status()

            token_data = response.json()
            self.access_token = token_data['access_token']

            # Calculate expiration time
            expires_in = token_data['expires_in']
            self.token_expires = datetime.now() + timedelta(seconds=expires_in)

            print("✅ Spotify access token obtained successfully")
            return self.access_token

        except requests.exceptions.RequestException as e:
            print(f"❌ Failed to get Spotify access token: {e}")
            raise Exception(f"Authentication failed: {e}")

    def make_request(self, endpoint, params=None):
        """Make authenticated request to Spotify API"""
        if not self._is_token_valid():
            self.get_access_token()

        url = f"{self.base_url}{endpoint}"
        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json'
        }

        try:
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            return response.json()

        except requests.exceptions.RequestException as e:
            print(f"❌ Spotify API request failed: {e}")
            raise Exception(f"API request failed: {e}")

def load_config(config_file="episode_detector_config.json"):
    """Load configuration from JSON file with environment variable override for secrets"""
    try:
        with open(config_file, 'r', encoding='utf-8-sig') as f:
            config = json.load(f)

        # Override with environment variables for security
        config['spotify']['client_id'] = os.getenv('SPOTIFY_CLIENT_ID', config['spotify']['client_id'])
        config['spotify']['client_secret'] = os.getenv('SPOTIFY_CLIENT_SECRET', config['spotify']['client_secret'])

        # Validate that we have the required credentials
        if not config['spotify']['client_id'] or not config['spotify']['client_secret']:
            raise Exception(
                "\n🚨 Spotify credentials not found!\n\n"
                "For GitHub Actions: Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to GitHub Secrets\n"
                "For local testing: Set environment variables or create a .env file\n\n"
                "See env-example.txt for instructions on setting up credentials securely.\n\n"
                "🔗 GitHub Secrets setup: https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions\n"
                "📝 Local setup: Copy env-example.txt to .env and fill in your credentials"
            )

        return config

    except FileNotFoundError:
        raise Exception(f"Configuration file '{config_file}' not found")
    except json.JSONDecodeError as e:
        raise Exception(f"Invalid JSON in configuration file: {e}")

if __name__ == "__main__":
    # Test the authentication
    try:
        config = load_config()
        auth = SpotifyAuth(
            config['spotify']['client_id'],
            config['spotify']['client_secret']
        )

        token = auth.get_access_token()
        print(f"✅ Authentication successful! Token: {token[:20]}...")

        # Test API call
        test_response = auth.make_request("/me")  # This might fail, but tests auth
        print("✅ API test successful!")

    except Exception as e:
        print(f"❌ Authentication test failed: {e}")
