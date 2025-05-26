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
  UserCog
} from "lucide-react";
import { useJasminCommand } from "@/hooks/use-jasmin-command";
import toast from "react-hot-toast";

interface User {
  uid: string;
  username: string;
  gid: string;
  status: "enabled" | "disabled";
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    uid: "",
    gid: "users",
  });
  
  const { execute } = useJasminCommand();
  
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const result = await execute("user -l");
      
      // Parse the CLI output to extract user information
      const lines = result.split("\n").filter((line: string) => line.trim().length > 0);
      
      // Skip the header line
      const userLines = lines.slice(1);
      
      const parsedUsers = userLines.map((line: string) => {
        const parts = line.trim().split(/\s+/);
        return {
          uid: parts[0],
          username: parts[0], // Assuming UID is the same as username
          gid: parts[1],
          status: parts[2] === "enabled" ? "enabled" : "disabled",
        };
      });
      
      setUsers(parsedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
      // Set sample data if we can't fetch real data
      setUsers([
        { uid: "user1", username: "user1", gid: "users", status: "enabled" },
        { uid: "user2", username: "user2", gid: "users", status: "disabled" },
        { uid: "user3", username: "user3", gid: "admins", status: "enabled" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [execute]);

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.gid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password || !newUser.uid || !newUser.gid) {
      toast.error("All fields are required");
      return;
    }
    
    try {
      // Create the user add command
      const command = `user -a
username ${newUser.username}
password ${newUser.password}
uid ${newUser.uid}
gid ${newUser.gid}
`;
      
      await execute(command);
      toast.success("User added successfully");
      setIsAddingUser(false);
      setNewUser({
        username: "",
        password: "",
        uid: "",
        gid: "users",
      });
      fetchUsers();
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("Failed to add user");
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      const command = user.status === "enabled" 
        ? `user -d ${user.uid}` 
        : `user -e ${user.uid}`;
      
      await execute(command);
      toast.success(`User ${user.status === "enabled" ? "disabled" : "enabled"} successfully`);
      fetchUsers();
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast.error("Failed to update user status");
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (window.confirm(`Are you sure you want to delete user ${uid}?`)) {
      try {
        await execute(`user -r ${uid}`);
        toast.success("User deleted successfully");
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user");
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Users className="h-8 w-8" />
          User Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage users for Jasmin SMS Gateway
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search users..."
            className="form-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-outline"
            onClick={fetchUsers}
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setIsAddingUser(true)}
          >
            <UserPlus size={18} />
            Add User
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
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Group
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
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.uid}
                      initial={{ opacity: 0, y: 20 }}
                      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <UserCog className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-gray-900 dark:text-white">{user.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                          {user.gid}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.status === "enabled" ? (
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
                            onClick={() => handleToggleUserStatus(user)}
                          >
                            {user.status === "enabled" ? (
                              <XCircle size={16} className="text-red-500" />
                            ) : (
                              <CheckCircle size={16} className="text-green-500" />
                            )}
                          </button>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => setIsEditingUser(user.uid)}
                          >
                            <Edit size={16} className="text-indigo-500" />
                          </button>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => handleDeleteUser(user.uid)}
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
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add New User</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="form-label">Username</label>
                <input
                  id="username"
                  type="text"
                  className="form-input"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="uid" className="form-label">User ID</label>
                <input
                  id="uid"
                  type="text"
                  className="form-input"
                  value={newUser.uid}
                  onChange={(e) => setNewUser({ ...newUser, uid: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="gid" className="form-label">Group ID</label>
                <input
                  id="gid"
                  type="text"
                  className="form-input"
                  value={newUser.gid}
                  onChange={(e) => setNewUser({ ...newUser, gid: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  className="btn btn-outline"
                  onClick={() => setIsAddingUser(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleAddUser}
                >
                  Add User
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Edit User</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Editing user credentials is not directly supported through the Jasmin CLI. 
              To update a user, you need to remove the existing user and create a new one.
            </p>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                className="btn btn-outline"
                onClick={() => setIsEditingUser(null)}
              >
                Close
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  if (isEditingUser) {
                    handleDeleteUser(isEditingUser);
                    setIsEditingUser(null);
                    setIsAddingUser(true);
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