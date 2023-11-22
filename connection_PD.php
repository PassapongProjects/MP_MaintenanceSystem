<?php
$servername = "127.0.0.1";
$username = "root";
$password = "";
$pdDB = "MP_PD";
$mtDB = "MP_MT";

// Connection for MP_PD database
$connPD = mysqli_connect($servername, $username, $password, $pdDB);
mysqli_set_charset($connPD, "utf8mb4");
date_default_timezone_set('Asia/Bangkok');

// Check connection for MP_PD database
if (!$connPD) {
    die("MP_PD Connection failed: " . mysqli_connect_error());
}

// // Connection for MP_MT database
// $conn = mysqli_connect($servername, $username, $password, $mtDB);
// mysqli_set_charset($conn, "utf8mb4");
// date_default_timezone_set('Asia/Bangkok');

// // Check connection for MP_MT database
// if (!$conn) {
//     die("MP_MT Connection failed: " . mysqli_connect_error());
// }

// $servername =  "127.0.0.1";
// $username = "root";
// $password = "";
// $db = "MP_PD";
// // Connection

// $connPD = mysqli_connect($servername, $username, $password);
// $con_db_pd = mysqli_select_db($connPD,$db);
// mysqli_set_charset($connPD,"utf8mb4");
// date_default_timezone_set('Asia/Bangkok');
// // Check connection
// if (!$connPD) {

//   die("Connection failed: " . mysqli_connect_error());
	
// }

?>