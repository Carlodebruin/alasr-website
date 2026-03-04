<?php
// Al-Asr Educational Institute - Application Backend (v2.0)
// Refactored to handle split fields, individual documents, and Clickwrap Audit Trail.

error_reporting(0);
ini_set('display_errors', '0');

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

try {
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    throw new Exception('Method not allowed', 405);
  }

  // 0. Spam Protection & Time Check
  $honeypot = $_POST['website_url'] ?? '';
  $startTime = $_POST['form_start_time'] ?? 0;
  $currentTime = time() * 1000;

  if (!empty($honeypot)) {
    echo json_encode(['success' => true, 'message' => 'Processing...']);
    exit;
  }

  if (($currentTime - (int)$startTime) < 5000) {
    throw new Exception('Submission too fast. Please take your time.', 403);
  }

  // 1. Generate Application Reference Number (ALASR-YYYY-XXXXX)
  $year = date('Y');
  $randomSuffix = str_pad(mt_rand(1, 99999), 5, '0', STR_PAD_LEFT);
  $serialNumber = "ALASR-$year-$randomSuffix";

  // 2. Data Mapping (New Fields)
  $academicYear = $_POST['academicYear'] ?? date('Y');
  $lTitle = $_POST['learnerTitle'] ?? '';
  $lSurname = $_POST['learnerSurname'] ?? 'N/A';
  $lNames = $_POST['learnerFirstName'] ?? 'N/A';
  $lKnownAs = $_POST['learnerKnownAs'] ?? '';

  $learnerFullName = trim("$lTitle $lNames $lSurname");
  if ($lKnownAs)
    $learnerFullName .= " (Known as: $lKnownAs)";

  $dob = $_POST['dob'] ?? 'N/A';
  $learnerId = $_POST['learnerId'] ?? 'N/A';
  $grade = $_POST['grade'] ?? 'N/A';
  $homeLanguage = $_POST['homeLanguage'] ?? 'N/A';

  $learnerCity = $_POST['learnerCity'] ?? '';
  $pAddress = $_POST['learnerPhysicalAddress'] ?? 'N/A';
  if ($learnerCity)
    $pAddress .= ", $learnerCity";
  $postAddress = $_POST['learnerPostalAddress'] ?? 'N/A';
  $learnerPostalCity = $_POST['learnerPostalCity'] ?? '';
  if ($learnerPostalCity)
    $postAddress .= ", $learnerPostalCity";
  $postCode = $_POST['learnerPostalCode'] ?? 'N/A';

  // Parent 1
  $p1Title = $_POST['parent1Title'] ?? '';
  $p1Surname = $_POST['parent1Surname'] ?? 'N/A';
  $p1Names = $_POST['parent1FirstName'] ?? 'N/A';
  $p1KnownAs = $_POST['parent1KnownAs'] ?? '';
  $parent1FullName = trim("$p1Title $p1Names $p1Surname");

  $parent1Id = $_POST['parent1Id'] ?? 'N/A';

  $parent1Rel = $_POST['parent1Rel'] ?? 'N/A';
  $parent1Marital = $_POST['parent1MaritalStatus'] ?? 'N/A';
  $parent1Occupation = $_POST['parent1Occupation'] ?? 'N/A';
  $parent1Employer = $_POST['parent1Employer'] ?? 'N/A';
  $parent1Mobile = $_POST['parent1Mobile'] ?? 'N/A';
  $parent1Email = $_POST['parent1Email'] ?? 'N/A';
  $parent1Work = $_POST['parent1WorkPhone'] ?? 'N/A';
  $parent1Home = $_POST['parent1HomePhone'] ?? 'N/A';

  // Parent 2
  $p2Title = $_POST['parent2Title'] ?? '';
  $p2Surname = $_POST['parent2Surname'] ?? '';
  $p2Names = $_POST['parent2FirstName'] ?? '';
  $parent2FullName = trim("$p2Title $p2Names $p2Surname");

  $parent2Id = $_POST['parent2Id'] ?? 'N/A';

  $parent2Rel = $_POST['parent2Rel'] ?? 'N/A';
  $parent2Mobile = $_POST['parent2Mobile'] ?? 'N/A';
  $parent2Email = $_POST['parent2Email'] ?? 'N/A';

  // Fee Payer
  $feeResponsible = $_POST['feeResponsible'] ?? 'N/A';
  if ($feeResponsible === "Other")
    $feeResponsible .= " (" . ($_POST['feeResponsibleOther'] ?? 'N/A') . ")";
  $feePaymentTerm = $_POST['feePaymentTerm'] ?? 'N/A';
  $debitDate = $_POST['debitOrderDate'] ?? '';

  // Medical
  $allergies = $_POST['allergies'] ?? 'None';
  $disabilities = $_POST['disabilities'] ?? 'None';
  $emergencyName = $_POST['emergencyName'] ?? 'N/A';
  $emergencyRel = $_POST['emergencyRel'] ?? 'N/A';
  $emergencyPhone1 = $_POST['emergencyPhone'] ?? 'N/A';
  $emergencyPhone2 = $_POST['emergencyPhone2'] ?? 'N/A';

  // Audit Log
  $auditJson = $_POST['audit_log'] ?? '{}';
  $audit = json_decode($auditJson, true);

  // 3. Email Configuration
  $adminEmails = ['reception@alasr.co.za', 'cassim@alasr.co.za', 'admin@alasr.co.za'];
  $allRecipients = array_unique(array_merge($adminEmails, [$parent1Email]));

  $subject = "Al-Asr Application: $serialNumber - $lSurname, $lNames (Grade $grade)";

  // 4. Build Letterhead HTML Body
  $htmlBody = "
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f9fafb; }
      .letterhead { max-width: 800px; margin: 20px auto; background: #fff; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
      .top-bar { height: 8px; background: #004d99; }
      .header { padding: 40px; border-bottom: 2px solid #f3f4f6; position: relative; }
      .logo-txt { font-size: 24px; font-weight: 800; color: #004d99; text-transform: uppercase; margin: 0; }
      .school-info { font-size: 11px; color: #6b7280; margin-top: 5px; }
      .ref-badge { position: absolute; top: 40px; right: 40px; background: #eff6ff; color: #1e40af; padding: 8px 15px; border-radius: 6px; font-family: monospace; font-weight: bold; border: 1px solid #dbeafe; }
      
      .content { padding: 40px; }
      h2 { color: #111827; font-size: 20px; border-bottom: 2px solid #004d99; padding-bottom: 8px; margin-bottom: 20px; }
      
      .data-grid { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
      .data-grid td { padding: 10px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
      .label { width: 30%; font-size: 12px; font-weight: bold; color: #4b5563; text-transform: uppercase; }
      .value { width: 70%; font-size: 14px; color: #111827; }
      
      .audit-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; font-size: 12px; color: #64748b; }
      .footer { padding: 20px 40px; background: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center; font-size: 11px; color: #9ca3af; }
    </style>
  </head>
  <body>
    <div class='letterhead'>
      <div class='top-bar'></div>
      <div class='header'>
        <div class='logo-txt'>Al-Asr Educational Institute</div>
        <div class='school-info'>
          370 Ganges Street, Claudius, Centurion<br>
          Tel: +27 12 374 5546 | Email: admin@alasr.co.za
        </div>
        <div class='ref-badge'>$serialNumber</div>
      </div>
      
      <div class='content'>
        <p style='margin-top: 0;'>New Admission Application for <strong>$learnerFullName</strong> (Grade $grade, $academicYear)</p>
        
        <h2>1. Learner Details</h2>
        <table class='data-grid'>
          <tr><td class='label'>Full Name</td><td class='value'>$learnerFullName</td></tr>
          <tr><td class='label'>ID / Passport</td><td class='value'>$learnerId</td></tr>
          <tr><td class='label'>Date of Birth</td><td class='value'>$dob</td></tr>
          <tr><td class='label'>Physical Address</td><td class='value'>$pAddress</td></tr>
          <tr><td class='label'>Postal Address</td><td class='value'>$postAddress ($postCode)</td></tr>
        </table>

        <h2>2. Parent / Guardian 1</h2>
        <table class='data-grid'>
          <tr><td class='label'>Name</td><td class='value'>$parent1FullName</td></tr>
          <tr><td class='label'>Relationship</td><td class='value'>$parent1Rel</td></tr>
          <tr><td class='label'>ID / Passport</td><td class='value'>$parent1Id</td></tr>
          <tr><td class='label'>Contact</td><td class='value'>M: $parent1Mobile | W: $parent1Work | H: $parent1Home</td></tr>
          <tr><td class='label'>Email</td><td class='value'>$parent1Email</td></tr>
          <tr><td class='label'>Employment</td><td class='value'>$parent1Occupation at $parent1Employer</td></tr>
        </table>";

  if ($parent2Names && $p2Surname) {
    $htmlBody .= "
        <h2>3. Parent / Guardian 2</h2>
        <table class='data-grid'>
          <tr><td class='label'>Name</td><td class='value'>$parent2FullName</td></tr>
          <tr><td class='label'>Relationship</td><td class='value'>$parent2Rel</td></tr>
          <tr><td class='label'>ID / Passport</td><td class='value'>$parent2Id</td></tr>
          <tr><td class='label'>Contact</td><td class='value'>$parent2Mobile</td></tr>
          <tr><td class='label'>Email</td><td class='value'>$parent2Email</td></tr>
        </table>";
  }

  $htmlBody .= "
        <h2>4. Financials & Management</h2>
        <table class='data-grid'>
          <tr><td class='label'>Fee Responsibility</td><td class='value'>$feeResponsible</td></tr>
          <tr><td class='label'>Payment Term</td><td class='value'>$feePaymentTerm " . ($debitDate ? "(Start: $debitDate)" : "") . "</td></tr>
        </table>

        <h2>5. Medical & Emergency</h2>
        <table class='data-grid'>
          <tr><td class='label'>Allergies</td><td class='value'>$allergies</td></tr>
          <tr><td class='label'>Disabilities</td><td class='value'>$disabilities</td></tr>
          <tr><td class='label'>Emergency Contact</td><td class='value'>$emergencyName ($emergencyRel)</td></tr>
          <tr><td class='label'>Emergency Phone</td><td class='value'>$emergencyPhone1 / $emergencyPhone2</td></tr>
        </table>

        <div class='audit-box'>
          <strong>Legal Acceptance Audit Trail</strong><br>
          Submitted on: " . ($audit['timestamp'] ?? date('c')) . "<br>
          IP Address: " . $_SERVER['REMOTE_ADDR'] . "<br>
          User Agent: " . htmlspecialchars($audit['userAgent'] ?? 'Unknown') . "<br>
          Terms Version: " . ($audit['termsVersion'] ?? 'v1.0') . "<br>
          Checkbox Log: " . json_encode($audit['checkboxLogs'] ?? []) . "
        </div>
      </div>
      
      <div class='footer'>
        Copyright &copy; " . date('Y') . " Al-Asr Educational Institute. All Rights Reserved. Reference: $serialNumber
      </div>
    </div>
  </body>
  </html>";

  // 5. Handle File Attachments
  $boundary = md5(time());
  $headers = "From: Al-Asr Admissions <no-reply@alasr.co.za>\r\n";
  $headers .= "Reply-To: $parent1Email\r\n";
  $headers .= "MIME-Version: 1.0\r\n";
  $headers .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n";

  $attachmentsBuffer = "";
  $allDocs = ['docBirthCert', 'docReportCard', 'docClinicCard', 'docParentId', 'docResidence', 'docTransferCard', 'docPermit'];

  foreach ($allDocs as $field) {
    if (isset($_FILES[$field]) && $_FILES[$field]['error'] === UPLOAD_ERR_OK) {
      $fileName = $_FILES[$field]['name'];
      $fileTmp = $_FILES[$field]['tmp_name'];
      $fileType = $_FILES[$field]['type'];

      $content = file_get_contents($fileTmp);
      if ($content !== false) {
        $encoded = chunk_split(base64_encode($content));
        $attachmentsBuffer .= "--$boundary\r\n";
        $attachmentsBuffer .= "Content-Type: $fileType; name=\"$fileName\"\r\n";
        $attachmentsBuffer .= "Content-Disposition: attachment; filename=\"$fileName\"\r\n";
        $attachmentsBuffer .= "Content-Transfer-Encoding: base64\r\n\r\n";
        $attachmentsBuffer .= $encoded . "\r\n";
      }
    }
  }

  // Body Construction
  $body = "--$boundary\r\n";
  $body .= "Content-Type: text/html; charset=UTF-8\r\n";
  $body .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
  $body .= $htmlBody . "\r\n";
  $body .= $attachmentsBuffer;
  $body .= "--$boundary--";

  // 6. Send Email
  $to = implode(',', $allRecipients);
  if (@mail($to, $subject, $body, $headers)) {
    echo json_encode(['success' => true, 'message' => 'Application received', 'ref' => $serialNumber]);
  }
  else {
    throw new Exception('Mail sending failed.');
  }

}
catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}