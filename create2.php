<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Create Channel - Single Page Form</title>
    <style>
        /* Reset and base styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            background-color: #f4f4f4; /* Light gray background */
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh; /* Ensure body takes at least the full viewport height */
            overflow: auto; /* Allow scrolling if content overflows */
            padding: 20px; /* Add padding to prevent content from touching edges */
        }

        .container {
            width: 100%;
            max-width: 600px;
            background-color: #fff; /* White background */
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* Subtle shadow */
            border-radius: 12px;
            padding: 30px;
            margin: 20px;
        }

        h1 {
            font-size: 2.5em;
            color: #333; /* Dark gray for text */
            margin-bottom: 20px;
            text-align: center;
        }

        /* Small print link styling */
        .return-link {
            text-align: center;
            margin-bottom: 20px;
            position: relative;
            top: 20px;
            left: 50px;
        }

        .return-link a {
            font-size: 0.9em;
            color: #0078d7; /* Blue color for text */
            text-decoration: none; /* No underline */
            cursor: pointer;
            transition: color 0.3s ease;
        }

        .return-link a:hover {
            color: #005bb5; /* Darker blue on hover */
        }

        .form-section {
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            position: relative; /* For separator */
        }

        /* Separator at the bottom of each form section */
        .form-section::after {
            content: '';
            position: absolute;
            left: 0;
            right: 0;
            bottom: -10px;
            height: 1px;
            background-color: #ddd; /* Light gray separator */
        }

        /* Alternating background colors */
        .form-section:nth-child(odd) {
            background-color: #feffed; /* Pinkish tan for odd sections */
        }

        .form-section:nth-child(even) {
            background-color: #feffed; /* Darker tan for even sections */
        }

        .form-group {
            margin-bottom: 20px;
            position: relative; /* For tooltip positioning */
        }

        .form-group label {
            display: block;
            font-size: 1.1em;
            color: #34495e; /* Lighter gray for labels */
            margin-bottom: 8px;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
            width: 100%;
            padding: 12px;
            font-size: 1em;
            border: 1px solid #ddd; /* Light gray border */
            border-radius: 8px;
            background-color: #fff; /* White background for inputs */
            transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
            border-color: #0078d7; /* Blue border on focus */
            box-shadow: 0 0 8px rgba(0, 120, 215, 0.2); /* Blue shadow on focus */
            outline: none;
        }

        .form-group textarea {
            resize: vertical;
            height: 100px; /* Fixed height for textarea */
        }

        /* Horizontal layout for Category and Language dropdowns */
        .horizontal-group {
            display: flex;
            gap: 20px; /* Space between the two dropdowns */
        }

        .horizontal-group .form-group {
            flex: 1; /* Each dropdown takes 50% of the width */
        }

        .horizontal-group select {
            width: 100%; /* Ensure the dropdowns take full width of their container */
        }

        /* Tooltip styling */
        .tooltip {
            position: absolute;
            top: -30px; /* Position above the input field */
            left: 50%;
            transform: translateX(-50%);
            background-color: #333;
            color: #fff;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 0.9em;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none; /* Prevent tooltip from blocking clicks */
        }

        .tooltip.show {
            opacity: 1; /* Show tooltip */
        }

        .navigation-buttons {
            display: flex;
            justify-content: flex-end;
            margin-top: 30px;
        }

        .navigation-buttons button {
            background: none;
            border: none;
            padding: 0;
            font-size: 1em;
            color: #0078d7; /* Blue color for text */
            cursor: pointer;
            transition: color 0.3s ease;
        }

        .navigation-buttons button:hover {
            color: #005bb5; /* Darker blue on hover */
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            h1 {
                font-size: 2em; /* Smaller font size for smaller screens */
            }

            .container {
                padding: 20px; /* Reduce padding for smaller screens */
            }

            .form-group input,
            .form-group textarea,
            .form-group select {
                padding: 10px; /* Smaller padding for smaller screens */
                font-size: 0.9em; /* Smaller font size for smaller screens */
            }

            .navigation-buttons button {
                font-size: 0.9em; /* Smaller font size for smaller screens */
            }

            /* Stack dropdowns vertically on smaller screens */
            .horizontal-group {
                flex-direction: column;
                gap: 10px;
            }
        }

        @media (max-width: 480px) {
            h1 {
                font-size: 1.8em; /* Even smaller font size for mobile */
            }

            .form-group label {
                font-size: 1em; /* Smaller font size for labels */
            }

            .form-group textarea {
                height: 80px; /* Smaller height for mobile */
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Return to Channel List Link -->
        <div class="return-link">
            <a href="index.php">Return to Channel List</a>
        </div>

        <h1></h1>
        <form id="channel-form" action="chatroom.php" method="POST">
            <!-- Category and Language Selection (Side by Side) -->
            <div class="form-section">
                <div class="horizontal-group">
                    <div class="form-group">
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
                    <div class="form-group">
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

            <!-- Channel Name -->
            <div class="form-section">
                <div class="form-group">
                    <label for="channel-name">Channel Name:</label>
                    <input type="text" id="channel-name" name="channel-name" placeholder="Enter channel name" required>
                </div>
            </div>

            <!-- Topic of the Channel -->
            <div class="form-section">
                <div class="form-group">
                    <label for="channel-topic">Topic of the Channel:</label>
                    <textarea id="channel-topic" name="channel-topic" placeholder="Enter the topic of the channel" required></textarea>
                </div>
            </div>

            <!-- Ownerkey and Profanity Filter (Side by Side) -->
            <div class="form-section">
                <div class="horizontal-group">
                    <div class="form-group">
                        <label for="ownerkey">Ownerkey:</label>
                        <input type="text" id="ownerkey" name="ownerkey" placeholder="Generating..." readonly>
                        <!-- Tooltip -->
                        <div class="tooltip" id="ownerkey-tooltip">Copied to clipboard!</div>
                    </div>
                    <div class="form-group">
                        <label for="profanity-filter">Profanity Filter:</label>
                        <select id="profanity-filter" name="profanity-filter" required>
                            <option value="disabled" selected>Disabled</option>
                            <option value="enabled">Enabled</option>
                        </select>
                    </div>
                </div>
            </div>
<!-- Add this inside your form, after the Ownerkey section -->
<div class="form-section">
    <div class="form-group">
        <label for="nickname">Nickname:</label>
        <input type="text" id="nickname" name="nickname">
    </div>
</div>
            <!-- Submit Button -->
            <div class="navigation-buttons">
                <button type="submit">Create Channel</button>
            </div>
        </form>
    </div>

    <script>

document.addEventListener('DOMContentLoaded', function () {
    if (sessionStorage.getItem('hasInteracted') === 'true') {
        console.log('User has interacted with the previous page.');
        // You can restore the state or update the UI accordingly
    }
});

        // Generate a random number with a length between 6 and 9 digits
        function generateOwnerkey() {
            // Randomly choose a length between 6 and 9
            const length = Math.floor(Math.random() * 4) + 6; // 6, 7, 8, or 9
            const min = Math.pow(10, length - 1); // Minimum number for the chosen length
            const max = Math.pow(10, length) - 1; // Maximum number for the chosen length
            return Math.floor(min + Math.random() * (max - min + 1));
        }

        // Set the ownerkey value when the page loads
        document.addEventListener('DOMContentLoaded', function () {
            const ownerkeyInput = document.getElementById('ownerkey');
            ownerkeyInput.value = generateOwnerkey();
        });

        // Copy Ownerkey to clipboard and show tooltip when text is highlighted
        const ownerkeyInput = document.getElementById('ownerkey');
        const tooltip = document.getElementById('ownerkey-tooltip');

        ownerkeyInput.addEventListener('mouseup', function () {
            const selectedText = window.getSelection().toString();
            if (selectedText) {
                console.log('Selected text:', selectedText); // Debugging
                // Use Clipboard API if available
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(selectedText)
                        .then(() => {
                            console.log('Text copied to clipboard'); // Debugging
                            // Show tooltip
                            tooltip.classList.add('show');
                            setTimeout(() => {
                                tooltip.classList.remove('show');
                            }, 2000); // Hide tooltip after 2 seconds
                        })
                        .catch((err) => {
                            console.error('Failed to copy text:', err); // Debugging
                            alert('Failed to copy Ownerkey to clipboard.');
                        });
                } else {
                    // Fallback for older browsers
                    const textarea = document.createElement('textarea');
                    textarea.value = selectedText;
                    document.body.appendChild(textarea);
                    textarea.select();
                    try {
                        document.execCommand('copy');
                        console.log('Text copied to clipboard (fallback)'); // Debugging
                        // Show tooltip
                        tooltip.classList.add('show');
                        setTimeout(() => {
                            tooltip.classList.remove('show');
                        }, 2000); // Hide tooltip after 2 seconds
                    } catch (err) {
                        console.error('Failed to copy text (fallback):', err); // Debugging
                        alert('Failed to copy Ownerkey to clipboard.');
                    }
                    document.body.removeChild(textarea);
                }
            }
        });
                // Add sessionStorage on form submission
                document.getElementById('channel-form').addEventListener('submit', function (event) {
            // Set a flag in sessionStorage to indicate user interaction
            sessionStorage.setItem('hasInteracted', 'true');
        });
// Function to generate a random nickname
function generateRandomNickname() {
    const adjectives = ['Cool', 'Funny', 'Smart', 'Brave', 'Quick', 'Witty', 'Happy', 'Lucky', 'Gentle', 'Wild'];
    const nouns = ['Cat', 'Dog', 'Fox', 'Bear', 'Wolf', 'Lion', 'Tiger', 'Eagle', 'Hawk', 'Owl'];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${randomAdjective}${randomNoun}${Math.floor(Math.random() * 100)}`; // Add a random number for uniqueness
}

// Set the nickname value when the page loads
document.addEventListener('DOMContentLoaded', function () {
    const nicknameInput = document.getElementById('nickname');
    nicknameInput.value = generateRandomNickname();
});
    </script>
</body>
</html>