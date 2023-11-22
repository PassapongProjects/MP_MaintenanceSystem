<?php
require '../connection.php';
session_start();
if(!isset($_SESSION['usid'])) {header("refresh:0; url=../logout.php"); exit;}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>จัดการงาน PM</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
<link rel="stylesheet" href="../style/pm_plan_management.css">
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
<script src="../js/pm_plan_management.js"></script>
</head>
<body>
<?php
// This page should hanle both proceesing and Completion of the PM job
// Handle Data
if(!isset($_POST['pmJobCode']) || !isset($_POST['allJobId'])) {header("refresh:0; url=../logout.php");} // PM-01/001 / id of job_all
$pmJobCode = $_POST['pmJobCode'];
$allJobId = $_POST['allJobId'];
// SELECT plan_code, plan_ver, and plan status(??)

$pmJobCode = mysqli_real_escape_string($conn,$pmJobCode);
$queryResult = mysqli_query($conn,"SELECT
pm_job.fk_plan_id AS pmCode,
pm_job.plan_ver AS pmVer,
pm_job. `status` AS planStatus,
mc.id AS machine_Id,
mc.`name` AS machine_Name,
mc.`location`AS machine_loc
FROM
pm_job
INNER JOIN mc ON pm_job.fk_mc_id = mc.id WHERE pm_job.pm_code = '{$pmJobCode}';");

if($queryResult && mysqli_num_rows($queryResult) ==1) {
    $result = mysqli_fetch_assoc($queryResult);
    $pmCode = $result['pmCode'];
    $pmVer = $result['pmVer'];
    $planStatus = $result['planStatus'];
    if ($planStatus =='done') {
        header("refresh:0; url=pm_show_done_job.php?pmJobCode={$pmJobCode}");
    }
    $machine = ["machineId" => $result['machine_Id'], 
                "machineName" => $result['machine_Name'],
                "machineLoc" => $result['machine_loc']];
}else{echo "ERROR";}
?>


<div id="pg-container">
<a href="ENG_MT_job.php" style="display: inline-block; padding: 10px 20px; margin-left: 10px; margin-top: 10px; background-color: #3498db; color: #ffffff; text-decoration: none; border-radius: 5px; border: 1px solid #2980b9;">หน้าแสดงงาน</a>
<input type="hidden" id='allJobIdHidden' value=<?php echo $allJobId; ?> >
<input type="hidden" id='pmCodeHidden' value=<?php echo "'{$pmCode}'" ?> >
<input type="hidden" id='pmVerHidden' value=<?php echo $pmVer; ?> >
<input type="hidden" id='pmJobCodeHidden' value=<?php echo "'{$pmJobCode}'" ?> >
<input type="hidden" id='planStatusHidden' value=<?php echo "'{$planStatus}'" ?> >
<div id="header-cont" class="group-div">
<div class="grid-items" id="job-id-grid"><span id="job-id-span-text"> <?php echo $pmJobCode; ?> </span></div>
<div class="grid-items" id="plan-name-grid"><span id="plan-name-span-text"></span></div>
<div class="grid-items" id="plan-code-grid"><span id="plan-id-span-text"></span></div>
<div class="grid-items" id="mc-number-grid"><span id="plan-mcId-span-text"></span></div>
<div class="grid-items" id="mc-name-grid" style="font-size: 12px;"><span id="plan-mcName-span-text"></span></div>
<div class="grid-items" id="mc-locName-grid"><span id="plan-mcLoc-span-text"></span></div>
<div class="grid-items" id="edit-dateText-grid">ปรับปรุงแผนล่าสุด</div>
<div class="grid-items" id="edit-date-grid"><span id="plan-edit-date-span-text"></div>
<div class="grid-items" id="interval-grid"><span id="interval-span-text"></span></div>
</div>
<!-- END HEADER -->
<div id="items-cont" class="group-div">

<label class='header-label'>รายการตรวจสอบ</label>
    <br>
    <ul>
        <li>M: ทำความสะอาด</li>
        <li>T: ทดสอบประสิทธิภาพ</li>
        <li>R: เปลี่ยนอุปกรณ์/ถ่ายน้ำมัน</li>
        <li>C: ตรวจสอบขันแน่น</li>
        <li>H: Overhaul</li>
        <li>CC: ตรวจสอบโดยช่างซ่อมบำรุง</li>
        <li>+: เติม/เปลี่ยน/อัด สารหล่อลื่น</li>
    </ul>
    <div id ="pm-table-cont">
<table id ="pm-items-table" class='table table-bordered part_req_table'>
    <thead>
    <th>ลำดับ</th>
    <th>หัวข้อการตรวจสอบ</th>
    <th>M</th>
    <th>T</th>
    <th>R</th>
    <th>C</th>
    <th>H</th>
    <th>CC</th>
    <th>+</th>
    <th>วิธีการทำงาน</th>
    <th>มาตรฐาน</th>
    <th style="width: 150px;">การตรวจสอบ</th>
    </thead>
    <tbody>

    <tr class="pm-items">
            <td class="item-order">1</td>
            <td class="item-name"></td>
            <td class="checkbox c-clean"></td>
            <td class="checkbox c-test"></td>
            <td class="checkbox c-replace"></td>
            <td class="checkbox c-torque"></td>
            <td class="checkbox c-overhaul"></td>
            <td class="checkbox c-check"></td>
            <td class="checkbox c-oil"></td>
            <td class="work-method"></td>
            <td class="standard"></td>
            <td></td>
        </tr>
    </tbody>
    </table>
    </div>
</div>
<!-- END ITEM -->

<div id="fix-detail-cont" class="group-div">
<label id='fix-detail-label' class='header-label'>รายละเอียดการแก้ไข</label>
<button type='button' id='job_done'>จบงาน</button>
<div id='problem-table-container'>
<table id="problem-description-table">
  <thead>
    <tr>
        <th>ว/ด/ป</th>
        <th>หัวข้อ</th>
        <th>วิธีการทำงาน</th>
        <th>ปัญหา</th>
        <th>การแก้ไข</th>
    </tr>
  </thead>
  <tbody>

  <tr class="add-new-item-row"><td colspan="12"><button type="button" id="add-new-item-btn">เพิ่มรายการ</button></td></tr>
  </tbody>
</table>
</div>
</div>
<!-- END FIX DETAIL -->



<div id="initial-part-cont" class="group-div">
<div class='parts-used-container' id='added-parts-field'>
<div id='confirm-req-container'>
<label for='added-parts-field' class='header-label'>รายการอะไหล่ที่ใช้สำหรับงาน</label>
<div id="req-confirm-but-container">
    <!-- Button Added later -->
</div>
<div id="inital-mr-container">
    <span id='mr-code'></span>
    <span id='mr-status'></span>

</div>
</div>
        <!-- ... (Previous HTML code for the parts used for the job section) ... -->
        <table class='table table-bordered part_req_table' id='added-parts-table'>
        <thead style='text-align:center; vertical-align:middle'>
            <tr>
                <th>หมายเลขอะไหล่</th>
                <th>ชื่ออะไหล่</th>
                <th>สเปค</th>
                <th>จำนวน</th>
                <th>หน่วย</th>
                <th>เบิก</th>
            </tr>
        </thead>
        
        <tbody class='added-parts-container'>
        </tbody>
    </table>

    
</div>
</div>
</div>

</div>
<!-- END PG -->

<script>
    $(document).ready(function(){
    var pmCode = <?php echo json_encode($pmCode); ?>;
    var pmVer = <?php echo json_encode($pmVer); ?>;
    var machineData = <?php echo json_encode($machine); ?>;
    var pmJobCode = <?php echo json_encode($pmJobCode); ?>;
    var allJobId = <?php echo json_encode($allJobId); ?>;
    fetchPlanData(pmCode,pmVer,pmJobCode);
    displayHeaderMachineData(machineData); 
    });
</script>
</body>
</html>