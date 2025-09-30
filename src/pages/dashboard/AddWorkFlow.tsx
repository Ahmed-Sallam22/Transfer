import { Input, Toggle } from "@/components/ui";
import SharedModal from "@/shared/SharedModal";
import { SharedSelect, type SelectOption } from "@/shared/SharedSelect";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetUserLevelsQuery,
  useCreateWorkflowTemplateMutation,
  useUpdateWorkflowTemplateMutation,
  useGetWorkflowTemplateQuery,
  type WorkflowStage,
  type CreateWorkflowRequest,
} from "@/api/workflow.api";

export default function AddWorkFlow() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  // API hooks
  const { data: userLevelsData } = useGetUserLevelsQuery();
  const [createWorkflowTemplate, { isLoading: isCreating }] =
    useCreateWorkflowTemplateMutation();
  const [updateWorkflowTemplate, { isLoading: isUpdating }] =
    useUpdateWorkflowTemplateMutation();
  const { data: workflowData, isLoading: isLoadingWorkflow } =
    useGetWorkflowTemplateQuery(Number(id), { skip: !isEditMode });

  const handleBack = () => {
    navigate("/app/WorkFlow"); // Navigate back to the previous page
  };

  // Workflow form state
  const [workflowForm, setWorkflowForm] = useState({
    code: "",
    name: "",
    transferType: "",
    version: undefined as number | undefined,
    description: "",
    isActive: true,
  });

  // Stages state
  const [stages, setStages] = useState<WorkflowStage[]>([]);

  // Stage form state for modal
  const [stageForm, setStageForm] = useState({
    name: "",
    decisionPolicy: "ALL" as "ALL" | "ANY" | "QUORUM",
    allowReject: true,
    slaHours: undefined as number | undefined,
    requiredUserLevel: undefined as number | undefined,
    isActive: true,
  });

  // Edit stage state
  const [editingStageIndex, setEditingStageIndex] = useState<number | null>(
    null
  );
  const [isStageEditMode, setIsStageEditMode] = useState(false);

  const [Transtype, setTranstype] = useState<string>("");

  // Load workflow data when editing
  useEffect(() => {
    if (isEditMode && workflowData) {
      const formData = {
        code: workflowData.code,
        name: workflowData.name,
        transferType: workflowData.transfer_type,
        version: workflowData.version,
        description: workflowData.description,
        isActive: workflowData.is_active,
      };

      setWorkflowForm(formData);
      setTranstype(workflowData.transfer_type);

      // Load stages data
      if (workflowData.stages) {
        const mappedStages: WorkflowStage[] = workflowData.stages.map(
          (stage) => ({
            order_index: stage.order_index,
            name: stage.name,
            decision_policy: stage.decision_policy,
            allow_reject: stage.allow_reject,
            sla_hours: stage.sla_hours,
            required_user_level: stage.required_user_level,
            // Map additional fields if needed
            allow_delegate: stage.allow_delegate,
            quorum_count: stage.quorum_count,
            required_role: stage.required_role,
            dynamic_filter_json: stage.dynamic_filter_json,
            parallel_group: stage.parallel_group,
          })
        );
        setStages(mappedStages);
      }
    }
  }, [isEditMode, workflowData]);

  // Function to get all workflow values
  const getAllWorkflowValues = (): CreateWorkflowRequest => {
    // Always return all values for both create and update operations
    return {
      code: workflowForm.code,
      transfer_type: workflowForm.transferType,
      name: workflowForm.name,
      description: workflowForm.description,
      version: workflowForm.version || 1,
      is_active: workflowForm.isActive,
      stages: stages,
    };
  };

  // Select options for transaction dates
  const TranstypeOptions: SelectOption[] = [
    { value: "FAR", label: "FAR" },
    { value: "FAD", label: "FAD" },
    { value: "AFR", label: "AFR" },
    { value: "Generic", label: "Generic" },
  ];

  // Decision policy options
  const decisionPolicyOptions: SelectOption[] = [
    { value: "ALL", label: "ALL" },
    { value: "ANY", label: "ANY" },
    { value: "QUORUM", label: "QUORUM" },
  ];

  // User level options from API
  const userLevelOptions: SelectOption[] =
    userLevelsData?.map((level) => ({
      value: level.id.toString(),
      label: `${level.name}`,
    })) || [];

  const handleSelectChange = (value: string | number) => {
    setTranstype(String(value));
    setWorkflowForm((prev) => ({ ...prev, transferType: String(value) }));
  };

  const handleCreateStage = () => {
    if (isStageEditMode && editingStageIndex !== null) {
      // Update existing stage
      const updatedStages = [...stages];
      updatedStages[editingStageIndex] = {
        order_index: editingStageIndex + 1,
        name: stageForm.name,
        decision_policy: stageForm.decisionPolicy,
        allow_reject: stageForm.allowReject,
        sla_hours: stageForm.slaHours || 24,
        required_user_level: stageForm.requiredUserLevel || 1,
      };
      setStages(updatedStages);
      setIsStageEditMode(false);
      setEditingStageIndex(null);
    } else {
      // Create new stage
      const newStage: WorkflowStage = {
        order_index: stages.length + 1,
        name: stageForm.name,
        decision_policy: stageForm.decisionPolicy,
        allow_reject: stageForm.allowReject,
        sla_hours: stageForm.slaHours || 24,
        required_user_level: stageForm.requiredUserLevel || 1,
      };
      setStages((prev) => [...prev, newStage]);
    }

    setIsCreateModalOpen(false);

    // Reset stage form
    setStageForm({
      name: "",
      decisionPolicy: "ALL",
      allowReject: true,
      slaHours: undefined,
      requiredUserLevel: undefined,
      isActive: true,
    });
  };

  const handleDeleteStage = (index: number) => {
    const updatedStages = stages.filter((_, i) => i !== index);
    // Reorder the remaining stages
    const reorderedStages = updatedStages.map((stage, i) => ({
      ...stage,
      order_index: i + 1,
    }));
    setStages(reorderedStages);
  };

  const handleEditStage = (index: number) => {
    const stage = stages[index];
    setStageForm({
      name: stage.name,
      decisionPolicy: stage.decision_policy,
      allowReject: stage.allow_reject,
      slaHours: stage.sla_hours,
      requiredUserLevel: stage.required_user_level,
      isActive: true, // Default to true since stages don't have this field yet
    });
    setEditingStageIndex(index);
    setIsStageEditMode(true);
    setIsCreateModalOpen(true);
  };

  const handleCreateWorkflow = async () => {
    try {
      const workflowData = getAllWorkflowValues();

      if (isEditMode && id) {
        // Update existing workflow with all values
        await updateWorkflowTemplate({
          id: Number(id),
          body: workflowData,
        }).unwrap();
      } else {
        // Create new workflow
        await createWorkflowTemplate(workflowData).unwrap();
      }

      // Navigate back to workflow list on success
      navigate("/app/WorkFlow");
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} workflow:`,
        error
      );
    }
  };

  function DotSeparated({ items }: { items: string[] }) {
    return (
      <div className="flex items-center text-xs text-[#757575] [&>*+*]:before:content-['•'] [&>*+*]:before:mx-2">
        {items.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    );
  }

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const handleCreateWorkFlow = () => {
    // Reset form for new stage
    setStageForm({
      name: "",
      decisionPolicy: "ALL",
      allowReject: true,
      slaHours: undefined,
      requiredUserLevel: undefined,
      isActive: true,
    });
    setIsStageEditMode(false);
    setEditingStageIndex(null);
    // Open modal after clearing values
    setIsCreateModalOpen(true);

    console.log("Creating new stage - form cleared"); // Debug log
  };
  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setIsStageEditMode(false);
    setEditingStageIndex(null);
    // Reset stage form
    setStageForm({
      name: "",
      decisionPolicy: "ALL",
      allowReject: true,
      slaHours: undefined,
      requiredUserLevel: undefined,
      isActive: true,
    });
  };

  // Show loading state when fetching workflow data for editing
  if (isEditMode && isLoadingWorkflow) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B7AD]"></div>
        <span className="ml-2 text-gray-600">Loading workflow...</span>
      </div>
    );
  }

  return (
    <div>
      <SharedModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        title={isStageEditMode ? "Edit Stage" : "Create Stage"}
        size="md"
      >
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Stage Name"
              type="text"
              placeholder="Enter stage name"
              value={stageForm.name}
              onChange={(e) =>
                setStageForm((prev) => ({ ...prev, name: e.target.value }))
              }
              autoComplete="off"
            />

            <SharedSelect
              title="Decision Policy"
              size="text-sm"
              options={decisionPolicyOptions}
              value={stageForm.decisionPolicy}
              onChange={(value) =>
                setStageForm((prev) => ({
                  ...prev,
                  decisionPolicy: value as "ALL" | "ANY" | "QUORUM",
                }))
              }
              placeholder="Select decision policy"
            />

            <SharedSelect
              title="Required User Level"
              size="text-sm"
              options={userLevelOptions}
              value={stageForm.requiredUserLevel?.toString() || ""}
              onChange={(value) =>
                setStageForm((prev) => ({
                  ...prev,
                  requiredUserLevel: value ? Number(value) : undefined,
                }))
              }
              placeholder="Select user level"
            />

            <Input
              label="SLA Hours"
              type="number"
              placeholder="Enter SLA hours (e.g., 24)"
              value={stageForm.slaHours?.toString() || ""}
              onChange={(e) =>
                setStageForm((prev) => ({
                  ...prev,
                  slaHours: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              autoComplete="off"
            />

            <div className="space-y-4">
              <Toggle
                id="allowReject"
                label="Allow Reject"
                checked={stageForm.allowReject}
                onChange={(checked) =>
                  setStageForm((prev) => ({
                    ...prev,
                    allowReject: checked,
                  }))
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={handleCloseModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateStage}
              disabled={
                !stageForm.name ||
                !stageForm.requiredUserLevel ||
                !stageForm.slaHours
              }
              className="px-4 py-2 text-sm font-medium text-white bg-[#00B7AD] border border-[#00B7AD] rounded-md hover:bg-[#00B7AD] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isStageEditMode ? "Update Stage" : "Create Stage"}
            </button>
          </div>
        </div>
      </SharedModal>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBack}
            className="flex items-center gap-2  cursor-pointer py-2 text-md text-[#00B7AD] hover:text-[#174ec4] "
          >
            Workflows
          </button>
          <span className="text-[#737373] text-lg">/</span>
          <h1 className="text-md  text-[#282828] font-meduim tracking-wide">
            {isEditMode ? "Edit Workflow" : "Create New Workflow"}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleBack}
            className="flex items-center gap-2  cursor-pointer p-1   text-md  text-[#282828] px-4 py-2 rounded-md border border-[#BBBBBB] transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateWorkflow}
            disabled={
              !workflowForm.code ||
              !workflowForm.name ||
              !workflowForm.transferType ||
              !workflowForm.version ||
              stages.length === 0 ||
              isCreating ||
              isUpdating
            }
            className="flex items-center gap-2 cursor-pointer p-1 text-md bg-[#00B7AD] text-white px-4 py-2 rounded-md hover:bg-[#00B7AD] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {(isCreating || isUpdating) && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {isEditMode ? "Update Workflow" : "Add Workflow"}
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-3 ">
          <h2 className="text-md ">Workflow Information</h2>

          <Toggle
            id="workflowStatus"
            label="Active"
            checked={workflowForm.isActive}
            onChange={(checked) =>
              setWorkflowForm((prev) => ({
                ...prev,
                isActive: checked,
              }))
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <Input
            label="Code"
            type="text"
            placeholder="Enter Code"
            value={workflowForm.code}
            onChange={(e) =>
              setWorkflowForm((prev) => ({ ...prev, code: e.target.value }))
            }
            autoComplete="off"
          />

          <Input
            label="Workflow Name"
            type="text"
            placeholder="Enter Workflow Name"
            value={workflowForm.name}
            onChange={(e) =>
              setWorkflowForm((prev) => ({ ...prev, name: e.target.value }))
            }
            autoComplete="off"
          />
          <SharedSelect
            title="Transfer Type"
            size="text-sm"
            options={TranstypeOptions}
            value={Transtype}
            onChange={handleSelectChange}
            placeholder="Select transaction date"
          />
          <Input
            label="Version"
            type="number"
            placeholder="Enter Version (e.g., 1)"
            value={workflowForm.version?.toString() || ""}
            onChange={(e) =>
              setWorkflowForm((prev) => ({
                ...prev,
                version: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
            autoComplete="off"
          />

          <div className="col-span-2">
            <label className="text-sm font-semibold " htmlFor="des">
              Description
            </label>
            <textarea
              placeholder="Describe your issue in detail...."
              rows={6}
              value={workflowForm.description}
              onChange={(e) =>
                setWorkflowForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className={`w-full px-3 py-3 mt-3 border border-[#E2E2E2] resize-none placeholder:text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B7AD] focus:border-transparent`}
              name="description"
              id="description"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 mt-4 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-md ">Workflow Stages</h2>

          <button
            onClick={handleCreateWorkFlow}
            className="flex items-center gap-2 text-sm  cursor-pointer p-1   text-md bg-[#00B7AD] text-white px-4 py-2 rounded-md hover:bg-[#00B7AD] transition"
          >
            Add Stage
          </button>
        </div>

        {stages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No stages added yet. Click "Add Stage" to create your first stage.
          </div>
        ) : (
          <div className="space-y-4">
            {stages.map((stage, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-4 h-full items-center"
              >
                <div className="col-span-1 flex items-center h-full justify-center font-semibold text-xl text-[#00B7AD] bg-[#F6F6F6] rounded-md p-4">
                  #{stage.order_index}
                </div>
                <div className="col-span-11 bg-[#F6F6F6] rounded-md p-4 flex flex-col gap-4">
                  <h2 className="text-md font-semibold text-[#00B7AD]">
                    {stage.name}
                  </h2>
                  <div className="flex  gap-2 justify-between ">
                    <div className="flex flex-col gap-2">
                      <DotSeparated
                        items={[
                          `Decision Policy: ${stage.decision_policy}`,
                          `Allow Reject: ${stage.allow_reject ? "Yes" : "No"}`,
                          `User Level: ${stage.required_user_level}`,
                        ]}
                      />
                      <p className="text-xs text-[#757575]">
                        SLA: {stage.sla_hours}H
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      {/* Edit Icon */}
                      <button
                        onClick={() => handleEditStage(index)}
                        className="p-1.5 text-[#00B7AD] hover:bg-[#00B7AD] rounded-md transition-colors"
                        title="Edit stage"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>

                      {/* Delete Icon */}
                      <button
                        onClick={() => handleDeleteStage(index)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete stage"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="3,6 5,6 21,6" />
                          <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
