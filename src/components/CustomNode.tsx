import { memo } from "react";
import { Handle, Position } from "reactflow";
import { NodeData } from "../types";
import { NodeProps } from "reactflow";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRotateRight,
  faCheck,
  faClock,
  faExclamation,
  faBan,
} from "@fortawesome/free-solid-svg-icons";

function CustomNode({ data }: NodeProps<NodeData>) {
  const getBackgroundColor = () => {
    if (data.isSelected || data.isConnected) {
      if (data.isBronze) return "bg-amber-900";
      if (data.category === "data_mart") return "bg-yellow-600";
      if (data.category === "dq") return "bg-blue-600";
      return "bg-gray-500";
    }

    if (data.isBronze) return "bg-amber-700";
    if (data.category === "data_mart") return "bg-yellow-500";
    if (data.category === "dq") return "bg-blue-500";
    return "bg-gray-400";
  };

  const getBorderStyle = () => {
    if (data.isAffectedByFailure) return "border-red-500 border-4";
    return "border-gray-700 border-1";
  };

  const renderStatusIcon = () => {
    let icon;
    if (data.isFailed) {
      icon = (
        <FontAwesomeIcon
          icon={faExclamation}
          className="text-red-600"
          size="3x"
        />
      );
    } else if (data.isProcessing) {
      icon = (
        <FontAwesomeIcon icon={faRotateRight} className="spinner" size="3x" />
      );
    } else if (!data.isEnabled) {
      icon = (
        <FontAwesomeIcon icon={faBan} className="text-gray-600" size="3x" />
      );
    } else if (data.isRefreshedToday) {
      icon = (
        <FontAwesomeIcon icon={faCheck} className="text-green-600" size="3x" />
      );
    } else if (!data.isRefreshedToday) {
      icon = (
        <FontAwesomeIcon icon={faClock} className="text-rose-300" size="3x" />
      );
    } else {
      return null;
    }

    return (
      <div className="flex justify-center items-center w-8 h-8 p-6">{icon}</div>
    );
  };

  const backgroundColor = getBackgroundColor();
  const borderStyle = getBorderStyle();
  const statusIcon = renderStatusIcon();
  const textColor = data.isBronze ? "text-gray-300" : "text-gray-800";

  return (
    <div
      className={`flex items-center space-x-2 p-2 ${backgroundColor} rounded ${textColor} ${borderStyle}`}
    >
      {statusIcon}
      <div>
        <p className="font-bold text-sm">{data.label}</p>
        <p className="text-sm">{data.formattedDateTime}</p>
        <p className="text-sm italic">Seven day average: {data.avgTime}</p>
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(CustomNode);
