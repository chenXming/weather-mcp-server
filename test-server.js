#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serverPath = join(__dirname, 'build', 'index.js');

console.log('Testing MCP Server...');

const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: {
    ...process.env,
    OPENWEATHER_API_KEY: '569206b530dbb629a8b55a6a3853a797'
  }
});

server.stderr.on('data', (data) => {
  console.log('Server stderr:', data.toString());
});

server.stdout.on('data', (data) => {
  console.log('Server stdout:', data.toString());
});

// Send initialize request
const initRequest = {
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: {
      name: "test-client",
      version: "1.0.0"
    }
  }
};

server.stdin.write(JSON.stringify(initRequest) + '\n');

setTimeout(() => {
  console.log('Terminating server...');
  server.kill();
}, 3000);

server.on('close', (code) => {
  console.log(`Server exited with code ${code}`);
});
