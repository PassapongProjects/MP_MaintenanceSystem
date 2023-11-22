<?php
require '../connection.php';
session_start();
if(!isset($_SESSION['usid'])) {header("refresh:0; url=../logout.php"); exit;}
if(!isset($_POST['mrcode'])) {header("refresh:0; url=../logout.php"); exit;}
$thaiDays = array(
    'อาทิตย์', 'จันทร์', 'อังคาร',
    'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'
);

$thaiMonths = array(
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม',
    'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน',
    'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
);

$thaiDay = date('w');
$thaiMonth = date('n') - 1; // Adjust to array index

$thaiDate = "วัน {$thaiDays[$thaiDay]} ที่ " . date('j') . " " . " เดือน " . $thaiMonths[$thaiMonth] . " ปี " . (date('Y'));
$mrcode = $_POST['mrcode'];
?>

<!DOCTYPE html>
<html>
<head>
    <title>รายละเอียดรายการเบิกอะไหล่</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <link rel="stylesheet" href="../style/inven_part_issue_detail.css">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="../js/inven_part_issue_detail.js"></script>

</head>
<body>
<a href='inven_part_issue.php' id='backLink'>ย้อนกลับ</a>
    <div id="pg-container">
       <div id="information-cont">
        <!-- <h3>รายการขอเบิกอะไหล่</h3> -->
        <!--  <a href="../welcome.php" style="display: inline-block; padding: 10px 20px; margin-left: 10px; margin-top: 10px; background-color: #3498db; color: #ffffff; text-decoration: none; border-radius: 5px; border: 1px solid #2980b9;">หน้าหลัก</a> -->
        <div id='user-info'>
            <?php echo("
            <label>ผู้ใช้งานปัจจุบัน: {$_SESSION['user']}</label>
            <label>ตำแหน่ง: {$_SESSION['role']}</label>
            <label>หน่วยงาน: {$_SESSION['department']}</label>
            <label>{$thaiDate}</label>
            "); ?>
        </div>
		<label style="float:left; margin:5px; font-weight:bold;"> <?php echo "รหัส: {$mrcode}"; ?></label>
       </div> 
      
       <div id="req-list-cont">
	   <label for='issue-table' class='table-label'><h3>รายการอะไหล่</h3></label>
		<?php 
			$query = "SELECT
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
			inven_requisted_cart.returnable_quan As returnable_quan,
			req_emp_join.`name` As issued_name
		FROM (inven_requisted
			INNER JOIN (inven_requisted_cart
				INNER JOIN part ON inven_requisted_cart.fk_part_id = part.id) ON inven_requisted.mr_code = inven_requisted_cart.fk_requisted_code)
		INNER JOIN job_all ON fk_job_id = job_all.id
		INNER JOIN employee ON req_eng = employee.id
		LEFT JOIN employee As req_emp_join ON issued_eng = req_emp_join.id
		WHERE mr_code = ?;";

		function formatDateTime($dateTimeStr) {
			$dateTime = new DateTime($dateTimeStr);
			return $dateTime->format('d-m-Y H:i น.');
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

		$stmt = $conn->prepare($query);
		$stmt->bind_param("s", $mrcode);
		// Execute the query
		$stmt->execute();
		// Get the result
		$result = $stmt->get_result();

		if (mysqli_num_rows($result) > 0) {
			echo '<table class="table" id="issue-table">';
			echo '<thead>';
			echo '<tr>';
			echo '<th>ลำดับ</th>';
			echo '<th>รหัสอะไหล่</th>';
			echo '<th>ชื่ออะไหล่</th>';
			echo '<th>สเปค</th>';
			echo '<th>ผู้เบิก</th>';
			echo '<th>จำนวนต้องการ</th>';
			echo '<th>จำนวนอนุมัติ</th>';
			echo '<th>จำนวนรับคืนได้</th>';
			//echo '<th>ราคา (บาท) / หน่วย</th>';
			echo '<th>สถานะรายการ</th>';
			echo '<th>เวลาอนุมัติ</th>';
			echo '<th>อนุมัติจ่าย</th>';
			echo '<th>ระบุจำนวนคืน</th>';
			echo '<th>ยืนยันคืน</th>';
			echo '</tr>';
			echo '</thead>';
			echo '<tbody>';
		
			$itemsCount = 1;
			while ($row = $result->fetch_assoc()) {
				$thstatus = toThaiStatus($row['status']);
				echo '<tr>';
				echo '<td>' . $itemsCount . '</td>';
				echo '<td>' . $row['part_id'] . '</td>';
				echo '<td>' . $row['part_name'] . '</td>';
				echo '<td class="specTD">' . $row['part_spec'] . '</td>';
				echo '<td>' . $row['eng_req'] . '</td>';
				echo '<td>' . $row['req_quan'] . '</td>';
				if(strtolower($row['status']) == "issued"){
				echo '<td>' . $row['issue_quan'] . '</td>';
				echo '<td>' . $row['returnable_quan'] . '</td>';
				}else{
				echo '<td><input type="text" class="issued_quantity" data-max="' . $row['req_quan'] . '" value=""></td>';
				echo '<td> --- </td>';}
				//echo '<td><input type="text" class="unit_price" value=""></td>';
				echo '<td>' . $thstatus . '</td>';
				if(strtolower($row['status']) == "issued"){
				echo '<td class="timeTD">' . formatDateTime($row['issue_time']) . '</td>';
				echo "<td> {$row['issued_name']} </td>";
				}else{
				echo '<td> --- </td>';
				echo '<td><button class="confirm-issue-button" data-partid="' . $row['part_id'] . '" data-mrcode="' . $row['mr_code'] . '" data-req_quan="' . $row['req_quan'] . '">อนุมัติ</button></td>';}
				if(strtolower($row['status']) == "issued"){
					if($row['returnable_quan'] > 0){
					echo '<td><input type="text" class="return_quantity" data-max="' . $row['issue_quan'] . '" value=""></td>';
					echo '<td><button class="confirm-return-button" data-partid="' . $row['part_id'] . '" data-mrcode="' . $row['mr_code'] . '">รับคืน</button></td>';}
					else{echo '<td> --- </td>';
						echo '<td> --- </td>';}

				}else{
					echo '<td> --- </td>';
					echo '<td> --- </td>';
				}
				echo '</tr>';

				
				$itemsCount++;
			}
		
			echo '</tbody>';
			echo '</table>';
		} else {
			echo "ไม่มีรายการ";
		}
		
		$stmt->close();
		?>
        
       </div>

	   <div id='return-list-cont'>
		<label for='return-table' class='table-label'><h3>รายการรับคืน</h3></label>
		<?php
		$ReturnQuery = "SELECT
		inven_transactions.fk_mrcode AS mrcode,
		inven_transactions.fk_partid AS part_id,
		part. `name` AS part_name,
		part.spec AS part_spec,
		inven_transactions.t_type AS t_type,
		inven_transactions.t_dt AS t_dt,
		inven_transactions.t_quan As return_quan,
		employee.name AS return_emp
	FROM
		inven_transactions
		INNER JOIN part ON inven_transactions.fk_partid = part.id
		INNER JOIN employee ON inven_transactions.t_actor = employee.id
	WHERE 
		inven_transactions.fk_mrcode = ? AND inven_transactions.t_type = 'return';";


	$stmt2 = $conn->prepare($ReturnQuery);
	$stmt2->bind_param("s", $mrcode);
// Execute the query
	$stmt2->execute();
// Get the result
	$ReturnResult = $stmt2->get_result();

	if (mysqli_num_rows($ReturnResult) > 0) {
		echo '<table class="table" id ="return-table">';
		echo '<thead>';
		echo '<tr>';
		echo '<th>ลำดับ</th>';
		echo '<th>รหัสอะไหล่</th>';
		echo '<th>ชื่ออะไหล่</th>';
		echo '<th>สเปค</th>';
		echo '<th>จำนวนรับคืน</th>';
		echo '<th>ผู้รับคืน</th>';
		echo '<th>สถานะรายการ</th>';
		echo '<th>เวลารับคืน</th>';
		echo '</tr>';
		echo '</thead>';
		echo '<tbody>';
		$itemsCount = 1;
		while ($row = $ReturnResult->fetch_assoc()) {
			echo '<tr>';
			echo '<td>' . $itemsCount . '</td>';
			echo '<td>' . $row['part_id'] . '</td>';
			echo '<td>' . $row['part_name'] . '</td>';
			echo '<td class="specTD">' . $row['part_spec'] . '</td>';
			echo '<td>' . $row['return_quan'] . '</td>';
			echo '<td>' . $row['return_emp'] . '</td>';
			echo '<td>รับคืน</td>';
			echo '<td class="timeTD">' . formatDateTime($row['t_dt']) . '</td>';
			echo '</tr>';
			$itemsCount++;
		}
		echo '</tbody>';
		echo '</table>';

	}else{
		echo 'ไม่มีรายการคืน';
	}
	$stmt2->close();
	$conn->close();
		?>



	   </div>
    </div>
	<script>
// 	document.getElementById('backLink').addEventListener('click', function(event) {
//     event.preventDefault(); // Prevents the link from navigating to "#"
//     history.back(); // Takes the user back to the previous page
// });
    </script>
</body>
</html>


