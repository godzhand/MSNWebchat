const fs = require('fs');
const xml2js = require('xml2js');
const WebSocket = require('ws');

const XML_FILE_PATH = '/home/data/ircx/irc7/Irc7d/channels.xml';
const WS_PORT = 8082;

const parser = new xml2js.Parser();
let latestXmlData = null;

// WebSocket Server
const wss = new WebSocket.Server({ port: WS_PORT });

// Watch for XML file changes
fs.watchFile(XML_FILE_PATH, { interval: 1000 }, () => {
    console.log('🔄 XML file changed, updating...');
    updateXmlData();
});

// Parse XML and update latest data
function updateXmlData() {
    fs.readFile(XML_FILE_PATH, 'utf8', (err, data) => {
        if (err) {
            console.error('❌ Error reading XML file:', err);
            return;
        }

        parser.parseString(data, (err, result) => {
            if (err) {
                console.error('❌ Error parsing XML:', err);
                return;
            }

            latestXmlData = result;
            console.log('✅ XML Data Updated:', result);

            // Broadcast updated XML data to all clients
            broadcast({ type: 'xmlUpdate', data: result });
        });
    });
}

// Send data to all WebSocket clients
function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('✅ Client connected');
    
    // Send latest XML data when a client connects
    if (latestXmlData) {
        ws.send(JSON.stringify({ type: 'xmlUpdate', data: latestXmlData }));
    }

    ws.on('message', (message) => {
        try {
            const request = JSON.parse(message);
            if (request.type === 'requestLatest' && latestXmlData) {
                ws.send(JSON.stringify({ type: 'xmlUpdate', data: latestXmlData }));
            }
        } catch (error) {
            console.error('❌ Error processing client message:', error);
        }
    });

    ws.on('close', () => console.log('❌ Client disconnected'));
});

console.log(`✅ WebSocket server running on ws://localhost:${WS_PORT}`);
updateXmlData(); // Initial read
