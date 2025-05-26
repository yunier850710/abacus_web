"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Search,
  RefreshCw,
  UsersRound
} from "lucide-react";
import { useJasminCommand } from "@/hooks/use-jasmin-command";
import toast from "react-hot-toast";

interface Group {
  gid: string;
  status: "enabled" | "disabled";
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [newGroup, setNewGroup] = useState({
    gid: "",
  });
  
  const { execute } = useJasminCommand();
  
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const result = await execute("group -l");
      
      // Parse the CLI output to extract group information
      const lines = result.split("\n").filter((line: string) => line.trim().length > 0);
      
      // Skip the header line
      const groupLines = lines.slice(1);
      
      const parsedGroups = groupLines.map((line: string) => {
        const parts = line.trim().split(/\s+/);
        return {
          gid: parts[0],
          status: parts[1] === "enabled" ? "enabled" : "disabled",
        };
      });
      
      setGroups(parsedGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("Failed to fetch groups");
      // Set sample data if we can't fetch real data
      setGroups([
        { gid: "users", status: "enabled" },
        { gid: "admins", status: "enabled" },
        { gid: "operators", status: "disabled" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [execute]);

  const filteredGroups = groups.filter(group => 
    group.gid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddGroup = async () => {
    if (!newGroup.gid) {
      toast.error("Group ID is required");
      return;
    }
    
    try {
      // Create the group add command
      const command = `group -a
gid ${newGroup.gid}
`;
      
      await execute(command);
      toast.success("Group added successfully");
      setIsAddingGroup(false);
      setNewGroup({
        gid: "",
      });
      fetchGroups();
    } catch (error) {
      console.error("Error adding group:", error);
      toast.error("Failed to add group");
    }
  };

  const handleToggleGroupStatus = async (group: Group) => {
    try {
      const command = group.status === "enabled" 
        ? `group -d ${group.gid}` 
        : `group -e ${group.gid}`;
      
      await execute(command);
      toast.success(`Group ${group.status === "enabled" ? "disabled" : "enabled"} successfully`);
      fetchGroups();
    } catch (error) {
      console.error("Error toggling group status:", error);
      toast.error("Failed to update group status");
    }
  };

  const handleDeleteGroup = async (gid: string) => {
    if (window.confirm(`Are you sure you want to delete group ${gid}?`)) {
      try {
        await execute(`group -r ${gid}`);
        toast.success("Group deleted successfully");
        fetchGroups();
      } catch (error) {
        console.error("Error deleting group:", error);
        toast.error("Failed to delete group");
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <UsersRound className="h-8 w-8" />
          Group Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage user groups for Jasmin SMS Gateway
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search groups..."
            className="form-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-outline"
            onClick={fetchGroups}
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setIsAddingGroup(true)}
          >
            <UserPlus size={18} />
            Add Group
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
                    Group ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {filteredGroups.length > 0 ? (
                  filteredGroups.map((group, index) => (
                    <motion.tr
                      key={group.gid}
                      initial={{ opacity: 0, y: 20 }}
                      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Users className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-gray-900 dark:text-white">{group.gid}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {group.status === "enabled" ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Enabled
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            <XCircle className="h-4 w-4 mr-1" />
                            Disabled
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex space-x-2">
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => handleToggleGroupStatus(group)}
                          >
                            {group.status === "enabled" ? (
                              <XCircle size={16} className="text-red-500" />
                            ) : (
                              <CheckCircle size={16} className="text-green-500" />
                            )}
                          </button>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => handleDeleteGroup(group.gid)}
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No groups found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Group Modal */}
      {isAddingGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add New Group</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="gid" className="form-label">Group ID</label>
                <input
                  id="gid"
                  type="text"
                  className="form-input"
                  value={newGroup.gid}
                  onChange={(e) => setNewGroup({ ...newGroup, gid: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  className="btn btn-outline"
                  onClick={() => setIsAddingGroup(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleAddGroup}
                >
                  Add Group
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}