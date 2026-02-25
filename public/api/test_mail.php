<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: text/plain');

$to = "admin@alasr.co.za"; // Default to admin
if (isset($_GET['to'])) {
    $to = $_GET['to'];
}

$subject = "Test Email from Al-Asr Website";
$message = "This is a test email to verify PHP mail functionality on the SiteWorx server.\n\nTime: " . date('Y-m-d H:i:s');
$headers = "From: Al-Asr Website <no-reply@alasr.co.za>\r\n";
$headers .= "Reply-To: no-reply@alasr.co.za\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

echo "Attempting to send email to: $to\n";
echo "From: no-reply@alasr.co.za\n\n";

if (mail($to, $subject, $message, $headers)) {
    echo "SUCCESS: PHP mail() function returned true.\n";
    echo "Check your spam folder if you don't see it in the inbox.";
} else {
    echo "FAILURE: PHP mail() function returned false.\n";
    echo "This usually indicates a server configuration issue.";
}
?>
