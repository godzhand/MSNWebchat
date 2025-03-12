<?php
// connect.php
header('Content-Type: text/plain');

// Path to the ircx.js script
$scriptPath = __DIR__ . '/ircx.js';

// Check if the script exists
if (!file_exists($scriptPath)) {
    die("Error: ircx.js script not found.\n");
}

// Execute the ircx.js script using Node.js
$output = shell_exec('node ' . escapeshellarg($scriptPath) . ' 2>&1');

// Output the result
echo $output;
?>