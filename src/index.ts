import { app, BrowserWindow, ipcMain } from "electron";
import { spawn, ChildProcess } from "child_process";
import path from "path";
import fs from "fs";
import kill from "tree-kill";
import { v4 as uuidv4 } from "uuid";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let mainWindow: BrowserWindow | null = null;

interface IDefaultStorage {
  history: Array<{ id: string; title: string; command: string; workingDir: string; status: string; createdAt: number; updatedAt: number }>;
  runningProcesses: Record<string, { pid: number; status: string }>;
}

const defaultStorage: IDefaultStorage = { history: [], runningProcesses: {} };
const storagePath = path.join(app.getPath("userData"), "storage.json");
const runningProcesses: Record<string, ChildProcess> = {};

function readStorage(): IDefaultStorage {
  if (fs.existsSync(storagePath)) {
    try {
      const storageData = JSON.parse(fs.readFileSync(storagePath, "utf-8"));
      return storageData;
    } catch (error) {
      console.error("Error reading storage file:", error);
    }
  }
  writeStorage(defaultStorage);
  return defaultStorage;
}

function writeStorage(data: typeof defaultStorage): void {
  fs.writeFileSync(storagePath, JSON.stringify(data, null, 2));
}

function applyToStorage(data: Partial<typeof defaultStorage>): void {
  const storage = readStorage();
  fs.writeFileSync(storagePath, JSON.stringify({ ...storage, ...data }, null, 2));
}

const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
    },
  });
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers
ipcMain.handle("save-command", async (_, title: string, command: string, workingDir: string) => {
  const storage = readStorage();
  if (!Array.isArray(storage.history)) storage.history = [];

  const entry = {
    id: uuidv4(),
    title,
    command,
    workingDir,
    status: "Ready",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  storage.history.push(entry);
  writeStorage(storage);

  return entry.id;
});

ipcMain.handle("run-shell", async (event, id: string, command: string, workingDir: string) => {
  if (runningProcesses[id]) return "Process is already running.";

  return new Promise<string>((resolve, reject) => {
    console.log(`Starting command: ${command} in ${workingDir}`);
    const process = spawn(command, { cwd: workingDir, shell: true });
    runningProcesses[id] = process;

    const storage = readStorage();
    storage.runningProcesses[id] = { pid: process.pid, status: "Running" };
    applyToStorage(storage);

    let outputBuffer = "";

    process.stdout?.on("data", (data) => {
      const output = data.toString();
      outputBuffer += output;
      event.sender.send("process-output", { id, output });
    });

    process.stderr?.on("data", (data) => {
      const errorOutput = data.toString();
      console.error(`STDERR: ${errorOutput}`);
      event.sender.send("process-error", { id, errorOutput });
    });

    process.on("close", (code) => {
      console.log(`Process ${id} exited with code ${code}`);
      event.sender.send("process-exit", { id, code });
      cleanupProcess(id);
      resolve(outputBuffer || `Process exited with code ${code}`);
    });

    process.on("error", (err) => {
      console.error(`Failed to start process: ${err}`);
      cleanupProcess(id);
      reject(`Failed to start process: ${err.message}`);
    });
  });
});

ipcMain.handle("stop-shell", async (_, id: string) => {
  if (!runningProcesses[id]) return "No such process is running.";
  return stopProcess(id);
});

function stopProcess(id: string): Promise<string> {
  return new Promise((resolve) => {
    kill(runningProcesses[id].pid, "SIGTERM", (err) => {
      if (err) {
        console.error(`Failed to kill process ${id}:`, err);
        resolve("Failed to stop process.");
      } else {
        console.log(`Process ${id} stopped.`);
        cleanupProcess(id);
        resolve("Process stopped successfully.\n");
      }
    });

    setTimeout(() => {
      if (runningProcesses[id]) {
        console.log(`Forcing kill on process ${id}...`);
        kill(runningProcesses[id].pid, "SIGKILL", (err) => {
          if (err) {
            console.error(`Failed to force kill process ${id}:`, err);
            resolve("Failed to force stop process.");
          } else {
            console.log(`Process ${id} forcefully killed.`);
            cleanupProcess(id);
            resolve("Process forcefully stopped.");
          }
        });
      }
    }, 2000);
  });
}

function cleanupProcess(id: string): void {
  delete runningProcesses[id];
  const storage = readStorage();
  delete storage.runningProcesses[id];
  applyToStorage(storage);
}

ipcMain.handle("update-status", async (_, id: string, status: string) => {
  const storage = readStorage();
  const entry = storage.history.find((entry) => entry.id === id);
  if (entry) {
    entry.status = status;
    entry.updatedAt = Date.now();
    writeStorage(storage);
  }
  return "Status updated";
});

ipcMain.handle("remove-command", async (_, id: string) => {
  const storage = readStorage();
  storage.history = storage.history.filter((entry) => entry.id !== id);
  delete storage.runningProcesses[id];
  writeStorage(storage);
  return "Command removed";
});

ipcMain.handle("load-storage", async () => readStorage());
ipcMain.handle("clear-storage", async () => {
  writeStorage(defaultStorage);
  return defaultStorage;
});
