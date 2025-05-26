"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export function useJasminCommand() {
  const [loading, setLoading] = useState(false);

  const execute = async (command: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/jasmin/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ command }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to execute command");
      }

      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error("Error executing Jasmin command:", error);
      toast.error("Failed to execute command");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading };
}