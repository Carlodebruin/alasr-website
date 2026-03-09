<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');

$to = "admin@alasr.co.za"; // Testing with school admin
$subject = "TEST EMAIL - Al-Asr Server Check";
$message = "This is a test email to verify if the PHP mail() function is working on the Al-Asr server.\nTimestamp: " . date('Y-m-d H:i:s');
$headers = "From: no-reply@alasr.co.za\r\n" .
    "Reply-To: admin@alasr.co.za\r\n" .
    "X-Mailer: PHP/" . phpversion();

echo "Attempting to send mail to $to...<br>";

if (mail($to, $subject, $message, $headers)) {
    echo "SUCCESS: The mail() function returned true.";
}
else {
    echo "FAILURE: The mail() function returned false. Check server mail logs.";
}
?>
