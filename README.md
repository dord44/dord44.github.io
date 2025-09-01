# 🎵 Radio Quebrada - Underground Web Radio Station

**The coolest retro radio station on the web!**

## 🚀 Features

- ✅ **Latest Episode Auto-play** - Always starts with the newest episode
- ✅ **Smart Shuffle Mode** - Auto-advance with intelligent episode selection
- ✅ **Mixcloud Integration** - Seamless streaming from mixcloud.com/radioquebrada
- ✅ **Real-time Tracklists** - Live track display with timing
- ✅ **Retro Aesthetic** - Nostalgic Y2K/early web design
- ✅ **Mobile Responsive** - Works on all devices
- ✅ **Episode Browser** - Browse all episodes with covers
- ✅ **Music Platform Links** - Direct links to Bandcamp, Tidal, Apple Music

## 🏗️ Project Structure

```
radio-quebrada/
├── index.html              # Main site (monolithic - legacy)
├── index-organized.html    # NEW: Organized modular version
├── css/
│   └── styles.css          # All CSS styles (900+ lines)
├── js/
│   ├── radio-quebrada.js   # Core functionality & shuffle
│   └── tracklist.js        # Tracklist modal & music links
├── radio-quebrada-logo.jpg # Station logo
├── CNAME                   # Custom domain config
└── package.json           # Surge deployment config
```

## 🎯 Recent Updates

### Latest Episode + Shuffle Implementation
- **Auto-play Latest**: Site now automatically plays the newest episode on load
- **Smart Shuffle**: Auto-advance uses intelligent shuffling that avoids recent repeats
- **Shuffle History**: Tracks up to 20 recently played episodes to ensure variety
- **Enhanced Logging**: Detailed console logging for debugging

### Code Organization
- **Modular JavaScript**: Split monolithic code into organized modules
- **External CSS**: Extracted all styles to separate stylesheet
- **Clean HTML**: Streamlined HTML structure with external dependencies
- **Better Maintainability**: Easier to update and extend functionality

## 🛠️ Development

### File Versions
- `index.html` - Original monolithic version (4000+ lines)
- `index-organized.html` - NEW organized version with external files

### Live Site
- **Domain**: [radioquebrada.live](https://radioquebrada.live)
- **GitHub Pages**: [dord44.github.io](https://dord44.github.io)
- **Mixcloud**: [mixcloud.com/radioquebrada](https://mixcloud.com/radioquebrada/)

### Technologies
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **API**: Mixcloud API for episode data
- **Hosting**: GitHub Pages with custom domain
- **Design**: Retro/Y2K aesthetic with modern functionality

## 🎵 How It Works

1. **Page Load** → Fetches all episodes from Mixcloud API
2. **Auto-start** → Plays latest episode (index 0 - newest first)
3. **Auto-advance** → Smart shuffle picks next episode avoiding recent plays
4. **Track Sync** → Real-time track display with Mixcloud widget communication
5. **Continuous Play** → Endless listening experience with variety

## 🔧 Technical Details

### Shuffle Algorithm
- Maintains history of last 10-20 played episodes
- Avoids immediate repeats while ensuring all episodes get played
- Resets history when all episodes have been recently played
- Weighted selection for better variety

### Auto-advance Detection
- **Mixcloud Widget Messages**: Listens for 'ended' events
- **Duration Monitoring**: Fetches actual episode length from API
- **Fallback Timing**: Uses realistic duration estimates per episode era
- **Multiple Strategies**: Combines approaches for reliability

### Episode Management
- **API Pagination**: Loads all episodes across multiple API pages
- **Date Sorting**: Newest episodes first (perfect for latest-first play)
- **Image Handling**: Extracts cover art with fallbacks
- **Lazy Loading**: Shows initial episodes, loads more on demand

## 📅 Version History

### v2.0 (Latest)
- ✅ Latest episode auto-play
- ✅ Smart shuffle mode
- ✅ Code organization (CSS/JS modules)
- ✅ Enhanced auto-advance reliability

### v1.0 (Previous)
- ✅ Basic Mixcloud integration
- ✅ Episode browser
- ✅ Tracklist modals
- ✅ Retro design
- ✅ Bitcoin tips & merch store

## 🎧 Listen Now

Visit [radioquebrada.live](https://radioquebrada.live) and experience the underground!

---

*Broadcasting from the digital underground since 2024* 🚀
