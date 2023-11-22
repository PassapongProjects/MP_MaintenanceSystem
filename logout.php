<?php
session_start();
session_destroy(); //ทำข้อมูลเป็นช่องว่าง

	header("refresh: 0; url=index.php");
	
?>