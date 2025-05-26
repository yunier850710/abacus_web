"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { 
  Settings, 
  Save,
  Upload,
  Download,
  Server,
  Key,
  User
} from "lucide-react";
import { useJasminCommand } from "@/hooks/use-jasmin-command";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [jasminSettings, setJasminSettings] = useState({
    host: "127.0.0.1",
    port: "8990",
    username: "jcliadmin",
    password: "jclipwd",
  });
  
  const [userSettings, setUserSettings] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const { execute } = useJasminCommand();
  
  const [jasminRef, jasminInView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });
  
  const [userRef, userInView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const handleSaveJasminSettings = () => {
    // This would typically update the settings in the database
    // For now, we'll just show a success message
    toast.success("Jasmin connection settings saved");
  };

  const handleSaveUserSettings = () => {
    if (userSettings.newPassword !== userSettings.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    // This would typically update the user settings in the database
    // For now, we'll just show a success message
    toast.success("User settings saved");
  };

  const handlePersistConfig = async () => {
    try {
      await execute("persist");
      toast.success("Configuration persisted successfully");
    } catch (error) {
      console.error("Error persisting configuration:", error);
      toast.error("Failed to persist configuration");
    }
  };

  const handleLoadConfig = async () => {
    try {
      await execute("load");
      toast.success("Configuration loaded successfully");
    } catch (error) {
      console.error("Error loading configuration:", error);
      toast.error("Failed to load configuration");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure your Jasmin SMS Gateway Management settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          ref={jasminRef}
          initial={{ opacity: 0, y: 20 }}
          animate={jasminInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Server className="h-5 w-5" />
            Jasmin Connection Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="host" className="form-label">Host</label>
              <input
                id="host"
                type="text"
                className="form-input"
                value={jasminSettings.host}
                onChange={(e) => setJasminSettings({ ...jasminSettings, host: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="port" className="form-label">Port</label>
              <input
                id="port"
                type="text"
                className="form-input"
                value={jasminSettings.port}
                onChange={(e) => setJasminSettings({ ...jasminSettings, port: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="username" className="form-label">Username</label>
              <input
                id="username"
                type="text"
                className="form-input"
                value={jasminSettings.username}
                onChange={(e) => setJasminSettings({ ...jasminSettings, username: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                value={jasminSettings.password}
                onChange={(e) => setJasminSettings({ ...jasminSettings, password: e.target.value })}
              />
            </div>
            <div className="flex justify-end">
              <button
                className="btn btn-primary"
                onClick={handleSaveJasminSettings}
              >
                <Save size={18} />
                Save Settings
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          ref={userRef}
          initial={{ opacity: 0, y: 20 }}
          animate={userInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="h-5 w-5" />
            User Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="form-label">Name</label>
              <input
                id="name"
                type="text"
                className="form-input"
                value={userSettings.name}
                onChange={(e) => setUserSettings({ ...userSettings, name: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={userSettings.email}
                onChange={(e) => setUserSettings({ ...userSettings, email: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="currentPassword" className="form-label">Current Password</label>
              <input
                id="currentPassword"
                type="password"
                className="form-input"
                value={userSettings.currentPassword}
                onChange={(e) => setUserSettings({ ...userSettings, currentPassword: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="form-label">New Password</label>
              <input
                id="newPassword"
                type="password"
                className="form-input"
                value={userSettings.newPassword}
                onChange={(e) => setUserSettings({ ...userSettings, newPassword: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                className="form-input"
                value={userSettings.confirmPassword}
                onChange={(e) => setUserSettings({ ...userSettings, confirmPassword: e.target.value })}
              />
            </div>
            <div className="flex justify-end">
              <button
                className="btn btn-primary"
                onClick={handleSaveUserSettings}
              >
                <Save size={18} />
                Save Settings
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Key className="h-5 w-5" />
          Jasmin Configuration
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Persist or load Jasmin configuration to/from disk
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            className="btn btn-primary"
            onClick={handlePersistConfig}
          >
            <Download size={18} />
            Persist Configuration
          </button>
          <button
            className="btn btn-outline"
            onClick={handleLoadConfig}
          >
            <Upload size={18} />
            Load Configuration
          </button>
        </div>
      </motion.div>
    </div>
  );
}