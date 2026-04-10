# 📋 NASA Sonic Boom Mission - Progress Report Export

## Quick Start

1. Open the mission website
2. Press **F12** to open Developer Tools
3. Click **Console** tab
4. Type: `downloadProgressCSV()`
5. Press **Enter**
6. Check your Downloads folder for `.txt` file

That's it! You now have a clean readable report.

---

## What's in the Report?

### Section 1: Header Information
```
=====================================
NASA SONIC BOOM MISSION - STUDENT REPORT
=====================================

SESSION ID: session_1712819204000_abc123def
EXPORT DATE: 4/10/2026, 2:30:45 PM
TOTAL MISSIONS COMPLETED: 4
```

**What it shows:**
- Unique ID for this student/browser session
- When the report was created
- How many missions the student finished

---

### Section 2: Mission Progress

```
-------------------------------------
MISSION PROGRESS
-------------------------------------

LESSON1:
  Status: COMPLETED
  Score: 3/3
  Answers: Correct | Correct | Correct
  Completed: 4/10/2026, 2:15:30 PM

LESSON2:
  Status: COMPLETED
  Score: 2/3
  Answers: Correct | Wrong | Correct
  Completed: 4/10/2026, 2:20:15 PM

LESSON3:
  Status: Not Started
  Score: 0/3
  Answers: N/A
```

**What it shows:**
- Each mission status (Done or Not Started)
- Quiz score (0-3)
- **Right/Wrong for each question** (shows struggle areas)
- When completed

**Why this matters:**
- See exactly which quiz questions students missed
- Spot patterns (e.g., "Everyone gets Question 2 wrong")
- Track progress by completion date

---

### Section 3: Time Spent on Lessons

```
-------------------------------------
TIME SPENT ON LESSONS
-------------------------------------

lesson1:
  Time: 5.00 minutes (300 seconds)
  Visits: 1

lesson2:
  Time: 3.00 minutes (180 seconds)
  Visits: 1

lesson4:
  Time: 4.00 minutes (240 seconds)
  Visits: 2

dashboard:
  Time: 2.00 minutes (120 seconds)
  Visits: 3
```

**What it shows:**
- How long per lesson in minutes AND seconds
- How many times student visited
- Total engagement per activity

**Why this matters:**
- Quick indicator of engagement (too fast = skimming?)
- See if students revisited (learning or confusion?)
- Compare across students
- Benchmark: 3-5 min per lesson is typical

---

### Section 4: All Page Activity

```
-------------------------------------
ALL PAGE ACTIVITY
-------------------------------------

Dashboard:
  Time: 2.00 minutes (120 seconds)
  Visits: 3

Lesson 1:
  Time: 5.00 minutes (300 seconds)
  Visits: 1

Lesson 2:
  Time: 3.00 minutes (180 seconds)
  Visits: 1

Lesson 4:
  Time: 4.00 minutes (240 seconds)
  Visits: 2
```

**Summary of ALL student activity**

---

## How to Use the Report

### For Teachers:
1. **Export weekly** - Build a collection of progress reports
2. **Compare students** - See who's on track vs. struggling
3. **Identify problem areas** - Quiz answer patterns show what to reteach
4. **Monitor time** - Spot students who rush or get stuck

### For Parents:
1. **Track completion** - See which missions are done
2. **Monitor effort** - Check time spent (shows engagement)
3. **Identify struggles** - Look at quiz wrong answers
4. **Celebrate progress** - Share report with student

### Data Analysis Tips:
- **Open in Notepad** - Easy to copy/paste
- **Export multiple times** - Compare progress over time
- **Print it out** - Keep paper records
- **Share digitally** - Email to parents

---

## Example Scenarios

### 🟢 Student is doing great:
```
Status: COMPLETED, Score: 3/3
Answers: Correct | Correct | Correct
Time: 5.00 minutes
```
→ Ready for next mission!

### 🟡 Student is struggling:
```
Status: COMPLETED, Score: 1/3
Answers: Wrong | Wrong | Correct
Time: 12.00 minutes
```
→ Offer help! Taking longer and getting it wrong.

### 🔴 Student is rushing:
```
Status: COMPLETED, Score: 0/3
Answers: Wrong | Wrong | Wrong
Time: 1.50 minutes
```
→ Not reading carefully! Need to slow down.

### ⚪ Student hasn't started:
```
Status: Not Started
Score: 0/3
Time: N/A
```
→ Needs encouragement or check in!

---

## File Format

- **Filename:** `nasa-sonic-boom-progress-[date].txt`
- **Format:** Plain text (.txt)
- **Opens in:** Notepad, Word, Google Docs, any text editor
- **Easy to:** Copy, paste, share, print, compare

---

## Troubleshooting

### File won't download?
- Check browser download settings
- Try different browser (Chrome, Firefox, Edge)
- Check if pop-ups are blocked

### Data looks incomplete?
- Student needs to complete at least one mission first
- Refresh page and try again
- Check that JavaScript is enabled

### Want more details?
- All data is stored in browser
- Open Console and type: `exportToTXT()` to see raw text
- Check "Time: 0 minutes" means nobody visited that page yet

---

## Tips & Tricks

✅ **Export often** - Get a new report after each session  
✅ **Save with student name** - Rename file for organization  
✅ **Compare exports** - See progress week-to-week  
✅ **Share with team** - Email reports to other teachers  
✅ **Print for records** - Keep paper trail of learning  
✅ **Use for parent conferences** - Show concrete data  

---

**Questions?** Check the report format above or try the export command again!
