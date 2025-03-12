<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IRCX Client</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .container {
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        button {
            padding: 10px 20px;
            font-size: 16px;
            background-color: #007bff;
            color: #fff;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        button:hover {
            background-color: #0056b3;
        }
        .output {
            margin-top: 20px;
            padding: 10px;
            background-color: #f8f9fa;
            border: 1px solid #ddd;
            border-radius: 5px;
            max-height: 200px;
            overflow-y: auto;
            text-align: left;
        }
        input {
            padding: 10px;
            margin: 10px 0;
            width: 100%;
            box-sizing: border-box;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>IRCX Client</h1>
        <input type="text" id="nickname" placeholder="Enter your nickname">
        <button id="connectButton">Connect to IRCX</button>
        <div class="output" id="output"></div>
    </div>

    <script>
     document.getElementById('connectButton').addEventListener('click', function() {
    const output = document.getElementById('output');
    output.innerHTML = 'Connecting to IRCX server...<br>';

    fetch('https://chat.saintsrow.net/connect', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname: 'test' }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            output.innerHTML += data.message + '<br>';
        })
        .catch(error => {
            output.innerHTML += 'Error: ' + error.message + '<br>';
        });
});
    </script>
</body>
</html>