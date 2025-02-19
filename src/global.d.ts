export {};

declare global {
  interface Window {
    api: {
      runShell: (id: string, command: string, workingDir: string) => Promise<string>;
      stopShell: (id: string) => Promise<string>;
      loadStorage: () => Promise<any>;
      clearStorage: () => Promise<any>;
      saveCommand: (title: string, command: string, workingDir: string) => Promise<string>;
      updateStatus: (id: string, status: string) => Promise<string>;
      removeCommand: (id: string) => Promise<string>;
    };
  }
}
