# 📊 NASA Sonic Boom Mission - Data Export Guide

## Overview
The mission automatically tracks:
- ✅ Mission completion status
- ✅ Quiz scores (0-3 correct answers per mission)
- ✅ Time spent on each page (in seconds)
- ✅ Detailed visit history with timestamps
- ✅ Session information

## Quick Export (Easiest Method)

### Step 1: Open the Mission Website
Navigate to your NASA Sonic Boom Mission dashboard.

### Step 2: Open Browser Console
Press **F12** (or **Ctrl+Shift+I** on Windows/Linux, **Cmd+Option+I** on Mac)

### Step 3: Go to Console Tab
Click on the "Console" tab in Developer Tools

### Step 4: Run Export Command
Type or paste this command:
```javascript
downloadProgressCSV()
```

Press **Enter** ✓

### Step 5: Download Complete!
Your CSV file will appear in your Downloads folder as:
```
nasa-sonic-boom-progress-[timestamp].csv
```

---

## What's Tracked?

### Mission Progress
| Field | Details |
|-------|---------|
| Mission | Mission 1, 2, 3, 4 |
| Completed | Yes/No |
| Score | 0-3 (number of correct quiz answers) |

### Page Metrics
| Field | Details |
|-------|---------|
| Page | Page title/name |
| Time Spent | Total seconds on the page |
| Visit Time | When user entered page |
| Exit Time | When user left page |

### Session Data
| Field | Details |
|-------|---------|
| Session ID | Unique identifier per browser session |
| Visit History | All page visits with timestamps |
| Export Date | When the CSV was created |

---

## CSV File Format

Your exported file will look like:
```
Session Report

SESSION ID,session_1712819204000_abc123def
EXPORT DATE,2024-04-10 14:20:30

MISSION PROGRESS
Mission,Completed,Score
lesson1,Yes,3
lesson2,No,0
lesson3,Yes,2
lesson4,No,0

PAGE METRICS
Page,Time Spent (seconds),Visit Time,Exit Time
Dashboard,120,2024-04-10 14:15:00,2024-04-10 14:17:00
Lesson 1,300,2024-04-10 14:17:05,2024-04-10 14:22:10

PAGE VISITS
Page,Visit Time
Dashboard,2024-04-10 14:15:00
Lesson 1,2024-04-10 14:17:05
```

---

## Alternative Methods

### Using Command Line (Node.js)

If you prefer command line tools:

```bash
node export_data.js
```

This will show you detailed instructions for exporting in the browser.

### Using Python

```bash
python3 export_progress.py
```

Opens a guide in your browser with step-by-step instructions.

---

## Troubleshooting

### CSV File Didn't Download
- **Solution**: Make sure you ran the command in the Console tab
- **Check**: Your browser's download settings might have blocked it
- **Try**: A different browser (Chrome, Firefox, Safari, Edge)

### Command Not Recognized
- **Solution**: Make sure you're on the mission website page
- **Check**: Confirm app.js is loaded (check Network tab)
- **Try**: Refresh the page (Ctrl+R) and try again

### Data is Empty/Blank
- **Reason**: You haven't visited any mission pages yet
- **Solution**: Visit a few missions first, then export
- **Check**: Go to Application → Local Storage to verify data exists

### Browser Console Not Opening
- **Windows/Linux**: Press **Ctrl+Shift+I** or **F12**
- **Mac**: Press **Cmd+Option+I**
- **Alternative**: Right-click → Inspect → Console tab

---

## Data Storage Location

Data is stored in your browser's **Local Storage**:

### Chrome
`Application` → `Local Storage` → Select your domain

### Firefox
`Storage` → `Local Storage` → Select your domain

### Safari
`Develop` → `Show Web Inspector` → `Storage` tab

### Edge
`Application` → `Local Storage` → Select your domain

---

## Tips for Best Results

1. **Regular Exports**: Export your data regularly (weekly)
2. **Don't Clear Browser Data**: This deletes your stored progress
3. **One Session = One Browser**: Data is per-browser, not synced
4. **Backup Your CSVs**: Keep copies of exported files
5. **Use Descriptive Filenames**: Rename CSVs with dates if you export multiple times

---

## Available Commands in Console

### Export CSV
```javascript
downloadProgressCSV()
```

### View Raw Data
```javascript
exportToCSV()  // Returns CSV data as string
```

### Reset All Progress
```javascript
resetProgress()  // Clears all data and refreshes page
```

---

## Questions?

If you need help:
1. Check the browser console for error messages (F12)
2. Make sure JavaScript is enabled
3. Try a different browser
4. Check if Local Storage is enabled in privacy settings

---

**Last Updated**: April 2026
**Version**: 1.0
