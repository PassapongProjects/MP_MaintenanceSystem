<?php
require '../connection.php';
session_start();
// Post PM-Code must be provided
if ($_SERVER['REQUEST_METHOD'] === 'POST') {


    function newPmJobNumber() {
        global $conn;
        $currentMonth = date('m');


// Prepare the SQL statement to fetch the latest Job_no for the current month
    $sql = "SELECT pm_code FROM pm_job WHERE SUBSTRING(pm_code, 4, 2) = ? ORDER BY pm_code DESC LIMIT 1;";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $currentMonth);
    $stmt->execute();
    $result = $stmt->get_result();

// Initialize the new job number counter
$newJobNumber = 1;

// Check if there is a previous Job_no for the current month
if ($result->num_rows > 0) {
    // Fetch the latest Job_no for the current month
    $latestJobNo = $result->fetch_assoc()['pm_code'];

    // Extract the job number (last 3 digits) from the latest Job_no
    $latestJobNumber = intval(substr($latestJobNo, 6));

    // Increment the job number by 1 to get the new job number
    $newJobNumber = $latestJobNumber + 1;
}

// Generate the new Job_no based on the rules (e.g., 06/031)
        $newJobNo = "PM-". sprintf("%02d", $currentMonth) . "/" . sprintf("%03d", $newJobNumber);
        return $newJobNo;
    }

    $response['status'] = false;
    if(!isset($_POST['pmJobInformation'])) { echo json_encode($response); exit;} 

    $pmJobInformation = json_decode($_POST['pmJobInformation'], true);
    if (!is_array($pmJobInformation) && !is_object($pmJobInformation)) {
        echo json_encode($response); exit;
    } 
   
    $recEng = mysqli_real_escape_string($conn,$_SESSION['usid']);
    $pmJobCode = mysqli_real_escape_string($conn,$pmJobInformation['pmJobCode']);

    function cleanUpMr($allJobId) { 
        global $conn;
        // Used to clear out empty mrCode that doest have any mrCart
        // For every mrCode Related to the job -> check if the cart exist or not -> remove inven requisted if not exist

        // Start a transaction
        $selectmrCode = "SELECT mr_code AS mrCode FROM inven_requisted WHERE fk_job_id = ?";
        $stmt = $conn->prepare($selectmrCode);
        $stmt->bind_param("i", $allJobId);
        $stmt->execute();
        $mrCodeResult = $stmt->get_result();
        
        while ($row = $mrCodeResult->fetch_assoc()) {
            $mrCode = $row['mrCode'];
        
            // Delete rows from "inven_requisted_cart"
            $deleteQuery = "DELETE FROM inven_requisted_cart WHERE fk_requisted_code = ? AND `status` != 'Issued'";
            $stmtDelete = $conn->prepare($deleteQuery);
            $stmtDelete->bind_param("s", $mrCode);
            $stmtDelete->execute();
            $stmtDelete->close();
        
            // Check if any related rows still exist in "inven_requisted_cart"
            $checkQuery = "SELECT COUNT(*) AS count FROM inven_requisted_cart WHERE fk_requisted_code = ?";
            $stmtCheck = $conn->prepare($checkQuery);
            $stmtCheck->bind_param("s", $mrCode);
            $stmtCheck->execute();
            $result = $stmtCheck->get_result();
        
            if ($result) {
                $row = $result->fetch_assoc();
                $rowCount = $row['count'];
        
                if ($rowCount == 0) {
                    // No related rows in "inven_requisted_cart", delete the row from "inven_requisted" table
                    $deleteMrQuery = "DELETE FROM inven_requisted WHERE mr_code = ?";
                    $stmtDeleteMr = $conn->prepare($deleteMrQuery);
                    $stmtDeleteMr->bind_param("s", $mrCode);
                    $stmtDeleteMr->execute();
                    $stmtDeleteMr->close();
                }
            }
        
            $stmtCheck->close();
        }
        
        $stmt->close();
        

    }

    function handleProblemItem($dataInformation,$recEng,$pmJobCode) {
        global $conn;
        // PlanItem(PI)
        $fk_pm_job_code = $pmJobCode;
        $ck_topic = !empty($dataInformation['item-topic']) ? $dataInformation['item-topic'] : "Unknown";
        $wk_method = !empty($dataInformation['item-work-mthd']) ? $dataInformation['item-work-mthd'] : "Unknown";
        $item_problem = !empty($dataInformation['item-problem']) ? $dataInformation['item-problem'] : "Unknown";
        $item_sol = !empty($dataInformation['item-solution']) ? $dataInformation['item-solution'] : "Unknown";
        $rec_eng = intval($recEng); // Assuming it's an integer
        $part_changed = !empty($dataInformation['part_changed']) ? intval($dataInformation['part_changed']): "NULL"; 
        $comple = !empty($dataInformation['comple']) ? intval($dataInformation['comple']) :0; // Assuming it's a boolean (0 or 1)
        $fk_item_id = !empty($dataInformation['item-id']) ? intval($dataInformation['item-id']) : "NULL"; // Assuming it's an integer
        $itm_type = $dataInformation['item-type'];

// Create the SQL INSERT statement
        $sql = "INSERT INTO pm_job_details (fk_pm_job_code, rec_date, ck_topic, wk_method, item_problem, item_sol, part_changed, comple, fk_item_id, itm_type) VALUES (?, NOW(), ?, ?, ?, ?, {$part_changed}, ?, {$fk_item_id}, ?);";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssssis", $fk_pm_job_code,$ck_topic, $wk_method, $item_problem, $item_sol, $comple, $itm_type);
        
        if ($stmt->execute()) {
            $stmt->close();
            return true;
        } else {
            $stmt->close();
            return false;
        }
    }

    function handleChangedPart($dataInformation,$recEng,$pmJobCode) {
        // ChangedPart(CP)
        global $conn;
        // CHECK if part issued or not -> if not return without doing anything -> other function will handle the rest
        $fk_pm_job_code = $pmJobCode;
        $ck_topic = !empty($dataInformation['item-topic']) ? $dataInformation['item-topic'] : "Unknown";
        $wk_method = !empty($dataInformation['item-work-mthd']) ? $dataInformation['item-work-mthd'] : "Unknown";
        $item_problem = !empty($dataInformation['item-problem']) ? $dataInformation['item-problem'] : "Unknown";
        $item_sol = !empty($dataInformation['item-solution']) ? $dataInformation['item-solution'] : "Unknown";
        $rec_eng = intval($recEng); // Assuming it's an integer
        $part_changed = !empty($dataInformation['part_changed']) ? intval($dataInformation['part_changed']): "NULL"; 
        $comple = !empty($dataInformation['comple']) ? intval($dataInformation['comple']) :0; // Assuming it's a boolean (0 or 1)
        $fk_item_id = !empty($dataInformation['item-id']) ? intval($dataInformation['item-id']) : "NULL"; // Assuming it's an integer
        $itm_type = $dataInformation['item-type'];
        // cpmrCode is an extra data for CP type
        $cpmrCode = (strtolower($dataInformation['mrCode']) !== "noreq") ? $dataInformation['mrCode'] : null;
        // main without requested
    
       if(strtolower($ck_topic) == "noissued") {
            return true; //Exit the function
        }else {
            // Normal Scenario -> Valid MR code and "noReq"
            $sql = "INSERT INTO pm_job_details (fk_pm_job_code, rec_date, ck_topic, wk_method, item_problem, item_sol, part_changed, comple, fk_item_id, itm_type, part_mr) VALUES (?, NOW(), ?, ?, ?, ?, {$part_changed}, ?, {$fk_item_id}, ?, ?);";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("sssssiss", $fk_pm_job_code,$ck_topic, $wk_method, $item_problem, $item_sol, $comple, $itm_type, $cpmrCode);
            
            if ($stmt->execute()) {
                $stmt->close();
                return true;
            } else {
                $stmt->close();
                return false;
            }
        }

    }


    $valueMap = [
        "PI" => "handleProblemItem",
        "CP" => "handleChangedPart",
        "PB" => "handleProblemItem",
        // Add more entries as needed -> PI and PB using same function
    ];
    foreach ($pmJobInformation['eachInformation'] as $jobDetail) {
       //Ckeck type -> Operation Depending On Type
       if (isset($valueMap[$jobDetail['item-type']])) {
        $handleCall= $valueMap[$jobDetail['item-type']];
        $queryStatus = $handleCall($jobDetail,$recEng,$pmJobInformation['pmJobCode']); // function Return true/false
    } else {
        $queryStatus = false;
    }

    if(!$queryStatus) {
        $response['status'] = false;
        break;
    }
    
    }
    cleanUpMr(mysqli_real_escape_string($conn,$pmJobInformation['allJobId']));
    $response['status'] = true;
    if($response['status']) {
        mysqli_query($conn,"UPDATE pm_job SET done_date = NOW(), `status` = 'done', total_job_time = IF(TIME_TO_SEC(TIMEDIFF(NOW(), act_date)) > TIME_TO_SEC('838:59:59'), '838:59:59', TIMEDIFF(NOW(), act_date)), rec_eng = {$recEng} WHERE pm_code = '{$pmJobCode}';");
        // Schedule new Job

            $jobInformation = mysqli_fetch_assoc(mysqli_query($conn,"SELECT pm_job.fk_mc_id AS mcId, pm_job.fk_plan_id AS planId, pm_plan.interv AS interv, pm_plan.interv_unit AS intervUnit FROM pm_job LEFT JOIN pm_plan ON pm_job.fk_plan_id = pm_plan.id WHERE pm_code = '{$pmJobCode}' ORDER BY pm_plan.l_vers DESC LIMIT 1;"));
            if($jobInformation['intervUnit'] == 'd') {
                $intervUnit = 'DAY';
            }else if($jobInformation['intervUnit'] == 'm'){
                $intervUnit = 'MONTH';
            }else if($jobInformation['intervUnit'] == 'y') {
                $intervUnit = 'YEAR';
            }else {
                $response['status'] = false;
            }

            if($response['status']){
            $newJobNo = newPmJobNumber();
            $pmJobQuery = "INSERT INTO pm_job (pm_code,fk_mc_id,fk_plan_id,plan_ver,planned_date,`status`) VALUES (?,?,?,(SELECT l_vers FROM pm_plan WHERE `id` = ?),DATE_ADD(NOW(), INTERVAL ? {$intervUnit}),'planned');";
            $pmJobStmt = $conn->prepare($pmJobQuery);
            $pmJobStmt->bind_param("sissi",$newJobNo,$jobInformation['mcId'],$jobInformation['planId'],$jobInformation['planId'],$jobInformation['interv']);
            $pmJobStmt->execute();
            $pmJobStmt->close();

            $conn->query("INSERT INTO job_all (fk_pm_no,job_type ) VALUES ('{$newJobNo}', 'PM');");
            }

    }


    echo json_encode($response); 
    $conn->close();
    exit;
    
}


?>