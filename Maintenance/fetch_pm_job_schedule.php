<?php
require '../connection.php';
// Post PM-Code must be provided
if ($_SERVER['REQUEST_METHOD'] === 'POST') { 

    $fetchedData = [];
    $fetchedData['status'] = true;
    $requiredTopic = isset($_POST['requiredTopic']) ? $_POST['requiredTopic'] : false;
    if (!$requiredTopic) {$fetchedData['status'] = false; echo json_encode($fetchedData); exit;}
    // ValueMap to run function
    $functionMap = [
        "employeeData" => "fetch_employeeTable",
        "pmJobData" => "fetch_pmJobTable",
        "machineData" => "fetch_machineTable",
        "planHeaderData" => "fetch_latest_pmPlanHeader",
        "editJobSchedule" => "pushJobSchedule",
        "fetchAssignedEng" => "getAssignedEng",
        "dropEventSchedule" => "dropEventSchedule",
        "getPartAndJob" => "fetch_partAndJob"
        // Add more entries as needed -> PI and PB using same function
    ];

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


    function dropEventSchedule($arg=[]) {
        $jobId = isset($arg['pmCode']) ? $arg['pmCode'] : null;
        $planDate = isset($arg['newDateStr']) ? $arg['newDateStr'] : null;
        if (is_null($jobId) || is_null($planDate)) {
            $fetchedData['status'] = false; 
            echo json_encode($fetchedData); 
            exit;}

        global $conn;
        $jobUpdateQuery = "UPDATE pm_job SET planned_date = ? WHERE pm_code = ?;";
            $pmJobStmt = $conn->prepare($jobUpdateQuery);
            $pmJobStmt->bind_param("ss",$planDate,$jobId);
            if($pmJobStmt->execute()) {
                return true;
            }else {
                return false;
            }
            $pmJobStmt->close();
        
    }
    function pushJobSchedule($arg=[]) {
        global $conn;
        $jobId = isset($arg['jobId']) ? $arg['jobId'] : null;
        $planId = isset($arg['planId']) ? $arg['planId'] : null;
        $mcId = isset($arg['mcId']) ? intval($arg['mcId']) : null;
        $planDate = isset($arg['planDate']) ? $arg['planDate'] : null;
        $asgEngId = isset($arg['asgEngId']) ? $arg['asgEngId'] : array();
        $state = isset($arg['state']) ? $arg['state'] : null;

        if ($jobId === null || $planId === null || $mcId === null || $planDate === null || $asgEngId === null || $state === null) {
            $fetchedData['status'] = false; 
            echo json_encode($fetchedData); 
            exit;
        }
        if($state == "new"){

            $newJobNo = newPmJobNumber();
            $pmJobQuery = "INSERT INTO pm_job (pm_code,fk_mc_id,fk_plan_id,plan_ver,planned_date,`status`) VALUES (?,?,?,(SELECT l_vers FROM pm_plan WHERE `id` = ?),?,'planned');";
            $pmJobStmt = $conn->prepare($pmJobQuery);
            $pmJobStmt->bind_param("sisss",$newJobNo,$mcId,$planId,$planId,$planDate);
            $pmJobStmt->execute();
            $pmJobStmt->close();

            $asgEngQuery = "INSERT INTO job_assigned_eng_junc (fk_job_code,fk_assign_eng_id) VALUES (?,?);";
            foreach ($asgEngId as $engId) {
                $engId = intval($engId);
                $asgEngStmt = $conn->prepare($asgEngQuery);
                $asgEngStmt->bind_param("si",$newJobNo,$engId);
                $asgEngStmt->execute();
                $asgEngStmt->close();
            }

            $conn->query("INSERT INTO job_all (fk_pm_no,job_type ) VALUES ('{$newJobNo}', 'PM');");
            return true;
        }elseif($state =="update") {

            // Update engId by clear all existing to the job and add new one no matther if they are the same.
            if($jobId ==""){$fetchedData['status'] = false; echo json_encode($fetchedData); exit;}

            $jobUpdateQuery = "UPDATE pm_job SET planned_date = ? WHERE pm_code = ?;";
            $pmJobStmt = $conn->prepare($jobUpdateQuery);
            $pmJobStmt->bind_param("ss",$planDate,$jobId);
            $pmJobStmt->execute();
            $pmJobStmt->close();

            $delAllEngQuery = "DELETE FROM job_assigned_eng_junc WHERE fk_job_code = ?;";
            $asgEngQuery = "INSERT INTO job_assigned_eng_junc (fk_job_code,fk_assign_eng_id) VALUES (?,?);";
            
            $clearEngStmt = $conn->prepare($delAllEngQuery);
            $clearEngStmt->bind_param("s",$jobId);
            $clearEngStmt->execute();
            $clearEngStmt->close();

            foreach ($asgEngId as $engId) {
                $engId = intval($engId);
                $asgEngStmt = $conn->prepare($asgEngQuery);
                $asgEngStmt->bind_param("si",$jobId,$engId);
                $asgEngStmt->execute();
                $asgEngStmt->close();
            }
            return true;

        }elseif($state =="delete") {
            if($jobId ==""){$fetchedData['status'] = false; echo json_encode($fetchedData); exit;}

            $delPmJobStmt = $conn->prepare("DELETE FROM pm_job WHERE pm_code = ?;");
            $delPmJobStmt->bind_param("s",$jobId);
            $res = $delPmJobStmt->execute();
            $delPmJobStmt->close();
            $escapeString = $conn->real_escape_string($jobId);
            if($res){
                $conn->query("DELETE FROM job_assigned_eng_junc WHERE fk_job_code = '{$escapeString}';");
                return true;
            }else {
                return false;
            }
            
        }
        
        return false;
    }

    function fetch_employeeTable() {
        global $conn;
        $employeeTable = [];
        $query = "SELECT id AS empID, `name` AS empName, surname AS empSurname FROM employee WHERE department = 1;";
        $stmt = $conn->prepare($query);
        $stmt->execute();
        $res = $stmt->get_result();
        $stmt->close();
        if($res->num_rows > 0) {
            while($employee = $res->fetch_assoc()) {
                array_push($employeeTable, $employee);
            }
            return $employeeTable;
        }else{$fetchedData['status'] = false; echo json_encode($fetchedData); exit;}
    }

    function fetch_pmJobTable($arg=[]) {

        $pmJobCode = isset($arg['pmJobCode']) ? $arg['pmJobCode'] : null;
        $planId = isset($arg['planId']) ? $arg['planId'] : null;
        $mc_id = isset($arg['mc_id']) ? $arg['mc_id'] : null;

        global $conn;
        $pmJobTable=[];
        $query = "SELECT
        pm_job.pm_code AS pmJobCode,
        pm_job.fk_mc_id AS job_mc_id,
        pm_job.fk_plan_id AS planId,
        pm_job.plan_ver AS planVer,
        pm_job.planned_date AS plannedDate,
        pm_job. `status` AS jobStatus,
        pvd. `name` AS planName,
        pvd.plan_description AS planDesc,
        pm_job.done_date AS planLastDoneDate,
        mc. `name` AS mcName,
        mc.id AS mc_id
    FROM
        pm_job
        LEFT JOIN pm_plan_ver_detail AS pvd ON pvd.fk_plan_id = pm_job.fk_plan_id
            AND pvd.ver = pm_job.plan_ver
        LEFT JOIN mc ON mc.id = pm_job.fk_mc_id";

        if (!is_null($pmJobCode)) {
            // Append a WHERE clause to the query
            $query .= " WHERE pm_job.pm_code = ?;";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("s",$pmJobCode);
            $stmt->execute();
            $res = $stmt->get_result();
            $stmt->close();

            }else if(!is_null($mc_id)) {

                if (!is_null($planId)){
                    // if both plan and mcId is sent
                    $query .= " WHERE pm_job.fk_mc_id = ? AND pm_job.fk_plan_id = ? ORDER BY planned_date DESC LIMIT 1;";
                    $stmt = $conn->prepare($query);
                    $stmt->bind_param("is",$mc_id,$planId);
                    
                }else {
                    // if only mc_id is sent-> Return multiple rows -> Job Related to the machine
                    $query .= " WHERE pm_job.fk_mc_id = ? ORDER BY planned_date;";
                    $stmt = $conn->prepare($query);
                    $stmt->bind_param("i",$mc_id);
                }
                    $stmt->execute();
                    $res = $stmt->get_result();
                    $stmt->close();
                
            }else {
            $res = $conn->query($query);
            }
        if($res->num_rows > 0) {
            while($pmJob = $res->fetch_assoc()) {
                array_push($pmJobTable, $pmJob);
            }
            return $pmJobTable;
        }else{$fetchedData['status'] = false; echo json_encode($fetchedData); exit;}
    }

    function fetch_machineTable($arg=[]) {
        $mc_Id = isset($arg['mc_id']) ? $arg['mc_id'] : null;
        global $conn;
        $machineTable=[];
        $query = "SELECT
        mc.id AS mc_id,
        mc.name AS mc_name,
        mc.location AS mc_loc,
        mc_rank.`name` AS mc_rank,
        mc_type.`name` AS mc_type,
        status.status_name AS mc_status,
        group_type.`name` AS mc_group
    FROM
        mc
        LEFT JOIN mc_type ON mc.Type = mc_type.id
        LEFT JOIN status ON mc.Status = status.id
        LEFT JOIN group_type ON mc.fk_group = group_type.id
        LEFT JOIN mc_rank ON mc.fk_mc_rank = mc_rank.id;";

        if (!is_null($mc_Id)) {
        // Append a WHERE clause to the query
        $query .= " WHERE mc.id = ?;";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("i",$mc_Id);
        $stmt->execute();
        $res = $stmt->get_result();
        $stmt->close();

        }else {
        $res = $conn->query($query);
        }
        
        if($res->num_rows > 0) {
            while($machine = $res->fetch_assoc()) {
                array_push($machineTable, $machine);
            }
            return $machineTable;
        }else{$fetchedData['status'] = false; echo json_encode($fetchedData); exit;}
    }

    function fetch_latest_pmPlanHeader($arg=[]) {
        $planId = isset($arg['planId']) ? $arg['planId'] : null;

        global $conn;
        $latest_pmPlanHeader=[];
        $query = "SELECT
        pl.id AS planId,
        pl.l_vers AS planLver,
        pl_detail.edit_date AS plan_edit_date,
        pl_detail. `name` AS planName,
        pl_detail.interv AS planInterv,
        pl_detail.interv_unit AS planInterv_unit,
        pl_detail.plan_description AS planDesc,
        pl_detail.part_req AS partRequirement
    FROM
        pm_plan AS pl
        INNER JOIN pm_plan_ver_detail AS pl_detail ON pl.id = pl_detail.fk_plan_id
            AND pl.l_vers = pl_detail.ver";

        if(!is_null($planId)) {
        $query .= " WHERE pl.id = ?;";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("s",$planId);
        $stmt->execute();
        $res = $stmt->get_result();
        $stmt->close();
        }else {
            $res = $conn->query($query);
        }

        if($res->num_rows > 0) {
        while($pmPlanHeader= $res->fetch_assoc()) {
            if ($pmPlanHeader['partRequirement'] == 1) {
                array_push($pmPlanHeader,getInitialPartForPlan($pmPlanHeader['planId'],$pmPlanHeader['planLver']));
            }
            array_push($latest_pmPlanHeader, $pmPlanHeader);
        }
        return $latest_pmPlanHeader;
        }else{$fetchedData['status'] = false; echo json_encode($fetchedData); exit;}

    }

        function getInitialPartForPlan ($planId, $planVer) {
            global $conn;
            $partData = [];
            $query = "SELECT pl.fk_part_id AS partId, part.`name` AS partName, part.spec AS partSpec, pl.req_quan AS reqQuan, part.unit AS partUnit FROM pm_plan_part_junc AS pl INNER JOIN part ON pl.fk_part_id = part.id WHERE pl.fk_plan_id = ? AND pl.ver = ?;";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("si",$planId,$planVer);
            if(!$stmt->execute()) {$fetchedData['status'] = false; echo json_encode($fetchedData); exit;}
            $res = $stmt->get_result();
            $stmt->close();
            if($res->num_rows > 0) {
            while($partItem = $res->fetch_assoc()) {
                array_push($partData, $partItem);
            }
        }
            return $partData;
        }

        function getAssignedEng($arg=[]) {
            $pmCode = isset($arg['pmCode']) ? $arg['pmCode'] :null;
            if (is_null($pmCode)) {$fetchedData['status'] = false; echo json_encode($fetchedData); exit;}

            global $conn;
            $asg_emp_data = [];
            $query = "SELECT
            emp.id AS empId,
            emp. `name` AS empName,
            emp.surname AS empSurname
        FROM
            job_assigned_eng_junc AS asg_eng
            LEFT JOIN employee AS emp ON asg_eng.fk_assign_eng_id = emp.id
        WHERE
            asg_eng.fk_job_code = ?;";

            $empstmt = $conn->prepare($query);
            $empstmt->bind_param("s",$pmCode);
            if(!$empstmt->execute()) {$fetchedData['status'] = false; echo json_encode($fetchedData); exit;}
            $res = $empstmt->get_result();
            $empstmt->close();
            if($res->num_rows > 0) {
            while($asg_emp = $res->fetch_assoc()) {
                array_push($asg_emp_data, $asg_emp);
            }
            return $asg_emp_data;
        }


        }

        function fetch_partAndJob($arg=[]) {
            $interval = isset($arg['dateRange']) ? $arg['dateRange'] : 4;
            global $conn;
            $partAndJobData = [];
            $query = "SELECT
            pm_job.pm_code AS pmJobCode,
            pm_job.fk_plan_id AS planId,
            pm_job.plan_ver AS planVer,
            pm_job.planned_date AS plannedDate,
            pm_job. `status` AS jobStatus,
            pvd. `name` AS planName,
            mc.id AS mc_id,
            plPTable.partId AS partId,
            plPTable.partName AS partName,
            plPTable.partSpec AS partSpec,
            plPTable.reqQuan AS reqQuan,
            plPTable.partUnit AS partUnit,
            plpTable.stockQuan AS stockQuan
        FROM
            pm_job
            LEFT JOIN pm_plan_ver_detail AS pvd ON pvd.fk_plan_id = pm_job.fk_plan_id
                AND pvd.ver = pm_job.plan_ver
            LEFT JOIN mc ON mc.id = pm_job.fk_mc_id
            INNER JOIN (
                SELECT
                    pl.fk_part_id AS partId,
                    part. `name` AS partName,
                    part.spec AS partSpec,
                    pl.req_quan AS reqQuan,
                    part.unit AS partUnit,
                    pl.fk_plan_id AS planId,
                    pl.ver AS planVer,
                    part.instock AS stockQuan
                FROM
                    pm_plan_part_junc AS pl
                    INNER JOIN part ON pl.fk_part_id = part.id) AS plPTable ON plPTable.planId = pm_job.fk_plan_id
                AND plPTable.planVer = pm_job.plan_ver
        WHERE
            pm_job.status = 'planned'
            AND pm_job.planned_date >= DATE_SUB(NOW(), INTERVAL 1 DAY)
            AND pm_job.planned_date <= DATE_ADD(NOW(), INTERVAL ? WEEK)
        ORDER BY
            plannedDate ASC,
            pmJobCode ASC;";

            $quantityQuery = "SELECT
            pJtable.partId AS partId,
            pJtable.partName AS partName,
            pJtable.partSpec AS partSpec,
            SUM(pJtable.reqQuan) AS totalReqQuan,
            pJtable.stockQuan AS stockQuan,
            pJtable.ordered_stockQuan AS ordered_stockQuan
        FROM (
            SELECT
                pm_job.planned_date AS plannedDate,
                plPTable.partId AS partId,
                plPTable.partName AS partName,
                plPTable.partSpec AS partSpec,
                plPTable.reqQuan AS reqQuan,
                plPTable.partUnit AS partUnit,
                plPTable.stockQuan AS stockQuan,
                plPTable.ordered_stock AS ordered_stockQuan
            FROM
                pm_job
            LEFT JOIN pm_plan_ver_detail AS pvd ON pvd.fk_plan_id = pm_job.fk_plan_id
                AND pvd.ver = pm_job.plan_ver
            LEFT JOIN mc ON mc.id = pm_job.fk_mc_id
            INNER JOIN (
                SELECT
                    pl.fk_part_id AS partId,
                    part. `name` AS partName,
                    part.spec AS partSpec,
                    pl.req_quan AS reqQuan,
                    part.unit AS partUnit,
                    pl.fk_plan_id AS planId,
                    pl.ver AS planVer,
                    part.instock AS stockQuan,
                    part.ordered_stock AS ordered_stock
                FROM
                    pm_plan_part_junc AS pl
                    INNER JOIN part ON pl.fk_part_id = part.id) AS plPTable ON plPTable.planId = pm_job.fk_plan_id
                    AND plPTable.planVer = pm_job.plan_ver
            WHERE
                pm_job.status = 'planned'
                AND pm_job.planned_date >= DATE_SUB(NOW(), INTERVAL 1 DAY)
                AND pm_job.planned_date <= DATE_ADD(NOW(), INTERVAL ? WEEK)
            ORDER BY
                plannedDate ASC) AS pJtable
        GROUP BY
            pJtable.partId
        ORDER BY
            pJtable.partId ASC;";

            $stmt = $conn->prepare($query);
            
            $stmt->bind_param("i",$interval);
            
            
            if(!$stmt->execute()) {$fetchedData['status'] = false; echo json_encode($fetchedData); exit;}
            $res = $stmt->get_result();
            
            $stmt->close();
            
            if($res->num_rows > 0) {
                $partAndJobAll = [];
            while($partAndJob = $res->fetch_assoc()) {
                array_push($partAndJobAll, $partAndJob);
            }
                $partAndJobData["reqPartData"] = $partAndJobAll;
             }

             $quantitystmt = $conn->prepare($quantityQuery);
             $quantitystmt->bind_param("i",$interval);
              
            if(!$quantitystmt->execute()) {$fetchedData['status'] = false; echo json_encode($fetchedData); exit;}
             $quantityRes = $quantitystmt->get_result();
             $quantitystmt->close();
             if($quantityRes->num_rows>0) {
                $quantityInformation = [];
                while($quantityAndJob = $quantityRes->fetch_assoc()) {
                    array_push($quantityInformation,$quantityAndJob);
                }
                $partAndJobData["quantityInfo"] = $quantityInformation;
             }
             return $partAndJobData;
        }


        foreach ($requiredTopic as $topic) {
            //Ckeck type -> Operation Depending On Type
            if (isset($functionMap[$topic['name']])) {
            // return as received key depending on topic
            //echo (isset($topic['arg']) ? $topic['arg'] : null);
             $fetchedData[$topic['name']] = $functionMap[$topic['name']](isset($topic['arg']) ? $topic['arg'] : null);
             
         } else {
            $fetchedData['status'] = false; 
            echo json_encode($fetchedData); 
            exit;
         }
         
         }

    echo json_encode($fetchedData);
    $conn->close();
    exit;
}
?>