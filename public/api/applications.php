<?php
// Al-Asr Educational Institute - Secure Google Vault Relay (v3.0)
// This script contains NO SENSITIVE DATA storage and NO MAILING LOGIC.
// It acts strictly as a sterile bridge to a secure Google Apps Script Web App.

error_reporting(0);
ini_set('display_errors', '0');

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$GOOGLE_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwGkDh1ELDC_b2ZGXXKFnRJ_q1d9jUbN_VtswGmz5GtKVpzy9jPHlIALm3C-QA0Ytfo/exec';

$FULL_TERMS_AND_CONDITIONS = implode("\n", [
  '1. Application Declaration',
  'I, the undersigned Parent/Guardian, confirm that all information provided in this application is true, complete and accurate. I understand that submission of this form does not guarantee acceptance.',
  '',
  '2. Enrollment Contract',
  'I, the undersigned Parent/Guardian of the learner named in this application:',
  'a) Hereby certify that the information provided in this application is true, complete and accurate.',
  'b) Undertake to comply with the rules and regulations, Code of Conduct and disciplinary code of Al-Asr Educational Institute, and to ensure my child/ward complies therewith.',
  'c) Accept that if the School Disciplinary Committee finds my child/ward guilty of serious misconduct as described in the School Code of Conduct, he/she may be suspended or expelled.',
  'd) Hold myself/ourselves accountable for prompt payment of Al-Asr Educational Institute fees and related charges.',
  'e) Recognize that this contract is binding on the Parent/Guardian upon electronic acceptance and remains subject to School authorization requirements.',
  '',
  '3. Indemnity & Medical Consent',
  'I give permission for the learner to participate in curricular and extra-curricular activities of Al-Asr Educational Institute, including necessary excursions.',
  'I accept that responsible precautions will be taken to ensure learner safety and welfare, and that I remain responsible for payment of medical and/or hospital accounts, where applicable.',
  'I indemnify and hold Al-Asr Educational Institute and its staff harmless against claims arising from injury, damage or loss sustained in the course of such participation.',
  'I cede my power as Parent/Guardian to the Principal of Al-Asr Educational Institute or their designated representative should medical treatment/surgery be deemed necessary where I cannot be reached immediately.',
  '',
  '4. Fee Payment Agreement',
  'The monthly fee for the above-mentioned learner will be confirmed on acceptance. The Parent/Guardian undertakes to pay fees according to the selected payment term.',
]);

$isAssocArray = function ($arr) {
  if (!is_array($arr)) {
    return false;
  }
  return array_keys($arr) !== range(0, count($arr) - 1);
};

$stableStringify = function ($value) use (&$stableStringify, $isAssocArray) {
  if ($value === null || is_scalar($value)) {
    return json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
  }

  if (is_array($value)) {
    if ($isAssocArray($value)) {
      ksort($value, SORT_STRING);
      $parts = [];
      foreach ($value as $k => $v) {
        $parts[] = json_encode((string)$k, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . ':' . $stableStringify($v);
      }
      return '{' . implode(',', $parts) . '}';
    }

    $parts = array_map(function ($item) use (&$stableStringify) {
          return $stableStringify($item);
        }
          , $value);

        return '[' . implode(',', $parts) . ']';
      }

      return json_encode((string)$value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    };

try {
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    throw new Exception('Method not allowed', 405);
  }

  // Get the JSON payload from the request body
  $jsonInput = file_get_contents('php://input');
  $payload = json_decode($jsonInput, true);

  if (!$payload || !is_array($payload)) {
    throw new Exception('Invalid JSON payload');
  }

  if (!isset($payload['allData']) || !is_array($payload['allData'])) {
    $payload['allData'] = [];
  }
  if (!isset($payload['audit_log']) || !is_array($payload['audit_log'])) {
    $payload['audit_log'] = [];
  }
  if (!isset($payload['siblings']) || !is_array($payload['siblings'])) {
    $payload['siblings'] = [];
  }
  if (!isset($payload['files']) || !is_array($payload['files'])) {
    $payload['files'] = [];
  }

  // 0. Spam Protection & Time Check
  $remoteIp = $_SERVER['REMOTE_ADDR'] ?? '';
  $honeypot = $payload['allData']['website_url'] ?? '';
  $startTime = $payload['form_start_time'] ?? 0;
  $currentTime = time() * 1000;

  if (!empty($honeypot)) {
    error_log('[ALASR_AUDIT] applications.php honeypot_triggered ip=' . ($remoteIp ?? 'unknown'));
    echo json_encode(['success' => true, 'message' => 'Processing...']);
    exit;
  }

  if (($currentTime - (int)$startTime) < 5000) {
    error_log('[ALASR_AUDIT] applications.php timing_block ip=' . ($remoteIp ?? 'unknown') . ' elapsed_ms=' . ($currentTime - (int)$startTime));
    throw new Exception('Submission too fast. Please take your time.', 403);
  }

  // 1) Capture immutable server-side network/audit evidence
  $serverTimestamp = gmdate('c');
  $forwardedFor = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '';
  $cfConnectingIp = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? '';
  $forwarded = $_SERVER['HTTP_FORWARDED'] ?? '';

  $sanitizeHeader = function ($value) {
    $clean = preg_replace('/[^a-zA-Z0-9,.:;=\s\-\[\]\(\)\/_]/', '', (string)$value);
    return substr(trim($clean), 0, 1024);
  };

  $networkAudit = [
    'remote_ip' => $sanitizeHeader($remoteIp),
    'x_forwarded_for' => $sanitizeHeader($forwardedFor),
    'cf_connecting_ip' => $sanitizeHeader($cfConnectingIp),
    'forwarded' => $sanitizeHeader($forwarded),
    'server_received_at' => $serverTimestamp,
  ];

  // 2. Generate Application Reference Number
  $year = date('Y');
  $randomSuffix = str_pad(mt_rand(1, 99999), 5, '0', STR_PAD_LEFT);
  $serialNumber = "ALASR-$year-$randomSuffix";

  // Inject reference into payload for Google
  $payload['allData']['reference'] = $serialNumber;
  $payload['audit_log']['reference'] = $serialNumber;
  $payload['audit_log']['serverTimestamp'] = $serverTimestamp;
  $payload['audit_log']['network'] = $networkAudit;

  // Validate/normalize terms metadata integrity
  $termsVersion = trim((string)($payload['audit_log']['termsVersion'] ?? 'v1.0'));
  $termsSha256 = strtolower(trim((string)($payload['audit_log']['termsSha256'] ?? '')));
  $termsTextSnapshot = trim((string)($payload['audit_log']['termsTextSnapshot'] ?? ''));

  if ($termsVersion === '') {
    $termsVersion = 'v1.0';
  }

  if ($termsTextSnapshot === '') {
    $termsTextSnapshot = $FULL_TERMS_AND_CONDITIONS;
  }

  if (!preg_match('/^[a-f0-9]{64}$/', $termsSha256)) {
    $termsSha256 = hash('sha256', $termsTextSnapshot);
  }

  $payload['audit_log']['termsVersion'] = $termsVersion;
  $payload['audit_log']['termsSha256'] = $termsSha256;
  $payload['audit_log']['termsTextSnapshot'] = $termsTextSnapshot;

  $parentEmail = trim((string)($payload['allData']['parent1Email'] ?? ''));
  if ($parentEmail === '') {
    throw new Exception('Missing Parent/Guardian email for contract package delivery.', 422);
  }

  // 3. Prepare Annexures & Handling Policy
  $largeFileThresholdBytes = 3 * 1024 * 1024;
  $inlineImageMaxBytes = 2 * 1024 * 1024;
  $annexures = [];
  $totalUploadBytes = 0;

  foreach ($payload['files'] as $index => $fileItem) {
    if (!is_array($fileItem)) {
      continue;
    }

    $name = (string)($fileItem['name'] ?? ('document_' . $index));
    $mimeType = strtolower((string)($fileItem['mimeType'] ?? 'application/octet-stream'));
    $field = (string)($fileItem['field'] ?? ('file_' . $index));
    $size = (int)($fileItem['size'] ?? 0);
    $base64Data = (string)($fileItem['data'] ?? '');
    $totalUploadBytes += max(0, $size);

    $binary = base64_decode($base64Data, true);
    $sha256 = $binary !== false ? hash('sha256', $binary) : hash('sha256', $base64Data);

    $isImage = strpos($mimeType, 'image/') === 0;
    $isLarge = $size > $largeFileThresholdBytes;
    $embedInPdf = $isImage && $size > 0 && $size <= $inlineImageMaxBytes;

    $annexures[] = [
      'index' => count($annexures) + 1,
      'field' => $field,
      'title' => ucfirst(str_replace('_', ' ', $field)),
      'fileName' => $name,
      'mimeType' => $mimeType,
      'sizeBytes' => $size,
      'sha256' => $sha256,
      'status' => 'Captured - Pending Audit',
      'isImage' => $isImage,
      'embedInPdf' => $embedInPdf,
      'deliveryMode' => $isLarge ? 'download_link' : 'inline_or_attachment',
      'largeFile' => $isLarge,
      'downloadLink' => null,
      'downloadLinkNote' => $isLarge
      ? 'Generated by Google Workspace relay at send-time. Include secure URL in contract email body.'
      : null,
    ];
  }

  // 4. Build Exhaustive Contract Snapshot (Hybrid B Model)
  $allData = $payload['allData'];
  $auditLog = $payload['audit_log'];
  $parties = [
    'school' => 'Al-Asr Educational Institute',
    'parentPrimary' => trim((string)($allData['parent1FirstName'] ?? '') . ' ' . (string)($allData['parent1Surname'] ?? '')),
    'parentSecondary' => trim((string)($allData['parent2FirstName'] ?? '') . ' ' . (string)($allData['parent2Surname'] ?? '')),
    'learner' => trim((string)($allData['learnerName'] ?? ($allData['learnerFirstName'] ?? '')) . ' ' . (string)($allData['learnerSurname'] ?? '')),
  ];
  $signatureIntent = 'I intend my electronic acceptance and typed full name to constitute my signature for this agreement.';

  $contractSnapshot = [
    'reference' => $serialNumber,
    'generatedAt' => $serverTimestamp,
    'parties' => $parties,
    'feePaymentTerm' => (string)($payload['feePaymentTerm'] ?? ($allData['feeTerm'] ?? '')),
    'typedSignature' => (string)($allData['typedFullName'] ?? ''),
    'signatureIntent' => $signatureIntent,
    'termsVersion' => $termsVersion,
    'termsSha256' => $termsSha256,
    'termsTextSnapshot' => $termsTextSnapshot,
    'auditSummary' => [
      'serverTimestamp' => $serverTimestamp,
      'network' => $networkAudit,
      'clientTimestamp' => (string)($auditLog['timestamp'] ?? ''),
      'userAgent' => (string)($auditLog['userAgent'] ?? ''),
    ],
    'branding' => [
      'logoUrl' => '/images/alasr-logo-new.png',
      'header' => 'Al-Asr Educational Institute',
      'footer' => 'This document forms part of the legally binding admissions contract.',
    ],
    'submittedFields' => $allData,
    'siblings' => $payload['siblings'],
    'annexures' => $annexures,
    'documentHandlingPolicy' => [
      'embedImagesInPdf' => true,
      'nonImageDocumentsMode' => 'download_link_when_large_or_non_image',
      'largeFileThresholdBytes' => $largeFileThresholdBytes,
      'inlineImageMaxBytes' => $inlineImageMaxBytes,
      'totalUploadBytes' => $totalUploadBytes,
    ],
  ];

  $canonicalContract = $stableStringify($contractSnapshot);
  $pdfSha256 = hash('sha256', $canonicalContract);

  // 5. Enrich Top-Level Payload for Google Relay (Exhaustive forwarding)
  // Promoting contract metadata to top-level for maximum compatibility
  $payload['reference'] = $serialNumber;
  $payload['generatedAt'] = $serverTimestamp;
  $payload['signature_intent'] = $signatureIntent;
  $payload['parties'] = $parties;
  $payload['audit_summary'] = $contractSnapshot['auditSummary'];
  $payload['branding'] = $contractSnapshot['branding'];
  $payload['terms_text_snapshot'] = $termsTextSnapshot;
  $payload['terms_version'] = $termsVersion;
  $payload['terms_sha256'] = $termsSha256;
  $payload['pdf_sha256'] = $pdfSha256;

  $payload['contract_package'] = [
    'format' => 'pdf',
    'renderer' => 'google_workspace_server_side',
    'sourceFormat' => 'canonical_json',
    'sourceContent' => $contractSnapshot,
    'pdf_sha256' => $pdfSha256,
    'required' => true,
    'requiredElements' => [
      'fullSubmittedFields' => true,
      'legalTextSnapshot' => true,
      'signatureIntent' => true,
      'referenceAndTimestamp' => true,
      'auditSummary' => true,
      'approvedBranding' => true,
      'contractingParties' => true,
      'annexuresIndex' => true,
    ],
  ];

  $payload['email_package'] = [
    'required' => true,
    'to' => $parentEmail,
    'subject' => 'Al-Asr Application Contract Package — ' . $serialNumber,
    'includeReferenceInBody' => true,
    'includeSubmissionTimestampInBody' => true,
    'includeTermsVersionAndHashInBody' => true,
    'attachContractPdf' => true,
    'deliveryAuditRequired' => true,
    'documentDeliveryPolicy' => [
      'embedImagesInPdf' => true,
      'preferDownloadLinksForLargeOrNonImageFiles' => true,
      'largeFileThresholdBytes' => $largeFileThresholdBytes,
      'includeAnnexureIndexWithHashes' => true,
    ],
  ];

  $payload['audit_log']['pdfSha256'] = $pdfSha256;
  $payload['audit_log']['contractPackagePreparedAt'] = $serverTimestamp;
  $payload['audit_log']['deliveryPolicy'] = [
    'retentionTargetYears' => 5,
    'emailDeliveryAuditRequired' => true,
    'largeFilesAsDownloadLinks' => true,
  ];



  // 3. Forward to Google Web App via cURL
  $ch = curl_init($GOOGLE_WEBHOOK_URL);
  curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
  curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // Apps Script redirects
  curl_setopt($ch, CURLOPT_POST, true);
  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
  curl_setopt($ch, CURLOPT_TIMEOUT, 60); // 60 seconds
  curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);

  $response = curl_exec($ch);
  $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  $error = curl_error($ch);
  curl_close($ch);

  if ($error) {
    throw new Exception('Relay failure: ' . $error);
  }

  if (empty($response)) {
    throw new Exception('Google Workspace returned an empty response. This usually indicates a timeout or script error on the Google side.');
  }

  // Optional: Log errors if Google returned success:false
  $googleResult = json_decode($response, true);
  if (isset($googleResult['success']) && !$googleResult['success']) {
  // Log locally if needed, but for now just pass back
  }

  // 4. Pass Google's response back to the frontend
  echo $response;

}
catch (Exception $e) {
  $code = (int)$e->getCode();
  if ($code < 400 || $code > 599) {
    $code = 500;
  }
  http_response_code($code);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}