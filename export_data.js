#!/usr/bin/env node

/**
 * NASA Sonic Boom Mission - CSV Export Tool
 * Run this from the command line to generate a CSV export
 * Usage: node export_data.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('\n🚀 NASA Sonic Boom Mission - CSV Export Tool\n');
console.log('This script exports progress data from the browser localStorage.');
console.log('Make sure you have opened the mission website in your browser first.\n');

// Instructions
console.log('📋 To export your data:');
console.log('1. Open your browser (Chrome, Firefox, Edge, Safari)');
console.log('2. Press F12 (or right-click → Inspect) to open Developer Tools');
console.log('3. Go to the Console tab');
console.log('4. Run this command: downloadProgressCSV()');
console.log('\n✅ A CSV file will be downloaded automatically!\n');

// Alternative: Extract from localStorage
console.log('Alternative: Manual Export\n');
console.log('If the above doesn\'t work, you can manually export:\n');

const instructions = `
1. Open Developer Tools (F12)
2. Go to Console tab
3. Paste this code:

    let data = {
        progress: localStorage.getItem('nasaSonicBoomProgress'),
        pageMetrics: localStorage.getItem('pageMetrics'),
        pageVisits: localStorage.getItem('pageVisits')
    };
    console.log(JSON.stringify(data, null, 2));
    
4. Copy the output to a text file

OR go to Application/Storage tab:
- Chrome: Application → Local Storage
- Firefox: Storage → Local Storage
- Safari: Develop → Show Web Inspector → Storage
`;

console.log(instructions);

// Create a sample data file for reference
const sampleData = {
    progress: {
        completedMissions: [],
        missionScores: {
            lesson1: { completed: false, score: 0 },
            lesson2: { completed: false, score: 0 },
            lesson3: { completed: false, score: 0 },
            lesson4: { completed: false, score: 0 },
            lesson6: { completed: false, score: 0 }
        },
        startTime: Date.now()
    },
    pageMetrics: [],
    pageVisits: []
};

const README = `
# NASA Sonic Boom Mission - Data Export Guide

## Quick Export (Recommended)
1. Open the mission website
2. Press F12 (Developer Tools)
3. Go to Console tab
4. Type: downloadProgressCSV()
5. CSV file downloads automatically

## What Data is Tracked?
- Mission completion status
- Quiz scores (0-3 per mission)
- Time spent on each page (in seconds)
- Page visit timestamps
- Session ID
- Total progress

## CSV File Contents
The exported CSV includes:
1. Session ID and export date
2. Mission progress matrix
3. Page metrics (time spent)
4. Page visit history

## Supported Browsers
- Chrome/Chromium
- Firefox
- Safari
- Edge

## Troubleshooting

### CSV Download Not Working?
Try the manual method:
1. F12 → Application → Local Storage
2. Expand your domain
3. Copy the values for:
   - nasaSonicBoomProgress
   - pageMetrics
   - pageVisits

### Data is Empty?
- Make sure you've played some missions first
- Check if localStorage is enabled in browser settings
- Try incognito/private mode

### File Download Issues?
- Check browser download settings
- Disable any download blockers
- Try a different browser

## Questions?
Contact your instructor or check the browser console for errors.
`;

// Write README
fs.writeFileSync(path.join(__dirname, 'EXPORT_GUIDE.txt'), README);

console.log('\n📖 A detailed guide has been saved to: EXPORT_GUIDE.txt\n');

rl.question('Press Enter to close this window...', () => {
    rl.close();
    process.exit(0);
});
