# 🎵 YouTube Data Setup Guide

This guide will help you get real Mezwed music data from YouTube for your platform.

## 📋 Prerequisites

1. **Google Account** - You need a Google account
2. **Node.js** - Version 14 or higher
3. **Internet Connection** - To access YouTube Data API

## 🔑 Step 1: Get YouTube API Key

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Create a New Project
- Click on the project dropdown at the top
- Click "New Project"
- Name it something like "Mezwed Music Platform"
- Click "Create"

### 3. Enable YouTube Data API
- In your new project, go to "APIs & Services" > "Library"
- Search for "YouTube Data API v3"
- Click on it and click "Enable"

### 4. Create API Key
- Go to "APIs & Services" > "Credentials"
- Click "Create Credentials" > "API Key"
- Copy your API key (it looks like: `AIzaSyC...`)

## 🚀 Step 2: Configure the Script

### Option A: Environment Variable (Recommended)
```bash
# On Windows (PowerShell)
$env:YOUTUBE_API_KEY="your_api_key_here"

# On Windows (Command Prompt)
set YOUTUBE_API_KEY=your_api_key_here

# On Mac/Linux
export YOUTUBE_API_KEY="your_api_key_here"
```

### Option B: Edit the Script
Open `scripts/fetch-mezwed-data.js` and replace:
```javascript
const API_KEY = process.env.YOUTUBE_API_KEY || 'YOUR_API_KEY_HERE';
```
with:
```javascript
const API_KEY = 'your_actual_api_key_here';
```

## 🎵 Step 3: Fetch Real Mezwed Data

### Run the Data Fetching Script
```bash
npm run fetch-data
```

This will:
1. Search YouTube for Mezwed music videos
2. Get video details (duration, views, etc.)
3. Create a JSON file with all the data
4. Save it to `src/data/mezwed-data.json`

### What the Script Does
- Searches for 6 Tunisian Mezwed artists
- Finds up to 10 videos per artist
- Gets video metadata (title, thumbnail, channel, etc.)
- Creates a structured JSON file
- Handles rate limiting to respect YouTube's API limits

## 📊 Expected Output

The script will create a JSON file with this structure:
```json
{
  "artists": {
    "Hedi Habbouba": {
      "name": "Hedi Habbouba",
      "description": "Legendary Mezwed artist...",
      "image": "https://...",
      "songs": [
        {
          "title": "Hedi Habbouba - Ya Leil Ya Leil",
          "youtubeId": "dQw4w9WgXcQ",
          "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          "thumbnail": "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
          "channelTitle": "Tunisian Music Channel",
          "publishedAt": "2023-01-15T10:30:00Z"
        }
      ]
    }
  }
}
```

## 🎯 Step 4: Test Your Platform

1. **Start the development server:**
   ```bash
   npm start
   ```

2. **Open your browser:**
   Go to http://localhost:3000

3. **Test the features:**
   - Select an artist
   - Music should start playing automatically
   - Click on different songs in the playlist
   - Use the play/pause and skip controls
   - Click the YouTube link to open in YouTube

## 🔧 Troubleshooting

### API Key Issues
- Make sure your API key is correct
- Check that YouTube Data API v3 is enabled
- Verify your Google Cloud project is selected

### Rate Limiting
- The script includes delays between requests
- If you hit rate limits, wait a few minutes and try again
- YouTube allows 10,000 requests per day

### No Videos Found
- Try different search terms in the script
- Some artists might have limited YouTube presence
- Check if videos are available in your region

## 🎵 Real Mezwed Artists to Search

The script searches for these artists:
- **Hedi Habbouba** - Legendary Mezwed artist
- **Lotfi Jormana** - Modern Mezwed performer  
- **Salah El Mezwed** - Contemporary artist
- **Ahmed El Mezwed** - Traditional master
- **Mohamed El Mezwed** - Innovative fusion artist
- **Ali El Mezwed** - Young talent

## 📱 Features

Your platform now supports:
- ✅ **Direct YouTube Playback** - No downloads needed
- ✅ **Infinite Looping** - Songs auto-play continuously
- ✅ **LocalStorage Caching** - Remembers your artist choice
- ✅ **Beautiful UI** - Modern, responsive design
- ✅ **Playlist View** - See all songs by each artist
- ✅ **YouTube Integration** - Click to open in YouTube

## 🎉 Enjoy Your Mezwed Platform!

Your React app now plays real Mezwed music directly from YouTube, creating an authentic radio-like experience for Tunisian music lovers!

---

**Note:** This approach is completely legal as it only embeds YouTube videos and doesn't download any content. Users can enjoy the music while supporting the original creators through YouTube's platform.
