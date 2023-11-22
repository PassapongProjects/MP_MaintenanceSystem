<?php
require '../connection.php';
session_start();
if(!isset($_SESSION['usid'])) {header("refresh:0; url=../logout.php"); exit;}
if($_SESSION['usrank'] < 2) {
    header('Content-Type: text/html; charset=utf-8');
    header("refresh:0; url=../welcome.php?informstatus=" . urlencode("ไม่อนุญาตให้เข้าถึง"));
    exit;}
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

// Check ONLY for VERSION
    // Handle Invalid Data Sent
if(!isset($_POST['newPlanData'])){
    $response['status'] = false;
    $response['message'] = "Invalid Data";
    echo json_encode($response);
    $conn->close();
    exit;
}

function generateUniqueID() {
    $timestamp = time(); // Current timestamp
    $randomNumber = mt_rand(1000, 9999); // Random 4-digit number
    
    $uniqueID = "PM-" . date("ymd-His", $timestamp) . "-" . $randomNumber;
    
    return $uniqueID;
}
//Stmt for pm_plan
$data = json_decode($_POST['newPlanData'], true);
$updating = ($_POST['updating'] == "false") ? false : true;
// Extract data for the 'pm_plan' table
$planName = $data['planName'];
$planDesc = $data['planDesc'];
$planInterval = $data['planInterval'];
$intervalUnit = $data['intervalUnit'];
$partReqVal = $data['partReqVal'];
$userId = mysqli_real_escape_string($conn,$_SESSION['usid']);

if($updating){
    $planID = mysqli_real_escape_string($conn,$_POST['pmCode']);
}else{$planID = generateUniqueID();}


// Prepare SQL statement for 'pm_plan' table
if ($updating){
    $planSql = "UPDATE pm_plan SET `name` = ?, interv = ?, interv_unit = ?, plan_description = ?, part_req =?, l_vers = l_vers+1 WHERE `id` = ?;";
    $planStmt = $conn->prepare($planSql);
    $planStmt->bind_param("sissis",$planName, $planInterval,$intervalUnit,$planDesc,$partReqVal, $planID);
    $planStmt->execute();

    $planDetailInsert = "INSERT INTO pm_plan_ver_detail (fk_plan_id, ver, edit_date, fk_editor, `name`, interv, interv_unit, plan_description, part_req) VALUE (?, (SELECT l_vers FROM pm_plan WHERE `id` = ?), NOW(),?,?,?,?,?,?);";
    $planDetailStmt = $conn->prepare($planDetailInsert);
    $planDetailStmt->bind_param("ssisissi",$planID, $planID, $userId,$planName,$planInterval,$intervalUnit,$planDesc,$partReqVal);
    $planDetailStmt->execute();

    // update Current Job Version
    $updateJobVersion = "UPDATE pm_job SET plan_ver = (SELECT l_vers FROM pm_plan WHERE `id` = ?) WHERE fk_plan_id = ?;";
    $updateJobStmt = $conn->prepare($updateJobVersion);
    $updateJobStmt->bind_param("ss",$planID,$planID);
    $updateJobStmt->execute();

}else{
    $planSql = "INSERT INTO pm_plan (id,`name`, interv, interv_unit, plan_description, part_req) VALUES (?, ?, ?, ?, ?, ?);";
    $planStmt = $conn->prepare($planSql);
    $planStmt->bind_param("ssissi", $planID,$planName, $planInterval,$intervalUnit,$planDesc,$partReqVal); //partReqVal is boolean (idicating is the plan require spare part or not)
    $planStmt->execute();

    $planDetailInsert = "INSERT INTO pm_plan_ver_detail (fk_plan_id, ver, edit_date, fk_editor, `name`, interv, interv_unit, plan_description, part_req) VALUE (?, 1, NOW(),?,?,?,?,?,?);";
    $planDetailStmt = $conn->prepare($planDetailInsert);
    $planDetailStmt->bind_param("sisissi",$planID, $userId,$planName,$planInterval,$intervalUnit,$planDesc,$partReqVal);
    $planDetailStmt->execute();
}

//Stmt for pm_plan_items

$items = $data['items'];
foreach ($items as $item) {
    $itemName = $item['name'];
    $workMethod = $item['workMethod'];
    $standard = $item['standard'];

    $clean = $item['checkboxes']['clean'] ? 1 : 0;
    $test = $item['checkboxes']['test'] ? 1 : 0;
    $replace = $item['checkboxes']['replace'] ? 1 : 0;
    $torque = $item['checkboxes']['torque'] ? 1 : 0;
    $overhaul = $item['checkboxes']['overhaul'] ? 1 : 0;
    $check = $item['checkboxes']['check'] ? 1 : 0;
    $oil = $item['checkboxes']['oil'] ? 1 : 0;


    // Prepare SQL statement for 'pm_plan_items' table
    if($updating){
        $itemsSql = "INSERT INTO pm_plan_items (fk_plan_id, ck_topic, work_mthd, std_check, dt_clean, dt_test, dt_replace, dt_torque, dt_ovhaul, dt_check, dt_oil,ver) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, (SELECT l_vers FROM pm_plan WHERE `id` = ?));";
        $itemsStmt = $conn->prepare($itemsSql);
        $itemsStmt->bind_param("ssssiiiiiiis", $planID,$itemName,$workMethod,$standard,$clean,$test,$replace,$torque,$overhaul,$check,$oil,$planID);
        $itemsStmt->execute();
    }else{ // New Plan
    $itemsSql = "INSERT INTO pm_plan_items (fk_plan_id, ck_topic, work_mthd, std_check, dt_clean, dt_test, dt_replace, dt_torque, dt_ovhaul, dt_check, dt_oil) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
    $itemsStmt = $conn->prepare($itemsSql);
    $itemsStmt->bind_param("ssssiiiiiii", $planID,$itemName,$workMethod,$standard,$clean,$test,$replace,$torque,$overhaul,$check,$oil);
    $itemsStmt->execute();
    }
}

// Handle Part Items
if ($partReqVal == 1) {
$parts = $data['parts'];
foreach ($parts as $part) {
    $partId = intval($part['partId']);
    $reqQuan = floatval($part['reqQuan']);

    if($updating){
    $partSql = "INSERT INTO pm_plan_part_junc (fk_plan_id, fk_part_id, req_quan,ver) VALUE (?, ?, ?, (SELECT l_vers FROM pm_plan WHERE `id` = ?));";
    $partStmt = $conn->prepare($partSql);
    $partStmt->bind_param("sids",$planID,$partId,$reqQuan,$planID);
    $partStmt->execute();

    }else{
    $partSql = "INSERT INTO pm_plan_part_junc (fk_plan_id, fk_part_id, req_quan) VALUE (?, ?, ?);";
    $partStmt = $conn->prepare($partSql);
    $partStmt->bind_param("sid",$planID,$partId,$reqQuan);
    $partStmt->execute();
    }
    $partStmt->close();
}

}


if($planStmt && $itemsStmt){

$response['status'] = true;
$response['message'] = "GO";
echo json_encode($response);
$planStmt->close();
$planDetailStmt->close();
$itemsStmt->close();
$conn->close();
exit;
}else{
    $response['status'] = false;
    $response['message'] = "Unsuccessful Query";
    echo json_encode($response);
    $conn->close();
    exit;
}


}else{
    $conn->close();
    header("refresh:0; url=../logout.php");}


//Check if Plan id Already exist (When an ajax is called from button )

?>