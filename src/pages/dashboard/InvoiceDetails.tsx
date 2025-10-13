import { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Check } from "lucide-react";
import toast from "react-hot-toast";
import type { UploadInvoiceResponse } from "@/api/invoice.api";
import {
  useSaveInvoiceMutation,
  useUpdateInvoiceMutation,
  useSubmitInvoiceMutation,
  useGetInvoiceByIdQuery,
} from "@/api/invoice.api";
import { SharedModal } from "@/shared/SharedModal";

export default function InvoiceReview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  // Get the uploaded invoice data from navigation state
  const uploadedData = (
    location.state as { invoiceData?: UploadInvoiceResponse }
  )?.invoiceData;

  // Fetch invoice from API if no uploaded data
  const {
    data: apiInvoiceResponse,
    error: invoiceError,
    isLoading: isLoadingInvoice,
  } = useGetInvoiceByIdQuery(id || "", { skip: !!uploadedData || !id });

  // Extract the first invoice from the results array
  const apiInvoiceData = apiInvoiceResponse?.results?.[0];

  // API Mutations
  const [saveInvoice, { isLoading: isSaving }] = useSaveInvoiceMutation();
  const [updateInvoice, { isLoading: isUpdating }] = useUpdateInvoiceMutation();
  const [submitInvoice, { isLoading: isSubmitting }] =
    useSubmitInvoiceMutation();

  // Modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Determine data source (uploaded or from API)
  const dataSource = useMemo(() => {
    return (
      uploadedData ||
      (apiInvoiceData
        ? {
            data: apiInvoiceData.Invoice_Data,
            pdf_base64: apiInvoiceData.base64_file,
            file_name: apiInvoiceData.file_name || "",
            invoice_number: apiInvoiceData.Invoice_Number,
            model_used: "api",
            message: "Invoice loaded from API",
          }
        : null)
    );
  }, [uploadedData, apiInvoiceData]);

  // editable form state (right column)
  const [form, setForm] = useState({
    invoiceNo: "",
    invoiceDate: "",
    supplier: "",
    supplierSite: "",
    businessUnit: "",
    description: "",
    invoiceAmount: 0,
    invoiceCurrency: "USD",
    invoiceGroup: "",
    lineItems: [] as Array<{
      id: number;
      lineNumber: number;
      lineAmount: string;
      distributionCombination: string;
      distributionLineType: string;
      distributionAmount: string;
    }>,
  });

  // Update form when dataSource changes
  useEffect(() => {
    if (dataSource?.data) {
      const data = dataSource.data;
      console.log("data",data);
      
      const lineItems = (data.invoiceLines || []).map((line, idx: number) => ({
        id: idx + 1,
        lineNumber: line.LineNumber || idx + 1,
        lineAmount: line.LineAmount || "0",
        distributionCombination:
          line.invoiceDistributions?.[0]?.DistributionCombination || "",
        distributionLineType:
          line.invoiceDistributions?.[0]?.DistributionLineType || "Item",
        distributionAmount:
          line.invoiceDistributions?.[0]?.DistributionAmount ||
          line.LineAmount ||
          "0",
      }));

  

      setForm({
        invoiceNo: data.InvoiceNumber || "",
        invoiceDate: data.InvoiceDate || "",
        supplier: data.Supplier || "",
        supplierSite: data.SupplierSite || "",
        businessUnit: data.BusinessUnit || "",
        description: data.Description || "",
        invoiceAmount: data?.InvoiceAmount || 0,
        invoiceCurrency: data.InvoiceCurrency || "USD",
        invoiceGroup: data.InvoiceGroup || "",
        lineItems: lineItems,
      });
    }
  }, [dataSource]);

  const calc = useMemo(() => {
    const subtotal = form.lineItems.reduce(
      (s, li) => s + parseFloat(String(li.lineAmount) || "0"),
      0
    );
    return { subtotal };
  }, [form.lineItems]);

 

  const addRow = () => {
    const lastLineNumber =
      form.lineItems.length > 0
        ? Math.max(...form.lineItems.map((li) => li.lineNumber))
        : 0;

    setForm((f) => ({
      ...f,
      lineItems: [
        ...f.lineItems,
        {
          id: Date.now(),
          lineNumber: lastLineNumber + 1,
          lineAmount: "0",
          distributionCombination:
            f.lineItems[0]?.distributionCombination || "",
          distributionLineType: "Item",
          distributionAmount: "0",
        },
      ],
    }));
  };

  const updateRow = (
    id: number,
    patch: Partial<(typeof form)["lineItems"][number]>
  ) => {
    setForm((f) => ({
      ...f,
      lineItems: f.lineItems.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));
  };

  const handleSubmit = async () => {
    try {
      // Validate line items
      const hasAmount = form.lineItems.every(
        (r) => parseFloat(String(r.lineAmount) || "0") > 0
      );
      if (!hasAmount) {
        return toast.error("Each line must have an amount greater than 0");
      }

      // Prepare the payload
      const payload = {
        Invoice_Data: {
          InvoiceNumber: form.invoiceNo,
          InvoiceCurrency: form.invoiceCurrency,
          InvoiceAmount: form.invoiceAmount,
          InvoiceDate: form.invoiceDate,
          BusinessUnit: form.businessUnit,
          Supplier: form.supplier,
          SupplierSite: form.supplierSite,
          InvoiceGroup: form.invoiceGroup,
          Description: form.description,
          invoiceDff: [
            {
              __FLEX_Context: "MIC_HQ",
            },
          ],
          invoiceLines: form.lineItems.map((line) => ({
            LineNumber: line.lineNumber,
            LineAmount: line.lineAmount,
            invoiceLineDff: [
              {
                __FLEX_Context: "MIC_HQ",
              },
            ],
            invoiceDistributions: [
              {
                DistributionLineNumber: 1,
                DistributionLineType: line.distributionLineType,
                DistributionAmount: line.lineAmount,
                DistributionCombination: line.distributionCombination,
              },
            ],
          })),
        },
        Invoice_Number: form.invoiceNo,
        base64_file: dataSource?.pdf_base64 || "",
        file_name: dataSource?.file_name || "",
      };

      // If data comes from uploaded invoice (new), save first then submit
      if (uploadedData) {
        await saveInvoice(payload).unwrap();
        toast.success("Invoice saved successfully!");
      }
      // If data comes from API (existing invoice), update first then submit
      else if (apiInvoiceData) {
        await updateInvoice(payload).unwrap();
        toast.success("Invoice updated successfully!");
      }

      // Then submit (for both cases)
      await submitInvoice({ InvoiceNumber: form.invoiceNo }).unwrap();
      toast.success("Invoice submitted successfully!");
      navigate("/app/Document_I/O");
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to submit invoice");
    }
  };

  const handleModalSubmit = async () => {
    try {
      await submitInvoice({ InvoiceNumber: form.invoiceNo }).unwrap();
      toast.success("Invoice submitted successfully!");
      setShowSubmitModal(false);
      navigate("/app/Document_I/O");
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to submit invoice");
    }
  };

  const handleModalCancel = () => {
    setShowSubmitModal(false);
    navigate("/app/Document_I/O");
  };

  // Show loading skeleton
  if (isLoadingInvoice) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* LEFT: PDF Preview Skeleton */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="rounded-xl border border-gray-200 bg-gray-100 h-[750px] animate-pulse flex items-center justify-center">
              <svg
                className="h-16 w-16 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          {/* RIGHT: Form Skeleton */}
          <div className="bg-white rounded-2xl ring-1 ring-black/5 p-6">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(10)].map((_, idx) => (
                <div key={idx}>
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-10 w-full bg-gray-100 rounded-lg animate-pulse"></div>
                </div>
              ))}
            </div>

            {/* Line Items Skeleton */}
            <div className="mt-6">
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="rounded-xl ring-1 ring-gray-200 overflow-hidden">
                <div className="bg-gray-50 p-3">
                  <div className="grid grid-cols-4 gap-3">
                    {[...Array(4)].map((_, idx) => (
                      <div
                        key={idx}
                        className="h-4 bg-gray-200 rounded animate-pulse"
                      ></div>
                    ))}
                  </div>
                </div>
                {[...Array(3)].map((_, idx) => (
                  <div key={idx} className="border-t border-gray-100 p-3">
                    <div className="grid grid-cols-4 gap-3">
                      {[...Array(4)].map((_, idx2) => (
                        <div
                          key={idx2}
                          className="h-8 bg-gray-100 rounded animate-pulse"
                        ></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (invoiceError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-red-600 text-lg">Failed to load invoice</p>
        <button
          onClick={() => navigate("/app/Document_I/O")}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
        >
          Back to Invoices
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/app/Document_I/O")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" /> Back to Invoices
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* LEFT: PDF Preview */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200  p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-800 ">
              Invoice PDF Preview
            </h3>
          </div>

          {dataSource?.pdf_base64 ? (
            <div className="rounded-xl overflow-hidden border border-gray-200  bg-gray-50 ">
              <iframe
                src={`data:application/pdf;base64,${dataSource.pdf_base64}`}
                className="w-full h-[750px]"
                title="Invoice PDF"
              />
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300  bg-gray-50  p-16 flex flex-col items-center justify-center text-center">
              <svg
                className="h-14 w-14 text-gray-400  mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <p className="text-gray-600  text-sm font-medium">
                No PDF available
              </p>
              <p className="text-gray-400  text-xs mt-1">
                Upload or generate an invoice to preview the PDF here
              </p>
            </div>
          )}
        </div>

        {/* RIGHT: Extracted Data / Editor */}
        <div className="bg-white rounded-2xl ring-1 ring-black/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800">
              {apiInvoiceData
                ? "Invoice Details (View Only)"
                : "Extracted Data"}
            </h3>
            {apiInvoiceData && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Read Only
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600">Invoice Number</label>
              <input
                value={form.invoiceNo}
                onChange={(e) =>
                  setForm({ ...form, invoiceNo: e.target.value })
                }
                disabled={!!apiInvoiceData}
                className={`mt-1 w-full rounded-lg border px-3 py-2 ${
                  apiInvoiceData
                    ? "border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed"
                    : "border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                }`}
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Invoice Date</label>
              <div className="mt-1 relative">
                <input
                  type="date"
                  value={form.invoiceDate}
                  onChange={(e) =>
                    setForm({ ...form, invoiceDate: e.target.value })
                  }
                  disabled={!!apiInvoiceData}
                  className={`w-full rounded-lg border px-3 py-2 ${
                    apiInvoiceData
                      ? "border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed"
                      : "border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  }`}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-600">Supplier</label>
              <input
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                disabled={!!apiInvoiceData}
                className={`mt-1 w-full rounded-lg border px-3 py-2 ${
                  apiInvoiceData
                    ? "border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed"
                    : "border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                }`}
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Supplier Site</label>
              <input
                value={form.supplierSite}
                onChange={(e) =>
                  setForm({ ...form, supplierSite: e.target.value })
                }
                disabled={!!apiInvoiceData}
                className={`mt-1 w-full rounded-lg border px-3 py-2 ${
                  apiInvoiceData
                    ? "border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed"
                    : "border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                }`}
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Business Unit</label>
              <input
                value={form.businessUnit}
                onChange={(e) =>
                  setForm({ ...form, businessUnit: e.target.value })
                }
                disabled={!!apiInvoiceData}
                className={`mt-1 w-full rounded-lg border px-3 py-2 ${
                  apiInvoiceData
                    ? "border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed"
                    : "border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                }`}
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Description</label>
              <input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                disabled={!!apiInvoiceData}
                className={`mt-1 w-full rounded-lg border px-3 py-2 ${
                  apiInvoiceData
                    ? "border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed"
                    : "border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                }`}
              />
            </div>
            {/* <div>
              <label className="text-xs text-gray-600">Invoice Amount</label>
              <input
                type="number"
                value={form.invoiceAmount}
                onChange={(e) =>
                  setForm({ ...form, invoiceAmount: e.target.value })
                }
                disabled={!!apiInvoiceData}
                className={`mt-1 w-full rounded-lg border px-3 py-2 ${
                  apiInvoiceData
                    ? "border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed"
                    : "border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                }`}
              />
            </div> */}
            <div>
              <label className="text-xs text-gray-600">Invoice Currency</label>
              <input
                value={form.invoiceCurrency}
                onChange={(e) =>
                  setForm({ ...form, invoiceCurrency: e.target.value })
                }
                disabled={!!apiInvoiceData}
                className={`mt-1 w-full rounded-lg border px-3 py-2 ${
                  apiInvoiceData
                    ? "border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed"
                    : "border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                }`}
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Invoice Group</label>
              <input
                value={form.invoiceGroup}
                onChange={(e) =>
                  setForm({ ...form, invoiceGroup: e.target.value })
                }
                disabled={!!apiInvoiceData}
                className={`mt-1 w-full rounded-lg border px-3 py-2 ${
                  apiInvoiceData
                    ? "border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed"
                    : "border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                }`}
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">
                Total Amount (Calculated)
              </label>
              <input
                disabled
                value={calc.subtotal.toFixed(2)}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700 font-medium cursor-not-allowed"
              />
            </div>
          </div>

          {/* Line items editable */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-800">Line Items</p>
              {!apiInvoiceData && (
                <button
                  onClick={addRow}
                  className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-[#00B7AD] text-white hover:bg-teal-700"
                >
                  <Plus className="h-4 w-4" /> Add Row
                </button>
              )}
            </div>
            <div className="overflow-hidden rounded-xl ring-1 ring-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-left w-16">#</th>
                    <th className="px-3 py-2 text-left w-32">Amount</th>
                    <th className="px-3 py-2 text-left">
                      Distribution Combination
                    </th>
                    <th className="px-3 py-2 text-left w-28">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {form.lineItems.map((r) => {
                    return (
                      <tr key={r.id} className="border-t border-gray-100">
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={r.lineNumber}
                            disabled
                            className="w-full rounded-md px-2 py-1 text-gray-700 bg-gray-50 cursor-not-allowed"
                          />
                        </td>
                        <td className="px-3 py-2 ">
                          <input
                            type="number"
                            value={r.lineAmount}
                            onChange={(e) =>
                              updateRow(r.id, { lineAmount: e.target.value })
                            }
                            disabled={!!apiInvoiceData}
                            className={`w-full rounded-md border px-2 py-1 ${
                              apiInvoiceData
                                ? "border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed"
                                : "border-gray-200 focus:ring-1 focus:ring-teal-500"
                            }`}
                            min={0}
                            step={0.01}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            value={r.distributionCombination}
                            disabled
                            className="w-full px-2 py-1 text-gray-700 text-xs bg-gray-50 cursor-not-allowed"
                            placeholder="Distribution Combination"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            value={r.distributionLineType}
                            disabled
                            className="w-full rounded-md px-2 py-1 text-gray-700 bg-gray-50 cursor-not-allowed"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          {!apiInvoiceData && (
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || isSaving || isUpdating}
                className=" flex items-center gap-2 text-md px-3 py-1.5 rounded-lg bg-[#00B7AD] text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving || isUpdating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    {uploadedData ? "Saving..." : "Updating..."}
                  </>
                ) : isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Submitting...
                  </>
                ) : (
                  <>Approve & Save</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <SharedModal
        isOpen={showSubmitModal}
        onClose={handleModalCancel}
        title="Invoice Saved Successfully"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Your invoice has been saved successfully. Would you like to submit
            it now?
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleModalCancel}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Later
            </button>
            <button
              onClick={handleModalSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white inline-flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Submit Now
                </>
              )}
            </button>
          </div>
        </div>
      </SharedModal>
    </div>
  );
}
