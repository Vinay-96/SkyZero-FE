import { useEffect, useState } from "react";
import {
  Server,
  Database,
  MemoryStick,
  Cpu,
  Disc,
  AlertCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Signal,
  Clock,
} from "lucide-react";
import { apiService } from "@/lib/api/services/api.service";

interface SystemHealth {
  server: {
    status: string;
    uptime: number;
    nodeVersion: string;
    memoryUsage: Record<string, string>;
    cpuUsage: Record<string, string>;
    systemLoadAverage: number[];
  };
  database: {
    status: string;
    responseTime: string;
  };
  redis: {
    status: string;
    responseTime: string;
  };
  externalAPI: {
    status: string;
  };
  disk: {
    status: string;
    totalSpace: string;
    usedSpace: string;
    availableSpace: string;
    usedPercentage: string;
  };
  resourceAlerts: string[];
  status: string;
}

// API function for fetching trades
const fetchAppHealth = async () => {
  try {
    const response = apiService.health.getApplicationHealth();
    if (!response) {
      throw new Error("Failed to fetch trades");
    }
    return response;
  } catch (error) {
    throw new Error(error.message);
  }
};

export default function SystemHealthPage() {
  const [data, setData] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        const response = await fetchAppHealth();
        if (!response) throw new Error("Failed to fetch health data");
        const data = await response.data;
        setData(data[0]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchHealthData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "up":
      case "healthy":
      case "connected":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "unhealthy":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg mx-4 my-8">
        Error: {error || "No health data available"}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3">
        <AlertTriangle className="w-6 h-6 text-red-600" />
        <div>
          <h2 className="text-xl font-semibold text-red-800">
            System Status: {data.status}
          </h2>
          {data.resourceAlerts.length > 0 && (
            <ul className="list-disc pl-5 mt-2">
              {data.resourceAlerts.map((alert, i) => (
                <li key={i} className="text-red-700">
                  {alert}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Server Health */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3 mb-4">
            <Server className="w-6 h-6 text-blue-500" />
            <h3 className="text-lg font-semibold">Server Health</h3>
            {getStatusIcon(data.server.status)}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Uptime</span>
              <span>{data.server.uptime.toFixed(2)} days</span>
            </div>
            <div className="flex justify-between">
              <span>Node Version</span>
              <span>{data.server.nodeVersion}</span>
            </div>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3 mb-4">
            <MemoryStick className="w-6 h-6 text-purple-500" />
            <h3 className="text-lg font-semibold">Memory Usage</h3>
          </div>
          <div className="space-y-2">
            {Object.entries(data.server.memoryUsage).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span>{key}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CPU Usage */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3 mb-4">
            <Cpu className="w-6 h-6 text-orange-500" />
            <h3 className="text-lg font-semibold">CPU Usage</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Model</span>
              <span>{data.server.cpuUsage.model}</span>
            </div>
            <div className="flex justify-between">
              <span>Usage</span>
              <span>{data.server.cpuUsage.cpuUsagePercent}</span>
            </div>
          </div>
        </div>

        {/* Database */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-green-500" />
            <h3 className="text-lg font-semibold">Database</h3>
            {getStatusIcon(data.database.status)}
          </div>
          <div className="flex justify-between">
            <span>Response Time</span>
            <span>{data.database.responseTime}</span>
          </div>
        </div>

        {/* Redis */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3 mb-4">
            <Signal className="w-6 h-6 text-red-500" />
            <h3 className="text-lg font-semibold">Redis</h3>
            {getStatusIcon(data.redis.status)}
          </div>
          <div className="flex justify-between">
            <span>Response Time</span>
            <span>{data.redis.responseTime}</span>
          </div>
        </div>

        {/* External API */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-blue-500" />
            <h3 className="text-lg font-semibold">External API</h3>
            {getStatusIcon(data.externalAPI.status)}
          </div>
        </div>

        {/* Disk Usage */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3 mb-4">
            <Disc className="w-6 h-6 text-yellow-500" />
            <h3 className="text-lg font-semibold">Disk Usage</h3>
            {getStatusIcon(data.disk.status)}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Space</span>
              <span>{data.disk.totalSpace}</span>
            </div>
            <div className="flex justify-between">
              <span>Used Space</span>
              <span>{data.disk.usedSpace}</span>
            </div>
            <div className="flex justify-between">
              <span>Available Space</span>
              <span>{data.disk.availableSpace}</span>
            </div>
            <div className="pt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: data.disk.usedPercentage }}
                />
              </div>
              <div className="text-right text-sm mt-1">
                {data.disk.usedPercentage} used
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

