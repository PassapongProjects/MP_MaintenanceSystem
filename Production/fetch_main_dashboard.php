<?php

use function PHPSTORM_META\map;
use function PHPSTORM_META\type;

require '../connection_PD.php';
session_start();
// if ( !isset($_SESSION['usid']) || !($_SESSION['departmentCode'] == 2 || $_SESSION['departmentCode'] == 6)){
//     header("Location: ../logout.php");
//     exit;
// }

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    function generateUniqueCode()
    {
        // Get the current date in the desired format (e.g., YYYYMMDD)
        $currentDate = date("Ymd");

        // Generate a random 4-digit number (you can adjust the length as needed)
        $randomNumber = rand(1000, 9999);
        $randomNumber2 = rand(1000, 9999);
        // Combine the date, product ID, and random number to create the batch code
        $batchCode = $currentDate . "-" . $randomNumber . "-" . $randomNumber2;

        return $batchCode;
    }

    function fetch_medicine()
    {

        global $connPD;

        if ($result = mysqli_query($connPD, "SELECT * FROM master_medicine ORDER BY `name` ASC;")) {
            if (mysqli_num_rows($result) > 0) {
                $response['medicine'] = mysqli_fetch_all($result, MYSQLI_ASSOC);
                $response['status'] = true;
                return $response;
            } else {
                $response['status'] = false;
                return $response;
            }
        } else {
            $response['status'] = false;
            return $response;
        }
    }


    function fetch_operatingMachines($arg = null)
    {

        global $connPD;

        $machineId = $arg['mcId'] ?? false;

        $query = "SELECT
    mc.`id` AS mcId,
	mc. `name` AS name,
    mc.runcode AS runcode,
    mc.state AS state,
    mc_state.`name` AS status_name,
    IFNULL(mc.lot_no, 'N/A') AS using_lot_no,
    IFNULL(mc.onuse_med_id, 'N/A') AS using_med_id,
    IFNULL(med.`name`, 'N/A') AS using_med_name,
    IFNULL(mc.lot_setup_start_time, 'N/A') AS using_setup_start_time,
    IFNULL(mc.lot_start_time, 'N/A') AS using_start_time,
    IFNULL(mc.lot_setup_duration, 'N/A') AS using_setup_duration,
    IFNULL(mc.lot_pause_duration, 'N/A') AS using_pause_duration,
    IFNULL(mc.lot_last_stop_time, 'N/A') AS using_last_stop_time,
	IFNULL(form_top.`name`, 'N/A') AS using_form_top_name,
	IFNULL(form_bot.`name`, 'N/A') AS using_form_bot_name,
	IFNULL(seal_top.`name`, 'N/A') AS using_seal_top_name,
	IFNULL(seal_bot.`name`, 'N/A') AS using_seal_bot_name,
	IFNULL(guide.`name`, 'N/A') AS using_guide_name,
	IFNULL(cut.`name`, 'N/A') AS using_cut_name,
	IFNULL(perfor.`name`, 'N/A') AS using_perfor_name,
    IFNULL(form_top.`id`, 'N/A') AS using_form_top_id,
	IFNULL(form_bot.`id`, 'N/A') AS using_form_bot_id,
	IFNULL(seal_top.`id`, 'N/A') AS using_seal_top_id,
	IFNULL(seal_bot.`id`, 'N/A') AS using_seal_bot_id,
	IFNULL(guide.`id`, 'N/A') AS using_guide_id,
	IFNULL(cut.`id`, 'N/A') AS using_cut_id,
	IFNULL(perfor.`id`, 'N/A') AS using_perfor_id,
    IFNULL(form_top.`unique_code`, 'N/A') AS using_form_top_unique_code,
	IFNULL(form_bot.`unique_code`, 'N/A') AS using_form_bot_unique_code,
	IFNULL(seal_top.`unique_code`, 'N/A') AS using_seal_top_unique_code,
	IFNULL(seal_bot.`unique_code`, 'N/A') AS using_seal_bot_unique_code,
	IFNULL(guide.`unique_code`, 'N/A') AS using_guide_unique_code,
	IFNULL(cut.`unique_code`, 'N/A') AS using_cut_unique_code,
	IFNULL(perfor.`unique_code`, 'N/A') AS using_perfor_unique_code
FROM
	operating_machine AS mc
    LEFT JOIN master_mc_state AS mc_state ON mc.state = mc_state.id
    LEFT JOIN master_medicine AS med ON mc.onuse_med_id = med.id
	LEFT JOIN master_mold AS form_top ON mc.onuse_form_top_id = form_top.id
	LEFT JOIN master_mold AS form_bot ON mc.onuse_form_bot_id = form_bot.id
	LEFT JOIN master_mold AS seal_top ON mc.onuse_seal_top_id = seal_top.id
	LEFT JOIN master_mold AS seal_bot ON mc.onuse_seal_bot_id = seal_bot.id
	LEFT JOIN master_mold AS guide ON mc.onuse_guide_id = guide.id
	LEFT JOIN master_mold AS cut ON mc.onuse_cut_id = cut.id
	LEFT JOIN master_mold AS perfor ON mc.onuse_perfor_id = perfor.id";


        if ($machineId) {
            $query .= " WHERE mc.`id` = ?";
        }

        $query .= " ORDER BY mc.`name` ASC";
        $stmt = $connPD->prepare($query);

        if ($machineId) {
            $stmt->bind_param("i", $machineId);
        }

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $response['operating_data'] = $result->fetch_all(MYSQLI_ASSOC);
            $response['status'] = true;
            return $response;
        } else {
            $response['status'] =  false;
            return $response;
        }
    }

    function return_cpset($arg = null)
    {
        // Return with condition -> Change operating mold -> Update Status of the molds
        // Return -> Status using to Active -> set old_set status to Active then set new_set status to using at the same time before commiting
        // Remain -> Do nothing
        // Relpace -> Status active to using
        global $connPD;
        $detailObject = $arg['detailObject'] ?? false;
        $mcId = $detailObject['mcId'] ?? false;
        $remain_cp = $detailObject['remain_cp_obj'] ?? [];
        $replace_cp = $detailObject['replace_cp_obj'] ?? [];
        $return_cp = $detailObject['return_cp_obj'] ?? [];

        $replace_cp_id_array = $detailObject['replace_cp_array'] ?? [];

        if (!$detailObject || !$mcId) {
            $response['status'] = false;
            return $response;
        }

        $checkQuery = "SELECT `state`,`runcode` FROM operating_machine WHERE `id` = ?;";

        $check_stmt = $connPD->prepare($checkQuery);
        $check_stmt->bind_param("i", $detailObject['mcId']);

        if ($check_stmt->execute()) {
            try {
                $check_res = $check_stmt->get_result();
                if (!$check_res) {
                    throw new Exception("Error fetching result set: " . $check_stmt->error);
                }

                if ($check_res->num_rows == 1) {

                    $result = $check_res->fetch_assoc();
                    $state = $result['state'];
                    $fk_runcode = $result['runcode'];
                    if ($state != 4) {
                        // This function should be run on pause state (4) only.
                        return false;
                    }
                } else {

                    return false;
                }
            } catch (Exception $e) {
                // Handle the exception, log the error, or return an error response
                return false;
            } finally {
                $check_stmt->close();
            }
        } else {

            return false;
        }

        $new_set_object = [...$remain_cp, ...$replace_cp];


        $field_key_map = [
            "avail_form_top_set" => "onuse_form_top_id",
            "avail_form_bot_set"   => "onuse_form_bot_id",
            "avail_seal_top_set"   => "onuse_seal_top_id",
            "avail_seal_bot_set"  => "onuse_seal_bot_id",
            "avail_guide_set"  =>   "onuse_guide_id",
            "avail_cutting_set"  => "onuse_cut_id",
            "avail_perfor_set"  =>  "onuse_perfor_id"

        ];

        $operating_set_col = [];
        $operating_set_val = [];
        $operating_bind_type = "";

        foreach ($new_set_object as $key_field => $id) {
            if ($field_key_map[$key_field]) {
                $operating_set_col[] = "`{$field_key_map[$key_field]}` = ?";
                $operating_set_val[] = $id;
                $operating_bind_type .= "i";
            }
        }



        $operating_set_val[] = $mcId;
        $operating_bind_type .= "i";

        $set_col_caluse = implode(", ", $operating_set_col);


        $newset_moldList = mysqli_real_escape_string($connPD, implode(",", $replace_cp_id_array));

        try {
            // Start a transaction
            $connPD->begin_transaction();

            // Execute the first query to update molds
            $OccupyMoldStmt = $connPD->prepare("UPDATE master_mold SET active_status = 3, editable = 0, deletable = 0 WHERE `id` IN ({$newset_moldList})");
            $OccupyMoldStmt->execute();

            // Execute the second query to update operating machines
            $updateOperatingQuery = "UPDATE operating_machine SET {$set_col_caluse} WHERE `id` = ?;";
            $updateOperatingStmt = $connPD->prepare($updateOperatingQuery);
            $updateOperatingStmt->bind_param($operating_bind_type, ...$operating_set_val);
            $updateOperatingStmt->execute();

            // Execute the queries to insert mold conditions
            $releasedMoldId = [];
            foreach ($return_cp as $eachMoldData) {
                $insertMoldConditionQuery = "INSERT INTO mold_condition_log (`runcode`,`fk_mold_id`,`fk_condition_status`,`text_code`,`log_time`) VALUES (?, ?, ?, ?, NOW());";
                $insertMoldConditionStmt = $connPD->prepare($insertMoldConditionQuery);
                $insertMoldConditionStmt->bind_param("siis", $fk_runcode, $eachMoldData['part_id'], $eachMoldData['condition'], $eachMoldData['text_code']);
                $insertMoldConditionStmt->execute();
                $releasedMoldId[] = $eachMoldData['part_id'];
            }

            // Execute the query to update molds back to active status
            $oldset_moldList = implode(", ", $releasedMoldId);
            $releasedMoldStmt = $connPD->prepare("UPDATE master_mold SET active_status = 1, editable = 1, deletable = 1 WHERE `id` IN ({$oldset_moldList})");
            $releasedMoldStmt->execute();

            // Execute the query to insert an event log
            $event_logQuery = "INSERT INTO event_log (fk_run_code, state_from, state_to, reason, log_time) VALUES (?, 4, 4, 'เปลี่ยน Change Part', NOW());";
            $event_logStmt = $connPD->prepare($event_logQuery);
            $event_logStmt->bind_param("s", $fk_runcode);
            $event_logStmt->execute();

            // If all queries are successful, commit the transaction
            $connPD->commit();
            $response['status'] = true;
            return $response;
        } catch (Exception $e) {
            // Handle any errors that occurred during the transaction
            $connPD->rollBack();
            echo $e;
            $response['status'] = false;
            return $response;
        }
    }

    function fetch_med_changeset($arg = null)
    {
        global $connPD;
        $med_id = mysqli_real_escape_string($connPD, $arg['med_id']) ?? false;
        $avail_array = $arg['avail_array'] ?? [];
        if (!$med_id) {
            $respons['status'] = false;
            return $respons;
        }

        $partSetQuery = "SELECT
    cp_set.id AS set_id,
	cp_set.fk_form_top_set AS avail_form_top_set,
	cp_set.fk_form_bot_set AS avail_form_bot_set,
	cp_set.fk_seal_top_set AS avail_seal_top_set,
	cp_set.fk_seal_bot_set AS avail_seal_bot_set,
	cp_set.fk_guide_set AS avail_guide_set,
	cp_set.fk_cut_set AS avail_cutting_set,
	cp_set.fk_perfor_set AS avail_perfor_set
FROM
	changepart_set AS cp_set
WHERE
	cp_set.fk_med_id = ?;
";

        $partSetStmt = $connPD->prepare($partSetQuery);
        $partSetStmt->bind_param("i", $med_id);

        if ($partSetStmt->execute()) {
            $partSetResult = $partSetStmt->get_result();
            $available_mold = array();
            if ($partSetResult->num_rows > 0) {
                while ($each_result_set =  $partSetResult->fetch_assoc()) {
                    $each_avail_set_array = array();
                    $each_avail_set_array['set_id'] = $each_result_set['set_id'];
                    foreach ($each_result_set as $columnName => $mold_set_id) {
                        if ($columnName == 'set_id' || is_null($mold_set_id)) {
                            continue;
                        }


                        switch ($columnName) {
                            case 'avail_form_top_set':
                                $mold_type_id = 1;
                                break;
                            case 'avail_form_bot_set':
                                $mold_type_id = 2;
                                break;
                            case 'avail_seal_top_set':
                                $mold_type_id = 3;
                                break;
                            case 'avail_seal_bot_set':
                                $mold_type_id = 4;
                                break;
                            case 'avail_guide_set':
                                $mold_type_id = 5;
                                break;
                            case 'avail_cutting_set':
                                $mold_type_id = 6;
                                break;
                            case 'avail_perfor_set':
                                $mold_type_id = 7;
                                break;
                            default:
                                break;
                        }

                        if ($returned_avail = check_mold_avail($mold_type_id, $mold_set_id, $avail_array)) {

                            $each_avail_set_array[$columnName] = $returned_avail;
                        } else {
                            $each_avail_set_array = [];
                            break;
                        }
                    }

                    if ($each_avail_set_array ?? false) {
                        $available_mold[] = $each_avail_set_array;
                    }
                }
                $response['usable_set'] = $available_mold;
                $response['status'] = true;
                return $response;
            }
        } else {
            $respons['status'] = false;
            return $respons;
        }
    }

    function check_mold_avail($mold_type_Id, $mold_setId, $avail_array)
    {
        if (!($mold_type_Id ?? false) || !($mold_setId ?? false)) {
            return false;
        }
        global $connPD;

        $exception_clause = "";
        if (count($avail_array) > 0) {
            $included_mold_id = mysqli_real_escape_string($connPD, implode(', ', $avail_array));
            $exception_clause = "OR m_mold.id IN ({$included_mold_id})";
        }

        $query = "SELECT
    m_mold.id AS mold_id,
    m_mold.unique_code AS mold_code,
    m_mold.`name` AS mold_name,
    m_mold.fk_mold_type AS field_name
FROM
    master_mold AS m_mold
WHERE
    (m_mold.active_status = 1 {$exception_clause})
    AND m_mold.fk_mold_type = ?
    AND m_mold.fk_moldset = ?
    
ORDER BY
    mold_name ASC;";

        $stmt = $connPD->prepare($query);
        $stmt->bind_param('ii', $mold_type_Id, $mold_setId);

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                return $result->fetch_all(MYSQLI_ASSOC);
            } else {
                return false;
            }
        } else {
            return false;
        }
    }


    function fetch_all_mold_data()
    {

        global $connPD;

        $query = "SELECT
        m_mold.id AS mold_id,
        m_mold.unique_code AS mold_code,
        m_mold.`name` AS mold_name,
        m_mold.fk_mold_type AS field_name,
        m_m_status.`name` AS mold_status,
        m_mold.active_status AS mold_status_id,
        mm_type.`name` AS mold_type,
        mm_set.`name` AS mold_set
    FROM
        master_mold AS m_mold
        LEFT JOIN master_mold_status AS m_m_status ON m_mold.active_status = m_m_status.id
        LEFT JOIN master_mold_type AS mm_type ON m_mold.fk_mold_type = mm_type.id
        LEFT JOIN master_moldset AS mm_set ON m_mold.fk_moldset = mm_set.id

    ORDER BY
        CASE
            WHEN mold_status_id = 1 THEN 1
            WHEN mold_status_id = 3 THEN 2
            WHEN mold_status_id = 2 THEN 3
            ELSE 4 
        END,
        mold_name ASC;";

        $stmt = $connPD->prepare($query);

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            // return as available for each station
            // 1 forming top
            // 2 forming bot
            // 3 sealing top
            // 4 sealing bot
            // 5 guide rail
            // 6 cutting
            // 7 perforation

            $response['fetched_forming_top'] = array();
            $response['fetched_forming_bot'] = array();
            $response['fetched_sealing_top'] = array();
            $response['fetched_sealing_bot'] = array();
            $response['fetched_guide'] = array();
            $response['fetched_cutting'] = array();
            $response['fetched_perforation'] = array();

            while ($res = $result->fetch_assoc()) {
                $fieldValue = $res['field_name'];
                switch ($fieldValue) {
                    case 1:
                        $response['fetched_forming_top'][] = $res;
                        break;
                    case 2:
                        $response['fetched_forming_bot'][] = $res;
                        break;
                    case 3:
                        $response['fetched_sealing_top'][] = $res;
                        break;
                    case 4:
                        $response['fetched_sealing_bot'][] = $res;
                        break;
                    case 5:
                        $response['fetched_guide'][] = $res;
                        break;
                    case 6:
                        $response['fetched_cutting'][] = $res;
                        break;
                    case 7:
                        $response['fetched_perforation'][] = $res;
                        break;
                    default:
                        break;
                }
            }

            $response['status'] = true;
            return $response;
        } else {
            $response['status'] = false;
            return $response;
        }
    }



    function fetch_production_mold($arg = null)
    {

        global $connPD;

        $moldId = $arg['moldId'] ?? false;

        if (!$moldId) {
            // Query status (0) -> Problem occured in range of 1 month ago
            $query = "SELECT
            mcl.log_time AS log_time,
            mcl.text_code AS problem_text,
            mcl.fk_mold_id AS mold_id,
            m_mold. `name` AS mold_name,
            m_mold.unique_code AS mold_unique_code,
            mm_type. `name` AS mold_type,
            mm_set. `name` AS mold_set,
            mm_status. `name` AS mold_status,
            pdl.lot_no AS lot_no,
            pdl.fk_med_id AS med_id,
            m_med. `name` AS med_name,
            mcl.runcode AS runcode
        FROM
            mold_condition_log AS mcl
            LEFT JOIN master_mold_condition_status AS mm_cs ON mcl.fk_condition_status = mm_cs.id
            LEFT JOIN production_log AS pdl ON mcl.runcode = pdl.runcode
            LEFT JOIN master_mold AS m_mold ON mcl.fk_mold_id = m_mold.id
            LEFT JOIN master_mold_type AS mm_type ON m_mold.fk_mold_type = mm_type.id
            LEFT JOIN master_moldset AS mm_set ON m_mold.fk_moldset = mm_set.id
            LEFT JOIN master_mold_status AS mm_status ON m_mold.active_status = mm_status.id
            LEFT JOIN master_medicine AS m_med ON pdl.fk_med_id = m_med.id
        WHERE
            mcl.fk_condition_status = 0
            AND pdl.lot_done_status = 1
            AND DATE(mcl.log_time) >= DATE(NOW() - INTERVAL 1 MONTH)
        ORDER BY
            mcl.log_time DESC;";

            $stmt = $connPD->prepare($query);
            if (!$stmt) {
                // Handle the case where the query preparation failed
                $response['status'] = false;
                return $response;
            }

            if ($stmt->execute()) {
                $result = $stmt->get_result();
                $stmt->close();

                if ($result->num_rows > 0) {
                    $response['oneMonthMoldProblem'] = $result->fetch_all(MYSQLI_ASSOC);
                } else {
                    $response['oneMonthMoldProblem'] = [];
                }

                $response['status'] = true;
            } else {
                // Handle the case where the query execution failed
                $response['status'] = false;
            }

            return $response;
        } else {

            // if Mold Id is set -> Start / End time need to be set to query at specific time rage
            $startDate = $arg['startDate'] ?? false;
            $endDate = $arg['endDate'] ?? false;
            if (!$startDate || !$endDate) {
                $response['status'] = false;
                return $response;
            }
            $query = "SELECT
            mcl.log_time AS log_time,
            mcl.text_code AS problem_text,
            mcl.fk_mold_id AS mold_id,
            m_mold. `name` AS mold_name,
            m_mold.unique_code AS mold_unique_code,
            mm_type. `name` AS mold_type,
            mm_set. `name` AS mold_set,
            mm_status. `name` AS mold_status,
            pdl.lot_no AS lot_no,
            pdl.fk_med_id AS med_id,
            m_med. `name` AS med_name,
            mm_cs.id AS reported_status_id,
            mm_cs.`name` AS reported_status_name,
            mt_mc.`name` AS mc_name_real,
            pdl.mc_alias_name AS mc_name_alias,
            pdl.fk_machine_id AS mc_id,
            mcl.runcode AS runcode
        FROM
            mold_condition_log AS mcl
            LEFT JOIN master_mold_condition_status AS mm_cs ON mcl.fk_condition_status = mm_cs.id
            LEFT JOIN production_log AS pdl ON mcl.runcode = pdl.runcode
            LEFT JOIN master_mold AS m_mold ON mcl.fk_mold_id = m_mold.id
            LEFT JOIN master_mold_type AS mm_type ON m_mold.fk_mold_type = mm_type.id
            LEFT JOIN master_moldset AS mm_set ON m_mold.fk_moldset = mm_set.id
            LEFT JOIN master_mold_status AS mm_status ON m_mold.active_status = mm_status.id
            LEFT JOIN master_medicine AS m_med ON pdl.fk_med_id = m_med.id
            LEFT JOIN MP_MT.mc AS mt_mc ON pdl.fk_machine_id = mt_mc.id
        WHERE
            mcl.fk_mold_id = ?
            AND pdl.lot_done_status = 1
            AND DATE(mcl.log_time) >= DATE(?)
            AND DATE(mcl.log_time) <= DATE(?)
        ORDER BY
            mcl.log_time DESC;";


            $stmt = $connPD->prepare($query);

            if (!$stmt) {
                // Handle the case where the query preparation failed
                $response['status'] = false;
                return $response;
            }

            // Assuming $moldId, $startDate, and $endDate are already defined with appropriate values

            $stmt->bind_param("iss", $moldId, $startDate, $endDate);

            if ($stmt->execute()) {
                $result = $stmt->get_result();
                $stmt->close();

                if ($result->num_rows > 0) {
                    $response['mold_usage_log'] = $result->fetch_all(MYSQLI_ASSOC);
                } else {
                    $response['mold_usage_log'] = [];
                }

                $response['status'] = true;
            } else {
                // Handle the case where the query execution failed
                $response['status'] = false;
            }

            return $response;
        }
    }

    function fetch_specific_mold_data($arg = null)
    {

        global $connPD;

        $moldId = $arg['moldId'] ?? false;
        if (!$moldId) {
            $response['status'] = false;
            return $response;
        }

        $query = "SELECT
        m_mold.id AS mold_id,
        m_mold.unique_code AS unique_code,
        m_mold.`name` AS mold_name,
        mm_type.`name` AS mold_type,
        mm_set.`name` AS mold_set,
        mm_status.`name`AS mold_status,
        IFNULL(m_mold.`location`,'N/A') AS mold_location
    FROM
        master_mold AS m_mold
        LEFT JOIN master_mold_type AS mm_type ON m_mold.fk_mold_type = mm_type.id
        LEFT JOIN master_moldset AS mm_set ON m_mold.fk_moldset = mm_set.id
        LEFT JOIN master_mold_status AS mm_status ON m_mold.active_status = mm_status.id
    WHERE m_mold.id = ? LIMIT 1;";

        $stmt = $connPD->prepare($query);
        $stmt->bind_param("i", $moldId);

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $stmt->close();
            if ($result->num_rows === 1) {
                $response['specific_cp_detail'] = $result->fetch_assoc();
                $response['status'] = true;
                return $response;
            } else {
                $response['status'] = false;
                return $response;
            }
        } else {
            $response['status'] = false;
            return $response;
        }
    }

    function handle_cancelSetup($arg = null)
    {
        
        global $connPD;

        $machineId = $arg['machineId'] ?? false;

        if (!$machineId) {
            return false;
        }

        $checkQuery = "SELECT `state` AS state,`runcode` AS runcode FROM operating_machine WHERE `id` = ?;";

        $check_stmt = $connPD->prepare($checkQuery);
        $check_stmt->bind_param("i", $machineId);

        if ($check_stmt->execute()) {
            try {
                $check_res = $check_stmt->get_result();
                if (!$check_res) {
                    throw new Exception("Error fetching result set: " . $check_stmt->error);
                }

                if ($check_res->num_rows == 1) {
                    $result = $check_res->fetch_assoc();
                    $state = $result['state'];
                    if (!($state == 2)) {
                        // This function should be run on Runing state (2)  Only.
                        return false;
                    } else {
                        $fk_runcode = $result['runcode'];
                    }
                } else {

                    return false;
                }
            } catch (Exception $e) {
                // Handle the exception, log the error, or return an error response
                return false;
            } finally {
                $check_stmt->close();
            }
        } else {
            return false;
        }

// Return CP -> update operating status -> remove production log -> remove event_log
        try {
            $connPD->begin_transaction();

            $update_mold_status_query = "UPDATE master_mold
            SET active_status = 1
            WHERE id IN (
                SELECT onuse_form_top_id FROM operating_machine
                WHERE id = ? AND onuse_form_top_id IS NOT NULL
                UNION
                SELECT onuse_form_bot_id FROM operating_machine
                WHERE id = ? AND onuse_form_bot_id IS NOT NULL
                UNION
                SELECT onuse_seal_top_id FROM operating_machine
                WHERE id = ? AND onuse_seal_top_id IS NOT NULL
                UNION
                SELECT onuse_seal_bot_id FROM operating_machine
                WHERE id = ? AND onuse_seal_bot_id IS NOT NULL
                UNION
                SELECT onuse_guide_id FROM operating_machine
                WHERE id = ? AND onuse_guide_id IS NOT NULL
                UNION
                SELECT onuse_cut_id FROM operating_machine
                WHERE id = ? AND onuse_cut_id IS NOT NULL
                UNION
                SELECT onuse_perfor_id FROM operating_machine
                WHERE id = ? AND onuse_perfor_id IS NOT NULL
            );
            ";


            $update_mold_status_stmt = $connPD->prepare($update_mold_status_query);

            $update_mold_status_stmt->bind_param("iiiiiii", $machineId, $machineId, $machineId, $machineId, $machineId, $machineId, $machineId);

            $update_mold_status_stmt->execute();

            $update_mold_status_stmt->close();


            $updateOperatingQuery = "UPDATE operating_machine
        SET
          `runcode` = NULL,
          `lot_no` = NULL,
          `onuse_med_id` = NULL,
          `lot_setup_start_time` = NULL,
          `lot_start_time` = NULL,
          `onuse_form_top_id` = NULL,
          `onuse_form_bot_id` = NULL,
          `onuse_seal_top_id` = NULL,
          `onuse_seal_bot_id` = NULL,
          `onuse_guide_id` = NULL,
          `onuse_cut_id` = NULL,
          `onuse_perfor_id` = NULL,
          `state` = 3,
          `lot_setup_duration` = NULL,
          `lot_pause_duration` = NULL,
          `lot_last_stop_time` = NULL
        WHERE
          `id` = ?;";

            $updateOperatingStmt = $connPD->prepare($updateOperatingQuery);
            $updateOperatingStmt->bind_param("i", $machineId);
            $updateOperatingStmt->execute();

            $updateOperatingStmt->close();


            $remove_production_log_query = "DELETE FROM production_log WHERE runcode = ?;";

            $remove_production_log_stmt = $connPD->prepare($remove_production_log_query);

            $remove_production_log_stmt->bind_param("s", $fk_runcode);

            $remove_production_log_stmt->execute();

            $remove_production_log_stmt->close();

            $remove_event_log_query = "DELETE FROM event_log WHERE fk_run_code = ?;"; // On delete Cascade has been set, but this is just to make sure.

            $remove_event_log_stmt = $connPD->prepare($remove_event_log_query);

            $remove_event_log_stmt->bind_param("s", $fk_runcode);

            $remove_event_log_stmt->execute();

            $remove_event_log_stmt->close();


            $response['status'] = true;
            $connPD->commit();
            return $response;
        } catch (Exception $e) {

            $connPD->rollback();
            $response['status'] = false;
            $response['err'] = $e->getMessage();
            return $response;
        }
    }

    function handle_setupStart($arg = null)
    {

        $keyData = $arg['keyData'] ?? false;

        if (!$keyData) {
            return false;
        }
        // Mode should be shift from Idle -> setUp (3->2) only
        global $connPD;

        $checkQuery = "SELECT `state` FROM operating_machine WHERE `id` = ?;";

        $check_stmt = $connPD->prepare($checkQuery);
        $check_stmt->bind_param("i", $keyData['machineId']);

        if ($check_stmt->execute()) {
            try {
                $check_res = $check_stmt->get_result();
                if (!$check_res) {
                    throw new Exception("Error fetching result set: " . $check_stmt->error);
                }

                if ($check_res->num_rows == 1) {
                    $state = $check_res->fetch_array()[0];

                    if ($state != 3) {
                        // This function should be run on Idle state (3) only.
                        return false;
                    }
                } else {

                    return false;
                }
            } catch (Exception $e) {
                // Handle the exception, log the error, or return an error response
                return false;
            } finally {
                $check_stmt->close();
            }
        } else {

            return false;
        }




        // Define a mapping between keys and column names
        // Define a mapping between keys and column names
        $columnMapping = array(
            'avail_cutting_set' => 'onuse_cut_id',
            'avail_form_bot_set' => 'onuse_form_bot_id',
            'avail_form_top_set' => 'onuse_form_top_id',
            'avail_guide_set' => 'onuse_guide_id',
            'avail_seal_bot_set' => 'onuse_seal_bot_id',
            'avail_seal_top_set' => 'onuse_seal_top_id',
            'avail_perfor_set' => 'onuse_perfor_id',
            'lot_no_id' => 'lot_no',
            'onuse_med_id' => 'onuse_med_id'
        );

        // Define the SQL query template
        $query = "UPDATE operating_machine SET ";
        $runcode = generateUniqueCode();
        // Define an array to store the column assignments
        $columnAssignments = ["`lot_setup_start_time` = NOW()", "`state` = 2,`runcode` = '{$runcode}'"];

        // Define the parameter types string
        $paramTypes = '';
        $using_cp_id = [];
        // Loop through the 'arg' array and add column assignments
        foreach ($keyData as $key => $value) {
            // Check if the key exists in the mapping
            if (isset($columnMapping[$key])) {


                // Get the corresponding column name from the mapping
                $columnName = $columnMapping[$key];
                if ($columnName != 'lot_no' && $columnName != 'onuse_med_id') {
                    $using_cp_id[] = $value;
                }


                // Add the column assignment to the array
                $columnAssignments[] = "`{$columnName}` = ?";
                $paramValues[] = $value;
                // Determine the parameter type based on the column name
                if ($columnName === 'lot_no') {
                    $paramTypes .= 's'; // String parameter type for 'lot_no'
                } else {
                    $paramTypes .= 'i'; // Integer parameter type for other columns
                }
            }
        }


        // Start a transaction
        $connPD->begin_transaction();

        try {
            // Check if there are valid column assignments
            if (!empty($columnAssignments)) {
                // Construct the final query by joining the column assignments
                $query .= implode(', ', $columnAssignments);
                $query .= " WHERE `id` = ?;";

                // Prepare and execute the query with the appropriate values
                $stmt = $connPD->prepare($query);

                // Bind the values to the prepared statement
                $paramTypes .= "i";
                $paramValues[] = $keyData['machineId']; // Add the 'id' parameter for the WHERE clause

                $stmt->bind_param($paramTypes, ...$paramValues);

                // Execute the query
                if ($stmt->execute()) {
                    $stmt->close();

                    // Convert the array of IDs to a comma-separated string
                    $idList = mysqli_real_escape_string($connPD, implode(', ', $using_cp_id));

                    // Construct the SQL query with the IN clause
                    $cp_statusQuery = "UPDATE master_mold SET `active_status` = 3, editable = 0, deletable = 0 WHERE `id` IN ({$idList});";

                    $cp_statusStmt = $connPD->prepare($cp_statusQuery);

                    if ($cp_statusStmt->execute()) {
                        $cp_statusStmt->close();

                        $production_logStmt = $connPD->prepare("INSERT INTO production_log (`runcode`,`lot_done_status`) VALUE ('{$runcode}',0);");
                        if ($production_logStmt->execute()) {
                            // Commit the transaction if everything succeeded

                            // Update Event log
                            $event_logQuery = "INSERT INTO event_log (fk_run_code, state_from, state_to, reason, log_time) VALUES (?, 3, 2, 'เริ่มตั้งเครื่อง', NOW());";
                            $event_logStmt = $connPD->prepare($event_logQuery);
                            $event_logStmt->bind_param("s", $runcode);
                            $event_logStmt->execute();
                            $event_logStmt->close();


                            $connPD->commit();
                            return true;
                        } else {
                            // Rollback the transaction if there was an error
                            $connPD->rollback();
                            return false;
                        }
                    } else {
                        // Rollback the transaction if there was an error
                        $connPD->rollback();
                        return false;
                    }
                } else {
                    // Error occurred during execution
                    $stmt->close();
                    // Rollback the transaction if there was an error
                    $connPD->rollback();
                    return false;
                }
            } else {
                // No valid column assignments found
                // Rollback the transaction if there was an error
                $connPD->rollback();
                return false;
            }
        } catch (Exception $e) {
            // Handle exceptions and roll back the transaction
            $connPD->rollback();
            return false;
        }
    }

    function handle_lotStart($arg = null)
    {

        $machineId = $arg['machineId'] ?? false;
        $confirmedLot = $arg['confirmedLot'] ?? false;
        $second_updated = $arg['second_times'] ?? false;
        if (!$machineId || !$confirmedLot) {
            $response['code'] = 400;
            $response['status'] = false;
            return $response;
        }
        global $connPD;

        if ($second_updated) {

            $updateLotStmt = $connPD->prepare("UPDATE operating_machine SET `lot_no` = ? WHERE `id` = ?;");
            $updateLotStmt->bind_param('si', $confirmedLot, $machineId);
            if ($updateLotStmt->execute()) {
                $updateLotStmt->close();
            } else {
                $response['code'] = 400;
                $response['status'] = false;
                return $response;
            }
        }



        $checkQuery = "SELECT `lot_no` AS lotNo, `state` AS state, `runcode` AS runcode FROM operating_machine WHERE `id` = ?";
        $check_stmt = $connPD->prepare($checkQuery);
        $check_stmt->bind_param("i", $machineId);

        if ($check_stmt->execute()) {
            try {
                $check_res = $check_stmt->get_result();
                if (!$check_res) {
                    throw new Exception("Error fetching result set: " . $check_stmt->error);
                }

                if ($check_res->num_rows == 1) {
                    $res = $check_res->fetch_assoc();
                    $state = $res['state'];
                    $lotNo = $res['lotNo'];
                    $fk_runcode = $res['runcode'];
                    if ($state != 2) {
                        // This function should be run on Idle state (3) only.
                        $response['code'] = 400;
                        $response['status'] = false;
                        return $response;
                    }
                } else {

                    $response['code'] = 400;
                    $response['status'] = false;
                    return $response;
                }
            } catch (Exception $e) {
                // Handle the exception, log the error, or return an error response
                return false;
            } finally {
                $check_stmt->close();
            }
        } else {

            $response['code'] = 400;
            $response['status'] = false;
            return $response;
        }


        if ($lotNo != $confirmedLot) {
            $response['old_lot'] = $lotNo;
            $response['status'] = true;
            $response['code'] = 401; // 400 -> mismatched code
            return $response;
        } else {
            // Code = 100 -> matched code

            $query = "UPDATE operating_machine
        SET `state` = 1,
            lot_start_time = NOW(),
            lot_setup_duration = TIMEDIFF(NOW(),lot_setup_start_time)
        WHERE `id` = ?;
        ";

            $updatestmt =  $connPD->prepare($query);
            $updatestmt->bind_param("i", $machineId);

            if ($updatestmt->execute()) {

                $updatestmt->close();

                $event_logQuery = "INSERT INTO event_log (fk_run_code, state_from, state_to, reason, log_time) VALUES (?, 2, 1, 'เริ่มเดินยา', NOW());";
                $event_logStmt = $connPD->prepare($event_logQuery);
                $event_logStmt->bind_param("s", $fk_runcode);
                $event_logStmt->execute();
                $event_logStmt->close();

                $response['code'] = 200;
                $response['status'] = true;
                return $response;
            } else {
                $response['code'] = 400;
                $response['status'] = false;
                return $response;
            }
        }
    }



    function handle_pause($arg = null)
    {
        global $connPD;
        $machineId = $arg['machineId'] ?? false;
        $pause_reason = $arg['pause_reason'] ?? false;
        if (!$machineId || !$pause_reason) {
            return false;
        }
        $pause_reason = "Pause reason: " . $pause_reason;


        $checkQuery = "SELECT `state`,`runcode` FROM operating_machine WHERE `id` = ?;";

        $check_stmt = $connPD->prepare($checkQuery);
        $check_stmt->bind_param("i", $machineId);

        if ($check_stmt->execute()) {
            try {
                $check_res = $check_stmt->get_result();
                if (!$check_res) {
                    throw new Exception("Error fetching result set: " . $check_stmt->error);
                }

                if ($check_res->num_rows == 1) {
                    $result = $check_res->fetch_array();
                    $state = $result[0];
                    if ($state != 1) {

                        // This function should be run on Runing state (1) only.
                        return false;
                    } else {

                        $fk_runcode = $result[1];
                    }
                } else {

                    return false;
                }
            } catch (Exception $e) {
                // Handle the exception, log the error, or return an error response
                return false;
            } finally {
                $check_stmt->close();
            }
        } else {

            return false;
        }


        try {
            // Begin a PDO transaction
            $connPD->begin_transaction();

            $query = "UPDATE operating_machine SET `state` = 4, `lot_last_stop_time` = NOW() WHERE `id` = ?;";
            $event_logQuery = "INSERT INTO event_log (fk_run_code,state_from,state_to,reason,log_time) VALUES (?,1,4,?,NOW());";
            $pauseStmt = $connPD->prepare($query);

            $pauseStmt->bind_param("i", $machineId);

            if ($pauseStmt->execute()) {
                $pauseStmt->close();
                $log_stmt = $connPD->prepare($event_logQuery);
                $log_stmt->bind_param("ss", $fk_runcode, $pause_reason);
                $log_stmt->execute();
                $log_stmt->close();

                // Commit the transaction if all queries are successful
                $connPD->commit();

                return true;
            } else {
                // Rollback the transaction if any query fails
                $connPD->rollback();

                return false;
            }
        } catch (Exception $e) {
            // Handle any exceptions here
            // You can log or handle the exception as needed
            // If an exception occurs, the transaction will be automatically rolled back
            return false;
        }
    }


    function handle_continue($arg = null)
    {
        global $connPD;
        $machineId = $arg['machineId'] ?? false;
        if (!$machineId) {
            return false;
        }
        $checkQuery = "SELECT `state`,`runcode` FROM operating_machine WHERE `id` = ?;";

        $check_stmt = $connPD->prepare($checkQuery);
        $check_stmt->bind_param("i", $machineId);

        if ($check_stmt->execute()) {
            try {
                $check_res = $check_stmt->get_result();
                if (!$check_res) {
                    throw new Exception("Error fetching result set: " . $check_stmt->error);
                }

                if ($check_res->num_rows == 1) {
                    $result = $check_res->fetch_array();
                    $state = $result[0];
                    if ($state != 4) {

                        // This function should be run on Runing state (1) only.
                        return false;
                    } else {
                        $fk_runcode = $result[1];
                    }
                } else {

                    return false;
                }
            } catch (Exception $e) {
                // Handle the exception, log the error, or return an error response
                return false;
            } finally {
                $check_stmt->close();
            }
        } else {

            return false;
        }

        try {
            // Start a transaction
            $connPD->begin_transaction();

            // Your first query here
            $query = "UPDATE operating_machine SET `state` = 1, `lot_pause_duration` = ADDTIME(IFNULL(`lot_pause_duration`,'00:00:00'), TIMEDIFF(NOW(), lot_last_stop_time)), `lot_last_stop_time` = NULL WHERE `id` = ?;";

            $event_logQuery = "INSERT INTO event_log (fk_run_code,state_from,state_to,reason,log_time) VALUES (?,4,1,'เดินยาต่อ',NOW());";

            $continue_stmt = $connPD->prepare($query);
            $continue_stmt->bind_param("i", $machineId);

            if (!$continue_stmt->execute()) {
                throw new Exception("Error executing first query");
            }

            $continue_stmt->close();

            // Your second query here
            $log_stmt = $connPD->prepare($event_logQuery);
            $log_stmt->bind_param("s", $fk_runcode);

            if (!$log_stmt->execute()) {
                throw new Exception("Error executing second query");
            }

            $log_stmt->close();

            // Commit the transaction if everything was successful
            $connPD->commit();

            return true;
        } catch (Exception $e) {
            // An error occurred, rollback the transaction
            $connPD->rollback();
            // Handle or log the exception as needed
            return false;
        }
    }


    function handle_lotDone($arg = null)
    {
        global $connPD;

        $machineId = $arg['machineId'] ?? false;
        $usageData = json_decode($arg['part_usage'], true) ?? false;


        if (!$machineId || !$usageData) {
            return false;
        }


        // Loop through key map ($key => $val) for completion of all seven types

        // This function can be access from two states, including , pause and running

        // it doesn't matter what state it was -> if pausing that mean lot_last_stop is not null -> if that is not null ->add that
        // to lot_pause_duration in the production log array.


        // Functionality of -> Move From using to log
        // -> Logging usage condition of the mold

        // SELECT STATE 
        $checkQuery = "SELECT `state` AS state,`runcode` AS runcode FROM operating_machine WHERE `id` = ?;";

        $check_stmt = $connPD->prepare($checkQuery);
        $check_stmt->bind_param("i", $machineId);

        if ($check_stmt->execute()) {
            try {
                $check_res = $check_stmt->get_result();
                if (!$check_res) {
                    throw new Exception("Error fetching result set: " . $check_stmt->error);
                }

                if ($check_res->num_rows == 1) {
                    $result = $check_res->fetch_assoc();
                    $state = $result['state'];
                    if (!($state == 1 || $state == 4)) {
                        // This function should be run on Runing state (1) and Pausing state (4) Only.
                        return false;
                    } else {
                        $fk_runcode = $result['runcode'];
                    }
                } else {

                    return false;
                }
            } catch (Exception $e) {
                // Handle the exception, log the error, or return an error response
                return false;
            } finally {
                $check_stmt->close();
            }
        } else {
            return false;
        }

        // use result as current data of the machine


        $operator_id = $connPD->real_escape_string($_SESSION['usid']);

        try {
            // Start a transaction
            $connPD->begin_transaction();

            $insertProductionQuery = "UPDATE production_log AS pl
            JOIN (
              SELECT
                IFNULL(op_mc.runcode, 'N/A') AS runcode,
                IFNULL(op_mc.lot_no, 'N/A') AS lot_no,
                IFNULL(op_mc.onuse_med_id, NULL) AS fk_med_id,
                op_mc.id AS fk_machine_id,
                IFNULL(op_mc.`name`,'N/A') AS mc_alias_name,
                IFNULL(op_mc.onuse_form_top_id, NULL) AS fk_form_top_id,
                IFNULL(op_mc.onuse_form_bot_id, NULL) AS fk_form_bot_id,
                IFNULL(op_mc.onuse_seal_top_id, NULL) AS fk_seal_top_id,
                IFNULL(op_mc.onuse_seal_bot_id, NULL) AS fk_seal_bot_id,
                IFNULL(op_mc.onuse_guide_id, NULL) AS fk_guide_id,
                IFNULL(op_mc.onuse_cut_id, NULL) AS fk_cut_id,
                IFNULL(op_mc.onuse_perfor_id, NULL) AS fk_perfor_id,
                op_mc.lot_setup_start_time AS lot_setup_start_time,
                op_mc.lot_start_time AS lot_start_time,
                NOW() AS lot_end_time,
                IFNULL(op_mc.lot_setup_duration, '00:00:00') AS lot_setup_duration,
                IFNULL(
                  TIMEDIFF(
                    TIMEDIFF(NOW(), op_mc.lot_setup_start_time),
                    ADDTIME(
                      IFNULL(op_mc.lot_setup_duration, '00:00:00'),
                      ADDTIME(
                        IFNULL(op_mc.lot_pause_duration, '00:00:00'),
                        IFNULL(op_mc.lot_last_stop_time, '00:00:00')
                      )
                    )
                  ),
                  '00:00:00'
                ) AS lot_process_duration,
                IFNULL(ADDTIME(IFNULL(op_mc.lot_pause_duration, '00:00:00'), IFNULL(op_mc.lot_last_stop_time, '00:00:00')),'00:00:00') AS lot_pause_duration,
                TIMEDIFF(NOW(), op_mc.lot_setup_start_time) AS lot_duration,
                ? AS operator_id
              FROM operating_machine AS op_mc
              WHERE op_mc.id = ?
            ) AS updated_data
            ON pl.runcode = updated_data.runcode
            SET
              pl.runcode = updated_data.runcode,
              pl.lot_no = updated_data.lot_no,
              pl.fk_med_id = updated_data.fk_med_id,
              pl.fk_machine_id = updated_data.fk_machine_id,
              pl.mc_alias_name = updated_data.mc_alias_name,
              pl.fk_form_top_id = updated_data.fk_form_top_id,
              pl.fk_form_bot_id = updated_data.fk_form_bot_id,
              pl.fk_seal_top_id = updated_data.fk_seal_top_id,
              pl.fk_seal_bot_id = updated_data.fk_seal_bot_id,
              pl.fk_guide_id = updated_data.fk_guide_id,
              pl.fk_cut_id = updated_data.fk_cut_id,
              pl.fk_perfor_id = updated_data.fk_perfor_id,
              pl.lot_setup_start_time = updated_data.lot_setup_start_time,
              pl.lot_start_time = updated_data.lot_start_time,
              pl.lot_end_time = updated_data.lot_end_time,
              pl.lot_setup_duration = updated_data.lot_setup_duration,
              pl.lot_process_duration = updated_data.lot_process_duration,
              pl.lot_pause_duration = updated_data.lot_pause_duration,
              pl.lot_duration = updated_data.lot_duration,
              pl.operator_id = updated_data.operator_id,
              pl.lot_done_status = 1;
            ";

            $insertProductionStmt = $connPD->prepare($insertProductionQuery);
            $insertProductionStmt->bind_param("ii", $operator_id, $machineId);
            $insertProductionStmt->execute();

            // Prepare and execute the UPDATE operating_machine query
            $updateOperatingQuery = "UPDATE operating_machine
        SET
          `runcode` = NULL,
          `lot_no` = NULL,
          `onuse_med_id` = NULL,
          `lot_setup_start_time` = NULL,
          `lot_start_time` = NULL,
          `onuse_form_top_id` = NULL,
          `onuse_form_bot_id` = NULL,
          `onuse_seal_top_id` = NULL,
          `onuse_seal_bot_id` = NULL,
          `onuse_guide_id` = NULL,
          `onuse_cut_id` = NULL,
          `onuse_perfor_id` = NULL,
          `state` = 3,
          `lot_setup_duration` = NULL,
          `lot_pause_duration` = NULL,
          `lot_last_stop_time` = NULL
        WHERE
          `id` = ?;";

            $updateOperatingStmt = $connPD->prepare($updateOperatingQuery);
            $updateOperatingStmt->bind_param("i", $machineId);
            $updateOperatingStmt->execute();

            // Prepare and execute the INSERT INTO mold_condition_log query in a loop
            $insertMoldConditionQuery = "INSERT INTO mold_condition_log (`runcode`,`fk_mold_id`,`fk_condition_status`,`text_code`,`log_time`) VALUES (?, ?, ?, ?, NOW());";
            $releasedMoldId = [];
            foreach ($usageData as $eachMoldData) {
                $insertMoldConditionStmt = $connPD->prepare($insertMoldConditionQuery);
                $insertMoldConditionStmt->bind_param("siis", $fk_runcode, $eachMoldData['part_id'], $eachMoldData['condition'], $eachMoldData['text_code']);
                $insertMoldConditionStmt->execute();
                $releasedMoldId[] = $eachMoldData['part_id'];
                $insertMoldConditionStmt->close();
            }
            // Set molds status to active
            $moldList = mysqli_real_escape_string($connPD, implode(', ', $releasedMoldId));
            $releasedMoldStmt = $connPD->prepare("UPDATE master_mold SET active_status = 1, editable = 1, deletable = 1 WHERE `id` IN ({$moldList})");
            $releasedMoldStmt->execute();
            $releasedMoldStmt->close();

            // Prepare and execute the INSERT INTO event_log query
            $event_logQuery = "INSERT INTO event_log (fk_run_code, state_from, state_to, reason, log_time) VALUES (?, ?, 3, 'จบ lot', NOW());";
            $event_logStmt = $connPD->prepare($event_logQuery);
            $event_logStmt->bind_param("si", $fk_runcode, $state);
            $event_logStmt->execute();

            // Commit the transaction if all queries succeed
            $connPD->commit();
            return true;
        } catch (Exception $e) {
            // An error occurred, roll back the transaction
            echo $e;
            $connPD->rollback();
            return false;
        }
    }


    function fetch_filter_production($arg = null)
    {
        global $connPD;
        $startDate = $arg['startDate'] ?? false;
        $endDate = $arg['endDate'] ?? false;

        if (!$startDate || !$endDate) {
            $response['error_msg'] = "Not a valid date";
            $response['status'] = false;
            return $response;
        }


        $filter_production_query = "SELECT
        pdl.lot_no AS lot_no,
        pdl.lot_start_time AS start_time,
        pdl.lot_end_time AS end_time,
        pdl.lot_duration AS total_lot_time,
        pdl.fk_med_id AS med_id,
        m_med. `name` AS med_name,
        pdl.fk_machine_id AS mc_id,
        pdl.mc_alias_name AS mc_name_alias,
        mt_mc. `name` AS mc_name_real,
        pdl.runcode AS runcode
    FROM
        production_log AS pdl
        LEFT JOIN master_medicine AS m_med ON pdl.fk_med_id = m_med.id
        LEFT JOIN MP_MT.mc AS mt_mc ON pdl.fk_machine_id = mt_mc.id
    WHERE
        DATE(pdl.lot_start_time) >= DATE(?)
        AND DATE(pdl.lot_start_time) <= DATE(?)
        AND pdl.lot_done_status = 1
    ORDER BY pdl.lot_start_time DESC;";

        $filter_stmt = $connPD->prepare($filter_production_query);

        $filter_stmt->bind_param("ss", $startDate, $endDate);

        if ($filter_stmt->execute()) {
            // Handle emptiness of the result array will be done in the JS file
            $filter_result = $filter_stmt->get_result();

            $response['filtered_production'] = $filter_result->fetch_all(MYSQLI_ASSOC);
            $response['status'] = true;
            return $response;
        } else {

            $response['error_msg'] = "Execution error";
            $response['status'] = false;
            return $response;
        }
    }


    // Handle Configuration

    $allowConfigTable = [
        "master_medicine",
        "master_mold",
        "master_mold_status",
        "master_mold_type",
        "master_moldset",
        "operating_machine",
        "changepart_set"
    ];


    function fetch_config($arg = null)
    {
        global $connPD;
        global $allowConfigTable;

        $table = isset($arg['tableName']) ? mysqli_real_escape_string($connPD, $arg['tableName']) : false;
        if (!$table) {
            $response['status'] = false;
            return $response;
        }


        if (!in_array($table, $allowConfigTable)) {
            $response['status'] = false;
            return $response;
        }



        if ($table == "master_mold") {
            $query = "SELECT m_mold.id AS id, m_mold.unique_code AS unique_code, m_mold.`name` AS name, m_mold.fk_mold_type, m_mold.fk_moldset, mm_status.`name` AS active_status, mm_status.id AS active_status_id, IFNULL(m_mold.location,'') AS location, m_mold.editable AS editable, m_mold.deletable AS deletable FROM master_mold AS m_mold LEFT JOIN master_mold_status AS mm_status ON mm_status.id = m_mold.active_status";
        } else {
            $query = "SELECT * FROM {$table}";
        }

        $query .= " ORDER BY editable DESC, id ASC;";
        $stmt = $connPD->prepare($query);

        if ($stmt->execute()) {
            $tableResult = $stmt->get_result();
            $response['status'] = true;
            $response['tableData'] = $tableResult->fetch_all(MYSQLI_ASSOC);
            foreach ($response['tableData'] as &$tableItem) {
                $tableItem['table'] = $table;
            }
            unset($table);
            return $response;
        } else {
            $response['status'] = false;
            return $response;
        }
    }


    function update_config($arg = null)
    {
        global $connPD;
        global $allowConfigTable;
        $table = mysqli_real_escape_string($connPD, $arg['tableName'] ?? false);
        $objId = mysqli_real_escape_string($connPD, $arg['objId'] ?? false);
        $fieldArg = $arg['columnVal'] ?? false;

        if (!in_array($table, $allowConfigTable) || !$objId || !$fieldArg) {
            // if $table = false, it's not in array either
            return false;
            exit;
        }

        $list_columns = [];
        $list_values = [];
        $list_types = '';

        foreach ($fieldArg as $column => $valueObject) {
            $list_columns[] = "`{$column}` = ?";
            $list_types .= $valueObject['type'];
            $list_values[] = strtolower($valueObject['value']) === "null" ? null :  $valueObject['value'];
        }
        // Add obj Id to be binded
        $list_types .= 'i';
        $list_values[] = &$objId;


        $set_clause = implode(', ', $list_columns);

        // Construct the full SQL query
        $query = "UPDATE {$table} SET $set_clause WHERE id = ?;";
        // Start a transaction

        $connPD->begin_transaction();

        $stmt = $connPD->prepare($query);

        // Assuming you have a mysqli statement and an array of parameters
        $bind_params = [];
        for ($i = 0; $i < count($list_values); $i++) {
            $bind_params[$i] = &$list_values[$i];
        }
        // Insert the types string at the beginning of the array
        array_unshift($bind_params, $list_types);

        try {
            // Use call_user_func_array to bind parameters
            call_user_func_array(array($stmt, 'bind_param'), $bind_params);

            if ($stmt->execute()) {
                // If the update is successful, commit the transaction
                $connPD->commit();
                return true;
            } else {
                // If there's an error, log the error message

                // Roll back the transaction
                $connPD->rollback();
                return false;
            }
        } catch (Exception $e) {

            // Roll back the transaction
            $connPD->rollback();
            return false;
        }
    }

    function insert_config($arg = null)
    {

        global $connPD;
        global $allowConfigTable;

        // Validate the input

        $table = mysqli_real_escape_string($connPD, $arg['tableName'] ?? false);
        $fieldArg = $arg['columnVal'] ?? false;

        if (!in_array($table, $allowConfigTable) || !$fieldArg) {
            // if $table = false, it's not in array either
            return false;
            exit;
        }


        $list_columns = [];
        $list_values = [];
        $list_types = '';

        foreach ($fieldArg as $column => $valueObject) {
            $list_columns[] = "`{$column}`";
            $list_types .= $valueObject['type'];
            $list_values[] = strtolower($valueObject['value']) === "null" ? null :  $valueObject['value'];
        }


        $bind_params = [];
        for ($i = 0; $i < count($list_values); $i++) {
            $bind_params[$i] = &$list_values[$i];
        }

        $placeholders = array_fill(0, count($list_columns), '?');

        // Construct the full SQL query
        $query = "INSERT INTO {$table} (" . implode(', ', $list_columns) . ") VALUES (" . implode(', ', $placeholders) . ")";

        $stmt = $connPD->prepare($query);
        array_unshift($bind_params, $list_types);


        try {
            // Use call_user_func_array to bind parameters
            call_user_func_array(array($stmt, 'bind_param'), $bind_params);

            if ($stmt->execute()) {
                // If the update is successful, commit the transaction
                $connPD->commit();
                return true;
            } else {
                // If there's an error, log the error message

                // Roll back the transaction
                $connPD->rollback();
                return false;
            }
        } catch (Exception $e) {

            // Roll back the transaction
            $connPD->rollback();
            return false;
        }
    }

    function delete_config($arg = null)
    {
        global $connPD;
        global $allowConfigTable;

        $table = mysqli_real_escape_string($connPD, $arg['tableName'] ?? false);
        $objId = mysqli_real_escape_string($connPD, $arg['objId'] ?? false);

        if (!in_array($table, $allowConfigTable) || !$objId) {
            // if $table = false, it's not in array either
            return false;
            exit;
        }

        // Assuming you have already established a database connection $conn

        // Start a transaction
        $connPD->begin_transaction();

        $query = "DELETE FROM {$table} WHERE id = ?;";
        $stmt = $connPD->prepare($query);
        $stmt->bind_param("i", $objId);
        try {
            if ($stmt->execute()) {
                // If the DELETE query is successful, commit the transaction
                $connPD->commit();
                return true;
            } else {
                // If there's an error, rollback the transaction
                $connPD->rollback();
                return false;
            }
        } catch (Exception $e) {
            // Handle the exception
            // Roll back the transaction
            $connPD->rollback();
            return false;
        }
    }

    function fetch_option_for_master_mold($arg = null)
    {
        global $connPD;

        $query = "SELECT id, 'm_type' AS source, `name` FROM master_mold_type
        UNION
        SELECT id, 'm_set' AS source, `name` FROM master_moldset
        UNION
        SELECT id, 'm_status' AS source, `name` FROM master_mold_status
        ORDER BY source ASC, id ASC, `name` ASC;";

        $stmt = $connPD->prepare($query);

        if ($stmt->execute()) {

            $result = $stmt->get_result();
            $stmt->close();
            if ($result->num_rows > 0) {
                $response['m_type'] = [];
                $response['m_set'] = [];
                $response['m_status'] = [];

                while ($res = $result->fetch_assoc()) {

                    $response[$res['source']][$res['id']] = $res['name'];
                }

                $response['status'] = true;
                return $response;
            } else {
                $response['status'] = false;
                return $response;
            }
        } else {
            $response['status'] = false;
            return $response;
        }
    }

    function fetch_option_for_real_machine($arg = null)
    {
        global $connPD;

        $query = "SELECT real_mc.id AS id, real_mc.`name` AS name FROM MP_MT.mc AS real_mc;";

        $stmt = $connPD->prepare($query);

        if ($stmt->execute()) {

            $result = $stmt->get_result();
            $stmt->close();
            if ($result->num_rows > 0) {

                while ($res = $result->fetch_assoc()) {

                    $response['listed_real_mc'][$res['id']] = $res['id'] . ": " . $res['name'];
                }

                $response['status'] = true;
                return $response;
            } else {
                $response['status'] = false;
                return $response;
            }
        } else {
            $response['status'] = false;
            return $response;
        }
    }
    // End handle configuration

    // Handle Configuration specifically for Change Part set

    function fetch_med_changeset_for_config($arg = null)
    {
        global $connPD;
        $med_id = mysqli_real_escape_string($connPD, $arg['med_id']) ?? false;
        if (!$med_id) {
            $respons['status'] = false;
            return $respons;
        }

        $partSetQuery = "SELECT
        cp_set.id AS set_id,
        cp_set.fk_form_top_set AS avail_form_top_set_id,
        mm_set_form_top.`name` AS avail_form_top_set_name,
        cp_set.fk_form_bot_set AS avail_form_bot_set_id,
        mm_set_form_bot.`name` AS avail_form_bot_set_name,
        cp_set.fk_seal_top_set AS avail_seal_top_set_id,
        mm_set_seal_top.`name` AS avail_seal_top_set_name,
        cp_set.fk_seal_bot_set AS avail_seal_bot_set_id,
        mm_set_seal_bot.`name` AS avail_seal_bot_set_name,
        cp_set.fk_guide_set AS avail_guide_set_id,
        mm_set_guide.`name` AS avail_guide_set_name,
        cp_set.fk_cut_set AS avail_cutting_set_id,
        mm_set_cut.`name` AS avail_cutting_set_name,
        cp_set.fk_perfor_set AS avail_perfor_set_id,
        mm_set_perfor.`name` AS avail_perfor_set_name
    FROM
        changepart_set AS cp_set
    LEFT JOIN master_moldset AS mm_set_form_top ON cp_set.fk_form_top_set = mm_set_form_top.id
    LEFT JOIN master_moldset AS mm_set_form_bot ON cp_set.fk_form_bot_set = mm_set_form_bot.id
    LEFT JOIN master_moldset AS mm_set_seal_top ON cp_set.fk_seal_top_set = mm_set_seal_top.id
    LEFT JOIN master_moldset AS mm_set_seal_bot ON cp_set.fk_seal_bot_set = mm_set_seal_bot.id
    LEFT JOIN master_moldset AS mm_set_guide ON cp_set.fk_guide_set = mm_set_guide.id
    LEFT JOIN master_moldset AS mm_set_cut ON cp_set.fk_cut_set = mm_set_cut.id
    LEFT JOIN master_moldset AS mm_set_perfor ON cp_set.fk_perfor_set = mm_set_perfor.id
    WHERE
        cp_set.fk_med_id = ?;";

        $partSetStmt = $connPD->prepare($partSetQuery);
        $partSetStmt->bind_param("i", $med_id);

        if ($partSetStmt->execute()) {
            $partSetResult = $partSetStmt->get_result();
            if ($partSetResult->num_rows > 0) {
                $response['all_cp_set_for_med'] = $partSetResult->fetch_all(MYSQLI_ASSOC);
                $response['status'] = true;
                return $response;
            } else {
                $response['all_cp_set_for_med'] = [];
                $response['status'] = true;
                return $response;
            }
        } else {
            $respons['status'] = false;
            return $respons;
        }
    }

    function cp_set_duplication_check($arg = null)
    {
        global $connPD;
        $fieldArg = $arg['columnVal'] ?? false;
        $objId = mysqli_real_escape_string($connPD, $arg['objId'] ?? false);

        if (!$objId || !$fieldArg) {
            // if $table = false, it's not in array either
            return false;
            exit;
        }
        // $insert_cp must be an array with key=>value pair, which key = changepart_set's columns' name

        $table_column = [];
        $table_value = [];
        $value_type = "";

        foreach ($fieldArg as $column => $valueObject) {
            if (strtolower($valueObject['value']) === "null") {
                $table_column[] = "`{$column}` IS NULL";
                continue;
            } else {
                $table_column[] = "`{$column}` = ?";
                $table_value[] = $valueObject['value'];
                $value_type .= $valueObject['type'];
            }
        }




        if (!is_nan(intval($objId))) {
            // Check specific id on update
            $table_column[] = "`id` != ?";
            $table_value[] = $objId;
            $value_type .= "i";
        }

        $columnClause = implode(' AND ', $table_column);
        $duplicate_check_query = "SELECT * FROM changepart_set AS cp_set WHERE {$columnClause};";

        $duplicate_check_stmt = $connPD->prepare($duplicate_check_query);
        $duplicate_check_stmt->bind_param($value_type, ...$table_value);

        try {
            if ($duplicate_check_stmt->execute()) {
                $duplicate_reult = $duplicate_check_stmt->get_result();
                $duplicate_check_stmt->close();
                if ($duplicate_reult->num_rows > 0) {
                    // Duplication founded

                    return false;
                }

                // Continue running
            } else {
                throw new Exception("Query execution error: " . $duplicate_check_stmt->error);
            }


            return true;
        } catch (Exception $e) {
            // Code 400 is Query error
            return false;
        }
    }

    function insert_cp_set_with_duplication_check($arg = null)
    {

        if (cp_set_duplication_check($arg)) {

            if (insert_config($arg)) {
                $response['status'] = true;
                return $response;
            } else {
                $response['errorCode'] = 400;
                $response['status'] = false;
                return $response;
            }
        } else {
            // Code 100 is duplication founded
            $response['errorCode'] = 100;
            $response['status'] = false;
            return $response;
        }
    }


    function update_cp_set_with_duplication_check($arg = null)
    {

        if (cp_set_duplication_check($arg)) {

            if (update_config($arg)) {
                $response['status'] = true;
                return $response;
            } else {
                $response['errorCode'] = 400;
                $response['status'] = false;
                return $response;
            }
        } else {
            // Code 100 is duplication founded
            $response['errorCode'] = 100;
            $response['status'] = false;
            return $response;
        }
    }

    function delete_cp_set($arg = null)
    {


        if (delete_config($arg)) {
            $response['status'] = true;
            return $response;
        } else {
            $response['errorCode'] = 400;
            $response['status'] = false;
            return $response;
        }
    }
    // End Change Part set configuration


    // Posted Data Call the func
    $functionArray = isset($_POST['functions']) ? $_POST['functions'] : null;

    if (empty($functionArray) || count($functionArray) < 1) {
        $response['status'] = false;
        echo json_encode($response);
        $connPD->close();
        exit;
    } else {
        // Call each function

        foreach ($functionArray as $function) {
            $response[$function['name']] = $function['name']($function['arg']);
        }
        $response['status'] = true;
        echo json_encode($response);
        $connPD->close();
        exit;
    }
}
