"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { 
  Server, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Square,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Globe
} from "lucide-react";
import { useJasminCommand } from "@/hooks/use-jasmin-command";
import toast from "react-hot-toast";

interface Connector {
  cid: string;
  status: "started" | "stopped";
  session: string;
  starts: string;
  stops: string;
}

export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingConnector, setIsAddingConnector] = useState(false);
  const [isEditingConnector, setIsEditingConnector] = useState<string | null>(null);
  const [newConnector, setNewConnector] = useState({
    cid: "",
    host: "",
    port: "2775",
    username: "",
    password: "",
    systemType: "",
    logLevel: "20",
    bind: "transceiver",
  });
  
  const { execute } = useJasminCommand();
  
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const fetchConnectors = async () => {
    setIsLoading(true);
    try {
      const result = await execute("smppccm -l");
      
      // Parse the CLI output to extract connector information
      const lines = result.split("\n").filter((line: string) => line.trim().length > 0);
      
      // Skip the header line
      const connectorLines = lines.slice(1);
      
      const parsedConnectors = connectorLines.map((line: string) => {
        const parts = line.trim().split(/\s+/);
        return {
          cid: parts[0],
          status: parts[1] === "started" ? "started" : "stopped",
          session: parts[2],
          starts: parts[3],
          stops: parts[4],
        };
      });
      
      setConnectors(parsedConnectors);
    } catch (error) {
      console.error("Error fetching connectors:", error);
      toast.error("Failed to fetch connectors");
      // Set sample data if we can't fetch real data
      setConnectors([
        { cid: "connector1", status: "started", session: "BOUND_TRX", starts: "1", stops: "0" },
        { cid: "connector2", status: "stopped", session: "None", starts: "0", stops: "0" },
        { cid: "connector3", status: "started", session: "BOUND_TRX", starts: "2", stops: "1" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConnectors();
  }, [execute]);

  const filteredConnectors = connectors.filter(connector => 
    connector.cid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddConnector = async () => {
    if (!newConnector.cid || !newConnector.host || !newConnector.port || !newConnector.username || !newConnector.password) {
      toast.error("Required fields are missing");
      return;
    }
    
    try {
      // Create the connector add command
      const command = `smppccm -a
cid ${newConnector.cid}
host ${newConnector.host}
port ${newConnector.port}
username ${newConnector.username}
password ${newConnector.password}
systype ${newConnector.systemType}
loglevel ${newConnector.logLevel}
bind ${newConnector.bind}
`;
      
      await execute(command);
      toast.success("Connector added successfully");
      setIsAddingConnector(false);
      setNewConnector({
        cid: "",
        host: "",
        port: "2775",
        username: "",
        password: "",
        systemType: "",
        logLevel: "20",
        bind: "transceiver",
      });
      fetchConnectors();
    } catch (error) {
      console.error("Error adding connector:", error);
      toast.error("Failed to add connector");
    }
  };

  const handleStartConnector = async (cid: string) => {
    try {
      await execute(`smppccm -1 ${cid}`);
      toast.success("Connector started successfully");
      fetchConnectors();
    } catch (error) {
      console.error("Error starting connector:", error);
      toast.error("Failed to start connector");
    }
  };

  const handleStopConnector = async (cid: string) => {
    try {
      await execute(`smppccm -0 ${cid}`);
      toast.success("Connector stopped successfully");
      fetchConnectors();
    } catch (error) {
      console.error("Error stopping connector:", error);
      toast.error("Failed to stop connector");
    }
  };

  const handleDeleteConnector = async (cid: string) => {
    if (window.confirm(`Are you sure you want to delete connector ${cid}?`)) {
      try {
        await execute(`smppccm -r ${cid}`);
        toast.success("Connector deleted successfully");
        fetchConnectors();
      } catch (error) {
        console.error("Error deleting connector:", error);
        toast.error("Failed to delete connector");
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Server className="h-8 w-8" />
          SMPP Connector Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage SMPP client connectors for Jasmin SMS Gateway
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search connectors..."
            className="form-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-outline"
            onClick={fetchConnectors}
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setIsAddingConnector(true)}
          >
            <Plus size={18} />
            Add Connector
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div ref={ref} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Connector ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Session
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Starts/Stops
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {filteredConnectors.length > 0 ? (
                  filteredConnectors.map((connector, index) => (
                    <motion.tr
                      key={connector.cid}
                      initial={{ opacity: 0, y: 20 }}
                      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Globe className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-gray-900 dark:text-white">{connector.cid}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {connector.status === "started" ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Started
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            <XCircle className="h-4 w-4 mr-1" />
                            Stopped
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900 dark:text-white">
                          {connector.session === "None" ? "-" : connector.session}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900 dark:text-white">
                          {connector.starts}/{connector.stops}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex space-x-2">
                          {connector.status === "stopped" ? (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleStartConnector(connector.cid)}
                            >
                              <Play size={16} />
                            </button>
                          ) : (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleStopConnector(connector.cid)}
                            >
                              <Square size={16} />
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => setIsEditingConnector(connector.cid)}
                          >
                            <Edit size={16} className="text-indigo-500" />
                          </button>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => handleDeleteConnector(connector.cid)}
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No connectors found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Connector Modal */}
      {isAddingConnector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add New SMPP Connector</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="cid" className="form-label">Connector ID</label>
                <input
                  id="cid"
                  type="text"
                  className="form-input"
                  value={newConnector.cid}
                  onChange={(e) => setNewConnector({ ...newConnector, cid: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="host" className="form-label">Host</label>
                <input
                  id="host"
                  type="text"
                  className="form-input"
                  value={newConnector.host}
                  onChange={(e) => setNewConnector({ ...newConnector, host: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="port" className="form-label">Port</label>
                <input
                  id="port"
                  type="text"
                  className="form-input"
                  value={newConnector.port}
                  onChange={(e) => setNewConnector({ ...newConnector, port: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="username" className="form-label">Username</label>
                <input
                  id="username"
                  type="text"
                  className="form-input"
                  value={newConnector.username}
                  onChange={(e) => setNewConnector({ ...newConnector, username: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  value={newConnector.password}
                  onChange={(e) => setNewConnector({ ...newConnector, password: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="systemType" className="form-label">System Type</label>
                <input
                  id="systemType"
                  type="text"
                  className="form-input"
                  value={newConnector.systemType}
                  onChange={(e) => setNewConnector({ ...newConnector, systemType: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="logLevel" className="form-label">Log Level</label>
                <select
                  id="logLevel"
                  className="form-input"
                  value={newConnector.logLevel}
                  onChange={(e) => setNewConnector({ ...newConnector, logLevel: e.target.value })}
                >
                  <option value="10">DEBUG (10)</option>
                  <option value="20">INFO (20)</option>
                  <option value="30">WARNING (30)</option>
                  <option value="40">ERROR (40)</option>
                  <option value="50">CRITICAL (50)</option>
                </select>
              </div>
              <div>
                <label htmlFor="bind" className="form-label">Bind Type</label>
                <select
                  id="bind"
                  className="form-input"
                  value={newConnector.bind}
                  onChange={(e) => setNewConnector({ ...newConnector, bind: e.target.value })}
                >
                  <option value="transceiver">Transceiver</option>
                  <option value="transmitter">Transmitter</option>
                  <option value="receiver">Receiver</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  className="btn btn-outline"
                  onClick={() => setIsAddingConnector(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleAddConnector}
                >
                  Add Connector
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Connector Modal */}
      {isEditingConnector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Edit Connector</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              To edit a connector, you need to use the update command with specific parameters.
              For simplicity, you can delete the connector and create a new one with updated parameters.
            </p>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                className="btn btn-outline"
                onClick={() => setIsEditingConnector(null)}
              >
                Close
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  if (isEditingConnector) {
                    handleDeleteConnector(isEditingConnector);
                    setIsEditingConnector(null);
                    setIsAddingConnector(true);
                  }
                }}
              >
                Delete and Create New
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}