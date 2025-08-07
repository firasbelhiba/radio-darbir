// Simple script to help add real Mezwed YouTube videos
// This script will help you find and add real Mezwed music videos

const fs = require('fs');
const path = require('path');

// Function to extract YouTube video ID from URL
function extractYouTubeId(url) {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Function to generate thumbnail URL
function generateThumbnailUrl(videoId) {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

// Example: How to add real Mezwed videos
console.log('🎵 How to Add Real Mezwed Videos:');
console.log('');
console.log('1. Find Mezwed videos on YouTube');
console.log('2. Copy the video URL');
console.log('3. Extract the video ID');
console.log('4. Add to your JSON file');
console.log('');

// Example video URLs (you can replace these with real Mezwed videos)
const exampleVideos = [
  'https://www.youtube.com/watch?v=jNQXAC9IVRw', // Me at the zoo (example)
  'https://www.youtube.com/watch?v=9bZkp7q19f0', // PSY - GANGNAM STYLE (example)
  'https://www.youtube.com/watch?v=kJQP7kiw5Fk', // Luis Fonsi - Despacito (example)
];

console.log('📝 Example of how to add videos:');
exampleVideos.forEach((url, index) => {
  const videoId = extractYouTubeId(url);
  const thumbnail = generateThumbnailUrl(videoId);
  
  console.log(`Video ${index + 1}:`);
  console.log(`  URL: ${url}`);
  console.log(`  Video ID: ${videoId}`);
  console.log(`  Thumbnail: ${thumbnail}`);
  console.log('');
});

// Function to update JSON with new videos
function updateMezwedData(videoUrls) {
  const dataPath = path.join(__dirname, '../src/data/mezwed-data.json');
  
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // Update Fatma's songs with new video IDs
    data.artists.Fatma.songs = videoUrls.map((url, index) => {
      const videoId = extractYouTubeId(url);
      return {
        title: `Fatma - Song ${index + 1}`,
        youtubeId: videoId,
        url: url,
        thumbnail: generateThumbnailUrl(videoId),
        channelTitle: "Mezwed Music",
        publishedAt: new Date().toISOString()
      };
    });
    
    // Write updated data
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    console.log('✅ Updated mezwed-data.json with new videos!');
    
  } catch (error) {
    console.error('❌ Error updating data:', error.message);
  }
}

// Example usage:
// updateMezwedData([
//   'https://www.youtube.com/watch?v=YOUR_VIDEO_ID_1',
//   'https://www.youtube.com/watch?v=YOUR_VIDEO_ID_2',
//   'https://www.youtube.com/watch?v=YOUR_VIDEO_ID_3'
// ]);

console.log('🎯 To add real Mezwed videos:');
console.log('1. Search YouTube for "Mezwed music" or "Tunisian Mezwed"');
console.log('2. Copy the URLs of videos you like');
console.log('3. Replace the example URLs in this script');
console.log('4. Run: node scripts/add-mezwed-videos.js');
console.log('');
console.log('🔍 Good search terms:');
console.log('- "Mezwed music"');
console.log('- "Tunisian Mezwed"');
console.log('- "Hedi Habbouba"');
console.log('- "Lotfi Jormana"');
console.log('- "Salah El Mezwed"');
