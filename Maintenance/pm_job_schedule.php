<?php
require '../connection.php';
session_start();
if(!isset($_SESSION['usid'])) {header("refresh:0; url=../logout.php"); exit;}
if($_SESSION['usrank'] < 2) {
  header('Content-Type: text/html; charset=utf-8');
  header("refresh:0; url=../welcome.php?informstatus=" . urlencode("ไม่อนุญาตให้เข้าถึง"));
  exit;}




?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PM Scheduling</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
<link rel="stylesheet" href="../style/pm_job_schedule.css">
<script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.js"></script>
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>

<script src="../js/pm_job_schedule.js"></script>
</head>
<body>
<div id=pg-container>
<div class="navbar">
        <a href="../welcome.php" id="main-page-link">หน้าหลัก</a>
        <button type= "button" id="view-part">อะไหล่ที่ใช้</button>
        <button type= "button" id="create-plan">ลงตาราง PM</button>
        <button type= "button" id="edit-plan">แก้ไขตารางงาน PM</button>
        <button type= "button" id="update-plan">ปรับปรุงแผน PM</button>
    </div>
  <div class="top-div">
    <div class="side-div" id ="left-side-div-cont">
    <!-- Information will be inserted -->
    

      </div>

    <div class="side-div" id ="right-side-div-cont" >
    <!-- Table for Assigning Employees will be inserted -->
    
    </div>

  </div>
  <div id="calendarNmore-container">
  <div class="full-div" id="calendar">
    <!-- Calendar content will be inserted here -->
    

  </div>
  </div>
  
</div>
<div class="modal"><!-- Place at bottom of page --></div>


</body>
</html>
