import "reactflow/dist/style.css";

// This is used to display a leva (https://github.com/pmndrs/leva) control panel for the example
import { useControls } from "leva";
import { useEffect, useState } from "react";
import ReactFlow, {
  // addEdge,
  // ConnectionLineType,
  Controls,
  MarkerType,
  Node,
  // NodeMouseHandler,
  NodeTypes,
  // OnConnect,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  // useReactFlow,
} from "reactflow";

import CustomNode from "./components/CustomNode";
import useAutoLayout, { LayoutOptions } from "./useAutoLayout";
import { useLoadData } from "./useLoadData";
import { getEdgeStyles } from "./utils";
import { useSearchParams } from "react-router-dom";
import { ReactFlowAutoLayoutProps } from "./types";
import Navbar from "./components/Navbar";

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

const proOptions = {
  account: "paid-pro",
  hideAttribution: true,
};

const defaultEdgeOptions = {
  // type: 'smoothstep',
  markerEnd: { type: MarkerType.ArrowClosed },
  pathOptions: { offset: 5 },
};

/**
 * This example shows how you can automatically arrange your nodes after adding child nodes to your graph.
 */
function ReactFlowAutoLayout(props: ReactFlowAutoLayoutProps) {
  // const { fitView } = useReactFlow();
  const [loadParams, setLoadParams] = useState({ ...props });

  useEffect(() => {
    // This effect will re-run whenever props change, updating the load parameters
    setLoadParams({ ...props });
  }, [props]); // Assuming props is an object containing all necessary parameters

  // fitView();

  const {
    nodes: loadedNodes,
    edges: loadedEdges,
    isLoading,
  } = useLoadData(
    loadParams.layer,
    loadParams.category,
    loadParams.isFailed,
    loadParams.isEnabled,
    loadParams.isProcessing,
    loadParams.isBronze,
    loadParams.isRefreshedToday
  );
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [connectedNodes, setConnectedNodes] = useState<string[]>([]);

  // 👇 This hook is used to display a leva (https://github.com/pmndrs/leva) control panel for this example.
  // You can safely remove it, if you don't want to use it.
  const layoutOptions = useControls({
    algorithm: {
      value: "d3-hierarchy" as LayoutOptions["algorithm"],
      options: ["dagre", "d3-hierarchy"] as LayoutOptions["algorithm"][],
    },
    direction: {
      value: "LR" as LayoutOptions["direction"],
      options: {
        down: "TB",
        right: "LR",
        up: "BT",
        left: "RL",
      } as Record<string, LayoutOptions["direction"]>,
    },
    spacing: [25, 50],
  });

  // this hook handles the computation of the layout once the elements or the direction changes
  useAutoLayout(layoutOptions);

  useEffect(() => {
    if (!isLoading) {
      if (loadedNodes.length > 0) {
        setNodes(loadedNodes);
      }
      if (loadedEdges.length > 0) {
        setEdges(loadedEdges);
      }
    }
  }, [isLoading, loadedNodes, loadedEdges, setNodes, setEdges]);

  const onNodeClick = (_: React.MouseEvent, element: Node) => {
    if (element.type === "custom") {
      setSelectedNode(element);
      const connected = edges.filter(
        (edge) => edge.source === element.id || edge.target === element.id
      );
      setConnectedNodes(
        connected.map((edge) =>
          edge.source === element.id ? edge.target : edge.source
        )
      );
    }
  };

  const styledEdges = edges.map((edge) => getEdgeStyles(edge, selectedNode));

  const styledNodes = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      // Check if the node is selected
      isSelected: selectedNode?.id === node.id,
      // Additionally, check if this node is among those connected to the selected node
      isConnected: connectedNodes.includes(node.id),
    },
  }));

  console.log("loadedNodes", loadedNodes);
  console.log("nodes", nodes);
  console.log("selectedNode", selectedNode);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    ); // Render a loading indicator
  }

  return (
    <div className="w-screen h-screen">
      <ReactFlow
        nodes={styledNodes}
        edges={styledEdges}
        // edges={filteredEdges.length > 0 ? filteredEdges : edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        // onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={() => {
          setSelectedNode(null);
          setConnectedNodes([]);
        }}
        nodesDraggable={false}
        defaultEdgeOptions={defaultEdgeOptions}
        // connectionLineType={ConnectionLineType.SmoothStep}
        proOptions={proOptions}
        // zoomOnDoubleClick={false}
      />
      <Controls showInteractive={false} />
    </div>
  );
}

const App = () => {
  // Assuming you are using URL params to determine the filter
  const [searchParams] = useSearchParams();

  const layer = searchParams.get("layer") || undefined;
  const category = searchParams.get("category") || undefined;
  const isFailed = searchParams.get("isFailed") || undefined;
  const isEnabled = searchParams.get("isEnabled") || undefined;
  const isProcessing = searchParams.get("isProcessing") || undefined;
  const isBronze = searchParams.get("isBronze") || undefined;
  const isRefreshedToday = searchParams.get("isRefreshedToday") || undefined;

  return (
    <div>
      <Navbar />
      <ReactFlowProvider>
        <ReactFlowAutoLayout
          layer={layer}
          category={category}
          isFailed={isFailed}
          isEnabled={isEnabled}
          isProcessing={isProcessing}
          isBronze={isBronze}
          isRefreshedToday={isRefreshedToday}
        />
      </ReactFlowProvider>
    </div>
  );
};

export default App;
