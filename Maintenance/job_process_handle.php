<?php
require '../connection.php';
session_start();
if(!isset($_SESSION['user'])) {header("refresh:0; url=../logout.php");}
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check if all required form fields have values
    if (!isset($_POST['job_id']) || !isset($_POST['engineerid']) || !isset($_POST['operMode'])) {header("refresh:0; url=ENG_MT_job.php");}

    if ($_POST['operMode'] == 'startJob') {

        $job_id = $conn->real_escape_string($_POST['job_id']);
        $enngineerid= $conn->real_escape_string($_POST['engineerid']);

        $stmt = $conn->prepare("UPDATE fix_job SET eng_person_inspect = ?, eng_start_time = NOW(), status = 'processing' WHERE id=?");

        // Bind parameters and execute the statement
        $stmt->bind_param("ss", $enngineerid,$job_id);

        // Execute the query
        $result = $stmt->execute();

        // Check if the insertion was successful
        if ($result === TRUE) {
            // Insertion successful, do further processing or display success message
            // You can also redirect the user to a success page
            mysqli_query($conn,"UPDATE fix_job SET time_wait_inspection = IF(TIME_TO_SEC(TIMEDIFF(eng_start_time, inform_date)) > TIME_TO_SEC('838:59:59'), '838:59:59', TIMEDIFF(eng_start_time, inform_date)) WHERE id= {$job_id};");
            header('Location: ../welcome.php?informstatus=แจ้งเริ่มตรวจสอบสำเร็จ'); // Replace 'success.php' with your desired success page
            
        } else {
            // Insertion failed, display error message or handle the error accordingly
            header("Location: ../welcome.php?informstatus={$stmt->error}");
        }

        // Close the statement and connection
        $stmt->close();
        $conn->close();
    


    }else if($_POST['operMode'] == 'asgEng') {

        $query = "UPDATE job_assigned_eng_junc SET fk_assign_eng_id = ? WHERE fk_job_code = (SELECT job_no AS job_no FROM fix_job WHERE `id` = ?);";
        $querystmt = $conn->prepare($query);
        $querystmt->bind_param("is",$_POST['engineerid'],$_POST['job_id']);

        if ($querystmt->execute()) {
            $respons['status'] = true;
            $conn->close();
            echo json_encode($respons);
        }else {
            $respons['status'] = false;
            $conn->close();
            echo json_encode($respons);
        }
    }

}else { // Request Method is not Post
    header("refresh:0; url=ENG_MT_job.php");}
?>