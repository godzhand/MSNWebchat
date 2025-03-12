<?php
$category = htmlspecialchars($_POST['category'] ?? 'General');
$channelName = htmlspecialchars($_POST['channel-name'] ?? 'Unnamed Channel');
$channelTopic = htmlspecialchars($_POST['channel-topic'] ?? 'No topic provided');
$language = htmlspecialchars($_POST['language'] ?? 'English');
$profanityFilter = htmlspecialchars($_POST['profanity-filter'] ?? 'disabled');
$ownerkey = htmlspecialchars($_POST['ownerkey'] ?? 'No Ownerkey');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat Window</title>
    <style>
        body {
            font-family: "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
            height: 100vh;
            overflow: hidden;
            font-size: 14px;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 20px;
            background: linear-gradient(135deg, #97bdff, #6a8fcc);
            border-bottom: 1px solid #ccc;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        .header .channel-name {
            font-size: 18px;
            color: #ffffff;
            font-weight: normal; /* Removed bold */
        }
        .header #user-count {
            font-size: 14px;
            color: #ffffff;
        }

        .chat-box {
            width: 100%;
            height: calc(100vh - 60px);
            padding: 20px;
            box-sizing: border-box;
            overflow-y: scroll;
            scrollbar-width: none;
            -ms-overflow-style: none;
        }
        .chat-box::-webkit-scrollbar {
            display: none;
        }
        .chat-box p {
            margin: 0 0 10px 0;
            color: #333;
            line-height: 1.5;
        }
        .chat-box p:first-child {
            color: #379637;
        }
        .chat-box p:nth-child(2) {
            color: #FF0000;
        }
        .chat-box p:nth-child(5)::before {
            color: rgb(209, 255, 5);
        }

        .chat-box p:nth-child(6)::before {
            color: rgb(0, 16, 247);
        }
        .chat-box p:nth-child(7)::before {
            color: rgb(0, 0, 0);
        }
        a {
            text-decoration: underline;
            color: inherit;
        }
        a:hover {
            color: #0078d7;
        }

        .nicklist {
            flex: 1;
            padding: 20px;
            background-color: #727579;
            border-left: 1px solid #ccc;
            overflow-y: scroll;
            scrollbar-width: none;
            -ms-overflow-style: none;
            position: fixed;
            top: 60px;
            right: -80%;
            width: 80%;
            height: calc(100vh - 60px);
            transition: right 0.3s ease-in-out;
            color: #fff;
            box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
        }
        .nicklist.open {
            right: 0;
        }
        .nicklist h3 {
            margin-top: 0;
            font-size: 16px;
            color: #fff;
        }
        .nicklist ul {
            list-style-type: none;
            padding: 0;
        }
        .nicklist ul li {
            padding: 5px 0;
            margin: 0;
            font-size: 14px;
        }
        .owner::before {
            content: ".";
            color: #0cfffb;
            font-weight: bold;
            margin-right: 5px;
        }
        .host::before {
            content: "@";
            color: #11bb5a;
            font-weight: bold;
            margin-right: 5px;
        }
        .voiced::before {
            content: "+";
            color: #5a77e8;
            font-weight: bold;
            margin-right: 5px;
        }
        .toggle-nicklist {
            position: fixed;
            top: 70px;
            right: 20px;
            z-index: 1000;
            background-color: #fff;
            border: none;
            padding: 10px 15px;
            cursor: pointer;
            border-radius: 50%;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            transition: background-color 0.3s ease;
        }
        .toggle-nicklist:hover {
            background-color: #f0f0f0;
        }

        /* Restored original media queries for nicklist sliding */
        @media (max-width: 768px) {
            .toggle-nicklist {
                display: block;
            }
            .nicklist {
                right: -99%;
            }
            .nicklist.open {
                right: 0;
            }
        }
        @media (max-width: 857px) {
            .toggle-nicklist {
                border-radius: 0px;
            }
            .nicklist {
                right: -721px;
            }
            .nicklist.open {
                right: -58%;
            }
        }
        @media (min-width: 1530px) {
            .toggle-nicklist {
                right: 355px;
            }
            .nicklist {
                right: -931px;
            }
            .nicklist.open {
                right: -116%;
            }
        }
        @media (max-width: 384px) {
            .toggle-nicklist {
                border-radius: 0px;
            }
            .nicklist {
                right: 99%;
            }
            .nicklist.open {
                right: 4%;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="channel-name" id="channel-name">Channel Name</div>
        <div id="user-count">0 users online</div>
    </div>
    <button class="toggle-nicklist" onclick="toggleNicklist()">☰</button>
    <div class="chat-container">
        <div class="chat-box">
        <p id="message1"></p>
        <p id="message2" style="display: none;">Connected!</p>
            <!-- <p id="message1">Please wait, connecting to server...</p>
            <p id="message2" style="display: none;">Connected!</p>
            <p id="message3" style="display: none;">try to be nice but have fun!</p>
            <p id="message4" style="display: none;"></p>
            <p id="message5" style="display: none;"></p>
            <p id="message6" style="display: none;"></p>
            <p id="message7" style="display: none;"></p>
            <p id="message8" style="display: none;"></p>
            <p id="message9" style="display: none;">hello?</p>
            <p id="message10" style="display: none;">hi! welcome!</p> -->
        </div>
        <div class="nicklist" id="nicklist">
            <h3></h3>
            <ul id="nicklist-users">
                <!-- Nicklist will be populated dynamically -->
            </ul>
        </div>
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
    <script>
let wss;

function connectWebSocket() {
    console.log('Attempting to connect WebSocket...');
    message1.innerHTML += 'connecting to server...<br>';
    wss = new WebSocket('wss://chat.saintsrow.net/ws/');

    wss.onopen = () => {
        console.log('✅ WebSocket connection established');

        // Send join data after connection is established
        wss.send(JSON.stringify({
            type: 'CREATE',
            nickname: nickname,
            category: category,
            channelName: channelName,
            channelTopic: channelTopic,
            language: language,
            profanityFilter: profanityFilter,
            ownerkey: ownerkey
        }));
    };

    wss.onmessage = (event) => {
    const data = JSON.parse(event.data);

    // Log the entire data object to check its structure
    console.log(data.data);

    // Check if 'data' and 'data.data' are defined
    if (data.data && typeof data.data === 'string') {
        const ArrayRaws = data.data.trim(); // Trim any extra spaces

        if (ArrayRaws.split(" ")[1] === "800") {
      //      console.log("800 found");
            message2.innerhtml = "Connected.";
            message2.style.display = 'block'; // Show the element when condition is met
        }
    } else {
       // console.log('Invalid or undefined data received:', data.data); // Log invalid data
    }

    // Handle other types of data
    if (data.type === 'topic') {
    const topicElement = document.createElement('p');

    // Create the "The chat’s topic is:" part with the foreground color #289e92
    const prefix = document.createElement('span');
    prefix.textContent = "The chat’s topic is: ";
    prefix.style.color = '#289e92'; // Set foreground color to #289e92

    // Create the actual topic part with black and italic text
    const topicText = document.createElement('span');
    topicText.textContent = data.topic;
    topicText.style.color = 'black'; // Set text color to black
    topicText.style.fontStyle = 'italic'; // Set the text to italic

    // Append both parts to the topic element
    topicElement.appendChild(prefix);
    topicElement.appendChild(topicText);

    // Optionally, add some padding and margin for better readability
    topicElement.style.padding = '5px';
    topicElement.style.margin = '5px 0';

    // Append the topic element to the chat box
    document.querySelector('.chat-box').appendChild(topicElement);
}

 else if (data.type === 'nicklist') {
        console.log('👥 Nicklist data received:', data.users);
        populateNicklist(data.users);
        updateUserCount(data.userCount);
    }
};



    wss.onclose = (event) => {
        console.log('❌ WebSocket closed:', event.code, event.reason);
    };

    wss.onerror = (error) => {
        console.error('⚠️ WebSocket error:', error);
        wss.close();
    };
}

// Function to populate the nicklist
function populateNicklist(users) {
    const nicklistUsers = document.getElementById('nicklist-users');
    nicklistUsers.innerHTML = '';

    users.forEach(user => {
        if (user.startsWith(':')) {
            user = user.substring(1);
        }

        const li = document.createElement('li');
        li.textContent = user;
        nicklistUsers.appendChild(li);
    });
}

// Function to update user count
function updateUserCount(count) {
    const userCountElement = document.getElementById('user-count');
    userCountElement.textContent = count === 1 ? `${count} user online` : `${count} users online`;
}

// Start WebSocket connection when the page loads
document.addEventListener('DOMContentLoaded', () => {
    connectWebSocket();
});


</script>
    <script>
        // Check if the user has interacted with the form
        const hasInteracted = sessionStorage.getItem('hasInteracted') === 'true';

        const category = "<?php echo htmlspecialchars($_POST['category'] ?? 'General'); ?>";
        const channelName = "<?php echo htmlspecialchars($_POST['channel-name'] ?? 'Unnamed Channel'); ?>";
        const channelTopic = "<?php echo htmlspecialchars($_POST['channel-topic'] ?? 'No topic provided'); ?>";
        const language = "<?php echo htmlspecialchars($_POST['language'] ?? 'English'); ?>";
        const profanityFilter = "<?php echo htmlspecialchars($_POST['profanity-filter'] ?? 'disabled'); ?>";
        const ownerkey = "<?php echo htmlspecialchars($_POST['ownerkey'] ?? 'No Ownerkey'); ?>";
        const nickname = "<?php echo htmlspecialchars($_POST['nickname'] ?? 'null'); ?>";
        document.getElementById('channel-name').textContent = channelName;

        const users = [
            { name: "enzyme", role: "owner" },
            { name: "wh0Kares", role: "owner" },
            { name: "ben", role: "host" },
            { name: "function", role: "host" },
            { name: "Interx", role: "host" },
            { name: "Samurai", role: "host" },
            { name: "y02", role: "host" },
            { name: "neo", role: "voiced" },
            { name: "ay0nx", role: "regular" },
            { name: "zi0x^", role: "regular" },
            { name: "zombie", role: "regular" }
        ];

  



 
        function toggleNicklist() {
            const nicklist = document.getElementById('nicklist');
            nicklist.classList.toggle('open');
        }

        let touchStartX = 0;
        let touchEndX = 0;

        document.getElementById('nicklist').addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        document.getElementById('nicklist').addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchStartX - touchEndX > 50) {
                toggleNicklist();
            }
        });

        document.addEventListener('DOMContentLoaded', function () {
            if (sessionStorage.getItem('hasInteracted') === 'true') {
                console.log('User has interacted with the previous page.');
                const DoorSound = document.getElementById('Door-sound');
                const connectedSound = document.getElementById('connected-sound');
                connectedSound.volume = 1.0;
                DoorSound.volume = 1.0;
                DoorSound.play().catch(error => {
                    console.error("Audio playback failed:", error);
                });
                // You can restore the state or update the UI accordingly
            }
        });

        // IRC Connection Logic

     
    // document.addEventListener('DOMContentLoaded', function () {

    //     fetch('https://chat.saintsrow.net/connect', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({ nickname: 'test' }),
    //     })
    //     .then(response => response.json())
    //     .then(data => {
    //         message1.innerHTML += data.message + '<br>';
    //         checkJoinStatus(); // ✅ Start checking for "Connected!"
    //     })
    //     .catch(error => {
    //        message1.innerHTML += 'Error: ' + error.message + '<br>';
    //     });
    // });

    // function checkJoinStatus() {
    //     const message2 = document.getElementById('message2');

    //     function pollStatus() {
    //         fetch('https://chat.saintsrow.net/status')
    //             .then(response => response.json())
    //             .then(data => {
    //                 if (data.status === 'success') {
    //                     message2.style.display = 'block'; // ✅ Show "Connected!"
    //                     const connectedSound = document.getElementById('connected-sound');
    //             connectedSound.volume = 1.0;
    //                     connectedSound.play().catch(error => {
    //                 console.error("Audio playback failed:", error);
    //             });
    //                 } else if (data.status === 'pending') {
    //                     setTimeout(pollStatus, 1000); // 🔄 Retry only if still connecting
    //                 }
    //             })
    //             .catch(error => {
    //                 console.error("Polling error:", error);
    //                 setTimeout(pollStatus, 2000); // 🔄 Retry in 2s if an error occurs
    //             });
    //     }

    //     pollStatus(); // Start checking for join confirmation
    // }

 

    </script>
</body>
</html>