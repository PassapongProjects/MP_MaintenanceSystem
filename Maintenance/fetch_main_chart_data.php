<?php
require '../connection.php';
session_start();
if (!isset($_SESSION['usid'])) {
    header("refresh:0; url=../logout.php");
    exit;
}
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    function fix_main_chart_by_year($arg = null)
    {
        // Require Year
        // If error (return false) -> Display error fetching data
        $year = isset($arg['year']) ? $arg['year'] : date("Y");
        global $conn;
        $query = "WITH months AS (
        SELECT 1 AS month
        UNION SELECT 2
        UNION SELECT 3
        UNION SELECT 4
        UNION SELECT 5
        UNION SELECT 6
        UNION SELECT 7
        UNION SELECT 8
        UNION SELECT 9
        UNION SELECT 10
        UNION SELECT 11
        UNION SELECT 12
    )
    SELECT
        months.month AS month,
        COALESCE(COUNT(fix_job.inform_date), 0) AS job_count,
        COALESCE((SEC_TO_TIME(AVG(TIME_TO_SEC(fix_job.time_wait_inspection)))), 0) AS mean_response,
        COALESCE((AVG(TIME_TO_SEC(fix_job.time_wait_inspection))/3600), 0) AS mean_response_HR,
        COALESCE((SEC_TO_TIME(SUM(TIME_TO_SEC(fix_job.time_total_down)))), 0) AS total_down,
        COALESCE((SUM(TIME_TO_SEC(fix_job.time_total_down))/3600), 0) AS total_down_HR
    FROM
        months
    LEFT JOIN
        fix_job ON EXTRACT(MONTH FROM fix_job.inform_date) = months.month
                AND EXTRACT(YEAR FROM fix_job.inform_date) = ?
    GROUP BY
        months.month
    ORDER BY
        months.month;
    ";

        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $year);

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            return $result->fetch_all(MYSQLI_ASSOC);
            exit;
        } else {
            return false;
            exit;
        }
    }


    function mc_order_by_month($arg = null)
    {
        // Ordering will be done via Javascript on client side
        // If error (return false) -> Display error fetching data
        $year = isset($arg['year']) ? $arg['year'] : date("Y");
        $month = isset($arg['month']) ? $arg['month'] : date("m");

        global $conn;
        $query = "SELECT
    fix_job.mc_id AS mcId,
    mc.`name` AS machineName,
    COUNT(fix_job.mc_id) AS downCount,
    COALESCE(SEC_TO_TIME(SUM(TIME_TO_SEC(fix_job.time_total_down))),'00:00:00') AS totalDownTime,
    COALESCE(SUM(TIME_TO_SEC(fix_job.time_total_down)), 0) AS totalDownTime_compare
FROM
    fix_job
LEFT JOIN
	mc ON fix_job.mc_id = mc.id
WHERE
    EXTRACT(MONTH FROM fix_job.inform_date) = ?
    AND EXTRACT(YEAR FROM fix_job.inform_date) = ?
GROUP BY
    fix_job.mc_id
ORDER BY
    fix_job.mc_id ASC;
";

        $stmt = $conn->prepare($query);
        $stmt->bind_param("ii", $month, $year);

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                return $result->fetch_all(MYSQLI_ASSOC);
                exit;
            } elseif ($result->num_rows == 0) {
                // Query success but no data for the month
                // Display 'No data for this month'
                return true;
                exit;
            } else {
                return false;
                exit;
            }
        } else {
            return false;
            exit;
        }
    }

    function download_monthly_fix_job($arg = null)
    {
        // Ordering will be done via Javascript on client side
        // If error (return false) -> Display error fetching data
        $year = isset($arg['year']) ? $arg['year'] : date("Y");
        $month = isset($arg['month']) ? $arg['month'] : date("m");

        global $conn;

        $query = "SELECT
    job_type AS jobtype,
    IFNULL(fk_fix_no,'-') AS Fix_ref,
    mc.id AS machine_id,
    mc.`name` AS machine_name,
    mc.`location` AS job_location,
    inform_date AS inform_date,
    inform_reason AS inform_reason,
    eng_reason AS inspect_reason,
    eng_solution AS fix_solution,
    eng_start_time AS job_started_time,
    eng_finished_time AS job_finished_time,
    fix_job.status AS job_status,
    time_wait_inspection AS wait_instpect_duration,
    time_fix_time AS fix_duration,
    time_total_down AS downtime_duration,
    inform_emp.`name` AS informed_by,
    inspect_emp.`name` AS inspeced_by,
    confirm_emp.`name` AS job_done_by
FROM
    job_all AS ja
    LEFT JOIN fix_job AS fix_job ON fix_job.job_no = ja.fk_fix_no
    LEFT JOIN mc AS mc ON fix_job.mc_id = mc.id
    LEFT JOIN employee AS inform_emp ON inform_emp.id = fix_job.issued_by
    LEFT JOIN employee AS inspect_emp ON inspect_emp.id = fix_job.eng_person_inspect
    LEFT JOIN employee AS confirm_emp ON confirm_emp.id = fix_job.eng_person_confirmed
WHERE
    EXTRACT(MONTH FROM fix_job.inform_date) = ?
    AND EXTRACT(YEAR FROM fix_job.inform_date) = ?
ORDER BY
    fix_job.eng_start_time ASC;";

        $stmt = $conn->prepare($query);
        $stmt->bind_param("ii", $month, $year);

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                return $result->fetch_all(MYSQLI_ASSOC);
                exit;
            } elseif ($result->num_rows == 0) {
                // Query success but no data for the month
                // Display 'No data for this month'
                return true;
                exit;
            } else {
                return false;
                exit;
            }
        } else {
            return false;
            exit;
        }
    }

    function download_yearly_fix_job($arg = null)
    {
        // Ordering will be done via Javascript on client side
        // If error (return false) -> Display error fetching data
        $year = isset($arg['year']) ? $arg['year'] : date("Y");
        $month = isset($arg['month']) ? $arg['month'] : date("m");

        global $conn;

        $query = "SELECT
    job_type AS jobtype,
    IFNULL(fk_fix_no,'-') AS Fix_ref,
    mc.id AS machine_id,
    mc.`name` AS machine_name,
    mc.`location` AS job_location,
    inform_date AS inform_date,
    inform_reason AS inform_reason,
    eng_reason AS inspect_reason,
    eng_solution AS fix_solution,
    eng_start_time AS job_started_time,
    eng_finished_time AS job_finished_time,
    fix_job.status AS job_status,
    time_wait_inspection AS wait_instpect_duration,
    time_fix_time AS fix_duration,
    time_total_down AS downtime_duration,
    inform_emp.`name` AS informed_by,
    inspect_emp.`name` AS inspeced_by,
    confirm_emp.`name` AS job_done_by
FROM
    job_all AS ja
    LEFT JOIN fix_job AS fix_job ON fix_job.job_no = ja.fk_fix_no
    LEFT JOIN mc AS mc ON fix_job.mc_id = mc.id
    LEFT JOIN employee AS inform_emp ON inform_emp.id = fix_job.issued_by
    LEFT JOIN employee AS inspect_emp ON inspect_emp.id = fix_job.eng_person_inspect
    LEFT JOIN employee AS confirm_emp ON confirm_emp.id = fix_job.eng_person_confirmed
WHERE
    EXTRACT(YEAR FROM fix_job.inform_date) = ?
ORDER BY
    fix_job.eng_start_time ASC;";

        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $year);

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                return $result->fetch_all(MYSQLI_ASSOC);
                exit;
            } elseif ($result->num_rows == 0) {
                // Query success but no data for the month
                // Display 'No data for this month'
                return true;
                exit;
            } else {
                return false;
                exit;
            }
        } else {
            return false;
            exit;
        }
    }

    $name = isset($_POST['name']) ? $_POST['name'] : false;
    $arg = isset($_POST['arg']) ? $_POST['arg'] : null;

    if (!$name) {
        $response['status'] = false;
        echo json_encode($response);
        exit;
    } else {
        $response[$name] = $name($arg);
        $response['status'] = true;
        echo json_encode($response);
        exit;
    }
}
