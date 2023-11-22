<?php
require '../connection.php';
session_start();
if (!isset($_SESSION['usid'])) {
    header("refresh:0; url=../logout.php");
    exit;
}
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    function fetch_objects_list()
    {
        // Fetch All items Including MC/Parts
        global $conn;

        $mc_query = "SELECT mc.id AS id, mc.name AS `name`, mc.`location` AS `location` FROM mc ORDER BY mc.id;";

        $part_query = "SELECT part.id AS id, part.`name` AS `name`, part.spec AS spec, IFNULL(part.location, 'N/A') AS `location` FROM part ORDER BY part.id;";

        $mc_result = $conn->query($mc_query);
        $part_result = $conn->query($part_query);

        if ($mc_result) {
            $response['mc'] = $mc_result->num_rows > 0 ? $mc_result->fetch_all(MYSQLI_ASSOC) : true;
        } else {
            $response['mc'] = false;
        }
        if ($part_result) {
            $response['part'] = $part_result->num_rows > 0 ? $part_result->fetch_all(MYSQLI_ASSOC) : true;
        } else {
            $response['part'] = false;
        }
        $response['status'] = true;
        return $response;
    }


    function fetch_mc_all_select_option()
    {
        global $conn;
        // rank, type, status, group
        $query = "(
            SELECT id AS id, `name` AS `name`, 'mc_rank' AS `select_name` FROM mc_rank
          )
          UNION ALL
          (
            SELECT id AS id, `name` AS `name`, 'mc_type' AS `select_name` FROM mc_type
          )
          UNION ALL
          (
            SELECT id AS id, `status_name` AS `name`, 'status' AS `select_name` FROM `status`
          )
          UNION ALL
          (
            SELECT id AS id, `name` AS `name`, 'group_type' AS `select_name` FROM group_type
          )
          ORDER BY `select_name` ASC,id ASC;
          ";

        $result = $conn->query($query);

        if ($result->num_rows > 0) {

            $mc_rank = [];
            $mc_type = [];
            $status = [];
            $group_type = [];


            while ($res = $result->fetch_assoc()) {
                switch ($res['select_name']) {
                    case 'mc_rank':
                        $mc_rank[$res['id']] = $res['name'];
                        break;
                    case 'mc_type':
                        $mc_type[$res['id']] = $res['name'];
                        break;
                    case 'status':
                        $status[$res['id']] = $res['name'];
                        break;
                    case 'group_type':
                        $group_type[$res['id']] = $res['name'];
                        break;
                    default:
                        // Handle any other cases or errors here
                        break;
                }
            }
            $return['select_rank'] = $mc_rank;
            $return['select_type'] = $mc_type;
            $return['select_status'] = $status;
            $return['select_group'] = $group_type;
            $return['status'] = true;
            return $return;
        } else {
            return false;
        }
    }


    function fetch_object_detail($arg = null)
    {
        // Handle both machine and Part
        $type = isset($arg['type']) ? $arg['type'] : false;
        $objId = isset($arg['objId']) ? $arg['objId'] : false;

        if (!$type || !$objId) {
            $response['status'] = false;
            return $response;
        }

        global $conn;
        $query = "SELECT * FROM {$type} WHERE id={$objId};";
        $stmt = $conn->prepare($query);

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            if ($result->num_rows === 1) {
                $response['object_detail'] = $result->fetch_assoc();
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


    function update_object($arg = null)
    {
        $type = isset($arg['type']) ? $arg['type'] : '';
        $objId = isset($arg['objId']) ? $arg['objId'] : '';
        $usid = $_SESSION['usid'];
        if (empty($type) || empty($objId) || empty($arg)) {
            // In-depth arg check will be performed later on
            return false;
        }

        foreach ($arg as $key => $value) {
            if ($value === '') {
                $arg[$key] = null;
            }
        }
        global $conn;
        try {
            $conn->begin_transaction();

            if ($type == 'mc') {
                if (count($arg) != 8) {
                    // 1.Name 2. Location 3. Rank 4. Type 5. Status 6. Group
                    // Validation must be done from JS.
                    return false;
                }

                $query = "UPDATE mc SET `name` = ?, `location` = ?, fk_mc_rank = ?, `Type` = ?, `Status` = ?, fk_group = ? WHERE id = ?;";
                $stmt = $conn->prepare($query);
                $stmt->bind_param("sssiiii", $arg['name'], $arg['location'], $arg['fk_mc_rank'], $arg['Type'], $arg['Status'], $arg['fk_group'], $objId);
            } elseif ($type == 'part') {
                if (count($arg) != 13) {
                    // 1.Name 2. spec 3. safety_stock 4. unit 5. lead_time 6. location
                    // Validation must be done from JS.
                    // lead_time must be calculated to seconds before.
                    return false;
                }
                $query = "UPDATE part SET `name` = ?, spec = ?, safety_stock = ?, unit = ?, lead_time = ?, `location` = ?, auto_update_ss = ? WHERE id = ?;";
                $stmt = $conn->prepare($query);
                $stmt->bind_param("ssdsisii", $arg['name'], $arg['spec'], $arg['safety_stock'], $arg['unit'], $arg['lead_time'], $arg['location'],$arg['part_auto_ss'], $objId);

            } else {
                return false;
                // Not expecting anything here
            }

            if ($stmt->execute()) {


                $stmt->close();

                // Extra part->PI

                if($arg['part_stock_diff'] != 0) {

                    // Make Changes to real_in_stock, availi_stock (part)
                    // Insert transaction log (inven_transaction_log)

                    $part_stock_query = "UPDATE part SET instock = instock + ?, real_instock = real_instock + ? WHERE id = ?;";

                    $transaction_query = "INSERT INTO inven_transactions (fk_mrcode, fk_partid, t_type, t_quan, t_dt, t_actor, old_quantity, new_quantity,ref) VALUES (?, ?, ?, ?, NOW(), ?,(SELECT `real_instock` FROM `part` WHERE `id` = ?),(SELECT `real_instock` + ? FROM `part` WHERE `id` = ?),?);";


                    $transaction_stmt = $conn->prepare($transaction_query);

                    $transaction_stmt->bind_param("sisdiidis",$arg['stock_change_inform_reason'],$objId,$arg['stock_change_select_reason'],$arg['part_stock_diff'],$usid,$objId,$arg['part_stock_diff'],$objId,$arg['stock_change_inform_reason']);

                    $transaction_stmt->execute();

                    $transaction_stmt->close();



                    $part_stock_stmt = $conn->prepare($part_stock_query);

                    $part_stock_stmt->bind_param("ddi",$arg['part_stock_diff'],$arg['part_stock_diff'],$objId);

                    $part_stock_stmt->execute();

                    $part_stock_stmt->close();

                    
                    
                }

                $conn->commit();
                return true;
            } else {
                $conn->rollback();
                return false;
            }
        } catch (Exception $e) {
            $conn->rollback();
            return false;
        }
    }


    function new_object($arg = null)
    {
        $type = isset($arg['type']) ? $arg['type'] : '';
        if (empty($type) || empty($arg)) {
            return false;
        }
        foreach ($arg as $key => $value) {
            if ($value === "") {
                $arg[$key] = null;
            }
        }

        global $conn;
        try {
            $conn->begin_transaction();

            if ($type == 'mc') {
                if (count($arg) != 8) {
                    // 1. Name 2. Location 3. Rank 4. Type 5. Status 6. Group
                    // Validation must be done from JS.
                    return false;
                }
                $query = "INSERT INTO mc (`name`, `location`, fk_mc_rank, `TYPE`, `Status`, fk_group) VALUES (?, ?, ?, ?, ?, ?);";
                $stmt = $conn->prepare($query);
                $stmt->bind_param("sssiii", $arg['name'], $arg['location'], $arg['fk_mc_rank'], $arg['Type'], $arg['Status'], $arg['fk_group']);
            } elseif ($type == 'part') {
                if (count($arg) != 13) {
                    // 1. Name 2. spec 3. safety_stock 4. unit 5. lead_time 6. location
                    // Validation must be done from JS.
                    // lead_time must be calculated to seconds before.
                    return false;
                }
                $query = "INSERT INTO part (`name`, spec, safety_stock, unit, lead_time, `location`, auto_update_ss) VALUES (?, ?, ?, ?, ?, ?, ?);";
                $stmt = $conn->prepare($query);
                $stmt->bind_param("ssdsisi", $arg['name'], $arg['spec'], $arg['safety_stock'], $arg['unit'], $arg['lead_time'], $arg['location'],$arg['part_auto_ss']);
            } else {
                return false;
                // Not expecting anything here
            }

            if ($stmt->execute()) {
                $conn->commit();
                return true;
            } else {
                $conn->rollback();
                return false;
            }
        } catch (Exception $e) {
            $conn->rollback();
            return false;
        }
    }




    // Posted Data Call the func
    $functionArray = isset($_POST['functions']) ? $_POST['functions'] : null;

    if (empty($functionArray) || count($functionArray) < 1) {
        $response['status'] = false;
        echo json_encode($response);
        $conn->close();
        exit;
    } else {
        // Calleach function

        foreach ($functionArray as $function) {
            $response[$function['name']] = $function['name']($function['arg']);
        }
        $response['status'] = true;
        echo json_encode($response);
        $conn->close();
        exit;
    }
}
