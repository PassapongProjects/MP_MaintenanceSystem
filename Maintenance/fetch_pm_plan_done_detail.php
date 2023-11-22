<?php
require '../connection.php';
// Post PM-Code must be provided
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if(!isset($_POST['pmJobCode'])) {header("refresh:0; url=../logout.php");}

    $pmJobCode = $conn->real_escape_string($_POST['pmJobCode']);
    // pmJobCode -> 1.plan Code / Version (FROM plan Header) 
    //              2.plan Detail -> From job Detail --: Also with start date done date ETC showed at the buttom of the page
    //              3.Employee -> From asg_emp and EMP table


    function fetch_planCodeAndVersion($pmJobCode) {
        global $conn;
        $stmt = $conn->prepare("SELECT fk_plan_id AS planCode, plan_ver AS planVer FROM pm_job WHERE pm_code = ? LIMIT 1;");
        $stmt->bind_param("s",$pmJobCode);
        if($stmt->execute()) {
            $res = $stmt->get_result();
            if ($res->num_rows > 0){
                return $res->fetch_assoc();
            }else {
                // No assosiate pmKobCode
                return false;
            }
                }else {return false;}
               return;
    }


    function fetch_jobTimeData($pmJobCode) {
        global $conn;
        $stmt = $conn->prepare("SELECT
        job.planned_date AS plannedDate,
        job.act_date AS actDate,
        job.done_date AS doneDate,
        job.total_job_time AS totalTime,
        emp.id AS recEngId,
        emp.name AS recEngName,
        emp.surname AS recEngSurname
        
    FROM
        pm_job AS job
    LEFT JOIN employee AS emp
    ON emp.id = job.rec_eng
    WHERE
        pm_code = ?
    LIMIT 1");
        $stmt->bind_param("s",$pmJobCode);
        if($stmt->execute()) {
            $res = $stmt->get_result();
            if ($res->num_rows > 0){
                return $res->fetch_assoc();
            }else {
                // No assosiate pmKobCode
                return false;
            }
                }else {return false;}
               return;
    }

    function fetch_pmJobDetails($pmJobCode) {
        // These data go into problem table of the done job
        global $conn;

        $jobDetailQuery = "SELECT pm_job_details.*, part.name AS `name` , part.spec AS spec, part.unit AS part_unit, req_cart.returnable_quan AS partUsedQuan FROM pm_job_details LEFT JOIN part ON part.id = pm_job_details.part_changed LEFT JOIN inven_requisted_cart AS req_cart ON req_cart.fk_requisted_code = pm_job_details.part_mr AND req_cart.fk_part_id = part.id WHERE fk_pm_job_code = ?;";
        $stmt = $conn->prepare($jobDetailQuery);
        $stmt->bind_param("s",$pmJobCode);
        
        if($stmt->execute()) {
            $result = $stmt->get_result();
            if ($result->num_rows >0) {

            return $result->fetch_all(MYSQLI_ASSOC);

            }else {
                return false;
            }
        }else {
            return false;
        }

    }

    function fetch_planHeaderData($pmJobCode) {

    $planCodeAndVer = fetch_planCodeAndVersion($pmJobCode);
    $planCode = $planCodeAndVer['planCode'];
    $planVer = $planCodeAndVer['planVer'];

    global $conn;
    $headerSql = "SELECT
    pm_pvd.fk_plan_id AS pmCode,
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
WHERE fk_plan_id = '{$planCode}' AND ver = {$planVer};";

try {
    $stmt = $conn->prepare($headerSql);
    if ($stmt->execute()) {
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            // Fetch the first row as an associative array
            return $result->fetch_assoc();
        } else {
            // No data found
            return false;
        }
    } else {
        // Execution error
        return false;
    }
} catch (Exception $e) {
    // Handle exceptions, log errors, or return a more detailed error message
    return false;
}
    }


    function fetch_plan_items($pmJobCode) {
        
        global $conn;
        $planCodeAndVer = fetch_planCodeAndVersion($pmJobCode);
        $pmCode = $planCodeAndVer['planCode'];
        $ver = $planCodeAndVer['planVer'];

        $itemsSql =  "SELECT * FROM pm_plan_items WHERE fk_plan_id = ? AND `ver` = ?;";
        $itemsStmt = $conn->prepare($itemsSql);
        $itemsStmt->bind_param("si",$pmCode,$ver);
        if($itemsStmt->execute()) {
            $itemsResult = $itemsStmt->get_result();
            if($itemsResult->num_rows >0) {

                return $itemsResult->fetch_all(MYSQLI_ASSOC);
            }else {return false;}
        }else {return false;}
        
    }

    function getAssignedEng($pmCode) {
    global $conn;
    $asg_emp_data = [];
    $query = "SELECT
        emp.id AS empId,
        emp. `name` AS empName,
        emp.surname AS empSurname,
        emp.tel AS tel_number
    FROM
        job_assigned_eng_junc AS asg_eng
        LEFT JOIN employee AS emp ON asg_eng.fk_assign_eng_id = emp.id
    WHERE
        asg_eng.fk_job_code = ?;";

        $empstmt = $conn->prepare($query);
        $empstmt->bind_param("s",$pmCode);
        if(!$empstmt->execute()) { return false;}
        $res = $empstmt->get_result();
        $empstmt->close();
        if($res->num_rows > 0) {
        while($asg_emp = $res->fetch_assoc()) {
            array_push($asg_emp_data, $asg_emp);
        }
        return $asg_emp_data;
    }else {
        return false;
    }
    }

    $resultArray = array(
        "jobDetails" => fetch_pmJobDetails($pmJobCode),
        "planHeader" => fetch_planHeaderData($pmJobCode),
        "assignedEng" => getAssignedEng($pmJobCode),
        "planItems"=>fetch_plan_items($pmJobCode),
        "jobTimeData"=>fetch_jobTimeData($pmJobCode)
    );
    $conn->close();
    echo json_encode($resultArray);
    exit;

}
