#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('Testing MCP Weather Server...');

// Start the MCP server
const server = spawn('node', ['build/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: {
    ...process.env,
    OPENWEATHER_API_KEY: '569206b530dbb629a8b55a6a3853a797'
  }
});

let output = '';
let errorOutput = '';

server.stdout.on('data', (data) => {
  output += data.toString();
  console.log('STDOUT:', data.toString());
});

server.stderr.on('data', (data) => {
  errorOutput += data.toString();
  console.log('STDERR:', data.toString());
});

// Send initialize message
const initMessage = {
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: {
      name: "test",
      version: "1.0.0"
    }
  }
};

console.log('Sending initialize message...');
server.stdin.write(JSON.stringify(initMessage) + '\n');

// Wait a bit for response
setTimeout(() => {
  // Send list tools request
  const listToolsMessage = {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/list"
  };
  
  console.log('Sending tools/list message...');
  server.stdin.write(JSON.stringify(listToolsMessage) + '\n');
}, 1000);

// Clean up after 5 seconds
setTimeout(() => {
  console.log('Cleaning up...');
  server.kill();
  
  console.log('\n=== SUMMARY ===');
  console.log('Output received:', output.length > 0);
  console.log('Error output received:', errorOutput.length > 0);
  
  process.exit(0);
}, 5000);

server.on('error', (err) => {
  console.error('Server error:', err);
});

server.on('close', (code) => {
  console.log('Server closed with code:', code);
});
