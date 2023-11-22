<?php
require '../connection.php';
// Post PM-Code must be provided
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if(!isset($_POST['pmCode'])) {header("refresh:0; url=../logout.php");}
    $pmCode = mysqli_real_escape_string($conn,$_POST['pmCode']);
    // Header Handle

    if(isset($_POST['versionCheck'])) {
        $latest_version = mysqli_fetch_assoc(mysqli_query($conn,"SELECT l_vers FROM pm_plan WHERE id = '{$pmCode}'"));
        echo $latest_version['l_vers'];
        exit;
    }


    if(!isset($_POST['version'])) {
        $ver = mysqli_fetch_assoc(mysqli_query($conn,"SELECT l_vers FROM pm_plan WHERE id = '{$pmCode}'"))['l_vers'];
    }else{
        $ver = $_POST['version'];
    }
  
    $headerSql = "SELECT
	pm_pvd.`name` AS plan_name,
	pm_pvd.interv AS interv,
	pm_pvd.interv_unit AS interv_unit,
	pm_pvd.plan_description AS plan_description,
	pm_pvd.part_req AS part_req,
	emp_editor.`name` AS editor,
	emp_approver.`name` AS approver,
    pm_pvd.edit_date AS edit_date
FROM
	pm_plan_ver_detail AS pm_pvd
	LEFT JOIN employee AS emp_editor ON pm_pvd.fk_editor = emp_editor.id
	LEFT JOIN employee AS emp_approver ON pm_pvd.fk_approver = emp_approver.id
WHERE fk_plan_id = '{$pmCode}' AND ver = {$ver};";

    $headerResult = mysqli_query($conn,$headerSql);
    // Handle JSON Encoding Data

    if(mysqli_num_rows($headerResult)==1){
        $response = mysqli_fetch_assoc($headerResult);
        $response['approver'] = is_null($response['approver']) ? "No approver" : $response['approver'];
        $response['pmCode'] = $pmCode;

    }else{
        $response['error'] = "Invalid pmCode";
        $conn->close();
        echo json_encode($response);
        exit; 
    }

    // This check should be passed only if called from pm_plan_management page, which has to check existing of mrCode
 

    // Items Handle
    
    $itemsSql =  "SELECT * FROM pm_plan_items WHERE fk_plan_id = ? AND `ver` = ?;";
    $itemsStmt = $conn->prepare($itemsSql);
    $itemsStmt->bind_param("si",$pmCode,$ver);
    $itemsStmt->execute();
    $itemsResult = $itemsStmt->get_result();
    $allItems = [];
    while ($eachItem = $itemsResult->fetch_assoc()){
        $allItems[] = $eachItem;
    }

    $response['items'] = $allItems;
    $itemsStmt->close();
    // Part Handle
    if($response['part_req'] ==1){

        if(isset($_POST['mrCheck']) && $_POST['mrCheck']) {
            if(!isset($_POST['pmJobCode'])) {exit; }else{
                $pmJobCode = mysqli_real_escape_string($conn,$_POST['pmJobCode']);
                // Query For mrCode
                $result = mysqli_query($conn,"SELECT mr_code AS mrCode, `status` AS mrCodeStatus, prio AS mrPrio FROM inven_requisted WHERE fk_job_id = (SELECT `id` FROM job_all WHERE fk_pm_no ='{$pmJobCode}');");
                if(mysqli_num_rows($result) >0) { // Already Requested for spare part
                    $allmrData = [];
                    $extramrCodeStr = [];
                    while($fetch = mysqli_fetch_assoc($result)){
                    $allmrData[$fetch['mrPrio']] = array("mrCode" =>$fetch['mrCode'],"mrCodeStatus"=>$fetch['mrCodeStatus']);
                    if ($fetch['mrPrio'] > 0){array_push($extramrCodeStr,$fetch['mrCode']);}
                    }
                    $response['mrCode'] = isset($allmrData[0]["mrCode"]) ? $allmrData[0]["mrCode"]: "undefined";
                    $response['mrCodeStatus'] = isset($allmrData[0]['mrCodeStatus']) ? $allmrData[0]['mrCodeStatus']: "undefined";
                    // Then check for what part id that has been requested.

                    $quotedExtraMrCodes = array_map(function($item) {
                        return "'" . $item . "'";
                    }, $extramrCodeStr);
                    $extramrCodeStr = implode(',',$quotedExtraMrCodes);

                    $allmrCodeStr = $extramrCodeStr.","."'".$response['mrCode']."'";
                    $allmrCodeStr = trim($allmrCodeStr,',');
                    // Main Part Requisition
                    $requestPartQuery = "SELECT inven_requisted_cart.fk_part_id AS partId, inven_requisted_cart.`status` AS reqStatus, inven_requisted_cart.fk_requisted_code AS mrCode, part.`name` AS part_name, part.spec AS part_spec FROM inven_requisted_cart LEFT JOIN part ON inven_requisted_cart.fk_part_id = part.id WHERE fk_requisted_code IN ({$allmrCodeStr});";
                    $requestedPartResult = mysqli_query($conn,$requestPartQuery);
                    if( $requestedPartResult && $requestedPartResult->num_rows >0) {
                        $requestedPartId = [];
                        while($reqId = $requestedPartResult->fetch_assoc()) {
                            $requestedPartId[$reqId['partId']] = array("reqStatus"=>$reqId['reqStatus'],"reqmrCode"=>$reqId['mrCode'],"part_name"=>$reqId['part_name'],"part_spec"=>$reqId['part_spec']);
                        }
                        $response['requestedPartId'] = $requestedPartId;

                    }else{$response['requestedPartId'] = [];}
                   


                }
            }
        }

        $partSql = "SELECT
        part.id AS part_id,
        part.name AS part_name,
        part.spec AS part_spec,
        part.unit AS part_unit,
        part.instock AS part_instock,
        pm_ppj.req_quan AS req_quan,
        pm_ppj.ver AS part_ver
    FROM
        pm_plan_part_junc AS pm_ppj
        LEFT JOIN part ON pm_ppj.fk_part_id = part.id
    WHERE
        pm_ppj.fk_plan_id = ?
        AND ver = ?;";

        $partStmt = $conn->prepare($partSql);
        $partStmt->bind_param("si",$pmCode,$ver);
        $partStmt->execute();
        $partResult = $partStmt->get_result();
        $allParts = [];
        while($eachPart = $partResult->fetch_assoc()){
            $allParts[] = $eachPart;
        }

        $response['parts'] = $allParts;
        $partStmt->close();
    }


    $conn->close();
    echo json_encode($response);
    exit;

}else{
    $response['error'] = "Invalid Request Method";
    $conn->close();
    exit;
}
// Retrieve PM - Header / PM Items / PM Parts






?>