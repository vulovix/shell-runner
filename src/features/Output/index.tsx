import React from "react";
import { Box, Button, Code, Flex, Group, Loader, Text, Title, Tooltip } from "@mantine/core";
import { IOutputs } from "../types";
import { IHistoryRecord, IRunningProcesses } from "../../hooks/useLoadData";
import { VscClearAll } from "react-icons/vsc";

export interface IOutputProps {
  outputs: IOutputs;
  history: Array<IHistoryRecord>;
  runningCommands: IRunningProcesses;
  clearOutput(): void;
}

const Icons: any = {
  VscClearAll: VscClearAll,
};

export function Output({ outputs, history, runningCommands, clearOutput }: IOutputProps) {
  return (
    <Box>
      <Flex align={"center"} justify="space-between" mt="xl">
        <Title fz={"md"} tt="uppercase">
          Output
        </Title>
        {history.length ? (
          <Tooltip label="Clear Output">
            <Button radius="xl" bg="none" variant="filled" onClick={clearOutput}>
              <Icons.VscClearAll size={18} />
            </Button>
          </Tooltip>
        ) : (
          <></>
        )}
      </Flex>
      {Object.keys(outputs).length === 0 && <Text size="sm">No output available.</Text>}
      {history.map((item) => (
        <Box key={item.id} style={{ borderRadius: "4px" }} bg="var(--mantine-color-dark-6)" mb={"md"}>
          {runningCommands[item.id] ? (
            <Box p="md">
              <Code bg="transparent" block px={0} pt={0}>
                <Group align="center" gap={4} m={0} p={0}>
                  <Loader color="teal" type="dots" />
                  <Text fz={"xs"} tt="lowercase">
                    {item.workingDir}
                  </Text>
                  <Text fz={"xs"}>$</Text>
                  <Text fz={"xs"} c="yellow">
                    {item.command}
                  </Text>
                  <br />
                </Group>
              </Code>
              <Code p={0} id={`output-${item.id}`} block mah={250} style={{ overflow: "auto" }} bg="transparent" />
            </Box>
          ) : outputs[item.id] ? (
            <Box p="md">
              <Code bg="transparent" block px={0} pt={0}>
                <Group align="center" gap={4} m={0} p={0}>
                  <Text fz={"xs"} tt="lowercase">
                    {item.workingDir}
                  </Text>
                  <Text fz={"xs"}>$</Text>
                  <Text fz={"xs"} c="yellow">
                    {item.command}
                  </Text>
                  <br />
                </Group>
              </Code>
              <Code p={0} block mah={250} style={{ overflow: "auto" }} bg="transparent">
                {outputs[item.id] || "No output available."}
              </Code>
            </Box>
          ) : (
            <></>
          )}
        </Box>
      ))}
    </Box>
  );
}
