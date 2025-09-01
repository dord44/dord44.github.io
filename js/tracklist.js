/**
 * Radio Quebrada - Tracklist Module
 * Handles tracklist display, modals, and music platform integration
 */

// Extend RadioQuebrada with Tracklist functionality
RadioQuebrada.Tracklist = {
    // Local tracklist data for specific episodes
    localTracklists: {
        'rq-1': [
            {pos: 1, start: '00:00:17', end: '00:03:46', artist: 'Opez', title: 'Balera De Mar', label: 'Opez'},
            {pos: 2, start: '00:07:42', end: '00:11:26', artist: 'Tommy Guerrero', title: 'Thoughts of Tomorrow', label: 'Too Good'},
            {pos: 3, start: '00:11:26', end: '00:13:45', artist: 'L\'Eclair', title: 'Taishi-Koto, Pt. 1', label: 'L\'Eclair'},
            {pos: 4, start: '00:13:46', end: '00:17:33', artist: 'Jonny Greenwood', title: 'House of Woodcock', label: 'N/A'},
            {pos: 5, start: '00:17:33', end: '00:20:43', artist: 'Antonin', title: 'Antonino', label: 'Ekler\'o\'shock'},
            {pos: 6, start: '00:20:43', end: '00:26:08', artist: 'Plaid', title: 'Shackbu', label: 'Plaid'},
            {pos: 7, start: '00:26:08', end: '00:31:09', artist: 'Gboyega Adelaja', title: 'Colourful Environment', label: 'Soundway Records Ltd'},
            {pos: 8, start: '00:36:17', end: '00:38:49', artist: 'พรศักดิ์ ส่องแสง', title: 'ข่อยได้แต่บ่หลาย', label: 'SIANGSIAM'}
        ]
        // Add more episode tracklists as needed
    },

    // Helper function to create music platform links
    createMusicPlatformLinks(artist, title) {
        const encodedArtist = encodeURIComponent(artist);
        const encodedTitle = encodeURIComponent(title);
        const searchQuery = encodeURIComponent(`${artist} ${title}`);
        
        const bandcampUrl = `https://bandcamp.com/search?q=${searchQuery}`;
        const tidalUrl = `https://tidal.com/browse/search/tracks?q=${searchQuery}`;
        const appleMusicUrl = `https://music.apple.com/search?term=${searchQuery}`;
        
        return `
            <div class="music-links" style="margin-top: 4px; margin-left: 3px; display: inline-block;">
                <a href="${bandcampUrl}" target="_blank" rel="noopener" title="Search '${artist} - ${title}' on Bandcamp" 
                   style="display: inline-block; margin-right: 6px; text-decoration: none; opacity: 0.8; transition: opacity 0.2s;" 
                   onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">
                    <svg width="16" height="16" viewBox="0 0 24 24" style="vertical-align: middle;">
                        <path fill="#629aa0" d="M0 19h9l4-14H4L0 19zm15 0h9l-4-14h-9l4 14z"/>
                    </svg>
                </a>
                <a href="${tidalUrl}" target="_blank" rel="noopener" title="Find '${artist} - ${title}' on Tidal" 
                   style="display: inline-block; margin-right: 6px; text-decoration: none; opacity: 0.8; transition: opacity 0.2s;" 
                   onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">
                    <svg width="16" height="16" viewBox="0 0 24 24" style="vertical-align: middle;">
                        <path fill="#ffffff" d="M12 2L22 12L12 22L2 12L12 2Z"/>
                    </svg>
                </a>
                <a href="${appleMusicUrl}" target="_blank" rel="noopener" title="Search '${artist} - ${title}' on Apple Music" 
                   style="display: inline-block; margin-right: 6px; text-decoration: none; opacity: 0.8; transition: opacity 0.2s;" 
                   onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">
                    <svg width="16" height="16" viewBox="0 0 24 24" style="vertical-align: middle;">
                        <path fill="#fa233b" d="M18 3v12.5c0 2.5-2 4.5-4.5 4.5s-4.5-2-4.5-4.5 2-4.5 4.5-4.5c1 0 2 .3 2.8.8V7.2l-8 2v8.3c0 2.5-2 4.5-4.5 4.5S-1 20 -1 17.5s2-4.5 4.5-4.5c1 0 2 .3 2.8.8V3l14-4z"/>
                    </svg>
                </a>
            </div>
        `;
    },

    // Get local tracklist for episode
    getLocalTracklist(episodeTitle) {
        // Simple mapping for now - can be expanded
        for (const [key, tracklist] of Object.entries(this.localTracklists)) {
            if (episodeTitle.toLowerCase().includes('episode 1') || 
                episodeTitle.toLowerCase().includes('rq-1')) {
                return tracklist;
            }
        }
        return null;
    },

    // Show tracklist modal
    showTracklist(episodeKey, episodeTitle) {
        const modal = document.getElementById('tracklistModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.innerHTML = `🎵 TRACKLIST: ${episodeTitle} 🎵`;
        modalBody.innerHTML = `
            <div class="loading-tracklist">
                <span class="spinning-disc">💿</span>
                LOADING TRACKLIST FROM THE MATRIX...
            </div>
        `;
        
        modal.style.display = 'block';
        this.fetchTracklist(episodeKey, episodeTitle);
    },

    // Close modal
    closeModal() {
        const modal = document.getElementById('tracklistModal');
        modal.style.display = 'none';
    },

    // Fetch tracklist data
    async fetchTracklist(episodeKey, episodeTitle) {
        const modalBody = document.getElementById('modalBody');
        
        try {
            console.log('🎵 Fetching tracklist for:', episodeKey, 'Title:', episodeTitle);
            
            // Check for local tracklist first
            const localTracklist = this.getLocalTracklist(episodeTitle);
            if (localTracklist) {
                console.log('✅ Found local tracklist data!', localTracklist.length, 'tracks');
                this.displayLocalTracklist(localTracklist, modalBody, episodeTitle);
                return;
            }
            
            console.log('📡 No local tracklist found, trying Mixcloud API...');
            
            // Try Mixcloud API
            const mainResponse = await fetch(`https://api.mixcloud.com${episodeKey}`);
            if (!mainResponse.ok) {
                throw new Error(`Main API request failed: ${mainResponse.status}`);
            }
            
            const mainData = await mainResponse.json();
            console.log('📊 Main episode data:', mainData);
            
            let tracklistFound = false;
            
            // Method 1: Check sections in main response
            if (mainData.sections && mainData.sections.length > 0) {
                console.log('✅ Found sections in main data:', mainData.sections.length);
                this.displayTracklist(mainData.sections, modalBody);
                tracklistFound = true;
            }
            
            // Method 2: Try dedicated sections endpoint
            if (!tracklistFound) {
                try {
                    const sectionsUrl = `https://api.mixcloud.com${episodeKey}sections/`;
                    console.log('📡 Trying sections endpoint:', sectionsUrl);
                    
                    const sectionsResponse = await fetch(sectionsUrl);
                    if (sectionsResponse.ok) {
                        const sectionsData = await sectionsResponse.json();
                        console.log('📋 Sections endpoint response:', sectionsData);
                        
                        if (sectionsData.data && sectionsData.data.length > 0) {
                            console.log('✅ Found tracklist in sections endpoint:', sectionsData.data.length);
                            this.displayTracklist(sectionsData.data, modalBody);
                            tracklistFound = true;
                        }
                    } else {
                        console.log('❌ Sections endpoint failed:', sectionsResponse.status);
                    }
                } catch (sectionsError) {
                    console.log('❌ Sections endpoint error:', sectionsError);
                }
            }
            
            // Method 3: Parse from description
            if (!tracklistFound && mainData.description) {
                console.log('🔍 Checking description for tracklist...');
                const descriptionTracklist = this.parseTracklistFromDescription(mainData.description);
                if (descriptionTracklist.length > 0) {
                    console.log('✅ Found tracklist in description:', descriptionTracklist.length);
                    this.displayTracklistFromDescription(descriptionTracklist, modalBody);
                    tracklistFound = true;
                }
            }
            
            // Fallback: Show episode info
            if (!tracklistFound) {
                console.log('⚠️ No tracklist found, showing episode info');
                this.displayEpisodeInfo(mainData, modalBody);
            }
            
        } catch (error) {
            console.error('💥 Error fetching tracklist:', error);
            modalBody.innerHTML = `
                <div class="no-tracklist" style="color: #FF0000;">
                    <span class="spinning-disc">⚠️</span>
                    <p>ERROR LOADING TRACKLIST!</p>
                    <p style="font-size: 14px;">Network error: ${error.message}</p>
                    <p style="font-size: 12px; color: #666; margin-top: 10px;">
                        This could be due to CORS restrictions or API limits.
                    </p>
                    <div style="margin-top: 15px; padding: 10px; background: #333; border: 1px solid #555;">
                        <p style="color: #FFD700; font-size: 12px;">🔧 TROUBLESHOOTING:</p>
                        <p style="font-size: 11px; color: #AAA;">
                            • Check browser console for detailed errors<br>
                            • Try refreshing the page<br>
                            • Some mixes may not have detailed tracklists
                        </p>
                    </div>
                </div>
            `;
        }
    },

    // Display local tracklist
    displayLocalTracklist(tracks, modalBody, episodeTitle) {
        let tracklistHtml = '<ul class="tracklist">';
        tracklistHtml += '<li class="track-item" style="background: #333; color: #FFD700;"><strong>🎵 LOCAL TRACKLIST:</strong></li>';
        
        tracks.forEach((track) => {
            tracklistHtml += `
                <li class="track-item">
                    <span class="track-number">${track.pos}.</span>
                    <strong>${this.escapeHtml(track.title)}</strong>
                    <span class="track-artist">by ${this.escapeHtml(track.artist)}</span>
                    <small style="float: right; color: #888;">${track.start} - ${track.end}</small>
                    <br><small style="color: #0AF; font-size: 11px;">📀 ${this.escapeHtml(track.label)}</small>
                    ${this.createMusicPlatformLinks(track.artist, track.title)}
                </li>
            `;
        });
        
        tracklistHtml += '</ul>';
        tracklistHtml += '<div style="margin-top: 20px; text-align: center; color: #00FF00; font-size: 12px;">✅ PREMIUM TRACKLIST LOADED FROM LOCAL DATABASE</div>';
        tracklistHtml += '<div style="text-align: center; color: #FFD700; font-size: 11px; margin-top: 5px;">📊 Complete with timestamps and record labels!</div>';
        modalBody.innerHTML = tracklistHtml;
    },

    // Display API tracklist
    displayTracklist(sections, modalBody) {
        let tracklistHtml = '<ul class="tracklist">';
        tracklistHtml += '<li class="track-item" style="background: #333; color: #FFD700;"><strong>🎵 TRACKLIST:</strong></li>';
        
        sections.forEach((track, index) => {
            const trackNumber = index + 1;
            
            let artistName = 'Unknown Artist';
            let trackName = 'Unknown Track';
            
            if (track.track) {
                artistName = track.track.artist?.name || track.track.artist || artistName;
                trackName = track.track.name || trackName;
            } else {
                artistName = track.artist?.name || track.artist || artistName;
                trackName = track.name || track.track_name || trackName;
            }
            
            const startTime = this.formatTime(track.start_time);
            
            tracklistHtml += `
                <li class="track-item">
                    <span class="track-number">${trackNumber}.</span>
                    <strong>${this.escapeHtml(trackName)}</strong>
                    <span class="track-artist">by ${this.escapeHtml(artistName)}</span>
                    <small style="float: right; color: #888;">${startTime}</small>
                    ${this.createMusicPlatformLinks(artistName, trackName)}
                </li>
            `;
        });
        
        tracklistHtml += '</ul>';
        tracklistHtml += '<div style="margin-top: 20px; text-align: center; color: #00FF00; font-size: 12px;">✅ TRACKLIST LOADED FROM MIXCLOUD API</div>';
        modalBody.innerHTML = tracklistHtml;
    },

    // Parse tracklist from description
    parseTracklistFromDescription(description) {
        const tracks = [];
        const lines = description.split('\n');
        
        for (const line of lines) {
            const trackMatch = line.match(/^(\d+\.?\s*)?(.+?)\s*[-–—]\s*(.+)$/);
            if (trackMatch) {
                tracks.push({
                    artist: trackMatch[2].trim(),
                    name: trackMatch[3].trim()
                });
            }
        }
        
        return tracks;
    },

    // Display description tracklist
    displayTracklistFromDescription(tracks, modalBody) {
        let tracklistHtml = '<ul class="tracklist">';
        tracklistHtml += '<li class="track-item" style="background: #333; color: #FFD700;"><strong>🎵 TRACKLIST (FROM DESCRIPTION):</strong></li>';
        
        tracks.forEach((track, index) => {
            const trackNumber = index + 1;
            tracklistHtml += `
                <li class="track-item">
                    <span class="track-number">${trackNumber}.</span>
                    <strong>${this.escapeHtml(track.name)}</strong>
                    <span class="track-artist">by ${this.escapeHtml(track.artist)}</span>
                    ${this.createMusicPlatformLinks(track.artist, track.name)}
                </li>
            `;
        });
        
        tracklistHtml += '</ul>';
        tracklistHtml += '<div style="margin-top: 20px; text-align: center; color: #FFFF00; font-size: 12px;">📝 TRACKLIST PARSED FROM DESCRIPTION</div>';
        modalBody.innerHTML = tracklistHtml;
    },

    // Display episode info when no tracklist
    displayEpisodeInfo(data, modalBody) {
        let infoHtml = '<div class="no-tracklist">';
        infoHtml += '<span class="spinning-disc">📻</span>';
        infoHtml += '<p>NO DETAILED TRACKLIST AVAILABLE!</p>';
        infoHtml += '<p style="font-size: 14px; color: #888;">This mix doesn\'t have track-by-track breakdown.</p>';
        
        // Show episode info
        infoHtml += '<div style="margin-top: 20px; padding: 15px; background: #222; border: 1px solid #444;">';
        infoHtml += '<p style="color: #FFD700; font-weight: bold;">📊 MIX INFO:</p>';
        infoHtml += `<p style="font-size: 14px;">🎧 Play Count: ${data.play_count?.toLocaleString() || 'N/A'}</p>`;
        infoHtml += `<p style="font-size: 14px;">💕 Favorites: ${data.favorite_count?.toLocaleString() || 'N/A'}</p>`;
        infoHtml += `<p style="font-size: 14px;">💬 Comments: ${data.comment_count?.toLocaleString() || 'N/A'}</p>`;
        infoHtml += `<p style="font-size: 14px;">👂 Listeners: ${data.listener_count?.toLocaleString() || 'N/A'}</p>`;
        infoHtml += `<p style="font-size: 14px;">📅 Created: ${new Date(data.created_time).toLocaleDateString()}</p>`;
        infoHtml += `<p style="font-size: 14px;">⏱️ Duration: ${this.formatTime(data.audio_length)}</p>`;
        infoHtml += '</div>';
        
        // Show tags if available
        if (data.tags && data.tags.length > 0) {
            infoHtml += '<div style="margin-top: 15px; padding: 15px; background: #112; border: 1px solid #444;">';
            infoHtml += '<p style="color: #FFD700; font-weight: bold;">🏷️ TAGS:</p>';
            infoHtml += '<div style="display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px;">';
            data.tags.forEach(tag => {
                infoHtml += `<span style="background: #444; color: #00FF00; padding: 3px 8px; border-radius: 3px; font-size: 12px;">${this.escapeHtml(tag.name)}</span>`;
            });
            infoHtml += '</div>';
            infoHtml += '</div>';
        }
        
        // Show description if available
        if (data.description) {
            infoHtml += '<div style="margin-top: 15px; padding: 15px; background: #112; border: 1px solid #444;">';
            infoHtml += '<p style="color: #FFD700; font-weight: bold;">📝 DESCRIPTION:</p>';
            infoHtml += `<p style="font-size: 12px; color: #CCC; max-height: 100px; overflow-y: auto;">${this.escapeHtml(data.description.substring(0, 500))}${data.description.length > 500 ? '...' : ''}</p>`;
            infoHtml += '</div>';
        }
        
        infoHtml += '</div>';
        modalBody.innerHTML = infoHtml;
    },

    // Utility functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    formatTime(seconds) {
        if (!seconds) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
};

// Track timing functionality for main page
RadioQuebrada.TrackTiming = {
    // Fetch tracklist for main page display
    async fetchTracklistForMainPage(episodeKey, episodeTitle) {
        try {
            const response = await fetch(`https://api.mixcloud.com${episodeKey}`);
            const data = await response.json();
            
            if (data.sections && data.sections.length > 0) {
                RadioQuebrada.currentTracklist = data.sections.map((track, index) => ({
                    pos: index + 1,
                    title: track.track?.name || track.name || 'Unknown Track',
                    artist: track.track?.artist?.name || track.artist?.name || 'Unknown Artist',
                    start: RadioQuebrada.Tracklist.formatTime(track.start_time),
                    startTimeSeconds: track.start_time
                }));
                
                this.displayMainPageTracklist();
                this.startTrackTimer();
            }
        } catch (error) {
            console.log('Could not load API tracklist for main page:', error);
        }
    },

    // Display main page tracklist
    displayMainPageTracklist() {
        const tracklistContainer = document.getElementById('main-tracklist');
        if (!tracklistContainer || !RadioQuebrada.currentTracklist.length) return;
        
        const tracklistHtml = RadioQuebrada.currentTracklist.map((track, index) => `
            <div class="mini-track-item" data-track-index="${index}">
                <span class="mini-track-number">${track.pos}.</span>
                <span class="mini-track-title">${track.title}</span>
                <span class="mini-track-artist"> by ${track.artist}</span>
                <span class="mini-track-time">${track.start}</span>
            </div>
        `).join('');
        
        const miniTracklist = tracklistContainer.querySelector('.mini-tracklist');
        if (miniTracklist) {
            miniTracklist.innerHTML = tracklistHtml;
        }
    },

    // Start track timer
    startTrackTimer() {
        if (RadioQuebrada.trackTimer) {
            clearInterval(RadioQuebrada.trackTimer);
        }
        
        RadioQuebrada.trackStartTime = Date.now();
        RadioQuebrada.currentTrackIndex = 0;
        
        RadioQuebrada.trackTimer = setInterval(() => {
            this.updateCurrentTrack();
        }, 1000);
        
        this.updateCurrentTrack();
    },

    // Update current track display
    updateCurrentTrack() {
        if (!RadioQuebrada.currentTracklist || RadioQuebrada.currentTracklist.length === 0) return;
        
        const elapsedSeconds = Math.floor((Date.now() - RadioQuebrada.trackStartTime) / 1000);
        
        let newTrackIndex = 0;
        for (let i = 0; i < RadioQuebrada.currentTracklist.length; i++) {
            const track = RadioQuebrada.currentTracklist[i];
            if (track.startTimeSeconds && elapsedSeconds >= track.startTimeSeconds) {
                newTrackIndex = i;
            } else {
                break;
            }
        }
        
        if (newTrackIndex !== RadioQuebrada.currentTrackIndex) {
            RadioQuebrada.currentTrackIndex = newTrackIndex;
            this.updateTrackDisplay();
            this.updateTracklistHighlight();
        }
    },

    // Update track display
    updateTrackDisplay() {
        const track = RadioQuebrada.currentTracklist[RadioQuebrada.currentTrackIndex];
        if (!track) return;
        
        const trackTitle = document.getElementById('track-title');
        const trackArtist = document.getElementById('track-artist');
        const currentTrack = document.getElementById('current-track');
        
        if (trackTitle) trackTitle.textContent = track.title || track.name || 'Unknown Track';
        if (trackArtist) trackArtist.textContent = `by ${track.artist || 'Unknown Artist'}`;
        if (currentTrack) currentTrack.classList.add('visible');
    },

    // Update tracklist highlight
    updateTracklistHighlight() {
        document.querySelectorAll('.mini-track-item').forEach(item => {
            item.classList.remove('current-playing');
        });
        
        const currentItem = document.querySelector(`[data-track-index="${RadioQuebrada.currentTrackIndex}"]`);
        if (currentItem) {
            currentItem.classList.add('current-playing');
            currentItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
};

// Add methods to main RadioQuebrada object
RadioQuebrada.fetchTracklistForMainPage = RadioQuebrada.TrackTiming.fetchTracklistForMainPage.bind(RadioQuebrada.TrackTiming);

// Global functions for HTML onclick handlers
window.showTracklist = RadioQuebrada.Tracklist.showTracklist.bind(RadioQuebrada.Tracklist);
window.closeModal = RadioQuebrada.Tracklist.closeModal.bind(RadioQuebrada.Tracklist);
window.copyAddress = RadioQuebrada.Bitcoin.copyAddress.bind(RadioQuebrada.Bitcoin);
