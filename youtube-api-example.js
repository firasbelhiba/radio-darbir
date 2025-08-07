// YouTube Data API v3 Example
// This is a LEGAL way to get YouTube video information

const API_KEY = 'YOUR_YOUTUBE_API_KEY'; // Get from Google Cloud Console
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Search for Mezwed music videos
async function searchMezwedVideos() {
  const searchTerms = [
    'Hedi Habbouba Mezwed',
    'Lotfi Jormana Mezwed',
    'Salah El Mezwed',
    'Ahmed El Mezwed',
    'Mohamed El Mezwed',
    'Ali El Mezwed',
    'Tunisian Mezwed Music',
    'مزود تونسي',
    'Hedi Habbouba Ya Leil',
    'Lotfi Jormana Sahra'
  ];

  const allVideos = [];

  for (const term of searchTerms) {
    try {
      const response = await fetch(
        `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(term)}&type=video&videoCategoryId=10&maxResults=10&key=${API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.items) {
        data.items.forEach(item => {
          allVideos.push({
            id: item.id.videoId,
            title: item.snippet.title,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
            thumbnail: item.snippet.thumbnails.medium.url,
            description: item.snippet.description,
            searchTerm: term
          });
        });
      }
      
      // Rate limiting - wait between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`Error searching for "${term}":`, error);
    }
  }

  return allVideos;
}

// Get video details (duration, view count, etc.)
async function getVideoDetails(videoIds) {
  const details = [];
  
  // Process in batches of 50 (API limit)
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const ids = batch.join(',');
    
    try {
      const response = await fetch(
        `${BASE_URL}/videos?part=contentDetails,statistics&id=${ids}&key=${API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.items) {
        details.push(...data.items);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Error getting video details:', error);
    }
  }
  
  return details;
}

// Create the final JSON structure
async function createMezwedJSON() {
  console.log('Searching for Mezwed videos...');
  const videos = await searchMezwedVideos();
  
  console.log('Getting video details...');
  const videoIds = videos.map(v => v.id);
  const details = await getVideoDetails(videoIds);
  
  // Combine search results with details
  const mezwedData = {
    artists: {
      "Hedi Habbouba": {
        name: "Hedi Habbouba",
        description: "Legendary Mezwed artist known for traditional Tunisian folk music",
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=face",
        songs: videos
          .filter(v => v.searchTerm.includes('Hedi Habbouba'))
          .map(v => ({
            title: v.title,
            youtubeId: v.id,
            url: `https://www.youtube.com/watch?v=${v.id}`,
            thumbnail: v.thumbnail,
            channelTitle: v.channelTitle,
            publishedAt: v.publishedAt
          }))
      },
      "Lotfi Jormana": {
        name: "Lotfi Jormana",
        description: "Modern Mezwed performer with contemporary influences",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
        songs: videos
          .filter(v => v.searchTerm.includes('Lotfi Jormana'))
          .map(v => ({
            title: v.title,
            youtubeId: v.id,
            url: `https://www.youtube.com/watch?v=${v.id}`,
            thumbnail: v.thumbnail,
            channelTitle: v.channelTitle,
            publishedAt: v.publishedAt
          }))
      }
      // Add more artists as needed
    },
    metadata: {
      totalVideos: videos.length,
      searchTerms: searchTerms,
      generatedAt: new Date().toISOString(),
      apiVersion: "YouTube Data API v3"
    }
  };
  
  return mezwedData;
}

// Usage example
createMezwedJSON()
  .then(data => {
    console.log('Mezwed data:', JSON.stringify(data, null, 2));
    
    // Save to file
    const fs = require('fs');
    fs.writeFileSync('mezwed-youtube-data.json', JSON.stringify(data, null, 2));
    console.log('Data saved to mezwed-youtube-data.json');
  })
  .catch(error => {
    console.error('Error creating Mezwed JSON:', error);
  });
