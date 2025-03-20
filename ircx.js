const IRC = require('irc-framework');
const http = require('http');
const WebSocket = require('ws');

const ctcpRequests = new Map();

const PORT = 3000;
const wss = new WebSocket.Server({ port: 8080 });

const wsClients = new Map(); // Stores connected WebSocket clients
const nicklist = new Map(); // Stores nicknames per channel

// Sends topic updates to all clients in the channel
function sendTopic(channel, topic, targetWs = null) {
    if (targetWs) {
        // Send topic only to the specified WebSocket client
        if (wsClients.has(targetWs)) {
            targetWs.send(JSON.stringify({ type: 'topic', channel, topic }));
        }
    } else {
        // Broadcast topic to all clients in the channel (default behavior)
        wsClients.forEach((info, ws) => {
            if (info.channel === channel && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'topic', channel, topic }));
            }
        });
    }
}

// Sends nicklist updates to all clients in the channel
function sendNicklist(client, channel, users, userCount) {
    wsClients.forEach((info, ws) => {
        if (info.client === client && info.channel === channel && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'nicklist', users, userCount }));
        }
    });
}

wss.on('connection', (ws) => {
    console.log('🔗 WebSocket client connected');

    let client = new IRC.Client();
    let isConnected = false;
    let nickname, channelName, category, topic, language, ownerkey;

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === 'CREATE' || data.type === 'JOIN') {
                nickname = data.nickname;
                channelName = `%#${data.channelName.replace(/\s+/g, '\\b')}`;
                if (data.type === 'CREATE') {
                    category = data.category.replace("General", "GN").replace("Computing", "CP").replace("News", "NW").replace("Gaming", "VG").replace("Politics", "PT").replace("Conspiracies", "CT") || 'GN';
                    channelTopic = data.channelTopic?.replace(/\s+/g, '\\b') || 'Welcome!';
                    language = data.language || 'English';
                    profanityFilter = data.profanityFilter || '';
                    ownerkey = data.ownerkey || 'DEFAULT_OWNERKEY';
                }

                if (isConnected) {
                    data.type === 'JOIN' ? joinChannel() : createChannel();
                } else {
                    connectToServer(data.type);
                }

                // Update wsClients with the new client info
                wsClients.set(ws, { nickname, channel: channelName, client });
            } else if (data.type === 'MESSAGE') {
                // Forward the message to the IRC channel
                const clientInfo = wsClients.get(ws);
                if (clientInfo && clientInfo.channel) {
                    clientInfo.client.say(clientInfo.channel, data.content);
                }
            } 
            else if (data.type === 'HOST_KEYWORD') {
                client.raw("mode " + nickname + " +h " + data.content);

            }
            else if (data.type === 'CMDRAW') {
                // Handle raw IRC commands
               // console.log("received cmd");
                const commands = data.command.split(' | '); // Split commands by ' | '
                let cmdcount = 0;
                let cmdmode;
                commands.forEach(command => {
                   // console.log(command);
                    if (cmdcount > 1) {

                        if (command.startsWith('//')) {
                            let channelNameX;
                            cmdmode = 2;
                            // Double slash means replace # with channelName
                            if (channelName.startsWith("%#")) {
                                channelNameX = `%#${channelName.replace(/\s+/g, '\\b')}`;
                            }
                            else {

                                channelNameX = `%#${channelName.replace(/\s+/g, '\\b')}`;
                            
                            }
                            const rawCommand = command.slice(2).replace(/#/g, `${channelNameX}`);
                            client.raw(rawCommand);
                        } else if (command.startsWith('/')) {
                            cmdmode = 1;
                            // Single slash means keep # as #
                            const rawCommand = command.slice(1); // Remove the single slash
                            client.raw(rawCommand);
                        } else {
                            // If it doesn't start with a slash, treat it as a normal message
                            const clientInfo = wsClients.get(ws);
                            if (clientInfo && clientInfo.channel) {
                                clientInfo.client.say(clientInfo.channel, command);
                            }
                        }
                    }
                    else {
                        if (command.startsWith('//')) {
                            let channelNameX;
                            if (channelName.startsWith("%#")) {
                                // If channelName already starts with %#, don't add another %#
                                channelNameX = `${channelName.replace(/\s+/g, '\\b')}`;
                            } else {
                                // Otherwise, add %# prefix
                                channelNameX = `%#${channelName.replace(/\s+/g, '\\b')}`;
                            }
                            const rawCommand = command.slice(2).replace(/#/g, `${channelNameX}`);
                            client.raw(rawCommand);
                        }
                         else if (command.startsWith('/')) {
                        // Single slash means keep # as #
                        const rawCommand = command.slice(1); // Remove the single slash
                        client.raw(rawCommand);
                    } else {
                        if (cmdmode == 1) {
                            const rawCommand = command; // Remove the single slash
                            client.raw(rawCommand);

                        }
                        else {
                            let channelNameX;
                            if (channelName.startsWith("%#")) {
                                channelNameX = `%#${channelName.replace(/\s+/g, '\\b')}`;
                            }
                            else {

                            channelNameX = `%#${channelName.replace(/\s+/g, '\\b')}`;
                            
                            }
                            const rawCommand = command.slice(2).replace(/#/g, `${channelNameX}`);
                            client.raw(rawCommand);

                        }
   
                    }
                }
                    cmdcount = cmdcount + 1;
                });
            } 
            else if (data.type === 'CTCP_TIME') {
                const targetNickname = data.target; // Who you want to CTCP
                console.log(`⏰ CTCP TIME requested for ${targetNickname}`);
            
                // Store the WebSocket client waiting for this response
                ctcpRequests.set(targetNickname, ws);
            
                // Send the CTCP TIME query
                client.say(targetNickname, '\x01TIME\x01');
            
                // Optional: Timeout to cleanup if no reply
                setTimeout(() => {
                    if (ctcpRequests.has(targetNickname)) {
                        console.warn(`⏰ No CTCP TIME reply from ${targetNickname}, cleaning up.`);
                        ctcpRequests.delete(targetNickname);
                    }
                }, 30000); // 30 seconds timeout
            }
            
            else if (data.type === 'PART') {
                // Handle PART command
                const clientInfo = wsClients.get(ws);
                if (clientInfo && clientInfo.channel) {
                    console.log(`🚪 ${clientInfo.nickname} is parting ${clientInfo.channel}`);
                    clientInfo.client.part(clientInfo.channel); // Part the channel
                }
            } else {
                console.error('⚠️ Unknown message type:', data.type);
            }
            
        } catch (error) {
            console.error('🛑 Error processing WebSocket message:', error);
        }
    });

    ws.on('close', () => {
        console.log('❌ WebSocket client disconnected');
        const clientInfo = wsClients.get(ws);
        if (clientInfo) {
            console.log(`🚪 ${clientInfo.nickname} is parting ${clientInfo.channel}`);

            // Send PART command to the IRC server
            clientInfo.client.part(clientInfo.channel);

            // Introduce a small delay before quitting the IRC client
            setTimeout(() => {
                console.log(`🔌 Quitting IRC for ${clientInfo.nickname}`);
                clientInfo.client.quit('WebSocket connection lost');
            }, 1000); // 1-second delay to ensure PART is processed
        }
        wsClients.delete(ws);
    });

    ws.on('error', (err) => {
        console.error('⚠️ WebSocket error:', err);
        ws.terminate();
    });

    function createChannel() {
        if (!channelName) return console.error('❌ No channel name provided.');
        console.log(`🆕 Creating channel: ${channelName}`);
        client.raw(`CREATE ${category} ${channelName} +ntl 50 ${channelTopic} EN-US 1 ${ownerkey} 0`);
    }

    function joinChannel() {
        if (!channelName) return console.error('❌ No channel name provided.');
        console.log(`🔗 Joining channel: ${channelName}`);

        client.raw(`JOIN ${channelName}`);

        // Request a list of users in the channel after joining
       // setTimeout(() => {
        //    console.log(`📡 Requesting nicklist for ${channelName}`);
         //   client.raw(`NAMES ${channelName}`);
       // }, 2000); // Small delay to ensure the join is processed first

        // Send the topic to the newly joined client
        wsClients.forEach((info, ws) => {
            if (info.channel === channelName && ws.readyState === WebSocket.OPEN && info.nickname === nickname) {
                // sendTopic(channelName, topic, ws); // Send topic only to this client
            }
        });
    }

    function connectToServer(mode) {
        console.log('🌍 Connecting to IRCX server...');
        isConnected = false;

        client.connect({
            host: 'ircx.saintsrow.net',
            port: 6667,
            nick: nickname,
            username: 'webuser',
            gecos: 'sr1client 1.000.000',
        });

        client.once('registered', () => {
            console.log('✅ Connected to IRC server.');
            isConnected = true;
            mode === 'JOIN' ? joinChannel() : createChannel();
        });

        client.once('socket connected', () => {
            console.log('✅ Socket connected to IRC.');
            client.raw('IRCX');
            
        });

        client.on('raw', (event) => {
            let parts = event.line.trim().split(' ');
            let command = parts[1];
            let params = parts.slice(2);
            console.log(parts);

            //if (command === '001') { // RPL_WELCOME
                // console.log(`📢 Received welcome message: ${event.line}`);

                // Find the WebSocket client associated with this IRC client
                wsClients.forEach((info, ws) => {
                    if (info.client === client && ws.readyState === WebSocket.OPEN) {
                        // Send the raw 001 message to the client
                        ws.send(JSON.stringify({ type: 'rawmsg', data: event.line }));
                    }
               });

               if (command === 'NOTICE') {
                let tnickname = parts[0].startsWith(':') ? parts[0].slice(1).split('!')[0] : parts[0];
                let target = params[0];
                let messageRaw = params.slice(1).join(' ').trim();
                let messagex = messageRaw.startsWith(':') ? messageRaw.slice(1) : messageRaw;
            
                if (messagex.startsWith('\x01TIME') && messagex.endsWith('\x01')) {
                    let ctcpReply = messagex.slice(1, -1); // 'TIME Mon Mar 10 00:19:43 2025'
            
                    // 'target' is likely our own nickname. So look up the request using 'tnickname'
                    let wsClient = ctcpRequests.get(nickname); // who sent the TIME reply
            
                    wsClients.forEach((info, ws) => {
                        if (info.client === client && ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: 'TIME', tnickname: tnickname, data: ctcpReply }));
                        }
                    });
                        console.log(`📤 Sent CTCP TIME reply to WebSocket client for ${nickname}: ${ctcpReply}`);
                        ctcpRequests.delete(nickname); // Clean up
                    } else {
                        console.warn(`⚠️ No active WebSocket client for ${nickname} or WebSocket not open!`);
                    }
                }
            
            
        
            if (command === 'PING') {
                client.raw(`PONG ${params[0]}`);
            }
            if (command === '001') { // RPL_WELCOME
                console.log(`📢 Received welcome message: ${event.line}`);

                // Find the WebSocket client associated with this IRC client
                wsClients.forEach((info, ws) => {
                    if (info.client === client && ws.readyState === WebSocket.OPEN) {
                        // Send the raw 001 message to the client
                        ws.send(JSON.stringify({ type: 'raw', data: event.line }));
                    }
                });
                wsClients.forEach((info, ws) => {
                    if (info.client === client && ws.readyState === WebSocket.OPEN) {
                        // Send the raw 001 message to the client
                        ws.send(JSON.stringify({ type: 'NICKNAME-UPDATE', nickname: event.line.split(" ")[2] }));
                    }
                });
            }
            if (command === '332') { // TOPIC
                let topicText = params.slice(2).join(' ').replace(/\\b/g, ' ').slice(1);
                let channel = params[1];

                console.log(`📢 Topic for ${channel}: ${topicText}`);

                // Send the topic only to the newly joined client
                wsClients.forEach((info, ws) => {
                    if (info.channel === channel && ws.readyState === WebSocket.OPEN && info.nickname === nickname) {
                        sendTopic(channel, topicText, ws); // Send topic only to this client
                    }
                });
                client.raw(`NAMES ${channelName}`);

                //credits to OldAnalytics for debugging some link / names issues
            }

            if (command === '353') { // NAMES list
                let channelIndex = params.findIndex(p => p.startsWith('%') || p.startsWith('#'));
                if (channelIndex === -1) return;

                let users = params.slice(channelIndex + 1);
                if (users[0].startsWith(':')) users[0] = users[0].slice(1);

                let channel = params[channelIndex];
                nicklist.set(channel, users);
                console.log(`👥 Updated user list for ${channel}:`, users);
                let userCount =  users.length;

                wsClients.forEach((info, ws) => {
                    if (info.channel === channel && ws.readyState === WebSocket.OPEN && info.nickname === nickname) {
                        ws.send(JSON.stringify({ type: 'nicklist', channel, users, userCount }));
                        ws.send(JSON.stringify({ type: 'nicklist-count', users, userCount }));
                    }
                
                });
            }
                //sendNicklist(channel, users, users.length); // Broadcast nicklist to all clients in the channel
            if (command === 'MODE') {
                wsClients.forEach((info, ws) => {
                    if (ws.readyState === WebSocket.OPEN && info.nickname === nickname) {
                        let nick = parts[0].split('!')[0].slice(1); // Extract nickname
                        ws.send(JSON.stringify({ type: 'MODE', nick: nick,raw: params.join(' ') })); // make it a space-separated string

                    }
                
                });

            }

            if (command === 'PART') {
                let nick = parts[0].split('!')[0].slice(1); // Extract nickname
                let channel = params[0]; // Channel name

                console.log(`🚪 ${nick} left ${channel}`);

                if (nicklist.has(channel)) {
                    let users = nicklist.get(channel).filter(user => user !== nick); // Remove the user from the nicklist
                    let userCount = users.length;
                 nicklist.set(channel, users);

                    wsClients.forEach((info, ws) => {
                        if (ws.readyState === WebSocket.OPEN && info.nickname === nickname) {
                            ws.send(JSON.stringify({ type: 'nicklist-count', users, userCount }));
                        }
                    
                    });
                }
            }

            // if (command === 'QUIT') {
            //     let nick = parts[0].split('!')[0].slice(1); // Extract nickname

            //     console.log(`🚪 ${nick} quit IRC`);

            //     // Remove the user from all channels they were in
            //     nicklist.forEach((users, channel) => {
            //         if (users.includes(nick)) {
            //             let users = nicklist.get(channel).filter(user => user !== nick); // Remove the user from the nicklist
            //             let userCount = users.length;
            //              nicklist.set(channel, users);
            //            // let updatedUsersCount = updatedUsers.length;
            //          wsClients.forEach((info, ws) => {
            //                 if (ws.readyState === WebSocket.OPEN && info.nickname === nickname) {
            //                     ws.send(JSON.stringify({ type: 'nicklist-count', users, userCount }));
            //                 }
                        
            //             });
            //             // Send the QUIT message only to the relevant WebSocket client
            //             wsClients.forEach((info, ws) => {
            //                 if (info.client === client && ws.readyState === WebSocket.OPEN) {
            //                     ws.send(JSON.stringify({
            //                         type: 'system',
            //                         message: `${nick} has quit out`,
            //                         nickname: nick,
            //                         event: 'quit'
            //                     }));
            //                 }
            //             });
            //         }
            //     });
            // }
        });


        client.on('mode', (event) => {
            let parts = event.mode;
           //  let command = parts[1];
           // let params = parts.slice(2);
            console.log(event.mode);
        });         
        client.on('join', (event) => {
            console.log(`📢 ${event.nick} joined ${event.channel}`);

            if (!nicklist.has(event.channel)) {
                nicklist.set(event.channel, []);
            }

            // Add the new user if not already in the list
            if (!nicklist.get(event.channel).includes(event.nick)) {
                nicklist.get(event.channel).push(event.nick);
            }

            // Broadcast updated nicklist to all clients in the channel
            // sendNicklist(event.channel, nicklist.get(event.channel), nicklist.get(event.channel).length);
            let users = nicklist.get(event.channel);
            let userCount = nicklist.get(event.channel).length;
            wsClients.forEach((info, ws) => {
                if (ws.readyState === WebSocket.OPEN && info.nickname === nickname) {
                   ws.send(JSON.stringify({ type: 'nicklist-count', users, userCount }));
                }
            
            });
            // Send the JOIN message only to the relevant WebSocket client
            wsClients.forEach((info, ws) => {
                if (info.client === client && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                        type: 'system',
                        message: `${event.nick} has joined the channel`,
                        nickname: event.nick,
                     event: 'join'
                    }));
                }
            });
        });

        client.on('kick', (event) => {
        
            ///    console.dir(event, { depth: null, colors: true }); // Log the event object for debugging
      /*       kicked: '₪ḠḺḮṪḈḤ₪',
            nick: 'num',
            ident: '806cd9595404',
            hostname: 'ANON',
            channel: '%#The\\bLobby',
            message: '',
            time: undefined,
            tags: {},
            batch: undefined */
          

            if (nicklist.has(event.channel)) {
                let users = nicklist.get(event.channel).filter(user => user !== event.kicked); // Remove the user from the nicklist
                let userCount = nicklist.get(event.channel).length;
                wsClients.forEach((info, ws) => {
                    if (ws.readyState === WebSocket.OPEN && info.nickname === nickname) {
                       ws.send(JSON.stringify({ type: 'nicklist-count', users, userCount }));
                    }
                
                });
                nicklist.set(event.channel, users);
                let msg = "";
                // Broadcast updated nicklist to all clients in the channel
               // sendNicklist(event.channel, users, users.length);

                    if (nickname !== event.kicked) {
                        if (event.message != "") {
                msg = `Host ${event.nick} has kicked ${event.kicked} out of the Channel (${event.message})`;
                        }
                else {
                msg = `Host ${event.nick} has kicked ${event.kicked} out of the Channel`;           
                } 
            }      
            else {
                if (event.message != "") {
                    msg = `Host ${event.nick} has kicked You out of the Channel (${event.message})`;
                            }
                    else {
                    msg = `Host ${event.nick} has kicked You out of the Channel`;           
                    } 
                }
                // Send the PART message only to the relevant WebSocket client
                wsClients.forEach((info, ws) => {
                    if (info.client === client && ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({
                            type: 'system',
                            message: msg,
                            nickname: event.nick,
                            knickname: event.kicked,
                            reason: event.message,
                            event: 'kick'
                        }))
                    }
                })
                }
        });
        client.on('part', (event) => {
            console.log(`🚪 ${event.nick} left ${event.channel}`);

            if (nicklist.has(event.channel)) {
                let users = nicklist.get(event.channel).filter(user => user !== event.nick); // Remove the user from the nicklist
                let userCount = nicklist.get(event.channel).length;
                nicklist.set(event.channel, users);
                wsClients.forEach((info, ws) => {
                    if (ws.readyState === WebSocket.OPEN && info.nickname === nickname) {
                       ws.send(JSON.stringify({ type: 'nicklist-count', users, userCount }));
                    }
                
                });
                // Broadcast updated nicklist to all clients in the channel
              //  sendNicklist(event.channel, users, users.length);

                // Send the PART message only to the relevant WebSocket client
                wsClients.forEach((info, ws) => {
                    if (info.client === client && ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({
                            type: 'system',
                            message: `${event.nick} has left the channel`,
                            nickname: event.nick,
                            event: 'part'
                        }));
                    }
                });
            }
        });

        client.on('quit', (event) => {
            console.log(event);
            // Remove the user from all channels they were in
            nicklist.forEach((users, channel) => {
                if (users.includes(event.nick)) {
                    let filteredUsers = users.filter(user => user !== event.nick); // Use a different variable name
                    let userCount = filteredUsers.length;
                    nicklist.set(channel, filteredUsers);
        
                    // Send the updated nicklist and user count to all relevant WebSocket clients
                    wsClients.forEach((info, ws) => {
                        if (ws.readyState === WebSocket.OPEN && info.nickname === nickname) {
                            ws.send(JSON.stringify({ type: 'nicklist-count', users: filteredUsers, userCount }));
                        }
                    });
                }
                wsClients.forEach((info, ws) => {
                    if (info.client === client && ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({
                            type: 'system',
                            message: `${event.nick} has quit out${event.message ? ` (${event.message})` : ''}`,
                            nickname: event.nick,
                            reason: event.message,
                            event: 'quit'
                        }));
                    }
                });
            });
        });
            // Send the QUIT message only to the relevant WebSocket client


        client.on('message', (event) => {
            wsClients.forEach((info, ws) => {
                // Check if the WebSocket client is associated with this IRC client
                if (info.client === client && ws.readyState === WebSocket.OPEN) {
                    // Send the message only to the WebSocket client that started this IRC connection
                    ws.send(JSON.stringify({ type: 'message', nick: event.nick, message: event.message }));
                }
            });
        });

        client.on('close', () => console.log('🔌 IRC connection closed.'));
        client.on('error', (err) => console.error('🛑 IRC error:', err));
    }
});

http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'success', message: 'IRCX daemon running' }));
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', message: 'Not Found' }));
    }
}).listen(PORT, () => console.log(`✅ IRCX daemon running on http://localhost:${PORT}`));