<?php
// Extract the channel name from the URL parameter 'rm'
// Extract the channel name from the URL parameter 'rm'
$channelName = htmlspecialchars($_GET['rm'] ?? $_POST['channel-name']); // Default to 'Unnamed Channel' if not provided

// Extract the nickname from the URL parameter 'nickname'
$nickname = htmlspecialchars($_GET['nickname'] ?? ''); // Default to empty string if not provided

// Extract other parameters from POST data
$category = htmlspecialchars($_POST['category'] ?? 'General');
$channelTopic = htmlspecialchars($_POST['channel-topic'] ?? ''); // Default to empty string
$language = htmlspecialchars($_POST['language'] ?? 'English');
$profanityFilter = htmlspecialchars($_POST['profanity-filter'] ?? 'disabled');
$ownerkey = htmlspecialchars($_POST['ownerkey'] ?? 'No Ownerkey');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Chat Window</title>
    <link rel="stylesheet" href="chatroomxxx.css">
    <link rel="stylesheet" href="styles.css">

</head>
<body>
<div class="switch">
    <select id="channel-switcher">
        <option value="RoomList">Room List</option>
        <option value="ChatWindow">Chat Window</option>
        <!-- Add more channels as needed -->
    </select>
</div>
<div id="RoomList" class="tabcontent">
        <!-- Room List Section -->
        <div class="roomlist-container">
            <div class="roomlist-nickname-container">
                <span class="roomlist-nickname-display" id="nicknameDisplay"></span>
                <input type="text" class="roomlist-nickname-edit" id="nicknameEdit" placeholder="Edit your nickname" style="display: none;">
                <button class="roomlist-nickname-save" id="nicknameSave" style="display: none;">Save</button>
                <button class="roomlist-nickname-save" id="nicknameEditButton">Edit Nickname</button>
            </div>
            <h1 class="roomlist-h1"></h1>
            <div class="roomlist-pagination">
                <div id="paginationContainer" style="display: none;"></div>
            </div>
            <div class="roomlist-category-dropdown">
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
            <div class="roomlist-create-channel-link">
                <a href="#" onclick="openSection('CreateChannel', document.querySelector('.tablink'))">Don't see what you want? Create a channel</a>
            </div>
            <table class="roomlist-room-list">
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
    </div>
    <div id="ChatWindow" class="tabcontent">
    <div class="header">
    <button class="toggle-nicklist desktop-only" onclick="toggleNicklist()">☰</button>
    <div class="channel-name" id="channel-name"></div>
    <!-- Add the dropdown for channel switching -->
    <div id="user-count">0 users online</div> <!-- Keep this for desktop -->
    <button class="toggle-nicklist mobile-only" onclick="toggleNicklist()">☰</button>
</div>

<div class="chat-container">
    <div class="chat-box">
        <p id="message1"></p>
        <p id="message2" style="display: none;">Connected!</p>
    </div>
</div>

<div class="chat-input-container">
    <input type="text" id="chat-input" placeholder="Type your message here..." />
    <button id="send-button">Send</button>
</div>
<div id="host-keyword-modal" class="modal">
    <div class="modal-content">
        <span class="close-modal">&times;</span>
        <h2>Log in as Host</h2>
        <p>Enter the host keyword for this room:</p>
        <input type="password" id="host-keyword-input" placeholder="Enter the host keyword..." />
        <div class="modal-buttons">
            <button id="submit-host-keyword" class="win2k-btn">OK</button>
            <button id="cancel-host-keyword" class="win2k-btn">Cancel</button>
        </div>
    </div>
</div>
<div class="nicklist" id="nicklist">
    <h3></h3>
    <ul id="nicklist-users">
        <!-- Nicklist will be populated dynamically -->
    </ul>
</div>
<!-- Context Menu -->
<div id="contextMenu" class="context-menu">
    <ul>
        <li data-action="viewProfile">View Profile</li>
        <li data-action="whisper">Whisper</li>
        <li data-action="ignore">Ignore</li>
        <li class="separator"></li>
        <li data-action="tagUser">Tag User</li>
        <li data-action="localTime">Local Time</li>
        <li class="submenu">
            Kick
            <ul>
                <li data-action="disruptiveBehavior">Disruptive Behavior</li>
                <li data-action="profanity">Profanity</li>
                <li data-action="scrolling">Scrolling</li>
                <li data-action="customKickBan">Custom Kick/Ban...</li>
            </ul>
        </li>
        <li class="separator"></li>
        <li data-action="host">Host</li>
        <li data-action="participant">Participant</li>
        <li data-action="spectator">Spectator</li>
    </ul>
</div>

    <!-- Audio element for the sound -->
    <audio id="connected-sound">
        <source src="sounds/sounds/WAVE351.mp3" type="audio/mp3">
        Your browser does not support the audio element.
    </audio>
    <audio id="Door-sound">
        <source src="sounds/sounds/door.mp3" type="audio/mp3">
        Your browser does not support the audio element.
    </audio>
    <audio id="join-sound">
        <source src="sounds/sounds/WAVE351.3.mp3" type="audio/mp3">
        Your browser does not support the audio element.
    </audio>
    <audio id="kick-sound">
        <source src="sounds/sounds/kick2.mp3" type="audio/mp3">
        Your browser does not support the audio element.
    </audio>
    <audio id="kick-sound2">
        <source src="sounds/sounds/kick1.mp3" type="audio/mp3">
        Your browser does not support the audio element.
    </audio>
    <script>
        // Pass PHP variables to JavaScript
        const category = "<?php echo $category; ?>";
        const channelName = "<?php echo $channelName; ?>"; // Use the channelName from the URL parameter
        const channelTopic = "<?php echo $channelTopic; ?>"; // Empty string if not provided
        const language = "<?php echo $language; ?>";
        const profanityFilter = "<?php echo $profanityFilter; ?>";
        const ownerkey = "<?php echo $ownerkey; ?>";
        let nickname = "<?php echo $nickname; ?>"; // Use the nickname from the URL parameter
        nickname = nickname.replace(" ","");
    </script>
    <script src="chatroomv2.js"></script>
    <script>
   
        </script>
</div>
</body>
</html>