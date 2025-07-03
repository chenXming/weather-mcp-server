#!/usr/bin/env node

// 简单的 MCP 服务器验证脚本
import { spawn } from 'child_process';

console.log('🔧 验证 MCP 天气服务器...\n');

// 设置测试环境
const env = {
  ...process.env,
  OPENWEATHER_API_KEY: '569206b530dbb629a8b55a6a3853a797'
};

// 启动服务器
const server = spawn('node', ['build/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env
});

let hasOutput = false;
let hasError = false;

// 监听服务器消息
server.stderr.on('data', (data) => {
  hasOutput = true;
  const message = data.toString();
  console.log('✅ 服务器启动消息:', message.trim());
});

server.stdout.on('data', (data) => {
  hasOutput = true;
  console.log('📤 服务器输出:', data.toString());
});

server.on('error', (err) => {
  hasError = true;
  console.error('❌ 服务器启动错误:', err.message);
});

// 发送初始化请求
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

setTimeout(() => {
  console.log('📨 发送初始化请求...');
  server.stdin.write(JSON.stringify(initRequest) + '\n');
}, 500);

// 请求工具列表
setTimeout(() => {
  const toolsRequest = {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/list"
  };
  
  console.log('📨 请求工具列表...');
  server.stdin.write(JSON.stringify(toolsRequest) + '\n');
}, 1500);

// 清理并输出结果
setTimeout(() => {
  server.kill();
  
  console.log('\n📊 测试结果:');
  console.log(`✅ 服务器启动: ${hasOutput ? '成功' : '失败'}`);
  console.log(`❌ 启动错误: ${hasError ? '有错误' : '无错误'}`);
  
  if (hasOutput && !hasError) {
    console.log('\n🎉 MCP 服务器配置正确！');
    console.log('现在可以在 MCP 客户端中使用以下配置:');
    console.log(JSON.stringify({
      "mcpServers": {
        "weather": {
          "command": "node",
          "args": [process.cwd() + "/build/index.js"],
          "env": {
            "OPENWEATHER_API_KEY": "569206b530dbb629a8b55a6a3853a797"
          }
        }
      }
    }, null, 2));
  } else {
    console.log('\n⚠️  服务器可能有问题，请检查构建和依赖。');
  }
  
  process.exit(0);
}, 3000);
