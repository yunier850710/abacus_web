"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { 
  Filter as FilterIcon, 
  Plus, 
  Trash2, 
  Search,
  RefreshCw,
  Eye
} from "lucide-react";
import { useJasminCommand } from "@/hooks/use-jasmin-command";
import toast from "react-hot-toast";

interface Filter {
  fid: string;
  type: string;
  routes: string;
}

export default function FiltersPage() {
  const [filters, setFilters] = useState<Filter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingFilter, setIsAddingFilter] = useState(false);
  const [isViewingFilter, setIsViewingFilter] = useState<string | null>(null);
  const [filterDetails, setFilterDetails] = useState("");
  const [newFilter, setNewFilter] = useState({
    fid: "",
    type: "TransparentFilter",
    parameter: "",
  });
  
  const { execute } = useJasminCommand();
  
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const fetchFilters = async () => {
    setIsLoading(true);
    try {
      const result = await execute("filter -l");
      
      // Parse the CLI output to extract filter information
      const lines = result.split("\n").filter((line: string) => line.trim().length > 0);
      
      // Skip the header line
      const filterLines = lines.slice(1);
      
      const parsedFilters = filterLines.map((line: string) => {
        const parts = line.trim().split(/\s+/);
        return {
          fid: parts[0],
          type: parts[1],
          routes: parts[2] || "0",
        };
      });
      
      setFilters(parsedFilters);
    } catch (error) {
      console.error("Error fetching filters:", error);
      toast.error("Failed to fetch filters");
      // Set sample data if we can't fetch real data
      setFilters([
        { fid: "f1", type: "TransparentFilter", routes: "1" },
        { fid: "f2", type: "UserFilter", routes: "2" },
        { fid: "f3", type: "DestinationAddrFilter", routes: "1" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, [execute]);

  const filteredFilters = filters.filter(filter => 
    filter.fid.toLowerCase().includes(searchTerm.toLowerCase()) ||
    filter.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddFilter = async () => {
    if (!newFilter.fid || !newFilter.type) {
      toast.error("Filter ID and type are required");
      return;
    }
    
    try {
      // Create the filter add command
      let command = `filter -a
fid ${newFilter.fid}
type ${newFilter.type}
`;
      
      // Add parameter if needed
      if (newFilter.type !== "TransparentFilter" && newFilter.parameter) {
        command += `${newFilter.type.replace("Filter", "").toLowerCase()} ${newFilter.parameter}
`;
      }
      
      await execute(command);
      toast.success("Filter added successfully");
      setIsAddingFilter(false);
      setNewFilter({
        fid: "",
        type: "TransparentFilter",
        parameter: "",
      });
      fetchFilters();
    } catch (error) {
      console.error("Error adding filter:", error);
      toast.error("Failed to add filter");
    }
  };

  const handleViewFilter = async (fid: string) => {
    try {
      const result = await execute(`filter -s ${fid}`);
      setFilterDetails(result);
      setIsViewingFilter(fid);
    } catch (error) {
      console.error("Error viewing filter:", error);
      toast.error("Failed to view filter details");
    }
  };

  const handleDeleteFilter = async (fid: string) => {
    if (window.confirm(`Are you sure you want to delete filter ${fid}?`)) {
      try {
        await execute(`filter -r ${fid}`);
        toast.success("Filter deleted successfully");
        fetchFilters();
      } catch (error) {
        console.error("Error deleting filter:", error);
        toast.error("Failed to delete filter");
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FilterIcon className="h-8 w-8" />
          Filter Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage filters for Jasmin SMS Gateway routing
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search filters..."
            className="form-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-outline"
            onClick={fetchFilters}
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setIsAddingFilter(true)}
          >
            <Plus size={18} />
            Add Filter
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
                    Filter ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Routes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {filteredFilters.length > 0 ? (
                  filteredFilters.map((filter, index) => (
                    <motion.tr
                      key={filter.fid}
                      initial={{ opacity: 0, y: 20 }}
                      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900 dark:text-white">{filter.fid}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FilterIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-gray-900 dark:text-white">{filter.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                          {filter.routes}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex space-x-2">
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => handleViewFilter(filter.fid)}
                          >
                            <Eye size={16} className="text-indigo-500" />
                          </button>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => handleDeleteFilter(filter.fid)}
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No filters found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Filter Modal */}
      {isAddingFilter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add New Filter</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="fid" className="form-label">Filter ID</label>
                <input
                  id="fid"
                  type="text"
                  className="form-input"
                  value={newFilter.fid}
                  onChange={(e) => setNewFilter({ ...newFilter, fid: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="type" className="form-label">Filter Type</label>
                <select
                  id="type"
                  className="form-input"
                  value={newFilter.type}
                  onChange={(e) => setNewFilter({ ...newFilter, type: e.target.value })}
                >
                  <option value="TransparentFilter">TransparentFilter</option>
                  <option value="UserFilter">UserFilter</option>
                  <option value="GroupFilter">GroupFilter</option>
                  <option value="ConnectorFilter">ConnectorFilter</option>
                  <option value="SourceAddrFilter">SourceAddrFilter</option>
                  <option value="DestinationAddrFilter">DestinationAddrFilter</option>
                  <option value="ShortMessageFilter">ShortMessageFilter</option>
                  <option value="DateIntervalFilter">DateIntervalFilter</option>
                  <option value="TimeIntervalFilter">TimeIntervalFilter</option>
                  <option value="TagFilter">TagFilter</option>
                </select>
              </div>
              {newFilter.type !== "TransparentFilter" && (
                <div>
                  <label htmlFor="parameter" className="form-label">Parameter</label>
                  <input
                    id="parameter"
                    type="text"
                    className="form-input"
                    placeholder={`Enter ${newFilter.type.replace("Filter", "").toLowerCase()} parameter`}
                    value={newFilter.parameter}
                    onChange={(e) => setNewFilter({ ...newFilter, parameter: e.target.value })}
                  />
                </div>
              )}
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  className="btn btn-outline"
                  onClick={() => setIsAddingFilter(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleAddFilter}
                >
                  Add Filter
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* View Filter Modal */}
      {isViewingFilter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Filter Details: {isViewingFilter}
            </h2>
            <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md">
              <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {filterDetails}
              </pre>
            </div>
            <div className="flex justify-end mt-6">
              <button
                className="btn btn-outline"
                onClick={() => setIsViewingFilter(null)}
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}