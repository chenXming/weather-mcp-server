#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const NWS_API_BASE = "https://api.weather.gov";
const OPENWEATHER_API_BASE = "https://api.openweathermap.org/data/2.5";
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || "2c68b7013a7c2143eb0a5a6845e41b85";
const USER_AGENT = "weather-app/1.0";

// 创建 server instance
const server = new McpServer({
  name: "weather",
  version: "1.0.0",
  capabilities: {
    tools: {},
  },
});

// Helper function 用于发送 NWS API 请求
async function makeNWSRequest<T>(url: string): Promise<T | null> {
  const headers = {
    "User-Agent": USER_AGENT,
    Accept: "application/geo+json",
  };

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error("Error making NWS request:", error);
    return null;
  }
}

// Helper function 用于发送 OpenWeatherMap API 请求
async function makeOpenWeatherRequest<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error("Error making OpenWeather request:", error);
    return null;
  }
}

interface AlertFeature {
  properties: {
    event?: string;
    areaDesc?: string;
    severity?: string;
    status?: string;
    headline?: string;
  };
}

interface ForecastPeriod {
  name?: string;
  temperature?: number;
  temperatureUnit?: string;
  windSpeed?: string;
  windDirection?: string;
  shortForecast?: string;
}

interface AlertsResponse {
  features: AlertFeature[];
}

interface PointsResponse {
  properties: {
    forecast?: string;
  };
}

interface ForecastResponse {
  properties: {
    periods: ForecastPeriod[];
  };
}

// OpenWeatherMap API 类型定义
interface OpenWeatherCurrentResponse {
  name: string;
  sys: {
    country: string;
  };
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  visibility?: number;
  clouds: {
    all: number;
  };
}

interface OpenWeatherForecastResponse {
  city: {
    name: string;
    country: string;
  };
  list: Array<{
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      humidity: number;
    };
    weather: Array<{
      main: string;
      description: string;
    }>;
    wind: {
      speed: number;
      deg: number;
    };
    dt_txt: string;
  }>;
}

// 格式化警报数据
function formatAlert(feature: AlertFeature): string {
  const props = feature.properties;
  return [
    `Event: ${props.event || "Unknown"}`,
    `Area: ${props.areaDesc || "Unknown"}`,
    `Severity: ${props.severity || "Unknown"}`,
    `Status: ${props.status || "Unknown"}`,
    `Headline: ${props.headline || "No headline"}`,
    "---",
  ].join("\n");
}

// 格式化风向
function getWindDirection(deg: number): string {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return directions[Math.round(deg / 22.5) % 16];
}

// 注册天气 tools
server.tool(
  "get-alerts",
  "获取某个州的天气警报",
  {
    state: z.string().length(2).describe("两个字母的州代码（例如 CA、NY）"),
  },
  async ({ state }) => {
    const stateCode = state.toUpperCase();
    const alertsUrl = `${NWS_API_BASE}/alerts?area=${stateCode}`;
    const alertsData = await makeNWSRequest<AlertsResponse>(alertsUrl);

    if (!alertsData) {
      return {
        content: [
          {
            type: "text",
            text: "未能检索警报数据",
          },
        ],
      };
    }

    const features = alertsData.features || [];
    if (features.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No active alerts for ${stateCode}`,
          },
        ],
      };
    }

    const formattedAlerts = features.map(formatAlert);
    const alertsText = `Active alerts for ${stateCode}:\n\n${formattedAlerts.join(
      "\n"
    )}`;

    return {
      content: [
        {
          type: "text",
          text: alertsText,
        },
      ],
    };
  }
);

server.tool(
  "get-forecast",
  "获取某个位置的天气预报",
  {
    latitude: z.number().min(-90).max(90).describe("位置的纬度"),
    longitude: z.number().min(-180).max(180).describe("位置的经度"),
  },
  async ({ latitude, longitude }) => {
    // 获取网格点数据
    const pointsUrl = `${NWS_API_BASE}/points/${latitude.toFixed(
      4
    )},${longitude.toFixed(4)}`;
    const pointsData = await makeNWSRequest<PointsResponse>(pointsUrl);

    if (!pointsData) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to retrieve grid point data for coordinates: ${latitude}, ${longitude}. This location may not be supported by the NWS API (only US locations are supported).`,
          },
        ],
      };
    }

    const forecastUrl = pointsData.properties?.forecast;
    if (!forecastUrl) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to get forecast URL from grid point data",
          },
        ],
      };
    }

    // 获取预报数据
    const forecastData = await makeNWSRequest<ForecastResponse>(forecastUrl);
    if (!forecastData) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve forecast data",
          },
        ],
      };
    }

    const periods = forecastData.properties?.periods || [];
    if (periods.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No forecast periods available",
          },
        ],
      };
    }

    // 格式化预报 periods
    const formattedForecast = periods.map((period: ForecastPeriod) =>
      [
        `${period.name || "Unknown"}:`,
        `Temperature: ${period.temperature || "Unknown"}°${
          period.temperatureUnit || "F"
        }`,
        `Wind: ${period.windSpeed || "Unknown"} ${period.windDirection || ""}`,
        `${period.shortForecast || "No forecast available"}`,
        "---",
      ].join("\n")
    );

    const forecastText = `Forecast for ${latitude}, ${longitude}:\n\n${formattedForecast.join(
      "\n"
    )}`;

    return {
      content: [
        {
          type: "text",
          text: forecastText,
        },
      ],
    };
  }
);

server.tool(
  "get-current-weather",
  "获取全球任意城市的当前天气（支持中国城市）",
  {
    city: z.string().describe("城市名称，可以是中文或英文（如：北京、Beijing、上海、Shanghai、New York等）"),
    country: z.string().optional().describe("国家代码（可选，如CN表示中国，US表示美国）"),
    units: z.enum(["metric", "imperial", "kelvin"]).default("metric").describe("温度单位：metric(摄氏度)、imperial(华氏度)、kelvin(开尔文)"),
  },
  async ({ city, country, units }) => {
    let query = city;
    if (country) {
      query += `,${country}`;
    }
    
    const currentUrl = `${OPENWEATHER_API_BASE}/weather?q=${encodeURIComponent(query)}&appid=${OPENWEATHER_API_KEY}&units=${units}&lang=zh_cn`;
    const weatherData = await makeOpenWeatherRequest<OpenWeatherCurrentResponse>(currentUrl);

    if (!weatherData) {
      return {
        content: [
          {
            type: "text",
            text: `无法获取 ${city} 的天气数据。请检查城市名称是否正确，或确保API密钥有效。`,
          },
        ],
      };
    }

    const tempUnit = units === "metric" ? "°C" : units === "imperial" ? "°F" : "K";
    const windSpeedUnit = units === "metric" ? "m/s" : "mph";
    const windDir = weatherData.wind?.deg ? getWindDirection(weatherData.wind.deg) : "未知";

    const weatherText = [
      `📍 ${weatherData.name}, ${weatherData.sys.country}`,
      `🌡️ 温度: ${Math.round(weatherData.main.temp)}${tempUnit} (体感 ${Math.round(weatherData.main.feels_like)}${tempUnit})`,
      `🌡️ 温度范围: ${Math.round(weatherData.main.temp_min)}${tempUnit} - ${Math.round(weatherData.main.temp_max)}${tempUnit}`,
      `☁️ 天气: ${weatherData.weather[0]?.description || "未知"}`,
      `💨 风速: ${weatherData.wind?.speed || 0} ${windSpeedUnit} ${windDir}`,
      `💧 湿度: ${weatherData.main.humidity}%`,
      `📊 气压: ${weatherData.main.pressure} hPa`,
      weatherData.visibility ? `👁️ 能见度: ${(weatherData.visibility / 1000).toFixed(1)} km` : "",
      `☁️ 云量: ${weatherData.clouds.all}%`,
    ].filter(Boolean).join("\n");

    return {
      content: [
        {
          type: "text",
          text: weatherText,
        },
      ],
    };
  }
);

server.tool(
  "get-weather-forecast",
  "获取全球任意城市的5天天气预报（支持中国城市）",
  {
    city: z.string().describe("城市名称，可以是中文或英文（如：北京、Beijing、上海、Shanghai、New York等）"),
    country: z.string().optional().describe("国家代码（可选，如CN表示中国，US表示美国）"),
    units: z.enum(["metric", "imperial", "kelvin"]).default("metric").describe("温度单位：metric(摄氏度)、imperial(华氏度)、kelvin(开尔文)"),
  },
  async ({ city, country, units }) => {
    let query = city;
    if (country) {
      query += `,${country}`;
    }
    
    const forecastUrl = `${OPENWEATHER_API_BASE}/forecast?q=${encodeURIComponent(query)}&appid=${OPENWEATHER_API_KEY}&units=${units}&lang=zh_cn`;
    const forecastData = await makeOpenWeatherRequest<OpenWeatherForecastResponse>(forecastUrl);

    if (!forecastData) {
      return {
        content: [
          {
            type: "text",
            text: `无法获取 ${city} 的天气预报数据。请检查城市名称是否正确，或确保API密钥有效。`,
          },
        ],
      };
    }

    const tempUnit = units === "metric" ? "°C" : units === "imperial" ? "°F" : "K";
    const windSpeedUnit = units === "metric" ? "m/s" : "mph";

    // 按日期分组预报数据
    const dailyForecasts = new Map<string, typeof forecastData.list>();
    
    forecastData.list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyForecasts.has(date)) {
        dailyForecasts.set(date, []);
      }
      dailyForecasts.get(date)!.push(item);
    });

    const formattedForecasts: string[] = [];
    
    for (const [date, dayData] of dailyForecasts) {
      const dayTemps = dayData.map(d => d.main.temp);
      const minTemp = Math.min(...dayTemps);
      const maxTemp = Math.max(...dayTemps);
      
      // 使用中午12点的数据作为主要天气描述
      const midDayData = dayData.find(d => d.dt_txt.includes('12:00:00')) || dayData[0];
      const windDir = midDayData.wind?.deg ? getWindDirection(midDayData.wind.deg) : "未知";
      
      const dateObj = new Date(date);
      const dateStr = dateObj.toLocaleDateString('zh-CN', { 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      });

      formattedForecasts.push([
        `📅 ${dateStr}`,
        `🌡️ ${Math.round(minTemp)}${tempUnit} - ${Math.round(maxTemp)}${tempUnit}`,
        `☁️ ${midDayData.weather[0]?.description || "未知"}`,
        `💨 ${midDayData.wind?.speed || 0} ${windSpeedUnit} ${windDir}`,
        `💧 湿度: ${midDayData.main.humidity}%`,
        "---",
      ].join("\n"));
    }

    const forecastText = `🌤️ ${forecastData.city.name}, ${forecastData.city.country} 5天天气预报：\n\n${formattedForecasts.join("\n")}`;

    return {
      content: [
        {
          type: "text",
          text: forecastText,
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Global Weather MCP Server running on stdio");
  console.error("Supports US weather (NWS API) and worldwide weather (OpenWeatherMap API)");
  console.error("Tools available: get-alerts, get-forecast, get-current-weather, get-weather-forecast");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
