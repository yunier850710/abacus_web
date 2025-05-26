"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { 
  LayoutGrid, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  RefreshCw,
  ArrowRightLeft,
  Filter,
  Route
} from "lucide-react";
import { useJasminCommand } from "@/hooks/use-jasmin-command";
import toast from "react-hot-toast";

interface RouteItem {
  order: string;
  type: string;
  connectors: string;
  filter: string;
  rate: string;
}

export default function RoutesPage() {
  const [mtRoutes, setMtRoutes] = useState<RouteItem[]>([]);
  const [moRoutes, setMoRoutes] = useState<RouteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"mt" | "mo">("mt");
  const [isAddingRoute, setIsAddingRoute] = useState(false);
  const [newRoute, setNewRoute] = useState({
    type: "DefaultRoute",
    connector: "",
    filter: "",
  });
  
  const { execute } = useJasminCommand();
  
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const fetchRoutes = async () => {
    setIsLoading(true);
    try {
      // Fetch MT routes
      const mtResult = await execute("mtrouter -l");
      
      // Parse the CLI output to extract route information
      const mtLines = mtResult.split("\n").filter((line: string) => line.trim().length > 0);
      
      // Skip the header line
      const mtRouteLines = mtLines.slice(1);
      
      const parsedMtRoutes = mtRouteLines.map((line: string) => {
        const parts = line.trim().split(/\s+/);
        return {
          order: parts[0],
          type: parts[1],
          connectors: parts[2],
          filter: parts[3],
          rate: parts[4] || "0.0",
        };
      });
      
      setMtRoutes(parsedMtRoutes);
      
      // Fetch MO routes
      const moResult = await execute("morouter -l");
      
      // Parse the CLI output to extract route information
      const moLines = moResult.split("\n").filter((line: string) => line.trim().length > 0);
      
      // Skip the header line
      const moRouteLines = moLines.slice(1);
      
      const parsedMoRoutes = moRouteLines.map((line: string) => {
        const parts = line.trim().split(/\s+/);
        return {
          order: parts[0],
          type: parts[1],
          connectors: parts[2],
          filter: parts[3],
          rate: "N/A",
        };
      });
      
      setMoRoutes(parsedMoRoutes);
    } catch (error) {
      console.error("Error fetching routes:", error);
      toast.error("Failed to fetch routes");
      // Set sample data if we can't fetch real data
      setMtRoutes([
        { order: "0", type: "DefaultRoute", connectors: "smpp_connector1", filter: "TransparentFilter", rate: "0.0" },
        { order: "1", type: "StaticMTRoute", connectors: "smpp_connector2", filter: "DestinationAddrFilter", rate: "0.0" },
      ]);
      setMoRoutes([
        { order: "0", type: "DefaultRoute", connectors: "http_connector1", filter: "TransparentFilter", rate: "N/A" },
        { order: "1", type: "StaticMORoute", connectors: "http_connector2", filter: "SourceAddrFilter", rate: "N/A" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, [execute]);

  const filteredRoutes = (activeTab === "mt" ? mtRoutes : moRoutes).filter(route => 
    route.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.connectors.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.filter.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddRoute = async () => {
    if (!newRoute.type || (newRoute.type !== "DefaultRoute" && !newRoute.connector)) {
      toast.error("Required fields are missing");
      return;
    }
    
    try {
      // Create the route add command
      let command = "";
      
      if (activeTab === "mt") {
        command = `mtrouter -a
type ${newRoute.type}
`;
        if (newRoute.type !== "DefaultRoute") {
          command += `connector ${newRoute.connector}
`;
          if (newRoute.filter) {
            command += `filter ${newRoute.filter}
`;
          }
        }
      } else {
        command = `morouter -a
type ${newRoute.type}
`;
        if (newRoute.type !== "DefaultRoute") {
          command += `connector ${newRoute.connector}
`;
          if (newRoute.filter) {
            command += `filter ${newRoute.filter}
`;
          }
        }
      }
      
      await execute(command);
      toast.success("Route added successfully");
      setIsAddingRoute(false);
      setNewRoute({
        type: "DefaultRoute",
        connector: "",
        filter: "",
      });
      fetchRoutes();
    } catch (error) {
      console.error("Error adding route:", error);
      toast.error("Failed to add route");
    }
  };

  const handleDeleteRoute = async (order: string) => {
    if (window.confirm(`Are you sure you want to delete this route?`)) {
      try {
        const command = activeTab === "mt" 
          ? `mtrouter -r ${order}` 
          : `morouter -r ${order}`;
        
        await execute(command);
        toast.success("Route deleted successfully");
        fetchRoutes();
      } catch (error) {
        console.error("Error deleting route:", error);
        toast.error("Failed to delete route");
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Route className="h-8 w-8" />
          Route Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage MT and MO routes for Jasmin SMS Gateway
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex gap-2">
          <button
            className={`btn ${activeTab === "mt" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setActiveTab("mt")}
          >
            <ArrowRightLeft size={18} />
            MT Routes
          </button>
          <button
            className={`btn ${activeTab === "mo" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setActiveTab("mo")}
          >
            <ArrowRightLeft size={18} className="rotate-180" />
            MO Routes
          </button>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search routes..."
            className="form-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-outline"
            onClick={fetchRoutes}
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setIsAddingRoute(true)}
          >
            <Plus size={18} />
            Add Route
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
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Connectors
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Filter
                  </th>
                  {activeTab === "mt" && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Rate
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {filteredRoutes.length > 0 ? (
                  filteredRoutes.map((route, index) => (
                    <motion.tr
                      key={`${route.order}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900 dark:text-white">{route.order}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <LayoutGrid className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-gray-900 dark:text-white">{route.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900 dark:text-white">{route.connectors}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Filter className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-gray-900 dark:text-white">{route.filter}</span>
                        </div>
                      </td>
                      {activeTab === "mt" && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-900 dark:text-white">{route.rate}</span>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex space-x-2">
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => handleDeleteRoute(route.order)}
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={activeTab === "mt" ? 6 : 5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No routes found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Route Modal */}
      {isAddingRoute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Add New {activeTab === "mt" ? "MT" : "MO"} Route
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="type" className="form-label">Route Type</label>
                <select
                  id="type"
                  className="form-input"
                  value={newRoute.type}
                  onChange={(e) => setNewRoute({ ...newRoute, type: e.target.value })}
                >
                  <option value="DefaultRoute">DefaultRoute</option>
                  {activeTab === "mt" ? (
                    <>
                      <option value="StaticMTRoute">StaticMTRoute</option>
                      <option value="RandomRoundrobinMTRoute">RandomRoundrobinMTRoute</option>
                      <option value="FailoverMTRoute">FailoverMTRoute</option>
                    </>
                  ) : (
                    <>
                      <option value="StaticMORoute">StaticMORoute</option>
                      <option value="RandomRoundrobinMORoute">RandomRoundrobinMORoute</option>
                      <option value="FailoverMORoute">FailoverMORoute</option>
                    </>
                  )}
                </select>
              </div>
              {newRoute.type !== "DefaultRoute" && (
                <>
                  <div>
                    <label htmlFor="connector" className="form-label">Connector</label>
                    <input
                      id="connector"
                      type="text"
                      className="form-input"
                      placeholder="Enter connector ID"
                      value={newRoute.connector}
                      onChange={(e) => setNewRoute({ ...newRoute, connector: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="filter" className="form-label">Filter (Optional)</label>
                    <input
                      id="filter"
                      type="text"
                      className="form-input"
                      placeholder="e.g., TransparentFilter"
                      value={newRoute.filter}
                      onChange={(e) => setNewRoute({ ...newRoute, filter: e.target.value })}
                    />
                  </div>
                </>
              )}
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  className="btn btn-outline"
                  onClick={() => setIsAddingRoute(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleAddRoute}
                >
                  Add Route
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}