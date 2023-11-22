
<?php 
require '../connection.php';
session_start();
if(!isset($_SESSION['user'])) {header("refresh:0; url=../logout.php");}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Part Request Page</title>
    <!-- Include Bootstrap CSS -->
    
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.0/jquery.min.js" integrity="sha512-3gJwYpMe3QewGELv8k/BX9vcqhryRdzRMxVfq6ngyWXwo03GFEzjsUm8Q7RZcHPHksttq7/GFoxjCVUjkjvPdw==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-kenU1KFdBIe4zVF0s0G1M5b4hcpxyD9F7jL+jjXkk+Q2h455rYXK/7HAuoJl+0I4" crossorigin="anonymous"></script>
    <script src="../js/inven_sub_part_request.js"></script>
    <link rel="stylesheet" href="../style/inven_sub_part_request.css">
</head>
<body>

<div class="container mt-5">
    <!-- <a href="../welcome.php" style="display: inline-block; padding: 10px 20px; margin-left: 10px; margin-top: 10px; background-color: #3498db; color: #ffffff; text-decoration: none; border-radius: 5px; border: 1px solid #2980b9;">หน้าหลัก</a> -->
    <h2>ร้องขอเบิกอะไหล่</h2>
    
        <div class="user-info">
         <?php  
         echo("
            <label>ผู้ใช้งาน: {$_SESSION['user']}</label>
            <label>ตำแหน่ง: {$_SESSION['role']}</label>
            <label>หน่วยงาน: {$_SESSION['department']}</label>");
            ?>
        </div>
        
           
        
        <div class="form-group">
            <label for="jobSelection">รหัสงาน: </label>
            <select class="form-control" id="jobSelection" name="jobSelection">
            <option value="" disabled selected>กรุณาเลือกงาน</option>
                <!-- Options will be populated by Ajax -->
                <?php
                    $jobquery = "SELECT
                    job_all. `id` AS AllJob_id,
                    job_all.fk_fix_no As fix_code,
                    job_all.fk_pm_no As pm_code,
                    job_all.job_type AS job_type
                FROM
                    job_all
                WHERE
                    job_all.fk_fix_no IN(
                        SELECT
                            fix_job.job_no FROM fix_job
                        WHERE
                            fix_job.status = 'processing')
                    OR job_all.fk_pm_no IN(
                        SELECT
                            pm_job.pm_code FROM pm_job
                        WHERE
                            pm_job.status = 'processing');";


                        $res = mysqli_query($conn,$jobquery);
                        while ($row = mysqli_fetch_assoc($res)){
                        if($row['job_type'] == 'BD'){
                            echo "<option value='{$row['AllJob_id']}'>{$row['fix_code']}</option>";
                        }else {// PM job
                            echo "<option value='{$row['AllJob_id']}'>{$row['pm_code']}</option>";
                        }
                        }
                ?>


            </select>
        </div>
        
<div class='spare-part-requisition-container'>

<div id='mr-select-cont'>
    <label for="mrSelection">รหัสรายการเบิก: </label>
            <select class="form-control" id="mrSelection" name="mrSelection">
            <option value="" disabled selected>--กรุณาเลือกรายการ--</option>
                    <!-- Populated options -->
            </select>
            <button type="button" id="new-mr-but">สร้างรายการใหม่</button>
            <button type="button" id="del-mr-but">ลบรายการนี้</button>
</div>

    <div id='mr-detail-container'>


    <div id='confirm-req-container'>
    <label for='added-parts-field'><h3>รายการเบิกอะไหล่</h3></label>
    <button type='button' id='Requist-confirm-but'>ยืนยันการเบิกอะไหล่</button>
    </div>
    <div class='parts-used-container' id='added-parts-field'>
            <!-- ... (Previous HTML code for the parts used for the job section) ... -->
            
    </div>

   

    <div class='toggle-button-container' style='margin-top: 20px;'>
  <button id='toggleButton' class='toggle-button'>ซ่อน/แสดง รายชื่ออะไหล่</button>
    </div>
    <!-- Spare Part Requisition Field -->
    <label for='filter_form' style='margin-top: 5px;' class='part_req_table'><h3>ตัวเลือกอะไหล่</h3></label>
        <div class='form-group part_req_table' id ='filter_form'>
            <label for='searchBox'>ค้นหาชื่อ/สเปค:</label>
            <input type='text' class='form-control' id='searchBox' placeholder='ใส่คำที่ต้องการค้นหา' style='width:35%;'>
        </div>
        
        <!-- Parts List Container -->
        <div id="fetched-part-cont">
        <table class='table table-bordered part_req_table'>
            <thead style='text-align:center; vertical-align:middle'>
                <tr>
                    <th>หมายเลขอะไหล่</th>
                    <th>ชื่ออะไหล่</th>
                    <th>สเปค</th>
                    <th>จำนวนคงเหลือ</th>
                    <th>หน่วย</th>
                    <th>สถานที่</th>
                    <th>เลือกเบิก</th>
                </tr>
            </thead>
            
            <tbody class='parts-list-container'>
            </tbody>
        </table>
        </div>     

        <!-- Parts Used for the Job Section -->
        
        
    </div>
    <!-- /div of mt5 container -->
    </div>
        <!-- Div mr-detail-container -->


    <!-- spare-part-requisition-container -->
</div>

</div>


</body>
</html>
<?php
$conn->close();
?>