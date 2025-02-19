import React from "react";
import { Button, Text, Accordion, Group, Code, Avatar, Flex, Stack, Tooltip, Title, Box } from "@mantine/core";
import { VscClearAll, VscClose, VscDebugStop, VscPlay, VscTerminal } from "react-icons/vsc";
import { formatUTCTimestamp } from "../../utils/formatUTCTimestamp";
import { IHistoryRecord, IRunningProcesses } from "../../hooks/useLoadData";

export interface ICommandHistoryProps {
  history: Array<IHistoryRecord>;
  runningCommands: IRunningProcesses;
  removeCommand(id: string): void;
  stopCommand(id: string): void;
  clearHistory(): void;
  runCommand(entry: IHistoryRecord): void;
}

const Icons: any = {
  VscTerminal: VscTerminal,
  VscPlay: VscPlay,
  VscClose: VscClose,
  VscClearAll: VscClearAll,
  VscDebugStop: VscDebugStop,
};

export const CommandHistory = ({ runCommand, clearHistory, stopCommand, removeCommand, history, runningCommands }: ICommandHistoryProps) => {
  return (
    <Box>
      <Flex align={"center"} justify="space-between" mt="xl">
        <Title fz={"md"} tt="uppercase">
          Command history
        </Title>
        {history.length ? (
          <Tooltip label="Clear History">
            <Button radius="xl" bg="none" variant="filled" onClick={clearHistory}>
              <Icons.VscClearAll size={18} />
            </Button>
          </Tooltip>
        ) : (
          <></>
        )}
      </Flex>
      <Accordion chevronPosition="right" variant="filled">
        {history.length > 0 ? (
          history.map((entry) => (
            <Accordion.Item value={entry.id} key={entry.id}>
              <Accordion.Control>
                <Group wrap="nowrap">
                  <Avatar radius="xl" size="lg">
                    <Icons.VscTerminal />
                  </Avatar>
                  <div>
                    <Text fw={500} tt="uppercase">
                      {entry.title}
                    </Text>
                  </div>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <Flex align={"end"}>
                  <Stack flex={1}>
                    <Code bg={"transparent"} display={"block"}>
                      {entry.command}
                    </Code>
                    <Group px={4} pt="sm">
                      <Text c="dimmed" fz="sm">
                        <strong>Directory:</strong> {entry.workingDir}
                      </Text>
                    </Group>
                    <Group px={4} py="sm">
                      <Text c="dimmed" fz="sm">
                        <strong>Created at:</strong> {formatUTCTimestamp(entry.createdAt)}
                      </Text>
                      <Text c="dimmed" fz="sm">
                        <strong>Last update:</strong> {formatUTCTimestamp(entry.updatedAt)}
                      </Text>
                      <Text c="dimmed" fz="sm">
                        <strong>Latest status:</strong> {entry.status}
                      </Text>
                    </Group>
                  </Stack>
                  <Group pb="sm">
                    <Tooltip label={runningCommands[entry.id] ? "Running" : "Run"}>
                      <Button loading={runningCommands[entry.id]} size="xs" radius={"xl"} color="cyan" onClick={() => runCommand(entry)}>
                        <Icons.VscPlay size={18} />
                      </Button>
                    </Tooltip>
                    {runningCommands[entry.id] && (
                      <Tooltip label="Stop">
                        <Button size="xs" radius={"xl"} color="orange" onClick={() => stopCommand(entry.id)}>
                          <Icons.VscDebugStop size={18} />
                        </Button>
                      </Tooltip>
                    )}
                    <Tooltip label="Remove From History">
                      <Button size="xs" radius={"xl"} color="red" onClick={() => removeCommand(entry.id)}>
                        <Icons.VscClose size={18} />
                      </Button>
                    </Tooltip>
                  </Group>
                </Flex>
              </Accordion.Panel>
            </Accordion.Item>
          ))
        ) : (
          <Text size="sm" mt="md">
            No history found. Run a command to get started.
          </Text>
        )}
      </Accordion>
    </Box>
  );
};
