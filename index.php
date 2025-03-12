<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title></title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .container {
            width: 100%;
            max-width: 1200px;
            background: #fff;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            display: flex;
            flex-direction: column;
        }
        h1, h2 {
            text-align: center;
            color: #333;
        }
        h1 {
            font-size: 2.5em;
            margin: 0;
        }
        h2 {
            font-size: 2em;
            margin: 20px 0;
        }
        .category-dropdown {
            margin-bottom: 10px;
        }
        .category-dropdown select {
            padding: 10px;
            font-size: 1.2em;
            border-radius: 4px;
            border: 1px solid #ddd;
            width: 100%;
            max-width: 400px;
        }
        .create-channel-link {
            text-align: center;
            margin-bottom: 20px;
        }
        .create-channel-link a {
            font-size: 0.9em;
            color: #0078d7;
            text-decoration: none;
            cursor: pointer;
        }
        .create-channel-link a:hover {
            text-decoration: underline;
        }
        .room-list {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            flex-grow: 1;
            overflow-x: auto;
        }
        .room-list th, .room-list td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #ddd;
            font-size: 1.1em;
        }
        .room-list th {
            background-color: #f8f8f8;
            font-size: 1.2em;
        }
        .room-list tr {
            background-color: #e3e3d270; /* Pinkish tan */
        }
        .room-list tr:nth-child(even) {
            background-color: #feffed; /* Darker tan for even rows */
        }
        .room-list tr:hover {
            background-color: rgba(255, 255, 255, 0.9);
        }
        .pagination, .pagination2 {
            text-align: center;
            margin-top: 20px;

        }
        .pagination button {
            margin: 9px;
        }
        .pagination {
            margin: 0 10px;
            text-decoration: none;
            color: #333;
            font-size: 1.1em;
            padding: 10px 15px;
            display: inline-block;
            border-radius: 4px;
            transition: background-color 0.3s ease;
        }
        .pagination a, .pagination2 a {
            margin: 0 10px;
            text-decoration: none;
            color: #333;
            font-size: 1.1em;
            padding: 10px 15px;
            display: inline-block;
            border-radius: 4px;
            transition: background-color 0.3s ease;
        }
        .pagination a:hover, .pagination2 a:hover {
            color: #0078d7;
            background-color: #f0f0f0;
        }


        .room-list a {
    text-decoration: none; /* Removes underline */
    color: #0078d7; /* Gives a nice blue color */
    font-weight: bold; /* Makes the text bold */
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; /* Uses a nice font */
    transition: color 0.3s ease; /* Smooth transition on hover */
}

.room-list a:hover {
    color: #005a8a; /* Darker blue on hover */
}

        /* Responsive Design */
        @media (max-width: 858px) {
            .create-channel-link {
                position: relative;
                top: 29px;
            }
            .pagination a, .pagination2 a {
                padding: 8px 12px;
                font-size: 1em;
            }
        }
        @media (max-width: 768px) {
            h1 {
                font-size: 2em;
            }
            h2 {
                font-size: 1.5em;
            }
            .category-dropdown select {
                font-size: 1em;
                padding: 8px;
            }
            .room-list th, .room-list td {
                padding: 10px;
                font-size: 0.9em;
            }
            .room-list th {
                font-size: 1em;
            }
            .pagination a, .pagination2 a {
                padding: 8px 12px;
                font-size: 1em;
            }
        }
        @media (max-width: 480px) {
            h1 {
                font-size: 1.5em;
            }
            h2 {
                font-size: 1.2em;
            }
            .category-dropdown select {
                font-size: 0.9em;
                padding: 6px;
            }
            .room-list th, .room-list td {
                padding: 8px;
                font-size: 0.8em;
            }
            .room-list th {
                font-size: 0.9em;
            }
            .pagination a, .pagination2 a {
                padding: 6px 10px;
                font-size: 0.9em;
            }
        }
        @media (max-width: 385px) {
            .pagination {
                position: relative;
                top: 9px;
                left: 20px;
            }
        }
 
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .container {
            width: 100%;
            max-width: 1200px;
            background: #fff;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            display: flex;
            flex-direction: column;
        }
        h1, h2 {
            text-align: center;
            color: #333;
        }
        h1 {
            font-size: 2.5em;
            margin: 0;
        }
        h2 {
            font-size: 2em;
            margin: 20px 0;
        }
        .category-dropdown {
            margin-bottom: 10px;
        }
        .category-dropdown select {
            padding: 10px;
            font-size: 1.2em;
            border-radius: 4px;
            border: 1px solid #ddd;
            width: 100%;
            max-width: 400px;
        }
        .create-channel-link {
            text-align: center;
            margin-bottom: 20px;
        }
        .create-channel-link a {
            font-size: 0.9em;
            color: #0078d7;
            text-decoration: none;
            cursor: pointer;
        }
        .create-channel-link a:hover {
            text-decoration: underline;
        }
        .room-list {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            flex-grow: 1;
            overflow-x: auto;
        }
        .room-list th, .room-list td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #ddd;
            font-size: 1.1em;
        }
        .room-list th {
            background-color: #f8f8f8;
            font-size: 1.2em;
        }
        .room-list tr {
            background-color: #e3e3d270; /* Pinkish tan */
        }
        .room-list tr:nth-child(even) {
            background-color: #feffed; /* Darker tan for even rows */
        }
        .room-list tr:hover {
            background-color: rgba(255, 255, 255, 0.9);
        }
        .pagination, .pagination2 {
            text-align: center;
            margin-top: 20px;

        }
        .pagination button {
            margin: 9px;
        }
        .pagination {
            margin: 0 10px;
            text-decoration: none;
            color: #333;
            font-size: 1.1em;
            padding: 10px 15px;
            display: inline-block;
            border-radius: 4px;
            transition: background-color 0.3s ease;
        }
        .pagination a, .pagination2 a {
            margin: 0 10px;
            text-decoration: none;
            color: #333;
            font-size: 1.1em;
            padding: 10px 15px;
            display: inline-block;
            border-radius: 4px;
            transition: background-color 0.3s ease;
        }
        .pagination a:hover, .pagination2 a:hover {
            color: #0078d7;
            background-color: #f0f0f0;
        }


        .room-list a {
    text-decoration: none; /* Removes underline */
    color: #0078d7; /* Gives a nice blue color */
    font-weight: bold; /* Makes the text bold */
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; /* Uses a nice font */
    transition: color 0.3s ease; /* Smooth transition on hover */
}

.room-list a:hover {
    color: #005a8a; /* Darker blue on hover */
}

        /* Responsive Design */
        @media (max-width: 858px) {
            .create-channel-link {
                position: relative;
                top: 29px;
            }
            .pagination a, .pagination2 a {
                padding: 8px 12px;
                font-size: 1em;
            }
        }
        @media (max-width: 768px) {
            h1 {
                font-size: 2em;
            }
            h2 {
                font-size: 1.5em;
            }
            .category-dropdown select {
                font-size: 1em;
                padding: 8px;
            }
            .room-list th, .room-list td {
                padding: 10px;
                font-size: 0.9em;
            }
            .room-list th {
                font-size: 1em;
            }
            .pagination a, .pagination2 a {
                padding: 8px 12px;
                font-size: 1em;
            }
        }
        @media (max-width: 480px) {
            h1 {
                font-size: 1.5em;
            }
            h2 {
                font-size: 1.2em;
            }
            .category-dropdown select {
                font-size: 0.9em;
                padding: 6px;
            }
            .room-list th, .room-list td {
                padding: 8px;
                font-size: 0.8em;
            }
            .room-list th {
                font-size: 0.9em;
            }
            .pagination a, .pagination2 a {
                padding: 6px 10px;
                font-size: 0.9em;
            }
        }
        @media (max-width: 385px) {
            .pagination {
                position: relative;
                top: 9px;
                left: 20px;
            }
        }

        /* Add this to your existing CSS */
        .nickname-container {
            margin-bottom: 20px;
            text-align: center;
        }
        .nickname-display {
            font-size: 1.2em;
            font-weight: bold;
            color: #333;
            margin-right: 10px;
        }
        .nickname-edit {
            font-size: 1em;
            padding: 5px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-right: 10px;
        }
        .nickname-save {
            padding: 5px 10px;
            font-size: 1em;
            background-color: #0078d7;
            color: #fff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .nickname-save:hover {
            background-color: #005a8a;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Add this section for the nickname -->
        <div class="nickname-container">
            <span class="nickname-display" id="nicknameDisplay"></span>
            <input type="text" class="nickname-edit" id="nicknameEdit" placeholder="Edit your nickname" style="display: none;">
            <button class="nickname-save" id="nicknameSave" style="display: none;">Save</button>
            <button class="nickname-save" id="nicknameEditButton">Edit Nickname</button>
        </div>

        <!-- Rest of your existing HTML -->
        <h1></h1>
        <div class="pagination">
            <div id="paginationContainer" style="display: none;"></div>
        </div>
        <div class="category-dropdown">
            <label for="category">Select Category:</label>
            <select id="category" name="category">
                <option value="GN">General</option>
                <option value="VG">Gaming</option>
                <option value="C">Computing</option>
                <option value="CT">Conspiracies</option>
                <option value="NW">News</option>
                <option value="PT">Politics</option>
            </select>
        </div>
        <div class="create-channel-link">
            <a href="create2.php">Don't see what you want? Create a channel</a>
        </div>
        <table class="room-list">
            <thead>
                <tr>
                    <th>Users</th>
                    <th>Room Name</th>
                    <th>Topic</th>
                    <th>Language</th>
                </tr>
            </thead>
            <tbody id="roomListBody">
                <!-- Rows will be dynamically populated here -->
            </tbody>
        </table>
    </div>

    <script>
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
let nickname = localStorage.getItem('nickname');
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
    </script>
</body>
</html>