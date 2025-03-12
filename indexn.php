<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IRCX Nicklist</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #2C2F33;
            color: #FFFFFF;
            padding: 20px;
        }
        .nicklist {
            list-style-type: none;
            padding: 0;
        }
        .nicklist li {
            padding: 2px 0; /* Very compact padding */
            margin: 0; /* No margin for tight spacing */
            font-size: 14px; /* Consistent font size */
        }
        .owner::before {
            content: ".";
            color: #FF0000;
            font-weight: bold;
            margin-right: 0px;
        }
        .host::before {
            content: "@";
            color: #00FF00;
            font-weight: bold;
            margin-right: 0px;
        }
        .voiced::before {
            content: "+";
            color: #1E90FF;
            font-weight: bold;
            margin-right: 1px;
        }
    </style>
</head>
<body>
    <h1>IRCX Nicklist</h1>
    <ul class="nicklist">
        <!-- Owners (.) -->
        <li class="owner">enzyme</li>
        <li class="owner">wh0Kares</li>

        <!-- Hosts (@) -->
        <li class="host">ben</li>
        <li class="host">function</li>
        <li class="host">Interx</li>
        <li class="host">Samurai</li>
        <li class="host">y02</li>

        <!-- voice (+) -->
        <li class="voiced">neo</li>

        <!-- Regular Users (No Modes) -->
        <li>ay0nx</li>
        <li>zi0x^</li>
        <li>zombie</li>
    </ul>
</body>
</html>