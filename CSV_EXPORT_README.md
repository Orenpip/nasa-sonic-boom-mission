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

Your exported file will have multiple sections for easy analysis:

### 1. Header Information
```
=== NASA SONIC BOOM MISSION - STUDENT REPORT ===
Session ID,session_1712819204000_abc123def
Export Date,4/10/2026, 2:30:45 PM
Total Missions Completed,4
```

### 2. Mission Progress Summary
```
Mission,Status,Score out of 3,Quiz Answers,Completion Date
lesson1,COMPLETED,3,Correct/Correct/Correct,4/10/2026, 2:15:30 PM
lesson2,COMPLETED,2,Correct/Wrong/Correct,4/10/2026, 2:20:15 PM
lesson3,Not Started,0,N/A,N/A
lesson4,COMPLETED,2,Correct/Correct/Wrong,4/10/2026, 2:25:45 PM
lesson6,COMPLETED,3,Correct/Correct/Correct,4/10/2026, 2:28:10 PM
```

**Shows per-question performance:**
- ✓ Correct = Student answered correctly
- ✗ Wrong = Student answered incorrectly
- Easy to spot problem areas across your class

### 3. Time Spent on Each Lesson
```
Lesson,Total Time (seconds),Total Time (minutes),Visits
dashboard,120,2.0,3
lesson1,300,5.0,1
lesson2,180,3.0,1
lesson4,240,4.0,1
lesson6,360,6.0,2
```

**Time metrics help you understand:**
- How long students spend per mission
- Whether they revisit lessons
- Pacing and engagement levels

### 4. Detailed Page Activity
```
Page,Time Spent (seconds),Visits
Dashboard,120,3
Lesson 1,300,1
Lesson 2,180,1
Lesson 4,240,1
Lesson 6,360,2
```

**Activity summary for all interactions**

---

## What Can Educators Do With This Data?

### Identify Learning Patterns
- **Quiz Performance** - See which exact questions are causing confusion ("Quiz Answers" column shows Correct/Wrong per question)
- **Time Analysis** - Compare time spent to performance (fast + high score = mastery, slow + low score = struggling)
- **Engagement** - Track whether students revisit lessons ("Visits" column)
- **Class Trends** - Collect multiple student exports to find class-wide problem areas

### Example Use Cases
| Observation | Action |
|---|---|
| All students get Q2 wrong | Reteach that concept |
| Student spends 20 min but scores 0/3 | Offer one-on-one help |
| Student skips missions | Check participation status |
| High engagement but low scores | May indicate difficulty/confusion |
| Low engagement (2-3 min/lesson) | May indicate rushing/skipping |

### Analysis Tips
1. **Excel/Sheets Import** - Open CSV in Excel to create pivot tables and charts
2. **Export Weekly** - Build a trend report over time
3. **Export per Student** - Use one browser per student to track individuals
4. **Compare Against Benchmarks** - 3-5 min per lesson is typical
5. **Share with Parents** - Show time metrics and quiz performance

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
