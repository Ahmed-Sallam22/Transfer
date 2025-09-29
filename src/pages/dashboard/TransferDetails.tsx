import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import {
  SharedTable,
  type TableColumn,
  type TableRow as SharedTableRow,
} from "@/shared/SharedTable";
import SharedModal from "@/shared/SharedModal";
import {
  useGetTransferDetailsQuery,
  useCreateTransferMutation,
  useSubmitTransferMutation,
  useUploadExcelMutation,
  useReopenTransferMutation,
  transferDetailsApi,
  type CreateTransferData,
} from "@/api/transferDetails.api";
import { useGetBalanceReportQuery } from "@/api/balanceReport.api";
import { toast } from "react-hot-toast";
import { store } from "@/app/store";
import Select from "react-select";
import { formatNumber } from "@/utils/formatNumber";

interface TransferTableRow {
  id: string;
  to: number;
  from: number;
  encumbrance: number;
  availableBudget: number;
  actual: number;
  accountName: string;
  projectName: string;
  accountCode: string;
  projectCode: string;
  // Additional fields from API
  approvedBudget?: number;
  costCenterCode?: string;
  costCenterName?: string;
  // New fields for financial data
  other_ytd?: number;
  period?: string;
  // Validation errors
  validation_errors?: string[];
  // New budget fields
  budget_adjustments?: string;
  commitments?: string;
  expenditures?: string;
  initial_budget?: string;
  obligations?: string;
  other_consumption?: string;
}

interface TransferDetailRow {
  id: string;
  itemId: string;
  itemName: string;
  accountId: string;
  accountName: string;
  from: number;
  to: number;
  approvedBudget: number;
  current: number;
  availableBudget: number;
}

export default function TransferDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Get status from navigation state (passed from Transfer page)
  const transferStatus = location.state?.status || null;

  // Use RTK Query to fetch transfer details
  const transactionId = id || "513"; // Use ID from params or default to 513
  const {
    data: apiData,
    error,
    isLoading,
  } = useGetTransferDetailsQuery(transactionId);

  const [createTransfer] = useCreateTransferMutation();
  const [submitTransfer] = useSubmitTransferMutation();
  const [uploadExcel] = useUploadExcelMutation();
  const [reopenTransfer] = useReopenTransferMutation();

  // State for balance report period

  // Fetch balance report data for dropdowns
  const {
    data: balanceReportData,
    isLoading: isLoadingBalanceReport,
    error: balanceReportError,
  } = useGetBalanceReportQuery({
    as_of_period: apiData?.summary?.period || "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Local state for additional rows (new rows added by user)
  const [localRows, setLocalRows] = useState<TransferTableRow[]>([]);

  // State to track all edits locally (both existing and new rows)
  const [editedRows, setEditedRows] = useState<TransferTableRow[]>([]);

  // Initialize editedRows when API data loads
  useEffect(() => {
    if (apiData?.transfers && apiData.transfers.length > 0) {
      const initialRows = apiData.transfers.map((transfer) => ({
        id: transfer.transfer_id.toString(),
        to: parseFloat(transfer.to_center),
        from: parseFloat(transfer.from_center),
        encumbrance: parseFloat(transfer.encumbrance),
        availableBudget: parseFloat(transfer.available_budget),
        actual: parseFloat(transfer.actual),
        accountName:
          transfer.account_name && transfer.account_name.trim() !== ""
            ? transfer.account_name
            : transfer.account_name.toString(),
        projectName:
          transfer.project_name && transfer.project_name.trim() !== ""
            ? transfer.project_name
            : transfer.project_name,
        accountCode: transfer.account_code.toString(),
        projectCode: transfer.project_code,
        approvedBudget: parseFloat(transfer.approved_budget),
        costCenterCode: transfer.cost_center_code.toString(),
        costCenterName:
          transfer.cost_center_name && transfer.cost_center_name.trim() !== ""
            ? transfer.cost_center_name
            : transfer.cost_center_name.toString(),
        other_ytd: 0,
        period: apiData?.summary.period || "",
        validation_errors: transfer.validation_errors,
        budget_adjustments: transfer.budget_adjustments || "0",
        commitments: transfer.commitments || "0",
        expenditures: transfer.expenditures || "0",
        initial_budget: transfer.initial_budget || "0",
        obligations: transfer.obligations || "0",
        other_consumption: transfer.other_consumption || "0",
      }));
      setEditedRows(initialRows);
    } else {
      // If no API data, set a default row
      setEditedRows([createDefaultRow()]);
    }
  }, [apiData]);
const sameLine = (a: TransferTableRow, b: TransferTableRow) =>
  (a.costCenterCode || "") === (b.costCenterCode || "") &&
  (a.accountCode || "") === (b.accountCode || "") &&
  (a.projectCode || "") === (b.projectCode || "") &&
  Number(a.to || 0) === Number(b.to || 0) &&
  Number(a.from || 0) === Number(b.from || 0);

  // Combine edited API rows with local rows for display
const rows = useMemo(() => {
  // Show API rows, plus only the local rows that don’t match any API row
  const prunedLocal = localRows.filter(
    (lr) => !editedRows.some((er) => sameLine(er, lr))
  );
  return [...editedRows, ...prunedLocal];
}, [editedRows, localRows]);  useEffect(() => {
    const savedLocalRows = localStorage.getItem(`localRows_${transactionId}`);
    if (savedLocalRows) {
      try {
        const parsedRows = JSON.parse(savedLocalRows);
        setLocalRows(parsedRows);
        console.log("Loaded local rows from localStorage:", parsedRows);
      } catch (error) {
        console.error("Error parsing localStorage data:", error);
      }
    }
  }, [transactionId]);

  // Save local rows to localStorage whenever they change
  useEffect(() => {
    if (localRows.length > 0) {
      localStorage.setItem(
        `localRows_${transactionId}`,
        JSON.stringify(localRows)
      );
      console.log("Saved local rows to localStorage:", localRows);
    } else {
      localStorage.removeItem(`localRows_${transactionId}`);
    }
  }, [localRows, transactionId]);

useEffect(() => {
  const cleanupEmptyRows = () => {
    const nonEmptyRows = localRows.filter(isNonEmpty);
    if (nonEmptyRows.length > 0) {
      localStorage.setItem(`localRows_${transactionId}`, JSON.stringify(nonEmptyRows));
    } else {
      localStorage.removeItem(`localRows_${transactionId}`);
    }
  };
  const handleBeforeUnload = () => cleanupEmptyRows();
  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => {
    cleanupEmptyRows();
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
}, [localRows, transactionId]);

type Option = { value: string; label: string; name: string };

const toOptions = (arr: Array<string | { code: string; name?: string }>): Option[] =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  arr.map((x: any) =>
    typeof x === "string"
      ? { value: x, label: x, name: x }
      : { value: String(x.code), label: String(x.code), name: x.name ?? String(x.code) }
  );

const dedupeByValue = (opts: Option[]) =>
  Array.from(new Map(opts.map(o => [o.value, o])).values());

const accountOptions: Option[] = (() => {
  if (balanceReportData?.data?.Account?.length) {
    return toOptions(balanceReportData.data.Account);
  }
  if (apiData?.transfers?.length) {
    const opts = apiData.transfers.map(t => ({
      value: String(t.account_code),
      label: String(t.account_code),              // show CODE in the Select
      name: t.account_name?.trim() || String(t.account_code), // store friendly name
    }));
    return dedupeByValue(opts);
  }
  return [];
})();

const projectOptions: Option[] = (() => {
  if (balanceReportData?.data?.Project?.length) {
    return toOptions(balanceReportData.data.Project);
  }
  if (apiData?.transfers?.length) {
    const opts = apiData.transfers.map(t => ({
      value: t.project_code,
      label: t.project_code,
      name: t.project_name?.trim() || t.project_code,
    }));
    return dedupeByValue(opts);
  }
  return [];
})();

const costCenterOptions: Option[] = (() => {
  if (balanceReportData?.data?.Cost_Center?.length) {
    return toOptions(balanceReportData.data.Cost_Center);
  }
  if (apiData?.transfers?.length) {
    const opts = apiData.transfers.map(t => ({
      value: String(t.cost_center_code),
      label: String(t.cost_center_code),
      name: t.cost_center_name?.trim() || String(t.cost_center_code),
    }));
    return dedupeByValue(opts);
  }
  return [];
})();

  // Create a default row for when there's no data
  const createDefaultRow = (): TransferTableRow => ({
    id: "default-1",
    to: 0,
    from: 0,
    encumbrance: 0,
    availableBudget: 0,
    actual: 0,
    accountName: "",
    projectName: "",
    accountCode: "",
    projectCode: "",
    approvedBudget: 0,
    costCenterCode: "",
    costCenterName: "",
    other_ytd: 0,
    period: "",
    validation_errors: [], // Explicitly set as empty array (no errors)
    budget_adjustments: "0",
    commitments: "0",
    expenditures: "0",
    initial_budget: "0",
    obligations: "0",
    other_consumption: "0",
  });

  // Set submission status based on API status
  useEffect(() => {
    if (
      apiData?.status.status !== "not yet sent for approval" ||
      apiData?.summary?.status !== "not yet sent for approval"
    ) {
      setIsSubmitted(true);
    } else {
      setIsSubmitted(false);
    }
    if (apiData?.summary?.status !== "not yet sent for approval") {
      setIsSubmitted(true);
    } else {
      setIsSubmitted(false);
    }
  }, [apiData?.status.status, apiData?.summary.status]);

  // Sample data for fund requests details
  const [rowsDetails] = useState<TransferDetailRow[]>([
    {
      id: "1",
      itemId: "1213322",
      itemName: "11 - Project 1",
      accountId: "3121",
      accountName: "Audit fees",
      from: 1000,
      to: 20000,
      approvedBudget: 1283914.64,
      current: 346062.59,
      availableBudget: 22430677.39,
    },
    {
      id: "2",
      itemId: "1213323",
      itemName: "12 - Project 2",
      accountId: "3122",
      accountName: "Consulting fees",
      from: 5000,
      to: 15000,
      approvedBudget: 800000.0,
      current: 250000.0,
      availableBudget: 15000000.0,
    },
    {
      id: "3",
      itemId: "1213324",
      itemName: "13 - Project 3",
      accountId: "3123",
      accountName: "Training costs",
      from: 2000,
      to: 8000,
      approvedBudget: 500000.0,
      current: 150000.0,
      availableBudget: 8500000.0,
    },
  ]); // Check if pagination should be shown
  const shouldShowPagination = rows.length > 10;

  const handleBack = () => {
    navigate("/app/transfer");
  };

  const [pendingSavedLocalIds, setPendingSavedLocalIds] = useState<string[]>([]);
const [awaitingSync, setAwaitingSync] = useState(false);
const isNonEmpty = (row: TransferTableRow) =>
  row.costCenterCode !== "" ||
  row.accountCode !== "" ||
  row.projectCode !== "" ||
  row.to > 0 ||
  row.from > 0;


const handleSave = async () => {
  setIsSaving(true);
  try {
    const nonEmptyEditedRows = editedRows.filter(isNonEmpty);
    const nonEmptyLocalRows  = localRows.filter(isNonEmpty);

    const allRows = [...nonEmptyEditedRows, ...nonEmptyLocalRows];

    const transfersToSave: CreateTransferData[] = allRows.map((row) => {
      let fromCenter = row.from || 0;
      let toCenter   = row.to   || 0;
      if (fromCenter > 0) toCenter = 0;
      else if (toCenter > 0) fromCenter = 0;

      return {
        transaction: parseInt(transactionId),
        cost_center_code: row.costCenterCode || "",
        cost_center_name: row.costCenterName || "",
        account_code: row.accountCode || "",
        account_name: row.accountName || "",
        project_code: row.projectCode || "-",
        project_name: row.projectName || "-",
        approved_budget: row.approvedBudget || 0,
        available_budget: row.availableBudget || 0,
        to_center: toCenter,
        encumbrance: row.encumbrance || 0,
        actual: row.actual || 0,
        done: 1,
        from_center: fromCenter,
      };
    });

    // Save
    await createTransfer(transfersToSave).unwrap();

    // ✅ Immediately remove only the local rows that were saved
    // const savedLocalIds = nonEmptyLocalRows.map((r) => r.id);
    // setLocalRows((prev) => {
    //   const next = prev.filter((r) => !savedLocalIds.includes(r.id));
    //   if (next.length > 0) {
    //     localStorage.setItem(`localRows_${transactionId}`, JSON.stringify(next));
    //   } else {
    //     localStorage.removeItem(`localRows_${transactionId}`);
    //   }
    //   return next;
    // });

    // Ask RTK to refetch API rows
    store.dispatch(transferDetailsApi.util.invalidateTags(["TransferDetails"]));

    toast.success("Transfers saved successfully!");
  } catch (err) {
    console.error("Error saving transfers:", err);
    toast.error("Error saving transfers. Please try again.");
    // (no local deletion on error)
  } finally {
    setIsSaving(false);
  }
};

useEffect(() => {
  if (!awaitingSync) return;
  if (!apiData?.transfers) return;

  // We assume the refetch has brought back the rows we just created.
  // Remove only the local rows that were part of this save.
  setLocalRows((prev) => {
    const next = prev.filter((r) => !pendingSavedLocalIds.includes(r.id));
    // Update localStorage accordingly
    if (next.length > 0) {
      localStorage.setItem(`localRows_${transactionId}`, JSON.stringify(next));
    } else {
      localStorage.removeItem(`localRows_${transactionId}`);
    }
    return next;
  });

  // done syncing
  setPendingSavedLocalIds([]);
  setAwaitingSync(false);
}, [apiData, awaitingSync, pendingSavedLocalIds, transactionId]);



  // Check if submit should be disabled
  const isSubmitDisabled = () => {
    // Filter out default rows (empty rows with no data)
    const nonDefaultEditedRows = editedRows.filter(
      (row) =>
        !(
          row.id.startsWith("default-") &&
          row.costCenterCode === "" &&
          row.accountCode === "" &&
          row.projectCode === ""
        )
    );

    // Count total valid rows (API rows + local rows)
    const totalValidRows =
      (apiData?.transfers?.length || 0) +
      localRows.length +
      nonDefaultEditedRows.length;

    // Check if there are fewer than 2 rows
    const hasInsufficientRows = totalValidRows < 2;

    // Check if there are validation errors in any row
    const hasValidationErrors = [...editedRows, ...localRows].some(
      (row) => row.validation_errors && row.validation_errors.length > 0
    );

    return hasInsufficientRows || hasValidationErrors;
  };

  const handleSubmit = async () => {
    if (!isSubmitDisabled()) {
      setIsSubmitting(true);
      try {
        // Call the submit API
        await submitTransfer({
          transaction: parseInt(transactionId),
        }).unwrap();

        // Show success toast
        toast.success("Transfer submitted successfully!");

        // Set submitted state
        setIsSubmitted(true);

        console.log(
          "Transfer submitted successfully for transaction:",
          transactionId
        );
      } catch (error) {
        console.error("Error submitting transfer:", error);
        toast.error("Error submitting transfer. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Helper function to fetch financial data when all 3 segments are selected
  const fetchFinancialDataForRow = async (
    rowId: string,
    segments: { costCenter: string; account: string; project: string }
  ) => {
    try {
      console.log(`Row ${rowId}: Calling financial data API with segments:`, {
        segment1: parseInt(segments.costCenter),
        segment2: parseInt(segments.account),
        segment3: segments.project,
        as_of_period: apiData?.summary?.period || "sep-25",
        control_budget_name: "MIC_HQ_MONTHLY",
      });

      // Use RTK Query's initiate method to trigger the query manually
      const result = await store
        .dispatch(
          transferDetailsApi.endpoints.getFinancialData.initiate({
            segment1: parseInt(segments.costCenter),
            segment2: parseInt(segments.account),
            segment3: segments.project,
            as_of_period: apiData?.summary?.period || "sep-25",
            control_budget_name: "MIC_HQ_MONTHLY",
          })
        )
        .unwrap();

      console.log(
        `Row ${rowId}: Financial data fetched:`,
        result.data?.data[0]
      );

      // Get the first record from the response data array
      const record = result.data?.data?.[0];

      // Apply financial data to the row
      const financialUpdates = {
        encumbrance: record?.encumbrance_ytd || 0,
        availableBudget: record?.funds_available_asof || 0,
        actual: record?.actual_ytd || 0,
        approvedBudget: record?.budget_ytd || 0,
        other_ytd: record?.other_ytd || 0,
        period: record?.as_of_period || "",
        budget_adjustments: record?.budget_adjustments || "0",
        other_consumption: record?.other_consumption || "0",
        commitments: record?.commitments || "0",
        expenditures: record?.expenditures || "0",
        initial_budget: record?.initial_budget || "0",
        obligations: record?.obligations || "0",
        funds_available_asof: record?.funds_available_asof || "0",
        budget_ytd: record?.budget_ytd || "0",
        total_budget: record?.total_budget || "0",
        total_consumption: record?.total_consumption || "0",
      };

      return financialUpdates;
    } catch (error) {
      console.error(`Error fetching financial data for row ${rowId}:`, error);
      return {};
    }
  };

  const addNewRow = () => {
    const newRow: TransferTableRow = {
      id: `new-${Date.now()}`,
      to: 0,
      from: 0,
      encumbrance: 0,
      availableBudget: 0,
      actual: 0,
      accountName: "",
      projectName: "",
      accountCode: "",
      projectCode: "",
      approvedBudget: 0,
      costCenterCode: "",
      costCenterName: "",
      other_ytd: 0,
      period: "",
      validation_errors: [], // Explicitly set as empty array (no errors)
      budget_adjustments: "0",
      commitments: "0",
      expenditures: "0",
      initial_budget: "0",
      obligations: "0",
      other_consumption: "0",
    };

    setLocalRows((prevRows) => {
      const updatedRows = [...prevRows, newRow];
      // Save to localStorage when adding new rows
      localStorage.setItem(
        `localRows_${transactionId}`,
        JSON.stringify(updatedRows)
      );
      return updatedRows;
    });
  };

  // Function to delete a row
  const deleteRow = (rowId: string) => {
    // Check if this is a local row (new row)
    if (rowId.startsWith("new-")) {
      setLocalRows((prevRows) => {
        const updatedRows = prevRows.filter((row) => row.id !== rowId);

        // Update localStorage when deleting local rows
        if (updatedRows.length > 0) {
          localStorage.setItem(
            `localRows_${transactionId}`,
            JSON.stringify(updatedRows)
          );
        } else {
          localStorage.removeItem(`localRows_${transactionId}`);
        }

        console.log(`Deleted local row ${rowId}`);
        return updatedRows;
      });
    } else {
      // For existing API rows, remove from editedRows
      setEditedRows((prevRows) => {
        const updatedRows = prevRows.filter((row) => row.id !== rowId);
        console.log(`Deleted API row ${rowId}`);
        return updatedRows;
      });
    }
  };

  const updateRow = async (
    rowId: string,
    field: keyof TransferTableRow,
    value: string | number
  ) => {
    // Handle business logic for from/to mutual exclusivity
    const updatedValue = value;
    const additionalUpdates: Partial<TransferTableRow> = {};

    if (field === "from" && Number(value) > 0) {
      additionalUpdates.to = 0;
    } else if (field === "to" && Number(value) > 0) {
      additionalUpdates.from = 0;
    }

    // Check if this is a segment field update
    if (
      field === "costCenterCode" ||
      field === "accountCode" ||
      field === "projectCode"
    ) {
      console.log(`Row ${rowId}: ${field} changed to ${value}`);

      // Handle name updates for dropdown changes (immediate update)
      if (field === "accountCode") {
        additionalUpdates.accountName = updatedValue.toString();
        console.log(`Row ${rowId}: Account name updated to ${updatedValue}`);
      } else if (field === "projectCode") {
        additionalUpdates.projectName = updatedValue.toString();
        console.log(`Row ${rowId}: Project name updated to ${updatedValue}`);
      } else if (field === "costCenterCode") {
        additionalUpdates.costCenterName = updatedValue.toString();
        console.log(
          `Row ${rowId}: Cost center name updated to ${updatedValue}`
        );
      }
    }

    // Update the row state immediately first (don't wait for API)
    // Check if this is a local row (new row)
    if (rowId.startsWith("new-")) {
      setLocalRows((prevRows) => {
        const updatedRows = prevRows.map((row) => {
          if (row.id === rowId) {
            return { ...row, [field]: updatedValue, ...additionalUpdates };
          }
          return row;
        });

        // Save to localStorage when updating local rows
        localStorage.setItem(
          `localRows_${transactionId}`,
          JSON.stringify(updatedRows)
        );
        return updatedRows;
      });
    } else {
      // For existing API rows (including default rows), update editedRows
      setEditedRows((prevRows) =>
        prevRows.map((row) => {
          if (row.id === rowId) {
            return { ...row, [field]: updatedValue, ...additionalUpdates };
          }
          return row;
        })
      );
    }

    // Now handle financial data API call if needed (after UI update)
    if (
      field === "costCenterCode" ||
      field === "accountCode" ||
      field === "projectCode"
    ) {
      // Determine which state array to check based on row type
      const isNewRow = rowId.startsWith("new-");
      const currentRowArray = isNewRow ? localRows : editedRows;
      const currentRow = currentRowArray.find((r) => r.id === rowId);

      if (currentRow) {
        // Calculate segments after this update
        const segments = {
          costCenter:
            field === "costCenterCode"
              ? value.toString()
              : currentRow.costCenterCode || "",
          account:
            field === "accountCode"
              ? value.toString()
              : currentRow.accountCode || "",
          project:
            field === "projectCode"
              ? value.toString()
              : currentRow.projectCode || "",
        };

        console.log(`Row ${rowId}: Current segments state:`, segments);

        // Only call API if ALL 3 segments are now complete
        if (segments.costCenter && segments.account && segments.project) {
          console.log(
            `Row ${rowId}: ✅ All 3 segments complete! Calling financial data API...`
          );
          console.log(`Row ${rowId}: API call with segments:`, {
            segment1: segments.costCenter,
            segment2: segments.account,
            segment3: segments.project,
          });

          // Call API in background (don't await)
          fetchFinancialDataForRow(rowId, segments)
            .then((financialUpdates) => {
              console.log(
                `Row ${rowId}: Financial data received:`,
                financialUpdates
              );

              // Apply financial data to the row after API response
              if (isNewRow) {
                setLocalRows((prevRows) => {
                  const updatedRows = prevRows.map((row) => {
                    if (row.id === rowId) {
                      return { ...row, ...financialUpdates };
                    }
                    return row;
                  });
                  localStorage.setItem(
                    `localRows_${transactionId}`,
                    JSON.stringify(updatedRows)
                  );
                  return updatedRows;
                });
              } else {
                setEditedRows((prevRows) =>
                  prevRows.map((row) => {
                    if (row.id === rowId) {
                      return { ...row, ...financialUpdates };
                    }
                    return row;
                  })
                );
              }
            })
            .catch((error) => {
              console.error(
                `Error fetching financial data for row ${rowId}:`,
                error
              );
            });
        } else {
          console.log(
            `Row ${rowId}: ⏳ Segments incomplete, waiting for all 3. Missing:`,
            {
              costCenter: !segments.costCenter,
              account: !segments.account,
              project: !segments.project,
            }
          );
        }
      }
    }
  };

  // Define columns for SharedTable
  const columns: TableColumn[] = [
    {
      id: "itemId",
      header: "Item ID",
      render: (_, row) => {
        const detailRow = row as unknown as TransferDetailRow;
        return (
          <span className="text-sm text-gray-900">{detailRow.itemId}</span>
        );
      },
    },
    {
      id: "itemName",
      header: "Item Name",
      render: (_, row) => {
        const detailRow = row as unknown as TransferDetailRow;
        return (
          <span className="text-sm text-gray-900">{detailRow.itemName}</span>
        );
      },
    },
    {
      id: "accountId",
      header: "Account ID",
      render: (_, row) => {
        const detailRow = row as unknown as TransferDetailRow;
        return (
          <span className="text-sm text-gray-900">{detailRow.accountId}</span>
        );
      },
    },
    {
      id: "accountName",
      header: "Account Name",
      render: (_, row) => {
        const detailRow = row as unknown as TransferDetailRow;
        return (
          <span className="text-sm text-gray-900">{detailRow.accountName}</span>
        );
      },
    },
    {
      id: "from",
      header: "From",
      showSum: true,
      render: (_, row) => {
        const detailRow = row as unknown as TransferDetailRow;
        return (
          <span className="text-sm text-gray-900">
            {detailRow.from.toLocaleString()}
          </span>
        );
      },
    },
    {
      id: "to",
      header: "To",
      showSum: true,
      render: (_, row) => {
        const detailRow = row as unknown as TransferDetailRow;
        return (
          <span className="text-sm text-gray-900">
            {detailRow.to.toLocaleString()}
          </span>
        );
      },
    },
    {
      id: "approvedBudget",
      header: "Approved Budget",
      showSum: true,
      render: (_, row) => {
        const detailRow = row as unknown as TransferDetailRow;
        return (
          <span className="text-sm text-gray-900">
            {detailRow.approvedBudget.toLocaleString()}
          </span>
        );
      },
    },
    {
      id: "current",
      header: "Current",
      showSum: true,
      render: (_, row) => {
        const detailRow = row as unknown as TransferDetailRow;
        return (
          <span className="text-sm text-gray-900">
            {detailRow.current.toLocaleString()}
          </span>
        );
      },
    },
    {
      id: "availableBudget",
      header: "Available Budget",
      showSum: true,
      render: (_, row) => {
        const detailRow = row as unknown as TransferDetailRow;
        return (
          <span className="text-sm text-gray-900">
            {detailRow.availableBudget.toLocaleString()}
          </span>
        );
      },
    },
  ];

  // Keep the old columns for the main transfer table
  const columnsDetails: TableColumn[] = [
    {
      id: "validation",
      header: "Status",
      render: (_, row) => {
        const transferRow = row as unknown as TransferTableRow;
        const hasErrors =
          transferRow.validation_errors &&
          transferRow.validation_errors.length > 0;

        return (
          <div className="flex items-center  gap-3 justify-center">
            {     apiData?.status.status === "not yet sent for approval" ||
      apiData?.summary?.status === "not yet sent for approval"?
           <button
              onClick={() => deleteRow(transferRow.id)}
              className="flex items-center justify-center w-6 h-6 bg-red-100 border border-red-300 rounded-full text-red-600 hover:bg-red-200 transition-colors"
              title="Delete row"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 3L3 9M3 3L9 9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
      : null}
       
            {hasErrors ? (
              <button
                onClick={() =>
                  handleValidationErrorClick(
                    transferRow.validation_errors || []
                  )
                }
                className="flex items-center justify-center w-6 h-6 bg-yellow-100 border border-yellow-300 rounded-full text-yellow-600 hover:bg-yellow-200 transition-colors"
                title="Click to view validation errors"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 1L11 10H1L6 1Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 4V6.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle cx="6" cy="8.5" r="0.5" fill="currentColor" />
                </svg>
              </button>
            ) : (
              <div className="w-6 h-6 bg-green-100 border border-green-300 rounded-full flex items-center justify-center">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.5 6L4.5 8L9.5 3"
                    stroke="#16a34a"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </div>
        );
      },
    },
    
    {
      id: "costCenterCode",
      header: "Legal Entity",

      render: (_, row) => {
        const transferRow = row as unknown as TransferTableRow;
        return isSubmitted ? (
          <span className="text-sm text-gray-900">
            {transferRow.costCenterCode}
          </span>
        ) : (
          <Select
           value={costCenterOptions.find(o => o.value === transferRow.costCenterCode) ?? null}
  onChange={(opt) => {
    updateRow(transferRow.id, "costCenterCode", opt?.value || "");
    if (opt) updateRow(transferRow.id, "costCenterName", opt.name);
  }}
            options={costCenterOptions}
            placeholder="Select Legal"
            isSearchable
            isClearable
            className="w-full"
            classNamePrefix="react-select"
            styles={{
              control: (base) => ({
                ...base,
                border: "1px solid #E2E2E2",
                borderRadius: "6px",
                minHeight: "38px",
                fontSize: "12px",
              }),
              menu: (base) => ({
                ...base,
                zIndex: 9999,
              }),
              menuPortal: (base) => ({
                ...base,
                zIndex: 9999,
              }),
            }}
            menuPortalTarget={document.body}
          />
        );
      },
    },
    {
      id: "accountCode",
      header: "Account",

      render: (_, row) => {
        const transferRow = row as unknown as TransferTableRow;
        return isSubmitted ? (
          <span className="text-sm text-gray-900">
            {transferRow.accountCode}
          </span>
        ) : (
          <Select
            value={accountOptions.find(o => o.value === transferRow.accountCode) ?? null}
            onChange={(opt) => {
              updateRow(transferRow.id, "accountCode", opt?.value || "");
              if (opt) updateRow(transferRow.id, "accountName", opt.name);
            }}
            options={accountOptions}
            placeholder="Select account"
            isSearchable
            isClearable
            className="w-full"
            classNamePrefix="react-select"
            styles={{
              control: (base) => ({
                ...base,
                border: "1px solid #E2E2E2",
                borderRadius: "6px",
                minHeight: "38px",
                fontSize: "12px",
              }),
              menu: (base) => ({
                ...base,
                zIndex: 9999,
              }),
              menuPortal: (base) => ({
                ...base,
                zIndex: 9999,
              }),
            }}
            menuPortalTarget={document.body}
          />
        );
      },
    },

    {
      id: "projectCode",
      header: "Project",

      render: (_, row) => {
        const transferRow = row as unknown as TransferTableRow;
        return isSubmitted ? (
          <span className="text-sm text-gray-900">
            {transferRow.projectCode}
          </span>
        ) : (
          <Select
            value={projectOptions.find(o => o.value === transferRow.projectCode) ?? null}
            onChange={(opt) => {
              updateRow(transferRow.id, "projectCode", opt?.value || "");
              if (opt) updateRow(transferRow.id, "projectName", opt.name);
            }}
            options={projectOptions}
            placeholder="Select project"
            isSearchable
            isClearable
            className="w-full"
            classNamePrefix="react-select"
            styles={{
              control: (base) => ({
                ...base,
                border: "1px solid #E2E2E2",
                borderRadius: "6px",
                minHeight: "38px",
                fontSize: "12px",
              }),
              menu: (base) => ({
                ...base,
                zIndex: 9999,
              }),
              menuPortal: (base) => ({
                ...base,
                zIndex: 9999,
              }),
            }}
            menuPortalTarget={document.body}
          />
        );
      },
    },
      {
      id: "costCenterName",
      header: "Legal Entity",

      render: (_, row) => {
        const transferRow = row as unknown as TransferTableRow;
        return (
          <span className="text-sm text-gray-900">
            {transferRow.costCenterName}
          </span>
        );
      },
    },
    {
      id: "accountName",
      header: "Account ",

      render: (_, row) => {
        const transferRow = row as unknown as TransferTableRow;
        return (
          <span className="text-sm text-gray-900">
            {transferRow.accountName}
          </span>
        );
      },
    },
    {
      id: "projectName",
      header: "Project ",

      render: (_, row) => {
        const transferRow = row as unknown as TransferTableRow;
        return (
          <span className="text-sm text-gray-900">
            {transferRow.projectName}
          </span>
        );
      },
    },

 
    {
      id: "encumbrance",
      header: "Encumbrance",
      showSum: true,

      render: (_, row) => {
        const transferRow = row as unknown as TransferTableRow;
        const value = transferRow.encumbrance || 0;
        return (
          <span className="text-sm text-gray-900">{formatNumber(value)}</span>
        );
      },
    },
    {
      id: "availableBudget",
      header: "Available Budget",
      showSum: true,

      render: (_, row) => {
        const transferRow = row as unknown as TransferTableRow;
        const value = transferRow.availableBudget || 0;
        return (
          <span className="text-sm text-gray-900">{formatNumber(value)}</span>
        );
      },
    },
    {
      id: "actual",
      header: "Actual",
      showSum: true,

      render: (_, row) => {
        const transferRow = row as unknown as TransferTableRow;
        const value = transferRow.actual || 0;
        return (
          <span className="text-sm text-gray-900">{formatNumber(value)}</span>
        );
      },
    },
    {
      id: "budget_adjustments",
      header: "Budget Adjustments",
      showSum: true,

      render: (_, row) => {
        const transferRow = row as unknown as TransferTableRow;
        const value = Number(transferRow.budget_adjustments) || 0;
        return (
          <span className="text-sm text-gray-900">{formatNumber(value)}</span>
        );
      },
    },
    {
      id: "commitments",
      header: "Commitments",
      showSum: true,

      render: (_, row) => {
        const transferRow = row as unknown as TransferTableRow;
        const value = Number(transferRow.commitments) || 0;
        return (
          <span className="text-sm text-gray-900">{formatNumber(value)}</span>
        );
      },
    },
    {
      id: "expenditures",
      header: "Expenditures",
      showSum: true,

      render: (_, row) => {
        const transferRow = row as unknown as TransferTableRow;
        const value = Number(transferRow.expenditures) || 0;
        return (
          <span className="text-sm text-gray-900">{formatNumber(value)}</span>
        );
      },
    },
    {
      id: "initial_budget",
      header: "Initial Budget",
      showSum: true,

      render: (_, row) => {
        const transferRow = row as unknown as TransferTableRow;
        const value = Number(transferRow.initial_budget) || 0;
        return (
          <span className="text-sm text-gray-900">{formatNumber(value)}</span>
        );
      },
    },
    {
      id: "obligations",
      header: "Obligations",
      showSum: true,

      render: (_, row) => {
        const transferRow = row as unknown as TransferTableRow;
        const value = Number(transferRow.obligations) || 0;
        return (
          <span className="text-sm text-gray-900">{formatNumber(value)}</span>
        );
      },
    },
    {
      id: "other_consumption",
      header: "Other Consumption",
      showSum: true,

      render: (_, row) => {
        const transferRow = row as unknown as TransferTableRow;
        const value = Number(transferRow.other_consumption) || 0;
        return (
          <span className="text-sm text-gray-900">{formatNumber(value)}</span>
        );
      },
    },
    {
      id: "approvedBudget",
      header: "Approved Budget",
      showSum: true,

      render: (_, row) => {
        const transferRow = row as unknown as TransferTableRow;
        const value = transferRow.approvedBudget || 0;
        return (
          <span className="text-sm text-gray-900">{formatNumber(value)}</span>
        );
      },
    },
    {
      id: "other_ytd",
      header: "Other YTD",
      showSum: true,

      render: (_, row) => {
        const transferRow = row as unknown as TransferTableRow;
        const value = transferRow.other_ytd || 0;
        return (
          <span className="text-sm text-gray-900">{formatNumber(value)}</span>
        );
      },
    },
    {
      id: "period",
      header: "Period",

      render: (_, row) => {
        const transferRow = row as unknown as TransferTableRow;
        return (
          <span className="text-sm text-gray-900">{transferRow.period}</span>
        );
      },
    },
     {
      id: "to",
      header: "To",
      showSum: true,

      render: (_, row) => {
        const transferRow = row as unknown as TransferTableRow;

        return isSubmitted ? (
          <span className={`text-sm text-gray-900 `}>
            {formatNumber(transferRow.to)}
          </span>
        ) : (
          <input
            type="number"
            value={transferRow.to || ""}
            onChange={(e) =>
              updateRow(transferRow.id, "to", Number(e.target.value) || 0)
            }
            className={`w-full px-3 py-2 border rounded text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-[#AFAFAF] `}
            placeholder="To"
          />
        );
      },
    },
    {
      id: "from",
      header: "From",
      showSum: true,

      render: (_, row) => {
        const transferRow = row as unknown as TransferTableRow;

        return isSubmitted ? (
          <span className={`text-sm text-gray-900 `}>
            {formatNumber(transferRow.from)}
          </span>
        ) : (
          <input
            type="number"
            value={transferRow.from || ""}
            onChange={(e) =>
              updateRow(transferRow.id, "from", Number(e.target.value) || 0)
            }
            className={`w-full px-3 py-2 border rounded text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-[#AFAFAF] `}
            placeholder="From"
          />
        );
      },
    },
  ];

  // Handler for validation error click
  const handleValidationErrorClick = (errors: string[]) => {
    setSelectedValidationErrors(errors);
    setIsValidationErrorModalOpen(true);
  };

  const [isAttachmentsModalOpen, setIsAttachmentsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isValidationErrorModalOpen, setIsValidationErrorModalOpen] =
    useState(false);
  const [selectedValidationErrors, setSelectedValidationErrors] = useState<
    string[]
  >([]);

  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isReopenClicked, setIsReopenClicked] = useState(false);

  // Handler for attachments click
  const handleAttachmentsClick = () => {
    setIsAttachmentsModalOpen(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const validFile = files.find(
      (file) =>
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/pdf" ||
        file.type === "application/msword" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".pdf") ||
        file.name.endsWith(".doc") ||
        file.name.endsWith(".docx")
    );

    if (validFile) {
      handleFileSelect(validFile);
    } else {
      alert("Please upload a valid file (.xlsx, .pdf, .doc, .docx)");
    }
  };

  const handleFileSelect = (file: File) => {
    console.log("File selected:", file.name, file.size, file.type);
    setSelectedFile(file);
  };

  const handleUploadFile = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    try {
      await uploadExcel({
        file: selectedFile,
        transaction: parseInt(transactionId),
      }).unwrap();

      toast.success("Excel file uploaded successfully!");
      setIsAttachmentsModalOpen(false);
      setSelectedFile(null);

      console.log("Excel file uploaded successfully");
    } catch (error) {
      console.error("Error uploading Excel file:", error);
      toast.error("Failed to upload Excel file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleReopenRequest = async () => {
    try {
      // Set the state immediately to hide the button
      setIsReopenClicked(true);

      await reopenTransfer({
        transaction: parseInt(transactionId),
        action: "reopen",
      }).unwrap();

      toast.success("Transfer request reopened successfully!");
      console.log("Transfer request reopened successfully");

      // Optionally navigate back to transfer list or refresh the page
      // navigate('/app/transfer');
    } catch (error) {
      console.error("Error reopening transfer request:", error);
      toast.error("Failed to reopen transfer request. Please try again.");

      // Reset the state if there was an error so user can try again
      setIsReopenClicked(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading transfers...</span>
      </div>
    );
  }

  // Show error state
  if (error) {
    const errorMessage =
      "data" in error
        ? JSON.stringify(error.data)
        : "message" in error
        ? error.message
        : "Failed to load transfer details";

    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-red-600">Error: {errorMessage}</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBack}
            className="flex items-center gap-2  cursor-pointer py-2 text-lg text-[#0052FF] hover:text-[#174ec4] "
          >
            Transfer
          </button>
          <span className="text-[#737373] text-lg">/</span>
          <h1 className="text-lg  text-[#737373] font-light tracking-wide">
            Code
          </h1>
        </div>

        {/* Period Selector for Balance Report */}
        <div className="flex items-center gap-2">
          {isLoadingBalanceReport && (
            <div className="flex items-center text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Loading options...
            </div>
          )}
          {balanceReportError && (
            <div className="text-sm text-red-500">Error loading options</div>
          )}
        </div>
      </div>

      <div>
        <SharedTable
          columns={columnsDetails}
          data={rows as unknown as SharedTableRow[]}
          showFooter={true}
          maxHeight="600px"
          onSave={isSaving ? undefined : handleSave}
          showSaveButton={!isSubmitted && !isSaving}
          showPagination={shouldShowPagination}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          showAddRowButton={!isSubmitted}
          onAddNewRow={addNewRow}
          addRowButtonText="Add New Row"
          showColumnSelector={true}
        />

        {/* Custom Save Section with Loading State */}
        {!isSubmitted && isSaving && (
          <div className="flex justify-end mt-4 p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Saving transfers...</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons Section */}
      {!isSubmitted ? (
        <div className="bg-white rounded-2xl p-6 shadow-sm mt-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-3">
              <button
                onClick={() => handleAttachmentsClick()}
                className="inline-flex items-center text-sm gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clip-path="url(#clip0_406_14639)">
                    <path
                      d="M11.334 6.00122C12.784 6.00929 13.5693 6.07359 14.0815 6.58585C14.6673 7.17164 14.6673 8.11444 14.6673 10.0001V10.6667C14.6673 12.5523 14.6673 13.4952 14.0815 14.0809C13.4957 14.6667 12.5529 14.6667 10.6673 14.6667H5.33398C3.44837 14.6667 2.50556 14.6667 1.91977 14.0809C1.33398 13.4952 1.33398 12.5523 1.33398 10.6667L1.33398 10.0001C1.33398 8.11444 1.33398 7.17163 1.91977 6.58585C2.43203 6.07359 3.2173 6.00929 4.66732 6.00122"
                      stroke="#545454"
                      stroke-width="1.5"
                      stroke-linecap="round"
                    />
                    <path
                      d="M8 10L8 1.33333M8 1.33333L10 3.66667M8 1.33333L6 3.66667"
                      stroke="#545454"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_406_14639">
                      <rect width="16" height="16" rx="5" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                UploadTransfer File
              </button>

              <button
                onClick={() => setIsReportModalOpen(true)}
                className="inline-flex text-sm items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M2.3103 2.30956C1.33398 3.28587 1.33398 4.85722 1.33398 7.99992C1.33398 11.1426 1.33398 12.714 2.3103 13.6903C3.28661 14.6666 4.85795 14.6666 8.00065 14.6666C11.1433 14.6666 12.7147 14.6666 13.691 13.6903C14.6673 12.714 14.6673 11.1426 14.6673 7.99992C14.6673 4.85722 14.6673 3.28587 13.691 2.30956C12.7147 1.33325 11.1433 1.33325 8.00065 1.33325C4.85795 1.33325 3.28661 1.33325 2.3103 2.30956ZM11.334 8.16659C11.6101 8.16659 11.834 8.39044 11.834 8.66659V11.9999C11.834 12.2761 11.6101 12.4999 11.334 12.4999C11.0578 12.4999 10.834 12.2761 10.834 11.9999V8.66659C10.834 8.39044 11.0578 8.16659 11.334 8.16659ZM8.50065 3.99992C8.50065 3.72378 8.27679 3.49992 8.00065 3.49992C7.72451 3.49992 7.50065 3.72378 7.50065 3.99992V11.9999C7.50065 12.2761 7.72451 12.4999 8.00065 12.4999C8.27679 12.4999 8.50065 12.2761 8.50065 11.9999V3.99992ZM4.66732 5.49992C4.94346 5.49992 5.16732 5.72378 5.16732 5.99992V11.9999C5.16732 12.2761 4.94346 12.4999 4.66732 12.4999C4.39118 12.4999 4.16732 12.2761 4.16732 11.9999V5.99992C4.16732 5.72378 4.39118 5.49992 4.66732 5.49992Z"
                    fill="#545454"
                  />
                </svg>
                Report
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitDisabled() || isSubmitting}
              className={`px-6 py-2 text-sm rounded-lg transition-colors inline-flex items-center gap-2 ${
                isSubmitDisabled() || isSubmitting
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              title={
                isSubmitting
                  ? "Submitting transfer..."
                  : isSubmitDisabled()
                  ? (() => {
                      const totalValidRows =
                        (apiData?.transfers?.length || 0) +
                        localRows.length +
                        editedRows.filter(
                          (row) =>
                            !(
                              row.id.startsWith("default-") &&
                              row.costCenterCode === "" &&
                              row.accountCode === "" &&
                              row.projectCode === ""
                            )
                        ).length;

                      if (totalValidRows < 2) {
                        return "Cannot submit: At least 2 rows are required";
                      } else {
                        return "Cannot submit: Please fix validation errors";
                      }
                    })()
                  : "Submit transfer request"
              }
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </button>
          </div>

          {/* Submit status message - only show if submit is disabled */}
          {isSubmitDisabled() && (
            <div className="mt-3 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 1L15 14H1L8 1Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 5V8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <circle cx="8" cy="11" r="0.5" fill="currentColor" />
              </svg>
              <span>
                {(() => {
                  const totalValidRows =
                    (apiData?.transfers?.length || 0) +
                    localRows.length +
                    editedRows.filter(
                      (row) =>
                        !(
                          row.id.startsWith("default-") &&
                          row.costCenterCode === "" &&
                          row.accountCode === "" &&
                          row.projectCode === ""
                        )
                    ).length;

                  if (totalValidRows < 2) {
                    return "Cannot submit: At least 2 rows are required for transfer.";
                  } else {
                    return "Cannot submit: Please fix all validation errors before submitting.";
                  }
                })()}
              </span>
            </div>
          )}
        </div>
      ) : null}

      {/* Only show Re-open Request button if status is rejected and not already clicked */}
      {!isReopenClicked &&
        (transferStatus === "rejected" ||
          apiData?.status?.status === "rejected" ||
          apiData?.summary?.status === "rejected") && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mt-6">
            <button
              onClick={handleReopenRequest}
              className="inline-flex text-sm items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.70065 14.4466C12.5607 13.6933 14.6673 11.0933 14.6673 7.99992C14.6673 4.31992 11.7073 1.33325 8.00065 1.33325C3.55398 1.33325 1.33398 5.03992 1.33398 5.03992M1.33398 5.03992V1.99992M1.33398 5.03992H2.67398H4.29398"
                  stroke="#545454"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M1.33398 8C1.33398 11.68 4.32065 14.6667 8.00065 14.6667"
                  stroke="#545454"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="3 3"
                />
              </svg>
              Re-open Request
            </button>
          </div>
        )}

      {/* Manage Attachments Modal */}
      <SharedModal
        isOpen={isAttachmentsModalOpen}
        onClose={() => {
          setIsAttachmentsModalOpen(false);
          setSelectedFile(null);
        }}
        title="UploadTransfer File"
        size="lg"
      >
        {/* Upload icon */}
        <div
          className={`w-full flex flex-col py-10 gap-2.5 items-center transition-colors ${
            isDragOver
              ? "bg-blue-100 border-2 border-dashed border-blue-400"
              : "bg-[#F6F6F6]"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className=" rounded-full p-2  ">
            <svg
              width="50"
              height="50"
              viewBox="0 0 50 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M35.417 18.7542C39.9483 18.7794 42.4023 18.9803 44.0031 20.5811C45.8337 22.4117 45.8337 25.358 45.8337 31.2505V33.3339C45.8337 39.2264 45.8337 42.1727 44.0031 44.0033C42.1725 45.8339 39.2262 45.8339 33.3337 45.8339H16.667C10.7744 45.8339 7.82816 45.8339 5.99757 44.0033C4.16699 42.1727 4.16699 39.2264 4.16699 33.3339L4.16699 31.2505C4.16699 25.358 4.16699 22.4117 5.99757 20.5811C7.59837 18.9803 10.0524 18.7794 14.5837 18.7542"
                stroke="#282828"
                stroke-width="1.5"
                stroke-linecap="round"
              />
              <path
                d="M25 31.25L25 4.16666M25 4.16666L31.25 11.4583M25 4.16666L18.75 11.4583"
                stroke="#282828"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div className="text-center">
            <div className=" text-lg mb-1">
              {selectedFile ? (
                <span className="text-green-600">
                  Selected: {selectedFile.name}
                </span>
              ) : (
                <>
                  Drag & drop Excel file or{" "}
                  <button
                    onClick={() =>
                      document.getElementById("file-upload")?.click()
                    }
                    className="text-[#0052FF] underline hover:text-blue-700 transition-colors"
                  >
                    browse
                  </button>
                </>
              )}
            </div>
            <div className="text-xs text-[#757575] mb-2">
              Supported formats: .xlsx, .pdf, .doc, .docx
            </div>
            <input
              id="file-upload"
              type="file"
              accept=".xlsx,.pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileSelect(file);
                }
              }}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 p-4 ">
          <button
            onClick={() => {
              setIsAttachmentsModalOpen(false);
              setSelectedFile(null);
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUploadFile}
            disabled={!selectedFile || isUploading}
            className={`px-4 py-2 text-sm font-medium border rounded-md transition-colors inline-flex items-center gap-2 ${
              !selectedFile || isUploading
                ? "bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed"
                : "text-white bg-[#0052FF] border-[#0052FF] hover:bg-blue-700"
            }`}
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Uploading...
              </>
            ) : (
              "Upload File"
            )}
          </button>
        </div>
      </SharedModal>

      {/* Manage Report */}
      <SharedModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Fund Adjustments  Report"
        size="full"
      >
        <div className="p-4 ">
          <div className="bg-[#F6F6F6] rounded-lg p-3">
            <h2 className="text-md  font-medium mb-4">Summary</h2>

            <div className="grid grid-cols-3 gap-4 justify-between items-center">
              <div>
                <p className="text-sm text-[#757575]">Transaction ID:</p>
                <p className="text-sm  text-[#282828]">
                  {apiData?.summary?.transaction_id || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#757575]">Total Transfers: </p>
                <p className="text-sm  text-[#282828]">
                  {apiData?.summary?.total_transfers || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#757575]">Total From:</p>
                <p className="text-sm  text-[#282828]">
                  {apiData?.summary?.total_from?.toLocaleString() || "0.00"}
                </p>
              </div>

              <div>
                <p className="text-sm text-[#757575]">Total To: </p>
                <p className="text-sm  text-[#282828]">
                  {apiData?.summary?.total_to?.toLocaleString() || "0.00"}
                </p>
              </div>
            </div>
          </div>

          {/* Report content goes here */}
          <SharedTable
            title="Fund Adjustments Details"
            columns={columns}
            titleSize="sm"
            showShadow={false}
            data={rowsDetails as unknown as SharedTableRow[]}
            maxHeight="600px"
            showPagination={rowsDetails.length > 10}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
          />
        </div>
      </SharedModal>

      {/* Validation Errors Modal */}
      <SharedModal
        isOpen={isValidationErrorModalOpen}
        onClose={() => setIsValidationErrorModalOpen(false)}
        title="Validation Errors"
        size="md"
      >
        <div className="p-4">
          <div className="space-y-3">
            {selectedValidationErrors.map((error, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 1L15 14H1L8 1Z"
                      stroke="#dc2626"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 5V8"
                      stroke="#dc2626"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <circle cx="8" cy="11" r="0.5" fill="#dc2626" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-red-800 font-medium">
                    Error {index + 1}
                  </p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={() => setIsValidationErrorModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </SharedModal>
    </div>
  );
}
