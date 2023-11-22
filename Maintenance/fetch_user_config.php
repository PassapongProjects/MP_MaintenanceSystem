<?php
require '../connection.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $exec_auth = $_SESSION['usrank'];

    if ($exec_auth < 3) {
        // Only Manager and Higher rank can execute the script
        $response['status'] = false;
        $response['error'] = "Invalid Authority";
        echo json_encode($response);
        $conn->close();
        exit;
    }


    function fetch_auth_type_option($arg = null)
    {

        global $conn;

        $current_user_rank = $_SESSION['usrank'];
        $query = "SELECT id AS id, `name` AS name, `rank` AS auth_rank FROM auth_type WHERE `rank` < ? ORDER BY `rank` DESC;";

        try {
            $stmt = $conn->prepare($query);

            $stmt->bind_param("i", $current_user_rank);

            $stmt->execute();

            $result = $stmt->get_result();

            if ($result->num_rows > 0) {

                $response['auth'] = $result->fetch_all(MYSQLI_ASSOC);

            }else {
                throw new Exception("Current user's rank Error");
            }

            $response['status'] = true;

            return $response;



        } catch (Exception $e) {
            $response['err'] = $e->getMessage();
            $responsep['status'] = false;
            return $response;
        }
    }



    function registration_handle($arg = null)
    {
        // Hashing password should be handled
        global $conn;
        $empId = $arg['empId'] ?? false;
        $input_username = $arg['username'] ?? false;
        $input_password = $arg['pass'] ?? false;
        $input_auth_rank = $arg['auth_rank'] ?? false;
        

        if (!($empId && $input_username && $input_password && $input_auth_rank)) {
            $response['status'] = false;
            return $response;
        }

        try {
            $conn->begin_transaction();
            // Check if username is used / Account already been registered
            $registered_account = fetch_user_account_check($arg)['registered']; // Check registered account

            $check_username_query = "SELECT id AS id, username AS username FROM user WHERE `username` = ?;";
            $check_username_stmt = $conn->prepare($check_username_query);

            $check_username_stmt->bind_param("s",$input_username); 

            $check_username_stmt->execute();

            $check_username_result = $check_username_stmt->get_result();

            if($check_username_result->num_rows != 0) {
                // Duplicated username
                throw new Exception("200");
            }

            $check_username_stmt->close();

            if(!$registered_account) {
                // ADD data to database
                $hashed_password = password_hash($input_password,PASSWORD_BCRYPT);
            
                $insert_query = "INSERT INTO user (username,passwwd,`role`,emp_id) VALUES (?, ?, ?, ?);";

                $insert_stmt = $conn->prepare($insert_query);

                $insert_stmt->bind_param("ssii",$input_username,$hashed_password,$input_auth_rank,$empId);

                $insert_stmt->execute();



                $response['status'] = true;
                $conn->commit();

                return $response;
    
    
            }else {

                // Registered account
                throw new Exception("100");
                
            }
        }catch (Exception $e) {

            $conn->rollback();
            $response['error'] = $e->getMessage();
            $response['status'] = false;
            return $response;
        }
        
        

    }

    function change_password_handle($arg = null) {
        global $conn;
        $empId = $arg['empId'] ?? false;
        $input_username = $arg['username'] ?? false;
        $input_password = $arg['pass'] ?? false;
        $input_auth_rank = $arg['auth_rank'] ?? false;
        

        if (!($empId && $input_username && $input_password && $input_auth_rank)) {
            $response['status'] = false;
            return $response;
        }

        try {
            $conn->begin_transaction();
            // Check if username is used / Account already been registered

            $check_username_query = "SELECT id AS id, username AS username FROM user WHERE `username` = ? AND emp_id != ?;";
            $check_username_stmt = $conn->prepare($check_username_query);

            $check_username_stmt->bind_param("si",$input_username,$empId); 

            $check_username_stmt->execute();

            $check_username_result = $check_username_stmt->get_result();

            if($check_username_result->num_rows != 0) {
                // Duplicated username
                throw new Exception("200");
            }

            $check_username_stmt->close();

                // ADD data to database
                $hashed_password = password_hash($input_password,PASSWORD_BCRYPT);
            
                $insert_query = "UPDATE user SET username = ?, passwwd = ?, `role` = ? WHERE emp_id = ?;";

                $insert_stmt = $conn->prepare($insert_query);

                $insert_stmt->bind_param("ssii",$input_username,$hashed_password,$input_auth_rank,$empId);

                $insert_stmt->execute();



                $response['status'] = true;
                $conn->commit();

                return $response;
    
    
        }catch (Exception $e) {

            $conn->rollback();
            $response['error'] = $e->getMessage();
            $response['status'] = false;
            return $response;
        }
        

    }

    function fetch_user_account_information($arg = null) {

        global $conn;

        $empId = $arg['empId'] ?? false;
        if (!$empId) {
            $response['status'] = false;
            return $response;
        }

        try {

            $query = "SELECT username AS username, `role` AS auth_role FROM user WHERE emp_id = ? LIMIT 1;";
            $stmt = $conn->prepare($query);

            $stmt->bind_param("i",$empId);

            $stmt->execute();

            $result = $stmt->get_result();

            if($result->num_rows > 0){

                $response['status'] = true;
                $response['acc_data'] = $result->fetch_assoc();

                return $response;


            }else {
                throw new Exception("Invalid Query / Account Not found.");
            }


        }catch (Exception $e) {

            $response['error'] = $e->getMessage();
            $response['status'] = false;
            return $response;
        }

    }

    function fetch_user_account_check($arg = null)
    {

        global $conn;

        $empId = $arg['empId'] ?? false;

        if (!$empId) {
            $response['status'] = false;
            return $response;
        }
        // Check if the user already has an accout or not
        try {

            $query = "SELECT `role` AS usrank FROM `user` AS us WHERE emp_id = ?;";

            $stmt = $conn->prepare($query);

            $stmt->bind_param("i", $empId);

            $stmt->execute();

            $result = $stmt->get_result();

            if ($result->num_rows === 0) {
                // no account
                $response['registered'] = false;
                $response['emp_rank'] = false;
            } else {
                // already has an account
                $res = $result->fetch_assoc();
                $response['registered'] = true;
                $response['emp_rank'] = $res['usrank'];
            }

            $response['status'] = true;
            return $response;
        } catch (Exception $e) {
            $response['err'] = $e->getMessage();
            $response['status'] = false;
            return $response;
        }
    }


    function fetch_department_user($arg = null)
    {

        global $conn;

        $usid = $_SESSION['usid'];
        $usrank = $_SESSION['usrank'];

        $query = "SELECT
        emp. `id` AS emp_id,
        emp. `name` AS emp_name,
        emp.surname AS emp_surname,
        emp.department AS emp_department,
        department. `name` AS emp_department_name,
        emp.tel AS emp_tel,
        IFNULL(us_acc. `role`, 0) AS acc_role,
        emp.editable AS emp_editable,
        (
            CASE WHEN (emp.department = (
                    SELECT
                        auth_emp.department
                    FROM
                        `user` AS us
                    LEFT JOIN employee AS auth_emp ON us.emp_id = auth_emp.id
                WHERE
                    auth_emp.id = ?)) THEN
                1
            ELSE
                0
            END) AS indepartment
    FROM
        employee AS emp
        LEFT JOIN `user` AS us_acc ON us_acc.emp_id = emp.id
        LEFT JOIN department ON department.id = emp.department
        LEFT JOIN auth_type ON auth_type.id = us_acc.`role`
    WHERE auth_type.`rank` < ? || ISNULL(auth_type.`rank`)
    ORDER BY
        indepartment DESC,
        emp. `name` ASC;";


        try {
            $stmt = $conn->prepare($query);

            $stmt->bind_param("ii", $usid,$usrank);

            $stmt->execute();

            $result = $stmt->get_result();

            $response['emp_table'] = $result->fetch_all(MYSQLI_ASSOC);

            $response['emp_table'] = count($response['emp_table']) === 0 ? [] : $response['emp_table'];

            $response['status'] = true;

            return $response;
        } catch (Exception $e) {

            $response['status'] = false;
            $response['err'] = $e->getMessage();
            return $response;
        }
    }




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
