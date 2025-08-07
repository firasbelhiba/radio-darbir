const fs = require('fs');
const path = require('path');

// YouTube Data API v3 Configuration
const API_KEY = process.env.YOUTUBE_API_KEY || 'YOUR_API_KEY_HERE';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Mezwed artists and their search terms
const MEZWED_ARTISTS = [
  {
    name: "Hedi Habbouba",
    searchTerms: [
      "Hedi Habbouba Mezwed",
      "Hedi Habbouba Ya Leil",
      "Hedi Habbouba Mazal",
      "Hedi Habbouba Ya Habibi"
    ],
    description: "Legendary Mezwed artist known for traditional Tunisian folk music",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=face"
  },
  {
    name: "Lotfi Jormana",
    searchTerms: [
      "Lotfi Jormana Mezwed",
      "Lotfi Jormana Sahra",
      "Lotfi Jormana Ya Zina",
      "Lotfi Jormana Mazal Fi El Hawa"
    ],
    description: "Modern Mezwed performer with contemporary influences",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"
  },
  {
    name: "Salah El Mezwed",
    searchTerms: [
      "Salah El Mezwed",
      "Salah Mezwed Ya Ghali",
      "Salah Mezwed Mazal Fi El Hawa"
    ],
    description: "Contemporary Mezwed artist blending traditional and modern styles",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face"
  },
  {
    name: "Ahmed El Mezwed",
    searchTerms: [
      "Ahmed El Mezwed",
      "Ahmed Mezwed Ya Habibi Ya Ghali",
      "Ahmed Mezwed Mazal Fi El Hawa"
    ],
    description: "Traditional Mezwed master preserving authentic Tunisian sound",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face"
  },
  {
    name: "Mohamed El Mezwed",
    searchTerms: [
      "Mohamed El Mezwed",
      "Mohamed Mezwed Ya Zina Ya Ghali",
      "Mohamed Mezwed Mazal Fi El Hawa"
    ],
    description: "Innovative Mezwed artist with electronic fusion elements",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face"
  },
  {
    name: "Ali El Mezwed",
    searchTerms: [
      "Ali El Mezwed",
      "Ali Mezwed Ya Habibi Ya Ghali",
      "Ali Mezwed Mazal Fi El Hawa"
    ],
    description: "Young Mezwed talent bringing fresh energy to traditional music",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face"
  }
];

// Search YouTube for videos
async function searchYouTube(term) {
  try {
    const response = await fetch(
      `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(term)}&type=video&videoCategoryId=10&maxResults=5&key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error(`Error searching for "${term}":`, error.message);
    return [];
  }
}

// Get video details
async function getVideoDetails(videoIds) {
  if (videoIds.length === 0) return [];
  
  try {
    const response = await fetch(
      `${BASE_URL}/videos?part=contentDetails,statistics&id=${videoIds.join(',')}&key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error getting video details:', error.message);
    return [];
  }
}

// Main function to fetch all Mezwed data
async function fetchMezwedData() {
  console.log('🎵 Starting Mezwed data collection...');
  
  const mezwedData = {
    artists: {},
    metadata: {
      generatedAt: new Date().toISOString(),
      totalArtists: MEZWED_ARTISTS.length,
      apiVersion: "YouTube Data API v3"
    }
  };

  for (const artist of MEZWED_ARTISTS) {
    console.log(`\n🔍 Searching for ${artist.name}...`);
    
    const allVideos = [];
    
    // Search for each term
    for (const term of artist.searchTerms) {
      console.log(`  Searching: "${term}"`);
      const videos = await searchYouTube(term);
      allVideos.push(...videos);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Remove duplicates based on video ID
    const uniqueVideos = allVideos.filter((video, index, self) => 
      index === self.findIndex(v => v.id.videoId === video.id.videoId)
    );
    
    // Get additional details for videos
    const videoIds = uniqueVideos.map(v => v.id.videoId);
    const videoDetails = await getVideoDetails(videoIds);
    
    // Create songs array
    const songs = uniqueVideos.map(video => {
      const details = videoDetails.find(d => d.id === video.id.videoId);
      return {
        title: video.snippet.title,
        youtubeId: video.id.videoId,
        url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
        thumbnail: video.snippet.thumbnails.medium.url,
        channelTitle: video.snippet.channelTitle,
        publishedAt: video.snippet.publishedAt,
        duration: details?.contentDetails?.duration || null,
        viewCount: details?.statistics?.viewCount || null
      };
    });
    
    // Add artist to data
    mezwedData.artists[artist.name] = {
      name: artist.name,
      description: artist.description,
      image: artist.image,
      songs: songs.slice(0, 10) // Limit to 10 songs per artist
    };
    
    console.log(`  ✅ Found ${songs.length} videos for ${artist.name}`);
    
    // Rate limiting between artists
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  return mezwedData;
}

// Save data to file
function saveMezwedData(data) {
  const outputPath = path.join(__dirname, '..', 'src', 'data', 'mezwed-data.json');
  
  // Create directory if it doesn't exist
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`\n💾 Data saved to: ${outputPath}`);
  
  // Also save a backup
  const backupPath = path.join(__dirname, '..', 'mezwed-data-backup.json');
  fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
  console.log(`📦 Backup saved to: ${backupPath}`);
}

// Main execution
async function main() {
  if (API_KEY === 'YOUR_API_KEY_HERE') {
    console.error('❌ Please set your YouTube API key:');
    console.error('1. Go to https://console.cloud.google.com/');
    console.error('2. Create a project and enable YouTube Data API v3');
    console.error('3. Create credentials (API Key)');
    console.error('4. Set environment variable: export YOUTUBE_API_KEY=your_key_here');
    console.error('5. Or replace YOUR_API_KEY_HERE in this script');
    process.exit(1);
  }
  
  try {
    const data = await fetchMezwedData();
    saveMezwedData(data);
    
    console.log('\n🎉 Mezwed data collection completed!');
    console.log(`📊 Total artists: ${data.metadata.totalArtists}`);
    
    let totalSongs = 0;
    Object.values(data.artists).forEach(artist => {
      totalSongs += artist.songs.length;
    });
    console.log(`🎵 Total songs: ${totalSongs}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { fetchMezwedData, saveMezwedData };
