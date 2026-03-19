import React, { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

export default function BulkImportModal({
    isOpen,
    onClose,
    onSuccess,
    entityName = "Records",
    fields = [],
    requiredField = null,
    onImport
}) {
    const [file, setFile] = useState(null);
    const [csvData, setCsvData] = useState([]);
    const [csvHeaders, setCsvHeaders] = useState([]);
    const [mapping, setMapping] = useState({});
    const [isImporting, setIsImporting] = useState(false);
    const [step, setStep] = useState(1); // 1: Upload, 2: Map, 3: Review

    const onDrop = useCallback(acceptedFiles => {
        const selectedFile = acceptedFiles[0];
        if (selectedFile) {
            setFile(selectedFile);
            parseCSV(selectedFile);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv']
        },
        maxFiles: 1
    });

    const parseCSV = (file) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.data && results.data.length > 0) {
                    setCsvHeaders(Object.keys(results.data[0]));
                    setCsvData(results.data);

                    // Auto-mapping logic
                    const autoMap = {};
                    const headers = Object.keys(results.data[0]);
                    headers.forEach(header => {
                        const cleanHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '');
                        // Find a match
                        fields.forEach(field => {
                            const cleanField = field.value.toLowerCase();
                            if (cleanHeader.includes(cleanField) || cleanField.includes(cleanHeader)) {
                                autoMap[header] = field.value;
                            }
                        });
                    });
                    setMapping(autoMap);
                    setStep(2);
                } else {
                    toast.error("CSV file appears to be empty or invalid.");
                    setFile(null);
                }
            },
            error: (error) => {
                toast.error(`Error parsing CSV: ${error.message}`);
                setFile(null);
            }
        });
    };

    const handleMappingChange = (csvHeader, crmField) => {
        setMapping(prev => ({
            ...prev,
            [csvHeader]: crmField === "" ? null : crmField
        }));
    };

    const handleImport = async () => {
        // Validate mapping
        const mappedFields = Object.values(mapping);
        if (requiredField && !mappedFields.includes(requiredField)) {
            const requiredFieldLabel = fields.find(f => f.value === requiredField)?.label || requiredField;
            toast.error(`You must map a column to "${requiredFieldLabel}"`);
            return;
        }

        setIsImporting(true);

        // Transform CSV data to CRM format
        const recordsToImport = csvData.map(row => {
            const recordData = {};
            Object.keys(row).forEach(csvHeader => {
                const crmField = mapping[csvHeader];
                if (crmField) {
                    recordData[crmField] = row[csvHeader];
                }
            });
            return recordData;
        }).filter(record => requiredField ? record[requiredField] : Object.keys(record).length > 0);

        try {
            if (onImport) {
                const response = await onImport(recordsToImport);
                toast.success(response?.message || `Successfully imported ${recordsToImport.length} ${entityName.toLowerCase()}!`);
            }
            handleClose();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || `Failed to import ${entityName.toLowerCase()}`);
        } finally {
            setIsImporting(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setCsvData([]);
        setCsvHeaders([]);
        setMapping({});
        setStep(1);
        setIsImporting(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto w-full">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" onClick={handleClose}>
                    <div className="absolute inset-0 bg-slate-900/75 backdrop-blur-sm"></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full border border-slate-200 dark:border-slate-700">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            Bulk Import {entityName}
                        </h3>
                        <button onClick={handleClose} className="text-slate-400 hover:text-slate-500">
                            <span className="sr-only">Close</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="p-6">
                        {step === 1 && (
                            <div className="space-y-4">
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Upload a CSV file containing your {entityName.toLowerCase()}. We'll help you map the columns to the system fields.
                                </p>
                                <div
                                    {...getRootProps()}
                                    className={`mt-4 flex justify-center px-6 pt-10 pb-12 border-2 border-dashed rounded-xl transition-colors cursor-pointer
                                        ${isDragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                                >
                                    <div className="space-y-2 text-center">
                                        <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <div className="flex text-sm text-slate-600 dark:text-slate-400">
                                            <span className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 dark:bg-transparent">
                                                <span>Upload a file</span>
                                                <input {...getInputProps()} />
                                            </span>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            CSV up to 10MB
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-1">Map Columns</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Match the columns from your CSV file to the corresponding fields in NexCRM.
                                    </p>
                                    <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-md text-xs text-yellow-800 dark:text-yellow-200">
                                        We auto-mapped fields based on names. Please review them carefully.
                                        {requiredField && <span> Requires at least <strong>{fields.find(f => f.value === requiredField)?.label || requiredField}</strong>.</span>}
                                    </div>
                                </div>

                                <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                        <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                    CSV Column header
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                    Sample Data (Row 1)
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                    NexCRM Field
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
                                            {csvHeaders.map((header) => (
                                                <tr key={header}>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                                                        {header}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 max-w-[200px] truncate">
                                                        {csvData[0][header] || "-"}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                                        <select
                                                            value={mapping[header] || ""}
                                                            onChange={(e) => handleMappingChange(header, e.target.value)}
                                                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                                        >
                                                            <option value="">-- Ignore this column --</option>
                                                            {fields.map(field => (
                                                                <option key={field.value} value={field.value} disabled={Object.values(mapping).includes(field.value) && mapping[header] !== field.value}>
                                                                    {field.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex items-center justify-between flex-row-reverse border-t border-slate-100 dark:border-slate-700">
                        {step === 1 ? (
                            <button
                                type="button"
                                disabled={!file}
                                onClick={() => step === 1 && file && setStep(2)}
                                className="btn-primary"
                            >
                                Next
                            </button>
                        ) : (
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="btn-secondary"
                                    disabled={isImporting}
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={handleImport}
                                    disabled={isImporting}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    {isImporting ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Importing...
                                        </>
                                    ) : (
                                        `Import ${entityName}`
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
