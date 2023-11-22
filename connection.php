<?php
$servername =  "127.0.0.1";
$username = "root";
$password = "";
$db = "MP_MT";
// Connection

$conn = mysqli_connect($servername, $username, $password);
$con_db = mysqli_select_db($conn,$db);
mysqli_set_charset($conn,"utf8mb4");
date_default_timezone_set('Asia/Bangkok');
// Check connection
if (!$conn) {

  die("Connection failed: " . mysqli_connect_error());
	
}


?>