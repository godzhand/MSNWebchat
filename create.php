<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Create Chat Room - Alternating Background Wizard</title>
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
            height: 100vh;
            overflow: hidden;
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

        .form-step {
            display: none;
            width: 100%;
            max-width: 600px;
            animation: fadeIn 0.5s ease-in-out;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }

        .form-step.active {
            display: block;
        }

        /* Alternating background colors */
        .form-step:nth-child(odd) {
            background-color: #e3e3d270; /* Pinkish tan for odd steps */
        }

        .form-step:nth-child(even) {
            background-color: #feffed; /* Darker tan for even steps */
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            font-size: 1.1em;
            color: #34495e; /* Lighter gray for labels */
            margin-bottom: 8px;
        }

        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 12px;
            font-size: 1em;
            border: 1px solid #ddd; /* Light gray border */
            border-radius: 8px;
            background-color: #fff; /* White background for inputs */
            transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus {
            border-color: #0078d7; /* Blue border on focus */
            box-shadow: 0 0 8px rgba(0, 120, 215, 0.2); /* Blue shadow on focus */
            outline: none;
        }

        .form-group textarea {
            resize: vertical;
            height: 100px; /* Fixed height for textarea */
        }

        .form-group .radio-group {
            display: flex;
            gap: 20px; /* Space between radio buttons */
            align-items: center; /* Align radio buttons and labels vertically */
        }

        .form-group .radio-group label {
            display: flex;
            align-items: center; /* Align radio button and text vertically */
            gap: 8px; /* Space between radio button and text */
        }

        .navigation-buttons {
            display: flex;
            justify-content: space-between;
            margin-top: 30px;
        }

        .navigation-buttons button {
            padding: 12px 24px;
            font-size: 1em;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            background-color: #0078d7; /* Blue color for buttons */
            color: #ffffff; /* White text */
            transition: background-color 0.3s ease;
        }

        .navigation-buttons button:disabled {
            background-color: #b0c4de; /* Light gray for disabled buttons */
            cursor: not-allowed;
        }

        .navigation-buttons button:hover:not(:disabled) {
            background-color: #005bb5; /* Darker blue on hover */
        }

        /* Animations */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
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
            .form-group textarea {
                padding: 10px; /* Smaller padding for smaller screens */
                font-size: 0.9em; /* Smaller font size for smaller screens */
            }

            .navigation-buttons button {
                padding: 10px 20px; /* Smaller buttons for smaller screens */
                font-size: 0.9em; /* Smaller font size for smaller screens */
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

            .form-group .radio-group {
                flex-direction: column; /* Stack radio buttons vertically */
                gap: 10px; /* Space between radio buttons */
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Create a New Chat Room</h1>
        <form id="chatroom-form">
            <!-- Step 1: Chatroom Name -->
            <div class="form-step active" id="step-1">
                <div class="form-group">
                    <label for="chatroom-name">Chatroom Name:</label>
                    <input type="text" id="chatroom-name" name="chatroom-name" placeholder="Enter chatroom name" required>
                </div>
                <div class="navigation-buttons">
                    <button type="button" disabled>Previous</button>
                    <button type="button" onclick="nextStep(2)">Next</button>
                </div>
            </div>

            <!-- Step 2: Topic of the Channel -->
            <div class="form-step" id="step-2">
                <div class="form-group">
                    <label>Chatroom Name: <strong id="display-chatroom-name"></strong></label>
                </div>
                <div class="form-group">
                    <label for="chatroom-topic">Topic of the Channel:</label>
                    <textarea id="chatroom-topic" name="chatroom-topic" placeholder="Enter the topic of the channel" required></textarea>
                </div>
                <div class="navigation-buttons">
                    <button type="button" onclick="prevStep(1)">Previous</button>
                    <button type="button" onclick="nextStep(3)">Next</button>
                </div>
            </div>

            <!-- Step 3: Room Limit -->
            <div class="form-step" id="step-3">
                <div class="form-group">
                    <label for="room-limit">Room Limit (Max 100):</label>
                    <input type="number" id="room-limit" name="room-limit" value="50" min="1" max="100" maxlength="3" required>
                </div>
                <div class="navigation-buttons">
                    <button type="button" onclick="prevStep(2)">Previous</button>
                    <button type="button" onclick="nextStep(4)">Next</button>
                </div>
            </div>

            <!-- Step 4: Profanity Filter -->
            <div class="form-step" id="step-4">
                <div class="form-group">
                    <label>Profanity Filter:</label>
                    <div class="radio-group">
                        <label>
                            <input type="radio" id="profanity-filter-off" name="profanity-filter" value="off" checked> Off
                        </label>
                        <label>
                            <input type="radio" id="profanity-filter-on" name="profanity-filter" value="on"> On
                        </label>
                    </div>
                </div>
                <div class="navigation-buttons">
                    <button type="button" onclick="prevStep(3)">Previous</button>
                    <button type="submit">Create Chat Room</button>
                </div>
            </div>
        </form>
    </div>

    <script>
        let currentStep = 1;
        const totalSteps = 4;

        function nextStep(step) {
            if (step > currentStep) {
                // Update displayed chatroom name in Step 2
                if (step === 2) {
                    const chatroomName = document.getElementById('chatroom-name').value;
                    document.getElementById('display-chatroom-name').textContent = chatroomName;
                }
                document.getElementById(`step-${currentStep}`).classList.remove('active');
                document.getElementById(`step-${step}`).classList.add('active');
                currentStep = step;
            }
        }

        function prevStep(step) {
            if (step < currentStep) {
                document.getElementById(`step-${currentStep}`).classList.remove('active');
                document.getElementById(`step-${step}`).classList.add('active');
                currentStep = step;
            }
        }

        // Handle form submission
        document.getElementById('chatroom-form').addEventListener('submit', function (e) {
            e.preventDefault();
            const chatroomName = document.getElementById('chatroom-name').value;
            const chatroomTopic = document.getElementById('chatroom-topic').value;
            const roomLimit = document.getElementById('room-limit').value;
            const profanityFilter = document.querySelector('input[name="profanity-filter"]:checked').value;

            alert(`Chatroom created successfully!\n\nName: ${chatroomName}\nTopic: ${chatroomTopic}\nRoom Limit: ${roomLimit}\nProfanity Filter: ${profanityFilter}`);
            // You can add logic here to submit the form data to a server
        });

        // Add event listeners for Enter key
        document.getElementById('chatroom-name').addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && this.value.trim() !== '') {
                e.preventDefault(); // Prevent form submission
                nextStep(2);
            }
        });

        document.getElementById('chatroom-topic').addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && this.value.trim() !== '') {
                e.preventDefault(); // Prevent form submission
                nextStep(3);
            }
        });

        document.getElementById('room-limit').addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && this.value.trim() !== '') {
                e.preventDefault(); // Prevent form submission
                nextStep(4);
            }
        });
    </script>
</body>
</html>