import { useEffect, useState } from "react";
import {
  Server,
  Database,
  MemoryStick,
  Cpu,
  Disc,
  AlertCircle,
  AlertTriangle,
  Signal,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiService } from "@/lib/api/services/api.service";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import { Alert } from "./ui/alert";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
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

const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "up":
    case "healthy":
    case "connected":
      return "success";
    case "unhealthy":
      return "destructive";
    default:
      return "warning";
  }
};

const SystemHealthPage = () => {
  const [data, setData] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.health.getApplicationHealth();
      if (!response.data) throw new Error("Invalid health data structure");
      setData(response.data[0]);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={fetchHealthData} />;
  if (!data) return <EmptyState />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">
          System Health Dashboard
        </h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      {data.resourceAlerts.length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-5 w-5" />
          <div className="space-y-1">
            <h3 className="font-semibold">System Status: {data.status}</h3>
            <ul className="list-disc pl-5">
              {data.resourceAlerts.map((alert, i) => (
                <li key={i}>{alert}</li>
              ))}
            </ul>
          </div>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <HealthCard
          icon={<Server className="h-5 w-5" />}
          title="Server Health"
          status={data.server.status}
        >
          <MetricItem
            label="Uptime"
            value={`${data.server.uptime.toFixed(2)} days`}
          />
          <MetricItem label="Node Version" value={data.server.nodeVersion} />
          <MetricItem
            label="Load Average"
            value={data.server.systemLoadAverage.join(" / ")}
          />
        </HealthCard>

        <HealthCard
          icon={<MemoryStick className="h-5 w-5" />}
          title="Memory Usage"
          status={data.server.status}
        >
          {Object.entries(data.server.memoryUsage).map(([key, value]) => (
            <MetricItem key={key} label={key} value={value} />
          ))}
        </HealthCard>

        <HealthCard
          icon={<Cpu className="h-5 w-5" />}
          title="CPU Usage"
          status={data.server.status}
        >
          <MetricItem label="Model" value={data.server.cpuUsage.model} />
          <MetricItem
            label="Usage"
            value={data.server.cpuUsage.cpuUsagePercent}
          />
        </HealthCard>

        <HealthCard
          icon={<Database className="h-5 w-5" />}
          title="Database"
          status={data.database.status}
        >
          <MetricItem
            label="Response Time"
            value={data.database.responseTime}
          />
        </HealthCard>

        <HealthCard
          icon={<Signal className="h-5 w-5" />}
          title="Redis"
          status={data.redis.status}
        >
          <MetricItem label="Response Time" value={data.redis.responseTime} />
        </HealthCard>

        <HealthCard
          icon={<Clock className="h-5 w-5" />}
          title="External API"
          status={data.externalAPI.status}
        />

        <HealthCard
          icon={<Disc className="h-5 w-5" />}
          title="Disk Usage"
          status={data.disk.status}
          className="lg:col-span-2"
        >
          <div className="grid grid-cols-2 gap-4">
            <MetricItem label="Total Space" value={data.disk.totalSpace} />
            <MetricItem label="Used Space" value={data.disk.usedSpace} />
            <MetricItem
              label="Available Space"
              value={data.disk.availableSpace}
            />
          </div>
          <div className="space-y-2">
            <Progress
              value={parseFloat(data.disk.usedPercentage)}
              variant={getStatusVariant(data.disk.status)}
              className="h-2"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Storage Utilization</span>
              <span>{data.disk.usedPercentage}</span>
            </div>
          </div>
        </HealthCard>
      </div>
    </div>
  );
};

interface HealthCardProps {
  icon: React.ReactNode;
  title: string;
  status: string;
  children?: React.ReactNode;
  className?: string;
}

const HealthCard = ({
  icon,
  title,
  status,
  children,
  className,
}: HealthCardProps) => {
  const variant = getStatusVariant(status);

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">{icon}</div>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <Badge variant={variant}>{status}</Badge>
      </div>
      {children && <div className="space-y-3">{children}</div>}
    </Card>
  );
};

const MetricItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

const LoadingState = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(7)].map((_, i) => (
      <Card key={i} className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, j) => (
            <Skeleton key={j} className="h-4 w-full" />
          ))}
        </div>
      </Card>
    ))}
  </div>
);

const ErrorState = ({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
    <Alert variant="destructive" className="max-w-md">
      <AlertCircle className="h-5 w-5" />
      <div className="space-y-2">
        <h3 className="font-semibold">Health Check Failed</h3>
        <p>{error}</p>
      </div>
    </Alert>
    <Button onClick={onRetry} variant="outline">
      Retry
    </Button>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
    <div className="text-center space-y-2">
      <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
      <p className="text-muted-foreground">No health data available</p>
    </div>
  </div>
);

export default SystemHealthPage;

