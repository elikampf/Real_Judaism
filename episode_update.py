#!/usr/bin/env python3
"""
Main Episode Update Automation Script
Orchestrates the complete episode detection and update process
"""

import argparse
import sys
from datetime import datetime
from episode_detector import EpisodeDetector
from data_formatter import EpisodeFormatter
from file_updater import FileUpdater
from spotify_auth import load_config

def parse_arguments():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(
        description="Automated Podcast Episode Detection System",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python episode_update.py                    # Check all series, update files
  python episode_update.py --dry-run         # Preview changes without updating
  python episode_update.py --series dating   # Check only dating series
  python episode_update.py --verbose         # Show detailed output
  python episode_update.py --no-backup       # Skip backup creation
        """
    )

    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Preview changes without actually updating files'
    )

    parser.add_argument(
        '--series',
        type=str,
        help='Check only specific series (e.g., dating, shalom-bayis)'
    )

    parser.add_argument(
        '--no-backup',
        action='store_true',
        help='Skip creating backup files'
    )

    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Show detailed output and progress'
    )

    parser.add_argument(
        '--config',
        type=str,
        default='episode_detector_config.json',
        help='Path to configuration file'
    )

    return parser.parse_args()

def print_header():
    """Print a nice header for the script"""
    print("🎙️  Real Judaism Episode Detection System")
    print("=" * 50)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()

def print_footer(start_time, success):
    """Print completion summary"""
    end_time = datetime.now()
    duration = end_time - start_time

    print()
    print("=" * 50)
    if success:
        print("✅ Episode update process completed successfully!")
    else:
        print("❌ Episode update process completed with errors")

    print(f"Finished at: {end_time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Total duration: {duration.total_seconds():.1f} seconds")
    print()

def check_single_series(args, config, series_name):
    """Check a single series for new episodes"""
    print(f"🎯 Checking single series: {series_name}")

    try:
        # Initialize components
        detector = EpisodeDetector(config)
        formatter = EpisodeFormatter(config)
        updater = FileUpdater(
            backup_enabled=not args.no_backup,
            dry_run=args.dry_run
        )

        # Get show ID
        show_id = config['shows'].get(series_name)
        if not show_id:
            print(f"❌ Series '{series_name}' not found in configuration")
            return False

        # Fetch episodes from Spotify
        spotify_episodes = detector.fetch_show_episodes(show_id)

        # Load existing episodes
        existing_episodes = detector.load_existing_episodes(series_name)

        # Find new episodes
        new_episodes = detector.find_new_episodes(spotify_episodes, existing_episodes)

        if not new_episodes:
            print(f"📋 No new episodes found for {series_name}")
            return True

        # Format new episodes
        formatted_episodes = formatter.format_multiple_episodes(
            new_episodes, series_name, existing_episodes
        )

        # Update files
        new_episodes_data = {series_name: formatted_episodes}
        success = updater.update_all_files(new_episodes_data)

        return success

    except Exception as e:
        print(f"❌ Error checking series {series_name}: {e}")
        return False

def check_all_series(args, config):
    """Check all series for new episodes"""
    print("🔍 Checking all series for new episodes...")

    try:
        # Initialize components
        detector = EpisodeDetector(config)
        formatter = EpisodeFormatter(config)
        updater = FileUpdater(
            backup_enabled=not args.no_backup,
            dry_run=args.dry_run
        )

        # Detect new episodes
        new_episodes_data = detector.check_all_shows()

        if not new_episodes_data:
            print("📋 No new episodes found across any series")
            return True

        # Format all new episodes
        formatted_episodes_data = {}

        for series_name, spotify_episodes in new_episodes_data.items():
            existing_episodes = detector.load_existing_episodes(series_name)
            formatted_episodes = formatter.format_multiple_episodes(
                spotify_episodes, series_name, existing_episodes
            )
            formatted_episodes_data[series_name] = formatted_episodes

        # Update all files
        success = updater.update_all_files(formatted_episodes_data)

        return success

    except Exception as e:
        print(f"❌ Error during episode detection: {e}")
        return False

def main():
    """Main function"""
    start_time = datetime.now()

    try:
        # Parse arguments
        args = parse_arguments()

        # Print header
        print_header()

        # Show configuration
        if args.verbose:
            print("⚙️  Configuration:")
            print(f"   Config file: {args.config}")
            print(f"   Dry run: {args.dry_run}")
            print(f"   Backup enabled: {not args.no_backup}")
            print(f"   Verbose mode: {args.verbose}")
            if args.series:
                print(f"   Target series: {args.series}")
            print()

        # Load configuration
        print("📋 Loading configuration...")
        config = load_config(args.config)
        print("✅ Configuration loaded successfully")
        print()

        # Execute appropriate action
        if args.series:
            success = check_single_series(args, config, args.series)
        else:
            success = check_all_series(args, config)

        # Print footer
        print_footer(start_time, success)

        return 0 if success else 1

    except KeyboardInterrupt:
        print("\n⚠️  Process interrupted by user")
        return 1
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return 1

if __name__ == "__main__":
    exit(main())
