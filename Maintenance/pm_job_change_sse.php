<?php
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
require '../connection.php';
// Send an SSE message with JSON data
$result = $conn->query("SELECT pm_code, `status` FROM pm_job;");
$response['result'] = $result->fetch_all(MYSQLI_ASSOC);
$response['event'] = "Reload"; // Optional event field (you can customize this)
// Encode the response as JSON
$data = json_encode($response);

// Send the SSE message
echo "data: $data\n\n";


ob_flush();
flush();
$conn->close();
exit
?>
