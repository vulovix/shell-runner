// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  runShell: (id: string, command: string, workingDir: string) => ipcRenderer.invoke("run-shell", id, command, workingDir),
  stopShell: (id: string) => ipcRenderer.invoke("stop-shell", id),
  loadStorage: () => ipcRenderer.invoke("load-storage"),
  clearStorage: () => ipcRenderer.invoke("clear-storage"),
  saveCommand: (title: string, command: string, workingDir: string) => ipcRenderer.invoke("save-command", title, command, workingDir),
  updateStatus: (id: string, status: string) => ipcRenderer.invoke("update-status", id, status),
  removeCommand: (id: string) => ipcRenderer.invoke("remove-command", id),
});

ipcRenderer.on("process-output", (_event, { id, output }) => {
  const outputElement = document.getElementById(`output-${id}`);
  if (outputElement) {
    outputElement.textContent += output;
    outputElement.scrollTop = outputElement.scrollHeight;
  }
});

ipcRenderer.on("process-error", (_event, { id, errorOutput }) => {
  const outputElement = document.getElementById(`output-${id}`);
  if (outputElement) {
    outputElement.textContent += `\nError: ${errorOutput}`;
  }
});

ipcRenderer.on("process-exit", (_event, { id, code }) => {
  const outputElement = document.getElementById(`output-${id}`);
  if (outputElement) {
    outputElement.textContent += `\nProcess exited with code: ${code}\n`;
  }
});
