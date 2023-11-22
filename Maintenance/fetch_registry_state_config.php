<?php
require '../connection.php';
session_start();
if (!isset($_SESSION['usid'])) {
    header("refresh:0; url=../logout.php");
    exit;
}
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $allowTableName = [
        "mc_type",
        "mc_rank",
        "group_type",
        "status",
        "job",
        "department",
        "auth_type",
        "employee"
    ];

    function fetch_config_detail($arg = null)
    {
        global $conn;
        global $allowTableName;
        $table = isset($arg['tableName']) ? mysqli_real_escape_string($conn, $arg['tableName']) : false;
        if (!$table) {
            $response['status'] = false;
            return $response;
        }


        if (!in_array($table, $allowTableName)) {
            $response['status'] = false;
            return $response;
        }
        $query = "SELECT * FROM {$table} ORDER BY editable DESC, id ASC;";

        $stmt = $conn->prepare($query);

        if ($stmt->execute()) {
            $tableResult = $stmt->get_result();
            $response['status'] = true;
            $response['tableData'] = $tableResult->fetch_all(MYSQLI_BOTH);
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


    function update_config_detail($arg = null)
    {
        global $conn;
        global $allowTableName;
        // objId, TableName , Respective Column Name and Value should be sent in $arg

        $table = mysqli_real_escape_string($conn, $arg['tableName'] ?? false);
        $objId = mysqli_real_escape_string($conn, $arg['objId'] ?? false);
        $fieldArg = $arg['columnVal'] ?? false;

        if (!in_array($table, $allowTableName) || !$objId || !$fieldArg) {
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
            $list_values[] = $valueObject['value'];
        }

        // Add obj Id to be binded
        $list_types .= 'i';
        $list_values[] = &$objId;


        $set_clause = implode(', ', $list_columns);

        // Construct the full SQL query
        $query = "UPDATE {$table} SET $set_clause WHERE id = ?;";
        $stmt = $conn->prepare($query);

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
                $conn->commit();
                return true;
            } else {
                // If there's an error, log the error message
        
                // Roll back the transaction
                $conn->rollback();
                return false;
            }
        } catch (Exception $e) {
        
            // Roll back the transaction
            $conn->rollback();
            return false;
        }
    }


    function insert_config_detail($arg = null)
    {
        global $conn;
        global $allowTableName;
        //TableNanme , Respective Column Name and Value should be sent in $arg

        $table = mysqli_real_escape_string($conn, $arg['tableName'] ?? false);
        $fieldArg = $arg['columnVal'] ?? false;

        if (!in_array($table, $allowTableName) || !$fieldArg) {
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
            $list_values[] = $valueObject['value'];
        }

        $bind_params = [];
        for ($i = 0; $i < count($list_values); $i++) {
            $bind_params[$i] = &$list_values[$i];
        }

        $placeholders = array_fill(0, count($list_columns), '?');

        // Construct the full SQL query
        $query = "INSERT INTO {$table} (" . implode(', ', $list_columns) . ") VALUES (" . implode(', ', $placeholders) . ")";

        $stmt = $conn->prepare($query);
        array_unshift($bind_params, $list_types);

  
        try {
            // Use call_user_func_array to bind parameters
            call_user_func_array(array($stmt, 'bind_param'), $bind_params);
        
            if ($stmt->execute()) {
                // If the update is successful, commit the transaction
                $conn->commit();
                return true;
            } else {
                // If there's an error, log the error message
        
                // Roll back the transaction
                $conn->rollback();
                return false;
            }
        } catch (Exception $e) {
        
            // Roll back the transaction
            $conn->rollback();
            return false;
        }
        
    }

    function delete_config_detail($arg = null)
    {
        global $conn;
        global $allowTableName;
        // objId, TableNanme , Respective Column Name and Value should be sent in $arg

        $table = mysqli_real_escape_string($conn, $arg['tableName'] ?? false);
        $objId = mysqli_real_escape_string($conn, $arg['objId'] ?? false);

        if (!in_array($table, $allowTableName) || !$objId) {
            // if $table = false, it's not in array either
            return false;
            exit;
        }


        // Assuming you have already established a database connection $conn

        // Start a transaction
        $conn->begin_transaction();

        $query = "DELETE FROM {$table} WHERE id = ?;";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $objId);
        try {
            if ($stmt->execute()) {
                // If the DELETE query is successful, commit the transaction
                $conn->commit();
                return true;
            } else {
                // If there's an error, log the error message
        
                // Roll back the transaction
                $conn->rollback();
                return false;
            }
        } catch (Exception $e) {
            // Handle the exception
        
            // Roll back the transaction
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
