<?php 
require '../connection.php';
session_start();
if(!isset($_SESSION['usid'])) {header("refresh:0; url=../logout.php"); exit;}
if(!isset($_POST['job_id'])){header("refresh:0; url=ENG_MT_job.php");}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Maintenance Job Details</title>
    <!-- Include Bootstrap CSS -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <link rel="stylesheet" href="../style/job_management_page.css">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="../js/job_management_page.js"></script>
    <!-- Include jQuery library -->
    <!-- Include Bootstrap JS -->
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
</head>
<body>
    <?php
    $jobIdEscape = $conn->real_escape_string($_POST['job_id']);
    $sql = "SELECT
    fix_job.id AS id,
    IFNULL(e_inspect.name, 'N/A') AS engineer_name,
    fix_job.job_no AS job_no,
    fix_job.mc_id AS machine_id,
    mc.name AS machine_name,
    fix_job.inform_date AS inform_date,
    fix_job.inform_reason AS inform_reason,
    fix_job.status AS status,
    mc.location AS machine_location,
    e_issued.name AS informed_by,
    IFNULL(asg_table.fk_assign_eng_id,'N/A') AS asg_eng,
    IFNULL(e_asg.name,'N/A') AS asg_emp_name,
    IFNULL(e_asg.surname,'N/A') AS asg_emp_sur

FROM
    fix_job
JOIN
    mc ON fix_job.mc_id = mc.id
LEFT JOIN
    employee AS e_inspect ON fix_job.eng_person_inspect = e_inspect.id
JOIN
    employee AS e_issued ON fix_job.issued_by = e_issued.id
LEFT JOIN
	job_assigned_eng_junc AS asg_table ON asg_table.fk_job_code = fix_job.job_no
LEFT JOIN
    employee AS e_asg ON asg_table.fk_assign_eng_id = e_asg.id
WHERE
    fix_job.id = {$jobIdEscape}
ORDER BY
    inform_date DESC;";


    $result = $conn->query($sql);
    if ($result->num_rows > 0) {
        // Create an array to store the job data
        // Fetch each row of data and add it to the jobs array
        $row = $result->fetch_assoc();
        
        if($row['status'] =='pending'){
        $statusCode = 'รอตรวจสอบ';
        }else if($row['status'] =='processing'){
            $statusCode = 'อยู่ระหว่างการซ่อม';
        }else if($row['status'] =='done'){
            $statusCode = 'สำเร็จ';
        }else{
            $statusCode = $row['status'];
        }
        // Close the result set
        $asg_eng = $row['asg_eng'];
        $result->close();
    
        // Close the connection
        $conn->close();
    
        // Return the job data as a JSON response
    } else {
        // No jobs found in the database
        // Close the connection
        $conn->close();
    
        // Return an empty JSON response
    }

    echo ("
    <input type='hidden' id='inputjobid' value='{$_POST['job_id']}'>
    <input type='hidden' id='asg_eng_for_job' value='{$asg_eng}'>
    <div class='container mt-5'>
        <h2>รายละเอียดงาน</h2>

        <!-- Maintenance Job Details Form -->
        <div class='maintenance-form-container'>
            <h5>เลขที่ใบแจ้งซ่อม:{$row['job_no']}</h5>
            <div class='row'>
                <div class='col-md-6'>
                    <label>หมายเลขเครื่องจักร:</label>
                    <p>&emsp;{$row['machine_id']}</p>
                </div>
                <div class='col-md-6'>
                    <label>ชื่อเครื่องจักร:</label>
                    <p>&emsp;{$row['machine_name']}</p>
                </div>
            </div>
            <div class='row'>
                <div class='col-md-6'>
                    <label>สถานที่:</label>
                    <p>&emsp;{$row['machine_location']}</p>
                </div>
                <div class='col-md-6'>
                    <label>วันที่แจ้ง:</label>
                    <p>&emsp;{$row['inform_date']} น.</p>
                </div>
            </div>
            <div class='row'>
                <div class='col-md-6'>
                    <label>อาการแจ้ง:</label>
                    <p>&emsp;{$row['inform_reason']}</p>
                </div>
                <div class='col-md-6'>
                    <label>สถานะ:</label>
                    <p>&emsp;{$statusCode}</p>
                </div>
                <div class='col-md-6'>
                    <label>ผู้แจ้ง:</label>
                    <p>&emsp;{$row['informed_by']}</p>
                </div>
                <div class='col-md-6'>
                    <label>ช่างได้รับมอบหมาย:</label>
                    <p>&emsp;{$row['asg_emp_name']} {$row['asg_emp_sur']}</p>
                </div>
                

");
if($row['status']==="processing"){
    echo("<div class='col-md-6'>
    <label>ผู้ตรวจสอบ:</label>
    <p>&emsp;{$row['engineer_name']}</p>
</div>");
}
echo("  
            </div>");


if($row['status']==="processing"){
    echo("<button type='button' id='job_done'>จบงาน</button>");
            }
echo("

        </div>
        ");
    if($row['status']==="processing"){
    echo ("
    <div class='processing'>
    <div class='eng_inform_container' style='border: 2px solid;'>
    <div class='form-group check-group'>
        <label><h3>ดำเนินการโดย:</h3></label>
        <div class='form-check'>
            <input class='form-check-input option-checkbox' type='checkbox' value='1' id='option1Checkbox' checked>
            <label class='form-check-label' for='option1Checkbox'>
                ช่างของ บริษัทสหแพทย์เภสัช จำกัด
            </label>
        </div>
        <div class='form-check'>
            <input class='form-check-input option-checkbox' type='checkbox' value='2' id='option2Checkbox'>
            <label class='form-check-label' for='option2Checkbox'>
                จ้างช่างภายนอก บริษัทสหแพทย์เภสัช จำกัด
            </label>
        </div>
        <div class='form-check'>
            <input class='form-check-input option-checkbox' type='checkbox' value='3' id='option3Checkbox'>
            <label class='form-check-label' for='option3Checkbox'>
                ผู้แทนจำหน่ายเครื่อง เพราะอยู่ภายใต้สัญญาประกัน
            </label>
        </div>
        <label id='done_engineer'>บันทึกโดย: {$_SESSION['user']}</label>
    </div>

    <div class='MT-Description-container'>
        <label for='reason-description'><h3>วิเคราะห์สาเหตุ:</h3></label>
        <textarea id='reason-description' name='reason_description' rows='2' maxlength='500'></textarea>
        <label for='maintenance-description'><h3>วิธีการซ่อมบำรุง:</h3></label>
        <textarea id='maintenance-description' name='maintenance_description' rows='4' maxlength='1000'></textarea>
    </div>
</div>


    

<div class='spare-part-requisition-container'>
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
        <div id='fetched-part-cont'>
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

        <!-- Parts Used for the Job Section -->
        </div>
        
    </div>
    <!-- /div of mt5 container -->
</div>
    </div> 
    ");} elseif($row['status']==="pending") {

        echo ("<div class='pending-cont'>");
        if(intval($_SESSION['usrank']) >= 2) {
            // Higher than HOD
            $assign_form = "<div class='form-container asg-eng-cont'>
            <label>มอบหมายงาน</label>
            <select id='asg_select'>
                <option value='' disabled selected>--เลือก--</option>
            </select>
            <button type='butotn' id='asg_btn'>มอบหมายงาน</button>
                </div>";
            echo $assign_form;
        } 


        echo("<div class='form-container'>
        <form action='job_process_handle.php' method ='post'>
        <!-- Read-Only Text Input -->
        <div class='form-group'>
            <label>ช่างผู้ดูแล</label>
            <input type='text' class='form-control-plaintext' value='{$_SESSION['user']}' readonly>
            <input type='hidden' value='{$_SESSION['usid']}' name='engineerid'>
            <input type='hidden' value='{$_POST['job_id']}' name='job_id'>
            <input type='hidden' value='startJob' name='operMode'>
        </div>

        <!-- Submit Button -->
        <button type='submit' class='submit-btn'>ยืนยันเข้าตรวจสอบ</button>
        </form>
    </div>");

    echo ("</div>");

    }   

    ?>

   
</body>
</html>
