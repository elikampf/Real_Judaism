#!/usr/bin/env python3
"""
Configuration Test - Verify system setup without requiring API credentials
"""

import os
import json
from pathlib import Path

def test_file_structure():
    """Test that all required files exist"""
    print("📁 Checking file structure...")

    required_files = [
        'episode_detector_config.json',
        'spotify_auth.py',
        'episode_detector.py',
        'data_formatter.py',
        'file_updater.py',
        'episode_update.py',
        'requirements.txt',
        '.gitignore'
    ]

    missing_files = []
    for file in required_files:
        if not Path(file).exists():
            missing_files.append(file)

    if missing_files:
        print(f"❌ Missing files: {', '.join(missing_files)}")
        return False
    else:
        print("✅ All required files present")
        return True

def test_config_file():
    """Test that config file is valid JSON"""
    print("⚙️  Testing configuration file...")

    try:
        with open('episode_detector_config.json', 'r', encoding='utf-8-sig') as f:
            config = json.load(f)

        # Check required sections
        required_sections = ['spotify', 'shows', 'settings']
        for section in required_sections:
            if section not in config:
                print(f"❌ Missing section: {section}")
                return False

        # Check shows section
        if not config['shows']:
            print("❌ No podcast shows configured")
            return False

        print(f"✅ Configuration valid - {len(config['shows'])} shows configured")
        print(f"   Shows: {', '.join(config['shows'].keys())}")

        return True

    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON in config file: {e}")
        return False
    except FileNotFoundError:
        print("❌ Configuration file not found")
        return False

def test_environment_variables():
    """Test environment variable setup"""
    print("🔧 Testing environment variables...")

    client_id = os.getenv('SPOTIFY_CLIENT_ID')
    client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')

    if client_id and client_secret:
        print("✅ Environment variables set")
        print(f"   Client ID: {client_id[:8]}...")
        print(f"   Client Secret: {client_secret[:8]}...")
        return True
    else:
        print("⚠️  Environment variables not set")
        print("   This is OK for local development - use setup_local.py")
        return True  # Not a failure, just informational

def test_python_imports():
    """Test that Python modules can be imported"""
    print("🐍 Testing Python imports...")

    modules_to_test = [
        'spotify_auth',
        'episode_detector',
        'data_formatter',
        'file_updater'
    ]

    failed_imports = []
    for module in modules_to_test:
        try:
            __import__(module)
        except ImportError as e:
            failed_imports.append(f"{module}: {e}")

    if failed_imports:
        print("❌ Import failures:")
        for failure in failed_imports:
            print(f"   {failure}")
        return False
    else:
        print("✅ All modules import successfully")
        return True

def main():
    """Run all configuration tests"""
    print("🧪 Episode Detection System - Configuration Test")
    print("=" * 55)
    print("This test verifies your system setup without requiring API credentials")
    print()

    tests = [
        ("File Structure", test_file_structure),
        ("Configuration File", test_config_file),
        ("Environment Variables", test_environment_variables),
        ("Python Imports", test_python_imports)
    ]

    results = []
    for test_name, test_func in tests:
        print(f"\n🔍 {test_name}:")
        result = test_func()
        results.append((test_name, result))

    # Summary
    print("\n" + "=" * 55)
    print("📊 TEST SUMMARY:")

    passed = 0
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {test_name}: {status}")
        if result:
            passed += 1

    print(f"\n🎯 Overall: {passed}/{len(results)} tests passed")

    if passed == len(results):
        print("\n🎉 Configuration test PASSED!")
        print("Your system is ready. Next steps:")
        print("1. Set up Spotify API credentials (see env-example.txt)")
        print("2. Run: python setup_local.py")
        print("3. Test: python episode_update.py --dry-run --verbose")
    else:
        print("\n❌ Configuration test FAILED!")
        print("Please fix the issues above before proceeding.")

    return passed == len(results)

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
