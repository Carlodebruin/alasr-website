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

try {
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    throw new Exception('Method not allowed', 405);
  }

  // Get the JSON payload from the request body
  $jsonInput = file_get_contents('php://input');
  $payload = json_decode($jsonInput, true);

  if (!$payload) {
    throw new Exception('Invalid JSON payload');
  }

  // 0. Spam Protection & Time Check
  $honeypot = $payload['allData']['website_url'] ?? '';
  $startTime = $payload['form_start_time'] ?? 0;
  $currentTime = time() * 1000;

  if (!empty($honeypot)) {
    echo json_encode(['success' => true, 'message' => 'Processing...']);
    exit;
  }

  if (($currentTime - (int)$startTime) < 5000) {
    throw new Exception('Submission too fast. Please take your time.', 403);
  }

  // 1. Generate Application Reference Number
  $year = date('Y');
  $randomSuffix = str_pad(mt_rand(1, 99999), 5, '0', STR_PAD_LEFT);
  $serialNumber = "ALASR-$year-$randomSuffix";

  // Inject reference into payload for Google
  $payload['allData']['reference'] = $serialNumber;

  // 2. Forward to Google Web App via cURL
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

  // 3. Pass Google's response back to the frontend
  echo $response;

}
catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}