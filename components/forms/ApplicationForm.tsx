"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Upload, CheckCircle, AlertCircle, Loader2, ArrowRight, ArrowLeft, Plus, Trash2, Download } from "lucide-react";
import { SignaturePad } from "@/components/ui/SignaturePad";

type FormStep = 1 | 2 | 3 | 4 | 5 | 6;

interface Sibling {
    name: string;
    grade: string;
}

export const ApplicationForm = () => {
    const STORAGE_KEY = "alasr_application_autosave";
    const [step, setStep] = useState<FormStep>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateSAID = (id: string) => {
        if (!/^\d{13}$/.test(id)) return false;

        let sumOdds = 0;
        for (let i = 0; i < 12; i += 2) {
            sumOdds += parseInt(id.charAt(i), 10);
        }

        let evenStr = "";
        for (let i = 1; i < 12; i += 2) {
            evenStr += id.charAt(i);
        }

        const evensMult = (parseInt(evenStr, 10) * 2).toString();

        let sumEvens = 0;
        for (let i = 0; i < evensMult.length; i++) {
            sumEvens += parseInt(evensMult.charAt(i), 10);
        }

        const total = sumOdds + sumEvens;
        let checkDigit = 10 - (total % 10);
        if (checkDigit === 10) checkDigit = 0;

        return checkDigit === parseInt(id.charAt(12), 10);
    };

    const validateLearnerId = (value: string) => {
        if (!value) return "ID / Passport Number is required";

        const cleanValue = value.replace(/[\s-]/g, '');

        if (/^\d{13}$/.test(cleanValue)) {
            const dobInput = formRef.current?.querySelector('input[name="dob"]') as HTMLInputElement;
            if (dobInput?.value) {
                const dob = dobInput.value.replace(/-/g, ""); // "YYYYMMDD"
                const dobPart = dob.substring(2); // "YYMMDD"
                if (cleanValue.substring(0, 6) !== dobPart) {
                    return `ID must start with ${dobPart} to match Date of Birth`;
                }
            }
            if (!validateSAID(cleanValue)) {
                return "Invalid SA ID (checksum failed)";
            }
        } else if (cleanValue.length < 5) {
            return "Invalid ID / Passport Number";
        }
        return "";
    };

    const [signature, setSignature] = useState<string | null>(null);
    const [siblings, setSiblings] = useState<Sibling[]>([]);
    const [isPostalSameAsPhysical, setIsPostalSameAsPhysical] = useState(false);
    const [isP1PostalSameAsPhysical, setIsP1PostalSameAsPhysical] = useState(false);
    const [isP2PostalSameAsPhysical, setIsP2PostalSameAsPhysical] = useState(false);
    const [feePayer, setFeePayer] = useState("");
    const [fileNames, setFileNames] = useState<Record<string, string>>({});
    const [acceptances, setAcceptances] = useState({
        declaration: false,
        contract: false,
        indemnity: false,
        fees: false
    });
    const [acceptanceLogs, setAcceptanceLogs] = useState<Record<string, string>>({});
    const [feePaymentTerm, setFeePaymentTerm] = useState("");
    const [resultRef, setResultRef] = useState("");

    const handleAcceptanceChange = (key: keyof typeof acceptances) => {
        setAcceptances(prev => {
            const newVal = !prev[key];
            if (newVal) {
                setAcceptanceLogs(logs => ({ ...logs, [key]: new Date().toISOString() }));
            }
            return { ...prev, [key]: newVal };
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, [name]: "File exceeds 5MB limit" }));
                e.target.value = "";
                setFileNames(prev => {
                    const next = { ...prev };
                    delete next[name];
                    return next;
                });
            } else {
                setFileNames(prev => ({ ...prev, [name]: file.name }));
                setErrors(prev => {
                    const next = { ...prev };
                    delete next[name];
                    return next;
                });
            }
        }
    };

    const [startTime, setStartTime] = useState<string>(Date.now().toString());
    const formRef = useRef<HTMLFormElement>(null);

    // Hydrate form from localStorage on mount
    useEffect(() => {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData && formRef.current) {
            try {
                const data = JSON.parse(savedData);

                // Set state-based values
                if (data.step) setStep(data.step as FormStep);
                if (data.siblings) setSiblings(data.siblings);
                if (data.form_start_time) setStartTime(data.form_start_time);

                // Populate individual form fields (non-state controlled)
                const elements = formRef.current.elements;
                for (let i = 0; i < elements.length; i++) {
                    const el = elements[i] as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
                    if (el.name && data[el.name] !== undefined && el.type !== "file" && el.type !== "checkbox") {
                        el.value = data[el.name];
                    }
                }
            } catch (e) {
                console.error("Error hydrating form:", e);
            }
        }
    }, []);

    // Save form data to localStorage
    const saveFormData = () => {
        if (!formRef.current) return;
        const formData = new FormData(formRef.current);
        const data: Record<string, any> = Object.fromEntries(formData.entries());

        // Remove large or sensitive fields that shouldn't be auto-saved
        Object.keys(data).forEach(key => {
            if (key.startsWith("doc") || key === "signature" || key === "documents[]") {
                delete data[key];
            }
        });

        // Add non-form state
        data.step = step;
        data.siblings = siblings;
        data.form_start_time = startTime;

        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    };

    // Also auto-save when state changes (step, siblings)
    useEffect(() => {
        saveFormData();
    }, [step, siblings]);

    const addSibling = () => {
        setSiblings([...siblings, { name: "", grade: "" }]);
    };

    const removeSibling = (index: number) => {
        const newSiblings = [...siblings];
        newSiblings.splice(index, 1);
        setSiblings(newSiblings);
    };

    const handleSiblingChange = (index: number, field: keyof Sibling, value: string) => {
        const newSiblings = [...siblings];
        newSiblings[index][field] = value;
        setSiblings(newSiblings);
    };

    const nextStep = () => {
        const currentSection = formRef.current?.querySelector(`[data-step="${step}"]`) as HTMLElement;
        const inputs = currentSection?.querySelectorAll("input, select, textarea");
        let isValid = true;
        const newErrors: Record<string, string> = { ...errors };

        inputs?.forEach((input) => {
            const htmlInput = input as HTMLInputElement;
            let error = "";

            if (!htmlInput.checkValidity()) {
                error = htmlInput.validationMessage;
            }

            // Custom validations
            if (htmlInput.name === "learnerId" && step === 1) {
                const idError = validateLearnerId(htmlInput.value);
                if (idError) error = idError;
            }
            if (htmlInput.name === "learnerPostalCode" && step === 1) {
                if (htmlInput.value && !/^\d{4}$/.test(htmlInput.value)) error = "Must be exactly 4 digits";
            }

            if (error) {
                newErrors[htmlInput.name] = error;
                isValid = false;
            } else {
                delete newErrors[htmlInput.name];
            }
        });

        setErrors(newErrors);

        if (isValid) {
            setStep((s) => Math.min(s + 1, 6) as FormStep);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const prevStep = () => {
        setStep((s) => Math.max(s - 1, 1) as FormStep);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const allAccepted = Object.values(acceptances).every(v => v === true);
        if (!allAccepted) {
            alert("Please accept all terms and conditions before submitting.");
            return;
        }

        setIsLoading(true);
        setStatus("idle");
        setMessage("");

        const formData = new FormData(e.currentTarget);
        formData.append("siblings", JSON.stringify(siblings));
        formData.append("form_start_time", startTime);

        // Add Audit Trail for Clickwrap Agreement
        const auditLog = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            checkboxLogs: acceptanceLogs,
            termsVersion: "v1.0",
            parentName: `${formData.get('parent1FirstName')} ${formData.get('parent1Surname')}`,
            parentEmail: formData.get('parent1Email')
        };
        formData.append("audit_log", JSON.stringify(auditLog));
        formData.append("feePaymentTerm", feePaymentTerm);

        try {
            const response = await fetch("/beta/api/applications.php", {
                method: "POST",
                body: formData,
            });

            const text = await response.text();
            let result;
            try {
                result = JSON.parse(text);
            } catch (err) {
                console.error("Invalid JSON response:", text);
                throw new Error("Server returned an invalid response. check console for details.");
            }

            if (response.ok && result.success) {
                setStatus("success");
                setResultRef(result.ref || "Pending");
                setMessage(`Application submitted successfully! Ref: ${result.ref || 'Pending'}. We will contact you shortly.`);
                formRef.current?.reset();
                setSignature(null);
                setSiblings([]);
                setStep(1);
                localStorage.removeItem(STORAGE_KEY);
            } else {
                setStatus("error");
                setMessage(result.error || "Something went wrong. Please try again.");
            }
        } catch (error) {
            console.error("Submission error:", error);
            setStatus("error");
            setMessage(error instanceof Error ? error.message : "Failed to submit application.");
        } finally {
            setIsLoading(false);
        }
    };

    const steps = [
        { num: 1, title: "Learner" },
        { num: 2, title: "Parent 1" },
        { num: 3, title: "Parent 2" },
        { num: 4, title: "Medical" },
        { num: 5, title: "Docs" },
        { num: 6, title: "Accept & Submit" },
    ];

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Progress Bar */}
            <div className="bg-gray-50 border-b border-gray-100 p-4">
                <div className="flex items-center justify-between max-w-5xl mx-auto">
                    {steps.map((s) => (
                        <div key={s.num} className="flex flex-col items-center z-10 mx-1">
                            <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold transition-colors ${step >= s.num ? "bg-primary text-white" : "bg-gray-200 text-gray-500"}`}>
                                {s.num}
                            </div>
                            <span className="text-[10px] md:text-xs mt-1 text-gray-600 hidden sm:block text-center w-16 leading-tight">{s.title}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-6 md:p-8">
                {status === "success" ? (
                    <div className="text-center py-12 px-4">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <CheckCircle className="w-10 h-10" />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-2">Application Submitted!</h3>

                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 my-8 max-w-sm mx-auto shadow-inner">
                            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black mb-2 block">Reference Number</span>
                            <div className="text-3xl font-mono font-bold text-primary tracking-tighter">{resultRef}</div>
                        </div>

                        <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                            Thank you for applying. A confirmation copy has been emailed to the Parent 1 email address provided.
                            Our admissions team will review your application and contact you shortly.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 border-t pt-8">
                            <Button onClick={() => window.print()} className="flex items-center shadow-lg shadow-primary/20">
                                <Download className="w-4 h-4 mr-2" /> Download Application
                            </Button>
                            <Button onClick={() => {
                                setStatus("idle");
                                setAcceptances({ declaration: false, contract: false, indemnity: false, fees: false });
                                setFeePayer("");
                            }} variant="outline">
                                Start Another
                            </Button>
                        </div>
                    </div>
                ) : (
                    <form ref={formRef} onSubmit={handleSubmit} onInput={saveFormData} noValidate className="space-y-6">
                        {/* Honeypot & Protection Fields */}
                        <div className="hidden" aria-hidden="true">
                            <input type="text" name="website_url" tabIndex={-1} autoComplete="off" />
                        </div>

                        {/* Step 1: Learner Details */}
                        <div data-step="1" className={step === 1 ? "block space-y-6 animate-in fade-in" : "hidden"}>
                            <h3 className="text-xl font-bold text-gray-900 border-b pb-2">Learner Details</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Surname</label>
                                    <input required name="learnerSurname" type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">First Names</label>
                                    <input required name="learnerName" type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                    <input required name="dob" type="date" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ID / Passport Number</label>
                                    <input
                                        required
                                        name="learnerId"
                                        type="text"
                                        className={`w-full px-4 py-2 rounded-lg border focus:ring-primary focus:border-primary ${errors.learnerId ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                        onBlur={(e) => setErrors(prev => ({ ...prev, learnerId: validateLearnerId(e.target.value) }))}
                                    />
                                    {errors.learnerId && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center">
                                            <AlertCircle className="w-3 h-3 mr-1" /> {errors.learnerId}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                    <select required name="gender" className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white">
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Grade Applying For</label>
                                    <select required name="grade" className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white">
                                        <option value="">Select Grade</option>
                                        <option value="RR">Grade RR</option>
                                        <option value="R">Grade R</option>
                                        {[...Array(12)].map((_, i) => <option key={i} value={i + 1}>Grade {i + 1}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year Applying For</label>
                                    <select required name="academicYear" className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white">
                                        <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                                        <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Home Language</label>
                                    <input required name="homeLanguage" type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300" />
                                </div>
                                {/* Religion removed as requested */}
                                <div className="md:col-span-2 border-t pt-4">
                                    <h4 className="text-sm font-bold text-gray-900 mb-4">Address Details</h4>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Physical Address</label>
                                            <textarea required name="learnerPhysicalAddress" rows={3}
                                                className={`w-full px-4 py-2 rounded-lg border focus:ring-primary focus:border-primary ${errors.learnerPhysicalAddress ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                                onChange={(e) => {
                                                    if (isPostalSameAsPhysical) {
                                                        const postalInput = formRef.current?.querySelector('[name="learnerPostalAddress"]') as HTMLTextAreaElement;
                                                        if (postalInput) postalInput.value = e.target.value;
                                                    }
                                                }}
                                                onBlur={(e) => setErrors(prev => ({ ...prev, learnerPhysicalAddress: e.target.checkValidity() ? "" : "Physical address is required" }))}
                                            ></textarea>
                                            {errors.learnerPhysicalAddress && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> {errors.learnerPhysicalAddress}</p>
                                            )}
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">City / Suburb</label>
                                            <input required name="learnerCity" type="text"
                                                className={`w-full px-4 py-2 rounded-lg border focus:ring-primary focus:border-primary ${errors.learnerCity ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                                onBlur={(e) => setErrors(prev => ({ ...prev, learnerCity: e.target.checkValidity() ? "" : "City/Suburb is required" }))}
                                            />
                                            {errors.learnerCity && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> {errors.learnerCity}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                                <span>Postal Address</span>
                                                <div className="ml-auto flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id="sameAsPhysical"
                                                        checked={isPostalSameAsPhysical}
                                                        onChange={(e) => {
                                                            setIsPostalSameAsPhysical(e.target.checked);
                                                            if (e.target.checked) {
                                                                const physicalValue = (formRef.current?.querySelector('[name="learnerPhysicalAddress"]') as HTMLTextAreaElement)?.value;
                                                                const physicalCityValue = (formRef.current?.querySelector('input[name="learnerCity"]') as HTMLInputElement)?.value;
                                                                const postalInput = formRef.current?.querySelector('[name="learnerPostalAddress"]') as HTMLTextAreaElement;
                                                                const postalCityInput = formRef.current?.querySelector('input[name="learnerPostalCity"]') as HTMLInputElement;
                                                                if (postalInput) {
                                                                    postalInput.value = physicalValue || "";
                                                                    setErrors(prev => ({ ...prev, learnerPostalAddress: "" }));
                                                                }
                                                                if (postalCityInput) {
                                                                    postalCityInput.value = physicalCityValue || "";
                                                                    setErrors(prev => ({ ...prev, learnerPostalCity: "" }));
                                                                }
                                                            }
                                                        }}
                                                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                                                    />
                                                    <label htmlFor="sameAsPhysical" className="ml-2 text-xs font-normal text-gray-500">Same as Physical</label>
                                                </div>
                                            </label>
                                            <textarea
                                                required={!isPostalSameAsPhysical}
                                                name="learnerPostalAddress"
                                                rows={3}
                                                disabled={isPostalSameAsPhysical}
                                                className={`w-full px-4 py-2 rounded-lg border focus:ring-primary focus:border-primary ${isPostalSameAsPhysical ? 'bg-gray-50' : ''} ${errors.learnerPostalAddress ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                                onBlur={(e) => setErrors(prev => ({ ...prev, learnerPostalAddress: e.target.checkValidity() ? "" : "Postal address is required" }))}
                                            ></textarea>
                                            {errors.learnerPostalAddress && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> {errors.learnerPostalAddress}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">City / Suburb</label>
                                            <input
                                                required={!isPostalSameAsPhysical}
                                                name="learnerPostalCity"
                                                type="text"
                                                disabled={isPostalSameAsPhysical}
                                                className={`w-full px-4 py-2 rounded-lg border focus:ring-primary focus:border-primary ${isPostalSameAsPhysical ? 'bg-gray-50' : ''} ${errors.learnerPostalCity ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                                onBlur={(e) => setErrors(prev => ({ ...prev, learnerPostalCity: e.target.checkValidity() ? "" : "Postal City/Suburb is required" }))}
                                            />
                                            {errors.learnerPostalCity && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> {errors.learnerPostalCity}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                                            <input
                                                required
                                                name="learnerPostalCode"
                                                type="text"
                                                pattern="\d{4}"
                                                maxLength={4}
                                                placeholder="e.g. 1234"
                                                className={`w-full px-4 py-2 rounded-lg border focus:ring-primary focus:border-primary ${errors.learnerPostalCode ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                                onBlur={(e) => {
                                                    let error = "";
                                                    if (!e.target.value) error = "Postal code is required";
                                                    else if (!/^\d{4}$/.test(e.target.value)) error = "Must be exactly 4 digits";
                                                    setErrors(prev => ({ ...prev, learnerPostalCode: error }));
                                                }}
                                            />
                                            {errors.learnerPostalCode && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> {errors.learnerPostalCode}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-2 border-t pt-4 mt-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-gray-700">Siblings at Al-Asr (or applying)</label>
                                        <Button type="button" size="sm" variant="outline" onClick={addSibling} className="text-xs">
                                            <Plus className="w-3 h-3 mr-1" /> Add Sibling
                                        </Button>
                                    </div>

                                    {siblings.length === 0 && (
                                        <p className="text-xs text-gray-500 italic">No siblings added. Click "Add Sibling" if relevant.</p>
                                    )}

                                    <div className="space-y-3">
                                        {siblings.map((sibling, index) => (
                                            <div key={index} className="flex gap-2 items-start animate-in fade-in slide-in-from-top-1">
                                                <input
                                                    placeholder="Sibling Name"
                                                    value={sibling.name}
                                                    onChange={(e) => handleSiblingChange(index, "name", e.target.value)}
                                                    className="flex-1 px-3 py-2 rounded border border-gray-300 text-sm"
                                                    required
                                                />
                                                <input
                                                    placeholder="Grade"
                                                    value={sibling.grade}
                                                    onChange={(e) => handleSiblingChange(index, "grade", e.target.value)}
                                                    className="w-24 px-3 py-2 rounded border border-gray-300 text-sm"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeSibling(index)}
                                                    className="p-2 text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Parent 1 */}
                        <div data-step="2" className={step === 2 ? "block space-y-6 animate-in fade-in" : "hidden"}>
                            <h3 className="text-xl font-bold text-gray-900 border-b pb-2">Parent / Guardian 1 (Primary Account Holder)</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <select required name="parent1Title" className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white">
                                        <option value="">Select</option>
                                        <option value="Mr">Mr</option>
                                        <option value="Mrs">Mrs</option>
                                        <option value="Ms">Ms</option>
                                        <option value="Dr">Dr</option>
                                        <option value="Prof">Prof</option>
                                        <option value="Sheikh">Sheikh</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Surname</label>
                                        <input required name="parent1Surname" type="text" className={`w-full px-4 py-2 rounded-lg border focus:ring-primary focus:border-primary ${errors.parent1Surname ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} onBlur={(e) => setErrors(prev => ({ ...prev, parent1Surname: e.target.checkValidity() ? "" : "Surname is required" }))} />
                                        {errors.parent1Surname && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> {errors.parent1Surname}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name(s)</label>
                                        <input required name="parent1FirstName" type="text" className={`w-full px-4 py-2 rounded-lg border focus:ring-primary focus:border-primary ${errors.parent1FirstName ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} onBlur={(e) => setErrors(prev => ({ ...prev, parent1FirstName: e.target.checkValidity() ? "" : "First names are required" }))} />
                                        {errors.parent1FirstName && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> {errors.parent1FirstName}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Known As</label>
                                    <input name="parent1KnownAs" type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ID / Passport Number</label>
                                    <input name="parent1Id" type="text" className={`w-full px-4 py-2 rounded-lg border focus:ring-primary focus:border-primary ${errors.parent1Id ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} onBlur={(e) => setErrors(prev => ({ ...prev, parent1Id: e.target.checkValidity() ? "" : "ID / Passport Number is required" }))} />
                                    {errors.parent1Id && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> {errors.parent1Id}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                                    <select required name="parent1Rel" className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white">
                                        <option value="Father">Father</option>
                                        <option value="Mother">Mother</option>
                                        <option value="Guardian">Guardian</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                                    <select required name="parent1MaritalStatus" className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white">
                                        <option value="">Select</option>
                                        <option value="Single">Single</option>
                                        <option value="Married">Married</option>
                                        <option value="Divorced">Divorced</option>
                                        <option value="Widowed">Widowed</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                                    <input required name="parent1Occupation" type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Employer</label>
                                    <input name="parent1Employer" type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type of Business</label>
                                    <input name="parent1BusinessType" type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
                                    <input name="parent1BusinessAddress" type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300" />
                                </div>
                                <div className="md:col-span-2 grid md:grid-cols-3 gap-6 pt-2 border-t mt-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                                        <input required name="parent1Mobile" type="tel" className="w-full px-4 py-2 rounded-lg border border-gray-300" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Work Phone</label>
                                        <input name="parent1WorkPhone" type="tel" className="w-full px-4 py-2 rounded-lg border border-gray-300" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Home Phone</label>
                                        <input name="parent1HomePhone" type="tel" className="w-full px-4 py-2 rounded-lg border border-gray-300" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input required name="parent1Email" type="email" className="w-full px-4 py-2 rounded-lg border border-gray-300" />
                                </div>

                                <div className="md:col-span-2 border-t pt-4">
                                    <h4 className="text-sm font-bold text-gray-900 mb-4">Parent 1 Address Details</h4>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Physical Address</label>
                                            <textarea name="parent1PhysicalAddress" rows={3}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary"
                                                onChange={(e) => {
                                                    if (isP1PostalSameAsPhysical) {
                                                        const postalInput = formRef.current?.querySelector('[name="parent1PostalAddress"]') as HTMLTextAreaElement;
                                                        if (postalInput) postalInput.value = e.target.value;
                                                    }
                                                }}
                                            ></textarea>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">City / Suburb</label>
                                            <input name="parent1City" type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary" />
                                        </div>
                                        <div>
                                            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                                <span>Postal Address</span>
                                                <div className="ml-auto flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id="p1SameAsPhysical"
                                                        checked={isP1PostalSameAsPhysical}
                                                        onChange={(e) => {
                                                            setIsP1PostalSameAsPhysical(e.target.checked);
                                                            if (e.target.checked) {
                                                                const physicalValue = (formRef.current?.querySelector('[name="parent1PhysicalAddress"]') as HTMLTextAreaElement)?.value;
                                                                const physicalCityValue = (formRef.current?.querySelector('input[name="parent1City"]') as HTMLInputElement)?.value;
                                                                const postalInput = formRef.current?.querySelector('[name="parent1PostalAddress"]') as HTMLTextAreaElement;
                                                                const postalCityInput = formRef.current?.querySelector('input[name="parent1PostalCity"]') as HTMLInputElement;
                                                                if (postalInput) postalInput.value = physicalValue || "";
                                                                if (postalCityInput) postalCityInput.value = physicalCityValue || "";
                                                            }
                                                        }}
                                                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                                                    />
                                                    <label htmlFor="p1SameAsPhysical" className="ml-2 text-xs font-normal text-gray-500">Same as Physical</label>
                                                </div>
                                            </label>
                                            <textarea
                                                name="parent1PostalAddress"
                                                rows={3}
                                                disabled={isP1PostalSameAsPhysical}
                                                className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary ${isP1PostalSameAsPhysical ? 'bg-gray-50' : ''}`}
                                            ></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">City / Suburb</label>
                                            <input
                                                name="parent1PostalCity"
                                                type="text"
                                                disabled={isP1PostalSameAsPhysical}
                                                className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary ${isP1PostalSameAsPhysical ? 'bg-gray-50' : ''}`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                                            <input
                                                name="parent1PostalCode"
                                                type="text"
                                                pattern="\d{4}"
                                                maxLength={4}
                                                placeholder="e.g. 1234"
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-2 border-t pt-4">
                                    <label className="block text-sm font-bold text-gray-900 mb-3">Who is responsible for payment of fees?</label>
                                    <div className="flex flex-wrap gap-6">
                                        {["Parent 1", "Parent 2", "Guardian", "Other"].map((opt) => (
                                            <label key={opt} className="flex items-center cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="feeResponsible"
                                                    value={opt}
                                                    checked={feePayer === opt}
                                                    onChange={(e) => setFeePayer(e.target.value)}
                                                    className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                                                    required
                                                />
                                                <span className="ml-2 text-sm text-gray-700 group-hover:text-primary transition-colors">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {feePayer === "Other" && (
                                        <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Please specify responsible party</label>
                                            <input name="feeResponsibleOther" type="text" placeholder="Full name / Entity name" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary" required />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Step 3: Parent 2 */}
                        <div data-step="3" className={step === 3 ? "block space-y-6 animate-in fade-in" : "hidden"}>
                            <h3 className="text-xl font-bold text-gray-900 border-b pb-2">Parent / Guardian 2 (Optional)</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <select name="parent2Title" className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white">
                                        <option value="">Select</option>
                                        <option value="Mr">Mr</option>
                                        <option value="Mrs">Mrs</option>
                                        <option value="Ms">Ms</option>
                                        <option value="Dr">Dr</option>
                                        <option value="Prof">Prof</option>
                                        <option value="Sheikh">Sheikh</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Surname</label>
                                        <input name="parent2Surname" type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name(s)</label>
                                        <input name="parent2FirstName" type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Known As</label>
                                    <input name="parent2KnownAs" type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ID / Passport Number</label>
                                    <input name="parent2Id" type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                                    <select name="parent2Rel" className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white">
                                        <option value="">Select</option>
                                        <option value="Father">Father</option>
                                        <option value="Mother">Mother</option>
                                        <option value="Guardian">Guardian</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                                    <select name="parent2MaritalStatus" className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white">
                                        <option value="">Select</option>
                                        <option value="Single">Single</option>
                                        <option value="Married">Married</option>
                                        <option value="Divorced">Divorced</option>
                                        <option value="Widowed">Widowed</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                                    <input name="parent2Occupation" type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Employer</label>
                                    <input name="parent2Employer" type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300" />
                                </div>
                                <div className="md:col-span-2 grid md:grid-cols-3 gap-6 pt-2 border-t mt-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                                        <input name="parent2Mobile" type="tel" className="w-full px-4 py-2 rounded-lg border border-gray-300" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Work Phone</label>
                                        <input name="parent2WorkPhone" type="tel" className="w-full px-4 py-2 rounded-lg border border-gray-300" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Home Phone</label>
                                        <input name="parent2HomePhone" type="tel" className="w-full px-4 py-2 rounded-lg border border-gray-300" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input name="parent2Email" type="email" className="w-full px-4 py-2 rounded-lg border border-gray-300" />
                                </div>

                                <div className="md:col-span-2 border-t pt-4">
                                    <h4 className="text-sm font-bold text-gray-900 mb-4">Parent 2 Address Details (If different)</h4>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Physical Address</label>
                                            <textarea name="parent2PhysicalAddress" rows={3}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary"
                                                onChange={(e) => {
                                                    if (isP2PostalSameAsPhysical) {
                                                        const postalInput = formRef.current?.querySelector('[name="parent2PostalAddress"]') as HTMLTextAreaElement;
                                                        if (postalInput) postalInput.value = e.target.value;
                                                    }
                                                }}
                                            ></textarea>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">City / Suburb</label>
                                            <input name="parent2City" type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary" />
                                        </div>
                                        <div>
                                            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                                <span>Postal Address</span>
                                                <div className="ml-auto flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id="p2SameAsPhysical"
                                                        checked={isP2PostalSameAsPhysical}
                                                        onChange={(e) => {
                                                            setIsP2PostalSameAsPhysical(e.target.checked);
                                                            if (e.target.checked) {
                                                                const physicalValue = (formRef.current?.querySelector('[name="parent2PhysicalAddress"]') as HTMLTextAreaElement)?.value;
                                                                const physicalCityValue = (formRef.current?.querySelector('input[name="parent2City"]') as HTMLInputElement)?.value;
                                                                const postalInput = formRef.current?.querySelector('[name="parent2PostalAddress"]') as HTMLTextAreaElement;
                                                                const postalCityInput = formRef.current?.querySelector('input[name="parent2PostalCity"]') as HTMLInputElement;
                                                                if (postalInput) postalInput.value = physicalValue || "";
                                                                if (postalCityInput) postalCityInput.value = physicalCityValue || "";
                                                            }
                                                        }}
                                                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                                                    />
                                                    <label htmlFor="p2SameAsPhysical" className="ml-2 text-xs font-normal text-gray-500">Same as Physical</label>
                                                </div>
                                            </label>
                                            <textarea
                                                name="parent2PostalAddress"
                                                rows={3}
                                                disabled={isP2PostalSameAsPhysical}
                                                className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary ${isP2PostalSameAsPhysical ? 'bg-gray-50' : ''}`}
                                            ></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">City / Suburb</label>
                                            <input
                                                name="parent2PostalCity"
                                                type="text"
                                                disabled={isP2PostalSameAsPhysical}
                                                className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary ${isP2PostalSameAsPhysical ? 'bg-gray-50' : ''}`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                                            <input
                                                name="parent2PostalCode"
                                                type="text"
                                                pattern="\d{4}"
                                                maxLength={4}
                                                placeholder="e.g. 1234"
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 4: Medical */}
                        <div data-step="4" className={step === 4 ? "block space-y-6 animate-in fade-in" : "hidden"}>
                            <h3 className="text-xl font-bold text-gray-900 border-b pb-2">Medical Information</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Medical Aid Name</label>
                                    <input name="medicalAidName" type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Medical Aid Number</label>
                                    <input name="medicalAidNumber" type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Family Doctor Name</label>
                                    <input required name="doctorName" type="text" className={`w-full px-4 py-2 rounded-lg border focus:ring-primary focus:border-primary ${errors.doctorName ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
                                    {errors.doctorName && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> {errors.doctorName}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Phone</label>
                                    <input required name="doctorPhone" type="tel" className={`w-full px-4 py-2 rounded-lg border focus:ring-primary focus:border-primary ${errors.doctorPhone ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
                                    {errors.doctorPhone && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> {errors.doctorPhone}</p>}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                                    <textarea name="allergies" rows={2} placeholder="List any known allergies" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary"></textarea>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Disabilities / Handicaps</label>
                                    <textarea name="disabilities" rows={2} placeholder="List any physical or cognitive disabilities" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary"></textarea>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Name (Not Parent)</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <input required name="emergencyName" type="text" placeholder="Full Name" className={`w-full px-4 py-2 rounded-lg border focus:ring-primary focus:border-primary ${errors.emergencyName ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
                                            {errors.emergencyName && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> {errors.emergencyName}</p>}
                                        </div>
                                        <div>
                                            <select required name="emergencyRel" className={`w-full px-4 py-2 rounded-lg border bg-white focus:ring-primary focus:border-primary ${errors.emergencyRel ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}>
                                                <option value="">Relationship</option>
                                                <option value="Parent">Parent</option>
                                                <option value="Grandparent">Grandparent</option>
                                                <option value="Aunt or Uncle">Aunt or Uncle</option>
                                                <option value="Family Friend">Family Friend</option>
                                                <option value="Other">Other</option>
                                            </select>
                                            {errors.emergencyRel && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> {errors.emergencyRel}</p>}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Phone 1</label>
                                        <input required name="emergencyPhone" type="tel" className={`w-full px-4 py-2 rounded-lg border focus:ring-primary focus:border-primary ${errors.emergencyPhone ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
                                        {errors.emergencyPhone && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> {errors.emergencyPhone}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Phone 2 (Optional)</label>
                                        <input name="emergencyPhone2" type="tel" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 5: Academic & Docs */}
                        <div data-step="5" className={step === 5 ? "block space-y-6 animate-in fade-in" : "hidden"}>
                            <h3 className="text-xl font-bold text-gray-900 border-b pb-2">Academic History & Documents</h3>
                            <div className="grid md:grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Previous School Name</label>
                                    <input required name="previousSchool" type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Principal Name</label>
                                        <input name="previousSchoolPrincipal" type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">School Telephone</label>
                                        <input name="previousSchoolPhone" type="tel" className="w-full px-4 py-2 rounded-lg border border-gray-300" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Leaving</label>
                                    <input name="leavingReason" type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300" />
                                </div>

                                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 mt-4">
                                    <h4 className="font-semibold text-blue-900 mb-4 flex items-center border-b border-blue-200 pb-2">
                                        <Upload className="w-5 h-5 mr-2" />
                                        Required Documents (Max 5MB per file)
                                    </h4>

                                    <div className="space-y-4">
                                        {[
                                            { id: "docBirthCert", label: "Learner's Birth Certificate / ID", required: true },
                                            { id: "docReportCard", label: "Latest School Report Card", required: true },
                                            { id: "docClinicCard", label: "Clinic Card (Road to Health)", required: true },
                                            { id: "docParentId", label: "Parent/Guardian ID Document(s)", required: true },
                                            { id: "docResidence", label: "Proof of Residence", required: true },
                                            { id: "docTransferCard", label: "Transfer Card", required: true },
                                            { id: "docPermit", label: "Study Permit / Refugee Permit (If applicable)", required: false },
                                        ].map((doc) => (
                                            <div key={doc.id} className="bg-white p-3 rounded border border-blue-100">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                    <label className="text-sm font-medium text-gray-700">
                                                        {doc.label} {doc.required && <span className="text-red-500">*</span>}
                                                    </label>
                                                    <div className="flex items-center">
                                                        <span className="text-[10px] text-gray-400 mr-2 truncate max-w-[150px]">
                                                            {fileNames[doc.id] || "No file chosen"}
                                                        </span>
                                                        <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs font-semibold transition-colors border border-blue-200">
                                                            Choose File
                                                            <input
                                                                required={doc.required}
                                                                name={doc.id}
                                                                type="file"
                                                                accept=".pdf,.jpg,.jpeg,.png"
                                                                className="hidden"
                                                                onChange={(e) => handleFileChange(e, doc.id)}
                                                            />
                                                        </label>
                                                    </div>
                                                </div>
                                                {errors[doc.id] && (
                                                    <p className="text-red-500 text-[10px] mt-1 flex items-center">
                                                        <AlertCircle className="w-2 h-2 mr-1" /> {errors[doc.id]}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 6: Accept & Submit */}
                        <div data-step="6" className={step === 6 ? "block space-y-6 animate-in fade-in" : "hidden"}>
                            <h3 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">Acceptance & Submission</h3>

                            <div className="space-y-6">
                                {/* Section 1 — Application Declaration */}
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 font-bold text-sm">1. Application Declaration</div>
                                    <div className="p-4 bg-white text-sm text-gray-700">
                                        I confirm that all information provided in this application is true, complete and accurate. I understand that submission of this form does not guarantee acceptance.
                                    </div>
                                    <div className="bg-blue-50 px-4 py-3 border-t border-gray-200 flex items-center">
                                        <input type="checkbox" id="acc_decl" checked={acceptances.declaration} onChange={() => handleAcceptanceChange('declaration')} className="h-5 w-5 text-primary border-gray-300 rounded focus:ring-primary" />
                                        <label htmlFor="acc_decl" className="ml-3 text-sm font-semibold text-gray-900 cursor-pointer">I confirm the above declaration</label>
                                    </div>
                                </div>

                                {/* Section 2 — Enrollment Contract */}
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 font-bold text-sm">2. Enrollment Contract</div>
                                    <div className="p-4 bg-white text-sm text-gray-700 h-48 overflow-y-auto">
                                        <p className="font-bold mb-2">School Rules & Code of Conduct</p>
                                        <p className="mb-4">The learner and parents agree to abide by the school's Code of Conduct, policies, and regulations as amended from time to time. Serious breaches of the code may result in disciplinary action.</p>
                                        <p className="font-bold mb-2">Fee Payment Obligation</p>
                                        <p>School fees are payable in advance. Parents/Guardians are jointly and severally liable for the payment of all fees and other charges derived from the learner's education.</p>
                                    </div>
                                    <div className="bg-blue-50 px-4 py-3 border-t border-gray-200 flex items-center">
                                        <input type="checkbox" id="acc_cont" checked={acceptances.contract} onChange={() => handleAcceptanceChange('contract')} className="h-5 w-5 text-primary border-gray-300 rounded focus:ring-primary" />
                                        <label htmlFor="acc_cont" className="ml-3 text-sm font-semibold text-gray-900 cursor-pointer">I have read and accept the Enrollment Contract terms</label>
                                    </div>
                                </div>

                                {/* Section 3 — Indemnity */}
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 font-bold text-sm">3. Indemnity & Medical Consent</div>
                                    <div className="p-4 bg-white text-sm text-gray-700 h-48 overflow-y-auto">
                                        <p className="mb-4">The school, its staff, and agents shall not be liable for any loss, damage, or injury sustained by the learner while on the school premises or during school activities.</p>
                                        <p>I hereby cede parental authority to the Principal or their designate in the event of a medical emergency where I cannot be contacted immediately, authorizing necessary medical treatment.</p>
                                    </div>
                                    <div className="bg-blue-50 px-4 py-3 border-t border-gray-200 flex items-center">
                                        <input type="checkbox" id="acc_inde" checked={acceptances.indemnity} onChange={() => handleAcceptanceChange('indemnity')} className="h-5 w-5 text-primary border-gray-300 rounded focus:ring-primary" />
                                        <label htmlFor="acc_inde" className="ml-3 text-sm font-semibold text-gray-900 cursor-pointer">I have read and accept the Indemnity terms</label>
                                    </div>
                                </div>

                                {/* Section 4 — Fee Payment Agreement */}
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 font-bold text-sm">4. Fee Payment Agreement</div>
                                    <div className="p-4 bg-white text-sm text-gray-700">
                                        <p className="mb-4">The monthly fee for the above-mentioned learner will be confirmed on acceptance. I undertake to pay fees by:</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                            {["Annually in advance", "Per term in advance", "Monthly in advance", "Debit order"].map((opt) => (
                                                <label key={opt} className="flex items-center p-3 border border-gray-100 rounded hover:bg-gray-50 cursor-pointer transition-colors">
                                                    <input type="radio" name="feeTerm" value={opt} checked={feePaymentTerm === opt} onChange={(e) => setFeePaymentTerm(e.target.value)} className="h-4 w-4 text-primary border-gray-300 focus:ring-primary" required />
                                                    <span className="ml-3 text-xs text-gray-700">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                        {feePaymentTerm === "Debit order" && (
                                            <div className="animate-in fade-in slide-in-from-top-2 bg-yellow-50 p-3 rounded border border-yellow-100 mb-4">
                                                <label className="block text-xs font-bold text-yellow-800 mb-1">Debit order commencing from</label>
                                                <input required name="debitOrderDate" type="date" className="w-full px-4 py-2 rounded border border-yellow-200 text-sm focus:ring-primary focus:border-primary" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="bg-blue-50 px-4 py-3 border-t border-gray-200 flex items-center">
                                        <input type="checkbox" id="acc_fees" checked={acceptances.fees} onChange={() => handleAcceptanceChange('fees')} className="h-5 w-5 text-primary border-gray-300 rounded focus:ring-primary" />
                                        <label htmlFor="acc_fees" className="ml-3 text-sm font-semibold text-gray-900 cursor-pointer">I agree to the fee payment terms above</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-6 border-t border-gray-100">
                            {step > 1 ? (
                                <Button type="button" onClick={prevStep} variant="outline" className="flex items-center">
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                                </Button>
                            ) : (
                                <div></div>
                            )}

                            {step < 6 ? (
                                <Button type="button" onClick={nextStep} className="flex items-center">
                                    Next <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={isLoading || !Object.values(acceptances).every(v => v)}
                                    className="flex items-center min-w-[200px] justify-center shadow-lg shadow-primary/20 disabled:scale-100 disabled:opacity-50"
                                >
                                    {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Accept & Submit"}
                                </Button>
                            )}
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
