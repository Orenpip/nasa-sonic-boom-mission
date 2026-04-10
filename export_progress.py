#!/usr/bin/env python3
"""
NASA Sonic Boom Mission - CSV Export Tool
Downloads mission progress data as CSV
Usage: python3 export_progress.py
"""

import json
import sys
import os
from datetime import datetime
import webbrowser
import subprocess
import platform

def print_instructions():
    """Print user-friendly instructions"""
    print("\n" + "="*60)
    print("🚀 NASA SONIC BOOM MISSION - CSV EXPORT TOOL")
    print("="*60 + "\n")
    
    text = """
QUICK START:
============
1. Open the mission website in your browser
2. Press F12 (or right-click → Inspect)
3. Go to the "Console" tab
4. Type this command:

    downloadProgressCSV()

A CSV file will automatically download to your Downloads folder!

---

WHAT GETS EXPORTED:
===================
✓ Mission completion status (1-4)
✓ Quiz scores for each mission
✓ Time spent on each page (seconds)
✓ Page visit timestamps
✓ Session ID
✓ Overall progress summary

---

LOCATION OF DOWNLOADED FILE:
============================
"""
    print(text)
    
    system = platform.system()
    if system == "Windows":
        print("Windows: C:\\Users\\{username}\\Downloads")
    elif system == "Darwin":
        print("macOS: ~/Downloads")
    else:
        print("Linux: ~/Downloads")
    
    print("\n---\n")

def open_browser_instructions():
    """Open browser with detailed instructions"""
    html_content = """
<!DOCTYPE html>
<html>
<head>
    <title>NASA Sonic Boom - CSV Export</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 40px auto; 
            padding: 20px;
            background: #f5f5f5;
        }
        .container { background: white; padding: 30px; border-radius: 10px; }
        h1 { color: #0066cc; }
        code { 
            background: #f0f0f0; 
            padding: 10px; 
            display: block; 
            margin: 10px 0;
            border-left: 3px solid #0066cc;
        }
        .step { margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 5px; }
        .success { color: #28a745; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 NASA Sonic Boom Mission - Export Data as CSV</h1>
        <p>Follow these steps to export your mission progress:</p>
        
        <div class="step">
            <h3>Step 1: Open the Mission Website</h3>
            <p>Navigate to your NASA Sonic Boom Mission website in your browser.</p>
        </div>
        
        <div class="step">
            <h3>Step 2: Open Developer Tools</h3>
            <p>Press <strong>F12</strong> or right-click anywhere → <strong>Inspect</strong></p>
        </div>
        
        <div class="step">
            <h3>Step 3: Go to Console Tab</h3>
            <p>Look for the "Console" tab at the top of Developer Tools</p>
        </div>
        
        <div class="step">
            <h3>Step 4: Run Export Command</h3>
            <p>Copy and paste this command into the console:</p>
            <code>downloadProgressCSV()</code>
            <p>Then press Enter.</p>
        </div>
        
        <div class="step success">
            ✅ Your CSV file will download automatically!
        </div>
        
        <hr>
        
        <h2>What's in the CSV File?</h2>
        <ul>
            <li>Session ID and export timestamp</li>
            <li>Mission progress for missions 1-4</li>
            <li>Quiz scores (0-3 per mission)</li>
            <li>Time spent on each page</li>
            <li>Visit history with timestamps</li>
        </ul>
        
        <h2>Troubleshooting</h2>
        <p><strong>File didn't download?</strong></p>
        <ul>
            <li>Check your browser's download settings</li>
            <li>Try a different browser</li>
            <li>Make sure you're on a page from the mission website</li>
        </ul>
    </div>
</body>
</html>
"""
    
    # Write to temp file and open
    import tempfile
    with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False) as f:
        f.write(html_content)
        temp_file = f.name
    
    webbrowser.open('file://' + temp_file)
    print(f"\n📖 Detailed guide opened in your browser!\n")

def main():
    """Main function"""
    print_instructions()
    
    try:
        print("Opening detailed guide in your browser...")
        open_browser_instructions()
    except Exception as e:
        print(f"Could not open browser: {e}")
    
    print("\n📝 MANUAL EXPORT (if browser method doesn't work):")
    print("-" * 60)
    print("""
    1. Press F12 to open Developer Tools
    2. Go to "Application" or "Storage" tab
    3. Click "Local Storage" and select your domain
    4. Look for these keys:
       - nasaSonicBoomProgress
       - pageMetrics
       - pageVisits
    5. Copy the values and save to a CSV file
    """)
    
    print("\n💡 Need help?")
    print("   • Check your browser console for any errors")
    print("   • Make sure localStorage is enabled")
    print("   • Try in a different browser\n")

if __name__ == '__main__':
    main()
