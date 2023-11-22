<?php

require '../connection.php';
session_start();
// if ( !isset($_SESSION['usid']) || !($_SESSION['departmentCode'] == 2 || $_SESSION['departmentCode'] == 6)){
//     header("Location: ../logout.php");
//     exit;
// }

if ($_SERVER['REQUEST_METHOD'] === 'POST') {




    function generate_itmCode($prefix, $maxLength)
    {
        // Max length should be set at 60 characters
        if (strlen($prefix) >= $maxLength) {
            throw new Exception("Prefix is longer than the maximum length.");
        }

        $uniquePart = substr(str_shuffle("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"), 0, $maxLength - strlen($prefix));
        $uniqueString = $prefix . $uniquePart;

        return $uniqueString;
    }

    function generateUniquePR()
    {
        // Get the current date in the format "d-m-y"
        global $conn;
        $uidResult = mysqli_query($conn, "SELECT pr_code  FROM prequest_form ORDER BY t_stamp DESC LIMIT 1");
        if ($uidResult->num_rows > 0) {
            $lastUID = mysqli_fetch_assoc($uidResult)['pr_code'];
        } else {
            $lastUID = null;
        }

        $lastUID = ($lastUID !== null) ? $lastUID : '';
        $currentDate = date('d-m-y');

        if ($lastUID === null || $lastUID === '') {
            // If $lastUID is empty or not found, generate the first ID for the day with counter set to 001
            return "RQ-" . $currentDate . "/001";
        }

        // Get the date part of the last UID
        $lastDate = substr($lastUID, 3, 8);

        // Check if the current date is the same as the last date
        if ($currentDate === $lastDate) {
            // Increment the counter by 1
            $counter = intval(substr($lastUID, -3)) + 1;
            $counter = str_pad($counter, 3, '0', STR_PAD_LEFT);
        } else {
            // Reset the counter to 001
            $counter = '001';
        }

        // Generate the unique ID
        return "RQ-" . $currentDate . "/" . $counter;
    }

    function insert_new_pr()
    {

        global $conn;

        $new_prCode = generateUniquePR();

        $query = "INSERT INTO prequest_form (pr_code) VALUES ('{$new_prCode}');";

        try {

            if ($conn->query($query)) {
                $response['prCode'] = $new_prCode;
                $response['status'] = true;
                return $response;
            } else {
                throw new Exception('Query Erorr');
            }
        } catch (Exception $e) {
            $response['status'] = false;
            return $response;
        }
    }


    function confirm_pr($arg = null)
    {

        global $conn;

        $req_user_id = $_SESSION['usid'];
        $prCode = $arg['prCode'] ?? false;
        $update_group = $arg['group'] ?? false;
        $update_job = $arg['job'] ?? false;
        $update_reqBy_date = $arg['reqBy_date'] ?? false;

        if (!($prCode && $update_group && $update_job && $update_reqBy_date)) {
            $response['status'] = false;
            return $response;
        }

        // Check if any item added

        try {

            $conn->begin_transaction();

            $item_check_query = "SELECT COUNT(*) AS itm_count FROM prequest_items WHERE `fk_pr_code` = ?;";
            $item_check_stmt = $conn->prepare($item_check_query);

            $item_check_stmt->bind_param("s", $prCode);

            if ($item_check_stmt->execute()) {

                $item_check_result = $item_check_stmt->get_result();

                $item_check_stmt->close();
                $itm_count = ($item_check_result->fetch_array())[0];

                if ($itm_count < 1) {
                    $response['err'] = "200";
                    $response['status'] = true;
                    return $response;
                }
            } else {
                throw new Exception('Check Query Error');
            }


            // Update the pr

            $updatePR_query = "UPDATE prequest_form SET `inform_date` = NOW(), `reqby_date` = ?, `req_emp_id` = ?, `status` = 1, `pr_group` = ?, `pr_type` = ? WHERE pr_code = ?;";
            $updatePR_stmt = $conn->prepare($updatePR_query);

            $updatePR_stmt->bind_param("siiis", $update_reqBy_date, $req_user_id, $update_group, $update_job, $prCode);

            if ($updatePR_stmt->execute()) {

                $updatePR_stmt->close();

                $updatePR_ITM_query = "UPDATE prequest_items SET `status` = 1 WHERE `fk_pr_code` = ?;";
                $updatePR_ITM_stmt = $conn->prepare($updatePR_ITM_query);

                $updatePR_ITM_stmt->bind_param("s", $prCode);

                if ($updatePR_ITM_stmt->execute()) {
                    $updatePR_ITM_stmt->close();
                    $conn->commit();
                    $response['status'] = true;
                    return $response;
                } else {
                    throw new Exception('Update Itm_Query Error');
                }
            } else {
                throw new Exception('Update PR_Query Error');
            }
        } catch (Exception $e) {
            $conn->rollback();
            $response['err_msg'] = $e->getMessage();
            $resppnse['status'] = false;
            return $response;
        }
    }


    function sub_confirm_openPR_item($arg = null)
    {

        global $conn;

        $itmCode = $arg['itmCode'] ?? false;
        $itm_cf_quan = $arg['cf_quan'] ?? false;
        if (!$itmCode) {
            $response['status'] = false;
            return $response;
        }

        // itmCode -> Get PR status related to this item -> Only PR's status = 2 to allow processing

        try {

            $conn->begin_transaction();

            $items_pr_status_stmt = $conn->prepare("SELECT pr.`status` FROM prequest_items AS pq_i INNER JOIN prequest_form AS pr ON pq_i.fk_pr_code = pr.pr_code WHERE pq_i.itm_code = ? LIMIT 1;");

            $items_pr_status_stmt->bind_param("s", $itmCode);

            $items_pr_status_stmt->execute();
            $items_pr_check_result = $items_pr_status_stmt->get_result();

            $status = ($items_pr_check_result->fetch_array())[0];

            if ($status != 2) {
                throw new Exception("Invalid RQ's status");
            }

            // Valid status -> change itm status to 6 -> Wait for PR approval goods
            $items_pr_status_stmt->close();

            $itm_cf_query = "UPDATE prequest_items SET cf_quan = ?, `status` = 6 WHERE itm_code = ?;";
            $itm_cf_stmt = $conn->prepare($itm_cf_query);

            $itm_cf_stmt->bind_param("ds", $itm_cf_quan, $itmCode);

            if ($itm_cf_stmt->execute()) {

                $conn->commit();
                $response['status'] = true;
                return $response;
            } else {
                throw new Exception('Update query error');
            }
        } catch (Exception $e) {
            $conn->rollback();
            $response['err'] = $e->getMessage();
            $response['status'] = false;
            return $response;
        }
    }


    function confirm_openPR($arg = null)
    {


        global $conn;

        $prCode = $arg['prCode'] ?? false;

        if (!$prCode) {
            $response['status'] = false;
            return $response;
        }

        // Check status -> 1 only -> update pr status to 2 and items status to 2;

        $pr_state_check_query = "SELECT `status` AS pr_status FROM prequest_form WHERE pr_code = ?";

        $pr_state_check_stmt = $conn->prepare($pr_state_check_query);

        try {
            $conn->begin_transaction();
            $pr_state_check_stmt->bind_param("s", $prCode);
            if ($pr_state_check_stmt->execute()) {
                $pr_state_check_result = $pr_state_check_stmt->get_result();
                $status = $pr_state_check_result->fetch_array()[0];

                if ($status != 1) {
                    throw new Exception("Invalid Pr Status");
                }
            } else {
                throw new Exception("Code Check Query Error");
            }


            // Valid Status
            $updatePR_query = "UPDATE prequest_form SET `status` = 2  WHERE pr_code = ?;";
            $updatePR_stmt = $conn->prepare($updatePR_query);

            $updatePR_stmt->bind_param("s", $prCode);

            if ($updatePR_stmt->execute()) {

                $updatePR_stmt->close();

                $updatePR_ITM_query = "UPDATE prequest_items SET `status` = 2 WHERE `fk_pr_code` = ?;";
                $updatePR_ITM_stmt = $conn->prepare($updatePR_ITM_query);

                $updatePR_ITM_stmt->bind_param("s", $prCode);

                if ($updatePR_ITM_stmt->execute()) {
                    $updatePR_ITM_stmt->close();
                    $conn->commit();
                    $response['status'] = true;
                    return $response;
                } else {
                    throw new Exception('Update Itm_Query Error');
                }
            } else {
                throw new Exception('Update PR_Query Error');
            }
        } catch (Exception $e) {
            $conn->rollback();
            $response['err'] = $e->getMessage();
            $response['status'] = false;
            return $response;
        }
    }


    function delete_pr($arg = null)
    {
        global $conn;
        $prCode = mysqli_real_escape_string($conn, $arg['prCode']) ?? false;

        if (!$prCode) {
            return false;
        }

        $pr_status = mysqli_fetch_assoc(mysqli_query($conn, "SELECT `status` AS prStatus_name FROM prequest_form WHERE pr_code = '{$prCode}';"))['prStatus_name'];

        if (!($pr_status == 0 || $pr_status == 1)) {
            // Only temporary/wait for approval items are removable
            return false;
        } else {

            try {
                $conn->begin_transaction();

                $query = "DELETE FROM prequest_form WHERE pr_code = ?";
                $del_stmt = $conn->prepare($query);
                $del_stmt->bind_param("s", $prCode);

                if ($del_stmt->execute()) {
                    $conn->commit();
                    return true;
                } else {
                    throw new Exception('Query Error');
                }
            } catch (Exception $e) {
                $conn->rollback();
                return false;
            }
        }
    }

    function done_openPR($arg = null)
    {

        global $conn;

        // Change PR's status to 3 and check if cf_quan of each items = 0 or not -> if true, set status = 5 (cancel), if not -> set status to 3
        // On ordered item -> UPDATE part's on order column

        // This can be act on PR's status = 2 only

        global $conn;

        $prCode = $arg['prCode'] ?? false;
        $real_pr = strtolower($arg['real_pr'] ?? "null") == "null" ? null : $arg['real_pr'];

        if (!$prCode) {
            $response['status'] = false;
            return $response;
        }

        // Check status -> 1 only -> update pr status to 2 and items status to 2;

        $pr_state_check_query = "SELECT `status` AS pr_status FROM prequest_form WHERE pr_code = ?";

        $pr_state_check_stmt = $conn->prepare($pr_state_check_query);

        try {
            $conn->begin_transaction();
            $pr_state_check_stmt->bind_param("s", $prCode);
            if ($pr_state_check_stmt->execute()) {
                $pr_state_check_result = $pr_state_check_stmt->get_result();
                $status = $pr_state_check_result->fetch_array()[0];

                if ($status != 2) {
                    throw new Exception("Invalid Pr Status");
                }
            } else {
                throw new Exception("Code Check Query Error");
            }


            // Valid Status
            $updatePR_query = "UPDATE prequest_form SET `status` = 3, real_pr = ?, approved_date = NOW() WHERE pr_code = ?;";
            $updatePR_stmt = $conn->prepare($updatePR_query);

            $updatePR_stmt->bind_param("ss", $real_pr, $prCode);

            if ($updatePR_stmt->execute()) {

                $updatePR_stmt->close();

                $updatePR_ITM_query = "UPDATE
                prequest_items pi
                JOIN part p ON pi.fk_part_id = p.id
            SET
                pi.`status` = CASE WHEN pi.`cf_quan` = 0 THEN
                    5
                ELSE
                    3
                END,
                p.ordered_stock = p.ordered_stock + pi.cf_quan
            WHERE
                pi.`fk_pr_code` = ?;";

                $updatePR_ITM_stmt = $conn->prepare($updatePR_ITM_query);

                $updatePR_ITM_stmt->bind_param("s", $prCode);

                if ($updatePR_ITM_stmt->execute()) {
                    $updatePR_ITM_stmt->close();
                    $conn->commit();
                    $response['status'] = true;
                    return $response;
                } else {
                    throw new Exception('Update Itm_Query Error');
                }
            } else {
                throw new Exception('Update PR_Query Error');
            }
        } catch (Exception $e) {
            $conn->rollback();
            $response['err'] = $e->getMessage();
            $response['status'] = false;
            return $response;
        }
    }


    function remove_item($arg = null)
    {
        global $conn;

        $itmCode = $arg['itmCode'] ?? false;

        if (!$itmCode) {
            $response['status'] = false;
            return $response;
        }

        $query = "DELETE FROM prequest_items WHERE `itm_code` = ?;";

        try {
            $conn->begin_transaction();

            $stmt = $conn->prepare($query);

            $stmt->bind_param("s", $itmCode);

            if ($stmt->execute()) {

                $conn->commit();
                $response['status'] = true;
                return $response;
            } else {
                throw new Exception("Deletion Error");
            }
        } catch (Exception $e) {
            $conn->rollback();
            $response['err'] = $e->getMessage();
            $response['status'] = false;
            return $response;
        }
    }

    function fetch_part_list()
    {
        // Fetch All items Including MC/Parts
        global $conn;


        $part_query = "SELECT part.id AS id, part.`name` AS `name`, part.spec AS spec, IFNULL(part.location, 'N/A') AS `location` FROM part ORDER BY part.id;";

        $part_result = $conn->query($part_query);
        try {

            if ($part_result) {
                $response['part'] = $part_result->num_rows > 0 ? $part_result->fetch_all(MYSQLI_ASSOC) : [];
                $response['status'] = true;
                return $response;
            } else {
                throw new Exception("Query Error");
            }
        } catch (Exception $e) {
            $response['status'] = false;
            return $response;
        }
    }


    function fetch_group_type_selection()
    {

        global $conn;

        $query = "(SELECT
        g. `id` AS id,
        g. `name` AS name,
        'group' AS col_type
    FROM
        group_type AS g
    ORDER BY
        id ASC)
    UNION
    (SELECT
        j. `id` AS id,
        j. `name` AS name,
        'job' AS col_type
    FROM
        job AS j
    ORDER BY
        id ASC);";

        $result = $conn->query($query);

        if ($result->num_rows > 0) {
            $response['group'] = [];
            $response['job'] = [];
            while ($res = $result->fetch_assoc()) {
                $response[$res['col_type']][$res['id']] = $res['name'];
            }

            $response['status'] = true;
            return $response;
        } else {
            $response['status'] = false;
            return $response;
        }
    }

    function clean_one_year_pr()
    {
        global $conn;

        // First, select pr_code values to delete
        $sql = "SELECT pr_code AS pr_code FROM prequest_form WHERE DATEDIFF(NOW(), t_stamp) >= 365;";
        $result = $conn->query($sql);

        if ($result) {
            $codesToDelete = [];

            while ($row = $result->fetch_assoc()) {
                $codesToDelete[] = $row['pr_code'];
            }

            // Check if there are codes to delete
            if (!empty($codesToDelete)) {
                $codeList = "'" . implode("','", $codesToDelete) . "'";
                $deleteSql = "DELETE FROM prequest_form WHERE pr_code IN ($codeList)";

                try {
                    $conn->begin_transaction();
                    // Execute the DELETE query
                    if ($conn->query($deleteSql)) {
                        $conn->commit();
                    } else {
                        throw new Exception('Query Error');
                    }
                } catch (Exception $e) {

                    $conn->rollback();
                }
            }
        }
    }

    function clean_old_tmp_pr()
    {
        global $conn;

        // First, select pr_code values to delete
        $sql = "SELECT pr_code AS pr_code FROM prequest_form WHERE DATEDIFF(NOW(), t_stamp) >= 1 AND `status` = 0;";
        $result = $conn->query($sql);

        if ($result) {
            $codesToDelete = [];

            while ($row = $result->fetch_assoc()) {
                $codesToDelete[] = $row['pr_code'];
            }

            // Check if there are codes to delete
            if (!empty($codesToDelete)) {
                $codeList = "'" . implode("','", $codesToDelete) . "'";
                $deleteSql = "DELETE FROM prequest_form WHERE pr_code IN ($codeList)";

                try {
                    $conn->begin_transaction();
                    // Execute the DELETE query
                    if ($conn->query($deleteSql)) {
                        $conn->commit();
                    } else {
                        throw new Exception('Query Error');
                    }
                } catch (Exception $e) {

                    $conn->rollback();
                }
            }
        }
    }

    function check_ss_alert($arg = null) {
        global $conn;

        $query = "SELECT
        p.id AS part_id,
        p.name AS part_name,
        p.spec AS part_spec,
        p.safety_stock AS ss_stock,
        p.real_instock AS real_instock,
        p.ordered_stock AS onOrdered_stock,
        (p.safety_stock - (p.real_instock + p.ordered_stock)) AS need_to_order
    FROM
        part AS p
    WHERE (p.real_instock + p.ordered_stock) < safety_stock;";


try {

    $result = $conn->query($query);

    $response['ss_alert'] = [];

    if($result->num_rows >0) {
        $response['ss_alert'] = $result->fetch_all(MYSQLI_ASSOC);
    }

    $response['status'] = true;
    return $response;

} catch (Exception $e) {

    $response['error'] = $e->getMessage();
    $response['status'] = false;
    return $response;
}


    }

    function fetch_requested_pr_part_id($arg = null)
    {

        global $conn;
        $prCode = $arg['prCode'] ?? false;
        if (!$prCode) {
            $response['status'] = true;
            $response['requested_part_id'] = [];
            return $response;
        }

        $query = "SELECT `fk_part_id` FROM prequest_items WHERE `fk_pr_code` = ?";

        $stmt = $conn->prepare($query);

        $stmt->bind_param("s", $prCode);

        $stmt->execute();

        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            while ($res = $result->fetch_array()) {

                $response['requested_part_id'][] = $res[0];
            }
            $response['status'] = true;
            return $response;
        } else {
            $response['status'] = true;
            $response['requested_part_id'] = [];
            return $response;
        }
    }

    function fetch_uploaded_img_key($arg = null)
    {

        global $conn;

        $itmCode = $arg['itmCode'] ?? false;
        if (!$itmCode) {
            $response['status'] = true;
            return $response;
        }

        $query = "SELECT `img_uq_id` AS img_uq_id FROM prequest_img WHERE fk_req_item_id = ?;";

        try {
            $stmt = $conn->prepare($query);
            $stmt->bind_param("s", $itmCode);
            if ($stmt->execute()) {
                $result = $stmt->get_result();

                $response['uploaded_img_key'] = [];
                if ($result->num_rows > 0) {

                    while ($res = $result->fetch_assoc()) {
                        $response['uploaded_img_key'][] = $res['img_uq_id'];
                    }
                }
                $response['status'] = true;
                return $response;
            } else {
                throw new Exception("Query Error");
            }
        } catch (Exception $e) {
            $response['status'] = false;
            $response['err'] = $e->getMessage();
            return $response;
        }
    }

    function fetch_requested_pr($arg = null)
    {

        global $conn;
        $specific_prCode = !isset($arg['prCode']) ? "" : "AND pr_form.pr_code = '" . mysqli_real_escape_string($conn, $arg['prCode']) . "'";
        $fetched_for_GR = !isset($arg['for_gr']) ? "" : "AND pr_form.`status` = 3";
        $query = "SELECT
        pr_form.pr_code AS prCode,
        IFNULL(pr_form.inform_date,'') AS informDate,
        IFNULL(pr_form.reqby_date,'') AS reqByDate,
        pr_form.status AS prStatus,
        IFNULL(pr_status.`name`,'') AS prStatus_name,
        IFNULL(part.name,'') AS pr_itm_part_name,
        IFNULL(part.spec,'') AS pr_itm_part_spec,
        pr_items.fk_pr_code AS pr_itm_prCode,
        IFNULL(pr_items.status,'') AS pr_itm_itm_status,
        IFNULL(itm_status.`name`,'') AS pr_itm_itm_status_name,
        IFNULL(pr_items.fk_part_id,'') AS pr_itm_part_id,
        IFNULL(pr_items.req_quan,'') AS pr_itm_req_quan,
        IFNULl(pr_items.cf_quan,'') AS pr_itm_cf_quan,
        IFNULL(pr_items.gr_quan,'') AS pr_itm_gr_quan,
        IFNULL(pr_items.itm_code,'') AS pr_itm_itm_code,
        IFNULL(pr_form.pr_group,'') AS prGroup,
        IFNULL(pr_form.pr_type,'') AS prType,
        IFNULL(job_group.`name`,'') AS prGroup_name,
        IFNULL(job_type.`name`,'') AS prType_name,
        IFNULL(pr_items.note,'-') AS pr_itm_note,
        IFNULL(pr_form.real_pr,'N/S') AS real_pr,
        IFNULL(pr_form.real_pr,'N/S') AS pr_itm_itm_real_pr
    FROM
        prequest_form AS pr_form
        LEFT JOIN prequest_items AS pr_items ON pr_form.pr_code = pr_items.fk_pr_code
        LEFT JOIN part ON part.id = pr_items.fk_part_id
        LEFT JOIN prequest_status AS pr_status ON pr_status.id = pr_form.status
        LEFT JOIN group_type AS job_group ON job_group.id = pr_form.pr_group
        LEFT JOIN job AS job_type ON job_type.id = pr_form.pr_type
        LEFT JOIN prequest_status AS itm_status ON itm_status.id = pr_items.status
    WHERE (pr_items.`status` != 5 || pr_items.`status` IS NULL) {$specific_prCode} {$fetched_for_GR}
    ORDER BY
CASE
    WHEN pr_form.status = 0 THEN 997
    WHEN pr_form.status = 4 THEN 998
    WHEN pr_form.status = 5 THEN 999
    WHEN pr_form.status = 1 THEN 0
    WHEN pr_form.status = 2 THEN 1
    ELSE 3                 
  END,
  pr_form.status ASC,
  pr_form.reqby_date ASC;";


        try {
            $result = $conn->query($query);

            if ($result->num_rows > 0) {

                $tableData = [];

                while ($res = $result->fetch_assoc()) {
                    $prCode = $res['prCode'];

                    if (!isset($tableData[$prCode])) {
                        foreach ($res as $key => $value) {
                            if (str_starts_with($key, "pr_itm")) {
                                // pr_items
                                if ($res['pr_itm_itm_code'] == "") {
                                    continue;
                                }
                                $tableData[$prCode]['itmlist'][$res['pr_itm_itm_code']][$key] = $value;
                            } else {
                                $tableData[$prCode][$key] = $value;
                            }
                        }
                    } else {
                        foreach ($res as $key => $value) {
                            if (str_starts_with($key, "pr_itm")) {
                                // pr_items
                                if ($res['pr_itm_part_id'] == "") {
                                    continue;
                                }
                                $tableData[$prCode]['itmlist'][$res['pr_itm_itm_code']][$key] = $value;
                            }
                        }
                    }
                }



                $response['tableData'] = $tableData;
                $response['status'] = true;
                return $response;
            } else {
                $response['tableData'] = [];
                $response['status'] = true;
                return $response;
            }
        } catch (ErrorException $e) {

            $response['status'] = false;
            return $response;
        }
    }


    function fetch_requested_items($arg = null)
    {

        global $conn;

        $query = "SELECT
        pr_itm.fk_part_id AS pr_itm_part_id,
        p.name AS pr_itm_part_name,
        p.spec AS pr_itm_part_spec,
        SUM(CASE WHEN pr_itm.status = 1 THEN pr_itm.req_quan ELSE 0 END) AS informed_count,
        SUM(CASE WHEN pr_itm.status = 3 THEN pr_itm.cf_quan ELSE 0 END) AS pr_opened_count
    FROM
        prequest_items AS pr_itm
    LEFT JOIN
        part AS p ON p.id = pr_itm.fk_part_id
    WHERE pr_itm.`status` <= 3
    GROUP BY
        pr_itm.fk_part_id, p.name, p.spec
    ORDER BY
        pr_itm.fk_part_id ASC;";

        try {

            $response['requested_item'] = [];

            $result = $conn->query($query);

            if ($result->num_rows > 0) {
                $response['requested_item'] = $result->fetch_all(MYSQLI_ASSOC);
            }

            $response['status'] = true;
        } catch (Exception $e) {
            $response['err'] = $e->getMessage();
            $response['status'] = true;
            $response['requested_item'] = [];
        }

        return $response;
    }


    // GR part

    function gr_item($arg = null)
    {


        global $conn;

        $prCode = $arg['prCode'] ?? false;
        $itmCode = $arg['itmCode'] ?? false;
        $gr_quan = $arg['gr_quan'] ?? false;
        $refCode = strtolower($arg['refCode'] ?? "null") === "null" ? null : $arg['refCode'];
        $usid = $_SESSION['usid'];

        // Proceed and update data

        if (!$itmCode || is_nan($gr_quan) || !$prCode) {

            $response['status'] = false;
            $response['err'] = "Invalid ItmCode / Gr Quantity";
            return $response;
        }

        // status check -> 3 only
        $pr_state_check_query = "SELECT pq_form.`status` AS pr_status, pq_itm.`status` AS itm_status FROM prequest_form AS pq_form RIGHT JOIN prequest_items AS pq_itm ON pq_form.pr_code = pq_itm.fk_pr_code WHERE pq_form.pr_code = ? AND pq_itm.itm_code = ?";

        try {
            $conn->begin_transaction();
            $pr_state_check_stmt = $conn->prepare($pr_state_check_query);
            $pr_state_check_stmt->bind_param("ss", $prCode, $itmCode);
            if ($pr_state_check_stmt->execute()) {
                $pr_state_check_result = $pr_state_check_stmt->get_result();
                $state_check_res = $pr_state_check_result->fetch_assoc();
                $status = $state_check_res['pr_status'];
                $itm_status = $state_check_res['itm_status'];

                if ($status != 3 || $itm_status != 3) {
                    throw new Exception("Invalid Pr / Itm Status");
                }
            } else {
                throw new Exception("Code Check Query Error");
            }

            // Valid Pr


            // Update gr quan of itmCode
            // Check if cf quan = new gr + old gr -> change status to done.
            // Add GR transaction to log (transaction log)-> decrease on order (part) -> increase real in stock (part)

            // Check if all items related to gr have doenst have status = 3 -> (some may be gr and some may be canceled)

            $fetch_part_id_query = "SELECT fk_part_id AS part_id FROM prequest_items WHERE itm_code = ?;";

            $fetch_part_id_stmt = $conn->prepare($fetch_part_id_query);
            $fetch_part_id_stmt->bind_param("s", $itmCode);

            $fetch_part_id_stmt->execute();

            $partResult = $fetch_part_id_stmt->get_result();
            $partData = $partResult->fetch_assoc();

            if ($partData !== null) {
                $part_id = $partData['part_id'];
            } else {
                throw new Exception("partId Error");
            }




            $update_gr_quan_query = "UPDATE
            prequest_items
        SET
            gr_quan = gr_quan + ?,
            `status` = CASE WHEN gr_quan = cf_quan THEN
                4
            ELSE
                `status`
            END,
            `gr_done_date` = CASE WHEN `status` = 4 THEN NOW() ELSE NULL END
        WHERE
            itm_code = ?;";

            $update_part_order_stock_query = "UPDATE part SET ordered_stock = ordered_stock - ?, real_instock = real_instock + ? WHERE `id` = ?;";
            $gr_transaction_log_query = "INSERT INTO inven_transactions (fk_mrcode, fk_partid, t_type, t_quan, t_dt, t_actor, old_quantity, new_quantity,ref) VALUES (?, ?, 'GR', ?, NOW(), ?,(SELECT `real_instock` FROM `part` WHERE `id` = ?),(SELECT `real_instock` + ? FROM `part` WHERE `id` = ?),?);";

            $check_pr_related_items_query = "UPDATE prequest_form
            SET `status` = CASE
                WHEN (SELECT COUNT(*) FROM prequest_items WHERE fk_pr_code = ? AND `status` = 3) = 0 THEN 4
                ELSE `status`
            END
            WHERE pr_code = ?;";

            // update_gr_quan

            $update_gr_quan_stmt = $conn->prepare($update_gr_quan_query);

            $update_gr_quan_stmt->bind_param("ds", $gr_quan, $itmCode);

            $update_gr_quan_stmt->execute();

            $update_gr_quan_stmt->close();


            $update_part_order_stock_stmt = $conn->prepare($update_part_order_stock_query);

            $update_part_order_stock_stmt->bind_param("ddi", $gr_quan, $gr_quan, $part_id);

            $update_part_order_stock_stmt->execute();

            $update_part_order_stock_stmt->close();


            $gr_transaction_log_stmt = $conn->prepare($gr_transaction_log_query);

            $gr_transaction_log_stmt->bind_param("sidiidis", $prCode, $part_id, $gr_quan, $usid, $part_id, $gr_quan, $part_id, $refCode);

            $gr_transaction_log_stmt->execute();

            $gr_transaction_log_stmt->close();


            $check_pr_related_items_stmt = $conn->prepare($check_pr_related_items_query);

            $check_pr_related_items_stmt->bind_param("ss", $prCode, $prCode);

            $check_pr_related_items_stmt->execute();

            if ($check_pr_related_items_stmt->affected_rows >= 1) {
                $response['all_done'] = true;
            }else {
                $response['all_done'] = false;
            }
            $check_pr_related_items_stmt->close();


            $conn->commit();
            
            $response['status'] = true;
            return $response;
        } catch (Exception $e) {

            $conn->rollback();
            $response['err'] = $e->getMessage();
            $response['status'] = false;
            return $response;
        }
    }



    function cancel_gr_item($arg = null)
    {

        global $conn;

        $itmCode = $arg['itmCode'] ?? false;
        $prCode = $arg['prCode'] ?? false;
        $usid = $_SESSION['usid'];

        $pr_state_check_query = "SELECT pq_form.`status` AS pr_status, pq_itm.`status` AS itm_status FROM prequest_form AS pq_form RIGHT JOIN prequest_items AS pq_itm ON pq_form.pr_code = pq_itm.fk_pr_code WHERE pq_form.pr_code = ? AND pq_itm.itm_code = ?";

        try {
            $conn->begin_transaction();
            $pr_state_check_stmt = $conn->prepare($pr_state_check_query);
            $pr_state_check_stmt->bind_param("ss", $prCode, $itmCode);
            if ($pr_state_check_stmt->execute()) {
                $pr_state_check_result = $pr_state_check_stmt->get_result();
                $state_check_res = $pr_state_check_result->fetch_assoc();
                $status = $state_check_res['pr_status'];
                $itm_status = $state_check_res['itm_status'];

                if ($status != 3 || $itm_status != 3) {
                    throw new Exception("Invalid Pr / Itm Status");
                }
            } else {
                throw new Exception("Code Check Query Error");
            }

            // Valid Pr

            // Cancel all remaining quantities ->, set status to -> 4
            // Insert log abount canceling
            // Decrease On order stock

            $fetch_part_id_query = "SELECT fk_part_id AS part_id, (cf_quan - gr_quan) AS canceled_quan FROM prequest_items WHERE itm_code = ?;";

            $fetch_part_id_stmt = $conn->prepare($fetch_part_id_query);
            $fetch_part_id_stmt->bind_param("s", $itmCode);

            $fetch_part_id_stmt->execute();

            $partResult = $fetch_part_id_stmt->get_result();
            $partData = $partResult->fetch_assoc();

            if ($partData !== null) {
                $part_id = $partData['part_id'];
                $canceled_quan = $partData['canceled_quan'];
            } else {
                throw new Exception("partId Error");
            }



            $update_itm_status_query = "UPDATE
            prequest_items
        SET
            `status` = CASE WHEN gr_quan > 0 THEN
                4
            ELSE
                5
            END,
            gr_done_date = CASE WHEN `status` = 4 THEN
                NOW()
            ELSE
                NULL
            END
        WHERE
            itm_code = ?;";
            $update_part_order_stock_query = "UPDATE part SET ordered_stock = ordered_stock - ? WHERE `id` = ?;";
            $cancel_transaction_log_query = "INSERT INTO inven_transactions (fk_mrcode, fk_partid, t_type, t_quan, t_dt, t_actor, old_quantity, new_quantity) VALUES (?, ?, 'GR_canceled', ?, NOW(), ?,(SELECT `real_instock` FROM `part` WHERE `id` = ?),(SELECT `real_instock` FROM `part` WHERE `id` = ?));";

            $check_pr_related_items_query = "UPDATE prequest_form
        SET `status` = CASE
            WHEN (SELECT COUNT(*) FROM prequest_items WHERE fk_pr_code = ? AND `status` = 3) = 0 THEN 4
            ELSE `status`
        END
        WHERE pr_code = ?;";


            $update_itm_status_stmt = $conn->prepare($update_itm_status_query);

            $update_itm_status_stmt->bind_param("s", $itmCode);

            $update_itm_status_stmt->execute();

            $update_itm_status_stmt->close();


            $update_part_order_stock_stmt = $conn->prepare($update_part_order_stock_query);

            $update_part_order_stock_stmt->bind_param("di", $canceled_quan, $part_id);

            $update_part_order_stock_stmt->execute();

            $update_part_order_stock_stmt->close();

            
            $cancel_transaction_log_stmt = $conn->prepare($cancel_transaction_log_query);

            $cancel_transaction_log_stmt->bind_param("sidiii", $prCode, $part_id, $canceled_quan, $usid, $part_id, $part_id);

            $cancel_transaction_log_stmt->execute();

            $cancel_transaction_log_stmt->close();


            $check_pr_related_items_stmt = $conn->prepare($check_pr_related_items_query);

            $check_pr_related_items_stmt->bind_param("ss", $prCode, $prCode);

            $check_pr_related_items_stmt->execute();
            if ($check_pr_related_items_stmt->affected_rows >= 1) {
                $response['all_done'] = true;
            }else {
                $response['all_done'] = false;
            }

            $check_pr_related_items_stmt->close();

            $conn->commit();

            $response['status'] = true;
            return $response;
        } catch (Exception $e) {

            $conn->rollback();
            $response['err'] = $e->getMessage();
            $response['status'] = false;
            return $response;
        }
    }

    // End Gr part


    $functionArray = isset($_POST['functions']) ? $_POST['functions'] : null;

    if (empty($functionArray) || count($functionArray) < 1) {
        $response['status'] = false;
        echo json_encode($response);
        $conn->close();
        exit;
    } else {
        // Call each function

        foreach ($functionArray as $function) {
            $response[$function['name']] = $function['name']($function['arg']);
        }
        $response['status'] = true;
        echo json_encode($response);
        $conn->close();
        exit;
    }
}
