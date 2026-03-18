"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Upload, CheckCircle, AlertCircle, Loader2, ArrowRight, ArrowLeft, Plus, Trash2, Download } from "lucide-react";
import { SignaturePad } from "@/components/ui/SignaturePad";

type FormStep = 1 | 2 | 3 | 4 | 5 | 6;

interface Sibling {
    name: string;
    grade: string;
    type: "Current" | "Applying";
}

const LEGAL_TERMS_VERSION = "v1.0";
const LEGAL_TERMS_SNAPSHOT = [
    "Application Declaration: Parent/Guardian confirms all submitted information is true, complete and accurate.",
    "Enrollment Contract: Parent/Guardian undertakes compliance with school rules, code of conduct, and fee obligations.",
    "Indemnity & Medical Consent: Parent/Guardian indemnifies school and cedes emergency medical authority to Principal/designate when unreachable.",
    "Fee Payment Agreement: Parent/Guardian undertakes payment according to selected payment term.",
].join("\n");

export const ApplicationForm = () => {
    const STORAGE_KEY = "alasr_application_autosave";
    const [step, setStep] = useState<FormStep>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitErrors, setSubmitErrors] = useState<Record<string, string>>({});
    const [stepValidationMessage, setStepValidationMessage] = useState("");

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
    const [isP1SameAsLearner, setIsP1SameAsLearner] = useState(false);
    const [isP2PostalSameAsPhysical, setIsP2PostalSameAsPhysical] = useState(false);
    const [isP2SameAsLearner, setIsP2SameAsLearner] = useState(false);
    const [feePayer, setFeePayer] = useState("");
    const [fileNames, setFileNames] = useState<Record<string, string>>({});
    const [acceptances, setAcceptances] = useState({
        declaration: false,
        contract: false,
        indemnity: false,
        fees: false
    });
    const [readAcknowledged, setReadAcknowledged] = useState({
        contract: false,
        indemnity: false,
    });
    const [acceptanceLogs, setAcceptanceLogs] = useState<Record<string, string>>({});
    const [privacyAcks, setPrivacyAcks] = useState({
        popiaMinorConsent: false,
        operatorDisclosure: false,
    });
    const [privacyLogs, setPrivacyLogs] = useState<Record<string, string>>({});
    const [feePaymentTerm, setFeePaymentTerm] = useState("");
    const [resultRef, setResultRef] = useState("");
    const [submittedData, setSubmittedData] = useState<Record<string, any> | null>(null);

    const handleAcceptanceChange = (key: keyof typeof acceptances) => {
        setAcceptances(prev => {
            const newVal = !prev[key];
            if (newVal) {
                setAcceptanceLogs(logs => ({ ...logs, [key]: new Date().toISOString() }));
            }
            return { ...prev, [key]: newVal };
        });
    };

    const handlePrivacyAckChange = (key: keyof typeof privacyAcks) => {
        setPrivacyAcks((prev) => {
            const newVal = !prev[key];
            if (newVal) {
                setPrivacyLogs((logs) => ({ ...logs, [key]: new Date().toISOString() }));
            }
            return { ...prev, [key]: newVal };
        });
    };

    const normalizeFullName = (value: string) => value.trim().replace(/\s+/g, " ").toLowerCase();

    const handleTermsScroll = (key: keyof typeof readAcknowledged, e: React.UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
        if (atBottom) {
            setReadAcknowledged((prev) => ({ ...prev, [key]: true }));
        }
    };

    const sha256Hex = async (input: string): Promise<string> => {
        const encoder = new TextEncoder();
        const data = encoder.encode(input);
        const digest = await crypto.subtle.digest("SHA-256", data);
        return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
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
        setSiblings([...siblings, { name: "", grade: "", type: "Current" }]);
    };

    const removeSibling = (index: number) => {
        const newSiblings = [...siblings];
        newSiblings.splice(index, 1);
        setSiblings(newSiblings);
    };

    const handleSiblingChange = (index: number, field: keyof Sibling, value: any) => {
        const newSiblings = [...siblings];
        newSiblings[index][field] = value;
        setSiblings(newSiblings);
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64String = (reader.result as string).split(',')[1];
                resolve(base64String);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const nextStep = () => {
        const currentSection = formRef.current?.querySelector(`[data-step="${step}"]`) as HTMLElement;
        const inputs = currentSection?.querySelectorAll("input, select, textarea");
        let isValid = true;
        let firstInvalidElement: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null = null;
        const newErrors: Record<string, string> = { ...errors };

        setStepValidationMessage("");

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
                if (!firstInvalidElement) {
                    firstInvalidElement = htmlInput;
                }
            } else {
                delete newErrors[htmlInput.name];
            }
        });

        setErrors(newErrors);

        if (isValid) {
            setStep((s) => Math.min(s + 1, 6) as FormStep);
            setStepValidationMessage("");
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            setStepValidationMessage("Please complete all required fields highlighted on this step before continuing.");
            if (firstInvalidElement) {
                firstInvalidElement.scrollIntoView({ behavior: "smooth", block: "center" });
                firstInvalidElement.focus();
            }
        }
    };

    const prevStep = () => {
        setStep((s) => Math.max(s - 1, 1) as FormStep);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitErrors({});

        if (!readAcknowledged.contract || !readAcknowledged.indemnity) {
            setSubmitErrors((prev) => ({
                ...prev,
                termsRead: "Please scroll through all legal sections before accepting terms.",
            }));
            return;
        }

        const allAccepted = Object.values(acceptances).every(v => v === true);
        if (!allAccepted) {
            setSubmitErrors((prev) => ({
                ...prev,
                acceptances: "Please accept all terms and conditions before submitting.",
            }));
            return;
        }

        const allPrivacyAccepted = Object.values(privacyAcks).every(v => v === true);
        if (!allPrivacyAccepted) {
            setSubmitErrors((prev) => ({
                ...prev,
                privacyAcks: "Please complete all POPIA and Operator acknowledgements before submitting.",
            }));
            return;
        }

        const formData = new FormData(e.currentTarget);
        const fileInputs = Array.from(e.currentTarget.querySelectorAll('input[type="file"]')) as HTMLInputElement[];

        try {
            setIsLoading(true);
            setStatus("idle");
            setMessage("Processing documents... Please wait.");

            // Process ALL files in parallel for speed
            const processedFiles = await Promise.all(
                fileInputs.flatMap(input => {
                    if (input.files && input.files[0]) {
                        const file = input.files[0];
                        return fileToBase64(file).then(base64Data => ({
                            name: file.name,
                            mimeType: file.type,
                            data: base64Data,
                            field: input.name,
                            size: file.size
                        }));
                    }
                    return [];
                })
            );

            // Check total size (Google Apps Script limit is ~6MB total payload)
            const totalSize = processedFiles.reduce((acc, f) => acc + f.size, 0);
            if (totalSize > 5 * 1024 * 1024) { // 5MB limit to be safe
                throw new Error("Files are too large. Please ensure total attachments are under 5MB.");
            }

            const allFormData = Object.fromEntries(formData.entries());

            const typedFullName = String(allFormData.typedFullName || "");
            const typedFullNameConfirm = String(allFormData.typedFullNameConfirm || "");
            const parent1LegalName = `${String(allFormData.parent1FirstName || "")} ${String(allFormData.parent1Surname || "")}`;

            if (!typedFullName || !typedFullNameConfirm) {
                setSubmitErrors((prev) => ({
                    ...prev,
                    typedFullName: !typedFullName ? "Please type your full legal name." : "",
                    typedFullNameConfirm: !typedFullNameConfirm ? "Please re-type your full legal name." : "",
                }));
                throw new Error("Please complete both typed signature fields.");
            }

            if (normalizeFullName(typedFullName) !== normalizeFullName(typedFullNameConfirm)) {
                setSubmitErrors((prev) => ({
                    ...prev,
                    typedFullNameConfirm: "Typed signature fields do not match.",
                }));
                throw new Error("Typed signature fields do not match.");
            }

            if (normalizeFullName(typedFullName) !== normalizeFullName(parent1LegalName)) {
                setSubmitErrors((prev) => ({
                    ...prev,
                    typedFullName: "Typed signature must match Parent/Guardian 1 legal first name and surname.",
                }));
                throw new Error("Typed signature must match Parent/Guardian 1 legal first name and surname.");
            }

            // Remove the raw file objects from allData as they are handled in processedFiles
            processedFiles.forEach(pf => delete allFormData[pf.field]);

            // Add Audit Trail for Clickwrap Agreement
            const termsSha256 = await sha256Hex(LEGAL_TERMS_SNAPSHOT);

            const auditLog = {
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                checkboxLogs: acceptanceLogs,
                privacyLogs,
                privacyAcks,
                termsVersion: LEGAL_TERMS_VERSION,
                termsSha256,
                termsTextSnapshot: LEGAL_TERMS_SNAPSHOT,
                parentName: `${allFormData.parent1FirstName} ${allFormData.parent1Surname}`,
                parentEmail: allFormData.parent1Email
            };

            const payload = {
                allData: allFormData,
                siblings: siblings,
                form_start_time: startTime,
                audit_log: auditLog,
                feePaymentTerm: feePaymentTerm,
                files: processedFiles
            };

            setMessage("Securing your application and generating your branded legal contract... This can take 1 to 3 minutes depending on your internet speed and file sizes. Please do not close this window.");
            const response = await fetch("/api/applications/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
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
                // Capture data for printing before reset
                setSubmittedData({ ...payload.allData, siblings, reference: result.ref });

                setStatus("success");
                setResultRef(result.ref || "Pending");
                setMessage(`Application submitted successfully! Ref: ${result.ref || 'Pending'}. We will contact you shortly.`);
                formRef.current?.reset();
                setSignature(null);
                setSiblings([]);
                setStep(1);
                localStorage.removeItem(STORAGE_KEY);
            } else {
                if (typeof result?.error === "string" && result.error.toLowerCase().includes("parent/guardian email")) {
                    setErrors((prev) => ({ ...prev, parent1Email: "Valid Parent/Guardian email is required." }));
                    setStep(2);
                }
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
            <div className="bg-gray-50 border-b border-gray-100 p-4 no-print">
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
                        <div className="no-print">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <CheckCircle className="w-10 h-10" />
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-2">JazakAllahu Khairan — Application Received!</h3>

                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 my-8 max-w-sm mx-auto shadow-inner">
                                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black mb-2 block">Reference Number</span>
                                <div className="text-3xl font-mono font-bold text-primary tracking-tighter">{resultRef}</div>
                            </div>

                            <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                                Thank you for trusting Al-Asr with your child&apos;s journey. We have safely received your application,
                                and a confirmation copy has been sent to the Parent 1 email address provided. Our admissions team will
                                review everything and be in touch with you soon, in shaa Allah.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 border-t pt-8 no-print">
                            <Button onClick={() => window.print()} className="flex items-center shadow-lg shadow-primary/20">
                                <Download className="w-4 h-4 mr-2" /> Download / Print Application
                            </Button>
                            <Button onClick={() => {
                                setStatus("idle");
                                setAcceptances({ declaration: false, contract: false, indemnity: false, fees: false });
                                setFeePayer("");
                                setSubmittedData(null);
                            }} variant="outline">
                                Start Another
                            </Button>
                        </div>

                        {/* Printable Application View */}
                        {submittedData && (
                            <div className="hidden print:block text-left mt-12 border-t pt-12">
                                <div className="flex justify-between items-start mb-8 border-b-2 border-primary pb-4">
                                    <div>
                                        <h1 className="text-2xl font-bold text-primary uppercase tracking-tighter">Al-Asr Educational Institute</h1>
                                        <p className="text-xs text-gray-500">370 Ganges Street, Claudius, Centurion | +27 12 374 5546</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] uppercase font-bold text-gray-400">Application Reference</div>
                                        <div className="text-xl font-mono font-bold text-primary">{resultRef}</div>
                                    </div>
                                </div>

                                <div className="mb-6 text-center border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <p className="text-[11px] font-semibold text-gray-700">In the name of Allah, Most Gracious, Most Merciful</p>
                                    <p className="text-[10px] text-gray-600 italic mt-1">“... Allah has chosen him above you, and has gifted him abundantly with knowledge and bodily prowess...” — Sura Baqara (2:247)</p>
                                    <p className="text-[10px] text-gray-600 italic mt-1">“By Time... Verily Man is in loss, except such as have Faith, and do righteous deeds...” — Sura Asr</p>
                                </div>

                                <div className="space-y-8">
                                    <section>
                                        <h2 className="text-sm font-bold uppercase bg-gray-100 p-2 mb-4 border-l-4 border-primary">Contracting Parties</h2>
                                        <div className="grid grid-cols-1 gap-y-2 text-sm italic">
                                            <div>
                                                <span className="font-bold uppercase not-italic text-[10px] text-gray-500 block">School (Operator):</span>
                                                Al-Asr Educational Institute, 370 Ganges Street, Claudius, Centurion.
                                            </div>
                                            <div>
                                                <span className="font-bold uppercase not-italic text-[10px] text-gray-500 block">Parent/Guardian (Primary):</span>
                                                {submittedData.parent1Title} {submittedData.parent1FirstName} {submittedData.parent1Surname} {submittedData.parent1Id ? `(ID/Passport: ${submittedData.parent1Id})` : ""}
                                            </div>
                                            {submittedData.parent2FirstName && (
                                                <div>
                                                    <span className="font-bold uppercase not-italic text-[10px] text-gray-500 block">Parent/Guardian (Secondary):</span>
                                                    {submittedData.parent2Title} {submittedData.parent2FirstName} {submittedData.parent2Surname} {submittedData.parent2Id ? `(ID/Passport: ${submittedData.parent2Id})` : ""}
                                                </div>
                                            )}
                                            <div>
                                                <span className="font-bold uppercase not-italic text-[10px] text-gray-500 block">Learner:</span>
                                                {submittedData.learnerFirstName || submittedData.learnerName} {submittedData.learnerSurname} {submittedData.learnerId ? `(ID/Passport: ${submittedData.learnerId})` : ""}
                                            </div>
                                        </div>
                                    </section>

                                    <section>
                                        <h2 className="text-sm font-bold uppercase bg-gray-100 p-2 mb-4 border-l-4 border-primary">1. Learner Details</h2>
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm italic">
                                            <div><span className="font-bold uppercase not-italic text-[10px] text-gray-500 block">Surname:</span> {submittedData.learnerSurname}</div>
                                            <div><span className="font-bold uppercase not-italic text-[10px] text-gray-500 block">First Name(s):</span> {submittedData.learnerFirstName || submittedData.learnerName}</div>
                                            <div><span className="font-bold uppercase not-italic text-[10px] text-gray-500 block">ID / Passport:</span> {submittedData.learnerId}</div>
                                            <div><span className="font-bold uppercase not-italic text-[10px] text-gray-500 block">Date of Birth:</span> {submittedData.dob}</div>
                                            <div><span className="font-bold uppercase not-italic text-[10px] text-gray-500 block">Grade Applying For:</span> {submittedData.grade} ({submittedData.academicYear})</div>
                                            <div><span className="font-bold uppercase not-italic text-[10px] text-gray-500 block">Home Language:</span> {submittedData.homeLanguage}</div>
                                            <div className="col-span-2"><span className="font-bold uppercase not-italic text-[10px] text-gray-500 block">Physical Address:</span> {submittedData.learnerPhysicalAddress} {submittedData.learnerCity}</div>
                                        </div>
                                    </section>

                                    {submittedData.siblings && submittedData.siblings.length > 0 && (
                                        <section>
                                            <h2 className="text-sm font-bold uppercase bg-gray-100 p-2 mb-4 border-l-4 border-primary">2. Siblings at Al-Asr</h2>
                                            <div className="space-y-2">
                                                {submittedData.siblings.map((sib: any, i: number) => (
                                                    <div key={i} className="text-sm grid grid-cols-3 border-b border-gray-50 pb-1">
                                                        <span>{sib.name}</span>
                                                        <span className="text-center text-primary font-bold text-[10px] uppercase">{sib.type}</span>
                                                        <span className="text-right font-medium">Grade {sib.grade}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    <section>
                                        <h2 className="text-sm font-bold uppercase bg-gray-100 p-2 mb-4 border-l-4 border-primary">3. Parent / Guardian Details</h2>
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <h3 className="text-xs font-bold border-b pb-1">Primary Parent (P1)</h3>
                                                <div className="text-sm italic">
                                                    <div>{submittedData.parent1Title} {submittedData.parent1FirstName} {submittedData.parent1Surname}</div>
                                                    <div className="not-italic text-[10px] text-gray-500">{submittedData.parent1Rel} | {submittedData.parent1Id}</div>
                                                    <div className="mt-1 font-medium not-italic">{submittedData.parent1Email}</div>
                                                    <div className="not-italic">{submittedData.parent1Mobile}</div>
                                                </div>
                                            </div>
                                            {submittedData.parent2FirstName && (
                                                <div className="space-y-2">
                                                    <h3 className="text-xs font-bold border-b pb-1">Secondary Parent (P2)</h3>
                                                    <div className="text-sm italic">
                                                        <div>{submittedData.parent2Title} {submittedData.parent2FirstName} {submittedData.parent2Surname}</div>
                                                        <div className="not-italic text-[10px] text-gray-500">{submittedData.parent2Rel} | {submittedData.parent2Id}</div>
                                                        <div className="mt-1 font-medium not-italic">{submittedData.parent2Email}</div>
                                                        <div className="not-italic">{submittedData.parent2Mobile}</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </section>

                                    <section>
                                        <h2 className="text-sm font-bold uppercase bg-gray-100 p-2 mb-4 border-l-4 border-primary">4. Medical & Emergency</h2>
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm italic">
                                            <div className="col-span-2"><span className="font-bold uppercase not-italic text-[10px] text-gray-500 block">Allergies/Disabilities:</span> {submittedData.allergies || 'None'} / {submittedData.disabilities || 'None'}</div>
                                            <div><span className="font-bold uppercase not-italic text-[10px] text-gray-500 block">Emergency Contact:</span> {submittedData.emergencyName}</div>
                                            <div><span className="font-bold uppercase not-italic text-[10px] text-gray-500 block">Relationship:</span> {submittedData.emergencyRel}</div>
                                            <div><span className="font-bold uppercase not-italic text-[10px] text-gray-500 block">Emergency Phone:</span> {submittedData.emergencyPhone}</div>
                                        </div>
                                    </section>

                                    <section>
                                        <h2 className="text-sm font-bold uppercase bg-gray-100 p-2 mb-4 border-l-4 border-primary">5. Terms & Conditions Accepted</h2>
                                        <div className="space-y-4 text-[11px] text-gray-600 leading-relaxed border p-4 rounded-lg bg-gray-50/50">
                                            <p><strong>1. Application Declaration:</strong> I, the undersigned Parent/Guardian, confirm that all information provided in this application is true, complete and accurate. I understand that submission of this form does not guarantee acceptance.</p>
                                            <p><strong>2. Enrollment Contract:</strong> I undertake to comply with Al-Asr Educational Institute rules, Code of Conduct and disciplinary code, to ensure my child/ward complies therewith, and accept responsibility for prompt payment of all fees and related charges.</p>
                                            <p><strong>3. Indemnity & Medical Consent:</strong> I permit participation in curricular and extra-curricular activities and indemnify the school and staff against claims arising from such participation. I cede parental authority to the Principal or designated representative for necessary medical treatment where I cannot be reached immediately.</p>
                                            <p><strong>4. Fee Payment Agreement ({submittedData.feePaymentTerm}):</strong> I undertake to pay fees as per the selected payment term.</p>
                                        </div>
                                    </section>

                                    <div className="pt-8 border-t text-[9px] text-gray-400 text-center italic">
                                        This is an electronically generated summary of the application submitted via the Al-Asr and InnateSoma Portal on {new Date().toLocaleDateString()}.
                                        <br />
                                        Audit: {submittedData.learnerSurname} | IP: {resultRef} | Accepted: All Declarations.
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <form ref={formRef} onSubmit={handleSubmit} onInput={saveFormData} noValidate className="space-y-6">
                        {stepValidationMessage && (
                            <div className="p-4 bg-amber-50 border border-amber-100 text-amber-800 rounded-lg flex items-center animate-in slide-in-from-top-2">
                                <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
                                <span className="text-sm font-medium">{stepValidationMessage}</span>
                            </div>
                        )}

                        {status === "error" && (
                            <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg flex items-center animate-in slide-in-from-top-2">
                                <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
                                <span className="text-sm font-medium">{message}</span>
                            </div>
                        )}

                        {isLoading && (
                            <div className="p-4 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg flex items-center animate-in slide-in-from-top-2">
                                <Loader2 className="w-5 h-5 mr-3 shrink-0 animate-spin" />
                                <span className="text-sm font-medium">{message}</span>
                            </div>
                        )}

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

                                <div className="md:col-span-2 border-t pt-6 mt-4 bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-200">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900">Siblings at Al-Asr</h4>
                                            <p className="text-xs text-gray-500">Do you have other children currently at the school or also applying?</p>
                                        </div>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={addSibling}
                                            className="text-xs border-primary/30 text-primary hover:bg-primary/5 h-8"
                                        >
                                            <Plus className="w-3 h-3 mr-1" /> Add Sibling
                                        </Button>
                                    </div>

                                    {siblings.length === 0 ? (
                                        <div className="text-center py-4 border border-dashed border-gray-200 rounded-lg bg-white/50">
                                            <p className="text-xs text-gray-400 italic">No siblings listed. Click "Add Sibling" if applicable.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {siblings.map((sibling, index) => (
                                                <div key={index} className="flex gap-3 items-start animate-in fade-in slide-in-from-top-1 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                                                    <div className="flex-1">
                                                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Full Name</label>
                                                        <input
                                                            placeholder="Sibling's Full Name"
                                                            value={sibling.name}
                                                            onChange={(e) => handleSiblingChange(index, "name", e.target.value)}
                                                            className="w-full px-3 py-2 rounded border border-gray-300 text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="w-32">
                                                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Status</label>
                                                        <select
                                                            value={sibling.type}
                                                            onChange={(e) => handleSiblingChange(index, "type" as any, e.target.value)}
                                                            className="w-full px-3 py-2 rounded border border-gray-300 text-sm focus:ring-1 focus:ring-primary focus:border-primary bg-white transition-all font-medium text-primary"
                                                            required
                                                        >
                                                            <option value="Current">At School</option>
                                                            <option value="Applying">Applying</option>
                                                        </select>
                                                    </div>
                                                    <div className="w-24">
                                                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Grade</label>
                                                        <select
                                                            value={sibling.grade}
                                                            onChange={(e) => handleSiblingChange(index, "grade", e.target.value)}
                                                            className="w-full px-3 py-2 rounded border border-gray-300 text-sm focus:ring-1 focus:ring-primary focus:border-primary bg-white transition-all"
                                                            required
                                                        >
                                                            <option value="">Grade</option>
                                                            <option value="RR">RR</option>
                                                            <option value="R">R</option>
                                                            {[...Array(12)].map((_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
                                                        </select>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSibling(index)}
                                                        className="mt-6 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                                        title="Remove Sibling"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Position / Job Title</label>
                                    <input required name="parent1Position" type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300" />
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
                                    <input required name="parent1Email" type="email" className={`w-full px-4 py-2 rounded-lg border ${errors.parent1Email ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
                                    {errors.parent1Email && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> {errors.parent1Email}</p>}
                                </div>

                                <div className="md:col-span-2 border-t pt-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-sm font-bold text-gray-900">Parent 1 Address Details</h4>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="p1SameAsLearner"
                                                checked={isP1SameAsLearner}
                                                onChange={(e) => {
                                                    setIsP1SameAsLearner(e.target.checked);
                                                    if (e.target.checked) {
                                                        const physicalValue = (formRef.current?.querySelector('[name="learnerPhysicalAddress"]') as HTMLTextAreaElement)?.value;
                                                        const cityValue = (formRef.current?.querySelector('input[name="learnerCity"]') as HTMLInputElement)?.value;
                                                        const codeValue = (formRef.current?.querySelector('input[name="learnerPostalCode"]') as HTMLInputElement)?.value;

                                                        const p1Physical = formRef.current?.querySelector('[name="parent1PhysicalAddress"]') as HTMLTextAreaElement;
                                                        const p1City = formRef.current?.querySelector('input[name="parent1City"]') as HTMLInputElement;
                                                        const p1Code = formRef.current?.querySelector('input[name="parent1PostalCode"]') as HTMLInputElement;

                                                        if (p1Physical) p1Physical.value = physicalValue || "";
                                                        if (p1City) p1City.value = cityValue || "";
                                                        if (p1Code) p1Code.value = codeValue || "";

                                                        if (isP1PostalSameAsPhysical) {
                                                            const p1Postal = formRef.current?.querySelector('[name="parent1PostalAddress"]') as HTMLTextAreaElement;
                                                            const p1PostalCity = formRef.current?.querySelector('input[name="parent1PostalCity"]') as HTMLInputElement;
                                                            if (p1Postal) p1Postal.value = physicalValue || "";
                                                            if (p1PostalCity) p1PostalCity.value = cityValue || "";
                                                        }
                                                    }
                                                }}
                                                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                                            />
                                            <label htmlFor="p1SameAsLearner" className="ml-2 text-xs font-medium text-primary">Same as Learner</label>
                                        </div>
                                    </div>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Position / Job Title</label>
                                    <input name="parent2Position" type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Employer</label>
                                    <input name="parent2Employer" type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type of Business</label>
                                    <input name="parent2BusinessType" type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300" />
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
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-sm font-bold text-gray-900">Parent 2 Address Details (If different)</h4>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="p2SameAsLearner"
                                                checked={isP2SameAsLearner}
                                                onChange={(e) => {
                                                    setIsP2SameAsLearner(e.target.checked);
                                                    if (e.target.checked) {
                                                        const physicalValue = (formRef.current?.querySelector('[name="learnerPhysicalAddress"]') as HTMLTextAreaElement)?.value;
                                                        const cityValue = (formRef.current?.querySelector('input[name="learnerCity"]') as HTMLInputElement)?.value;
                                                        const codeValue = (formRef.current?.querySelector('input[name="learnerPostalCode"]') as HTMLInputElement)?.value;

                                                        const p2Physical = formRef.current?.querySelector('[name="parent2PhysicalAddress"]') as HTMLTextAreaElement;
                                                        const p2City = formRef.current?.querySelector('input[name="parent2City"]') as HTMLInputElement;
                                                        const p2Code = formRef.current?.querySelector('input[name="parent2PostalCode"]') as HTMLInputElement;

                                                        if (p2Physical) p2Physical.value = physicalValue || "";
                                                        if (p2City) p2City.value = cityValue || "";
                                                        if (p2Code) p2Code.value = codeValue || "";

                                                        if (isP2PostalSameAsPhysical) {
                                                            const p2Postal = formRef.current?.querySelector('[name="parent2PostalAddress"]') as HTMLTextAreaElement;
                                                            const p2PostalCity = formRef.current?.querySelector('input[name="parent2PostalCity"]') as HTMLInputElement;
                                                            if (p2Postal) p2Postal.value = physicalValue || "";
                                                            if (p2PostalCity) p2PostalCity.value = cityValue || "";
                                                        }
                                                    }
                                                }}
                                                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                                            />
                                            <label htmlFor="p2SameAsLearner" className="ml-2 text-xs font-medium text-primary">Same as Learner</label>
                                        </div>
                                    </div>
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
                                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
                                        Compliance Notice: Certified copies may be required on request during admissions verification.
                                    </p>

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

                            <div className="border border-primary/20 rounded-lg p-4 bg-primary/5 text-sm text-gray-700">
                                <p className="font-semibold">In the name of Allah, Most Gracious, Most Merciful</p>
                                <p className="italic text-xs mt-1">“... Allah has chosen him above you, and has gifted him abundantly with knowledge and bodily prowess...” — Sura Baqara (2:247)</p>
                                <p className="italic text-xs mt-1">“By Time... Verily Man is in loss, except such as have Faith, and do righteous deeds...” — Sura Asr</p>
                            </div>

                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 text-sm text-gray-700">
                                <p className="font-bold mb-2">Parties to this Agreement</p>
                                <p>
                                    This electronic contract is concluded between <strong>Al-Asr Educational Institute</strong> (the School)
                                    and the undersigned <strong>Parent/Guardian(s)</strong> identified in this application,
                                    in respect of the named <strong>Learner</strong>. By continuing, the Parent/Guardian confirms legal capacity
                                    to contract and to act in the best interests of the Learner.
                                </p>
                            </div>

                            <div className="space-y-6">
                                {/* Section 1 — Application Declaration */}
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 font-bold text-sm">1. Application Declaration</div>
                                    <div className="p-4 bg-white text-sm text-gray-700">
                                        I, the undersigned Parent/Guardian, confirm that all information provided in this application is true, complete and accurate. I understand that submission of this form does not guarantee acceptance.
                                    </div>
                                    <div className="bg-blue-50 px-4 py-3 border-t border-gray-200 flex items-center">
                                        <input type="checkbox" id="acc_decl" checked={acceptances.declaration} onChange={() => handleAcceptanceChange('declaration')} className="h-5 w-5 text-primary border-gray-300 rounded focus:ring-primary" />
                                        <label htmlFor="acc_decl" className="ml-3 text-sm font-semibold text-gray-900 cursor-pointer">I confirm the above declaration</label>
                                    </div>
                                </div>

                                {/* Section 2 — Enrollment Contract */}
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 font-bold text-sm">2. Enrollment Contract</div>
                                    <div className="p-4 bg-white text-sm text-gray-700 h-48 overflow-y-auto" onScroll={(e) => handleTermsScroll("contract", e)}>
                                        <p className="mb-3">I, the undersigned Parent/Guardian of the learner named in this application:</p>
                                        <p className="mb-2">a) Hereby certify that the information provided in this application is true, complete and accurate.</p>
                                        <p className="mb-2">b) Undertake to comply with the rules and regulations, Code of Conduct and disciplinary code of Al-Asr Educational Institute, and to ensure my child/ward complies therewith.</p>
                                        <p className="mb-2">c) Accept that if the School Disciplinary Committee finds my child/ward guilty of serious misconduct as described in the School Code of Conduct, he/she may be suspended or expelled.</p>
                                        <p className="mb-2">d) Hold myself/ourselves accountable for prompt payment of Al-Asr Educational Institute fees and related charges.</p>
                                        <p>e) Recognize that this contract is binding on the Parent/Guardian upon electronic acceptance and remains subject to School authorization requirements.</p>
                                    </div>
                                    {!readAcknowledged.contract && <div className="px-4 py-2 text-[11px] text-amber-700 bg-amber-50 border-t border-amber-100">Scroll to the end of this section to enable acceptance.</div>}
                                    <div className="bg-blue-50 px-4 py-3 border-t border-gray-200 flex items-center">
                                        <input type="checkbox" id="acc_cont" checked={acceptances.contract} onChange={() => handleAcceptanceChange('contract')} disabled={!readAcknowledged.contract} className="h-5 w-5 text-primary border-gray-300 rounded focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed" />
                                        <label htmlFor="acc_cont" className="ml-3 text-sm font-semibold text-gray-900 cursor-pointer">I have read and accept the Enrollment Contract terms</label>
                                    </div>
                                </div>

                                {/* Section 3 — Indemnity */}
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 font-bold text-sm">3. Indemnity & Medical Consent</div>
                                    <div className="p-4 bg-white text-sm text-gray-700 h-48 overflow-y-auto" onScroll={(e) => handleTermsScroll("indemnity", e)}>
                                        <p className="mb-3">I give permission for the learner to participate in curricular and extra-curricular activities of Al-Asr Educational Institute, including necessary excursions.</p>
                                        <p className="mb-3">I accept that responsible precautions will be taken to ensure learner safety and welfare, and that I remain responsible for payment of medical and/or hospital accounts, where applicable.</p>
                                        <p className="mb-3">I indemnify and hold Al-Asr Educational Institute and its staff harmless against claims arising from injury, damage or loss sustained in the course of such participation.</p>
                                        <p>I cede my power as Parent/Guardian to the Principal of Al-Asr Educational Institute or their designated representative should medical treatment/surgery be deemed necessary where I cannot be reached immediately.</p>
                                    </div>
                                    {!readAcknowledged.indemnity && <div className="px-4 py-2 text-[11px] text-amber-700 bg-amber-50 border-t border-amber-100">Scroll to the end of this section to enable acceptance.</div>}
                                    <div className="bg-blue-50 px-4 py-3 border-t border-gray-200 flex items-center">
                                        <input type="checkbox" id="acc_inde" checked={acceptances.indemnity} onChange={() => handleAcceptanceChange('indemnity')} disabled={!readAcknowledged.indemnity} className="h-5 w-5 text-primary border-gray-300 rounded focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed" />
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

                                <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-4">
                                    <p className="text-sm font-semibold text-gray-900">ECTA Typed Signature (Required)</p>
                                    <p className="text-xs text-gray-600">Type your full legal name exactly as entered for Parent/Guardian 1 (First Name + Surname).</p>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Type Full Name</label>
                                            <input name="typedFullName" type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary" />
                                            {submitErrors.typedFullName && <p className="text-red-500 text-xs mt-1">{submitErrors.typedFullName}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Re-type Full Name</label>
                                            <input name="typedFullNameConfirm" type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary" />
                                            {submitErrors.typedFullNameConfirm && <p className="text-red-500 text-xs mt-1">{submitErrors.typedFullNameConfirm}</p>}
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded p-3">
                                        I intend my electronic acceptance and typed full name to constitute my signature for this agreement.
                                    </div>
                                    {submitErrors.termsRead && <p className="text-red-500 text-xs">{submitErrors.termsRead}</p>}
                                    {submitErrors.acceptances && <p className="text-red-500 text-xs">{submitErrors.acceptances}</p>}
                                </div>

                                <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-4">
                                    <p className="text-sm font-semibold text-gray-900">POPIA & Operator Disclosure (Required)</p>

                                    <label className="flex items-start gap-3 text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            name="popiaMinorConsent"
                                            value="yes"
                                            checked={privacyAcks.popiaMinorConsent}
                                            onChange={() => handlePrivacyAckChange("popiaMinorConsent")}
                                            className="mt-0.5 h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                                        />
                                        <span>
                                            I consent to Al-Asr Educational Institute processing the learner's personal information,
                                            including special personal information of a minor, for lawful admissions and education
                                            administration purposes in line with POPIA Section 35(1).
                                        </span>
                                    </label>

                                    <label className="flex items-start gap-3 text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            name="operatorDisclosure"
                                            value="yes"
                                            checked={privacyAcks.operatorDisclosure}
                                            onChange={() => handlePrivacyAckChange("operatorDisclosure")}
                                            className="mt-0.5 h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                                        />
                                        <span>
                                            I acknowledge that Al-Asr Educational Institute uses Google Workspace Enterprise as an
                                            authorized operator/processor relay for secure application handling, record retention,
                                            and auditable institutional communications.
                                        </span>
                                    </label>

                                    {submitErrors.privacyAcks && <p className="text-red-500 text-xs">{submitErrors.privacyAcks}</p>}
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
                                    disabled={
                                        isLoading ||
                                        !Object.values(acceptances).every(v => v) ||
                                        !Object.values(privacyAcks).every(v => v) ||
                                        !readAcknowledged.contract ||
                                        !readAcknowledged.indemnity
                                    }
                                    className="flex items-center min-w-[200px] justify-center shadow-lg shadow-primary/20 disabled:scale-100 disabled:opacity-50"
                                >
                                    {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Accept & Submit"}
                                </Button>
                            )}
                        </div>
                    </form>
                )}

                {/* Loading Overlay Modal */}
                {isLoading && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center border border-gray-100 flex flex-col items-center">
                            <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mb-6">
                                <Loader2 className="w-10 h-10 animate-spin" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Uploading Files...</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                Your application is being uploaded. Depending on your document sizes and internet speed, this may take between 1 to 3 minutes.
                                <span className="block mt-2 font-bold text-primary italic text-[10px]">Please do not refresh or close this window.</span>
                            </p>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-primary h-full w-1/2 animate-[loading_2s_infinite_linear]"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
