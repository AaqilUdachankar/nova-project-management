import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ;

let socketInstance = null;

export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, { withCredentials: true, autoConnect: true });
  }
  return socketInstance;
};

// Joins a project's real-time room for the lifetime of the component
export const useProjectRoom = (projectId, onTaskUpdated) => {
  const callbackRef = useRef(onTaskUpdated);
  callbackRef.current = onTaskUpdated;

  useEffect(() => {
    if (!projectId) return;
    const socket = getSocket();
    socket.emit("join-project", projectId);

    const handler = (task) => callbackRef.current?.(task);
    socket.on("task-updated", handler);

    return () => {
      socket.emit("leave-project", projectId);
      socket.off("task-updated", handler);
    };
  }, [projectId]);
};
