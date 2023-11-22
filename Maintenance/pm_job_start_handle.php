<?php
require '../connection.php';
// Post PM-Code must be provided
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

if(!isset($_POST['pmCode'])) {
    $response['status'] = false;
    echo json_encode($response);
    exit;
}else {
    $pmCode = $_POST['pmCode'];
}

$startSql = "UPDATE pm_job SET act_date = NOW(), `status` = 'processing' WHERE pm_code = ?;";
$startStmt = $conn->prepare($startSql);
$startStmt->bind_param("s",$pmCode);
if($startStmt->execute()) {
    $response['status'] = true;
}else {
    $response['status'] = false;
}
$startStmt->close();
$conn->close();
echo json_encode($response);
}
?>