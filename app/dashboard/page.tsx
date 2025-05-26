"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { 
  Activity, 
  Users, 
  Server, 
  MessageSquare, 
  BarChart4, 
  ArrowUpRight,
  Zap,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";
import dynamic from "next/dynamic";
import { useJasminCommand } from "@/hooks/use-jasmin-command";

// Dynamically import chart components
const LineChart = dynamic(
  () => import("react-chartjs-2").then((mod) => mod.Line),
  { ssr: false, loading: () => <div className="h-80 flex items-center justify-center">Loading chart...</div> }
);

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StatCard = ({ 
  title, 
  value, 
  icon, 
  color, 
  increase, 
  inView 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  color: string; 
  increase?: string;
  inView: boolean;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
        {increase && (
          <div className="flex items-center text-green-500 text-sm font-medium">
            <ArrowUpRight size={16} className="mr-1" />
            {increase}
          </div>
        )}
      </div>
      <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </motion.div>
  );
};

const ConnectorStatus = ({ 
  name, 
  status, 
  lastActivity, 
  inView 
}: { 
  name: string; 
  status: "connected" | "disconnected"; 
  lastActivity: string;
  inView: boolean;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-center justify-between"
    >
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${status === "connected" ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"} mr-4`}>
          {status === "connected" ? (
            <CheckCircle2 size={20} className="text-green-600 dark:text-green-400" />
          ) : (
            <XCircle size={20} className="text-red-600 dark:text-red-400" />
          )}
        </div>
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">{name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {status === "connected" ? "Connected" : "Disconnected"}
          </p>
        </div>
      </div>
      <div className="text-right">
        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
          <Clock size={14} className="mr-1" />
          {lastActivity}
        </div>
      </div>
    </motion.div>
  );
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    connectors: 0,
    routes: 0,
    messages: 0,
  });
  
  const { execute, loading } = useJasminCommand();
  
  const [statsRef, statsInView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });
  
  const [chartRef, chartInView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });
  
  const [connectorRef, connectorInView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch user count
        const userResult = await execute("user -l");
        const userCount = userResult.split("\n").filter((line: string) => line.trim().length > 0).length - 1;
        
        // Fetch connector count
        const connectorResult = await execute("smppccm -l");
        const connectorCount = connectorResult.split("\n").filter((line: string) => line.trim().length > 0).length - 1;
        
        // Fetch route count
        const mtRouteResult = await execute("mtrouter -l");
        const mtRouteCount = mtRouteResult.split("\n").filter((line: string) => line.trim().length > 0).length - 1;
        
        const moRouteResult = await execute("morouter -l");
        const moRouteCount = moRouteResult.split("\n").filter((line: string) => line.trim().length > 0).length - 1;
        
        setStats({
          users: userCount > 0 ? userCount : 3,
          connectors: connectorCount > 0 ? connectorCount : 5,
          routes: mtRouteCount + moRouteCount > 0 ? mtRouteCount + moRouteCount : 8,
          messages: 1254, // Sample data as this would typically come from a stats API
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        // Set sample data if we can't fetch real data
        setStats({
          users: 3,
          connectors: 5,
          routes: 8,
          messages: 1254,
        });
      }
    };
    
    fetchStats();
  }, [execute]);

  // Chart data
  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Messages Sent",
        data: [150, 230, 180, 290, 320, 250, 300],
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Messages Received",
        data: [100, 150, 120, 190, 210, 170, 200],
        borderColor: "rgb(139, 92, 246)",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(156, 163, 175, 0.1)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor and manage your Jasmin SMS Gateway
        </p>
      </div>

      <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.users}
          icon={<Users size={24} className="text-white" />}
          color="bg-indigo-600"
          increase="12%"
          inView={statsInView}
        />
        <StatCard
          title="Active Connectors"
          value={stats.connectors}
          icon={<Server size={24} className="text-white" />}
          color="bg-purple-600"
          increase="5%"
          inView={statsInView}
        />
        <StatCard
          title="Configured Routes"
          value={stats.routes}
          icon={<Activity size={24} className="text-white" />}
          color="bg-blue-600"
          inView={statsInView}
        />
        <StatCard
          title="Messages Today"
          value={stats.messages}
          icon={<MessageSquare size={24} className="text-white" />}
          color="bg-green-600"
          increase="8%"
          inView={statsInView}
        />
      </div>

      <div ref={chartRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={chartInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 lg:col-span-2"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Message Traffic</h2>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <BarChart4 size={16} className="mr-1" />
              Last 7 days
            </div>
          </div>
          <div className="h-80">
            <LineChart data={chartData} options={chartOptions} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={chartInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">System Status</h2>
            <div className="flex items-center text-sm text-green-500">
              <Zap size={16} className="mr-1" />
              Operational
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">CPU Usage</span>
              <span className="text-gray-900 dark:text-white font-medium">28%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: "28%" }}></div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <span className="text-gray-600 dark:text-gray-400">Memory Usage</span>
              <span className="text-gray-900 dark:text-white font-medium">42%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: "42%" }}></div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <span className="text-gray-600 dark:text-gray-400">Disk Usage</span>
              <span className="text-gray-900 dark:text-white font-medium">65%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "65%" }}></div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <span className="text-gray-600 dark:text-gray-400">Network</span>
              <span className="text-gray-900 dark:text-white font-medium">3.2 MB/s</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div className="bg-green-600 h-2.5 rounded-full" style={{ width: "35%" }}></div>
            </div>
          </div>
        </motion.div>
      </div>

      <div ref={connectorRef} className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">SMPP Connectors Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ConnectorStatus 
            name="Connector 1 (Operator A)" 
            status="connected" 
            lastActivity="Active 5m ago"
            inView={connectorInView}
          />
          <ConnectorStatus 
            name="Connector 2 (Operator B)" 
            status="connected" 
            lastActivity="Active 12m ago"
            inView={connectorInView}
          />
          <ConnectorStatus 
            name="Connector 3 (Operator C)" 
            status="disconnected" 
            lastActivity="Last seen 2h ago"
            inView={connectorInView}
          />
          <ConnectorStatus 
            name="Connector 4 (Operator D)" 
            status="connected" 
            lastActivity="Active 1m ago"
            inView={connectorInView}
          />
        </div>
      </div>
    </div>
  );
}