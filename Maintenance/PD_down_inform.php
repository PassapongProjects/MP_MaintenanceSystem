<?php
require '../connection.php';
session_start();
if(!isset($_SESSION['usid'])) {header("refresh:0; url=../logout.php"); exit;}

$url = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
$url = strtok($url, '?'); 
?>
<!DOCTYPE html>
<html>
<head>
    <title>Machine Repair Form</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
        }
        .container {
            width: 400px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
            border: 1px solid #ccc;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        .form-group {
            margin-bottom: 15px;
        }
        .form-group label {
            display: block;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .form-group input[type="text"] {
            width: 100%;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 3px;
        }
        .form-group select {
            width: 100%;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 3px;
        }
        .form-group textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 3px;
            resize: vertical;
        }
        .submit-btn {
            width: 100%;
            padding: 10px;
            background-color: #4CAF50;
            color: #fff;
            border: none;
            border-radius: 3px;
            cursor: pointer;
        }
        .submit-btn:hover {
            background-color: #45a049;
        }
    </style>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.0/jquery.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
</head>
<body>
    <!-- <a href="../welcome.php" style="display: inline-block; padding: 10px 20px; margin-left: 10px; margin-top: 10px; background-color: #3498db; color: #ffffff; text-decoration: none; border-radius: 5px; border: 1px solid #2980b9;">หน้าหลัก</a> -->
    <div class="container">
        <h2>แจ้งซ่อมเครื่องจักร</h2>
        <form action="PD_down_inform_handle.php" method="post">
            <div class="form-group">
                <label for="machine_id">หมายเลขเครื่อง:</label>
                <select type="text" id="machine_id" name="machine_id" required>
                <option value="" disabled selected>กรุณาเลือกรหัสเครื่อง</option>
                <?php 
                $query = "SELECT id, name FROM mc";
                $result = $conn->query($query);
                if ($result->num_rows > 0) {
                    while ($row = $result->fetch_assoc()) {
                        $machineId = $row['id'];
                        $machineName = $row['name'];
                        echo "<option value='$machineId'>{$machineId}: {$machineName}</option>";
                    }
                    echo "</select>";
                }
                $conn->close();
                 ?>
            </div>
            <div class="form-group">
                <label for="machine_name">ชื่อเครื่อง​:</label>
                <input type="text" id="machine_name" name="machine_name" readonly>
            </div>
            <div class="form-group">
                <label for="location">สถานที่ตั้ง:</label>
                <input type="text" id="location" name="location" readonly>
            </div>
            <div class="form-group">
                <label for="informed_reason">อาการที่เสีย:</label>
                <input type="text" id="informed_reason" name="informed_reason" required>
            </div>
            <div class="form-group">
                <label for="informing_operator">ชื่อผู้แจ้ง:</label>
                <input type="text" id="informing_operatorShow" name="informing_operatorShow" value = "<?php echo ($_SESSION['user']); ?>" readonly disabled>
                <input type="hidden" id="informing_operator" name="informing_operator"  value = "<?php echo ($_SESSION['usid']); ?>" readonly>
            </div>
            <button type="submit" class="submit-btn">แจ้งซ่อม</button>
        </form>
    </div>
    <script>
        // Add event listener to the machine_id dropdown using jQuery
        $(document).ready(function() {
            $('#machine_id').change(function() {
                // Get the selected machine_id value
                var selectedMachineId = $(this).val();
                if (selectedMachineId !== "") {
            // Remove the empty option from the select element
                $(this).find('option[value=""]').remove();
                 }
                // Make an AJAX call to fetch machine details based on the selected machine_id
                // Replace 'fetch_machine_details.php' with the actual server-side script to handle the AJAX call
                // The script should retrieve machine details based on the selected machine_id from the database
                // and return them as a JSON object
                $.ajax({
                    url: 'fetch_machine_details.php',
                    method: 'GET',
                    data: { machine_id: selectedMachineId },
                    dataType: 'json',
                    success: function(data) {
                        // Update the machine_name and location fields with the retrieved data
                        $('#machine_name').val(data.machine_name);
                        $('#location').val(data.location);
                    },
                    error: function(xhr, status, error) {
                        console.error('Error fetching machine details:', error);
                    }
                });
            });
            flatpickr("#downtime", {
                enableTime: true,
                dateFormat: "d-m-Y H:i น.",
                time_24hr: true,
                minuteIncrement: 5,
                maxDate:"today"
                // Add additional configuration options here if needed
            });
            
        });
    </script>



</body>
</html>
