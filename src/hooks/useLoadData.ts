import { useEffect, useState } from "react";

export interface IHistoryRecord {
  id: string;
  title: string;
  command: string;
  workingDir: string;
  status: string;
  createdAt: number;
  updatedAt: number;
}
export interface IData {
  history: Array<IHistoryRecord>;
  runningProcesses: Record<string, { pid: number; status: string }>;
}

export interface IRunningProcesses {
  [id: string]: boolean;
}

export interface IDataState {
  history: Array<IHistoryRecord>;
  runningProcesses: IRunningProcesses;
}

export type IUseLoadData = [
  IDataState, // The stored data
  () => Promise<void>, // Function to reload the storage
  () => Promise<void> // Function to clear storage
];

export function useLoadData(): IUseLoadData {
  const [data, setData] = useState<IDataState>({ history: [], runningProcesses: {} });

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    const data = await window.api.loadStorage();
    const ids = Object.keys(data.runningProcesses);
    const runningCommands: Record<string, boolean> = {};
    ids.forEach((id) => {
      runningCommands[id] = data.runningProcesses[id].status === "Running";
    });
    data.runningProcesses = runningCommands;
    setData(data);
  };

  const clearStoredData = async () => {
    await window.api.clearStorage();
    loadStoredData();
  };

  return [data, loadStoredData, clearStoredData];
}
