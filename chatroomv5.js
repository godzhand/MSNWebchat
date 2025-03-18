// Global variables
const channelUserCounts = {}; // Global object to store user counts per channel
const channels = {}; // Store WebSocket connections and states for each channel
let currentChannel = null; // Track the currently active channel
const userRoles = {}; // Global object to track user roles per channel
const previousRoles = {}; // Stores the previous role of each user per channel
const modeQueue = []; // Queue to hold mode change messages
let isProcessing = false; // Flag to track if a message is being processed
let currentMessageElement = null; // Track the current message element
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
let wss;

// Add this JavaScript to handle the nickname functionality
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

const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');
const hostKeywordModal = document.getElementById('host-keyword-modal');
const closeModal = document.querySelector('.close-modal');
const cancelHostKeyword = document.getElementById('cancel-host-keyword');
const submitHostKeyword = document.getElementById('submit-host-keyword');
const hostKeywordInput = document.getElementById('host-keyword-input');
const channelSwitcher = document.getElementById('channel-switcher');
const originalSendButtonText = sendButton.innerHTML;
// Part channel
function partChannel(channel) {
    if (channels[channel] && channels[channel].readyState === WebSocket.OPEN) {
        channels[channel].send(JSON.stringify({
            type: 'PART',
            channel: channelName
        }));
    }
}

// Listen for beforeunload and pagehide events
window.addEventListener('beforeunload', (event) => {
    console.log('User is leaving the page. Parting channel...');
    partChannel(currentChannel);
});

window.addEventListener('pagehide', (event) => {
    console.log('User is leaving the page. Parting channel...');
    partChannel(currentChannel);
});

// Handle nicklist drag-select
//let nicklistUsers = document.getElementById(`nicklist-${channelName}`);
let isDragging = false;
let startIndex = -1;
let endIndex = -1;

document.addEventListener('DOMContentLoaded', () => {
});


function toggleNicklist() {
    const nicklist = document.getElementById('nicklist');
    nicklist.classList.toggle('open');
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


// Open a section (e.g., ChatWindow or RoomList)
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
    }
}

// Send a message to the current channel
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

// Send a normal message to the specified channel
function sendNormalMessage(channel, message) {
    const messageWithEmoticons = replaceEmoticonsWithImages(message);
    const messageWithEmoticonsAndGifs = replaceEmoticonsWithgifs(messageWithEmoticons);
    const messageElement = document.createElement('p');
    messageElement.innerHTML = `<strong style="color: darkblue;">${nickname}:</strong> ${messageWithEmoticonsAndGifs}`;
const chatBox = document.querySelector(`[id="chat-box-${channel}"].chat-box`);
if (chatBox) {
    chatBox.appendChild(messageElement);
}

    chatBox.scrollTop = chatBox.scrollHeight;
    if (channels[channel] && channels[channel].readyState === WebSocket.OPEN) {
        channels[channel].send(JSON.stringify({
            type: 'MESSAGE',
            content: message
        }));
    }
}

        // Close the modal when the user clicks on <span> (x)
        closeModal.addEventListener('click', () => {
            hostKeywordModal.style.display = 'none';
        });
    
        // Close the modal when the user clicks on Cancel
        cancelHostKeyword.addEventListener('click', () => {
            hostKeywordModal.style.display = 'none';
        });
    
        // Handle host keyword submission
        submitHostKeyword.addEventListener('click', () => {
            const hostKeyword = hostKeywordInput.value.trim();
            if (hostKeyword) {
                // Send the host keyword via WebSocket or handle it as needed
                if (channels[channel] && channels[channel].readyState === WebSocket.OPEN) {
                    channels[channel].send(JSON.stringify({
                        type: 'HOST_KEYWORD',
                        content: hostKeyword
                    }));
                }
                // Clear the input and close the modal
                hostKeywordInput.value = '';
                hostKeywordModal.style.display = 'none';
            }
        });
    
        // Close the modal if the user clicks outside of it
        window.addEventListener('click', (event) => {
            if (event.target === hostKeywordModal) {
                hostKeywordModal.style.display = 'none';
            }
        });
    

// Send a raw command to the specified channel


// Handle rejoin for a specific channel
function handleRejoin(channel) {
    sendButton.innerHTML = originalSendButtonText;
    sendRawCommand(channel, "//JOIN #");
    sendButton.removeEventListener('click', handleRejoin);
    sendButton.addEventListener('click', sendMessage);
}

// Replace emoticons with images
function replaceEmoticonsWithImages(message) {
    for (const [emoticon, imageFile] of Object.entries(emoticonMap)) {
        const imagePath = `MSN/${imageFile}`;
        const imgTag = `<img src="${imagePath}" alt="${emoticon}" style="width: 14px; height: 14px;">`;
        message = message.replace(new RegExp(escapeRegExp(emoticon), 'g'), imgTag);
    }
    return message;
}

// Replace emoticons with GIFs
function replaceEmoticonsWithgifs(message) {
    for (const [emoticong, imageFileg] of Object.entries(emoticonMapg)) {
        const imagePathg = `MSN/${imageFileg}`;
        const imgTagg = `<img src="${imagePathg}" alt="${emoticong}" style="width: 65px; height: 48px;">`;
        message = message.replace(new RegExp(escapeRegExp(emoticong), 'g'), imgTagg);
    }
    return message;
}

// Escape special characters in regex
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Generate a random nickname
function generateRandomNickname() {
    const adjectives = ['Cool', 'Funny', 'Smart', 'Brave', 'Quick', 'Witty', 'Happy', 'Lucky', 'Gentle', 'Wild'];
    const nouns = ['Cat', 'Dog', 'Fox', 'Bear', 'Wolf', 'Lion', 'Tiger', 'Eagle', 'Hawk', 'Owl'];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${randomAdjective}${randomNoun}${Math.floor(Math.random() * 100)}`;
}


function addModeChange(channel, nick, targetNick, mode) {
    modeQueue.push({ channel, nick, targetNick, mode }); // Add the mode change to the queue
    if (!isProcessing) {
        processQueue(channel); // Start processing the queue if not already processing
    }
}


// Connect to a WebSocket for a specific channel
function connectWebSocket(channel) {
    console.log(`Attempting to connect WebSocket for channel ${channel}...`);

   // const chatBox = document.querySelector(`[id="chat-box-${channel}"].chat-box`);
    //const connectingMessage = document.createElement('p');
   // connectingMessage.textContent = `connecting to server...`;
    //connectingMessage.style.color = 'green';
    //chatBox.appendChild(connectingMessage);

    channels[channel] = new WebSocket('wss://chat.saintsrow.net/ws/');

    channels[channel].onopen = () => {
        console.log(`✅ WebSocket connection established for channel ${channel}`);
        reconnectAttempts = 0;
        isUIReset = false;

       // const connectedMessage = document.createElement('p');
       // connectedMessage.textContent = `Connected!`;
       // connectedMessage.style.color = 'red';
       // chatBox.appendChild(connectedMessage);

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
            // console.log('WebSocket message received:', event.data);
             const data = JSON.parse(event.data);
             if (data.type === 'MODE') {
              // console.log("Received MODE event:", data.raw, typeof data.raw);
               //  console.log("Received MODE event:", data.raw);
                let ArrayRaws = data.raw.split(' '); // ✅ works fine now
                let mode = ArrayRaws[1];
                let targetNick = ArrayRaws[2];
                let nick = data.nick;
                 // Parse the params array
               //  const { channel, mode, targetNick } = parseModeParams(data.raw);
               if (!userRoles[channel]) {
                userRoles[channel] = {};
            }
            if (!isParticipant[channel]) {
                isParticipant[channel] = {};
            }
                 // Handle channel modes
               //  console.log("channel mode " + ArrayRaws[1]);
             if (ArrayRaws[0].startsWith('%#')) {
                     let MChannel = ArrayRaws[0];
                     switch (mode) {
                         case '+q': // Owner
                         // Store the current role before promoting to owner
                     //    previousRoles[targetNick] = userRoles[targetNick] || 'spectator';
                         userRoles[channel][targetNick] = 'owner';
                         playSoundX('thunder-sound');
                         break;
                     case '+o': // Host
                         // Store the current role before promoting to host
             //    previousRoles[targetNick] = userRoles[targetNick] || 'spectator';
             userRoles[channel][targetNick]  = 'host';
                         break;
                     case '+v': // Participant
                         isParticipant[channel][targetNick] = true;
                         if (userRoles[channel][targetNick]  !== 'owner' && userRoles[channel][targetNick]  !== 'host') {
                          //   userRoles[targetNick] = 'participant';
                         }
                         break;
                     case '-v': // Spectator
                     isParticipant[channel][targetNick] = false;
                         if (userRoles[channel][targetNick]  !== 'owner' && userRoles[channel][targetNick]  !== 'host') {
                           //  userRoles[targetNick] = 'spectator';
                         }
                         break;
                     case '-o': // Remove host
                         // Revert to the previous role if available, otherwise set to spectator
                         if (isParticipant[channel][targetNick]) {
                            userRoles[channel][targetNick] = 'participant';
                             }
                         // Clear the previous role after demotion
                       //  delete previousRoles[targetNick];
                         break;
                     case '-q': // Remove owner
                     if (isParticipant[channel][targetNick]) {
                        userRoles[channel][targetNick] = 'participant';
                     }
                         // Revert to the previous role if available, otherwise set to spectator
                       //  userRoles[targetNick] = 'member';
                         // Clear the previous role after demotion
                       //  delete previousRoles[targetNick];
                         break;
                         default:
                             console.log(`Unhandled mode: ${mode}`);
                             break;
                     }
             
                     // Rebuild the nicklist with updated roles
                     const users = Object.keys(userRoles); // Get all users
                     populateNicklist(currentChannel, users);
                    handleModeChange(currentChannel, nick, targetNick, mode);
                    addModeChange(currentChannel, nick, targetNick, mode); // Add the mode change to the queue
                 }
             }
             if (data.type === 'rawmsg') {
             console.log(data.data.trim()); // Log the line directly from the `data` property
         }
             if (data.type === 'raw' && data.data && typeof data.data === 'string') {
                 const ArrayRaws = data.data.trim().split(' ');
         
                 if (ArrayRaws[1] === '001') {
                     // Play the connected sound if the user has interacted
                    // console.log("connected");
                     playSound('connected-sound');
                 }
             } else if (data.type === 'message') {
                 // Replace emoticons in the message with images
                 const messageWithEmoticons = replaceEmoticonsWithImages(data.message);
                 const messageWithEmoticonsAndGifs = replaceEmoticonsWithgifs(messageWithEmoticons);
         
                 // Display the chat message
                 const messageElement = document.createElement('p');
                 messageElement.innerHTML = `<strong>${data.nick}:</strong> ${messageWithEmoticonsAndGifs}`;
                 
                 document.querySelector(`[id="chat-box-${channel}"].chat-box`).appendChild(messageElement);
         
                 // Scroll to the bottom of the chat box
                 const chatBox =  document.querySelector(`[id="chat-box-${channel}"].chat-box`);
                 chatBox.scrollTop = chatBox.scrollHeight;
             }
             else if (data.type === 'NICKNAME-UPDATE') {
             nickname = data.nickname;        
             }
             else if (data.type === 'TIME') {
                 let tnickname = data.tnickname;
                 let timeReply = data.data;
             
                 // Step 1: Clean up "TIME " prefix
                 let timeReplyClean = timeReply.replace(/^TIME\s+/, '');
             
                 // Step 2: Split into parts
                 let [dayShort, monthShort, dayNum, timeRaw, year] = timeReplyClean.split(' ');
             
                 // Map short day names to full names
                 const dayMap = {
                     Mon: 'Monday',
                     Tue: 'Tuesday',
                     Wed: 'Wednesday',
                     Thu: 'Thursday',
                     Fri: 'Friday',
                     Sat: 'Saturday',
                     Sun: 'Sunday'
                 };
             
                 // Map month short names to full names (optional for cleaner output)
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
             
                 let dayFull = dayMap[dayShort] || dayShort;
                 let monthFull = monthMap[monthShort] || monthShort;
             
                 // Step 3: Convert time to AM/PM
                 let [hour, minute, second] = timeRaw.split(':').map(Number);
                 let ampm = hour >= 12 ? 'PM' : 'AM';
                 hour = hour % 12 || 12; // Convert to 12-hour format, handling '0' as '12'
             
                 let formattedTime = `${hour}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')} ${ampm}`;
             
                 // Final formatted date-time string
                 let finalTimeString = `${dayFull}, ${monthFull} ${dayNum}, ${year} at ${formattedTime}`;
             
                 // Step 4: Create and append message
                 const systemMessage = document.createElement('p');
                 systemMessage.textContent = `‣ ${tnickname}'s local time is ${finalTimeString}`;
                 systemMessage.style.color = 'gray'; // Match system message style
                 systemMessage.classList.add('time-reply-animate'); // New custom animation
         
             
                 // Append to chat box
                 document.querySelector(`[id="chat-box-${channel}"].chat-box`).appendChild(systemMessage);
             
                 // Scroll to bottom
                 const chatBox = document.querySelector(`[id="chat-box-${channel}"].chat-box`);
                 chatBox.scrollTop = chatBox.scrollHeight;
             
                 // (Optional) Play sound
                 // playSound('notice-sound');
             }
             
             
             
             else if (data.type === 'system') {
                if (!userRoles[channel]) {
                    userRoles[channel] = {};
                }
                if (!isParticipant[channel]) {
                    isParticipant[channel] = {};
                }
             // Handle system messages (JOIN, PART, QUIT)
         // Handle join event
         if (data.event === 'join' || data.event === 'part' || data.event === 'quit' || data.event === 'kick') {
           //  updateUserCount(data.userCount); // Update the user count
         }
         if (data.event === 'join' && data.nickname === nickname) {
            if (HasBeenKicked === true) {
                HasBeenKicked = false;
                playSoundX('join-sound');
            }
        }
         if (data.event === 'join' && data.nickname !== nickname) {
            playSoundX('join-sound');
             userRoles[channel][data.nickname] = 'member'; // Default role for new users
             isParticipant[channel][data.nickname] = false; // Default to false for new users
             populateNicklist(channel, Object.keys(userRoles[channel])); // Refresh the nicklist
             //updateUserCount(data.userCount);
         
             const systemMessage = document.createElement('p');
             systemMessage.textContent = `› ${data.nickname} has joined the channel`;
             systemMessage.style.color = 'gray';
             systemMessage.classList.add('glitchy-fade-in');
             document.querySelector(`[id="chat-box-${channel}"].chat-box`).appendChild(systemMessage);
         
             const chatBox = document.querySelector(`[id="chat-box-${channel}"].chat-box`);
             chatBox.scrollTop = chatBox.scrollHeight;
         }
         
         // Handle part or quit event
         if (data.event === 'part' || data.event === 'quit') {
             console.log('WebSocket data:', data);
             delete userRoles[channel][data.nickname];
             delete isParticipant[channel][data.nickname];
             populateNicklist(channel, Object.keys(userRoles[channel])); // Refresh the nicklist
         
             const systemMessage = document.createElement('p');
             systemMessage.textContent = data.event === 'part'
                 ? `‹ ${data.nickname} has left the channel`
                 : `‹ ${data.message}`;
             systemMessage.style.color = 'gray';
             document.querySelector(`[id="chat-box-${channel}"].chat-box`).appendChild(systemMessage);
         
             const chatBox = document.querySelector(`[id="chat-box-${channel}"].chat-box`);
             chatBox.scrollTop = chatBox.scrollHeight;
         }
         
         // Handle kick event
         if (data.event === 'kick') {
             delete userRoles[channel][data.knickname];
             delete isParticipant[channel][data.knickname];
             populateNicklist(channel, Object.keys(userRoles[channel])); // Refresh the nicklist
         
             const systemMessage = document.createElement('p');
             systemMessage.textContent = data.message;
             systemMessage.style.fontWeight = 'bold';
             systemMessage.style.color = '#FF0000';
            document.querySelector(`[id="chat-box-${channel}"].chat-box`).appendChild(systemMessage);
         
             const chatBox = document.querySelector(`[id="chat-box-${channel}"].chat-box`);
             chatBox.scrollTop = chatBox.scrollHeight;
             if (data.knickname === nickname) {
                HasBeenKicked = true;
                 playSound('kick-sound');
             const sendbut =  document.querySelector('#send-button');
             sendbut.innerHTML = "rejoin";
             Object.keys(userRoles[channel]).forEach(key => delete userRoles[channel][key]);
             updateUserCount(channel,0);
             roomName = channelName.replace(/^%#/, '').replace(/\\b/g, ' ');
             const nicklistUsers = document.getElementById(`nicklist-${roomName}`);
             nicklistUsers.innerHTML = ''; // Clear existing list
             sendbut.removeEventListener('click', sendMessage);
             sendbut.addEventListener('click', handleRejoin);
         
             }
             else {
                 playSoundX('kick-sound2');
             }
            // const sendbut =  document.querySelector('#send-button');
            // sendbut.innerHTML = "Rejoin";
             console.log(`User ${data.knickname} kicked. Updated userRoles:`, userRoles);
             console.log(`Updated isParticipant:`, isParticipant);
         }  
             }
         if (data.type === 'topic') {
             // Handle topic change
             const topicElement = document.createElement('p');
             const prefix = document.createElement('span');
             prefix.textContent = "The chat’s topic is: ";
             prefix.style.color = '#289e92';
         
             const topicText = document.createElement('span');
             topicText.textContent = data.topic || 'No topic provided'; // Fallback if no topic is provided
             topicText.style.color = 'black';
             topicText.style.fontStyle = 'italic';
         
             topicElement.appendChild(prefix);
             topicElement.appendChild(topicText);
             topicElement.style.padding = '5px';
             topicElement.style.margin = '5px 0';
         
             document.querySelector(`[id="chat-box-${channel}"].chat-box`).appendChild(topicElement);
         
             // Scroll to the bottom of the chat box
             const chatBox = document.querySelector(`[id="chat-box-${channel}"].chat-box`);
             chatBox.scrollTop = chatBox.scrollHeight;
         }
         if (data.type === 'nicklist-count') {
             console.log('👥 Nicklist count received:', data.users);
             updateUserCount(channel,data.userCount);
         }
             if (data.type === 'nicklist') {
                 console.log('👥 Nicklist data received:', data.users);
                 if (userRoles[channel]) {
                 // Clear the existing userRoles object
                 Object.keys(userRoles[channel]).forEach(key => delete userRoles[channel][key]);
                 }
                 if (!userRoles[channel]) {
                    userRoles[channel] = {};
                }
                 // Process each user in the nicklist
                 data.users.forEach(user => {
                     // Remove leading colon if present
                     if (user.startsWith(':')) {
                         user = user.substring(1);
                     }
             
                     // Assign roles based on prefixes
                     if (user.startsWith('.')) {
                         user = user.substring(1);
                         userRoles[channel][user] = 'owner'; // Owner (mode +q)
                     } else if (user.startsWith('@')) {
                         user = user.substring(1);
                         userRoles[channel][user] = 'host'; // Host (mode +o)
                     } else if (user.startsWith('+')) {
                         user = user.substring(1);
                         userRoles[channel][user] = 'participant'; // Participant (mode +v)
                     } else {
                        userRoles[channel][user] = 'member'; // Spectator (no prefix or mode -v)
                     }
                 });
             
                 // Populate the nicklist with the updated roles
                populateNicklist(channel, data.users);
                 updateUserCount(channel, data.userCount);
             }
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

// Handle WebSocket messages for a specific channel
function handleWebSocketMessage(channel, data) {
    switch (data.type) {
        case 'MODE':
           // handleModeChange(channel, data.nick, data.targetNick, data.mode);
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
            //console.log(channel);
      //      handleNicklistUpdate(channel, data.users);
            break;
        default:
            console.log('Unhandled message type:', data.type);
    }
}

function handleChatMessage(channel, data) {
    const chatBox = document.querySelector(`[id="chat-box-${channel}"].chat-box`);
    if (!chatBox) {
        console.error(`Chat box for channel ${channel} not found`);
        return;
    }

    const messageWithEmoticons = replaceEmoticonsWithImages(data.message);
    const messageWithEmoticonsAndGifs = replaceEmoticonsWithgifs(messageWithEmoticons);

    const messageElement = document.createElement('p');
    messageElement.innerHTML = `<strong>${data.nick}:</strong> ${messageWithEmoticonsAndGifs}`;
    chatBox.appendChild(messageElement);

    chatBox.scrollTop = chatBox.scrollHeight;
}

function handleNicklistUpdate(channel, users) {
   if (!userRoles[channel]) {
        userRoles[channel] = {};
 }

    // Clear existing roles for the channel
    Object.keys(userRoles[channel]).forEach(key => delete userRoles[channel][key]);

    if (!userRoles[channel]) {
    userRoles[channel] = {};
}
    // Filter out non-user entries (e.g., channel names or metadata)
    const filteredUsers = users.filter(user => {
        // Skip entries that start with '%#' or are empty
        return !user.startsWith('%#') && user.trim() !== '';
    });

    // Update roles based on the filtered user list
    filteredUsers.forEach(user => {
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

    // Populate the nicklist with the filtered users
    populateNicklist(channel, filteredUsers);
    updateUserCount(channel, filteredUsers.length);
}

function populateNicklist(channel, users) {
    if (!userRoles[channel]) {
        userRoles[channel] = {};
    }

    const roomName = channel.replace(/^%#/, '').replace(/\\b/g, ' ');
    const nicklistUsers = document.getElementById(`nicklist-${roomName}`);
    if (!nicklistUsers) {
        console.error(`Nicklist container for channel ${channel} not found`);
        return;
    }

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

    document.querySelector(`[id="chat-box-${channel}"].chat-box`).appendChild(systemMessage);
    const chatBox = document.querySelector(`[id="chat-box-${channel}"].chat-box`);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function handleSystemMessage(channel, data) {
    if (!userRoles[channel]) {
        userRoles[channel] = {};
    }
    if (!isParticipant[channel]) {
        isParticipant[channel] = {};
    }

    if (data.event === 'join' && data.nickname !== nickname) {
        userRoles[channel][data.nickname] = 'member';
        isParticipant[channel][data.nickname] = false;
        populateNicklist(channel, Object.keys(userRoles[channel]));

        const systemMessage = document.createElement('p');
        systemMessage.textContent = `› ${data.nickname} has joined the channel`;
        systemMessage.style.color = 'gray';
        systemMessage.classList.add('glitchy-fade-in');
        document.querySelector(`[id="chat-box-${channel}"].chat-box`).appendChild(systemMessage);

        const chatBox = document.querySelector(`[id="chat-box-${channel}"].chat-box`);
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
        document.querySelector(`[id="chat-box-${channel}"].chat-box`).appendChild(systemMessage);

        const chatBox = document.querySelector(`[id="chat-box-${channel}"].chat-box`);
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
        document.querySelector(`[id="chat-box-${channel}"].chat-box`).appendChild(systemMessage);

        const chatBox = document.querySelector(`[id="chat-box-${channel}"].chat-box`);
        chatBox.scrollTop = chatBox.scrollHeight;

        if (data.knickname === nickname) {
            playSound('kick-sound2');
            const sendbut = document.querySelector('#send-button');
            sendbut.innerHTML = "rejoin";
            Object.keys(userRoles[channel]).forEach(key => delete userRoles[channel][key]);
            updateUserCount(channel, 0);
            const nicklistUsers = document.getElementById(`nicklist-${channelName}`);
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

    document.querySelector(`[id="chat-box-${channel}"].chat-box`).appendChild(topicElement);
    const chatBox = document.querySelector(`[id="chat-box-${channel}"].chat-box`);
    chatBox.scrollTop = chatBox.scrollHeight;
}
channelSwitcher.addEventListener('change', (e) => {
    const selectedChannel = e.target.value;
    switchChannel(selectedChannel);
});


function updateUserCount(channel, count) {
    // Store the user count for the channel
    channelUserCounts[channel] = count;

    // Log the user counts for debugging
    console.log(`Updated user count for ${channel}:`, count);
    console.log(`Current channelUserCounts:`, channelUserCounts);

    // Update the UI for the current channel
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

    roomName = channel.replace(/^%#/, '').replace(/\\b/g, ' ');
    const nicklistUsers = document.getElementById(`nicklist-${roomName}`);
    nicklistUsers.innerHTML = '';

    const userCountElement = document.getElementById('user-count');
    userCountElement.textContent = '0 users online';

    const chatBox = document.querySelector(`[id="chat-box-${channel}"].chat-box`);
    chatBox.innerHTML = '<p id="message1"></p><p id="message2" style="display: none;">Connected!</p>';

    const disconnectMessage = document.createElement('p');
    disconnectMessage.textContent = 'lost connection to server, reconnecting...';
    disconnectMessage.style.color = 'green';
    chatBox.appendChild(disconnectMessage);

    isUIReset = true;
}

function getModeMessage(nick, targetNick, mode) {
    const modeMessages = {
        '+q': `● ${nick} has made ${targetNick} an Owner.`,
        '-q': `● ${nick} has removed Owner from ${targetNick}.`,
        '+o': `● ${nick} has made ${targetNick} a Host.`,
        '-o': `● ${nick} has removed Host from ${targetNick}.`,
        '+v': `● ${nick} has made ${targetNick} a Participant.`,
        '-v': `‹ ${nick} has made ${targetNick} a Spectator.`
    };
    return modeMessages[mode] || `● Unhandled mode change: ${mode}`;
}

function processQueue(channel) {
         // Remove %# from room names
        // channel = channel.replace(/^%#/, '');

         // Replace \b with a space in the room name
        // channel = channel.replace(/\\b/g, ' ');
    if (modeQueue.length === 0) {
        isProcessing = false;
        return;
    }

    isProcessing = true;
    const { nick, targetNick, mode } = modeQueue.shift();

    if (currentMessageElement) {
        currentMessageElement.classList.remove('glitchy-fade-in');
    }

    let systemMessage = document.createElement('p');
    let messageText = getModeMessage(nick, targetNick, mode); // Extracted function for clean code
    systemMessage.textContent = messageText;
    systemMessage.classList.add('glitchy-fade-in');
    systemMessage.style.color = 'gray';

    document.querySelector(`[id="chat-box-${currentChannel}"].chat-box`).appendChild(systemMessage);
    const chatBox = document.querySelector(`[id="chat-box-${currentChannel}"].chat-box`);
    chatBox.scrollTop = chatBox.scrollHeight;

    currentMessageElement = systemMessage;

    // Delay before processing next message
    setTimeout(processQueue, 1); // 1-second delay between messages
}

// Handle mode changes for a specific channel


function handleModeChange(channel, nick, targetNick, mode) {
    // Initialize the channel if it doesn't exist
    if (!userRoles[channel]) {
        userRoles[channel] = {};
    }
    if (!previousRoles[channel]) {
        previousRoles[channel] = {};
    }
    if (!isParticipant[channel]) {
        isParticipant[channel] = {};
    }

    switch (mode) {
        case '+q': // Owner
            previousRoles[channel][targetNick] = userRoles[channel][targetNick] || 'member';
            userRoles[channel][targetNick] = 'owner';
            break;
        case '+o': // Host
            previousRoles[channel][targetNick] = userRoles[channel][targetNick] || 'member';
            userRoles[channel][targetNick] = 'host';
            break;
        case '+v': // Participant
            if (userRoles[channel][targetNick] !== 'owner' && userRoles[channel][targetNick] !== 'host') {
                userRoles[channel][targetNick] = 'participant';
                isParticipant[channel][targetNick] = true;
            }
            break;
        case '-v': // Spectator
            if (userRoles[channel][targetNick] !== 'owner' && userRoles[channel][targetNick] !== 'host') {
                userRoles[channel][targetNick] = 'member';
            }
            isParticipant[channel][targetNick] = false;
            break;
        case '-o': // Remove host
            userRoles[channel][targetNick] = 'member';
            if (isParticipant[channel][targetNick]) {
                userRoles[channel][targetNick] = 'participant';
            }
            delete previousRoles[channel][targetNick];
            break;
        case '-q': // Remove owner
            userRoles[channel][targetNick] = 'member';
            if (isParticipant[channel][targetNick]) {
                userRoles[channel][targetNick] = 'participant';
            }
            delete previousRoles[channel][targetNick];
            break;
        default:
            console.log(`Unhandled mode: ${mode}`);
    }

    populateNicklist(channel, Object.keys(userRoles[channel]));
    console.log(`Mode change: ${mode} for ${targetNick}. Updated userRoles:`, userRoles[channel]);
    console.log(`Updated isParticipant:`, isParticipant[channel]);
    console.log(`Updated previousRoles:`, previousRoles[channel]);
}

// Populate the nicklist for a specific channel


// Update the user count for a specific channel
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

const MODE_ACTIONS = {
    '+q': (channel, targetNick) => {
        if (!userRoles[channel]) {
            userRoles[channel] = {};
        }
        previousRoles[channel][targetNick] = userRoles[channel][targetNick] || 'member';
        userRoles[channel][targetNick] = 'owner';
        playSound('thunder-sound');
    },
    '+o': (channel, targetNick) => {
        if (!userRoles[channel]) {
            userRoles[channel] = {};
        }
        previousRoles[channel][targetNick] = userRoles[channel][targetNick] || 'member';
        userRoles[channel][targetNick] = 'host';
    },
    '+v': (channel, targetNick) => {
        if (!userRoles[channel]) {
            userRoles[channel] = {};
        }
        userRoles[channel][targetNick] = 'participant';
        isParticipant[channel][targetNick] = true;
    },
    '-v': (channel, targetNick) => {
        if (!userRoles[channel]) {
            userRoles[channel] = {};
        }
        userRoles[channel][targetNick] = 'member';
        isParticipant[channel][targetNick] = false;
    },
    '-o': (channel, targetNick) => {
        if (!userRoles[channel]) {
            userRoles[channel] = {};
        }
        userRoles[channel][targetNick] = 'member';
        if (isParticipant[channel][targetNick]) {
            userRoles[channel][targetNick] = 'participant';
        }
    },
    '-q': (channel, targetNick) => {
        if (!userRoles[channel]) {
            userRoles[channel] = {};
        }
        userRoles[channel][targetNick] = 'member';
        if (isParticipant[channel][targetNick]) {
            userRoles[channel][targetNick] = 'participant';
        }
    }
};





// Reset the chat UI for a specific channel
function resetChatUI(channel) {
    if (isUIReset) return;

    roomName = channel.replace(/^%#/, '').replace(/\\b/g, ' ');
    const nicklistUsers = document.getElementById(`nicklist-${roomName}`);
    nicklistUsers.innerHTML = '';

    const userCountElement = document.getElementById('user-count');
    userCountElement.textContent = '0 users online';

    const chatBox = document.querySelector(`[id="chat-box-${channel}"].chat-box`);
    chatBox.innerHTML = '<p id="message1"></p><p id="message2" style="display: none;">Connected!</p>';

    const disconnectMessage = document.createElement('p');
    disconnectMessage.textContent = 'lost connection to server, reconnecting...';
    disconnectMessage.style.color = 'green';
    chatBox.appendChild(disconnectMessage);

    isUIReset = true;
}

// Add a channel to the channel switcher dropdown
function addChannelToSwitcher(channelName) {
    const existingOption = Array.from(channelSwitcher.options).find(option => option.value === channelName);

    if (!existingOption) {
        const newOption = document.createElement('option');
        newOption.value = channelName;
        newOption.textContent = channelName;
        channelSwitcher.appendChild(newOption);
    }

    // Create chat box and nicklist elements if they don't exist
    if (!document.getElementById(`chat-box-${channelName}`)) {
        const chatBox = document.createElement('div');
        chatBox.id = `chat-box-${channelName}`;
        chatBox.className = 'chat-box';
        chatBox.style.display = 'none'; // Initially hidden
        document.getElementById('chat-container').appendChild(chatBox);
        channelUserCounts[channelName] = 0;
    }

    if (!document.getElementById(`nicklist-${channelName}`)) {
        const nicklist = document.createElement('ul');
        nicklist.id = `nicklist-${channelName}`;
        nicklist.className = 'nicklist';
        nicklist.style.display = 'none'; // Initially hidden
        document.getElementById('nicklist-users').appendChild(nicklist);
    }
    const chatinputcontainer = document.getElementById(`chat-input-container`);
    chatinputcontainer.style.display = "flex";
    // If this is the first channel being added, switch to it
    if (!currentChannel) {
        switchChannel(channelName);
    }
    const nicklistUsers = document.getElementById(`nicklist-${channelName}`);
    if (nicklistUsers) {
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
    } else {
        console.error(`Element with ID 'nicklist-${channelName}' not found.`);
    }

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
    
    // Handle nicklist context menu
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
        channel = currentChannel;
        if (channels[channel] && channels[channel].readyState === WebSocket.OPEN) {
            selectedUsers.forEach(user => {
                const command = `${commandPrefix}${user}${commandSuffix}`;
                channels[channel].send(JSON.stringify({
                    type: 'CMDRAW',
                    command: command
                }));
            });
        }
    
        contextMenu.style.display = 'none';
    }
}
// Switch to a specific channel
// Switch to a specific channel
function switchChannel(channelName) {
    console.log("Switching to channel:", channelName);

    // Hide the chat box and nicklist of the previously active channel
    if (currentChannel) {
        const previousChatBox = document.getElementById(`chat-box-${currentChannel}`);
        const previousNicklist = document.getElementById(`nicklist-${currentChannel}`);
        if (previousChatBox) previousChatBox.style.display = 'none';
        if (previousNicklist) previousNicklist.style.display = 'none';
    }

    // Update the current channel
    currentChannel = channelName;

    // Show the chat box and nicklist of the newly selected channel
    const currentChatBox = document.getElementById(`chat-box-${channelName}`);
    const currentNicklist = document.getElementById(`nicklist-${channelName}`);
    if (currentChatBox) currentChatBox.style.display = 'block';
    if (currentNicklist) currentNicklist.style.display = 'contents';
    if (channels[currentChannel]) {
        sendRawCommand(currentChannel,"//NAMES #");
    }
    // Update the channel name display
    document.getElementById('channel-name').textContent = channelName;

    // Update the user count display for the current channel
    const userCount = channelUserCounts[channelName] || 0; // Fallback to 0 if no count is available
    updateUserCount(channelName, userCount);

    // Connect to the WebSocket if not already connected
    if (!channels[channelName]) {
        if (channelName === "RoomList") {
            // Handle RoomList specific logic if needed
        }
        if (channelName !== "RoomList") {
            connectWebSocket(channelName);
        }
    }

    // Update the channel switcher dropdown
    const channelSwitcher = document.getElementById('channel-switcher');
    channelSwitcher.value = channelName;

    // Handle special cases (e.g., RoomList)
    if (channelName === "RoomList") {
        document.getElementById("ChatWindow").style.display = "none";
        document.getElementById("RoomList").style.display = "contents";
        const chatinputcontainer = document.getElementById(`chat-input-container`);
        chatinputcontainer.style.display = "none";
        const entireNicklist = document.getElementById(`nicklist`);
        entireNicklist.style.display = "none";
    } else {
        document.getElementById("RoomList").style.display = "none";
        document.getElementById("ChatWindow").style.display = "block";
        const chatinputcontainer = document.getElementById(`chat-input-container`);
        chatinputcontainer.style.display = "flex";
        const entireNicklist = document.getElementById(`nicklist`);
        entireNicklist.style.display = "block";
    }
}
// Event listeners
sendButton.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
function handleRejoin() {
    // Revert the button text back to the original state
    sendButton.innerHTML = originalSendButtonText;

    sendRawCommand(currentChannel, "//JOIN #");
    // Reattach the original sendMessage functionality
    sendButton.removeEventListener('click', handleRejoin);
    sendButton.addEventListener('click', sendMessage);
}
function sendRawCommand(channel, command) {
    if (channels[channel] && channels[channel].readyState === WebSocket.OPEN) {
        channels[channel].send(JSON.stringify({
            type: 'CMDRAW',
            command: command
        }));
    }
}
channelSwitcher.addEventListener('change', (e) => {
    const selectedChannel = e.target.value;
    switchChannel(selectedChannel);
});

// Initialize the default channel
//if (!currentChannel) {
  //  currentChannel = "The Lobby"; // Default channel
   // connectWebSocket(channelName);
   addChannelToSwitcher(channelName);
    switchChannel(channelName);
//}
    // WebSocket for room list
    let ws = new WebSocket('wss://chat.saintsrow.net/rm');
    let allChannels = {};

    ws.onopen = () => {
        console.log('✅ Connected to WebSocket server');
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

    // Update room list
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

    // Render page
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

    // Create pagination
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

    // Add event listener to the category dropdown
    document.getElementById('category').addEventListener('change', updateRoomList);

    // Optional: Periodic refresh (if WebSocket does not push updates automatically)
    setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'requestLatest' })); // Request latest data
        }
    }, 30000); // Refresh every 30 seconds

    // Handle visibility change for reconnecting WebSocket
    document.addEventListener('visibilitychange', () => {
        channel = currentChannel;
        if (document.visibilityState === 'visible' && (!channels[channel] || channels[channel].readyState !== WebSocket.OPEN)) {
            console.log('Tab is visible again. Reconnecting WebSocket...');
            connectWebSocket();
        }
    });

    // Wake Lock functionality
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

    if (sessionStorage.getItem('hasInteracted') === 'true') {
        isUserInteracted = true;
        console.log('User has interacted with the previous page.');
        playSound('Door-sound');
        // You can restore the state or update the UI accordingly
    }