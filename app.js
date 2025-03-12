// ==================== Global Variables ====================
let wss; // WebSocket connection for Chat Window
let nickname; // User's nickname
let userRoles = {}; // Tracks user roles in the chat
let modeQueue = []; // Queue for mode change messages
let isProcessing = false; // Flag for processing mode changes
let currentMessageElement = null; // Current message element for animations
let isUIReset = false; // Flag for UI reset on disconnect
let isUserInteracted = false; // Flag for user interaction
let reconnectAttempts = 0; // Reconnection attempts counter
const maxReconnectAttempts = 5; // Max reconnection attempts
const reconnectDelay = 5000; // Delay between reconnection attempts
const soundQueue = []; // Queue for sound playback
let isSoundPlaying = false; // Flag for sound playback

// ==================== Room List Functions ====================
function initializeRoomList() {
    const nicknameDisplay = document.getElementById('nicknameDisplay');
    const nicknameEdit = document.getElementById('nicknameEdit');
    const nicknameSave = document.getElementById('nicknameSave');
    const nicknameEditButton = document.getElementById('nicknameEditButton');

    // Function to generate a random nickname
    function generateRandomNickname() {
        const adjectives = ['Happy', 'Silly', 'Brave', 'Clever', 'Swift', 'Gentle', 'Witty', 'Calm', 'Bold', 'Lucky'];
        const nouns = ['Cat', 'Dog', 'Fox', 'Bear', 'Wolf', 'Lion', 'Tiger', 'Eagle', 'Hawk', 'Owl'];
        const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
        return `${randomAdjective}${randomNoun}${Math.floor(Math.random() * 100)}`;
    }

    // Load or generate nickname
    nickname = localStorage.getItem('nickname');
    if (!nickname) {
        nickname = generateRandomNickname();
        localStorage.setItem('nickname', nickname);
    }
    nicknameDisplay.textContent = `Nickname: ${nickname}`;

    // Toggle edit mode
    nicknameEditButton.addEventListener('click', () => {
        nicknameDisplay.style.display = 'none';
        nicknameEdit.style.display = 'inline-block';
        nicknameSave.style.display = 'inline-block';
        nicknameEditButton.style.display = 'none';
        nicknameEdit.value = nickname;
    });

    // Save new nickname
    nicknameSave.addEventListener('click', () => {
        const newNickname = nicknameEdit.value.trim();
        if (newNickname) {
            nickname = newNickname;
            localStorage.setItem('nickname', nickname);
            nicknameDisplay.textContent = `Nickname: ${nickname}`;
            nicknameDisplay.style.display = 'inline-block';
            nicknameEdit.style.display = 'none';
            nicknameSave.style.display = 'none';
            nicknameEditButton.style.display = 'inline-block';

            // Update the room list with the new nickname
            updateRoomList();
        }
    });

    // WebSocket connection for Room List
    const ws = new WebSocket('wss://chat.saintsrow.net/rm');
    let allChannels = {}; // Store all channels grouped by category

    ws.onopen = () => {
        console.log('✅ Connected to WebSocket server');
        ws.send(JSON.stringify({ type: 'requestLatest' })); // Request latest XML data
    };

    ws.onmessage = (event) => {
        console.log("Received:", event.data);
        const data = JSON.parse(event.data);
        if (data.type === 'xmlUpdate') {
            allChannels = groupChannelsByCategory(data.data); // Group channels by category
            updateRoomList(); // Update the table with the default category
        }
    };

    ws.onerror = (error) => console.error('❌ WebSocket Error:', error);

    ws.onclose = () => {
        console.log('❌ WebSocket connection closed. Attempting to reconnect...');
        setTimeout(() => {
            // Reconnect after 5 seconds
            const newWs = new WebSocket('wss://chat.saintsrow.net/rm');
            newWs.onopen = ws.onopen;
            newWs.onmessage = ws.onmessage;
            newWs.onerror = ws.onerror;
            newWs.onclose = ws.onclose;
            ws = newWs;
        }, 5000);
    };

    // Group channels by category
    function groupChannelsByCategory(data) {
        const categories = data.Channels.Category;
        const groupedChannels = {};

        categories.forEach(category => {
            const categoryName = category.$.Name;
            groupedChannels[categoryName] = category.Channel || [];
        });

        return groupedChannels;
    }

    // Update the room list based on the selected category
    function updateRoomList() {
        const roomListBody = document.getElementById('roomListBody');
        const paginationContainer = document.getElementById('paginationContainer'); // Pagination wrapper
        roomListBody.innerHTML = ''; // Clear existing rows

        const selectedCategory = document.getElementById('category').value;
        let channels = allChannels[selectedCategory] || [];

        // Sort channels by user count in descending order
        channels.sort((a, b) => {
            const userCountA = a.UserCount?.[0] ? parseInt(a.UserCount[0], 10) : 0;
            const userCountB = b.UserCount?.[0] ? parseInt(b.UserCount[0], 10) : 0;
            return userCountB - userCountA;
        });

        // Pagination logic
        const channelsPerPage = 6;
        const totalChannels = channels.length;
        const totalPages = Math.ceil(totalChannels / channelsPerPage);

        // Hide pagination if less than 6 channels
        paginationContainer.style.display = totalChannels > channelsPerPage ? 'block' : 'none';

        let currentPage = 1; // Default to page 1
        renderPage(currentPage, channels, channelsPerPage);

        createPagination(totalPages, channels, channelsPerPage);
    }

    function renderPage(page, channels, channelsPerPage) {
        const roomListBody = document.getElementById('roomListBody');
        roomListBody.innerHTML = ''; // Clear previous content

        const startIndex = (page - 1) * channelsPerPage;
        const endIndex = startIndex + channelsPerPage;
        const visibleChannels = channels.slice(startIndex, endIndex);

        visibleChannels.forEach(channel => {
            const userCount = channel.UserCount?.[0] ? parseInt(channel.UserCount[0], 10) : 0;
            let roomName = channel.$.Name || 'Unnamed Room';

            // Remove %# from room names
            roomName = roomName.replace(/^%#/, '');

            // Replace \b with a space in the room name
            roomName = roomName.replace(/\\b/g, ' ');

            // Replace \b with a space in the topic
            let topic = (channel.Topic?.[0] || 'No topic').replace(/\\b/g, ' ');

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${userCount}</td>
                <td><a href="chatroom.php?rm=${encodeURIComponent(roomName)}&nickname=${encodeURIComponent(nickname)}">${roomName}</a></td>
                <td>${topic}</td>
                <td>${channel.$.Language?.[0] || 'Unknown'}</td>
            `;
            roomListBody.appendChild(row);
            sessionStorage.setItem('hasInteracted', 'true');
        });
    }

    function createPagination(totalPages, channels, channelsPerPage) {
        const paginationContainer = document.getElementById('paginationContainer');
        paginationContainer.innerHTML = ''; // Clear previous pagination

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.innerText = i;
            pageButton.addEventListener('click', () => renderPage(i, channels, channelsPerPage));
            paginationContainer.appendChild(pageButton);
        }
    }

    // Add event listener to the category dropdown
    document.getElementById('category').addEventListener('change', updateRoomList);

    // Optional: Periodic refresh (if WebSocket does not push updates automatically)
    setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'requestLatest' })); // Request latest data
        }
    }, 30000); // Refresh every 30 seconds
}

// ==================== Chat Window Functions ====================
function initializeChatWindow() {
    // WebSocket connection and chat logic
    function connectWebSocket() {
        console.log('Attempting to connect WebSocket...');
        const chatBox = document.querySelector('.chat-box');
        const connectingMessage = document.createElement('p');
        connectingMessage.textContent = 'connecting to server...';
        connectingMessage.style.color = 'green';
        chatBox.appendChild(connectingMessage);

        wss = new WebSocket('wss://chat.saintsrow.net/ws/');

        wss.onopen = () => {
            console.log('✅ WebSocket connection established');
            reconnectAttempts = 0;
            isUIReset = false;

            const connectedMessage = document.createElement('p');
            connectedMessage.textContent = 'Connected!';
            connectedMessage.style.color = 'red';
            chatBox.appendChild(connectedMessage);

            if (category && channelTopic && ownerkey && language && profanityFilter) {
                const createMessage = {
                    type: 'CREATE',
                    nickname: nickname,
                    category: category,
                    channelName: channelName,
                    language: language,
                    profanityFilter: profanityFilter,
                    ownerkey: ownerkey
                };

                if (channelTopic) {
                    createMessage.channelTopic = channelTopic;
                }

                wss.send(JSON.stringify(createMessage));
            } else {
                wss.send(JSON.stringify({
                    type: 'JOIN',
                    nickname: nickname,
                    channelName: channelName
                }));
            }
        };

        wss.onmessage = (event) => {
            const data = JSON.parse(event.data);
            handleWebSocketMessage(data);
        };

        wss.onclose = (event) => {
            console.log('❌ WebSocket closed:', event.code, event.reason);
            resetChatUI();

            if (reconnectAttempts < maxReconnectAttempts) {
                reconnectAttempts++;
                console.log(`Reconnecting in ${reconnectDelay / 1000} seconds... (Attempt ${reconnectAttempts} of ${maxReconnectAttempts})`);
                setTimeout(connectWebSocket, reconnectDelay);
            } else {
                console.error('Max reconnection attempts reached. Please refresh the page or interact with the page to retry.');
            }
        };

        wss.onerror = (error) => {
            console.error('⚠️ WebSocket error:', error);
            wss.close();
        };
    }

    function handleWebSocketMessage(data) {
        if (data.type === 'MODE') {
            const ArrayRaws = data.raw.split(' ');
            const mode = ArrayRaws[1];
            const targetNick = ArrayRaws[2];
            const nick = data.nick;

            if (ArrayRaws[0].startsWith('%#')) {
                switch (mode) {
                    case '+q': userRoles[targetNick] = 'owner'; break;
                    case '+o': userRoles[targetNick] = 'host'; break;
                    case '+v': userRoles[targetNick] = 'participant'; break;
                    case '-v': userRoles[targetNick] = 'spectator'; break;
                    default: console.log(`Unhandled mode: ${mode}`);
                }

                const users = Object.keys(userRoles);
                populateNicklist(users);
                handleModeChange(nick, targetNick, mode);
                addModeChange(nick, targetNick, mode);
            }
        } else if (data.type === 'rawmsg') {
            console.log(data.data.trim());
        } else if (data.type === 'raw' && data.data && typeof data.data === 'string') {
            const ArrayRaws = data.data.trim().split(' ');
            if (ArrayRaws[1] === '001') {
                playSound('connected-sound');
            }
        } else if (data.type === 'message') {
            const messageWithEmoticons = replaceEmoticonsWithImages(data.message);
            const messageElement = document.createElement('p');
            messageElement.innerHTML = `<strong>${data.nick}:</strong> ${messageWithEmoticons}`;
            document.querySelector('.chat-box').appendChild(messageElement);
            const chatBox = document.querySelector('.chat-box');
            chatBox.scrollTop = chatBox.scrollHeight;
        } else if (data.type === 'NICKNAME-UPDATE') {
            nickname = data.nickname;
        } else if (data.type === 'TIME') {
            const tnickname = data.tnickname;
            const timeReply = data.data.replace(/^TIME\s+/, '');
            const [dayShort, monthShort, dayNum, timeRaw, year] = timeReply.split(' ');
            const dayMap = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' };
            const monthMap = { Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April', May: 'May', Jun: 'June', Jul: 'July', Aug: 'August', Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December' };
            const dayFull = dayMap[dayShort] || dayShort;
            const monthFull = monthMap[monthShort] || monthShort;
            const [hour, minute, second] = timeRaw.split(':').map(Number);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const formattedTime = `${hour % 12 || 12}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')} ${ampm}`;
            const finalTimeString = `${dayFull}, ${monthFull} ${dayNum}, ${year} at ${formattedTime}`;
            const systemMessage = document.createElement('p');
            systemMessage.textContent = `‣ ${tnickname}'s local time is ${finalTimeString}`;
            systemMessage.style.color = 'gray';
            systemMessage.classList.add('time-reply-animate');
            document.querySelector('.chat-box').appendChild(systemMessage);
            const chatBox = document.querySelector('.chat-box');
            chatBox.scrollTop = chatBox.scrollHeight;
        } else if (data.type === 'system') {
            if (data.event === 'join' && data.nickname !== nickname) {
                const systemMessage = document.createElement('p');
                systemMessage.textContent = `› ${data.nickname} has joined the channel`;
                systemMessage.style.color = 'gray';
                systemMessage.classList.add('glitchy-fade-in');
                document.querySelector('.chat-box').appendChild(systemMessage);
                const chatBox = document.querySelector('.chat-box');
                chatBox.scrollTop = chatBox.scrollHeight;
                playSound('join-sound');
                userRoles[data.nickname] = 'spectator';
            } else if (data.event === 'part' || data.event === 'quit') {
                delete userRoles[data.nickname];
                populateNicklist(Object.keys(userRoles));
                const systemMessage = document.createElement('p');
                if (data.event === 'part') {
                    systemMessage.textContent = `‹ ${data.nickname} has left the channel`;
                } else {
                    systemMessage.textContent = `‹ ${data.nickname} has quit`;
                }
                systemMessage.style.color = 'gray';
                document.querySelector('.chat-box').appendChild(systemMessage);
                const chatBox = document.querySelector('.chat-box');
                chatBox.scrollTop = chatBox.scrollHeight;
            }
        } else if (data.type === 'topic') {
            const topicElement = document.createElement('p');
            const prefix = document.createElement('span');
            prefix.textContent = "The chat’s topic is: ";
            prefix.style.color = '#289e92';
            const topicText = document.createElement('span');
            topicText.textContent = data.topic || 'No topic provided';
            topicText.style.color = 'black';
            topicText.style.fontStyle = 'italic';
            topicElement.appendChild(prefix);
            topicElement.appendChild(topicText);
            topicElement.style.padding = '5px';
            topicElement.style.margin = '5px 0';
            document.querySelector('.chat-box').appendChild(topicElement);
        } else if (data.type === 'nicklist') {
            Object.keys(userRoles).forEach(key => delete userRoles[key]);
            data.users.forEach(user => {
                if (user.startsWith(':')) {
                    user = user.substring(1);
                }
                if (user.startsWith('.')) {
                    userRoles[user] = 'owner';
                } else if (user.startsWith('@')) {
                    userRoles[user] = 'host';
                } else if (user.startsWith('+')) {
                    userRoles[user] = 'participant';
                } else {
                    userRoles[user] = 'spectator';
                }
            });
            populateNicklist(data.users);
            updateUserCount(data.userCount);
        }
    }

    function resetChatUI() {
        if (isUIReset) return;
        const nicklistUsers = document.getElementById('nicklist-users');
        nicklistUsers.innerHTML = '';
        const userCountElement = document.getElementById('user-count');
        userCountElement.textContent = '0 users online';
        const chatBox = document.querySelector('.chat-box');
        chatBox.innerHTML = '<p id="message1"></p><p id="message2" style="display: none;">Connected!</p>';
        const disconnectMessage = document.createElement('p');
        disconnectMessage.textContent = 'lost connection to server, reconnecting...';
        disconnectMessage.style.color = 'green';
        chatBox.appendChild(disconnectMessage);
        isUIReset = true;
    }

    function playSound(soundId) {
        console.log(`Attempting to play sound: ${soundId}`);
        if (isUserInteracted) {
            const sound = document.getElementById(soundId);
            if (sound) {
                console.log(`Sound element found: ${soundId}`);
                if (isSoundPlaying) {
                    console.log(`Sound is already playing. Adding ${soundId} to the queue.`);
                    soundQueue.push(soundId);
                } else {
                    isSoundPlaying = true;
                    sound.volume = 1.0;
                    sound.play().catch(error => {
                        console.error("Audio playback failed:", error);
                        isSoundPlaying = false;
                        playNextSound();
                    });

                    sound.addEventListener('ended', () => {
                        console.log(`Sound ${soundId} finished playing.`);
                        isSoundPlaying = false;
                        playNextSound();
                    });
                }
            } else {
                console.error(`Sound element not found: ${soundId}`);
            }
        } else {
            console.log("Sound not played: User has not interacted with the page yet.");
        }
    }

    function playNextSound() {
        if (soundQueue.length > 0) {
            const nextSoundId = soundQueue.shift();
            console.log(`Playing next sound in queue: ${nextSoundId}`);
            playSound(nextSoundId);
        }
    }

    document.addEventListener('click', () => {
        if (!isUserInteracted) {
            isUserInteracted = true;
            console.log('User has interacted with the page. Sound is now enabled.');
        }

        if (reconnectAttempts >= maxReconnectAttempts) {
            reconnectAttempts = 0;
            console.log('User interacted with the page. Resetting reconnection attempts.');
            connectWebSocket();
        }
    });

    document.addEventListener('keypress', () => {
        if (!isUserInteracted) {
            isUserInteracted = true;
            console.log('User has interacted with the page. Sound is now enabled.');
        }

        if (reconnectAttempts >= maxReconnectAttempts) {
            reconnectAttempts = 0;
            console.log('User interacted with the page. Resetting reconnection attempts.');
            connectWebSocket();
        }
    });

    function replaceEmoticonsWithImages(message) {
        const emoticonMap = {
            ":)": "111.png",
            ":(": "112.png",
            ":D": "113.png",
            ":P": "114.png",
            ":O": "115.png",
        };

        for (const [emoticon, imageFile] of Object.entries(emoticonMap)) {
            const imagePath = `MSN/${imageFile}`;
            const imgTag = `<img src="${imagePath}" alt="${emoticon}" style="width: 14px; height: 14px;">`;
            message = message.replace(new RegExp(escapeRegExp(emoticon), 'g'), imgTag);
        }
        return message;
    }

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function generateRandomNickname() {
        const adjectives = ['Cool', 'Funny', 'Smart', 'Brave', 'Quick', 'Witty', 'Happy', 'Lucky', 'Gentle', 'Wild'];
        const nouns = ['Cat', 'Dog', 'Fox', 'Bear', 'Wolf', 'Lion', 'Tiger', 'Eagle', 'Hawk', 'Owl'];
        const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
        return `${randomAdjective}${randomNoun}${Math.floor(Math.random() * 100)}`;
    }

    if (!nickname) {
        nickname = generateRandomNickname();
    }

    function partChannel() {
        if (wss && wss.readyState === WebSocket.OPEN) {
            wss.send(JSON.stringify({
                type: 'PART',
                channel: channelName
            }));
        }
    }

    window.addEventListener('beforeunload', (event) => {
        console.log('User is leaving the page. Parting channel...');
        partChannel();
    });

    window.addEventListener('pagehide', (event) => {
        console.log('User is leaving the page. Parting channel...');
        partChannel();
    });

    document.addEventListener('DOMContentLoaded', () => {
        const nicklistUsers = document.getElementById('nicklist-users');
        let isDragging = false;
        let startIndex = -1;
        let endIndex = -1;

        nicklistUsers.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'LI') {
                if (!e.ctrlKey) {
                    clearSelection();
                }

                isDragging = true;
                startIndex = Array.from(nicklistUsers.children).indexOf(e.target);
                endIndex = startIndex;
                toggleSelection(e.target);
                e.preventDefault();
            }
        });

        nicklistUsers.addEventListener('mousemove', (e) => {
            if (isDragging && e.target.tagName === 'LI') {
                endIndex = Array.from(nicklistUsers.children).indexOf(e.target);
                updateSelection();
                e.preventDefault();
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        nicklistUsers.addEventListener('click', (e) => {
            if (e.ctrlKey && e.target.tagName === 'LI') {
                toggleSelection(e.target);
                e.preventDefault();
            }
        });

        function toggleSelection(element) {
            if (element.tagName === 'LI') {
                element.classList.toggle('selected');
            }
        }

        function clearSelection() {
            const selectedUsers = nicklistUsers.querySelectorAll('.selected');
            selectedUsers.forEach(user => user.classList.remove('selected'));
        }

        function updateSelection() {
            const items = Array.from(nicklistUsers.children);
            const [min, max] = [Math.min(startIndex, endIndex), Math.max(startIndex, endIndex)];
            for (let i = min; i <= max; i++) {
                items[i].classList.add('selected');
            }
        }

        const nicklist = document.getElementById('nicklist');
        nicklist.addEventListener('click', (e) => {
            if (!nicklistUsers.contains(e.target)) {
                clearSelection();
            }
        });
    });

    document.addEventListener('DOMContentLoaded', () => {
        const nicklist = document.getElementById('nicklist');
        const nicklistUsers = document.getElementById('nicklist-users');

        nicklist.addEventListener('click', (e) => {
            if (!nicklistUsers.contains(e.target)) {
                clearSelection();
            }
        });

        nicklist.addEventListener('touchend', (e) => {
            if (!nicklistUsers.contains(e.target)) {
                clearSelection();
            }
        });

        function clearSelection() {
            const selectedUsers = nicklistUsers.querySelectorAll('.selected');
            selectedUsers.forEach(user => user.classList.remove('selected'));
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        const nicklistUsers = document.getElementById('nicklist-users');
        const contextMenu = document.getElementById('contextMenu');

        let touchTimer;
        let touchTarget;
        let touchStartX;
        let touchStartY;

        nicklistUsers.addEventListener('contextmenu', handleContextMenu);
        nicklistUsers.addEventListener('touchstart', handleTouchStart);
        nicklistUsers.addEventListener('touchmove', handleTouchMove);
        nicklistUsers.addEventListener('touchend', handleTouchEnd);

        function handleContextMenu(e) {
            if (e.target.tagName === 'LI') {
                e.preventDefault();
                showContextMenu(e);
            }
        }

        function handleTouchStart(e) {
            if (e.touches.length === 1) {
                touchTarget = e.target;
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                touchTimer = setTimeout(() => {
                    if (touchTarget.tagName === 'LI') {
                        showContextMenu(e.touches[0]);
                    }
                }, 500);
            }
        }

        function handleTouchMove(e) {
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                const deltaX = Math.abs(touch.clientX - touchStartX);
                const deltaY = Math.abs(touch.clientY - touchStartY);
                if (deltaX > 10 || deltaY > 10) {
                    clearTimeout(touchTimer);
                }
            }
        }

        function handleTouchEnd(e) {
            clearTimeout(touchTimer);
        }

        function showContextMenu(event) {
            const offsetX = 20;
            const menuWidth = contextMenu.offsetWidth;
            const menuHeight = contextMenu.offsetHeight;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let left = (event.pageX || event.touches[0].pageX);
            let top = (event.pageY || event.touches[0].pageY);

            if (left + menuWidth > viewportWidth) {
                left = viewportWidth - menuWidth - offsetX;
            }

            if (top + menuHeight > viewportHeight) {
                top = viewportHeight - menuHeight;
            }

            contextMenu.style.display = 'block';
            contextMenu.style.left = `${left}px`;
            contextMenu.style.top = `${top}px`;

            const selectedUsers = Array.from(nicklistUsers.querySelectorAll('.selected'));
            if (!selectedUsers.includes(event.target)) {
                selectedUsers.forEach(user => user.classList.remove('selected'));
                event.target.classList.add('selected');
            }
        }

        document.addEventListener('click', hideContextMenu);
        document.addEventListener('touchend', hideContextMenu);

        function hideContextMenu(e) {
            if (!contextMenu.contains(e.target)) {
                contextMenu.style.display = 'none';
            }
        }

        contextMenu.querySelectorAll('li[data-action]').forEach(item => {
            item.addEventListener('click', handleMenuAction);
            item.addEventListener('touchend', handleMenuAction);
        });

        function handleMenuAction(e) {
            const action = e.target.getAttribute('data-action');
            const selectedUsers = Array.from(nicklistUsers.querySelectorAll('.selected')).map(user => user.textContent);

            if (selectedUsers.length === 0) {
                console.error('No users selected');
                return;
            }

            let commandPrefix;
            let commandSuffix = '';
            switch (action) {
                case 'viewProfile':
                    console.log('View Profile:', selectedUsers);
                    return;
                case 'whisper':
                    const whisperMessage = prompt(`Whisper to ${selectedUsers.join(', ')}:`, '');
                    if (whisperMessage) {
                        commandPrefix = '//privmsg ';
                        commandSuffix = ` :${whisperMessage}`;
                    } else {
                        return;
                    }
                    break;
                case 'ignore':
                    console.log('Ignore:', selectedUsers);
                    return;
                case 'tagUser':
                    console.log('Tag User:', selectedUsers);
                    return;
                case 'localTime':
                    commandPrefix = '//privmsg ';
                    commandSuffix = ' :\x01TIME\x01';
                    break;
                case 'disruptiveBehavior':
                    commandPrefix = '//kick # ';
                    commandSuffix = ' :Disruptive Behavior';
                    break;
                case 'profanity':
                    commandPrefix = '//kick # ';
                    commandSuffix = ' :Profanity';
                    break;
                case 'scrolling':
                    commandPrefix = '//kick # ';
                    commandSuffix = ' :Scrolling';
                    break;
                case 'customKickBan':
                    const customReason = prompt(`Enter kick reason for ${selectedUsers.join(', ')}:`, '');
                    if (customReason) {
                        commandPrefix = '//kick # ';
                        commandSuffix = ` :${customReason}`;
                    } else {
                        return;
                    }
                    break;
                case 'host':
                    commandPrefix = '//mode # +o ';
                    break;
                case 'participant':
                    commandPrefix = '//mode # +v ';
                    break;
                case 'spectator':
                    commandPrefix = '//mode # -v ';
                    break;
                default:
                    console.log('Unknown action:', action);
                    return;
            }

            if (wss && wss.readyState === WebSocket.OPEN) {
                selectedUsers.forEach(user => {
                    const command = `${commandPrefix}${user}${commandSuffix}`;
                    wss.send(JSON.stringify({
                        type: 'CMDRAW',
                        command: command
                    }));
                });
            }

            contextMenu.style.display = 'none';
        }
    });
}

// ==================== Create Channel Functions ====================
function initializeCreateChannel() {
    // Generate a random ownerkey
    function generateOwnerkey() {
        const length = Math.floor(Math.random() * 4) + 6;
        const min = Math.pow(10, length - 1);
        const max = Math.pow(10, length) - 1;
        return Math.floor(min + Math.random() * (max - min + 1));
    }

    // Set the ownerkey value when the page loads
    document.addEventListener('DOMContentLoaded', function () {
        const ownerkeyInput = document.getElementById('ownerkey');
        ownerkeyInput.value = generateOwnerkey();
    });

    // Copy ownerkey to clipboard
    const ownerkeyInput = document.getElementById('ownerkey');
    const tooltip = document.getElementById('ownerkey-tooltip');

    ownerkeyInput.addEventListener('mouseup', function () {
        const selectedText = window.getSelection().toString();
        if (selectedText) {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(selectedText)
                    .then(() => {
                        tooltip.classList.add('show');
                        setTimeout(() => {
                            tooltip.classList.remove('show');
                        }, 2000);
                    })
                    .catch((err) => {
                        console.error('Failed to copy text:', err);
                        alert('Failed to copy Ownerkey to clipboard.');
                    });
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = selectedText;
                document.body.appendChild(textarea);
                textarea.select();
                try {
                    document.execCommand('copy');
                    tooltip.classList.add('show');
                    setTimeout(() => {
                        tooltip.classList.remove('show');
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy text (fallback):', err);
                    alert('Failed to copy Ownerkey to clipboard.');
                }
                document.body.removeChild(textarea);
            }
        }
    });

    // Generate a random nickname
    function generateRandomNickname() {
        const adjectives = ['Cool', 'Funny', 'Smart', 'Brave', 'Quick', 'Witty', 'Happy', 'Lucky', 'Gentle', 'Wild'];
        const nouns = ['Cat', 'Dog', 'Fox', 'Bear', 'Wolf', 'Lion', 'Tiger', 'Eagle', 'Hawk', 'Owl'];
        const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
        return `${randomAdjective}${randomNoun}${Math.floor(Math.random() * 100)}`;
    }

    // Set the nickname value when the page loads
    document.addEventListener('DOMContentLoaded', function () {
        const nicknameInput = document.getElementById('nickname');
        nicknameInput.value = generateRandomNickname();
    });

    // Handle form submission
    document.getElementById('channel-form').addEventListener('submit', function (event) {
        sessionStorage.setItem('hasInteracted', 'true');
    });
}

// ==================== Initialize All Sections ====================
document.addEventListener('DOMContentLoaded', function () {
    initializeRoomList();
    initializeChatWindow();
    initializeCreateChannel();
});