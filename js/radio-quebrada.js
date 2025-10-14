/**
 * Radio Quebrada - Main JavaScript Module
 * Retro Web Radio Station - Complete functionality
 */

// Global configuration and state
const RadioQuebrada = {
    // Configuration
    MIXCLOUD_USERNAME: 'radioquebrada',
    EPISODES_PER_PAGE: 10,
    
    // State variables
    episodes: [],
    allEpisodes: [],
    currentEpisode: null,
    currentEpisodeIndex: 0,
    autoAdvanceEnabled: true,
    shuffleEnabled: true,
    shuffleHistory: [],
    trackTimer: null,
    trackStartTime: Date.now(),
    currentTrackIndex: 0,
    currentTracklist: [],
    isTracklistVisible: false,
    hasStarted: false,
    displayedCount: 0,
    playerCheckInterval: null,
    mixcloudMessageListener: null,

    // Initialize the radio application
    init() {
        console.log('🎵 Initializing Radio Quebrada...');
        this.setupEventListeners();
        this.startApp();
    },

    // Setup event listeners
    setupEventListeners() {
        // DOM content loaded
        document.addEventListener('DOMContentLoaded', () => {
            this.onDOMContentLoaded();
        });

        // Merch item clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('.merch-item button')) {
                this.handleMerchClick(e);
            }
        });

        // Modal clicks
        window.onclick = (event) => {
            const modal = document.getElementById('tracklistModal');
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        };
    },

    // Start the application
    async startApp() {
        try {
            console.log('🎵 Starting Radio Quebrada application...');
            await this.fetchAllEpisodes();
            this.setupUI();
        } catch (error) {
            console.error('🚨 Error starting app:', error);
        }
    },

    // Handle DOM content loaded
    onDOMContentLoaded() {
        this.fetchAllEpisodes().then(() => {
            if (this.episodes.length > 0) {
                this.setupStartButton();
                setTimeout(() => {
                    this.playLatestEpisode();
                }, 100);
            }
        });

        this.setupStartButtonListener();
        this.startAnimations();
    },

    // Setup UI components
    setupUI() {
        if (this.episodes.length > 0) {
            const startBtn = document.getElementById('start-radio');
            if (startBtn) {
                startBtn.style.fontSize = '24px';
                startBtn.style.padding = '20px 40px';
                startBtn.innerHTML = '🎵 CLICK TO START RADIO! 🎵<br><small>LATEST EPISODE READY!</small>';
            }
        }
    },

    // Setup start button
    setupStartButton() {
        const startBtn = document.getElementById('start-radio');
        if (startBtn) {
            startBtn.style.fontSize = '24px';
            startBtn.style.padding = '20px 40px';
            startBtn.innerHTML = '🎵 CLICK TO START RADIO! 🎵<br><small>LATEST EPISODE READY!</small>';
        }
    },

    // Setup start button event listener
    setupStartButtonListener() {
        const startBtn = document.getElementById('start-radio');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                if (this.episodes.length > 0) {
                    this.playLatestEpisode();
                } else {
                    startBtn.textContent = '⏳ LOADING... PLEASE WAIT! ⏳';
                    const checkInterval = setInterval(() => {
                        if (this.episodes.length > 0) {
                            clearInterval(checkInterval);
                            this.playLatestEpisode();
                        }
                    }, 500);
                }
            });
        }
    },

    // Start animations (visitor counter, etc.)
    startAnimations() {
        // Animated visitor counter
        setInterval(() => {
            const counter = document.getElementById('counter');
            if (counter) {
                const current = parseInt(counter.textContent);
                counter.textContent = String(current + Math.floor(Math.random() * 5)).padStart(6, '0');
            }
        }, 5000);
    },

    // Play latest episode (first in sorted array)
    playLatestEpisode() {
        if (this.episodes.length > 0) {
            const latestIndex = 0; // Episodes are sorted by date (newest first)
            window.episodeStartTime = Date.now();
            this.playEpisode(latestIndex);
            console.log('🎵 Auto-playing latest episode:', this.episodes[latestIndex].title);
        }
    },

    // Play random episode
    playRandomEpisode() {
        if (this.episodes.length > 0) {
            const randomIndex = Math.floor(Math.random() * this.episodes.length);
            window.episodeStartTime = Date.now();
            this.playEpisode(randomIndex);
        }
    },

    // Play specific episode by index
    playEpisode(index) {
        const episode = this.episodes[index];
        if (!episode) return;

        this.currentEpisode = episode;
        this.currentEpisodeIndex = index;
        window.episodeStartTime = Date.now();

        document.getElementById('current-episode').innerHTML = `🎧 NOW ON AIR: ${episode.title} 🎧`;

        // Hide start button once playing
        const startBtn = document.getElementById('start-radio');
        if (startBtn && !this.hasStarted) {
            startBtn.style.display = 'none';
            this.hasStarted = true;
        }

        this.loadEpisode(episode.url);
        this.fetchTracklistForMainPage(episode.key, episode.title);
        this.startAutoAdvanceMonitoring();

        console.log(`🎯 Now playing: ${episode.title} (Index: ${index})`);
    },

    // Load episode into Mixcloud player
    loadEpisode(episodeUrl) {
        const iframe = document.getElementById('mixcloud-player');
        if (iframe && episodeUrl) {
            iframe.src = `https://www.mixcloud.com/widget/iframe/?hide_cover=1&autoplay=1&feed=${encodeURIComponent(episodeUrl)}`;
            console.log('🎵 Loading episode:', episodeUrl);
        }
    },

    // Handle merch item clicks
    handleMerchClick(e) {
        const merchItem = e.target.closest('.merch-item');
        if (merchItem.querySelector('.sold-out')) {
            alert('😭 SORRY! THIS ITEM IS SOLD OUT! CHECK BACK LATER! 😭');
        } else {
            const itemName = merchItem.querySelector('h3').textContent;
            const price = merchItem.querySelector('.price').textContent;
            alert(`🛒 ADDED TO CART! 🛒\n\n${itemName}\nPrice: ${price}\n\n✨ THANKS FOR YOUR ORDER! ✨`);
            
            merchItem.style.transform = 'scale(1.2) rotate(5deg)';
            setTimeout(() => {
                merchItem.style.transform = '';
            }, 300);
        }
    }
};

// Auto-advance and shuffle functionality
RadioQuebrada.AutoAdvance = {
    // Get smart shuffle episode avoiding recent plays
    getSmartShuffleEpisode() {
        if (!RadioQuebrada.episodes.length) return 0;
        
        if (RadioQuebrada.shuffleHistory.length < 3) {
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * RadioQuebrada.episodes.length);
            } while (RadioQuebrada.shuffleHistory.includes(randomIndex) && RadioQuebrada.shuffleHistory.length < RadioQuebrada.episodes.length);
            return randomIndex;
        }
        
        const recentlyPlayed = RadioQuebrada.shuffleHistory.slice(-Math.min(10, Math.floor(RadioQuebrada.episodes.length / 3)));
        const availableEpisodes = [];
        
        for (let i = 0; i < RadioQuebrada.episodes.length; i++) {
            if (!recentlyPlayed.includes(i)) {
                availableEpisodes.push(i);
            }
        }
        
        if (availableEpisodes.length === 0) {
            console.log('🔄 Shuffle history reset - all episodes played recently');
            RadioQuebrada.shuffleHistory = [];
            return Math.floor(Math.random() * RadioQuebrada.episodes.length);
        }
        
        return availableEpisodes[Math.floor(Math.random() * availableEpisodes.length)];
    },

    // Auto advance to next episode
    autoAdvanceToNext() {
        if (!RadioQuebrada.autoAdvanceEnabled || !RadioQuebrada.episodes.length) return;
        
        console.log('🎵 AUTO-ADVANCING TO NEXT EPISODE...');
        console.log('🎵 Current episode index:', RadioQuebrada.currentEpisodeIndex);
        console.log('🎵 Total episodes:', RadioQuebrada.episodes.length);
        console.log('🎵 Shuffle enabled:', RadioQuebrada.shuffleEnabled);
        
        // Show advancement message
        const currentEpisodeDiv = document.getElementById('current-episode');
        if (currentEpisodeDiv) {
            const advanceMessage = RadioQuebrada.shuffleEnabled ? 
                '🎲 AUTO-ADVANCING TO RANDOM EPISODE... 🎲' : 
                '🚀 AUTO-ADVANCING TO NEXT EPISODE... 🚀';
                
            currentEpisodeDiv.innerHTML = advanceMessage;
            currentEpisodeDiv.style.background = 'linear-gradient(45deg, #00FF00, #00FFFF)';
            currentEpisodeDiv.style.color = '#000';
            
            setTimeout(() => {
                currentEpisodeDiv.style.background = '';
                currentEpisodeDiv.style.color = '';
            }, 2000);
        }
        
        let nextIndex;
        
        if (RadioQuebrada.shuffleEnabled) {
            nextIndex = this.getSmartShuffleEpisode();
            console.log('🎲 Shuffle mode: Selected episode', nextIndex);
            
            if (RadioQuebrada.currentEpisodeIndex !== undefined && RadioQuebrada.currentEpisodeIndex !== nextIndex) {
                RadioQuebrada.shuffleHistory.push(RadioQuebrada.currentEpisodeIndex);
                if (RadioQuebrada.shuffleHistory.length > Math.min(20, RadioQuebrada.episodes.length)) {
                    RadioQuebrada.shuffleHistory.shift();
                }
            }
        } else {
            // Sequential mode: go DOWN the episode list (69 -> 68 -> 67...)
            nextIndex = RadioQuebrada.currentEpisodeIndex - 1;
            if (nextIndex < 0) {
                nextIndex = RadioQuebrada.episodes.length - 1;
                console.log('🔄 Reached end of playlist, looping back to start');
            }
        }
        
        console.log('🎵 Next episode index will be:', nextIndex);
        console.log('🎵 Next episode title:', RadioQuebrada.episodes[nextIndex]?.title);
        console.log('🎵 Shuffle history length:', RadioQuebrada.shuffleHistory.length);
        
        setTimeout(() => {
            RadioQuebrada.playEpisode(nextIndex);
        }, 2000);
    },

    // Start auto-advance monitoring
    startAutoAdvanceMonitoring() {
        if (!RadioQuebrada.autoAdvanceEnabled) return;
        
        if (RadioQuebrada.playerCheckInterval) {
            clearInterval(RadioQuebrada.playerCheckInterval);
        }
        
        if (RadioQuebrada.mixcloudMessageListener) {
            window.removeEventListener('message', RadioQuebrada.mixcloudMessageListener, false);
        }
        
        console.log('🎵 Started auto-advance monitoring - using multiple detection methods');
        
        RadioQuebrada.mixcloudMessageListener = this.handleMixcloudMessage.bind(this);
        window.addEventListener('message', RadioQuebrada.mixcloudMessageListener, false);
        
        this.getActualEpisodeDuration(RadioQuebrada.currentEpisode).then(actualDuration => {
            if (actualDuration) {
                console.log(`🎵 Got actual duration: ${Math.round(actualDuration / 60000)} minutes`);
                this.startPreciseMonitoring(actualDuration);
            } else {
                console.log('🎵 Using estimated duration fallback');
                this.startPreciseMonitoring(this.getRealisticEpisodeDuration(RadioQuebrada.currentEpisode));
            }
        }).catch(error => {
            console.log('🎵 Error getting duration, using fallback:', error);
            this.startPreciseMonitoring(this.getRealisticEpisodeDuration(RadioQuebrada.currentEpisode));
        });
    },

    // Get actual episode duration from API
    async getActualEpisodeDuration(episode) {
        if (!episode || !episode.url) return null;
        
        try {
            console.log('🎵 Fetching actual episode duration from API...');
            const response = await fetch(`https://api.mixcloud.com${episode.url}`);
            const data = await response.json();
            
            if (data.audio_length) {
                return data.audio_length * 1000; // Convert to milliseconds
            }
        } catch (error) {
            console.log('Could not fetch actual duration:', error);
        }
        
        return null;
    },

    // Start precise monitoring based on duration
    startPreciseMonitoring(episodeDuration) {
        const startTime = Date.now();
        const endTime = startTime + episodeDuration;
        const warningTime = endTime - (30 * 1000);
        
        console.log(`🎵 Episode will end in approximately ${Math.round(episodeDuration / 60000)} minutes`);
        
        RadioQuebrada.playerCheckInterval = setInterval(() => {
            const currentTime = Date.now();
            const timeElapsed = currentTime - startTime;
            const timeRemaining = endTime - currentTime;
            
            if (Math.floor(timeElapsed / 1000) % 300 === 0 && timeElapsed > 0) {
                console.log(`🎵 Episode progress: ${Math.round(timeElapsed / 60000)} minutes played, ~${Math.round(timeRemaining / 60000)} minutes remaining`);
            }
            
            if (currentTime >= warningTime && currentTime < endTime) {
                console.log('🎵 Episode ending soon - preparing auto-advance...');
            }
            
            if (currentTime >= endTime) {
                console.log('🎵 Episode duration completed - auto-advancing!');
                clearInterval(RadioQuebrada.playerCheckInterval);
                this.autoAdvanceToNext();
            }
        }, 10000);
    },

    // Handle Mixcloud widget messages
    handleMixcloudMessage(event) {
        const mixcloudOrigins = [
            'https://widget.mixcloud.com',
            'https://www.mixcloud.com',
            'https://mixcloud.com'
        ];
        
        if (!mixcloudOrigins.includes(event.origin)) return;
        
        try {
            const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
            console.log('🎵 Received Mixcloud event:', data);
            
            if (data.type === 'ended' || data.event === 'ended' || 
                data.type === 'finish' || data.event === 'finish' ||
                data.type === 'stop' || data.event === 'stop') {
                console.log('🎵 Episode finished via widget event - auto-advancing!');
                if (RadioQuebrada.playerCheckInterval) {
                    clearInterval(RadioQuebrada.playerCheckInterval);
                }
                this.autoAdvanceToNext();
            }
            
            if (data.type === 'progress' || data.event === 'progress') {
                if (data.percent && data.percent >= 100) {
                    console.log('🎵 Episode at 100% completion - auto-advancing!');
                    if (RadioQuebrada.playerCheckInterval) {
                        clearInterval(RadioQuebrada.playerCheckInterval);
                    }
                    setTimeout(() => {
                        this.autoAdvanceToNext();
                    }, 1000);
                }
            }
        } catch (e) {
            console.log('Could not parse Mixcloud message:', event.data);
        }
    },

    // Get realistic episode duration estimate
    getRealisticEpisodeDuration(episode) {
        if (!episode) return 90 * 60 * 1000;
        
        const episodeNumber = this.extractEpisodeNumber(episode.title);
        
        if (episodeNumber <= 10) return 90 * 60 * 1000;
        if (episodeNumber <= 30) return 120 * 60 * 1000;
        if (episodeNumber <= 50) return 150 * 60 * 1000;
        return 180 * 60 * 1000;
    },

    // Extract episode number from title
    extractEpisodeNumber(title) {
        // Match patterns like "RADIO QUEBRADA LIVE! #69" or "Episode 69"
        const match = title.match(/#(\d+)|Episode\s*(\d+)/i);
        if (match) {
            return parseInt(match[1] || match[2]);
        }
        return 0; // Return 0 if can't extract
    }
};

// Episode management functionality
RadioQuebrada.Episodes = {
    // Fetch all episodes from Mixcloud API
    async fetchAllEpisodes() {
        const username = RadioQuebrada.MIXCLOUD_USERNAME;
        let url = `https://api.mixcloud.com/${username}/cloudcasts/`;
        let hasMore = true;
        
        document.getElementById('episodes-list').innerHTML = `
            <tr>
                <td colspan="3" style="color: #FFFF00; text-align: center;">
                    <span class="spinning-disc">💿</span>
                    LOADING ALL EPISODES FROM THE CYBERSPACE...
                    <span class="spinning-disc">💿</span>
                </td>
            </tr>
        `;

        try {
            while (hasMore) {
                const response = await fetch(url);
                const data = await response.json();
                
                if (data.data && data.data.length > 0) {
                    const pageEpisodes = data.data.map(episode => ({
                        title: episode.name,
                        url: episode.url,
                        key: episode.key,
                        created: new Date(episode.created_time),
                        dateStr: new Date(episode.created_time).toLocaleDateString(),
                        imageUrl: episode.pictures?.large || episode.pictures?.medium || episode.pictures?.small || episode.pictures?.thumbnail || ''
                    }));
                    
                    if (RadioQuebrada.allEpisodes.length === 0 && pageEpisodes.length > 0) {
                        console.log('First episode data:', data.data[0]);
                        console.log('Extracted image URL:', pageEpisodes[0].imageUrl);
                    }
                    
                    RadioQuebrada.allEpisodes = RadioQuebrada.allEpisodes.concat(pageEpisodes);
                }
                
                if (data.paging && data.paging.next) {
                    url = data.paging.next;
                } else {
                    hasMore = false;
                }
            }
            
            // Sort by date (newest first)
            RadioQuebrada.allEpisodes.sort((a, b) => b.created - a.created);
            RadioQuebrada.episodes = RadioQuebrada.allEpisodes;
            RadioQuebrada.displayedCount = 0;
            
            console.log(`🎵 LOADED ${RadioQuebrada.episodes.length} TOTAL EPISODES! 🎵`);
            
            this.displayEpisodes();
            return RadioQuebrada.episodes;
            
        } catch (error) {
            console.error('Error fetching episodes:', error);
            document.getElementById('episodes-list').innerHTML = `
                <tr>
                    <td colspan="3" style="color: #FF0000; text-align: center;">
                        ⚠️ ERROR LOADING EPISODES! CHECK YOUR INTERNET CONNECTION! ⚠️
                    </td>
                </tr>
            `;
            return [];
        }
    },

    // Display episodes in the table
    displayEpisodes() {
        const list = document.getElementById('episodes-list');
        const episodesToShow = RadioQuebrada.allEpisodes.slice(0, RadioQuebrada.displayedCount + RadioQuebrada.EPISODES_PER_PAGE);
        RadioQuebrada.displayedCount = episodesToShow.length;
        
        const totalCount = document.createElement('tr');
        totalCount.innerHTML = `
            <td colspan="3" style="background: #FF00FF; color: #000; font-weight: bold; text-align: center;">
                🎉 SHOWING ${RadioQuebrada.displayedCount} OF ${RadioQuebrada.allEpisodes.length} TOTAL EPISODES! 🎉
            </td>
        `;
        
        const episodeRows = episodesToShow.map((episode, index) => {
            let imageHtml;
            if (episode.imageUrl) {
                imageHtml = `<img src="${episode.imageUrl}" alt="${episode.title}" 
                    style="width: 60px; height: 60px; object-fit: cover; border: 2px solid #FFD700; box-shadow: 0 0 5px #00FF00;"
                    onerror="this.onerror=null; this.parentElement.innerHTML='<span style=\\'font-size: 40px;\\'>🎵</span>';">`;
            } else {
                imageHtml = '<span style="font-size: 40px;">🎵</span>';
            }
            
            return `
                <tr>
                    <td style="padding: 5px;" onclick="RadioQuebrada.playEpisode(${index})">
                        ${imageHtml}
                    </td>
                    <td onclick="RadioQuebrada.playEpisode(${index})">${episode.title}<br><small style="color: #888;">${episode.dateStr}</small></td>
                    <td style="color: #FFFF00; font-weight: bold;">
                        <span onclick="RadioQuebrada.playEpisode(${index})" style="cursor: pointer;">▶ PLAY</span>
                        <button class="tracklist-btn" onclick="RadioQuebrada.Tracklist.showTracklist('${episode.key}', '${episode.title.replace(/'/g, "\\'")}')">
                            📜 TRACKS
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
        list.innerHTML = totalCount.outerHTML + episodeRows;
        
        if (RadioQuebrada.displayedCount < RadioQuebrada.allEpisodes.length) {
            const showMoreRow = document.createElement('tr');
            showMoreRow.innerHTML = `
                <td colspan="3" style="padding: 20px; text-align: center; background: linear-gradient(45deg, #00FF00, #00FFFF); border: 3px solid #FFD700;">
                    <button onclick="RadioQuebrada.Episodes.showMoreEpisodes()" class="rainbow-button" style="font-size: 18px; padding: 15px 30px; background: linear-gradient(45deg, #FF6600, #FFD700); animation: pulse 2s infinite;">
                        📻 SHOW MORE EPISODES (${RadioQuebrada.allEpisodes.length - RadioQuebrada.displayedCount} REMAINING) 📻
                    </button>
                </td>
            `;
            list.appendChild(showMoreRow);
        } else if (RadioQuebrada.allEpisodes.length > RadioQuebrada.EPISODES_PER_PAGE) {
            const allLoadedRow = document.createElement('tr');
            allLoadedRow.innerHTML = `
                <td colspan="3" style="padding: 15px; text-align: center; background: #333; color: #00FF00; font-weight: bold;">
                    ✅ ALL ${RadioQuebrada.allEpisodes.length} EPISODES LOADED! ✅
                </td>
            `;
            list.appendChild(allLoadedRow);
        }
        
        RadioQuebrada.episodes = RadioQuebrada.allEpisodes;
    },

    // Show more episodes
    showMoreEpisodes() {
        const showMoreBtn = document.querySelector('button[onclick="RadioQuebrada.Episodes.showMoreEpisodes()"]');
        if (showMoreBtn) {
            showMoreBtn.innerHTML = '⏳ LOADING ALL REMAINING EPISODES... ⏳';
            showMoreBtn.disabled = true;
        }
        
        setTimeout(() => {
            RadioQuebrada.displayedCount = RadioQuebrada.allEpisodes.length;
            this.displayEpisodes();
        }, 500);
    }
};

// Bitcoin tip functionality
RadioQuebrada.Bitcoin = {
    // Copy Bitcoin address to clipboard
    copyAddress() {
        const addressText = 'bc1q063g9xpxaky6vls0gg4vuja8v8dhdw2m5hzuhhs6s58rqkuwlmzsrgcxxt';
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(addressText).then(() => {
                this.showCopySuccess();
            }).catch(() => {
                this.fallbackCopy(addressText);
            });
        } else {
            this.fallbackCopy(addressText);
        }
    },

    // Fallback copy method
    fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            this.showCopySuccess();
        } catch (err) {
            alert('Please copy the address manually: ' + text);
        }
        document.body.removeChild(textArea);
    },

    // Show copy success feedback
    showCopySuccess() {
        const btn = document.querySelector('.copy-btn');
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '✅ COPIED!';
            btn.style.background = '#00FF00';
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '#FFD700';
            }, 2000);
        }
    }
};

// Initialize the application when script loads
if (typeof window !== 'undefined') {
    // Make RadioQuebrada globally available
    window.RadioQuebrada = RadioQuebrada;
    
    // Auto-initialize if DOM is ready, otherwise wait for it
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => RadioQuebrada.init());
    } else {
        RadioQuebrada.init();
    }
}

// Assign auto-advance functionality
RadioQuebrada.fetchAllEpisodes = RadioQuebrada.Episodes.fetchAllEpisodes.bind(RadioQuebrada.Episodes);
RadioQuebrada.startAutoAdvanceMonitoring = RadioQuebrada.AutoAdvance.startAutoAdvanceMonitoring.bind(RadioQuebrada.AutoAdvance);
RadioQuebrada.copyAddress = RadioQuebrada.Bitcoin.copyAddress.bind(RadioQuebrada.Bitcoin);
