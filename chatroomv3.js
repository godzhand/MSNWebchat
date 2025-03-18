    // Global variables
    const channels = {}; // Store WebSocket connections and states for each channel
    let currentChannel = null; // Track the currently active channel
    const userRoles = {}; // Global object to track user roles per channel
    const previousRoles = {}; // Stores the previous role of each user per channel
    const modeQueue = {}; // Queue to hold mode change messages per channel
    const isProcessing = {}; // Flag to track if a message is being processed per channel
    const currentMessageElement = {}; // Track the current message element per channel
    const isParticipant = {}; // Track participant status per channel
    let nickname = localStorage.getItem('nickname') || generateRandomNickname(); // Load or generate nickname
    let isUIReset = false; // Flag to track if the UI has been reset on disconnect
    let isUserInteracted = false; // Flag to track if the user has interacted with the page
    let reconnectAttempts = 0; // Counter for reconnection attempts
    const maxReconnectAttempts = 5; // Maximum number of reconnection attempts
    const reconnectDelay = 5000; // Delay between reconnection attempts in milliseconds
    let isSoundPlaying = false; // Flag to track if a sound is currently playing
    const soundQueue = []; // Queue to store sounds that need to be played after the current sound finishes
    let HasBeenKicked = false;

    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const hostKeywordModal = document.getElementById('host-keyword-modal');
    const closeModal = document.querySelector('.close-modal');
    const cancelHostKeyword = document.getElementById('cancel-host-keyword');
    const submitHostKeyword = document.getElementById('submit-host-keyword');
    const hostKeywordInput = document.getElementById('host-keyword-input');
    function openSection(sectionName, elmnt) {
        const tabcontent = document.getElementsByClassName("tabcontent");
        for (let i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }

        const tablinks = document.getElementsByClassName("tablink");
        for (let i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }

        const sectionElement = document.getElementById(sectionName);
        if (sectionElement) {
            sectionElement.style.display = "contents";
        }

        if (elmnt) {
            elmnt.className += " active";
        }

        if (sectionName !== "RoomList") {
            const chatWindow = document.getElementById('ChatWindow');
            if (chatWindow) {
                chatWindow.style.display = "block"; // Make the chat window visible
            } else {
                console.error('ChatWindow element not found');
            }
            if (!channels[currentChannel] || channels[currentChannel].readyState !== WebSocket.OPEN) {
                // currentChannel = "The Lobby";
//                connectWebSocket(currentChannel);
            }
        }
    }
  
    function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            if (message.startsWith('/')) {
                if (message === '/pass') {
                    hostKeywordModal.style.display = 'block';
                } else {
                    const commands = message.split(' | ');
                    commands.forEach(command => {
                        if (command.startsWith('//')) {
                            let channelNameX = `%#${currentChannel.replace(/\s+/g, '\\b')}`;
                            const rawCommand = command.replace('//', '/').replace(/#/g, `${channelNameX}`);
                            sendRawCommand(currentChannel, rawCommand);
                        } else if (command.startsWith('/')) {
                            sendRawCommand(currentChannel, command);
                        } else {
                            sendNormalMessage(currentChannel, command);
                        }
                    });
                }
            } else {
                sendNormalMessage(currentChannel, message);
            }

            chatInput.value = '';
        }
    }

    function sendNormalMessage(channel, message) {
        const messageWithEmoticons = replaceEmoticonsWithImages(message);
        const messageWithEmoticonsAndGifs = replaceEmoticonsWithgifs(messageWithEmoticons);
        const messageElement = document.createElement('p');
        messageElement.innerHTML = `<strong style="color: darkblue;">${nickname}:</strong> ${messageWithEmoticonsAndGifs}`;
        document.querySelector('.chat-box').appendChild(messageElement);
        const chatBox = document.querySelector('.chat-box');
        chatBox.scrollTop = chatBox.scrollHeight;
        if (channels[channel] && channels[channel].readyState === WebSocket.OPEN) {
            channels[channel].send(JSON.stringify({
                type: 'MESSAGE',
                content: message
            }));
        }
    }

    sendButton.addEventListener('click', () => {
        sendMessage();
    });

    function handleRejoin(channel) {
        sendButton.innerHTML = originalSendButtonText;
        sendRawCommand(channel, "//JOIN #");
        sendButton.removeEventListener('click', handleRejoin);
        sendButton.addEventListener('click', sendMessage);
    }

    const originalSendButtonText = sendButton.innerHTML;
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });



    
    function replaceEmoticonsWithImages(message) {
        for (const [emoticon, imageFile] of Object.entries(emoticonMap)) {
            const imagePath = `MSN/${imageFile}`;
            const imgTag = `<img src="${imagePath}" alt="${emoticon}" style="width: 14px; height: 14px;">`;
            message = message.replace(new RegExp(escapeRegExp(emoticon), 'g'), imgTag);
        }
        return message;
    }

    function replaceEmoticonsWithgifs(message) {
        for (const [emoticong, imageFileg] of Object.entries(emoticonMapg)) {
            const imagePathg = `MSN/${imageFileg}`;
            const imgTagg = `<img src="${imagePathg}" alt="${emoticong}" style="width: 65px; height: 48px;">`;
            message = message.replace(new RegExp(escapeRegExp(emoticong), 'g'), imgTagg);
        }
        return message;
    }

    function sendRawCommand(command) {
        if (wss && wss.readyState === WebSocket.OPEN) {
            wss.send(JSON.stringify({
                type: 'CMDRAW',
                command: command
            }));
        }
    }
// Emoticon mappings
const emoticonMap = {
    ":)": "111.png",
    ":(": "112.png",
    ":|": "113.png",
    ":beer:": "114.png",
    ":love:": "115.png"
};

const emoticonMapg = {
    ":matrix:": "matrix.gif",
    ":c4:": "c4.gif",
    ":thug:": "thug.gif",
    ":pot:": "pot.gif"
};

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
    closeModal.addEventListener('click', () => {
        hostKeywordModal.style.display = 'none';
    });

    cancelHostKeyword.addEventListener('click', () => {
        hostKeywordModal.style.display = 'none';
    });

    submitHostKeyword.addEventListener('click', () => {
        const hostKeyword = hostKeywordInput.value.trim();
        if (hostKeyword) {
            if (channels[currentChannel] && channels[currentChannel].readyState === WebSocket.OPEN) {
                channels[currentChannel].send(JSON.stringify({
                    type: 'HOST_KEYWORD',
                    content: hostKeyword
                }));
            }
            hostKeywordInput.value = '';
            hostKeywordModal.style.display = 'none';
        }
    });

    window.addEventListener('click', (event) => {
        if (event.target === hostKeywordModal) {
            hostKeywordModal.style.display = 'none';
        }
    });

    function sendRawCommand(channel, command) {
        if (channels[channel] && channels[channel].readyState === WebSocket.OPEN) {
            channels[channel].send(JSON.stringify({
                type: 'CMDRAW',
                command: command
            }));
        }
    }



function toggleNicklist() {
    const nicklist = document.getElementById('nicklist');
    nicklist.classList.toggle('open');
}

function applyTransporterEffect(nickname) {
    const nicklistUsers = document.getElementById('nicklist-users');
    const userElement = Array.from(nicklistUsers.children).find(li => li.textContent === nickname);

    if (userElement) {
        setTimeout(() => {
            populateNicklist(currentChannel, Object.keys(userRoles[currentChannel]));
        }, 0);
    }
}


document.addEventListener('DOMContentLoaded', () => {



    // Emoticon mappings
    const emoticonMap = {
        ":)": "111.png",
        ":(": "112.png",
        ":|": "113.png",
        ":beer:": "114.png",
        ":love:": "115.png"
    };

    const emoticonMapg = {
        ":matrix:": "matrix.gif",
        ":c4:": "c4.gif",
        ":thug:": "thug.gif",
        ":pot:": "pot.gif"
    };

    // WebSocket connection
    function connectWebSocket(channel) {
        console.log(`Attempting to connect WebSocket for channel ${channel}...`);

        const chatBox = document.querySelector('.chat-box');
        const connectingMessage = document.createElement('p');
        connectingMessage.textContent = `connecting to server...`;
        connectingMessage.style.color = 'green';
        chatBox.appendChild(connectingMessage);

        channels[channel] = new WebSocket('wss://chat.saintsrow.net/ws/');

        channels[channel].onopen = () => {
            console.log(`✅ WebSocket connection established for channel ${channel}`);
            reconnectAttempts = 0;
            isUIReset = false;

            const connectedMessage = document.createElement('p');
            connectedMessage.textContent = `Connected!`;
            connectedMessage.style.color = 'red';
            chatBox.appendChild(connectedMessage);

            if (category && channelTopic && ownerkey && language && profanityFilter) {
                const createMessage = {
                    type: 'CREATE',
                    nickname: nickname,
                    category: category,
                    channelName: channel,
                    language: language,
                    profanityFilter: profanityFilter,
                    ownerkey: ownerkey
                };

                if (channelTopic) {
                    createMessage.channelTopic = channelTopic;
                }

                channels[channel].send(JSON.stringify(createMessage));
            } else {
                channels[channel].send(JSON.stringify({
                    type: 'JOIN',
                    nickname: nickname,
                    channelName: channel
                }));
            }
        };

        channels[channel].onmessage = (event) => {
            const data = JSON.parse(event.data);
            handleWebSocketMessage(channel, data);
        };

        channels[channel].onclose = (event) => {
            console.log(`❌ WebSocket closed for channel ${channel}:`, event.code, event.reason);
            resetChatUI(channel);

            if (reconnectAttempts < maxReconnectAttempts) {
                reconnectAttempts++;
                console.log(`Reconnecting to ${channel} in ${reconnectDelay / 1000} seconds... (Attempt ${reconnectAttempts} of ${maxReconnectAttempts})`);
                setTimeout(() => connectWebSocket(channel), reconnectDelay);
            } else {
                console.error(`Max reconnection attempts reached for channel ${channel}. Please refresh the page or interact with the page to retry.`);
            }
        };

        channels[channel].onerror = (error) => {
            console.error(`⚠️ WebSocket error for channel ${channel}:`, error);
            channels[channel].close();
        };
    }
    function addModeChange(nick, targetNick, mode) {
        modeQueue.push({ nick, targetNick, mode }); // Add the mode change to the queue
        if (!isProcessing) {
            processQueue(); // Start processing the queue if not already processing
        }
    }
    function handleModeChange(nick, targetNick, mode) {
        switch (mode) {
            case '+q': // Owner
                // Store the current role before promoting to owner
                previousRoles[targetNick] = userRoles[targetNick] || 'member';
                userRoles[targetNick] = 'owner';
              //  isParticipant[targetNick] = false; // Owner is not a participant
                break;
            case '+o': // Host
                // Store the current role before promoting to host
                previousRoles[targetNick] = userRoles[targetNick] || 'member';
                userRoles[targetNick] = 'host';
             //   isParticipant[targetNick] = false; // Host is not a participant
                break;
            case '+v': // Participant
                // Only update role if the user is not already an owner or host
                if (userRoles[targetNick] !== 'owner' && userRoles[targetNick] !== 'host') {
                    userRoles[targetNick] = 'participant';
                    isParticipant[targetNick] = true; // User is a participant
                }
                break;
            case '-v': // Spectator
                // Only update role if the user is not already an owner or host
                if (userRoles[targetNick] !== 'owner' && userRoles[targetNick] !== 'host') {
                    userRoles[targetNick] = 'member';
                }
                isParticipant[targetNick] = false; // User is not a participant
                break;
            case '-o': // Remove host
                // Revert to the previous role if available, otherwise set to member
            //    userRoles[targetNick] = 'member';
            userRoles[targetNick] = 'member';
                if (isParticipant[targetNick] === true) {
                userRoles[targetNick] = 'participant'; // Restore participant status
                }
                delete previousRoles[targetNick]; // Clear the stored previous role
                break;
            case '-q': // Remove owner
                // Revert to the previous role if available, otherwise set to member
                userRoles[targetNick] = 'member';
                if (isParticipant[targetNick] === true) {
                userRoles[targetNick] = 'participant'; // Restore participant status
                }      
                    delete previousRoles[targetNick]; // Clear the stored previous role
                break;
            default:
                console.log(`Unhandled mode: ${mode}`);
        }
    
        // Refresh the nicklist with updated roles
        populateNicklist(Object.keys(userRoles));
        console.log(`Mode change: ${mode} for ${targetNick}. Updated userRoles:`, userRoles);
        console.log(`Updated isParticipant:`, isParticipant);
        console.log(`Updated previousRoles:`, previousRoles);
    }
    function handleWebSocketMessage(channel, data) {
        switch (data.type) {
            case 'MODE':
                handleModeChange(channel, data.nick, data.targetNick, data.mode);
                break;
            case 'rawmsg':
                console.log(data.data.trim());
                break;
            case 'raw':
                if (data.data && typeof data.data === 'string') {
                    const ArrayRaws = data.data.trim().split(' ');
                    if (ArrayRaws[1] === '001') {
                        playSound('connected-sound');
                    }
                }
                break;
            case 'message':
                handleChatMessage(channel, data);
                break;
            case 'NICKNAME-UPDATE':
                nickname = data.nickname;
                break;
            case 'TIME':
                handleTimeMessage(channel, data);
                break;
            case 'system':
                handleSystemMessage(channel, data);
                break;
            case 'topic':
                handleTopicChange(channel, data);
                break;
            case 'nicklist-count':
                updateUserCount(channel, data.userCount);
                break;
            case 'nicklist':
                handleNicklistUpdate(channel, data.users);
                break;
            default:
                console.log('Unhandled message type:', data.type);
        }
    }

    function handleChatMessage(channel, data) {
        const messageWithEmoticons = replaceEmoticonsWithImages(data.message);
        const messageWithEmoticonsAndGifs = replaceEmoticonsWithgifs(messageWithEmoticons);

        const messageElement = document.createElement('p');
        messageElement.innerHTML = `<strong>${data.nick}:</strong> ${messageWithEmoticonsAndGifs}`;
        document.querySelector('.chat-box').appendChild(messageElement);

        const chatBox = document.querySelector('.chat-box');
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function handleTimeMessage(channel, data) {
        const timeReply = data.data.replace(/^TIME\s+/, '');
        const [dayShort, monthShort, dayNum, timeRaw, year] = timeReply.split(' ');

        const dayMap = {
            Mon: 'Monday',
            Tue: 'Tuesday',
            Wed: 'Wednesday',
            Thu: 'Thursday',
            Fri: 'Friday',
            Sat: 'Saturday',
            Sun: 'Sunday'
        };

        const monthMap = {
            Jan: 'January',
            Feb: 'February',
            Mar: 'March',
            Apr: 'April',
            May: 'May',
            Jun: 'June',
            Jul: 'July',
            Aug: 'August',
            Sep: 'September',
            Oct: 'October',
            Nov: 'November',
            Dec: 'December'
        };

        const dayFull = dayMap[dayShort] || dayShort;
        const monthFull = monthMap[monthShort] || monthShort;
        const [hour, minute, second] = timeRaw.split(':').map(Number);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedTime = `${hour % 12 || 12}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')} ${ampm}`;
        const finalTimeString = `${dayFull}, ${monthFull} ${dayNum}, ${year} at ${formattedTime}`;

        const systemMessage = document.createElement('p');
        systemMessage.textContent = `‣ ${data.tnickname}'s local time is ${finalTimeString}`;
        systemMessage.style.color = 'gray';
        systemMessage.classList.add('time-reply-animate');

        document.querySelector('.chat-box').appendChild(systemMessage);
        const chatBox = document.querySelector('.chat-box');
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function handleSystemMessage(channel, data) {
        if (data.event === 'join' || data.event === 'part' || data.event === 'quit' || data.event === 'kick') {
            updateUserCount(channel, data.userCount);
        }

        if (data.event === 'join' && data.nickname !== nickname) {
            userRoles[channel][data.nickname] = 'member';
            isParticipant[channel][data.nickname] = false;
            populateNicklist(channel, Object.keys(userRoles[channel]));

            const systemMessage = document.createElement('p');
            systemMessage.textContent = `› ${data.nickname} has joined the channel`;
            systemMessage.style.color = 'gray';
            systemMessage.classList.add('glitchy-fade-in');
            document.querySelector('.chat-box').appendChild(systemMessage);

            const chatBox = document.querySelector('.chat-box');
            chatBox.scrollTop = chatBox.scrollHeight;
            playSound('join-sound');
        }

        if (data.event === 'part' || data.event === 'quit') {
            delete userRoles[channel][data.nickname];
            delete isParticipant[channel][data.nickname];
            populateNicklist(channel, Object.keys(userRoles[channel]));

            const systemMessage = document.createElement('p');
            systemMessage.textContent = data.event === 'part'
                ? `‹ ${data.nickname} has left the channel`
                : `‹ ${data.message}`;
            systemMessage.style.color = 'gray';
            document.querySelector('.chat-box').appendChild(systemMessage);

            const chatBox = document.querySelector('.chat-box');
            chatBox.scrollTop = chatBox.scrollHeight;
        }

        if (data.event === 'kick') {
            delete userRoles[channel][data.knickname];
            delete isParticipant[channel][data.knickname];
            populateNicklist(channel, Object.keys(userRoles[channel]));

            const systemMessage = document.createElement('p');
            systemMessage.textContent = data.message;
            systemMessage.style.fontWeight = 'bold';
            systemMessage.style.color = '#FF0000';
            document.querySelector('.chat-box').appendChild(systemMessage);

            const chatBox = document.querySelector('.chat-box');
            chatBox.scrollTop = chatBox.scrollHeight;

            if (data.knickname === nickname) {
                playSound('kick-sound2');
                const sendbut = document.querySelector('#send-button');
                sendbut.innerHTML = "rejoin";
                Object.keys(userRoles[channel]).forEach(key => delete userRoles[channel][key]);
                updateUserCount(channel, 0);
                const nicklistUsers = document.getElementById('nicklist-users');
                nicklistUsers.innerHTML = '';
                sendbut.removeEventListener('click', sendMessage);
                sendbut.addEventListener('click', () => handleRejoin(channel));
            } else {
                playSound('kick-sound');
            }
        }
    }

    function handleTopicChange(channel, data) {
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
        const chatBox = document.querySelector('.chat-box');
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function handleNicklistUpdate(channel, users) {
        // Ensure userRoles[channel] is initialized as an object
        if (!userRoles[channel]) {
            userRoles[channel] = {};
        }
    
        // Clear existing roles for the channel
        Object.keys(userRoles[channel]).forEach(key => delete userRoles[channel][key]);
    
        // Update roles based on the new user list
        users.forEach(user => {
            if (user.startsWith(':')) {
                user = user.substring(1);
            }
    
            if (user.startsWith('.')) {
                user = user.substring(1);
                userRoles[channel][user] = 'owner';
            } else if (user.startsWith('@')) {
                user = user.substring(1);
                userRoles[channel][user] = 'host';
            } else if (user.startsWith('+')) {
                user = user.substring(1);
                userRoles[channel][user] = 'participant';
            } else {
                userRoles[channel][user] = 'member';
            }
        });
    
        populateNicklist(channel, users);
        updateUserCount(channel, users.length);
    }

    function populateNicklist(channel, users) {
        const nicklistUsers = document.getElementById('nicklist-users');
        const fragment = document.createDocumentFragment();
        nicklistUsers.innerHTML = '';

        const groups = {
            owner: [],
            host: [],
            participant: [],
            member: [],
            spectator: []
        };

        users.forEach(user => {
            let displayName = user;
            let role = 'member';

            if (user.startsWith('.')) {
                role = 'owner';
                displayName = user.substring(1);
            } else if (user.startsWith('@')) {
                role = 'host';
                displayName = user.substring(1);
            } else if (user.startsWith('+')) {
                role = 'participant';
                displayName = user.substring(1);
            } else {
                role = userRoles[channel][user] || 'member';
            }

            if (!groups[role].includes(displayName)) {
                groups[role].push(displayName);
            }

            userRoles[channel][displayName] = role;
        });

        Object.values(groups).forEach(group => group.sort((a, b) => a.localeCompare(b)));

        const sortedUsers = [
            ...groups.owner,
            ...groups.host,
            ...groups.participant,
            ...groups.member,
            ...groups.spectator
        ];

        sortedUsers.forEach(user => {
            const li = document.createElement('li');
            li.textContent = user;

            if (groups.owner.includes(user)) {
                li.classList.add('owner');
            } else if (groups.host.includes(user)) {
                li.classList.add('host');
            } else if (groups.participant.includes(user)) {
                li.classList.add('participant');
            } else if (groups.member.includes(user)) {
                li.classList.add('member');
            } else if (groups.spectator.includes(user)) {
                li.classList.add('spectator');
            }

            fragment.appendChild(li);
        });

        nicklistUsers.innerHTML = '';
        nicklistUsers.appendChild(fragment);
        console.log('Nicklist updated with roles:', groups);
        console.log('Current userRoles:', userRoles[channel]);
    }

    function updateUserCount(channel, count) {
        const userCountElement = document.getElementById('user-count');
        const userCountMobileElement = document.getElementById('user-count-mobile');

        if (userCountElement) {
            userCountElement.textContent = count === 1 ? `${count} user online` : `${count} users online`;
        }

        if (userCountMobileElement) {
            userCountMobileElement.textContent = count === 1 ? `${count} user online` : `${count} users online`;
        }
    }


    function resetChatUI(channel) {
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

    function playSoundX(soundId) {
        console.log(`Attempting to play sound: ${soundId}`);
        if (isUserInteracted) {
            const sound = document.getElementById(soundId);
            if (sound) {
                console.log(`Sound element found: ${soundId}`);

                if (isSoundPlaying && currentSound) {
                    console.log(`Stopping current sound: ${currentSound.id}`);
                    currentSound.pause();
                    currentSound.currentTime = 0;
                }

                currentSound = sound;

                isSoundPlaying = true;
                sound.volume = 1.0;
                sound.play().catch(error => {
                    console.error("Audio playback failed:", error);
                    isSoundPlaying = false;
                });

                sound.addEventListener('ended', () => {
                    console.log(`Sound ${soundId} finished playing.`);
                    isSoundPlaying = false;
                    playNextSoundX();
                });
            } else {
                console.error(`Sound element not found: ${soundId}`);
            }
        } else {
            console.log("Sound not played: User has not interacted with the page yet.");
        }
    }

    function playNextSoundX() {
        if (soundQueue.length > 0) {
            const nextSoundId = soundQueue.shift();
            console.log(`Playing next sound in queue: ${nextSoundId}`);
            playSoundX(nextSoundId);
        }
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
            connectWebSocket(currentChannel);
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
            connectWebSocket(currentChannel);
        }
    });




    function partChannel(channel) {
        if (channels[channel] && channels[channel].readyState === WebSocket.OPEN) {
            channels[channel].send(JSON.stringify({
                type: 'PART',
                channel: channel
            }));
        }
    }

    window.addEventListener('beforeunload', (event) => {
        console.log('User is leaving the page. Parting channel...');
        partChannel(currentChannel);
    });

    window.addEventListener('pagehide', (event) => {
        console.log('User is leaving the page. Parting channel...');
        partChannel(currentChannel);
    });

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

        if (channels[currentChannel] && channels[currentChannel].readyState === WebSocket.OPEN) {
            selectedUsers.forEach(user => {
                const command = `${commandPrefix}${user}${commandSuffix}`;
                channels[currentChannel].send(JSON.stringify({
                    type: 'CMDRAW',
                    command: command
                }));
            });
        }

        contextMenu.style.display = 'none';
    }


    //document.getElementById('channel-name').textContent = channelName;
    if (channelName) {
        switchChannel(channelName);
        addChannelToSwitcher(channelName, this);
        document.querySelector('select').value = channelName;
    }

    const channelSwitcher = document.getElementById('channel-switcher');
    if (channelSwitcher) {
        channelSwitcher.addEventListener('change', function () {
            const selectedSection = this.value;
            openSection(selectedSection, this);
        });
    }

    const nicknameDisplay = document.getElementById('nicknameDisplay');
    const nicknameEdit = document.getElementById('nicknameEdit');
    const nicknameSave = document.getElementById('nicknameSave');
    const nicknameEditButton = document.getElementById('nicknameEditButton');

    nicknameDisplay.textContent = `Nickname: ${nickname}`;

    nicknameEditButton.addEventListener('click', () => {
        nicknameDisplay.style.display = 'none';
        nicknameEdit.style.display = 'inline-block';
        nicknameSave.style.display = 'inline-block';
        nicknameEditButton.style.display = 'none';
        nicknameEdit.value = nickname;
    });

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
            updateRoomList();
        }
    });

    let ws = new WebSocket('wss://chat.saintsrow.net/rm');
    let allChannels = {};

    ws.onopen = () => {
      //  console.log('✅ Connected to WebSocket server');
        ws.send(JSON.stringify({ type: 'requestLatest' }));
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'xmlUpdate') {
            allChannels = groupChannelsByCategory(data.data);
            updateRoomList();
        }
    };

    ws.onerror = (error) => console.error('❌ WebSocket Error:', error);

    ws.onclose = () => {
        console.log('❌ WebSocket connection closed. Attempting to reconnect...');
        setTimeout(() => {
            const newWs = new WebSocket('wss://chat.saintsrow.net/rm');
            newWs.onopen = ws.onopen;
            newWs.onmessage = ws.onmessage;
            newWs.onerror = ws.onerror;
            newWs.onclose = ws.onclose;
            ws = newWs;
        }, 5000);
    };

    function groupChannelsByCategory(data) {
        const categories = data.Channels.Category;
        const groupedChannels = {};

        categories.forEach(category => {
            const categoryName = category.$.Name;
            groupedChannels[categoryName] = category.Channel || [];
        });

        return groupedChannels;
    }

    function updateRoomList() {
        const roomListBody = document.getElementById('roomListBody');
        const paginationContainer = document.getElementById('paginationContainer');
        roomListBody.innerHTML = '';

        const selectedCategory = document.getElementById('category').value;
        let channels = allChannels[selectedCategory] || [];

        channels.sort((a, b) => {
            const userCountA = a.UserCount?.[0] ? parseInt(a.UserCount[0], 10) : 0;
            const userCountB = b.UserCount?.[0] ? parseInt(b.UserCount[0], 10) : 0;
            return userCountB - userCountA;
        });

        const channelsPerPage = 6;
        const totalChannels = channels.length;
        const totalPages = Math.ceil(totalChannels / channelsPerPage);

        paginationContainer.style.display = totalChannels > channelsPerPage ? 'block' : 'none';

        let currentPage = 1;
        renderPage(currentPage, channels, channelsPerPage);

        createPagination(totalPages, channels, channelsPerPage);
        sessionStorage.setItem('hasInteracted', 'true');
    }


    function renderPage(page, channels, channelsPerPage) {
        const roomListBody = document.getElementById('roomListBody');
        roomListBody.innerHTML = '';
    
        const startIndex = (page - 1) * channelsPerPage;
        const endIndex = startIndex + channelsPerPage;
        const visibleChannels = channels.slice(startIndex, endIndex);
    
        visibleChannels.forEach(channel => {
            const userCount = channel.UserCount?.[0] ? parseInt(channel.UserCount[0], 10) : 0;
            let roomName = channel.$.Name || 'Unnamed Room';
            roomName = roomName.replace(/^%#/, '').replace(/\\b/g, ' ');
            let topic = (channel.Topic?.[0] || 'No topic').replace(/\\b/g, ' ');
    
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${userCount}</td>
                <td><span class="room-link" style="cursor: pointer; color: blue; text-decoration: underline;" data-room="${encodeURIComponent(roomName)}">${roomName}</span></td>
                <td>${topic}</td>
                <td>${channel.$.Language?.[0] || 'Unknown'}</td>
            `;
            roomListBody.appendChild(row);
    
            // Add event listener to the room link
            const roomLink = row.querySelector('.room-link');
            roomLink.addEventListener('click', () => {
                if (roomName !== "%#RoomList") {
                addChannelToSwitcher(roomName); // Add the room to the switcher
                switchChannel(roomName); // Switch to the selected channel
        }
            });
    
            sessionStorage.setItem('hasInteracted', 'true');
        });
    }
    function switchChannel(roomName) {
        const selectedChannel = document.getElementById('channel-switcher').value;
        // document.getElementById('channel-name').textContent = selectedChannel;
        console.log('Switched to channel:', selectedChannel);
        currentChannel = selectedChannel;
          // Ensure the ChatWindow section is visible
    const chatWindow = document.getElementById('ChatWindow');
    if (chatWindow) {
        chatWindow.style.display = "block"; // Make the chat window visible
    } else {
        console.error('ChatWindow element not found');
    }
    }
    function addChannelToSwitcher(roomName) {
        const channelSwitcher = document.getElementById('channel-switcher');
        const existingOption = Array.from(channelSwitcher.options).find(option => option.value === roomName);
    
        if (!existingOption) {
            const newOption = document.createElement('option');
            newOption.value = roomName;
            newOption.textContent = roomName;
            channelSwitcher.appendChild(newOption);
        }
    }
    function createPagination(totalPages, channels, channelsPerPage) {
        const paginationContainer = document.getElementById('paginationContainer');
        paginationContainer.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.innerText = i;
            pageButton.addEventListener('click', () => renderPage(i, channels, channelsPerPage));
            paginationContainer.appendChild(pageButton);
        }
    }

    document.getElementById('category').addEventListener('change', updateRoomList);

    setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'requestLatest' }));
        }
    }, 30000);

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && (!channels[currentChannel] || channels[currentChannel].readyState !== WebSocket.OPEN)) {
            console.log('Tab is visible again. Reconnecting WebSocket...');
           // connectWebSocket(currentChannel);
        }
    });

    let wakeLock = null;

    async function requestWakeLock() {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('Wake Lock is active');
        } catch (err) {
            console.error('Failed to acquire Wake Lock:', err);
        }
    }

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            requestWakeLock();
        } else if (wakeLock !== null) {
            wakeLock.release().then(() => {
                console.log('Wake Lock released');
                wakeLock = null;
            });
        }
    });

    function toggleNicklist() {
        const nicklist = document.getElementById('nicklist');
        nicklist.classList.toggle('open');
    }

    requestWakeLock();

    if (sessionStorage.getItem('hasInteracted') === 'true') {
        isUserInteracted = true;
        console.log('User has interacted with the previous page.');
        playSound('Door-sound');
    }

    connectWebSocket(channelName);
});