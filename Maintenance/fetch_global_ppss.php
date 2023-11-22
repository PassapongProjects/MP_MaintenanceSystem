<?php
require '../connection.php';
session_start();
if (!isset($_SESSION['usid'])) {
    header("Location: ../logout.php");
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {




    function whoamina($arg = null)
    {

        $response['usid'] =  $_SESSION['usid'];
        $response['role_rank'] = $_SESSION['usrank']; // Higher -> more priorities given
        $response['user_name'] = $_SESSION['user'];
        $response['role_name'] = $_SESSION['role'];
        $response['department'] = $_SESSION['department'];
        $response['departmentCode'] = $_SESSION['departmentCode'];

        $response['status'] = true;
        return $response;
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
