import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

const GOOGLE_WEBHOOK_URL =
    "https://script.google.com/macros/s/AKfycbwGkDh1ELDC_b2ZGXXKFnRJ_q1d9jUbN_VtswGmz5GtKVpzy9jPHlIALm3C-QA0Ytfo/exec";

const sanitizeHeader = (value: string) =>
    value.replace(/[^a-zA-Z0-9,.:;=\s\-\[\]\(\)\/_]/g, "").trim().slice(0, 1024);

const FULL_TERMS_AND_CONDITIONS = [
    "1. Application Declaration",
    "I, the undersigned Parent/Guardian, confirm that all information provided in this application is true, complete and accurate. I understand that submission of this form does not guarantee acceptance.",
    "",
    "2. Enrollment Contract",
    "I, the undersigned Parent/Guardian of the learner named in this application:",
    "a) Hereby certify that the information provided in this application is true, complete and accurate.",
    "b) Undertake to comply with the rules and regulations, Code of Conduct and disciplinary code of Al-Asr Educational Institute, and to ensure my child/ward complies therewith.",
    "c) Accept that if the School Disciplinary Committee finds my child/ward guilty of serious misconduct as described in the School Code of Conduct, he/she may be suspended or expelled.",
    "d) Hold myself/ourselves accountable for prompt payment of Al-Asr Educational Institute fees and related charges.",
    "e) Recognize that this contract is binding on the Parent/Guardian upon electronic acceptance and remains subject to School authorization requirements.",
    "",
    "3. Indemnity & Medical Consent",
    "I give permission for the learner to participate in curricular and extra-curricular activities of Al-Asr Educational Institute, including necessary excursions.",
    "I accept that responsible precautions will be taken to ensure learner safety and welfare, and that I remain responsible for payment of medical and/or hospital accounts, where applicable.",
    "I indemnify and hold Al-Asr Educational Institute and its staff harmless against claims arising from injury, damage or loss sustained in the course of such participation.",
    "I cede my power as Parent/Guardian to the Principal of Al-Asr Educational Institute or their designated representative should medical treatment/surgery be deemed necessary where I cannot be reached immediately.",
    "",
    "4. Fee Payment Agreement",
    "The monthly fee for the above-mentioned learner will be confirmed on acceptance. The Parent/Guardian undertakes to pay fees according to the selected payment term.",
].join("\n");

const stableStringify = (value: unknown): string => {
    if (value === null || typeof value !== "object") {
        return JSON.stringify(value);
    }

    if (Array.isArray(value)) {
        return `[${value.map((item) => stableStringify(item)).join(",")}]`;
    }

    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
    const body = entries
        .map(([key, val]) => `${JSON.stringify(key)}:${stableStringify(val)}`)
        .join(",");

    return `{${body}}`;
};

export async function POST(request: NextRequest) {
    try {
        const payload = (await request.json()) as Record<string, unknown>;
        if (!payload || typeof payload !== "object") {
            return NextResponse.json({ success: false, error: "Invalid JSON payload" }, { status: 400 });
        }

        const allData = (payload.allData ?? {}) as Record<string, unknown>;
        const auditLog = (payload.audit_log ?? {}) as Record<string, unknown>;

        const honeypot = allData.website_url ?? "";
        const startTime = Number(payload.form_start_time ?? 0);
        const currentTime = Date.now();

        const remoteIp = request.headers.get("x-real-ip") || "";
        if (honeypot) {
            console.warn("[ALASR_AUDIT] applications.route honeypot_triggered", { remoteIp });
            return NextResponse.json({ success: true, message: "Processing..." });
        }

        if (startTime > 0 && currentTime - startTime < 5000) {
            console.warn("[ALASR_AUDIT] applications.route timing_block", {
                remoteIp,
                elapsedMs: currentTime - startTime,
            });
            return NextResponse.json(
                { success: false, error: "Submission too fast. Please take your time." },
                { status: 403 }
            );
        }

        const serverTimestamp = new Date().toISOString();
        const xForwardedFor = sanitizeHeader(request.headers.get("x-forwarded-for") || "");
        const cfConnectingIp = sanitizeHeader(request.headers.get("cf-connecting-ip") || "");
        const forwarded = sanitizeHeader(request.headers.get("forwarded") || "");

        const year = new Date().getFullYear();
        const randomSuffix = Math.floor(Math.random() * 99999 + 1)
            .toString()
            .padStart(5, "0");
        const serialNumber = `ALASR-${year}-${randomSuffix}`;

        payload.allData = allData;
        allData.reference = serialNumber;

        payload.audit_log = auditLog;
        auditLog.reference = serialNumber;
        auditLog.serverTimestamp = serverTimestamp;
        auditLog.network = {
            remote_ip: sanitizeHeader(remoteIp),
            x_forwarded_for: xForwardedFor,
            cf_connecting_ip: cfConnectingIp,
            forwarded,
            server_received_at: serverTimestamp,
        };

        const parentEmail = String(allData.parent1Email ?? "").trim();
        if (!parentEmail) {
            return NextResponse.json(
                { success: false, error: "Missing Parent/Guardian email for contract package delivery." },
                { status: 422 }
            );
        }

        const termsVersion = String(auditLog.termsVersion || "v1.0").trim() || "v1.0";
        let termsSha256 = String(auditLog.termsSha256 || "").trim().toLowerCase();

        const termsTextSnapshot = String(auditLog.termsTextSnapshot || FULL_TERMS_AND_CONDITIONS);

        if (!/^[a-f0-9]{64}$/.test(termsSha256)) {
            termsSha256 = createHash("sha256").update(termsTextSnapshot).digest("hex");
        }

        auditLog.termsVersion = termsVersion;
        auditLog.termsSha256 = termsSha256;
        auditLog.termsTextSnapshot = termsTextSnapshot;

        const signatureIntent = "I intend my electronic acceptance and typed full name to constitute my signature for this agreement.";
        const parties = {
            school: "Al-Asr Educational Institute",
            parentPrimary: `${String(allData.parent1FirstName ?? "")} ${String(allData.parent1Surname ?? "")}`.trim(),
            parentSecondary: `${String(allData.parent2FirstName ?? "")} ${String(allData.parent2Surname ?? "")}`.trim(),
            learner: `${String(allData.learnerName ?? allData.learnerFirstName ?? "")} ${String(allData.learnerSurname ?? "")}`.trim(),
        };

        const largeFileThresholdBytes = 3 * 1024 * 1024;
        const inlineImageMaxBytes = 2 * 1024 * 1024;
        const annexures = ((payload.files as any[]) || []).map((fileItem, index) => {
            const size = Number(fileItem.size || 0);
            const mimeType = String(fileItem.mimeType || "application/octet-stream").toLowerCase();
            const isImage = mimeType.startsWith("image/");
            const isLarge = size > largeFileThresholdBytes;
            const embedInPdf = isImage && size > 0 && size <= inlineImageMaxBytes;

            return {
                index: index + 1,
                field: String(fileItem.field || `file_${index}`),
                title: String(fileItem.field || `file_${index}`)
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase()),
                fileName: String(fileItem.name || `document_${index}`),
                mimeType,
                sizeBytes: size,
                sha256: createHash("sha256").update(fileItem.data || "").digest("hex"),
                status: "Captured - Pending Audit",
                isImage,
                embedInPdf,
                deliveryMode: isLarge ? "download_link" : "inline_or_attachment",
                largeFile: isLarge,
            };
        });

        const contractSnapshot = {
            reference: serialNumber,
            generatedAt: serverTimestamp,
            parties,
            feePaymentTerm: String(payload.feePaymentTerm ?? allData.feeTerm ?? ""),
            typedSignature: String(allData.typedFullName ?? ""),
            signatureIntent,
            termsVersion,
            termsSha256,
            termsTextSnapshot,
            auditSummary: {
                serverTimestamp,
                network: auditLog.network,
                clientTimestamp: String(auditLog.timestamp ?? ""),
                userAgent: String(auditLog.userAgent ?? ""),
            },
            branding: {
                logoUrl: "/images/alasr-logo-new.png",
                header: "Al-Asr Educational Institute",
                footer: "This document forms part of the legally binding admissions contract.",
            },
            submittedFields: allData,
            siblings: Array.isArray(payload.siblings) ? payload.siblings : [],
            annexures,
            documentHandlingPolicy: {
                embedImagesInPdf: true,
                nonImageDocumentsMode: "download_link_when_large_or_non_image",
                largeFileThresholdBytes,
                inlineImageMaxBytes,
            },
        };

        const canonicalContract = stableStringify(contractSnapshot);
        const pdfSha256 = createHash("sha256").update(canonicalContract).digest("hex");

        payload.reference = serialNumber;
        payload.generatedAt = serverTimestamp;
        payload.signature_intent = signatureIntent;
        payload.parties = parties;
        payload.audit_summary = contractSnapshot.auditSummary;
        payload.branding = contractSnapshot.branding;
        payload.terms_text_snapshot = termsTextSnapshot;
        payload.terms_version = termsVersion;
        payload.terms_sha256 = termsSha256;
        payload.pdf_sha256 = pdfSha256;

        payload.contract_package = {
            format: "pdf",
            renderer: "google_workspace_server_side",
            sourceFormat: "canonical_json",
            sourceContent: contractSnapshot,
            pdf_sha256: pdfSha256,
            required: true,
            requiredElements: {
                fullSubmittedFields: true,
                legalTextSnapshot: true,
                signatureIntent: true,
                referenceAndTimestamp: true,
                auditSummary: true,
                approvedBranding: true,
                contractingParties: true,
                annexuresIndex: true,
            },
        };

        payload.email_package = {
            required: true,
            to: parentEmail,
            subject: `Al-Asr Application Contract Package — ${serialNumber}`,
            includeReferenceInBody: true,
            includeSubmissionTimestampInBody: true,
            includeTermsVersionAndHashInBody: true,
            attachContractPdf: true,
            deliveryAuditRequired: true,
            documentDeliveryPolicy: {
                embedImagesInPdf: true,
                preferDownloadLinksForLargeOrNonImageFiles: true,
                largeFileThresholdBytes,
                includeAnnexureIndexWithHashes: true,
            },
        };


        auditLog.pdfSha256 = pdfSha256;
        auditLog.contractPackagePreparedAt = serverTimestamp;
        auditLog.deliveryPolicy = {
            retentionTargetYears: 5,
            emailDeliveryAuditRequired: true,
        };

        const googleResponse = await fetch(GOOGLE_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            redirect: "follow",
            cache: "no-store",
        });

        const text = await googleResponse.text();
        if (!text) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Google Workspace returned an empty response. This usually indicates a timeout or script error on the Google side.",
                },
                { status: 502 }
            );
        }

        try {
            const data = JSON.parse(text);
            return NextResponse.json(data, { status: googleResponse.ok ? 200 : 502 });
        } catch {
            return NextResponse.json({ success: false, error: "Invalid response from Google relay." }, { status: 502 });
        }
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown server error",
            },
            { status: 500 }
        );
    }
}
