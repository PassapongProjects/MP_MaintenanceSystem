<?php
require '../connection.php';

session_start();
if (!isset($_SESSION['user'])) {
    header("refresh:0; url=../logout.php");
}


if ($_SERVER["REQUEST_METHOD"] == "POST") {
if(!isset($_POST['jobId'])){exit;}
else{
    $jobId = mysqli_real_escape_string($conn,$_POST['jobId']);

    $result = mysqli_query($conn,"SELECT mr_code As mrCode FROM inven_requisted WHERE fk_job_id = {$jobId} AND prio != 0");
if(mysqli_num_rows($result) > 0) {
    while($row = mysqli_fetch_array($result)){
        $response[$row[0]] = $row[0];
    }


$conn->close();
echo json_encode($response);}
else {
    $response["Nodata"] = ["Nodata"];
    echo json_encode($response);
}
}

}




?>