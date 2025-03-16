let wss;
document.addEventListener('DOMContentLoaded', () => {

const userRoles = {}; // Global object to track user roles
let previousRoles = {}; // Stores the previous role of each user
const modeQueue = []; // Queue to hold mode change messages
let isProcessing = false; // Flag to track if a message is being processed
let currentMessageElement = null; // Track the current message element
const isParticipant = {

};


function processQueue() {
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

    document.querySelector('.chat-box').appendChild(systemMessage);
    const chatBox = document.querySelector('.chat-box');
    chatBox.scrollTop = chatBox.scrollHeight;

    currentMessageElement = systemMessage;

    // Delay before processing next message
    setTimeout(processQueue, 1); // 1-second delay between messages
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

function addModeChange(nick, targetNick, mode) {
    modeQueue.push({ nick, targetNick, mode }); // Add the mode change to the queue
    if (!isProcessing) {
        processQueue(); // Start processing the queue if not already processing
    }
}

const MODE_ACTIONS = {
    '+q': (targetNick) => {
        previousRoles[targetNick] = userRoles[targetNick] || 'member';
        userRoles[targetNick] = 'owner';
      //  isParticipant[targetNick] = false;
    },
    '+o': (targetNick) => {
        previousRoles[targetNick] = userRoles[targetNick] || 'member';
        userRoles[targetNick] = 'host';
     //   isParticipant[targetNick] = false;
    },
    '+v': (targetNick) => {
       userRoles[targetNick] = 'participant';
        isParticipant[targetNick] = true;
    },
    '-v': (targetNick) => {
        userRoles[targetNick] = 'member';
        isParticipant[targetNick] = false;
    },
    '-o': (targetNick) => {
        userRoles[targetNick] = 'member';
        if (isParticipant[targetNick]) {
        userRoles[targetNick] = 'participant'; // Restore participant status
        }
    },
    '-q': (targetNick) => {
            userRoles[targetNick] = 'member';
            if (isParticipant[targetNick] === true) {
            userRoles[targetNick] = 'participant'; // Restore participant status
            }
    }
};

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


function populateNicklist(users) {
    const nicklistUsers = document.getElementById('nicklist-users');
    const fragment = document.createDocumentFragment();
    nicklistUsers.innerHTML = ''; // Clear existing list

    // Group nicknames by their roles
    const groups = {
        owner: [], // Owners (mode +q)
        host: [],  // Hosts (mode +o)
        participant: [], // Participants (mode +v)
        member: [], // Members (no mode)
        spectator: [], // Spectators (mode -v or no mode)
    };

    // Iterate through the users and categorize them based on prefixes or userRoles
    users.forEach(user => {
        let displayName = user; // Default to the original name
        let role = 'member'; // Default role

        // Check for prefixes and assign roles accordingly
        if (user.startsWith('.')) {
            role = 'owner';
            displayName = user.substring(1); // Remove the '.' prefix
        } else if (user.startsWith('@')) {
            role = 'host';
            displayName = user.substring(1); // Remove the '@' prefix
        } else if (user.startsWith('+')) {
            role = 'participant';
            displayName = user.substring(1); // Remove the '+' prefix
        } else {
            // If no prefix, use the role from userRoles (if available)
            role = userRoles[user] || 'member';
        }

        // Ensure the nickname is unique within its role group
        if (!groups[role].includes(displayName)) {
            groups[role].push(displayName);
        }

        // Update the userRoles object
        userRoles[displayName] = role;
    });

    // Sort each group alphabetically
    Object.values(groups).forEach(group => group.sort((a, b) => a.localeCompare(b)));

    // Combine the groups in the specified order
    const sortedUsers = [
        ...groups.owner,
        ...groups.host,
        ...groups.participant,
        ...groups.member,
        ...groups.spectator
    ];

    // Display the sorted nicknames
    sortedUsers.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user;

        // Add the appropriate role class
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
    // Debugging: Log the state of userRoles and groups
    console.log('Nicklist updated with roles:', groups);
    console.log('Current userRoles:', userRoles);
}

function updateUserCount(count) {
const userCountElement = document.getElementById('user-count');
const userCountMobileElement = document.getElementById('user-count-mobile');

if (userCountElement) {
    userCountElement.textContent = count === 1 ? `${count} user online` : `${count} users online`;
}

if (userCountMobileElement) {
    userCountMobileElement.textContent = count === 1 ? `${count} user online` : `${count} users online`;
}
}



// Rest of your code remains unchanged...
const emoticonMap = {
    ":)": "111.png",
    ":(": "112.png",
    ":|": "113.png",
    ":beer:": "114.png",
    ":love:": "115.png"
    // Add more mappings as needed
};
//width: 82px;
//height: 63px;
const emoticonMapg = {
    ":matrix:": "matrix.gif",
    ":c4:": "c4.gif",
        ":thug:": "thug.gif",
        ":pot:": "pot.gif"
    // Add more mappings as needed
};
function replaceEmoticonsWithgifs(message) {
    // Iterate over the emoticon map
    for (const [emoticong, imageFileg] of Object.entries(emoticonMapg)) {
        // Replace each emoticon with an <img> tag
        const imagePathg = `MSN/${imageFileg}`;
        const imgTagg = `<img src="${imagePathg}" alt="${emoticong}" style="width: 65px; height: 48px;">`;
        message = message.replace(new RegExp(escapeRegExp(emoticong), 'g'), imgTagg);
    }
    return message;
}
function replaceEmoticonsWithImages(message) {
    // Iterate over the emoticon map
    for (const [emoticon, imageFile] of Object.entries(emoticonMap)) {
        // Replace each emoticon with an <img> tag
        const imagePath = `MSN/${imageFile}`;
        const imgTag = `<img src="${imagePath}" alt="${emoticon}" style="width: 14px; height: 14px;">`;
        message = message.replace(new RegExp(escapeRegExp(emoticon), 'g'), imgTag);
    }
    return message;
}
// Helper function to escape special characters in regex
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}


// Function to generate a random nickname
function generateRandomNickname() {
    const adjectives = ['Cool', 'Funny', 'Smart', 'Brave', 'Quick', 'Witty', 'Happy', 'Lucky', 'Gentle', 'Wild'];
    const nouns = ['Cat', 'Dog', 'Fox', 'Bear', 'Wolf', 'Lion', 'Tiger', 'Eagle', 'Hawk', 'Owl'];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${randomAdjective}${randomNoun}${Math.floor(Math.random() * 100)}`; // Add a random number for uniqueness
}

// If the nickname is not provided, generate a random one
if (!nickname) {
    nickname = generateRandomNickname();
}

// Now you can use the `nickname` variable in your WebSocket connection logic

let isUIReset = false; // Flag to track if the UI has been reset on disconnect
let isUserInteracted = false; // Flag to track if the user has interacted with the page
let reconnectAttempts = 0; // Counter for reconnection attempts
const maxReconnectAttempts = 5; // Maximum number of reconnection attempts
const reconnectDelay = 5000; // Delay between reconnection attempts in milliseconds

function resetChatUI() {
    if (isUIReset) return; // If the UI has already been reset, do nothing

    // Clear the nicklist
    const nicklistUsers = document.getElementById('nicklist-users');
    nicklistUsers.innerHTML = '';

    // Reset the user count to 0
    const userCountElement = document.getElementById('user-count');
    userCountElement.textContent = '0 users online';

    // Clear the chat box and reset it to its original state
    const chatBox = document.querySelector('.chat-box');
    chatBox.innerHTML = '<p id="message1"></p><p id="message2" style="display: none;">Connected!</p>';

    // Add a message indicating lost connection and reconnecting
    const disconnectMessage = document.createElement('p');
    disconnectMessage.textContent = 'lost connection to server, reconnecting...';
    disconnectMessage.style.color = 'green'; // Set the text color to green
    chatBox.appendChild(disconnectMessage);

    isUIReset = true; // Set the flag to true after resetting the UI
}



let isSoundPlaying = false; // Flag to track if a sound is currently playing
const soundQueue = []; // Queue to store sounds that need to be played after the current sound finishes

function playSound(soundId) {
    console.log(`Attempting to play sound: ${soundId}`);
    if (isUserInteracted) {
        const sound = document.getElementById(soundId);
        if (sound) {
            console.log(`Sound element found: ${soundId}`);

            // If a sound is already playing, add this sound to the queue
            if (isSoundPlaying) {
                console.log(`Sound is already playing. Adding ${soundId} to the queue.`);
                soundQueue.push(soundId);
            } else {
                // No sound is playing, play this sound immediately
                isSoundPlaying = true;
                sound.volume = 1.0;
                sound.play().catch(error => {
                    console.error("Audio playback failed:", error);
                    isSoundPlaying = false; // Reset the flag if playback fails
                    playNextSound(); // Attempt to play the next sound in the queue
                });

                // Listen for the 'ended' event to handle the next sound in the queue
                sound.addEventListener('ended', () => {
                    console.log(`Sound ${soundId} finished playing.`);
                    isSoundPlaying = false;
                    playNextSound(); // Play the next sound in the queue
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
        const nextSoundId = soundQueue.shift(); // Get the next sound from the queue
        console.log(`Playing next sound in queue: ${nextSoundId}`);
        playSound(nextSoundId); // Play the next sound
    }
}
// Detect user interaction to enable sound playback and reset reconnection attempts
document.addEventListener('click', () => {
    if (!isUserInteracted) {
        isUserInteracted = true;
        console.log('User has interacted with the page. Sound is now enabled.');
    }

    // Reset reconnection attempts if max attempts were reached
    if (reconnectAttempts >= maxReconnectAttempts) {
        reconnectAttempts = 0; // Reset the reconnection attempts counter
        console.log('User interacted with the page. Resetting reconnection attempts.');
        connectWebSocket(); // Try reconnecting again
    }
});

document.addEventListener('keypress', () => {
    if (!isUserInteracted) {
        isUserInteracted = true;
        console.log('User has interacted with the page. Sound is now enabled.');
    }

    // Reset reconnection attempts if max attempts were reached
    if (reconnectAttempts >= maxReconnectAttempts) {
        reconnectAttempts = 0; // Reset the reconnection attempts counter
        console.log('User interacted with the page. Resetting reconnection attempts.');
        connectWebSocket(); // Try reconnecting again
    }
});

function connectWebSocket() {
    console.log('Attempting to connect WebSocket...');

    // Add the "connecting to server..." message below the disconnect message
    const chatBox = document.querySelector('.chat-box');
    const connectingMessage = document.createElement('p');
    connectingMessage.textContent = 'connecting to server...';
    connectingMessage.style.color = 'green'; // Set the text color to green
    chatBox.appendChild(connectingMessage);

    wss = new WebSocket('wss://chat.saintsrow.net/ws/');

    wss.onopen = () => {
        console.log('✅ WebSocket connection established');
        reconnectAttempts = 0; // Reset reconnection attempts on successful connection
        isUIReset = false; // Reset the flag on successful connection

        // Display the "Connected!" message in red
        const connectedMessage = document.createElement('p');
        connectedMessage.textContent = 'Connected!';
        connectedMessage.style.color = 'red'; // Set the text color to red
        chatBox.appendChild(connectedMessage);

        // Play the connected sound if the user has interacted
      //  playSound('connected-sound');

        // Determine whether to CREATE or JOIN
        if (category && channelTopic && ownerkey && language && profanityFilter) {
            // Send a CREATE message (only include channelTopic if it exists)
            const createMessage = {
                type: 'CREATE',
                nickname: nickname,
                category: category,
                channelName: channelName,
                language: language,
                profanityFilter: profanityFilter,
                ownerkey: ownerkey
            };

            // Add channelTopic only if it's not empty
            if (channelTopic) {
                createMessage.channelTopic = channelTopic;
            }

            wss.send(JSON.stringify(createMessage));
        } else {
            // Send a JOIN message (use the channelName from the URL parameter)
            wss.send(JSON.stringify({
                type: 'JOIN',
                nickname: nickname,
                channelName: channelName // Use the channelName from the URL parameter
            }));
        }
    };

 // Inside the WebSocket message handler (wss.onmessage)


 function parseModeParams(params) {
    const channel = params[0]; // Channel name
    const mode = params[1]; // Mode (e.g., +o, +v)
    const targetNick = params[2]; // Target nickname

    return { channel, mode, targetNick };
}


 wss.onmessage = (event) => {
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

        // Handle channel modes
      //  console.log("channel mode " + ArrayRaws[1]);
    if (ArrayRaws[0].startsWith('%#')) {
            let MChannel = ArrayRaws[0];
            switch (mode) {
                case '+q': // Owner
                // Store the current role before promoting to owner
            //    previousRoles[targetNick] = userRoles[targetNick] || 'spectator';
                userRoles[targetNick] = 'owner';
                break;
            case '+o': // Host
                // Store the current role before promoting to host
    //    previousRoles[targetNick] = userRoles[targetNick] || 'spectator';
                userRoles[targetNick] = 'host';
                break;
            case '+v': // Participant
                isParticipant[targetNick] = true;
                if (userRoles[targetNick] !== 'owner' && userRoles[targetNick] !== 'host') {
                 //   userRoles[targetNick] = 'participant';
                }
                break;
            case '-v': // Spectator
            isParticipant[targetNick] = false;
                if (userRoles[targetNick] !== 'owner' && userRoles[targetNick] !== 'host') {
                  //  userRoles[targetNick] = 'spectator';
                }
                break;
            case '-o': // Remove host
                // Revert to the previous role if available, otherwise set to spectator
                if (isParticipant[targetNick]) {
                    userRoles[targetNick] = 'participant';
                    }
                // Clear the previous role after demotion
              //  delete previousRoles[targetNick];
                break;
            case '-q': // Remove owner
            if (isParticipant[targetNick]) {
            userRoles[targetNick] = 'participant';
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
            populateNicklist(users);
            handleModeChange(nick, targetNick, mode);
            addModeChange(nick, targetNick, mode); // Add the mode change to the queue
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
        document.querySelector('.chat-box').appendChild(messageElement);

        // Scroll to the bottom of the chat box
        const chatBox = document.querySelector('.chat-box');
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
        document.querySelector('.chat-box').appendChild(systemMessage);
    
        // Scroll to bottom
        const chatBox = document.querySelector('.chat-box');
        chatBox.scrollTop = chatBox.scrollHeight;
    
        // (Optional) Play sound
        // playSound('notice-sound');
    }
    
    
    
    else if (data.type === 'system') {
    // Handle system messages (JOIN, PART, QUIT)
// Handle join event
if (data.event === 'join' || data.event === 'part' || data.event === 'quit' || data.event === 'kick') {
  //  updateUserCount(data.userCount); // Update the user count
}
if (data.event === 'join' && data.nickname !== nickname) {
    userRoles[data.nickname] = 'member'; // Default role for new users
    isParticipant[data.nickname] = false; // Default to false for new users
    populateNicklist(Object.keys(userRoles)); // Refresh the nicklist
    //updateUserCount(data.userCount);

    const systemMessage = document.createElement('p');
    systemMessage.textContent = `› ${data.nickname} has joined the channel`;
    systemMessage.style.color = 'gray';
    systemMessage.classList.add('glitchy-fade-in');
    document.querySelector('.chat-box').appendChild(systemMessage);

    const chatBox = document.querySelector('.chat-box');
    chatBox.scrollTop = chatBox.scrollHeight;
    playSound('join-sound');
}

// Handle part or quit event
if (data.event === 'part' || data.event === 'quit') {
    console.log('WebSocket data:', data);
    delete userRoles[data.nickname];
    delete isParticipant[data.nickname];
    populateNicklist(Object.keys(userRoles)); // Refresh the nicklist

    const systemMessage = document.createElement('p');
    systemMessage.textContent = data.event === 'part'
        ? `‹ ${data.nickname} has left the channel`
        : `‹ ${data.message}`;
    systemMessage.style.color = 'gray';
    document.querySelector('.chat-box').appendChild(systemMessage);

    const chatBox = document.querySelector('.chat-box');
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Handle kick event
if (data.event === 'kick') {
    delete userRoles[data.knickname];
    delete isParticipant[data.knickname];
    populateNicklist(Object.keys(userRoles)); // Refresh the nicklist

    const systemMessage = document.createElement('p');
    systemMessage.textContent = data.message;
    systemMessage.style.fontWeight = 'bold';
    systemMessage.style.color = '#FF0000';
   document.querySelector('.chat-box').appendChild(systemMessage);

    const chatBox = document.querySelector('.chat-box');
    chatBox.scrollTop = chatBox.scrollHeight;
    if (data.knickname === nickname) {
        playSound('kick-sound2');
    const sendbut =  document.querySelector('#send-button');
    sendbut.innerHTML = "rejoin";
    Object.keys(userRoles).forEach(key => delete userRoles[key]);
    updateUserCount(0);
    const nicklistUsers = document.getElementById('nicklist-users');
    nicklistUsers.innerHTML = ''; // Clear existing list
    sendbut.removeEventListener('click', sendMessage);
    sendbut.addEventListener('click', handleRejoin);

    }
    else {
        playSound('kick-sound');
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

    document.querySelector('.chat-box').appendChild(topicElement);

    // Scroll to the bottom of the chat box
    const chatBox = document.querySelector('.chat-box');
    chatBox.scrollTop = chatBox.scrollHeight;
}
if (data.type === 'nicklist-count') {
    console.log('👥 Nicklist count received:', data.users);
    updateUserCount(data.userCount);
}
    if (data.type === 'nicklist') {
        console.log('👥 Nicklist data received:', data.users);

        // Clear the existing userRoles object
        Object.keys(userRoles).forEach(key => delete userRoles[key]);
        // Process each user in the nicklist
        data.users.forEach(user => {
            // Remove leading colon if present
            if (user.startsWith(':')) {
                user = user.substring(1);
            }
    
            // Assign roles based on prefixes
            if (user.startsWith('.')) {
                user = user.substring(1);
                userRoles[user] = 'owner'; // Owner (mode +q)
            } else if (user.startsWith('@')) {
                user = user.substring(1);
                userRoles[user] = 'host'; // Host (mode +o)
            } else if (user.startsWith('+')) {
                user = user.substring(1);
                userRoles[user] = 'participant'; // Participant (mode +v)
            } else {
                userRoles[user] = 'member'; // Spectator (no prefix or mode -v)
            }
        });
    
        // Populate the nicklist with the updated roles
        populateNicklist(data.users);
        updateUserCount(data.userCount);
    }
};
    wss.onclose = (event) => {
        console.log('❌ WebSocket closed:', event.code, event.reason);

        // Reset the UI on disconnect (only if it hasn't been reset already)
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



// Function to populate the nicklist
/* function populateNicklist(users) {
    const nicklistUsers = document.getElementById('nicklist-users');
    nicklistUsers.innerHTML = ''; // Clear existing list

    // Group nicknames by their roles
    const groups = {
        owner: [], // Owners (mode +q)
        host: [],  // Hosts (mode +o)
        participant: [], // Participants (mode +v)
        spectator: [] // Spectators (mode -v or no mode)
    };

    // Iterate through the users and categorize them based on their roles in userRoles
    users.forEach(user => {
        const role = userRoles[user] || 'spectator'; // Default to spectator if role is not set
        groups[role].push(user);
    });

    // Sort each group alphabetically
    groups.owner.sort((a, b) => a.localeCompare(b));
    groups.host.sort((a, b) => a.localeCompare(b));
    groups.participant.sort((a, b) => a.localeCompare(b));
    groups.spectator.sort((a, b) => a.localeCompare(b));

    // Combine the groups in the specified order
    const sortedUsers = [
        ...groups.owner,
        ...groups.host,
        ...groups.participant,
        ...groups.spectator
    ];

    // Display the sorted nicknames
    sortedUsers.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user;

        // Add the appropriate role class
        if (groups.owner.includes(user)) {
            li.classList.add('owner');
        } else if (groups.host.includes(user)) {
            li.classList.add('host');
        } else if (groups.participant.includes(user)) {
            li.classList.add('participant');
        } else if (groups.spectator.includes(user)) {
            li.classList.add('spectator');
        }

        nicklistUsers.appendChild(li);
    });

    console.log('Nicklist updated with roles:', groups); // Debugging
} */


    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const hostKeywordModal = document.getElementById('host-keyword-modal');
    const closeModal = document.querySelector('.close-modal');
    const cancelHostKeyword = document.getElementById('cancel-host-keyword');
    const submitHostKeyword = document.getElementById('submit-host-keyword');
    const hostKeywordInput = document.getElementById('host-keyword-input');

    sendButton.addEventListener('click', () => {
        sendMessage();
    });
    function handleRejoin() {
       // Revert the button text back to the original state
       sendButton.innerHTML = originalSendButtonText;

       sendRawCommand("//JOIN #");
       // Reattach the original sendMessage functionality
       sendButton.removeEventListener('click', handleRejoin);
       sendButton.addEventListener('click', sendMessage);
   }
    const originalSendButtonText = sendButton.innerHTML;
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            if (message.startsWith('/')) {
                if (message === '/pass') {
                    // Show the host keyword modal
                    hostKeywordModal.style.display = 'block';
                } else {
                    // Handle other commands
                    const commands = message.split(' | ');
                    commands.forEach(command => {
                        if (command.startsWith('//')) {
                            let channelNameX = `%#${channelName.replace(/\s+/g, '\\b')}`;
                            const rawCommand = command.replace('//', '/').replace(/#/g, `${channelNameX}`);
                            sendRawCommand(rawCommand);
                        } else if (command.startsWith('/')) {
                            sendRawCommand(command);
                        } else {
                            sendNormalMessage(command);
                        }
                    });
                }
            } else {
                // Normal message handling
                sendNormalMessage(message);
            }

            // Clear the input field
            chatInput.value = '';
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
            if (wss && wss.readyState === WebSocket.OPEN) {
                wss.send(JSON.stringify({
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

    function sendRawCommand(command) {
        if (wss && wss.readyState === WebSocket.OPEN) {
            wss.send(JSON.stringify({
                type: 'CMDRAW',
                command: command
            }));
        }
    }

    function sendNormalMessage(message) {
        const messageWithEmoticons = replaceEmoticonsWithImages(message);
        const messageWithEmoticonsAndGifs = replaceEmoticonsWithgifs(messageWithEmoticons);
        const messageElement = document.createElement('p');
        messageElement.innerHTML = `<strong style="color: darkblue;">${nickname}:</strong> ${messageWithEmoticonsAndGifs}`;
        document.querySelector('.chat-box').appendChild(messageElement);
        const chatBox = document.querySelector('.chat-box');
        chatBox.scrollTop = chatBox.scrollHeight;
        if (wss && wss.readyState === WebSocket.OPEN) {
            wss.send(JSON.stringify({
                type: 'MESSAGE',
                content: message
            }));
        }
    }
    document.getElementById('channel-name').textContent = channelName;
    if (sessionStorage.getItem('hasInteracted') === 'true') {
        isUserInteracted = true;
        console.log('User has interacted with the previous page.');
        playSound('Door-sound');
        // You can restore the state or update the UI accordingly
    }
    // Connect to the WebSocket server
    connectWebSocket();
})
function openSection(sectionName, elmnt) {
    // Hide all tab content
    const tabcontent = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Remove the "active" class from all tab links
    const tablinks = document.getElementsByClassName("tablink");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab content and mark the button as active
    const sectionElement = document.getElementById(sectionName);
    if (sectionElement) {
        sectionElement.style.display = "contents";
    }

    if (elmnt) {
        elmnt.className += " active";
    }

    // If switching to the ChatWindow, ensure the WebSocket connection is active
    if (sectionName === "ChatWindow") {
        //switchChannel("ChatWindow, this");
        if (!wss || wss.readyState !== WebSocket.OPEN) {
          //  connectWebSocket(); // Reconnect WebSocket if necessary
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // Update the channel name in the UI

});

document.addEventListener('DOMContentLoaded', function () {

});

// Add this to your existing client-side JavaScript

// Function to send a PART command to the IRC server
function partChannel() {
    if (wss && wss.readyState === WebSocket.OPEN) {
        wss.send(JSON.stringify({
            type: 'PART', // Indicate this is a PART command
            channel: channelName // The channel to part from
        }));
    }
}

// Listen for the beforeunload event to part the channel when the user leaves the page
window.addEventListener('beforeunload', (event) => {
    console.log('User is leaving the page. Parting channel...');
    partChannel(); // Send the PART command to the server
});

// Listen for the pagehide event (for mobile browsers)
window.addEventListener('pagehide', (event) => {
    console.log('User is leaving the page. Parting channel...');
    partChannel(); // Send the PART command to the server
});

document.addEventListener('DOMContentLoaded', () => {
    const nicklistUsers = document.getElementById('nicklist-users');
    let isDragging = false;
    let startIndex = -1;
    let endIndex = -1;

    // Function to handle mouse down event
    nicklistUsers.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'LI') {
            // Check if Ctrl key is pressed
            if (!e.ctrlKey) {
                // If Ctrl is not pressed, clear previous selections
                clearSelection();
            }

            isDragging = true;
            startIndex = Array.from(nicklistUsers.children).indexOf(e.target);
            endIndex = startIndex;
            toggleSelection(e.target); // Select the clicked item
            e.preventDefault(); // Prevent text selection
        }
    });

    // Function to handle mouse move event for drag-select
    nicklistUsers.addEventListener('mousemove', (e) => {
        if (isDragging && e.target.tagName === 'LI') {
            endIndex = Array.from(nicklistUsers.children).indexOf(e.target);
            updateSelection();
            e.preventDefault(); // Prevent default behavior
        }
    });

    // Function to handle mouse up event (stop dragging)
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Ctrl + Click for selective selection
    nicklistUsers.addEventListener('click', (e) => {
        if (e.ctrlKey && e.target.tagName === 'LI') {
            toggleSelection(e.target); // Toggle selection for the clicked item
            e.preventDefault(); // Prevent default behavior
        }
    });

    // Function to toggle selection for an element
    function toggleSelection(element) {
        if (element.tagName === 'LI') {
            element.classList.toggle('selected');
        }
    }

    // Function to clear all selections
    function clearSelection() {
        const selectedUsers = nicklistUsers.querySelectorAll('.selected');
        selectedUsers.forEach(user => user.classList.remove('selected'));
    }

    // Function to update selection when dragging
    function updateSelection() {
        const items = Array.from(nicklistUsers.children);
        const [min, max] = [Math.min(startIndex, endIndex), Math.max(startIndex, endIndex)];
        for (let i = min; i <= max; i++) {
            items[i].classList.add('selected');
        }
    }

    // Add a click event listener to the nicklist container
    const nicklist = document.getElementById('nicklist');
    nicklist.addEventListener('click', (e) => {
        // Check if the click occurred outside the nicklist-users element
        if (!nicklistUsers.contains(e.target)) {
            // Clear the selection from all names
            clearSelection();
        }
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const nicklist = document.getElementById('nicklist'); // Get the nicklist container
    const nicklistUsers = document.getElementById('nicklist-users'); // Get the nicklist-users container

    // Add a click event listener to the nicklist container
    nicklist.addEventListener('click', (e) => {
        // Check if the click occurred outside the nicklist-users element
        if (!nicklistUsers.contains(e.target)) {
            // Clear the selection from all names
            clearSelection();
        }
    });

    // Add a touch event listener for mobile devices
    nicklist.addEventListener('touchend', (e) => {
        // Check if the touch occurred outside the nicklist-users element
        if (!nicklistUsers.contains(e.target)) {
            // Clear the selection from all names
            clearSelection();
        }
    });

    // Function to clear all selections
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

    // Show context menu on right-click (desktop) or long press (mobile)
    nicklistUsers.addEventListener('contextmenu', handleContextMenu);
    nicklistUsers.addEventListener('touchstart', handleTouchStart);
    nicklistUsers.addEventListener('touchmove', handleTouchMove);
    nicklistUsers.addEventListener('touchend', handleTouchEnd);

    function handleContextMenu(e) {
        if (e.target.tagName === 'LI') {
            e.preventDefault(); // Prevent default context menu
            showContextMenu(e);
        }
    }

    function handleTouchStart(e) {
        if (e.touches.length === 1) { // Single touch
            touchTarget = e.target;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;

            // Start a timer to detect long press
            touchTimer = setTimeout(() => {
                if (touchTarget.tagName === 'LI') {
                    showContextMenu(e.touches[0]);
                }
            }, 500); // Long press duration (500ms)
        }
    }

    function handleTouchMove(e) {
        if (e.touches.length === 1) {
            // Cancel the long press if the user moves their finger
            const touch = e.touches[0];
            const deltaX = Math.abs(touch.clientX - touchStartX);
            const deltaY = Math.abs(touch.clientY - touchStartY);

            if (deltaX > 10 || deltaY > 10) { // Tolerance for slight movement
                clearTimeout(touchTimer);
            }
        }
    }

    function handleTouchEnd(e) {
        clearTimeout(touchTimer); // Clear the timer if the touch ends quickly
    }

    function showContextMenu(event) {
        const offsetX = 20; // Offset from the right edge

        // Position the context menu
        const menuWidth = contextMenu.offsetWidth;
        const menuHeight = contextMenu.offsetHeight;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let left = (event.pageX || event.touches[0].pageX);
        let top = (event.pageY || event.touches[0].pageY);

        // Adjust position if the menu would go off the right edge
        if (left + menuWidth > viewportWidth) {
            left = viewportWidth - menuWidth - offsetX; // Add offset to pull it more to the left
        }

        // Adjust position if the menu would go off the bottom edge
        if (top + menuHeight > viewportHeight) {
            top = viewportHeight - menuHeight;
        }

        contextMenu.style.display = 'block';
        contextMenu.style.left = `${left}px`;
        contextMenu.style.top = `${top}px`;

        // Store selected users
        const selectedUsers = Array.from(nicklistUsers.querySelectorAll('.selected'));
        if (!selectedUsers.includes(event.target)) {
            // Clear previous selection if Ctrl or Shift is not pressed
            selectedUsers.forEach(user => user.classList.remove('selected'));
            event.target.classList.add('selected');
        }
    }

    // Hide context menu on click or touch outside
    document.addEventListener('click', hideContextMenu);
    document.addEventListener('touchend', hideContextMenu);

    function hideContextMenu(e) {
        if (!contextMenu.contains(e.target)) {
            contextMenu.style.display = 'none';
        }
    }

   

    // Handle context menu actions
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
                return; // No command to send for viewing profile
            case 'whisper':
                const whisperMessage = prompt(`Whisper to ${selectedUsers.join(', ')}:`, ''); // Prompt for the whisper message
                if (whisperMessage) {
                    commandPrefix = '//privmsg ';
                    commandSuffix = ` :${whisperMessage}`;
                } else {
                    return; // Cancel if no message is provided
                }
                break;
            case 'ignore':
                console.log('Ignore:', selectedUsers);
                return; // Ignore is not sent to the server
            case 'tagUser':
                console.log('Tag User:', selectedUsers);
                return; // Tag user is not sent to the server
            case 'localTime':
                commandPrefix = '//privmsg ';
                commandSuffix = ' :\x01TIME\x01'; // CTCP TIME format
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
                const customReason = prompt(`Enter kick reason for ${selectedUsers.join(', ')}:`, ''); // Prompt for custom reason
                if (customReason) {
                    commandPrefix = '//kick # ';
                    commandSuffix = ` :${customReason}`;
                } else {
                    return; // Cancel if no reason is provided
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
                // console.log(`📤 Sent command for ${user}: ${command}`);
            });
        }
    
        contextMenu.style.display = 'none';
    }
});
function applyTransporterEffect(nickname) {
    const nicklistUsers = document.getElementById('nicklist-users');
    const userElement = Array.from(nicklistUsers.children).find(li => li.textContent === nickname);

    if (userElement) {
        // Step 1: Fade out the nickname and its background image
     //   userElement.classList.add('fade-out');

        // Step 2: Wait for the fade-out animation to complete
        setTimeout(() => {
            // Remove the nickname from the DOM entirely
          //   userElement.remove();

            // Step 3: Rebuild the nicklist (this will create an empty slot where the nickname used to be)
            populateNicklist(Object.keys(userRoles));

            // Step 4: Find the updated user element
            const updatedUserElement = Array.from(nicklistUsers.children).find(li => li.textContent === nickname);
            if (updatedUserElement) {
                // Hide the nickname initially (set opacity to 0)
               //  updatedUserElement.style.opacity = '0';

                // Step 5: Trigger the fade-in animation after a slight delay
                setTimeout(() => {
                   // updatedUserElement.classList.add('fade-in');
                   // updatedUserElement.style.opacity = '1'; // Ensure it's visible after the animation

                    // Step 6: Remove the fade-in class after the animation completes
                    setTimeout(() => {
                   //     updatedUserElement.classList.remove('fade-in');
                    }, 0); // Match the duration of the fade-in animation
                }, 0); // Small delay to ensure the element is hidden before fading in
            }
        }, 0); // Match the duration of the fade-out animation
    }
}

function switchChannel() {
    // Get the selected channel from the dropdown
    const selectedChannel = document.getElementById('channel-switcher').value;

    // Update the channel name displayed in the chat
    document.getElementById('channel-name').textContent = selectedChannel;

    // You can also update the chat messages, user list, etc., based on the selected channel
    // For now, let's just log the selected channel to the console
    console.log('Switched to channel:', selectedChannel);

    // Here you can add additional logic to load the chat history, users, etc., for the selected channel
    // For example, you might make an AJAX request to fetch the chat history for the new channel
    // fetch(`/api/chat/${selectedChannel}`)
    //     .then(response => response.json())
    //     .then(data => {
    //         // Update the chat messages with the new data
    //     });
}

document.addEventListener('DOMContentLoaded', () => {
    // Set the default section to RoomList when the page loads
  //  openSection("RoomList", document.querySelector('.tablink'));

    // Update the channel name in the UI
    document.getElementById('channel-name').textContent = channelName;
    if (channelName) {
        openSection("ChatWindow", this)
        document.querySelector('select').value = 'ChatWindow'; // Set "Option 2" as the default
    }
    // Add an event listener to the channel switcher dropdown
    const channelSwitcher = document.getElementById('channel-switcher');
    if (channelSwitcher) {
        channelSwitcher.addEventListener('change', function () {
            const selectedSection = this.value; // Get the selected value (RoomList or ChatWindow)
            openSection(selectedSection, this);
        });
    }

    // Connect to the WebSocket server (optional, depending on your use case)
   // connectWebSocket();
});


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

// Rest of your existing JavaScript
let ws = new WebSocket('wss://chat.saintsrow.net/rm');
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

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && (!wss || wss.readyState !== WebSocket.OPEN)) {
        console.log('Tab is visible again. Reconnecting WebSocket...');
        connectWebSocket();
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
requestWakeLock(); // Request Wake Lock on page load