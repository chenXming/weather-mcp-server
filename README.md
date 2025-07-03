# 🌤️ MCP Weather Server / 全球天气MCP服务器

[![npm version](https://badge.fury.io/js/%40chenxming%2Fmcp-weather-server.svg)](https://badge.fury.io/js/%40chenxming%2Fmcp-weather-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful Model Context Protocol (MCP) server that provides global weather information with special support for Chinese cities. Perfect for AI assistants like Claude to access real-time weather data.

一个强大的模型上下文协议(MCP)服务器，提供全球天气信息，特别优化了对中国城市的支持。

## ✨ Features / 功能特性

### 🌍 Global Weather Support / 全球天气支持
- **Current Weather** - Real-time weather for any city worldwide / 全球任意城市的实时天气
- **5-Day Forecast** - Detailed weather forecasts / 详细的5天天气预报  
- **Chinese Cities** - Native support for Chinese city names / 原生支持中文城市名称
- **Multiple Units** - Celsius, Fahrenheit, Kelvin / 摄氏度、华氏度、开尔文

### 🇺🇸 US-Specific Features / 美国专用功能
- **Weather Alerts** - State-level weather alerts / 州级天气警报
- **Coordinate Forecasts** - Precise location-based forecasts / 基于坐标的精确预报

## 📦 Installation / 安装

```bash
npm install -g @chenxming/mcp-weather-server
```

Or use without installation:
```bash
npx @chenxming/mcp-weather-server
```

## 🚀 Quick Start / 快速开始

### 1. Get API Key / 获取API密钥

Get a free API key from [OpenWeatherMap](https://openweathermap.org/api)

在 [OpenWeatherMap](https://openweathermap.org/api) 注册获取免费API密钥

### 2. Configure MCP Client / 配置MCP客户端

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "weather": {
      "command": "npx",
      "args": ["@chenxming/mcp-weather-server"],
      "env": {
        "OPENWEATHER_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### 3. Alternative: Local Installation / 本地安装方式

```json
{
  "mcpServers": {
    "weather": {
      "command": "mcp-weather",
      "env": {
        "OPENWEATHER_API_KEY": "your_api_key_here"
      }
    }
}
```

## 🛠️ Available Tools / 可用工具

### 🌐 Global Weather Tools / 全球天气工具

#### `get-current-weather`
Get current weather for any city worldwide / 获取任意城市的当前天气

**Parameters / 参数:**
- `city` (required): City name in Chinese or English / 城市名称，支持中英文
- `country` (optional): Country code like CN, US / 国家代码
- `units` (optional): Temperature unit / 温度单位
  - `metric` (default): Celsius / 摄氏度
  - `imperial`: Fahrenheit / 华氏度  
  - `kelvin`: Kelvin / 开尔文

**Examples / 示例:**
- Beijing: `city: "北京"` or `city: "Beijing", country: "CN"`
- New York: `city: "New York", country: "US"`

#### `get-weather-forecast`
Get 5-day weather forecast / 获取5天天气预报

**Parameters / 参数:**
- `city` (required): City name / 城市名称
- `country` (optional): Country code / 国家代码
- `units` (optional): Temperature unit / 温度单位

### 🇺🇸 US-Specific Tools / 美国专用工具

#### `get-alerts`
Get weather alerts for US states / 获取美国州级天气警报

**Parameters / 参数:**
- `state` (required): Two-letter state code / 两位字母州代码 (e.g., CA, NY)

#### `get-forecast`
Get coordinate-based forecast for US locations / 基于坐标的美国地区预报

**Parameters / 参数:**
- `latitude` (required): Latitude (-90 to 90) / 纬度
- `longitude` (required): Longitude (-180 to 180) / 经度

## 📝 Usage Examples / 使用示例

### Query Chinese Cities / 查询中国城市
```json
{
  "tool": "get-current-weather",
  "parameters": {
    "city": "上海",
    "units": "metric"
  }
}
```

### Query Global Forecast / 查询全球预报
```json
{
  "tool": "get-weather-forecast", 
  "parameters": {
    "city": "London",
    "country": "GB"
  }
}
```

### US Weather Alerts / 美国天气警报
```json
{
  "tool": "get-alerts",
  "parameters": {
    "state": "CA"
  }
}
```

## 🌏 Supported Cities / 支持的城市

- 🇨🇳 **China**: Beijing, Shanghai, Guangzhou, Shenzhen, Hangzhou, Chengdu...
- 🇺🇸 **United States**: New York, Los Angeles, Chicago, Houston...  
- 🌍 **Global**: London, Tokyo, Paris, Sydney, Seoul, Mumbai...
- ✅ **Chinese & English** city names supported / 支持中英文城市名

## 🔧 Development / 开发

### Local Setup / 本地设置
```bash
git clone https://github.com/chenxming/mcp-weather-server.git
cd mcp-weather-server
npm install
npm run build
```

### Development Mode / 开发模式
```bash
npm run dev  # Watch mode
```

## 📊 API Data Sources / API数据源

- **Global Weather**: OpenWeatherMap API / 全球天气：OpenWeatherMap API
- **US Weather**: National Weather Service (NWS) API / 美国天气：国家气象服务API

## ⚡ Requirements / 系统要求

- Node.js >= 18.0.0
- OpenWeatherMap API key (free) / OpenWeatherMap API密钥（免费）

## 📄 License / 许可证

MIT License - see [LICENSE](LICENSE) file

## 🤝 Contributing / 贡献

1. Fork the repository
2. Create a feature branch
3. Make your changes  
4. Add tests if applicable
5. Submit a pull request

## 🐛 Issues / 问题报告

Report issues at: https://github.com/chenxming/mcp-weather-server/issues

## 📞 Support / 支持

- GitHub Issues: Bug reports and feature requests
- Email: your.email@example.com
