import { useCallback, useState, useMemo } from "react";
import {
  ReactFlow,
  addEdge,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  type Node,
  type Edge,
  type Connection,
  type NodeProps,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Input, Toggle } from "@/components/ui";
import { SharedSelect, type SelectOption } from "@/shared/SharedSelect";
import { Plus, Minus, CheckCircle, XCircle, GitBranch } from "lucide-react";

// Types for workflow data
interface ConditionData {
  id: string;
  name: string;
  leftSide: string;
  operator: string;
  rightSide: string;
  leftDataType: string;
  rightDataType: string;
}

interface WorkflowData {
  name: string;
  executionPoint: string;
  description: string;
  isDefault: boolean;
  conditions: ConditionData[];
}

// Custom Node Types
interface ConditionNodeData extends Record<string, unknown> {
  label?: string;
  leftSide?: string;
  operator?: string;
  rightSide?: string;
  leftDataType?: string;
  rightDataType?: string;
}

interface ActionNodeData extends Record<string, unknown> {
  label?: string;
}

// Custom Node Components
const ConditionNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as ConditionNodeData;
  return (
    <div
      className={`bg-white rounded-2xl shadow-md border ${
        selected ? "border-[#00B7AD] border-2" : "border-gray-100"
      } min-w-[320px] p-5`}
    >
      <Handle type="target" position={Position.Top} className="!bg-[#00B7AD] !w-3 !h-3" />

      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#E8F8F7] flex items-center justify-center">
          <GitBranch className="w-5 h-5 text-[#00B7AD]" />
        </div>
        <span className="font-semibold text-gray-800 text-base">
          {String(nodeData.label || "Check Type")}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
          <span>Left Hand Side</span>
          <span>Right Hand Side</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 border border-gray-100">
            {String(nodeData.leftSide || "type")}
          </div>
          <span className="text-gray-400 font-bold text-lg px-2">
            {String(nodeData.operator || "==")}
          </span>
          <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 border border-gray-100">
            {String(nodeData.rightSide || "FAR")}
          </div>
        </div>
        <div className="flex items-center gap-6 text-xs pt-2">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
            <span className="text-green-600 font-medium">True</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-300"></span>
            <span className="text-gray-400 font-medium">False</span>
          </span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="!bg-green-500 !w-3 !h-3"
        style={{ left: '25%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="!bg-gray-300 !w-3 !h-3"
        style={{ left: '75%' }}
      />
    </div>
  );
};

const SuccessNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as ActionNodeData;
  return (
    <div
      className={`bg-white rounded-2xl shadow-md border ${
        selected ? "border-green-500 border-2" : "border-gray-100"
      } min-w-[220px] p-5`}
    >
      <Handle type="target" position={Position.Top} className="!bg-green-500 !w-3 !h-3" />

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <span className="font-semibold text-gray-800 text-base block">
            {String(nodeData.label || "Success")}
          </span>
          <p className="text-xs text-gray-400 mt-0.5">
            Workflow completes successfully
          </p>
        </div>
      </div>
    </div>
  );
};

const FailNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as ActionNodeData;
  return (
    <div
      className={`bg-white rounded-2xl shadow-md border ${
        selected ? "border-red-500 border-2" : "border-gray-100"
      } min-w-[220px] p-5`}
    >
      <Handle type="target" position={Position.Top} className="!bg-red-500 !w-3 !h-3" />

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
          <XCircle className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <span className="font-semibold text-gray-800 text-base block">
            {String(nodeData.label || "Fail")}
          </span>
          <p className="text-xs text-gray-400 mt-0.5">Workflow fails validation</p>
        </div>
      </div>
    </div>
  );
};

// Define node types
const nodeTypes = {
  condition: ConditionNode,
  success: SuccessNode,
  fail: FailNode,
};

// Initial nodes and edges
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

// Draggable block items
interface BlockItem {
  type: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const blockItems: BlockItem[] = [
  {
    type: "condition",
    label: "Condition Stage",
    icon: <GitBranch className="w-5 h-5" />,
    color: "#00B7AD",
  },
  {
    type: "success",
    label: "Action: Success",
    icon: <CheckCircle className="w-5 h-5" />,
    color: "#22C55E",
  },
  {
    type: "fail",
    label: "Action: Fail",
    icon: <XCircle className="w-5 h-5" />,
    color: "#EF4444",
  },
];

// Operator options for conditions
const operatorOptions: SelectOption[] = [
  { value: "==", label: "Equal (==)" },
  { value: "!=", label: "Not Equal (!=)" },
  { value: ">", label: "Greater Than (>)" },
  { value: "<", label: "Less Than (<)" },
  { value: ">=", label: "Greater or Equal (>=)" },
  { value: "<=", label: "Less or Equal (<=)" },
  { value: "contains", label: "Contains" },
  { value: "startsWith", label: "Starts With" },
  { value: "endsWith", label: "Ends With" },
];

// Data type options
const dataTypeOptions: SelectOption[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "field", label: "Field Reference" },
];

// Execution point options
const executionPointOptions: SelectOption[] = [
  { value: "before_create", label: "Before Create" },
  { value: "after_create", label: "After Create" },
  { value: "before_update", label: "Before Update" },
  { value: "after_update", label: "After Update" },
  { value: "before_delete", label: "Before Delete" },
  { value: "after_delete", label: "After Delete" },
];

export default function AssumptionBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [activeTab, setActiveTab] = useState<"properties" | "settings">(
    "settings"
  );

  // Workflow settings
  const [workflowData, setWorkflowData] = useState<WorkflowData>({
    name: "",
    executionPoint: "",
    description: "",
    isDefault: true,
    conditions: [],
  });

  // Stage properties (for selected node)
  const [stageData, setStageData] = useState({
    name: "",
    leftSide: "",
    leftDataType: "text",
    operator: "==",
    rightSide: "",
    rightDataType: "text",
  });

  const nodeTypesMemo = useMemo(() => nodeTypes, []);

  const onConnect = useCallback(
    (params: Connection) => {
      const sourceHandle = params.sourceHandle;
      let edgeStyle = {};
      let labelText = "";

      if (sourceHandle === "true") {
        edgeStyle = { stroke: "#22C55E", strokeWidth: 2 };
        labelText = "True";
      } else if (sourceHandle === "false") {
        edgeStyle = { stroke: "#9CA3AF", strokeWidth: 2 };
        labelText = "False";
      }

      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "smoothstep",
            style: edgeStyle,
            label: labelText,
            labelStyle: {
              fill: sourceHandle === "true" ? "#22C55E" : "#9CA3AF",
              fontWeight: 500,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: sourceHandle === "true" ? "#22C55E" : "#9CA3AF",
            },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setActiveTab("properties");
    if (node.data) {
      setStageData({
        name: (node.data.label as string) || "",
        leftSide: (node.data.leftSide as string) || "",
        leftDataType: (node.data.leftDataType as string) || "text",
        operator: (node.data.operator as string) || "==",
        rightSide: (node.data.rightSide as string) || "",
        rightDataType: (node.data.rightDataType as string) || "text",
      });
    }
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setActiveTab("settings");
  }, []);

  // Handle drop from sidebar
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      const label = event.dataTransfer.getData("application/label");

      if (!type) return;

      const position = {
        x: event.clientX - 400,
        y: event.clientY - 100,
      };

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: {
          label,
          leftSide: "",
          operator: "==",
          rightSide: "",
          leftDataType: "text",
          rightDataType: "text",
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const onDragStart = (
    event: React.DragEvent,
    nodeType: string,
    label: string
  ) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.setData("application/label", label);
    event.dataTransfer.effectAllowed = "move";
  };

  // Update selected node data
  const updateSelectedNode = useCallback(() => {
    if (!selectedNode) return;

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              label: stageData.name,
              leftSide: stageData.leftSide,
              leftDataType: stageData.leftDataType,
              operator: stageData.operator,
              rightSide: stageData.rightSide,
              rightDataType: stageData.rightDataType,
            },
          };
        }
        return node;
      })
    );
  }, [selectedNode, stageData, setNodes]);

  // Delete selected node
  const deleteSelectedNode = useCallback(() => {
    if (!selectedNode) return;
    setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
    setEdges((eds) =>
      eds.filter(
        (edge) =>
          edge.source !== selectedNode.id && edge.target !== selectedNode.id
      )
    );
    setSelectedNode(null);
  }, [selectedNode, setNodes, setEdges]);

  // Build workflow JSON for API - available for future use
  const buildWorkflowJSON = useCallback(() => {
    const workflow = {
      ...workflowData,
      nodes: nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data,
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
      })),
    };
    console.log("Workflow JSON:", JSON.stringify(workflow, null, 2));
    return workflow;
  }, [workflowData, nodes, edges]);

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-[#FAFAFA]">
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Blocks */}
        <div className="w-[180px] bg-white border-r p-4 flex-shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect
                  x="2"
                  y="2"
                  width="7"
                  height="7"
                  rx="1.5"
                  stroke="#282828"
                  strokeWidth="1.5"
                />
                <rect
                  x="11"
                  y="2"
                  width="7"
                  height="7"
                  rx="1.5"
                  stroke="#282828"
                  strokeWidth="1.5"
                />
                <rect
                  x="2"
                  y="11"
                  width="7"
                  height="7"
                  rx="1.5"
                  stroke="#282828"
                  strokeWidth="1.5"
                />
                <rect
                  x="11"
                  y="11"
                  width="7"
                  height="7"
                  rx="1.5"
                  stroke="#282828"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <span className="font-semibold text-gray-800">Blocks</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-auto">
              <path d="M4 6L8 10L12 6" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-[10px] text-gray-400 mb-4 leading-relaxed">
            Drag and drop blocks to the canvas to build your validation workflow
          </p>

          <div className="space-y-2">
            {blockItems.map((block) => (
              <div
                key={block.type}
                draggable
                onDragStart={(e) => onDragStart(e, block.type, block.label)}
                className="flex items-center gap-2 p-2.5 bg-white border border-gray-100 rounded-xl cursor-grab hover:border-[#00B7AD] hover:shadow-sm transition-all active:cursor-grabbing"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${block.color}10` }}
                >
                  <span style={{ color: block.color }}>{block.icon}</span>
                </div>
                <span className="text-xs font-medium text-gray-700">
                  {block.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypesMemo}
            fitView
            className="bg-[#FAFAFA]"
          >
            <Background 
              color="#E8E8E8" 
              gap={16} 
              size={1}
            />
            <MiniMap 
              className="!bg-white !rounded-xl !shadow-sm !border !border-gray-100" 
              nodeColor="#00B7AD"
              maskColor="rgba(0,0,0,0.05)"
            />
          </ReactFlow>

          {/* Zoom controls - Bottom Left */}
          <div className="absolute bottom-4 left-4 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <button className="p-2.5 hover:bg-gray-50 transition-colors border-b border-gray-100">
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-2.5 hover:bg-gray-50 transition-colors">
              <Minus className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Right Sidebar - Properties/Settings */}
        <div className="w-[300px] bg-white border-l flex-shrink-0 overflow-y-auto">
          {/* Tabs */}
          <div className="flex p-2 gap-1">
            <button
              onClick={() => setActiveTab("properties")}
              className={`flex-1 py-2.5 text-sm font-medium transition-all rounded-lg ${
                activeTab === "properties"
                  ? "text-white bg-[#00B7AD] shadow-sm"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              Stage Properties
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex-1 py-2.5 text-sm font-medium transition-all rounded-lg ${
                activeTab === "settings"
                  ? "text-white bg-[#00B7AD] shadow-sm"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              Workflow Settings
            </button>
          </div>

          <div className="p-4 pt-2">
            {activeTab === "settings" ? (
              /* Workflow Settings */
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <Input
                    placeholder="Enter Segment name"
                    value={workflowData.name}
                    onChange={(e) =>
                      setWorkflowData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Execution Point
                  </label>
                  <SharedSelect
                    options={executionPointOptions}
                    value={workflowData.executionPoint}
                    onChange={(value) =>
                      setWorkflowData((prev) => ({
                        ...prev,
                        executionPoint: String(value),
                      }))
                    }
                    placeholder="Select Execution Point"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B7AD] focus:border-transparent resize-none bg-white"
                    rows={4}
                    placeholder="Enter Segment Description"
                    value={workflowData.description}
                    onChange={(e) =>
                      setWorkflowData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-medium text-gray-700">
                    Set as Default Workflow
                  </span>
                  <Toggle
                    id="defaultWorkflow"
                    label=""
                    checked={workflowData.isDefault}
                    onChange={(checked) =>
                      setWorkflowData((prev) => ({
                        ...prev,
                        isDefault: checked,
                      }))
                    }
                  />
                </div>

                {/* Save Button */}
                <div className="pt-4">
                  <button
                    onClick={() => {
                      const workflow = buildWorkflowJSON();
                      console.log("Saving workflow:", workflow);
                      // TODO: Send to API
                    }}
                    className="w-full px-4 py-2.5 bg-[#00B7AD] text-white rounded-xl text-sm font-medium hover:bg-[#009B92] transition-colors"
                  >
                    Save Workflow
                  </button>
                </div>
              </div>
            ) : (
              /* Stage Properties */
              <div className="space-y-5">
                {selectedNode ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stage Name
                      </label>
                      <Input
                        placeholder="Enter Stage name"
                        value={stageData.name}
                        onChange={(e) =>
                          setStageData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />
                    </div>

                    {selectedNode.type === "condition" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Left Hand Side (LHS)
                          </label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter Left Hand Side"
                              value={stageData.leftSide}
                              onChange={(e) =>
                                setStageData((prev) => ({
                                  ...prev,
                                  leftSide: e.target.value,
                                }))
                              }
                              className="flex-1"
                            />
                            <div className="w-[120px]">
                              <SharedSelect
                                options={dataTypeOptions}
                                value={stageData.leftDataType}
                                onChange={(value) =>
                                  setStageData((prev) => ({
                                    ...prev,
                                    leftDataType: String(value),
                                  }))
                                }
                                placeholder="Select Data"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Operation
                          </label>
                          <SharedSelect
                            options={operatorOptions}
                            value={stageData.operator}
                            onChange={(value) =>
                              setStageData((prev) => ({
                                ...prev,
                                operator: String(value),
                              }))
                            }
                            placeholder="Select Operator"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Right Hand Side (LHS)
                          </label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter Right Hand Side"
                              value={stageData.rightSide}
                              onChange={(e) =>
                                setStageData((prev) => ({
                                  ...prev,
                                  rightSide: e.target.value,
                                }))
                              }
                              className="flex-1"
                            />
                            <div className="w-[120px]">
                              <SharedSelect
                                options={dataTypeOptions}
                                value={stageData.rightDataType}
                                onChange={(value) =>
                                  setStageData((prev) => ({
                                    ...prev,
                                    rightDataType: String(value),
                                  }))
                                }
                                placeholder="Select Data"
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex gap-2 pt-4">
                      <button
                        onClick={updateSelectedNode}
                        className="flex-1 px-4 py-2.5 bg-[#00B7AD] text-white rounded-xl text-sm font-medium hover:bg-[#009B92] transition-colors"
                      >
                        Update Stage
                      </button>
                      <button
                        onClick={deleteSelectedNode}
                        className="px-4 py-2.5 bg-red-50 text-red-500 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
                      <GitBranch className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-sm">Select a stage to edit its properties</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
