import { Button, Container, SimpleGrid, Stack, TextInput, Text, Autocomplete, Title } from "@mantine/core";
import React, { useState, useRef, useEffect } from "react";
import { CommandHistory } from "./CommandHistory";
import { Output } from "./Output";
import { IHistoryRecord, IRunningProcesses, useLoadData } from "../hooks/useLoadData";
import { IOutputs, IRunModel } from "./types";

export const Form: React.FC = () => {
  const vars = useRef<Record<string, { isInterrupted: boolean }>>({});
  const [title, setTitle] = useState<string>("");
  const [command, setCommand] = useState<string>("");
  const [workingDir, setWorkingDir] = useState<string>("");
  const [outputs, setOutputs] = useState<IOutputs>({});
  const [runningCommands, setRunningCommands] = useState<IRunningProcesses>({});
  const [{ history, runningProcesses }, refreshHistory, clearHistory] = useLoadData();

  useEffect(() => {
    if (Object.keys(runningCommands).length === 0 && Object.keys(runningProcesses).length !== 0) {
      setRunningCommands(runningProcesses);
      Object.keys(runningProcesses).forEach((key) => {
        vars.current[key] = { isInterrupted: false };
      });
    }
  }, [runningProcesses]);

  const clearOutput = () => {
    setOutputs({});
  };

  const runAndSaveCommand = async (model: IRunModel): Promise<void> => {
    const { command, workingDir, title } = model;
    if (!command || !workingDir) {
      return;
    }

    const existingEntry: IHistoryRecord | undefined = history.find((entry) => entry.command === command && entry.workingDir === workingDir);

    const id = existingEntry ? existingEntry.id : await window.api.saveCommand(title, command, workingDir);

    await window.api.updateStatus(id, "Running");
    refreshHistory();

    setRunningCommands((prev) => ({ ...prev, [id]: true }));
    vars.current[id] = { isInterrupted: false };

    const result = await window.api.runShell(id, command, workingDir);
    if (!vars.current[id].isInterrupted) {
      setOutputs((prev) => ({ ...prev, [id]: result }));
      await window.api.updateStatus(id, "Success");
      setRunningCommands((prev) => ({ ...prev, [id]: false }));
    }
  };

  const stopCommand = async (id: string): Promise<void> => {
    vars.current[id].isInterrupted = true;
    await window.api.updateStatus(id, "Stopped");
    const output = await window.api.stopShell(id);
    setOutputs((prev) => ({ ...prev, [id]: output }));
    setRunningCommands((prev) => ({ ...prev, [id]: false }));
    refreshHistory();
  };

  const removeCommand = async (id: string): Promise<void> => {
    await window.api.removeCommand(id);
    refreshHistory();
  };

  return (
    <Container>
      <Text fz="h1" tt="uppercase" variant="gradient" gradient={{ from: "black", to: "white" }} fw={900} ta={"center"} my="md">
        Shell Runner
      </Text>
      <Stack>
        <Title fz={"md"} tt="uppercase">
          SCRIPT INFO
        </Title>
        <SimpleGrid cols={3}>
          <TextInput value={title} label="Title" withAsterisk placeholder="Enter command title" onChange={(e) => setTitle(e.target.value)} />
          <TextInput value={command} label="Shell Command" withAsterisk placeholder="Enter shell command" onChange={(e) => setCommand(e.target.value)} />
          <Autocomplete
            withAsterisk
            value={workingDir}
            label="Working Directory"
            placeholder="Pick value or enter anything"
            onChange={(e) => setWorkingDir(e)}
            data={[...new Set(history.map((x) => x.workingDir))]}
          />
        </SimpleGrid>
        <Button bg="gray" variant="filled" onClick={() => runAndSaveCommand({ title, command, workingDir })}>
          Run
        </Button>
      </Stack>
      <CommandHistory
        history={history}
        runCommand={runAndSaveCommand}
        stopCommand={stopCommand}
        removeCommand={removeCommand}
        clearHistory={clearHistory}
        runningCommands={runningCommands}
      />
      <Output history={history} outputs={outputs} runningCommands={runningCommands} clearOutput={clearOutput} />
    </Container>
  );
};
