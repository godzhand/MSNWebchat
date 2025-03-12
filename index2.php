<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Combined Chat Application</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="tabs">
        <button class="tablink" onclick="openSection('RoomList', this)">Room List</button>
        <button class="tablink" onclick="openSection('ChatWindow', this)">Chat Window</button>
        <button class="tablink" onclick="openSection('CreateChannel', this)">Create Channel</button>
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

    <div id="ChatWindow" class="tabcontent" style="display:none;">
        <!-- Chat Window Section -->
        <div class="chatroom-header">
            <button class="chatroom-toggle-nicklist desktop-only" onclick="toggleNicklist()">☰</button>
            <div class="chatroom-channel-name" id="channel-name">Channel Name</div>
            <div id="user-count">0 users online</div>
            <button class="chatroom-toggle-nicklist mobile-only" onclick="toggleNicklist()">☰</button>
        </div>
        <div class="chatroom-chat-container">
            <div class="chatroom-chat-box">
                <p id="message1"></p>
                <p id="message2" style="display: none;">Connected!</p>
            </div>
        </div>
        <div class="chatroom-chat-input-container">
            <input type="text" id="chatroom-chat-input" placeholder="Type your message here..." />
            <div id="user-count-mobile">0 users online</div>
            <button id="chatroom-send-button">Send</button>
        </div>
        <div id="host-keyword-modal" class="chatroom-modal">
            <div class="chatroom-modal-content">
                <span class="chatroom-close-modal">&times;</span>
                <h2>Log in as Host</h2>
                <p>Enter the host keyword for this room:</p>
                <input type="password" id="chatroom-host-keyword-input" placeholder="Enter the host keyword..." />
                <div class="chatroom-modal-buttons">
                    <button id="submit-host-keyword" class="chatroom-win2k-btn">OK</button>
                    <button id="cancel-host-keyword" class="chatroom-win2k-btn">Cancel</button>
                </div>
            </div>
        </div>
        <div class="chatroom-nicklist" id="nicklist">
            <h3></h3>
            <ul id="nicklist-users">
                <!-- Nicklist will be populated dynamically -->
            </ul>
        </div>
        <div id="contextMenu" class="chatroom-context-menu">
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
    </div>

    <div id="CreateChannel" class="tabcontent" style="display:none;">
        <!-- Create Channel Section -->
        <div class="createchannel-container">
            <div class="createchannel-return-link">
                <a href="#" onclick="openSection('RoomList', document.querySelector('.tablink'))">Return to Channel List</a>
            </div>
            <h1 class="createchannel-h1"></h1>
            <form id="channel-form" action="chatroom.php" method="POST">
                <div class="createchannel-form-section">
                    <div class="createchannel-horizontal-group">
                        <div class="createchannel-form-group">
                            <label for="category">Select Category:</label>
                            <select id="category" name="category">
                                <option value="Computing">Computing</option>
                                <option value="Conspiracies">Conspiracies</option>
                                <option value="Gaming">Gaming</option>
                                <option value="General" selected>General</option>
                                <option value="News">News</option>
                                <option value="Politics">Politics</option>
                            </select>
                        </div>
                        <div class="createchannel-form-group">
                            <label for="language">Language:</label>
                            <select id="language" name="language" required>
                                <option value="English">English</option>
                                <option value="French">French</option>
                                <option value="German">German</option>
                                <option value="Japanese">Japanese</option>
                                <option value="Swedish">Swedish</option>
                                <option value="Dutch">Dutch</option>
                                <option value="Korean">Korean</option>
                                <option value="Chinese (Simplified)">Chinese (Simplified)</option>
                                <option value="Portuguese">Portuguese</option>
                                <option value="Finnish">Finnish</option>
                                <option value="Danish">Danish</option>
                                <option value="Russian">Russian</option>
                                <option value="Italian">Italian</option>
                                <option value="Norwegian">Norwegian</option>
                                <option value="Chinese (Traditional)">Chinese (Traditional)</option>
                                <option value="Spanish">Spanish</option>
                                <option value="Czech">Czech</option>
                                <option value="Greek">Greek</option>
                                <option value="Hungarian">Hungarian</option>
                                <option value="Polish">Polish</option>
                                <option value="Slovene">Slovene</option>
                                <option value="Turkish">Turkish</option>
                                <option value="Slovak">Slovak</option>
                                <option value="Portuguese (Brazilian)">Portuguese (Brazilian)</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="createchannel-form-section">
                    <div class="createchannel-form-group">
                        <label for="channel-name">Channel Name:</label>
                        <input type="text" id="channel-name" name="channel-name" placeholder="Enter channel name" required>
                    </div>
                </div>
                <div class="createchannel-form-section">
                    <div class="createchannel-form-group">
                        <label for="channel-topic">Topic of the Channel:</label>
                        <textarea id="channel-topic" name="channel-topic" placeholder="Enter the topic of the channel" required></textarea>
                    </div>
                </div>
                <div class="createchannel-form-section">
                    <div class="createchannel-horizontal-group">
                        <div class="createchannel-form-group">
                            <label for="ownerkey">Ownerkey:</label>
                            <input type="text" id="ownerkey" name="ownerkey" placeholder="Generating..." readonly>
                            <div class="createchannel-tooltip" id="ownerkey-tooltip">Copied to clipboard!</div>
                        </div>
                        <div class="createchannel-form-group">
                            <label for="profanity-filter">Profanity Filter:</label>
                            <select id="profanity-filter" name="profanity-filter" required>
                                <option value="disabled" selected>Disabled</option>
                                <option value="enabled">Enabled</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="createchannel-form-section">
                    <div class="createchannel-form-group">
                        <label for="nickname">Nickname:</label>
                        <input type="text" id="nickname" name="nickname">
                    </div>
                </div>
                <div class="createchannel-navigation-buttons">
                    <button type="submit">Create Channel</button>
                </div>
            </form>
        </div>
    </div>

    <script>
        function openSection(sectionName, elmnt) {
            var i, tabcontent, tablinks;
            tabcontent = document.getElementsByClassName("tabcontent");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "none";
            }
            tablinks = document.getElementsByClassName("tablink");
            for (i = 0; i < tablinks.length; i++) {
                tablinks[i].className = tablinks[i].className.replace(" active", "");
            }
            document.getElementById(sectionName).style.display = "block";
            elmnt.className += " active";
        }

        // Open the default section
        document.querySelector('.tablink').click();
    </script>
    <script src="app.js"></script>
</body>
</html>