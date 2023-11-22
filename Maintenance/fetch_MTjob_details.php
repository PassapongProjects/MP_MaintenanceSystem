<?php
require '../connection.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

$jobs = [];

$usid = $conn->real_escape_string(strval($_SESSION['usid'])); 
// Prepare the SQL statement to fetch the latest job data from the database
$sql = "SELECT
job_all.`id` AS job_all_id,
fix_job.id AS id,
fix_job.job_no AS job_no,
fix_job.mc_id AS machine_id,
mc.name AS machine_name,
fix_job.inform_date AS inform_date,
fix_job.inform_reason AS inform_reason,
fix_job.status AS `status`,
mc.location AS machine_location,
employee.name AS informed_by,
IFNULL(asg_eng_table.fk_assign_eng_id,'N/A') AS asg_eng,
IFNULL(asg_emp.name,'N/A') AS asg_emp_name,
IFNULL(asg_emp.surname,'N/A') AS asg_emp_sur

FROM
(fix_job,
mc,
employee)
INNER JOIN job_all ON job_all.fk_fix_no = fix_job.job_no
LEFT JOIN job_assigned_eng_junc AS asg_eng_table ON asg_eng_table.fk_job_code = fix_job.job_no
LEFT JOIN employee AS asg_emp ON asg_emp.id = asg_eng_table.fk_assign_eng_id
WHERE
fix_job.mc_id = mc.id
AND employee.id = fix_job.issued_by
ORDER BY
CASE 
        WHEN fix_job.status = 'processing' THEN 1
        WHEN fix_job.status = 'pending' THEN 2
        WHEN fix_job.status = 'done' THEN 3
        END,
        inform_date DESC";




$pmJobSql = "SELECT
job_all.`id` AS job_all_id,
pm_job.pm_code AS pmJobCode,
pm_job.fk_mc_id AS job_mc_id,
pm_job.fk_plan_id AS planId,
pm_job.plan_ver AS planVer,
pm_job.planned_date AS plannedDate,
pm_job. `status` AS `status`,
pvd. `name` AS planName,
pvd.plan_description AS planDesc,
pm_job.done_date AS planLastDoneDate,
mc.id AS mc_id,
mc. `name` AS mcName,
mc.location AS mcLoc
FROM
pm_job
LEFT JOIN pm_plan_ver_detail AS pvd ON pvd.fk_plan_id = pm_job.fk_plan_id
    AND pvd.ver = pm_job.plan_ver
LEFT JOIN mc ON mc.id = pm_job.fk_mc_id
INNER JOIN job_all ON job_all.fk_pm_no = pm_job.pm_code
WHERE pm_job.planned_date <= NOW() 
ORDER BY 
CASE 
        WHEN pm_job. `status` = 'processing' THEN 1
        WHEN pm_job. `status` = 'planned' THEN 2
        WHEN pm_job. `status` = 'done' THEN 3
        END,
        pm_job.planned_date DESC;";

$jobForMeSql = "SELECT job_assigned_eng_junc.fk_job_code AS pmCode, job_assigned_eng_junc.fk_assign_eng_id AS eng_id FROM job_assigned_eng_junc ORDER BY job_assigned_eng_junc.fk_assign_eng_id ASC";

$jobFormeFixSql = "SELECT job_no AS fixCode, eng_person_inspect AS ins_eng_id, eng_person_confirmed AS con_eng_id FROM fix_job ORDER BY eng_person_inspect ASC";

$fix_result = $conn->query($sql);
$all_jobs = array();
// Result of fixJob
if ($fix_result->num_rows > 0) { 

    while ($row = $fix_result->fetch_assoc()) {
        $row['jobType'] = "BD";
        $all_jobs[] = $row;
    }
    
    $fix_result->close();

}else {
    $fix_result->close();
}

// Result of pmJob
$pm_result = $conn->query($pmJobSql);
if ($pm_result->num_rows>0){
    while ($pmRow = $pm_result->fetch_assoc()){
        $pmRow['jobType'] = "PM";
        $all_jobs[] = $pmRow;
    }
    $pm_result->close();
}else {
    $pm_result->close();
}


// Handle Assigned Job For Current User;
$assignedJob = [];
$forMeResult = $conn->query($jobForMeSql);
$fixForMeResult = $conn->query($jobFormeFixSql);

if($forMeResult) {
    if ($forMeResult->num_rows >0) {
    while ($forMeRow = $forMeResult->fetch_assoc()) {
        if (isset($assignedJob[$forMeRow['eng_id']])) {
            // If the array for the engineer already exists, just push the job code
            $assignedJob[$forMeRow['eng_id']][] = $forMeRow['pmCode'];
        } else {
            // If the array for the engineer doesn't exist, create a new array with the job code
            $assignedJob[$forMeRow['eng_id']] = [$forMeRow['pmCode']];
        }
    }

}
}
if ($fixForMeResult) {
    if($fixForMeResult->num_rows >0) {
        while ($fixForMeRow = $fixForMeResult->fetch_assoc()) {
            foreach ([$fixForMeRow['ins_eng_id'],$fixForMeRow['con_eng_id']] as $id) {
            if (isset($assignedJob[$id])) {
                // If the array for the engineer already exists, just push the job code
                $assignedJob[$id][] = $fixForMeRow['fixCode'];
            } else {
                // If the array for the engineer doesn't exist, create a new array with the job code
                $assignedJob[$id] = [$fixForMeRow['fixCode']];
            }
        }
        }

    }
}

function removeDuplicatesFromArray($array) {
    return array_values(array_unique($array));
}

// Apply the function to each sub-array in $assignedJob
$assignedJob = array_map('removeDuplicatesFromArray', $assignedJob);

$jobs['all_jobs'] = $all_jobs;
$jobs['asg_jobs'] = $assignedJob;

$conn->close();
header('Content-Type: application/json');
    echo json_encode($jobs);
}
?>
