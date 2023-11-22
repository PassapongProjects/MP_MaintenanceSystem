<?php
require 'connection.php';
session_start();
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the submitted username and password from the login form
    $username = $_POST['username'];
    $password = $_POST['password'];

    // Your database connection details

    // Prepare the SQL statement to fetch user details based on the provided username
    $stmt = $conn->prepare("SELECT * FROM user WHERE username = ?");
    $stmt->bind_param("s", $username);

    // Execute the query
    $stmt->execute();

    // Get the result
    $result = $stmt->get_result();

    // Check if the user with the provided username exists
    if ($result->num_rows > 0) {
        // Fetch the user details from the result
        $user = $result->fetch_assoc();

        // Verify the password using the password_verify function
        if (password_verify($password,$user['passwwd'])) {
            
            // Password is correct, the user is authenticated
            // Redirect to a secure page or set a login session
            // $_SESSION['usid'] = $user['emp_id'];
            // $_SESSION['usrank'] = mysqli_fetch_array(mysqli_query($conn,"SELECT `rank` FROM auth_type WHERE id = '{$user['role']}'"))[0];
            // $_SESSION['user'] = mysqli_fetch_array(mysqli_query($conn,"SELECT `name` FROM employee WHERE id = '{$user['emp_id']}'"))[0];
            // $_SESSION['role'] = mysqli_fetch_array(mysqli_query($conn,"SELECT `name` FROM auth_type WHERE id = '{$user['role']}'"))[0];
            // $_SESSION['department'] = mysqli_fetch_array(mysqli_query($conn,"SELECT department.name FROM department WHERE department.id = 
            // (SELECT employee.department FROM employee WHERE employee.id = {$user['emp_id']})"))[0]?? 'N/A';
            // $_SESSION['departmentCode'] = mysqli_fetch_array(mysqli_query($conn,"SELECT employee.department FROM employee WHERE employee.id = {$user['emp_id']};"))[0];

            $query = "SELECT
            e.id AS usid,
            at.rank AS usrank,
            e.name AS user_name,
            e.surname AS user_sur,
            at.name AS role_name,
            d.name AS department,
            e.department AS departmentCode
        FROM
            `user` AS us
            LEFT JOIN employee AS e ON us.emp_id = e.id
            LEFT JOIN auth_type AS at ON us.role = at.id
            LEFT JOIN department AS d ON e.department = d.id
        
        WHERE
            us.id = ?;";

            $log_in_stmt = $conn->prepare($query);
            $log_in_stmt->bind_param("i",$user['id']);
            $log_in_stmt->execute();
            $result = $log_in_stmt->get_result();
            $row = $result->fetch_assoc();

            if ($row) {
                $_SESSION['usid'] = $row['usid'];
                $_SESSION['usrank'] = $row['usrank'];
                $_SESSION['user'] = $row['user_name'];
                $_SESSION['user_sur'] = $row['user_sur'];
                $_SESSION['role'] = $row['role_name'];
                $_SESSION['department'] = $row['department'] ?? 'N/A';
                $_SESSION['departmentCode'] = $row['departmentCode'] ?? 'N/A';
                
            }

            header('Location: welcome.php');
            exit;
        } else {
            // Password is incorrect, show an error message or redirect to the login page
            header('Location: index.php?status=รหัสผ่านผิด'); // Redirect back to the login page

            exit;
        }
    } else {
        // User with the provided username does not exist, show an error message or redirect to the login page
        header('Location: index.php?status=ไม่มีชื่อผู้ใช้'); // Redirect back to the login page
        exit;
    }

    // Close the statement and connection
    $stmt->close();
    $conn->close();
} else header('Location: index.php?status=Invalid');
