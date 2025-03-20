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
    <link href="chat.css" rel="stylesheet" type="text/css">
</head>
<body topmargin="0" leftmargin="0" 
oncontextmenu="return false" ondragstart="return false">
 <TABLE BORDER="0" WIDTH="100%" CELLSPACING="0" 
CELLPADDING="0">
  <TR VALIGN="top">
   <TD WIDTH="87%" VALIGN="top">
    <TABLE border=0 cellPadding=0 cellSpacing=0 width=100%>
     <TR>
      <TD><A 
href="http://chat.msn.com/default.msnw" target=_top title="Go to the MSN Chat home 
page."><IMG height=32 align=absmiddle src="MSN\chatlogo.gif" border=0 
></A></TD>
      <TD valign=bottom width=51><IMG src="MSN\sharkfin.gif" width=51 
height=32></TD>
      <TD valign=top class="titleframe" width=100%>
       <TABLE border=0 cellpadding=0 cellspacing=0 width=100%>
        <TR>
         <TD><IMG border=0 height=7 width=100% src="MSN\top_line.gif"></TD>
        </TR>
        <TR>
         <TD>
          <table border=0 cellPadding=0 cellSpacing=0 width=100%>
           <tr>
            <TD align=center width=19 class="roomtitle"><IMG 
src="MSN\star.gif"></TD>
            <TD><td><p class="roomtitle">SomeWhere</p></td>
            <TD class="roomtitle"><IMG 
src="MSN\star.gif"></TD>
           </tr>
          </table>
         </TD>
        </TR>
       </TABLE>
      </TR>
     <TR class="titleframe">
      <TD colspan=2><IMG border=0 width=161 height=6 
src="MSN\left_top_line.gif"></TD>
      <TD><IMG height=1 width=1 src="MSN\pixel1x1.gif" border=0></TD>
     </TR>
     <TR class="titleframe">
      <TD colspan=4>
    <center>
       <TABLE border=0 cellPadding=2 cellSpacing=0>
        <TR>
         <TD><IMG border=0 width=5 height=1 src="MSN\c.gif"></TD>
     	 <TD align=center width=19></TD>
     	 <TD align=center width=19><IMG height=15 width=1 
src="MSN\y1x1.gif"></TD>
         <TD><A class="HeaderLink" href="http://chat.msn.com/default.msnw" target=_top 
title="Go to the MSN Chat home page.">Chat Home</A></TD>
         <TD align=center width=19><IMG height=15 width=1 src="MSN\y1x1.gif"></TD>
         <TD><A class="HeaderLink" href 
="javascript:window.open('http://chat.msn.com/default.msnw'); void('');" title="Connect to 
other rooms from the Chat directory.">More Rooms</A></TD>
         <TD align=center width=19><IMG height=15 width=1 src="MSN\y1x1.gif"></TD>
         <TD><A class="HeaderLink" 
href="javascript:window.open('http://chat.msn.com/friend.msnw?mode=2&code=6225150
0'); void('');" title="Find out if a friend is chatting right now.">Find a Friend</A></TD>
         <TD align=center width=19><IMG height=15 width=1 src="MSN\y1x1.gif"></TD>
         <TD><A class="HeaderLink" 
href="javascript:window.open('http://vipercentral.vze.com/m_options.php','_blank','tool
bar=0,location=0,directories=0,status=0,menubar=0,scrollbars=1,resizable=1,height=420,wi
dth=630'); void('');" title="View and change your chat room options.">Chat Room 
Options</A></TD>
         <TD align=center width=19><IMG height=15 width=1 src="MSN\y1x1.gif"></TD>
         <TD><A class="HeaderLink" href="http://chat.msn.com/default.msnw" target=_top 
title="Leave this chat room.">Exit</A></TD>
         <TD align=center width=19><IMG height=15 width=1 src="MSN\y1x1.gif"></TD>
         <TD><A class="HeaderLink" 
href="javascript:window.open('http://chat.msn.com/PaneHelpFrame.msnw?H_VER=1.7','
_blank','toolbar=0,location=0,directories=0,status=0,men
ubar=0,scrollbars=1,resizable=1,height=542,width=177,Left=610,top=0'); void('');" title="Get 
instructions and tips for using MSNChat.">Help</A></TD>
	     <TD align=center width=19><IMG height=15 width=1 
src="MSN\y1x1.gif"></TD>
         <TD nowrap><A class="HeaderLink" 
href="javascript:window.open('http://chat.msn.com/PaneHelpFrame.msnw?H_VER=1.7&
TOPIC=CHAT_PROC_ProtectYourselfFromHarassment.htm&v1','_blank','toolbar=0,locatio
n=0,directories=0,status=0,menubar=0,s
crollbars=1,resizable=1,height=542,width=177,Left=610,top=0'); void('');" title="Learn how 
to keep other chatters from harrassing you.">Stop Abuse</A></TD>
         <TD align=center width=19><IMG height=15 width=1 src="MSN\y1x1.gif"></TD>
         <TD align=center width=19></TD>
        </TR>
       </TABLE>
    </center>
      </TD>
     </TR>
    </TABLE>

    <table width="100%" border="0" cellspacing="0" cellpadding="0"><!-- rem:bgcolor="#2288BB" -->
     <tr>
      <td valign=top width="87%">
      </td>
     </tr>
    </table>
   </TD></TR>
  <TR>
   <TD></TD>
    </TR>
   </TABLE>
  </TD>
 </TR>
</TABLE>
</div>
<div class="switch">
    <select id="channel-switcher">
        <option value="RoomList">ircx.saintsrow.net</option>
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

    <div id="ChatWindow" class="tabcontent">
    <div class="header">
    <button class="toggle-nicklist desktop-only" onclick="toggleNicklist()">☰</button>
    <div class="channel-name" id="channel-name"></div>
    <!-- Add the dropdown for channel switching -->
    <div id="user-count">0 users online</div> <!-- Keep this for desktop -->
    <button class="toggle-nicklist mobile-only" onclick="toggleNicklist()">☰</button>
</div>

<div id="chat-container" class="chat-container">
</div>
</div>

<div id="chat-input-container" class="chat-input-container">
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
<div id="nicklist" class="nicklist">
<div id="nicklist-container">
    <ul id="nicklist-users">
        <!-- Nicklist will be populated dynamically -->
    </ul>
</div>
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
        <source src="sounds/sounds/kick.mp3" type="audio/mp3">
        Your browser does not support the audio element.
    </audio>
    <audio id="kick-sound2">
        <source src="sounds/sounds/kick1.mp3" type="audio/mp3">
        Your browser does not support the audio element.
    </audio>
    <audio id="thunder-sound">
        <source src="sounds/sounds/power-up-type-1.mp3" type="audio/mp3">
        Your browser does not support the audio element.
    </audio>
    <script>
        // Pass PHP variables to JavaScript
        const category = "<?php echo $category; ?>";
        const channelName = "<?php echo $channelName; ?>"; // Use the channelName from the URL parameter
      //  const channel = channelName;
        // currentChannel = channelName;
        const channelTopic = "<?php echo $channelTopic; ?>"; // Empty string if not provided
        const language = "<?php echo $language; ?>";
        const profanityFilter = "<?php echo $profanityFilter; ?>";
        const ownerkey = "<?php echo $ownerkey; ?>";
       // let nickname = "<?php echo $nickname; ?>"; // Use the nickname from the URL parameter
       // nickname = nickname.replace(" ","");
    </script>

    <script>
  // connectWebSocket(channel);
        </script>
</div>
</body>
<script src="chatroomv5.js"></script>
</html>