<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  // Get JSON input
  $json = file_get_contents('php://input');
  $data = json_decode($json, true);

  if (!$data) {
    // Fallback to POST fields
    $data = $_POST;
  }

  $name = $data['name'] ?? '';
  $email = $data['email'] ?? '';
  $message = $data['message'] ?? '';
  $honeypot = $data['website_url'] ?? '';
  $startTime = (int)($data['form_start_time'] ?? 0);
  $currentTime = time() * 1000;

  if (!empty($honeypot)) {
    error_log('[ALASR_AUDIT] contact.php honeypot_triggered ip=' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
    echo json_encode(['success' => true, 'message' => 'Processing...']);
    exit;
  }

  if ($startTime > 0 && ($currentTime - $startTime) < 2000) {
    error_log('[ALASR_AUDIT] contact.php timing_block ip=' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . ' elapsed_ms=' . ($currentTime - $startTime));
    http_response_code(403);
    echo json_encode(['error' => 'Submission too fast. Please try again.']);
    exit;
  }

  if (empty($name) || empty($email) || empty($message)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
  }

  // Recipients
  $to = 'reception@alasr.co.za, admin@alasr.co.za';
  $subject = "Contact Form: $name";

  // Headers
  $headers = "From: Al-Asr Website <no-reply@alasr.co.za>\r\n";
  $headers .= "Reply-To: $email\r\n";
  $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
  $headers .= "Content-Type: text/html; charset=UTF-8\r\n";

  // Email Body
  $emailBody = "
    <html>
    <head>
      <title>New Contact Message</title>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
        .label { font-weight: bold; color: #666; }
      </style>
    </head>
    <body>
      <div class='container'>
        <h2>New Message from Website</h2>
        <p><span class='label'>Name:</span> $name</p>
        <p><span class='label'>Email:</span> $email</p>
        <p><span class='label'>Message:</span><br/>" . nl2br(htmlspecialchars($message)) . "</p>
      </div>
    </body>
    </html>
    ";

  // Send Email
  $fromEmail = "no-reply@alasr.co.za";
  if (mail($to, $subject, $emailBody, $headers, "-f$fromEmail")) {
    echo json_encode(['success' => true, 'message' => 'Message sent successfully']);
  }
  else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to send message. Please try again later.']);
  }
}
else {
  http_response_code(405);
  echo json_encode(['error' => 'Method not allowed']);
}