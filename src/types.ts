import { Node, Edge } from "reactflow";

export interface NodeData {
  label: string;
  dateTime: string;
  formattedDateTime?: string;
  avgTime: string;
  category: string;
  isBronze: boolean;
  isEnabled: boolean;
  isFailed: boolean;
  isProcessing: boolean;
  isSelected?: boolean;
  isConnected?: boolean;
  isAffectedByFailure?: boolean;
  isRefreshedToday?: boolean;
}

export interface LayoutedElements {
  nodes: Node[];
  edges: Edge[];
}

export interface RowType {
  EntityId: string;
  EntityName: string;
  Category: string;
  IsBronze: string;
  IsEnabled: string;
  IsFailed: string;
  IsProcessing: string;
  MaxProcessedDateTimeUTC: string;
  SevenDayAvgProcessedTimeUTC: string;
  ChildEntitiesJSON: ChildEntityType[];
}

export interface ChildEntityType {
  ChildEntityId: string;
  ChildIsRequired: string;
}

export interface ReactFlowAutoLayoutProps {
  layer?: string;
  category?: string;
  isFailed?: string;
  isEnabled?: string;
  isProcessing?: string;
  isBronze?: string;
  isRefreshedToday?: string;
}
