$(document).ready(function() { 
  function checkProblemTable() {
    let trNum = $("#fix-detail-cont #problem-description-table tbody").find("tr").length;
    if(trNum ==1 ) {
      $noProbrow = `<tr class='no-prob-row'><td colspan='12' style='text-align:center;font-weight:bold;text-decoration:italic; background-color:#e5f4e3'>--ไม่มีรายการปัญหา--</td></tr>`;
      $("#fix-detail-cont #problem-description-table tbody .add-new-item-row").before($noProbrow);

    }else {
      $("#fix-detail-cont #problem-description-table tbody .no-prob-row").remove();
    }
  }

  function init_navAndLoad(){
    $('body').prepend('<div id="nav-container"></div>');

    $.get({url:'../global_res/global_sidebar_EN.html'}, function (htmlContent) {
        $('#nav-container').html(htmlContent);
        $.get({url:'../style/global_sidebar.css'}, function (cssContent) {
            $('<style>').attr('type','text/css').html(cssContent).appendTo('head');

            let $els = $('.menu a, .menu header');
            let count = $els.length;
            let grouplength = Math.ceil(count/3);
            let groupNumber = 0;
            let i = 1;
            $('.menu').css('--count',count+'');
            $els.each(function(j){
                if ( i > grouplength ) {
                    groupNumber++;
                    i=1;
                }
                $(this).attr('data-group',groupNumber);
                i++;
            });
        
            $('#nav-container').on('click','.menu footer button',function(e){
                e.preventDefault();
                $els.each(function(j){
                    $(this).css('--top',$(this)[0].getBoundingClientRect().top + ($(this).attr('data-group') * -15) - 20);
                    $(this).css('--delay-in',j*.1+'s');
                    $(this).css('--delay-out',(count-j)*.1+'s');
                });
                $('.menu').toggleClass('closed');
                e.stopPropagation();
            });
        
            // run animation once at beginning for demo



        });
    });

    function addLoadingCSS() {
        // Define your custom CSS rules
        $body = $("body");
        var customCSS = `
            .modal {
                display: none;
                position: fixed;
                z-index: 1000;
                top: 0;
                left: 0;
                height: 100%;
                width: 100%;
                background: rgba(114, 114, 114, 0.8) url('https://i.stack.imgur.com/FhHRx.gif') 50% 50% no-repeat;
            }
    
            body.loading .modal {
                overflow: hidden;
            }
    
            body.loading .modal {
                display: block;
            }
        `;
        // Create a <style> element and append the CSS rules
        $('<style>')
            .attr('type', 'text/css')
            .html(customCSS)
            .appendTo('head');
            $body.append('<div class="modal"><!-- Place at bottom of page --></div>')
    }
    addLoadingCSS();
    $(document).on({
      ajaxStart: function() { $('body').addClass("loading"); },
     ajaxStop: function() { $('body').removeClass("loading"); }    
    });

}
init_navAndLoad();
$(document).on({
  ajaxStart: function() { $('body').addClass("loading"); },
 ajaxStop: function() { $('body').removeClass("loading"); }    
});



    var now = new Date().toLocaleDateString("en-IN");
    function formatDate(inputDate) {
        //From yyyy-mm-dd to dd/mm/yyyy
        var parts = inputDate.split("-");
        if (parts.length !== 3) {
            return "Invalid date format";
        }
        
        var year = parts[0];
        var month = parts[1];
        var day = parts[2];
        
        return day + "/" + month + "/" + year;
    }
    function disableFormElements(condition) {
        if(condition){
        $(".pm-items .checkbox").prop("disabled", true);
        }
    }



    function fetchPlanData(pmCode, version,pmJobCode){
        $.ajax({
            url: 'fetch_pm_plan_data.php', // Replace with your server-side script URL
            method: 'POST',
            dataType: 'json',
            data: {
                pmCode: pmCode,
                version: version,
                mrCheck: true,
                pmJobCode: pmJobCode

            },
            success: function(data) {
                displayPlanData(data);
                disableFormElements(true);
            },
            error: function(xhr, status, error) {
                console.error('Error fetching job data:', error);
            }
        });
    }

    function displayHeaderMachineData(machineData){
        $("#plan-mcId-span-text").html("หมายเลขเครื่อง: "+machineData.machineId);
        $("#plan-mcName-span-text").html(machineData.machineName);
        $("#plan-mcLoc-span-text").html("สถานที่ตั้งเครื่อง: "+machineData.machineLoc);

    }
    function displayPlanData(jsonData) {
        // Header
        var plan_name = $("#plan_name-textbox");
        var interv = $("#plan_interval-textbox");
        var interv_unit = $("#interval-unit-select");
        var partRadioConfirm = $("#part-req-radio-confirm");
        var partRadioNo = $("#part-req-radio-no");
        var plan_description= $("#plan_desc-textbox");
        if(jsonData.interv_unit == 'd'){
            interval_unit_text = "วัน"
        }else if(jsonData.interv_unit =='m') {
            interval_unit_text = "เดือน";
        }else if(jsonData.interv_unit =='y'){
            interval_unit_text ="ปี";
        }else {
            interval_unit_text = "?";
        }
        //Detail Data
        $("#plan-name-span-text").html("ชื่อแผน: "+jsonData.plan_name);
        $("#plan-id-span-text").html("รหัสแผน: "+jsonData.pmCode);
        $("#plan-edit-date-span-text").html(formatDate(jsonData.edit_date));
        $("#plan-editor-span-text").html("ผู้ปรับปรุงแผน: "+jsonData.editor);
        $("#plan-approver-span-text").html("ผู้อนุมัติแผน: "+jsonData.approver);
        $("#interval-span-text").html("รอบการทำ: "+jsonData.interv+" "+interval_unit_text);

        plan_name.val(jsonData.plan_name);
        interv.val(jsonData.interv);
        interv_unit.val(jsonData.interv_unit);
        if(jsonData.part_req == 1){
            partRadioConfirm.prop("checked",true);
            $('#mr-detail-container').show();
        }else{
            partRadioNo.prop("checked",true);
        }

        plan_description.val(jsonData.plan_description);

        //Items
        $("#pm-items-table tbody").empty();
        var order = 1;
        jsonData.items.forEach(items => {
            var itemRow = `
            <tr class="pm-items" data-item-id="${items.id}">
            <td class="item-order" style="width: 50px;">${order}</td>
            <td class="item-topic">${items.ck_topic}</td>
            <td class="mark-items">${items.dt_clean == 1 ? '✔' : ''}</td>
            <td class="mark-items">${items.dt_test == 1 ? '✔' : ''}</td>
            <td class="mark-items">${items.dt_replace == 1 ? '✔' : ''}</td>
            <td class="mark-items">${items.dt_torque == 1 ? '✔' : ''}</td>
            <td class="mark-items">${items.dt_ovhaul == 1 ? '✔' : ''}</td>
            <td class="mark-items">${items.dt_check == 1 ? '✔' : ''}</td>
            <td class="mark-items">${items.dt_oil == 1 ? '✔' : ''}</td>
            <td class="item-work-mthd">${items.work_mthd}</td>
            <td class="item-std-check">${items.std_check}</td>
            <td><label class="radio-container" style="color:green;">
            ผ่าน
            <input type="radio" name="item${items.id}" id="pass${items.id}" data-item-id="${items.id}" value="pass">
            <span class="checkmark pass"></span>
          </label>
          
          <label class="radio-container" style="color:#ff4141;">
            ไม่ผ่าน
            <input type="radio" name="item${items.id}" id="notpass${items.id}" data-item-id="${items.id}" value="notpass">
            <span class="checkmark notpass" ></span>
          </label></td>
            </tr>`;
            order++;
            $("#pm-items-table tbody").append(itemRow);
        });

        //Parts
        if(jsonData.part_req =="1"){
            $(".added-parts-container").empty();
            $('#problem-description-table tbody').find("tr.part-changed-problem").remove();
            if(jsonData.mrCode=== undefined || jsonData.mrCode =="undefined") {
                $("#mr-code").html("-");
                $("#mr-status").html("ยังไม่ได้ทำการขอเบิกอะไหล่");
                $("#req-confirm-but-container").html("<button type='button' style='opacity:0.3;' id='Requist-confirm-but' disabled>ยืนยันการเบิกอะไหล่</button>");
                var Requistion = false;
            } else{
                $("#mr-code").html("<b>รหัสเบิก: </b>"+jsonData.mrCode);
                $("#mr-status").html("<b>สถานะ: </b>"+jsonData.mrCodeStatus);
                $("#req-confirm-but-container").html("");
                var Requistion = true;
            }
            jsonData.parts.forEach(part => {
                var partRow = `
            <tr class="part-items">
                <td class="partId">${part.part_id}</td>
                <td>${part.part_name}</td>
                <td>${part.part_spec}</td>
                <td class="part-req-quan">${part.req_quan}</td>
                <td>${part.part_unit}</td>
            `;
            if (!Requistion) {

            if (part.req_quan<= part.part_instock){
            partRow +=`
                <td><label class="radio-container" style="color:green;">
            เบิก
            <input type="radio" name="part${part.part_id}" id="yesReq${part.part_id}" data-part-id="${part.part_id}" value="req">
            <span class="checkmark pass"></span>
          </label>
          
          <label class="radio-container" style="color:#ff4141;">
            ไม่เบิก
            <input type="radio" name="part${part.part_id}" id="noReq${part.part_id}" data-part-id="${part.part_id}" value="noreq">
            <span class="checkmark notpass" ></span>
          </label></td>`;
        }else {
            partRow +=` 
            <td>
            <label>คงเหลือไม่เพียงพอ</label>
            <label class="radio-container" style="color:#ff4141;">
            ไม่เบิก
            <input type="radio" name="part${part.part_id}" id="noReq${part.part_id}" data-part-id="${part.part_id}" value="noreq" checked disabled>
            <span class="checkmark notpass" ></span>
          </label></td>`;
        }
    
    }else {
            partRow +=`<td>เสร็จสิ้น</td>`;
          }

           partRow += `</tr>`;
          
        $(".added-parts-container").append(partRow);
            // Handle Solution Table for part replacement
            // Changed type -> "initial" for planed changed, "breakdown" for unplanned changed.
            var changedPartRow = `
            <tr data-part-id="${part.part_id}" data-part-name="${part.part_name}" data-part-spec="${part.part_spec}" data-ct="initial" class="part-changed-problem">
            <td>${now}</td>
            <td>เปลี่ยนอะไหล่ตามรอบ<br>ID:${part.part_id}: ${part.part_name}</td>
            `;
            
        if (!Requistion){
        changedPartRow += `<td colspan="3" class="not-ready-data">--ยังไม่ได้ทำการขอเบิกอะไหล่--</td> `;
        }else { // if mrCode for the job Exist
            if(Object.keys(jsonData.requestedPartId).map(String).indexOf(String(part.part_id)) !== -1 && (jsonData.requestedPartId[part.part_id].reqmrCode == jsonData.mrCode) ) {
                // if the part Requested --> if the part is initially requested
            // further status check
            if(jsonData.requestedPartId[part.part_id].reqStatus.toLowerCase() =='issued'){
            changedPartRow += `<td><label class="radio-container" style="color:green;">
            สำเร็จ
            <input type="radio" name="part${part.part_id}" id="yesChanged${part.part_id}" value="req" class="part-change-radio">
            <span class="checkmark pass"></span>
          </label>
          
          <label class="radio-container" style="color:#ff4141;">
            ไม่สำเร็จ
            <input type="radio" name="part${part.part_id}" id="noChanged${part.part_id}" value="noreq" class="part-change-radio">
            <span class="checkmark notpass" ></span>
          </label></td>
          <td><input type="text" maxlength="500" class="problem-textbox" placeholder="-ปัญหา-" required></td>
          <td><input type="text" maxlength="500" class="solution-textbox" placeholder="-แก้ไข-" required>
          <input type="hidden"  class="mrCode-text" value="${jsonData.requestedPartId[part.part_id].reqmrCode}"></td>`;
        }else if(jsonData.requestedPartId[part.part_id].reqStatus.toLowerCase() =='waiting for approval') {
            changedPartRow +=`<td colspan="3" class="wait-approval-part">รออนุมัติเบิก
            <input type="hidden"  class="mrCode-text" value="${jsonData.requestedPartId[part.part_id].reqmrCode}"></td>`;

        } else {
            changedPartRow +=`<td class="wait-approval-part">ผิดพลาด</td>`;
        }
            }else {// if not requested
                changedPartRow += `<td>
              <label class="radio-container" style="color:#ff4141;">
                ไม่สำเร็จ
                <input type="radio" name="part${part.part_id}" id="noChanged${part.part_id}" value="noreq" class="part-change-radio" checked>
                <span class="checkmark notpass" ></span>
              </label></td>
              <td><input type="text" maxlength="500" class="problem-textbox" value="ไม่มีการขอเบิกรายการนี้" required disabled></td>
              <td><input type="text" maxlength="500" class="solution-textbox" value="ไม่มีการขอเบิกรายการนี้" required disabled>
              <input type="hidden"  class="mrCode-text" value="noReq"></td>`;
            }
        }

        changedPartRow +=`
           </tr>`;
           
        $('#problem-description-table tbody .add-new-item-row').before(changedPartRow);
        checkProblemTable();
            });

            // Handle Display for Extra part
            $.each( jsonData.requestedPartId, function( partId, arrayValue ) {
                if(arrayValue.reqmrCode == jsonData.mrCode) {return;
                }else {
                    // Only display Extra Items
                    var extraPartRow = `
                    <tr data-part-id="${partId}" data-part-name="${arrayValue.part_name}" data-part-spec="${arrayValue.part_spec}" data-ct="extra" class="part-changed-problem">
                    <td>${now}</td>
                    <td>เปลี่ยนอะไหล่เพิ่มเติม<br>ID:${partId}: ${arrayValue.part_name}</td>
                    `;
                    if(arrayValue.reqStatus.toLowerCase() =='issued'){
                        extraPartRow += `<td><label class="radio-container" style="color:green;">
                        สำเร็จ
                        <input type="radio" name="part${partId}" id="yesChangedExtra${partId}" value="req" class="part-change-radio">
                        <span class="checkmark pass"></span>
                      </label>
                      
                      <label class="radio-container" style="color:#ff4141;">
                        ไม่สำเร็จ
                        <input type="radio" name="part${partId}" id="noChangedExtra${partId}" value="noreq" class="part-change-radio">
                        <span class="checkmark notpass" ></span>
                      </label></td>
                      <td><input type="text" maxlength="500" class="problem-textbox" placeholder="-ปัญหา-" required></td>
                      <td><input type="text" maxlength="500" class="solution-textbox" placeholder="-แก้ไข-" required>
                      <input type="hidden"  class="mrCode-text" value="${arrayValue.reqmrCode}"></td>`;
                    }else if(arrayValue.reqStatus.toLowerCase() =='waiting for approval') {
                        extraPartRow +=`<td colspan="3" class="wait-approval-part">รออนุมัติเบิก
                        <input type="hidden"  class="mrCode-text" value="${arrayValue.reqmrCode}"></td>`;
            
                    } else {
                        extraPartRow +=`<td class="wait-approval-part">ผิดพลาด</td>`;
                    }

                    extraPartRow +=`
                </tr>`;
               
                $('#problem-description-table tbody .add-new-item-row').before(extraPartRow);
                checkProblemTable();

                }
              });


            $("#added-parts-field").show();
            $("#mr-detail-container").show();
            $("#initial-part-cont").show();


        }else{
            $(".added-parts-container").empty();
            $("#added-parts-field").hide();
            $("#initial-part-cont").hide();
            $("#mr-detail-container").hide();}

        $("#Plan-Save-btn").attr("id", "Plan-Edit-btn");
        $("#Plan-Edit-btn").html("แก้ไขรายละเอียด");
    }   

    $("#pm-items-table").on("change", 'input[type="radio"]', function() {
      
        var selectedValue = $(this).val();

    // Check if the selected value is 'Not Pass'
    if (selectedValue === 'notpass') {
      let radioId = this.id;
      let rowToCheck =  $(`[data-radio-id="not${radioId}"]`)
      if(rowToCheck.length){
        // If row already exist
        return;
      }
      else{
      // Create a new table row
      var closestRow = $(this).closest('tr');
      var itemTopicText = closestRow.find('.item-topic').text();
      var itemWorkMthdText = closestRow.find('.item-work-mthd').text();
      var itemStdCheck = closestRow.find('.item-std-check').text();
      let itmId = $(this).attr("data-item-id")
      var newRow = `
      <tr data-radio-id="${this.id}" data-item-id="${itmId}" class="not-pass-item">
      <td>${now}</td>
      <td class="problem-topic">${itemTopicText}</td>
      <td class="problem-work-mthd">${itemWorkMthdText}</td>
      <td><input type="text" maxlength="500" class="problem-textbox" placeholder="-ปัญหา-" required></td>
      <td><input type="text" maxlength="500" class="solution-textbox" placeholder="-แก้ไข-" required>
      <input type="hidden"  class="problem-std-check" value="${itemStdCheck}"></td>
      </tr>`;
      
      $('#problem-description-table tbody .add-new-item-row').before(newRow);
      checkProblemTable();
      }
    } else {
      // If the selected value is 'Pass', find and remove the corresponding row
      let radioId = this.id;
      let rowToRemove = $(`[data-radio-id="not${radioId}"]`);
      if (rowToRemove.length) {
        rowToRemove.remove();
        checkProblemTable();
      }
    }
      });

      $("#req-confirm-but-container").on("click","#Requist-confirm-but" ,function() {
        var partData = []; // Array to store part_id and selected value for each row
        var allNoReq = true;
        let valid = true;
        // Iterate through each table row with class "part-items"
        $(".part-items").each(function() {
          var row = $(this);
          var partId = parseInt(row.find(".partId").text()); // Get the part_id
          var req_quan = parseFloat(row.find(".part-req-quan").text());

          if( isNaN(partId) || isNaN(req_quan)) {
            alert("ข้อมูลผิดพลาด");
            return false;
          }
          
          //validation
          
          // Check which radio button is selected for this row
          var selectedValue = row.find("input[type='radio']:checked").val() || ''; // Get the selected value
          
          // Push the part_id and selected value to the partData array
          
          
          // Check if a radio button is selected for this row
          if (!selectedValue) {
            valid = false;
            alert("กรุณาเลือกการเบิกให้ครบทุกช่อง");

            return false; // Exit the loop early
          }
          if(selectedValue =='req') {
            allNoReq = false;
          }
          partData.push({ part_id: partId, selected_value: selectedValue,reqQuan:req_quan });
        });
        
        // Now you have an array (partData) with part_id and selected value for each row
        // Create New mrCode -> Store data in inven_requisted_cart -> Push to waiting for approval
        if(!valid) {return false;}
        if(!allNoReq) {
            var confirmMsg = "ยืนยันการเบิกอะไหล่";}
        else{
            var confirmMsg = "ยืนยันจะไม่เบิกอะไหล่";}

        if (confirm(confirmMsg)){
            var allJobId = $("#allJobIdHidden").val();
            var pmCode = $("#pmCodeHidden").val(); // This Is planCode
            var pmVer = $("#pmVerHidden").val();
            var pmJobCode = $("#pmJobCodeHidden").val();
            $.ajax({
                url: 'pm_plan_management_part_request_handle.php', // Replace with your server-side script URL
                method: 'POST',
                data: {
                    allJobId: allJobId,
                    partData: partData
                },
                success: function(data) {
                    $("#problem-description-table").find(".custom-problem, .not-pass-item").remove();
                    fetchPlanData(pmCode,pmVer,pmJobCode);
                },
                error: function(xhr, status, error) {
                    console.error('Error fetching job data:', error);
                }
            });
        }
        
      });

      $("#problem-description-table").on("click", "#add-new-item-btn", function() {
        var newRow = `
      <tr class="custom-problem">
      <td>${now}</td>
      <td><button type="button" class="remove-custom-problem-but">ลบรายการ</button></td>
      <td>ระบุปัญหาเพิ่มเติม</td>
      <td><input type="text" maxlength="500" class="problem-textbox" placeholder="-ปัญหา-" required></td>
      <td><input type="text" maxlength="500" class="solution-textbox" placeholder="-แก้ไข-" required></td>
      </tr>`;
      
      $('#problem-description-table tbody .add-new-item-row').before(newRow);
      checkProblemTable();

    });

    
    $("#problem-description-table").on("click", ".remove-custom-problem-but", function() {
        $(this).closest('tr').remove();
        checkProblemTable();

    });

    $("#problem-description-table").on("change",".part-change-radio", function() {
     
        // Get the selected value (either "req" or "noreq")
        var selectedValue = $(this).val();
        
        // Find the closest table row (tr) to the selected radio button
        var tableRow = $(this).closest("tr");
        
        // Find the input[type='text'] elements within the same table row
        var textInputs = tableRow.find("input[type='text']");
        
        // Check the selected value and enable or disable the text inputs accordingly
        if (selectedValue === "req") {
          textInputs.prop("disabled", true);
          textInputs.val("ไม่พบปัญหา");
        } else if (selectedValue === "noreq") {
            textInputs.val("");
          textInputs.prop("disabled", false);
        }
      });


      // Job Confirm Inspection handle
      function displayBtnByStatus() {
        let planStatus = $('#planStatusHidden').val();
        if(planStatus==='processing') {
          // No need to handle.-> Defult is fine by itself.
        }else if(planStatus==='planned'){
          $("#fix-detail-cont #job_done").attr("id","job_start");
          $("#fix-detail-cont #job_start").html("เริ่มงาน");

          $("body").find("button").prop("disabled",true);
          $("body").find("button").css("opacity",0.3);

          $("#fix-detail-cont #job_start").prop("disabled",false);
          $("#fix-detail-cont #job_start").css("opacity",1);

        }
      }


      $("#fix-detail-cont").on("click", "#job_start", () => {
        if(confirm("เริ่มการดำเนินการ PM")) {

$.ajax({
            url: 'pm_job_start_handle.php', // Replace with your server-side script URL
            method: 'POST',
            data: {
                pmCode: $("#pmJobCodeHidden").val()
            },
            success: function(data) {
                let result = JSON.parse(data);
                if (result.status) {
                  alert("ดำเนินการเริ่มงาน");
                  $("#fix-detail-cont #job_start").attr("id","job_done");
                  $("#fix-detail-cont #job_done").html("จบงาน");
                  $("body").find("button").prop("disabled",false);
                  $("body").find("button").css("opacity",1);
                }else {
                  alert("เริ่มงานผิดพลาด กรุณาลองอีกครั้ง");
                  location.reload();
                }
            },
            error: function(xhr, status, error) {
                console.error('Error fetching job data:', error);
            }
        });

        }

      });

      // Job Done Handle
      // 0. Create an Array to store job's detail information
      // 1. Check if every item's radio is selected
      // 2. If the 'Pass' option is selected -> add that item's data to the array
      // 3. The problem table could have 3 classes {part-changed-problem, custom-problem, not-pass-item}
      // part-changed-problem -> Check for Radio selection and text box value
      // custom-problem, not-pass-item -> Only check for text box value
      $("#fix-detail-cont").on("click", "#job_done", function(){
        let pmJobInformation = {};
        let eachJobDetail = [];
        let validInformation = true;
        // Loop through items table

        //Check if Requested for part or not
        if($("#initial-part-cont #added-parts-table").find("input[type='radio']").length >0){
          alert("ต้องยืนยันการเบิกอะไหล่ก่อนจึงจะจบงานได้");
          validInformation = false;
          return false;
        }

        $(".pm-items").each(function() {
            let row = $(this);
            let radioValue = row.find("input[type='radio']:checked").val();
        
            // Check if a radio button is not selected in this row
            if (typeof radioValue === "undefined") {
              alert("ระบุรายการการตรวจสอบให้ครบถ้วน (ผ่าน/ไม่ผ่าน)");
              validInformation = false;
              return false; // Exit the loop if at least one radio is not selected
            }
        
            // Check if the selected radio value is "pass"
            if (radioValue === "pass") {
              // Retrieve data from the row and add it to the dataArray
              var itemTopic = row.find(".item-topic").text();
              var itemWorkMethod = row.find(".item-work-mthd").text();
              var itemStdCheck = row.find(".item-std-check").text();
              var itemId = row.attr("data-item-id");
        
              eachJobDetail.push({
                "item-type": "PI",
                "item-id": itemId, // Unique id in the database
                "item-topic": itemTopic,
                "item-work-mthd": itemWorkMethod,
                "item-std-check": itemStdCheck,
                "item-problem": "ไม่พบปัญหา",
                "item-solution": "ไม่พบปัญหา" ,
                "comple": 1,
                "part_changed":null
              });
            }
            if(!validInformation){return false;}
          });

          if(!validInformation) {return;}
          // Loop through Problem table
          $("#problem-description-table tbody tr").each(function() {
            let row = $(this);
            // Check the class of the row
            if (row.hasClass("part-changed-problem")) {
              let changeType = row.attr("data-ct");
              if(changeType =="initial") {
                var changeTopic= "เปลี่ยนอะไหล่ตามรอบ"
              }else if(changeType="extra") {var changeTopic ="เปลี่ยนอะไหล่เพิ่มเติม"}
              let partName = row.attr("data-part-name");
              let partSpec = row.attr("data-part-spec");
              let partId = row.attr("data-part-id");
              let mrCode = row.find(".mrCode-text").val();
            if (row.find("input[type='radio']").length >0) {
              // First possibility: Radio input is present in the row
              let radioChecked = row.find("input[type='radio']:checked").val() || '';
              let problemInput = row.find(".problem-textbox").val();
              let solutionInput = row.find(".solution-textbox").val();
              
        
              if (radioChecked && problemInput !== "" && solutionInput !== "") {
                // All conditions are met, push the data to the dataArray
                if(radioChecked =='req') {
                    var partCompl = 1;
                }else { var partCompl = 0;}
                eachJobDetail.push({
                    "item-type": "CP",
                    "item-id": null, // No item Id specified.
                    "item-topic": changeTopic,
                    "item-work-mthd": partName,
                    "item-std-check": partSpec,
                    "item-problem": problemInput,
                    "item-solution": solutionInput ,
                    "comple": partCompl,
                    "part_changed":partId,
                    "mrCode": mrCode
                  });
              }else {alert("กรอกข้อมูลไม่ครบถ้วน"); 
              validInformation = false;
              return;}
            }else {
                // partChange Problem
                // If There is no Radio input -> Waiting for approval part
                eachJobDetail.push({ // This data is sent just to remove form cart table
                    "item-type": "CP",
                    "item-id": null, // No item Id specified.
                    "item-topic": changeTopic,
                    "item-work-mthd": "noissued",
                    "item-std-check": "noissued",
                    "item-problem": "noissued",
                    "item-solution": "noissued" ,
                    "comple": 0,
                    "part_changed":partId,
                    "mrCode": mrCode
                  });
            }
            } else if (row.hasClass("not-pass-item")){
                
                let problemInput = row.find(".problem-textbox").val();
                let solutionInput = row.find(".solution-textbox").val();
                if (problemInput !=='' && solutionInput !=='') {
                var itemId = row.attr("data-item-id");
                var itemTopic = row.find(".problem-topic").text();
                var itemWorkMethod = row.find(".problem-work-mthd").text();
                var itemStdCheck = row.find(".problem-std-check").val();
                eachJobDetail.push({
                    "item-type": "PI",
                    "item-id": itemId, // Unique id in the database
                    "item-topic": itemTopic,
                    "item-work-mthd": itemWorkMethod,
                    "item-std-check": itemStdCheck,
                    "item-problem": problemInput,
                    "item-solution": solutionInput,
                    "comple": 1,
                    "part_changed":null
                  });
                }else { alert("กรอกข้อมูลไม่ครบถ้วน"); 
                validInformation = false;
                return;}

            } else if (row.hasClass("custom-problem")) {
                let problemInput = row.find(".problem-textbox").val();
                let solutionInput = row.find(".solution-textbox").val();
                if (problemInput !=='' && solutionInput !=='') {
                    eachJobDetail.push({
                        "item-type": "PB",
                        "item-id": null, // Unique id in the database
                        "item-topic": "ปัญหาเพิ่มเติม",
                        "item-work-mthd":"ปัญหาเพิ่มเติม" ,
                        "item-std-check": "ปัญหาเพิ่มเติม",
                        "item-problem": problemInput,
                        "item-solution": solutionInput,
                        "comple": 1,
                        "part_changed":null
                      });
                     }else {alert("กรอกข้อมูลไม่ครบถ้วน"); 
                     validInformation = false;
                     return;}
            }

            if(!validInformation) {return false;}
          });

          if(validInformation){
            var pmJobCode = $("#pmJobCodeHidden").val();
            var allJobId = $("#allJobIdHidden").val();
            pmJobInformation['eachInformation'] = eachJobDetail;
            if(confirm("ยืนยันการจบงาน\n\nการจบงานจะยกเลิกรายการอะไหล่รออนุมัติทั้งหมด") && pmJobCode != '') {
                pmJobInformation["pmJobCode"] = pmJobCode;
                pmJobInformation["allJobId"] = allJobId;
                // Ajax Call with header changed after success response['success'] = true
                let serializedInformation = JSON.stringify(pmJobInformation);
                $.ajax({
                    url: 'pm_job_done_handle.php', 
                    method: 'POST',
                    dataType:'json',
                    data: {pmJobInformation: serializedInformation,
                      
                    },
                    success: function(data) {
  
                        if(data['status']) {
                            window.location.replace("ENG_MT_job.php?confirm_result=แจ้งจบงานสำเร็จ");
                        }else {
                            alert("เกิดข้อผิดพลาดไม่สามารถจบงาน");
                           window.location.replace("ENG_MT_JOB.php?confirm_result=จบงานไม่สำเร็จ");
                        }
                    },
                    error: function(xhr, status, error) {
                        console.error('Error fetching job data:', error);
                    }
                });
        }

            }

      });

      
    displayBtnByStatus();
    checkProblemTable();
    window.fetchPlanData = fetchPlanData;
    window.displayHeaderMachineData = displayHeaderMachineData;

});