<?php
require '../connection.php';
if(!isset($_POST['job_id'])){header("refresh:0; url=ENG_MT_job.php");}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.4/dist/umd/popper.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>

    <title>Job Details</title>
    <!-- Add Bootstrap CSS link -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <link rel="stylesheet" href="../style/done_job_details.css">
</head>
<body>
    <?php
    //This is fix_job's id
    $jobId = mysqli_real_escape_string($conn,$_POST['job_id']);
    $AlljobId = mysqli_fetch_array(mysqli_query($conn,"SELECT job_all.id  As fix_all_id from job_all INNER JOIN fix_job ON job_all.fk_fix_no = fix_job.job_no WHERE fix_job.id = {$jobId};"))[0];
   $query =  "SELECT
   fj.id AS job_id,
   fj.job_no,
   fj.mc_id AS machine_id,
   mc.name AS machine_name,
   fj.inform_date,
   fj.inform_reason,
   fj.eng_reason,
   fj.eng_solution,
   fj.eng_start_time,
   fj.eng_finished_time,
   fj.status AS job_status,
   fj.time_wait_inspection AS wait_time,
   fj.time_fix_time AS fix_time,
   fj.time_total_down AS down_time,
   emp_inform.name AS informed_by,
   emp_inspect.name AS inspected_by,
   emp_confirmed.name AS confirmed_by,
   ft.type_name AS fix_type,
   mt.name AS machine_type,
   s.status_name AS machine_status,
   d.name AS issued_department,
   mc.location AS machine_location,
   mc_rank.`name` AS machine_rank,
   grp.name AS machine_group,
   jasj.fk_assign_eng_id AS asg_engId,
   asg_em.`name` AS asg_engName,
   asg_em.surname AS asg_engSurname
FROM
   fix_job AS fj
   INNER JOIN mc ON fj.mc_id = mc.id
   INNER JOIN employee AS emp_inform ON fj.issued_by = emp_inform.id
   INNER JOIN employee AS emp_inspect ON fj.eng_person_inspect = emp_inspect.id
   INNER JOIN employee AS emp_confirmed ON fj.eng_person_confirmed = emp_confirmed.id
   INNER JOIN fix_type AS ft ON fj.fk_fix_type = ft.id
   LEFT JOIN mc_type AS mt ON mc.Type = mt.id
   LEFT JOIN `status` AS s ON mc.Status = s.id
   INNER JOIN department AS d ON emp_inform.department = d.id
   LEFT JOIN group_type AS grp ON mc.fk_group = grp.id
   LEFT JOIN job_assigned_eng_junc AS jasj ON jasj.fk_job_code = fj.job_no
   LEFT JOIN employee AS asg_em ON jasj.fk_assign_eng_id = asg_em.id
   LEFT JOIN mc_rank ON mc.fk_mc_rank = mc_rank.id
WHERE
	fj.id = ?;";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $jobId);
$stmt->execute();
$jobdataresult = $stmt->get_result();
$result = $jobdataresult->fetch_assoc();
$stmt->close();

function formatDateTime($dateTimeStr) {
    $dateTime = new DateTime($dateTimeStr);
    return $dateTime->format('d/m/Y H:i น.');
}
function toThaiStatus($Engstatus){
    $Engstatus = strtolower($Engstatus);
    $Thaistatus='';
    if($Engstatus=="waiting for approval") {
        $Thaistatus = 'รออนุมัติ';
    }elseif ($Engstatus =="issued") {
        $Thaistatus = 'จ่ายแล้ว';
    }else {$Thaistatus = $Engstatus;}
    return $Thaistatus;
}

function formattime($timeData){
    try {

        

        if (is_null($timeData)){
            throw new Exception("null time data");
        }
        $timeComponents = explode(":", $timeData);

        if (count($timeComponents) !== 3) {
            throw new Exception("Invalid time format");
        }

        $hours = intval($timeComponents[0]);
        $minutes = intval($timeComponents[1]);
        $seconds = intval($timeComponents[2]);

        if ($hours >= 838) {
            $hours = "มากกว่า {$hours}";
        }

        $formattedTime = "{$hours} ชั่วโมง {$minutes} นาที {$seconds} วินาที";
        return $formattedTime;
    } catch (Exception $e) {
        return "N/A";
    }
}

$wait_time = formattime($result['wait_time']);
$fix_time = formattime($result['fix_time']);
$down_time = formattime($result['down_time']);


$requisted_item_query = "SELECT
inven_requisted.mr_code AS mr_code,
job_all.fk_pm_no AS pm_code,
job_all.fk_fix_no AS fix_code,
employee. `name` AS eng_req,
inven_requisted_cart.fk_part_id As part_id,
part.`name`As part_name,
part.spec As part_spec,
inven_requisted_cart.req_quan As req_quan,
inven_requisted_cart.status AS status,
inven_requisted_cart.issued_time As issue_time,
inven_requisted_cart.issued_quan As issue_quan,
inven_requisted_cart.returnable_quan AS returnable_quan,
req_emp_join.`name` As issued_name
FROM (inven_requisted
INNER JOIN (inven_requisted_cart
    INNER JOIN part ON inven_requisted_cart.fk_part_id = part.id) ON inven_requisted.mr_code = inven_requisted_cart.fk_requisted_code)
INNER JOIN job_all ON fk_job_id = job_all.id
INNER JOIN employee ON req_eng = employee.id
LEFT JOIN employee As req_emp_join ON issued_eng = req_emp_join.id
WHERE fk_job_id = {$AlljobId};";


?>
<a href='#' id='backLink'>ย้อนกลับ</a>
    <div class="container">
        <div class="row">
            <div class="side-div">
                <div class="group-header">
                    <h3>รายละเอียดงาน</h3>
                    <table class="table data-table">
                        <tbody>
                            <input type='hidden' value="<?php echo $result['job_id']; ?>">
                            <tr>
                                <th>เลขที่งาน</th>
                                <td><?php echo $result['job_no']; ?></td>
                            </tr>
                            <tr>
                                <th>วันแจ้งซ่อม</th>
                                <td><?php echo formatDateTime($result['inform_date']); ?></td>
                            </tr>
                            <tr>
                                <th>อาการแจ้งซ่อม</th>
                                <td><?php echo $result['inform_reason']; ?></td>
                            </tr>
                            <tr>
                                <th>วิเคราะห์สาเหตุ</th>
                                <td><?php echo $result['eng_reason']; ?></td>
                            </tr>
                            <tr>
                                <th>วิธีการดำเนินการซ่อม</th>
                                <td><?php echo $result['eng_solution']; ?></td>
                            </tr>
                            <tr>
                                <th>เวลาเริ่มซ่อม</th>
                                <td><?php echo formatDateTime($result['eng_start_time']); ?></td>
                            </tr>
                            <tr>
                                <th>เวลาจบงาน</th>
                                <td><?php echo formatDateTime($result['eng_finished_time']); ?></td>
                            </tr>
                            <tr>
                            <th>ประเภทงาน</th>
                            <td><?php echo $result['fix_type']; ?></td>
                        </tr>
                            <tr>
                                <th>สถานะงาน</th>
                                <td><?php echo ($result['job_status']=='done') ? "สำเร็จ": $result['job_status']; ?></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="side-div">
                <div class="group-header">
                    <h3>ข้อมูลเครื่องจักร</h3>
                    <table class="table data-table">
                        <tbody>
                            <tr>
                                <th>หมายเลขเครื่องจักร</th>
                                <td><?php echo $result['machine_id']; ?></td>
                            </tr>
                            <tr>
                                <th>ชื่อเครื่องจักร</th>
                                <td><?php echo $result['machine_name']; ?></td>
                            </tr>
                            <tr>
                                <th>ประเภทเครื่องจักร</th>
                                <td><?php echo $result['machine_type']; ?></td>
                            </tr>
                            <tr>
                                <th>สถานที่ตั้งเครื่อง</th>
                                <td><?php echo $result['machine_location']; ?></td>
                            </tr>
                            <tr>
                                <th>ลำดับความสำคัญเครื่องจักร</th>
                                <td><?php echo $result['machine_rank']; ?></td>
                            </tr>
                            <tr>
                                <th>เครื่องจักรภายใต้หน่วยงาน</th>
                                <td><?php echo $result['machine_group']; ?></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="side-div">
        <div class="group-header">
            <h3>ข้อมูลอื่นทั่วไป</h3>
            <table class="table data-table">
                <tbody>
                    <tr>
                        <th>แจ้งซ่อมโดย</th>
                        <td><?php echo $result['informed_by']; ?></td>
                    </tr>
                    <tr>
                        <th>แจ้งซ่อมโดยพนักงานของแผนก</th>
                        <td><?php echo $result['issued_department']; ?></td>
                    </tr>
                    <tr>
                        <th>ช่างผู้เข้าตรวจสอบโดย</th>
                        <td><?php echo $result['inspected_by']; ?></td>
                    </tr>
                    <tr>
                        <th>ช่างผู้ดำเนินการซ่อม</th>
                        <td><?php echo $result['confirmed_by']; ?></td>
                    </tr>
                    <tr>
                        <th>เวลารอช่างมาตรวจสอบ</th>
                        <td><?php echo $wait_time; ?></td>
                    </tr>
                    <tr>
                        <th>เวลาที่ใช้ซ่อม</th>
                        <td><?php echo $fix_time; ?></td>
                    </tr>
                    <tr>
                        <th>เวลาเครื่องจักรหยุดทำงานรวม</th>
                        <td><?php echo $down_time; ?></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
        </div>
    
        
        <div id="PartReq-cont">
        <?php

        $stmt2 = $conn->prepare($requisted_item_query);
		// Execute the query
		$stmt2->execute();
		// Get the result
		$result = $stmt2->get_result();

		if (mysqli_num_rows($result) > 0) {
            echo '<h3>ข้อมูลอะไหล่ที่เบิกสำหรับงาน</h3>';
			echo '<table class="table">';
			echo '<thead>';
			echo '<tr>';
			echo '<th>ลำดับ</th>';
            echo '<th>รหัสเบิก</th>';
			echo '<th>รหัสอะไหล่</th>';
			echo '<th>ชื่ออะไหล่</th>';
			echo '<th>สเปค</th>';
			echo '<th>ผู้เบิก</th>';
			echo '<th>จำนวนขอเบิก</th>';
			echo '<th>จำนวนอนุมัติ</th>';
            echo '<th>จำนวนใช้จริง</th>';
			//echo '<th>ราคา (บาท) / หน่วย</th>';
			echo '<th>สถานะรายการ</th>';
			echo '<th>เวลาอนุมัติ</th>';
			echo '<th>ผู้อนุมัติ</th>';
			echo '</tr>';
			echo '</thead>';
			echo '<tbody>';
		
			$itemsCount = 1;
			while ($row = $result->fetch_assoc()) {
				$thstatus = toThaiStatus($row['status']);
				echo '<tr>';
				echo '<td>' . $itemsCount . '</td>';
                echo '<td>' . $row['mr_code'] . '</td>';
				echo '<td>' . $row['part_id'] . '</td>';
				echo '<td>' . $row['part_name'] . '</td>';
				echo '<td>' . $row['part_spec'] . '</td>';
				echo '<td>' . $row['eng_req'] . '</td>';
				echo '<td>' . $row['req_quan'] . '</td>';
				if(strtolower($row['status']) == "issued"){
				echo '<td>' . $row['issue_quan'] . '</td>';
                echo '<td>' . $row['returnable_quan'] . '</td>';
				}else{
				echo '<td><input type="text" class="issued_quantity" data-max="' . $row['req_quan'] . '" value=""></td>';
                echo '<td>--</td>';}
				//echo '<td><input type="text" class="unit_price" value=""></td>';
				echo '<td>' . $thstatus . '</td>';
				if(strtolower($row['status']) == "issued"){
				echo '<td>' . formatDateTime($row['issue_time']) . '</td>';
				echo "<td> {$row['issued_name']} </td>";
				}else{
                    '<td> ผิดพลาด </td>';
                    '<td> ผิดพลาด </td>';
                }
				echo '</tr>';

				
				$itemsCount++;
			}
		
			echo '</tbody>';
			echo '</table>';
		} else {
			echo "<h3>ไม่มีรายการเบิกอะไหล่</h3>";
		}

            ?>

        </div>
    
        </div>







    <!-- Add Bootstrap JS scripts if needed -->
    <script>
    document.getElementById('backLink').addEventListener('click', function(event) {
    event.preventDefault(); // Prevents the link from navigating to "#"
    history.back(); // Takes the user back to the previous page
});


    </script>
</body>
</html>
