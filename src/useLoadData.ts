import { useState, useEffect } from "react";
import Papa from "papaparse";
import { Node, Edge } from "reactflow";
import { RowType, NodeData, ChildEntityType } from "./types";
import { markAffectedNodesAndEdges, isToday } from "./utils";

interface LoadedData {
  validNodes: Node[];
  validEdges: Edge[];
}

export const useLoadData = (
  layerParam?: string,
  categoryParam?: string,
  isFailedParam?: string,
  isEnabledParam?: string,
  isProcessingParam?: string,
  isBronzeParam?: string,
  isRefreshedTodayParam?: string
) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    const fetchData = async () => {
      try {
        const response = await fetch("/wyniki_odswiezania.csv");
        const csv = await response.text();

        return new Promise<LoadedData>((resolve, reject) => {
          Papa.parse<RowType>(csv, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              const allNodes = new Set<number>();
              const nodeDataMap = new Map<number, NodeData>();
              const edges: Edge[] = [];

              results.data.forEach((row) => {
                const entityId = parseInt(row.EntityId);
                allNodes.add(entityId);
                nodeDataMap.set(entityId, {
                  label: row.EntityName,
                  dateTime: row.MaxProcessedDateTimeUTC,
                  formattedDateTime: new Date(
                    row.MaxProcessedDateTimeUTC
                  ).toLocaleString("pl-PL", {
                    dateStyle: "short",
                    timeStyle: "medium",
                  }),
                  avgTime: row.SevenDayAvgProcessedTimeUTC,
                  category: row.Category,
                  isBronze: row.IsBronze === "1",
                  isEnabled: row.IsEnabled === "1",
                  isFailed: row.IsFailed === "1",
                  isProcessing: row.IsProcessing === "1",
                  isRefreshedToday: isToday(
                    new Date(row.MaxProcessedDateTimeUTC)
                  ),
                });

                if (row.ChildEntitiesJSON) {
                  const childEntities: ChildEntityType[] = JSON.parse(
                    // @ts-expect-error Dunno how to fix this
                    row.ChildEntitiesJSON
                  );
                  childEntities.forEach((child) => {
                    allNodes.add(parseInt(child.ChildEntityId));
                    const isTargetProcessing = nodeDataMap.get(
                      parseInt(child.ChildEntityId)
                    )?.isProcessing;
                    edges.push({
                      id: `e${entityId}-${child.ChildEntityId}`,
                      source: entityId.toString(),
                      target: child.ChildEntityId.toString(),
                      animated: isTargetProcessing, // Edge is animated only if the target node is processing
                    });
                  });
                }
              });

              let validNodes = Array.from(allNodes)
                .map((nodeId) => {
                  const nodeInfo = nodeDataMap.get(nodeId);
                  if (!nodeInfo) return null;

                  return {
                    id: nodeId.toString(),
                    type: "custom",
                    data: nodeInfo,
                    position: { x: 0, y: 0 },
                  };
                })
                .filter((node) => node !== null) as Node[];

              let validEdges = edges; // Use the edges array as is, now correctly marking only relevant edges as animated

              const { updatedNodes, updatedEdges } = markAffectedNodesAndEdges(
                validNodes
                  .filter((node) => node.data.isFailed)
                  .map((node) => node.id),
                validNodes,
                validEdges
              );

              validNodes = updatedNodes;
              validEdges = updatedEdges;

              resolve({ validNodes, validEdges });
            },
            error: (error: Error) => reject(error),
          });
        });
      } catch (error) {
        console.error("Failed to load data", error);
        setIsLoading(false);
        throw error;
      }
    };

    // Once you have validNodes and validEdges, you can apply the logic for affected nodes and edges.
    fetchData().then(({ validNodes, validEdges }: LoadedData) => {
      let filteredNodes = validNodes;
      let filteredEdges = validEdges;

      const isFailed = isFailedParam === "true";
      const isEnabled = isEnabledParam === "true";
      const isProcessing = isProcessingParam === "true";
      const isBronze = isBronzeParam === "true";
      const isRefreshedToday = isRefreshedTodayParam === "true";

      switch (layerParam) {
        case "bronze":
          filteredNodes = validNodes.filter(
            (node) => node.data.isBronze === true
          );
          break;
        case "gold":
          filteredNodes = validNodes.filter(
            (node) => node.data.category === "data_mart"
          );
          break;
        case "silver":
          filteredNodes = validNodes.filter(
            (node) => !node.data.isBronze && node.data.category !== "data_mart"
          );
          break;
      }

      // Category filter
      if (categoryParam) {
        filteredNodes = filteredNodes.filter(
          (node) => node.data.category === categoryParam
        );
      }

      // isFailed filter
      if (isFailed) {
        const failedNodeIds = filteredNodes
          .filter((node) => node.data.isFailed)
          .map((node) => node.id);

        // Assuming markAffectedNodesAndEdges correctly identifies nodes affected by failures
        // and updates their isAffectedByFailure property accordingly
        const { updatedNodes, updatedEdges } = markAffectedNodesAndEdges(
          failedNodeIds,
          filteredNodes,
          filteredEdges
        );

        // Filter nodes to include only those that failed or are affected by a failure
        filteredNodes = updatedNodes.filter(
          (node) => node.data.isFailed || node.data.isAffectedByFailure
        );
        // Similarly, you might want to filter edges to include only those connected to filtered nodes
        filteredEdges = updatedEdges.filter((edge) =>
          filteredNodes.find(
            (node) => node.id === edge.source || node.id === edge.target
          )
        );
      }

      if (isEnabledParam !== undefined) {
        filteredNodes = filteredNodes.filter(
          (node) => node.data.isEnabled === isEnabled
        );
      }

      if (isProcessingParam !== undefined) {
        filteredNodes = filteredNodes.filter(
          (node) => node.data.isProcessing === isProcessing
        );
      }

      if (isBronzeParam !== undefined) {
        filteredNodes = filteredNodes.filter(
          (node) => node.data.isBronze === isBronze
        );
      }

      if (isRefreshedTodayParam !== undefined) {
        filteredNodes = filteredNodes.filter(
          (node) => node.data.isRefreshedToday === isRefreshedToday
        );
      }

      // Update state with the filtered nodes and edges
      setNodes(filteredNodes);
      setEdges(filteredEdges);
      setIsLoading(false);
    });
  }, [
    layerParam,
    categoryParam,
    isBronzeParam,
    isEnabledParam,
    isFailedParam,
    isProcessingParam,
    isRefreshedTodayParam,
  ]);

  return { nodes, edges, isLoading };
};
