import { Edge, Node, Position } from "reactflow";

import { Direction } from "./algorithms";

export function getSourceHandlePosition(direction: Direction) {
  switch (direction) {
    case "TB":
      return Position.Bottom;
    case "BT":
      return Position.Top;
    case "LR":
      return Position.Right;
    case "RL":
      return Position.Left;
  }
}

export function getTargetHandlePosition(direction: Direction) {
  switch (direction) {
    case "TB":
      return Position.Top;
    case "BT":
      return Position.Bottom;
    case "LR":
      return Position.Left;
    case "RL":
      return Position.Right;
  }
}

export const isToday = (dateString: Date) => {
  const today = new Date();
  const date = new Date(dateString);

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const getEdgeStyles = (edge: Edge, selectedNode: Node | null): Edge => {
  const isSelectedNodeInvolved =
    selectedNode &&
    (edge.source === selectedNode.id || edge.target === selectedNode.id);

  // Default styles
  let strokeColor = "#b1b1b7"; // Assuming this is your default edge color
  let strokeWidth = 2; // Default stroke width

  // If the edge is affected by a failure, make it red and thicker
  if (edge.data?.isAffectedByFailure && isSelectedNodeInvolved) {
    strokeColor = "#FF0000"; // Use red color for edges affected by failure
    strokeWidth = 3; // Increase stroke width to make it thicker
  } else if (edge.data?.isAffectedByFailure) {
    strokeColor = "#FF0000"; // Use red color for edges affected by failure
    strokeWidth = 1; // Increase stroke width to make it thicker
  } else if (isSelectedNodeInvolved) {
    // Apply different styling if the edge involves the selected node
    strokeColor = "#000000"; // Keep your existing logic for selected nodes
    strokeWidth = 3; // Increase stroke width to make it thicker
  }

  // Apply the determined stroke color and width to the edge
  return {
    ...edge,
    style: {
      ...edge.style,
      stroke: strokeColor,
      strokeWidth: strokeWidth,
    },
  };
};

export const markAffectedNodesAndEdges = (
  failedNodeIds: string[],
  nodes: Node[],
  edges: Edge[]
) => {
  const visitedNodes = new Set<string>(failedNodeIds); // Initialize with failed nodes
  const affectedEdges = new Set<string>();
  const stack = [...failedNodeIds];

  while (stack.length > 0) {
    const nodeId = stack.pop();
    edges.forEach((edge) => {
      if (edge.source === nodeId) {
        if (!visitedNodes.has(edge.target)) {
          stack.push(edge.target);
        }
        visitedNodes.add(edge.target);
        affectedEdges.add(edge.id);
      }
    });
  }

  // Mark nodes as affected by failure
  const updatedNodes = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      isAffectedByFailure: visitedNodes.has(node.id),
    },
  }));

  // Mark edges as affected by failure
  const updatedEdges = edges.map((edge) => ({
    ...edge,
    data: {
      ...edge.data,
      isAffectedByFailure: affectedEdges.has(edge.id),
    },
  }));

  return { updatedNodes, updatedEdges };
};
