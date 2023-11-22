<?php
require "connection.php";
session_start();

if(isset($_SESSION['user'])) {
    header('Location: welcome.php');
}

if (isset($_GET['status'])){
    echo $_GET['status'];
}
?>


<!DOCTYPE html>
<html>
<head>
    <title>MP_MT_system</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
        }
        .login-box {
            width: 300px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
            border: 1px solid #ccc;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        .login-box h2 {
            text-align: center;
            margin-bottom: 20px;
        }
        .login-box label {
            display: block;
            margin-bottom: 5px;
        }
        .login-box input[type="text"],
        .login-box input[type="password"] {
            width: 95%;
            padding: 10px;
            margin-bottom: 15px;
            border: 1px solid #ccc;
            border-radius: 3px;
            margin-right: 3px;

        }
        .login-box input[type="submit"] {
            width: 100%;
            padding: 10px;
            background-color: #4CAF50;
            color: #fff;
            border: none;
            border-radius: 3px;
            cursor: pointer;
        }
        .login-box input[type="submit"]:hover {
            background-color: #45a049;
        }
    </style>
</head>
<body>
    <div class="login-box">
        <h2>MP Maintenance System</h2>
        <form action="login_handle.php" method="post">
            <label for="username">Username:</label>
            <input type="text" id="username" name="username" required>
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required>
            <input type="submit" value="Login">
        </form>
    </div>
</body>
</html>
