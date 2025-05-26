"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { 
  BarChart, 
  RefreshCw,
  Users,
  Server,
  Globe,
  MessageSquare,
  Clock,
  Activity
} from "lucide-react";
import { useJasminCommand } from "@/hooks/use-jasmin-command";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";

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

interface UserStats {
  uid: string;
  mt: {
    count: number;
    throughput: number;
  };
  submit_sm_request_count: number;
  delivered_count: number;
  failed_count: number;
  last_activity_at: string;
}

interface ConnectorStats {
  cid: string;
  session: {
    connected_at: string;
    bound_at: string;
    disconnected_at: string;
  };
  session_state: string;
  submit_sm_request_count: number;
  delivered_count: number;
  failed_count: number;
  throughput: number;
}

export default function StatsPage() {
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [connectorStats, setConnectorStats] = useState<ConnectorStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"users" | "connectors">("users");
  
  const { execute } = useJasminCommand();
  
  const [chartRef, chartInView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });
  
  const [statsRef, statsInView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // Fetch user stats
      const userResult = await execute("stats --users");
      
      // Parse user stats (simplified for demo)
      const parsedUserStats: UserStats[] = [
        {
          uid: "user1",
          mt: {
            count: 1250,
            throughput: 12.5,
          },
          submit_sm_request_count: 1300,
          delivered_count: 1200,
          failed_count: 50,
          last_activity_at: "2023-06-15 14:30:22",
        },
        {
          uid: "user2",
          mt: {
            count: 850,
            throughput: 8.2,
          },
          submit_sm_request_count: 900,
          delivered_count: 820,
          failed_count: 30,
          last_activity_at: "2023-06-15 15:45:10",
        },
      ];
      
      setUserStats(parsedUserStats);
      
      // Fetch connector stats
      const connectorResult = await execute("stats --smppcs");
      
      // Parse connector stats (simplified for demo)
      const parsedConnectorStats: ConnectorStats[] = [
        {
          cid: "connector1",
          session: {
            connected_at: "2023-06-15 08:00:15",
            bound_at: "2023-06-15 08:00:18",
            disconnected_at: "",
          },
          session_state: "BOUND_TRX",
          submit_sm_request_count: 1500,
          delivered_count: 1450,
          failed_count: 50,
          throughput: 15.2,
        },
        {
          cid: "connector2",
          session: {
            connected_at: "2023-06-15 08:15:22",
            bound_at: "2023-06-15 08:15:25",
            disconnected_at: "",
          },
          session_state: "BOUND_TRX",
          submit_sm_request_count: 950,
          delivered_count: 920,
          failed_count: 30,
          throughput: 9.8,
        },
      ];
      
      setConnectorStats(parsedConnectorStats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to fetch statistics");
      
      // Set sample data if we can't fetch real data
      setUserStats([
        {
          uid: "user1",
          mt: {
            count: 1250,
            throughput: 12.5,
          },
          submit_sm_request_count: 1300,
          delivered_count: 1200,
          failed_count: 50,
          last_activity_at: "2023-06-15 14:30:22",
        },
        {
          uid: "user2",
          mt: {
            count: 850,
            throughput: 8.2,
          },
          submit_sm_request_count: 900,
          delivered_count: 820,
          failed_count: 30,
          last_activity_at: "2023-06-15 15:45:10",
        },
      ]);
      
      setConnectorStats([
        {
          cid: "connector1",
          session: {
            connected_at: "2023-06-15 08:00:15",
            bound_at: "2023-06-15 08:00:18",
            disconnected_at: "",
          },
          session_state: "BOUND_TRX",
          submit_sm_request_count: 1500,
          delivered_count: 1450,
          failed_count: 50,
          throughput: 15.2,
        },
        {
          cid: "connector2",
          session: {
            connected_at: "2023-06-15 08:15:22",
            bound_at: "2023-06-15 08:15:25",
            disconnected_at: "",
          },
          session_state: "BOUND_TRX",
          submit_sm_request_count: 950,
          delivered_count: 920,
          failed_count: 30,
          throughput: 9.8,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [execute]);

  // Chart data for users
  const userChartData = {
    labels: userStats.map(user => user.uid),
    datasets: [
      {
        label: "Messages Sent",
        data: userStats.map(user => user.mt.count),
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Delivered",
        data: userStats.map(user => user.delivered_count),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Failed",
        data: userStats.map(user => user.failed_count),
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Chart data for connectors
  const connectorChartData = {
    labels: connectorStats.map(connector => connector.cid),
    datasets: [
      {
        label: "Messages Processed",
        data: connectorStats.map(connector => connector.submit_sm_request_count),
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Delivered",
        data: connectorStats.map(connector => connector.delivered_count),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Failed",
        data: connectorStats.map(connector => connector.failed_count),
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BarChart className="h-8 w-8" />
          Statistics
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View performance statistics for Jasmin SMS Gateway
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex gap-2">
          <button
            className={`btn ${activeTab === "users" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setActiveTab("users")}
          >
            <Users size={18} />
            User Stats
          </button>
          <button
            className={`btn ${activeTab === "connectors" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setActiveTab("connectors")}
          >
            <Server size={18} />
            Connector Stats
          </button>
        </div>
        <button
          className="btn btn-outline"
          onClick={fetchStats}
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          <div ref={chartRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={chartInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="h-80"
            >
              <LineChart 
                data={activeTab === "users" ? userChartData : connectorChartData} 
                options={chartOptions} 
              />
            </motion.div>
          </div>

          <div ref={statsRef}>
            {activeTab === "users" ? (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userStats.map((user, index) => (
                    <motion.div
                      key={user.uid}
                      initial={{ opacity: 0, y: 20 }}
                      animate={statsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <div className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900 mr-3">
                            <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{user.uid}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                              <Clock size={14} className="mr-1" />
                              Last active: {user.last_activity_at}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Messages Sent</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">{user.mt.count}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Throughput</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">{user.mt.throughput}/s</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Delivered</p>
                          <p className="text-xl font-bold text-green-600 dark:text-green-400">{user.delivered_count}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Failed</p>
                          <p className="text-xl font-bold text-red-600 dark:text-red-400">{user.failed_count}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Connector Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {connectorStats.map((connector, index) => (
                    <motion.div
                      key={connector.cid}
                      initial={{ opacity: 0, y: 20 }}
                      animate={statsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900 mr-3">
                            <Globe className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{connector.cid}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                              <Activity size={14} className="mr-1" />
                              State: {connector.session_state}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Connected at: {connector.session.connected_at}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Bound at: {connector.session.bound_at}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Messages</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">{connector.submit_sm_request_count}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Throughput</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">{connector.throughput}/s</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Delivered</p>
                          <p className="text-xl font-bold text-green-600 dark:text-green-400">{connector.delivered_count}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Failed</p>
                          <p className="text-xl font-bold text-red-600 dark:text-red-400">{connector.failed_count}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}