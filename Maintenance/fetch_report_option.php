<?php
require '../connection.php';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    function formattime($timeData)
    {
        $timeComponents = explode(":", $timeData);

        $hours = intval($timeComponents[0]);
        $minutes = intval($timeComponents[1]);
        $seconds = intval($timeComponents[2]);

        $formattedTime = "{$hours} ชั่วโมง {$minutes} นาที";
        return $formattedTime;
    }
    function formatDate($dateTimeString)
    {
        $dateTime = new DateTime($dateTimeString);
        return $dateTime->format('d/m/Y');
    }

    function sumTimeStrings($time1 = '', $time2 = '')
    {
        $time1 = $time1 == '' ? "00:00:00" : $time1;
        $time2 = $time2 == '' ? "00:00:00" : $time2;
        $time1Parts = explode(':', $time1);
        $time2Parts = explode(':', $time2);

        // Convert hours, minutes, and seconds to seconds
        $totalSeconds = (
            ($time1Parts[0] * 3600) +
            ($time1Parts[1] * 60) +
            $time1Parts[2]
        ) + (
            ($time2Parts[0] * 3600) +
            ($time2Parts[1] * 60) +
            $time2Parts[2]
        );

        // Calculate the new hours, minutes, and seconds
        $hours = floor($totalSeconds / 3600);
        $minutes = floor(($totalSeconds % 3600) / 60);
        $seconds = $totalSeconds % 60;
        // Format the result as "hh:mm:ss"
        $result = sprintf('%02d:%02d:%02d', $hours, $minutes, $seconds);

        return $result;
    }

    function get_mc_jobInfo($mcId, $startTime, $endTime)
    {
        global $conn;
        $mcId = is_numeric($mcId) ? intval($mcId) : false;
        if (!$mcId) {
            return false;
        }

        $mc_job_Query = "SELECT *
FROM (
	SELECT
		ja.id AS jobAllId,
		ja.job_type AS jobType,
		fj.id AS job_jobId,
		fj.job_no AS job_jobNo,
		fj.mc_id AS job_mcId,
		fj.inform_date AS job_informDT,
        fj.eng_finished_time AS job_doneDT,
		fj.inform_reason AS job_informReason,
		fj.eng_reason AS job_engReason,
		fj.time_wait_inspection AS timeWaitToInspec,
		fj.time_fix_time AS timeProcessTime,
		fj.time_total_down AS timeTotalDownTime
	FROM
		fix_job AS fj
		INNER JOIN job_all AS ja ON ja.fk_fix_no = fj.job_no
	WHERE
		fj. `status` = 'done'
		AND fj.mc_id = ?
	UNION ALL
	SELECT
		ja.id AS jobAllId,
		ja.job_type AS jobType,
		NULL AS job_jobId,
		pj.pm_code AS job_jobNo,
		pj.fk_mc_id AS job_mcId,
		NULL AS job_informDT,
        pj.done_date AS job_doneDT,
		pvd.`name` AS job_informReason,
		rec_eng.`name` AS job_engReason,
		NULL AS timeWaitToInspec,
		NULL AS timeProcessTime,
		pj.total_job_time AS timeTotalDownTime
	FROM
		pm_job AS pj
		INNER JOIN job_all AS ja ON ja.fk_pm_no = pj.pm_code
        LEFT JOIN pm_plan_ver_detail AS pvd ON pj.fk_plan_id = pvd.fk_plan_id AND pj.plan_ver = pvd.ver
        LEFT JOIN employee AS rec_eng ON pj.rec_eng = rec_eng.id
	WHERE
		pj. `status` = 'done'
		AND pj.fk_mc_id = ?) AS union_data";


        if ($startTime == 'allTime' || $endTime == 'allTime') {
            $mc_job_Query .= " ORDER BY jobType ASC, job_informDT DESC";
            $mc_job_Stmt = $conn->prepare($mc_job_Query);
            $mc_job_Stmt->bind_param("ii", $mcId, $mcId);
        } else {
            // If dateRange is set
            $mc_job_Query .= " WHERE DATE(union_data.job_doneDT) >= DATE(?) AND DATE(union_data.job_doneDT) <= DATE(?) ORDER BY jobType ASC, job_informDT DESC;";

            $mc_job_Stmt = $conn->prepare($mc_job_Query);
            $mc_job_Stmt->bind_param("iiss", $mcId, $mcId, $startTime, $endTime);
        }


        if ($mc_job_Stmt->execute()) {
            $result = $mc_job_Stmt->get_result();
            if ($result->num_rows > 0) {

                return $result->fetch_all(MYSQLI_ASSOC);
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    function get_mc_jobInfo_statistic($mcId, $startTime, $endTime)
    {
        global $conn;
        $workingHourPerDay = 8;

        $statistic_Query = "SELECT
        union_data.jobType AS jobType,
        COUNT(*) AS jobCount,
       SEC_TO_TIME((((DATEDIFF(MAX(union_data.job_informDT),MIN(union_data.job_informDT))) * ?) / COUNT(*)) * 3600) AS `MTBF(hr)`,
        SEC_TO_TIME(SUM(TIME_TO_SEC(union_data.timeTotalDownTime))) AS downTime,
        SEC_TO_TIME(AVG(TIME_TO_SEC(union_data.timeWaitToInspec))) AS meantimeInspect,
        SEC_TO_TIME(AVG(TIME_TO_SEC(union_data.timeProcessTime))) AS meantimeProcessing,
        SEC_TO_TIME(AVG(TIME_TO_SEC(union_data.timeTotalDownTime))) AS meanDownTime
    FROM (
        SELECT
            ja.id AS jobAllId,
            ja.job_type AS jobType,
            fj.id AS job_jobId,
            fj.job_no AS job_jobNo,
            fj.mc_id AS job_mcId,
            fj.inform_date AS job_informDT,
            fj.eng_finished_time AS job_doneDT,
            fj.inform_reason AS job_informReason,
            fj.eng_reason AS job_engReason,
            fj.time_wait_inspection AS timeWaitToInspec,
            fj.time_fix_time AS timeProcessTime,
            fj.time_total_down AS timeTotalDownTime
        FROM
            fix_job AS fj
            INNER JOIN job_all AS ja ON ja.fk_fix_no = fj.job_no
        WHERE
            fj. `status` = 'done'
            AND fj.mc_id = ?
        UNION ALL
        SELECT
            ja.id AS jobAllId,
            ja.job_type AS jobType,
            NULL AS job_jobId,
            pj.pm_code AS job_jobNo,
            pj.fk_mc_id AS job_mcId,
            NULL AS job_informDT,
            pj.done_date AS job_doneDT,
            NULL AS job_informReason,
            NULL AS job_engReason,
            NULL AS timeWaitToInspec,
            NULL AS timeProcessTime,
            pj.total_job_time AS timeTotalDownTime
        FROM
            pm_job AS pj
            INNER JOIN job_all AS ja ON ja.fk_pm_no = pj.pm_code
        WHERE
            pj. `status` = 'done'
            AND pj.fk_mc_id = ?) AS union_data";


        if ($startTime == 'allTime' || $endTime == 'allTime') {
            $statistic_Query .= " GROUP BY union_data.jobType;";
            $statistic_Stmt = $conn->prepare($statistic_Query);
            $statistic_Stmt->bind_param("iii", $workingHourPerDay, $mcId, $mcId);
        } else {
            // If dateRange is set
            $statistic_Query .= " WHERE DATE(union_data.job_doneDT) >= DATE(?) AND DATE(union_data.job_doneDT) <= DATE(?) GROUP BY jobType;";

            $statistic_Stmt = $conn->prepare($statistic_Query);
            $statistic_Stmt->bind_param("iiiss", $workingHourPerDay, $mcId, $mcId, $startTime, $endTime);
        }

        if ($statistic_Stmt->execute()) {
            $result = $statistic_Stmt->get_result();
            if ($result->num_rows > 0) {

                return $result->fetch_all(MYSQLI_ASSOC);
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    if (isset($_POST['mode']) && $_POST['mode'] == "option_query") {
        if (isset($_POST['type'])) {
            $type = $_POST['type'];

            $options = array();
            $htmlOptions = ''; // Initialize outside the if blocks

            if ($type === 'machine') {
                $query = "SELECT id, `name` FROM mc";
                $result = $conn->query($query);
                if ($result->num_rows > 0) {
                    $htmlOptions .= '<option value="" selected disabled>--เลือกรายการเครื่องจักร--</option>';
                    while ($row = $result->fetch_assoc()) {
                        $machineId = $row['id'];
                        $machineName = $row['name'];
                        $htmlOptions .= '<option value="' . $machineId . '"><b>หมายเลขเครื่อง:</b> ' . $machineId . ': ' . $machineName . '</option>';
                    }
                }
                // Don't close the connection here
            } elseif ($type === 'part') {
                $query = "SELECT id, `name`, spec FROM part";
                $result = $conn->query($query);
                if ($result->num_rows > 0) {
                    $htmlOptions .= '<option value="" selected disabled>--เลือกรายการอะไหล่--</option>';
                    while ($row = $result->fetch_assoc()) {
                        $partId = $row['id'];
                        $partName = $row['name'];
                        $partSpec = $row['spec'];
                        $htmlOptions .= '<option value="' . $partId . '"><b>หมายเลขอะไหล่:</b> ' . $partId . ': ' . $partName . ' <b>||| สเปค:</b> ' . $partSpec . '</option>';
                    }
                }
                // Don't close the connection here
            }

            // Construct the HTML options
            echo $htmlOptions;
        }
    } elseif (isset($_POST['mode']) && $_POST['mode'] == "detail_query" && isset($_POST['type'])) {

        if (isset($_POST['mc_id']) && $_POST['type'] == "machine") {
            $query = "SELECT
                    mc.id AS mc_id,
                    mc.name AS mc_name,
                    IFNULL(mc.location,'N/A') AS mc_loc,
                    mc_rank.`name` AS mc_rank,
                    mc_type.`name` AS mc_type,
                    status.status_name AS mc_status,
                    group_type.`name` AS mc_group
                FROM
                    mc
                    INNER JOIN mc_type ON mc.Type = mc_type.id
                    INNER JOIN `status` ON mc.Status = status.id
                    INNER JOIN group_type ON mc.fk_group = group_type.id
                    LEFT JOIN mc_rank ON mc.fk_mc_rank = mc_rank.id WHERE mc.id = {$_POST['mc_id']}";

            $result = $conn->query($query);
            if ($result->num_rows > 0) {
                $row = $result->fetch_assoc();

                echo ("<label style='margin-bottom:25px;'><h3>รายละเอียดเครื่องจักร</h3></label>
                <label for='mc_id'>Machine ID:</label>
                <span id='mc_id'>{$row['mc_id']}</span>
                <label for='name'>ชื่อเครื่อง:</label>
                <span id='name'>{$row['mc_name']}</span>
                <label for='location'>ที่ตั้ง:</label>
                <span id='location'>{$row['mc_loc']}</span>
                <label for='rank'>Rank:</label>
                <span id='rank'>{$row['mc_rank']}</span>
                <label for='type'>ประเภทเครื่อง:</label>
                <span id='type'>{$row['mc_type']}</span>
                <label for='status'>สถานะเครื่อง:</label>
                <span id='status'>{$row['mc_status']}</span>
                <label for='group'>Group:</label>
                <span id='group'>{$row['mc_group']}</span>");
            } else {
                echo "ERROR";
            }
        } elseif (isset($_POST['part_id']) && $_POST['type'] == "part") {
            // retrieve part information
            $partid = $_POST['part_id'] == null ?  NAN : intval($_POST['part_id']);
            $start_time = $_POST['start_time'] == "null" ? false : $_POST['start_time'];
            $end_time = $_POST['end_time'] == "null" ? false : $_POST['end_time'];
            try {

                if (is_nan($partid)) {
                    throw new Error('Part_id Error');
                }




                $part_basic_query = "SELECT `id` AS partid, `name` AS part_name, spec AS part_spec, safety_stock AS ss_stock, unit AS unit, lead_time AS part_lt, IFNULL(`location`,'N/A') AS part_loc FROM part WHERE `id` = ?;";
                $part_basic_stmt = $conn->prepare($part_basic_query);
                $part_basic_stmt->bind_param("i", $partid);
                $part_basic_stmt->execute();
                $part_basic_result = $part_basic_stmt->get_result();
                $part_basic_stmt->close();


                $log_where_caluse = "WHERE fk_partid = ?";

                if (($start_time && $end_time)) {
                    $log_where_caluse = "WHERE fk_partid = ? AND DATE(inv_tansaction.t_dt) >= DATE(?) AND DATE(inv_tansaction.t_dt) <= DATE(?)";
                }

                $part_log_query = "SELECT fk_mrcode AS event_code, t_type AS t_type, t_quan AS t_quan, old_quantity AS old_quan, new_quantity AS new_quan, t_dt AS t_time FROM inven_transactions AS inv_tansaction {$log_where_caluse} ORDER BY inv_tansaction.`t_dt` ASC;";

                $part_log_stmt = $conn->prepare($part_log_query);

                if (($start_time && $end_time)) {
                    $part_log_stmt->bind_param("iss", $partid, $start_time, $end_time);
                } else {
                    $part_log_stmt->bind_param("i", $partid);
                }

                $part_log_stmt->execute();
                $part_log_result = $part_log_stmt->get_result();
                $part_log_stmt->close();


                if (($start_time && $end_time)) {
                    $time_log_where_caluse = "WHERE (t_dt)
                    IN(
                        SELECT
                            max(t_dt) AS date FROM inven_transactions
                            WHERE inven_transactions.fk_partid = ?
                        GROUP BY
                            DATE(t_dt))
                    AND DATE(t_dt) >= DATE(?) AND DATE(t_dt) <= DATE(?);";
                } else {
                    $time_log_where_caluse = "WHERE (t_dt)
                    IN(
                        SELECT
                            max(t_dt) AS date FROM inven_transactions
                            WHERE inven_transactions.fk_partid = ?
                        GROUP BY
                            DATE(t_dt));";
                }

                $part_time_log_query = "SELECT
                DATE(t_dt) AS t_time,
                new_quantity AS new_quan
            FROM
                inven_transactions AS inv_trans {$time_log_where_caluse}";


                
                $part_time_log_stmt = $conn->prepare($part_time_log_query);

                if (($start_time && $end_time)) {
                    $part_time_log_stmt->bind_param("iss", $partid, $start_time, $end_time);
                } else {
                    $part_time_log_stmt->bind_param("i", $partid);
                }
                $part_time_log_stmt->execute();
                $part_time_log_result = $part_time_log_stmt->get_result();
                $part_time_log_stmt->close();

                if ($part_basic_result->num_rows === 1) {
                    $response['part_basic'] = $part_basic_result->fetch_assoc();
                    $response['part_log'] = $part_log_result->fetch_all(MYSQLI_ASSOC);
                    $response['part_time_log'] = $part_time_log_result->fetch_all(MYSQLI_ASSOC);
                    $response['status'] = true;
                } else {
                    throw new Error("Query Error");
                }
            } catch (Error $e) {
                $response['status'] = false;
            }
            echo json_encode($response);
        }
    } elseif (isset($_POST['mode']) && isset($_POST['d_mode']) && $_POST['mode'] == "job_query" && isset($_POST['type'])) {


        $mcId = intval($_POST['mc_id']);

        if (isset($_POST['mc_id']) && $_POST['type'] == "machine") {

            if ($_POST['d_mode'] == "AllTime") {
                $query = "SELECT fix_job.inform_date As inform_date,fix_job.id As id , fix_job.job_no As job_no ,fix_job.inform_reason As informed_reason,fix_job.eng_reason As eng_reason,fix_job.time_total_down As down_time,employee.name As eng_confirmed FROM fix_job INNER JOIN employee ON fix_job.eng_person_confirmed = employee.id WHERE mc_id =?;";
                $q_stmt = $conn->prepare($query);
                $q_stmt->bind_param("i", $mcId);
                $q_stmt->execute();
            } elseif ($_POST['d_mode'] == "BetweenTime") {
                if (isset($_POST['start_time']) && isset($_POST['end_time'])) {
                    $query = "SELECT
            fix_job.inform_date AS inform_date,
            fix_job.id AS id,
            fix_job.job_no AS job_no,
            fix_job.inform_reason AS informed_reason,
            fix_job.eng_reason AS eng_reason,
            fix_job.time_total_down AS down_time,
            employee.name AS eng_confirmed
        FROM
            fix_job
            INNER JOIN employee ON fix_job.eng_person_confirmed = employee.id
        WHERE
            mc_id = ? AND DATE(fix_job.eng_finished_time) >= DATE(?) AND DATE(fix_job.eng_finished_time) <= DATE(?);";

                    $q_stmt = $conn->prepare($query);
                    $q_stmt->bind_param("iss", $mcId, $_POST['start_time'], $_POST['end_time']);
                    $q_stmt->execute();
                } else {
                    echo "ERROR";
                }
            } else {
                echo "ERROR";
            }

            $Q_result = $q_stmt->get_result();
            if ($Q_result->num_rows > 0) {
                echo ("<div class='header-label-cont'><label>รายการงานซ่อมที่เกี่ยวข้อง</label></div>");
                echo ("<div class='table-container'>
        <table class='table job-table'>
        <thead>
            <tr>
                <th>Job No.</th>
                <th>อาการแจ้ง</th>
                <th>สาเหตุ</th>
                <th>วันที่แจ้งซ่อม</th>
                <th>เวลาหยุดเครื่อง</th>
                <th>ช่างผู้ดำเนินงาน</th>
                <th>รายละเอียดเพิ่มเติม</th>
            </tr>
        </thead>
      
       
        <tbody>
            <!-- Loop through queried data and populate rows -->
            <!-- Example row structure below -->
            ");
                while ($result = mysqli_fetch_assoc($Q_result)) {
                    $downtime = formattime($result['down_time']);
                    $inform_date = formatDate($result['inform_date']);
                    echo ("
            <tr>
                <td>{$result['job_no']}</td>
                <td>{$result['informed_reason']}</td>
                <td>{$result['eng_reason']}</td>
                <td>{$inform_date}</td>
                <td>{$downtime}</td>
                <td>{$result['eng_confirmed']}</td>
                <td>
                    <button type='button' class='detail-button goto-table-but' data-jobid='{$result['id']}'>รายละเอียดงาน</button>
                </td>
            </tr>
            ");
                }

                echo ("

        </tbody>
        </table>
        </div>");
            } else {
                echo "<span style='color:#ff4141'>ไม่มีงานซ่อมในช่วงเวลานี้</span>";
            }
        } elseif (isset($_POST['part_id']) && $_POST['type'] == "part") {

            // Part used for job...
            // Not used

        }
    } elseif (isset($_POST['mode']) && $_POST['mode'] == 'mc_cal') {
        $response['status'] = false;
        $startTime = !empty($_POST['startTime']) ? $_POST['startTime'] : 'allTime';
        $endTime = !empty($_POST['endTime']) ? $_POST['endTime'] : 'allTime';
        $jobInfo = get_mc_jobInfo($_POST['mcId'], $startTime, $endTime);
        $jobStatistic = get_mc_jobInfo_statistic($_POST['mcId'], $startTime, $endTime);
        // Calculation Part
        if (!$jobInfo || !$jobStatistic) {
            // if return false -> No jobs or ERROR -> Display No related Job
            $response['status'] = false;
            echo json_encode($response);
            exit;
        }
        $response['jobInfo'] = $jobInfo;
        // jobStatistic should contain only 2 rows of data which are grouped by jobType 'BD' and 'PM'
        $tmp_statistic = array();
        foreach ($jobStatistic as $jobStatisticItm) {
            if ($jobStatisticItm['jobType'] == 'BD') {
                $tmp_statistic['fix_count'] = $jobStatisticItm['jobCount'];
                $tmp_statistic['fix_totalDown'] = $jobStatisticItm['downTime'];
                $tmp_statistic['fix_meanDownTime'] = $jobStatisticItm['meanDownTime'];
                $tmp_statistic['fix_MTBF'] = $jobStatisticItm['MTBF(hr)'];
                // $tmp_statistic['fix_meanTimeInform'] = $jobStatisticItm['jobCount'];
                $tmp_statistic['fix_meanTimeInspect'] = $jobStatisticItm['meantimeInspect'];
                $tmp_statistic['fix_meanTimeFix'] = $jobStatisticItm['meantimeProcessing'];
            } elseif ($jobStatisticItm['jobType'] == 'PM') {
                $tmp_statistic['pm_count'] = $jobStatisticItm['jobCount'];
                $tmp_statistic['pm_totalDown'] = $jobStatisticItm['downTime'];
                $tmp_statistic['pm_meanPmTime'] = $jobStatisticItm['meanDownTime'];
            } else {
                // Nothing to Handle... Not expecting sth else
            }
        }
        $tmp_statistic['startTime'] = $startTime;
        $tmp_statistic['endTime'] = $endTime;
        $tmp_statistic['pm_totalDown'] = isset($tmp_statistic['pm_totalDown']) ? $tmp_statistic['pm_totalDown'] : '';
        $tmp_statistic['fix_totalDown'] = isset($tmp_statistic['fix_totalDown']) ? $tmp_statistic['fix_totalDown'] : '';
        $response['jobStatistic'] = $tmp_statistic;
        $response['jobStatistic']['total_downTime'] = sumTimeStrings($tmp_statistic['pm_totalDown'], $tmp_statistic['fix_totalDown']);

        $response['status'] = true;
        echo json_encode($response);
        exit;
    }
    $conn->close();
}
