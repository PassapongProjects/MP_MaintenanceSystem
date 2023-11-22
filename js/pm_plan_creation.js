$(document).ready(function() {
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
    
    $('#toggleButton').click(function() {
        $('#part-list-table').toggle();
      });
    $("#searchBox").on("input", function() {
        var searchText = $(this).val();

        // Filter the parts based on the search text
        var filteredParts = filterParts(searchText);

        // Display the filtered parts in the parts list container
        displayFilteredParts(filteredParts);
    }); 
    function fetchLatestPartData() {
        $.ajax({
            url: 'fetch_MPpart_details.php', // Replace with your server-side script URL
            method: 'GET',
            dataType: 'json',
            success: function(data) {
                // Render the updated job dashboard with the latest job data
                parts = data;
                displayFilteredParts(parts)
            },
            error: function(xhr, status, error) {
                console.error('Error fetching job data:', error);
            }
        });
    }

    

    function filterParts(searchText) {
        searchText = searchText.replace(/\s/g, '');
        var filteredParts = parts.filter(function(part) {
            // Convert both the part name and spec to lowercase for case-insensitive search
            var partNameLowerCase = part.part_name.toLowerCase().replace(/\s/g, '');
            var partSpecLowerCase = part.part_spec.toLowerCase().replace(/\s/g, '');
    
            // Check if the search text is found in either the part name or spec
            return (
                partNameLowerCase.indexOf(searchText.toLowerCase()) !== -1 ||
                partSpecLowerCase.indexOf(searchText.toLowerCase()) !== -1
            );
        });
    
        return filteredParts;
    }

    function displayFilteredParts(filteredParts) {
        var partsListContainer = $(".parts-list-container");
        partsListContainer.empty(); // Clear any existing parts
        //var job_id_ = $("#inputjobid").val();
        var mrCode = $("#mrSelecttion").val()
        filteredParts.forEach(function(part) {
            var partItem = `
            <tr>
            <td style="text-align:center">${part.id}</td>
            <td>${part.part_name}</td>
            <td>${part.part_spec}</td>
            <td style="text-align:center">${part.unit}</td>
            <td style="text-align:center">
                <button type="button" class="btn btn-primary btn-sm add-part-btn" data-partid="${part.id}" ">เลือก</button>
            </td>
        </tr>
            `;
            partsListContainer.append(partItem);
        });
    }

    $("#items-container").on("click", "#add-new-item-btn", function() {
        var newRow = $(".pm-items:last").clone();
        // Update the order number
        var newOrder = parseInt(newRow.find("td.item-order").text()) + 1;
        newRow.find("td.item-order").text(newOrder);
        
        // Reset checkboxes and input fields
        newRow.find(":checkbox").prop("checked", false);
        newRow.find(":text").val("");

        // Append the new row before the "Add New Item" row
        newRow.insertBefore(".add-new-item-row");
    });

    $("#items-container").on("click", ".remove-item-btn", function() {
        var rowCount = $(".pm-items").length;

        // Check if there's more than one row before removing
        if (rowCount > 1) {
            // Get the current row and remove it
            var removedRow = $(this).closest(".pm-items");
            removedRow.remove();

            // Update the order numbers of remaining rows
            $(".pm-items").each(function(index) {
                $(this).find("td.item-order").text(index + 1);
            })
        } else {
            // If rowCount <=1
         }
    });


    $("#Plan-Save-btn").click(function() {
        // Check if all required fields are filled
        var isValid = true;

        var planName = $("#plan_name-textbox").val().trim();
        if (planName === "") {
            alert("กรุณาระบุชื่อแผน");
            isValid = false;
        }

        // Validate "plan interval"
        var planInterval = $("#plan_interval-textbox").val().trim();
        if (planInterval === "") {
            alert("กรุณาระบุรอบทำงาน");
            isValid = false;
        }
        var planSelectUnit = $("#interval-unit-select").val();
        if (planSelectUnit ===""){
            alert("กรุณาระบุหน่วยเวลา")
            isValid = false;
        }
        // Validate "plan description"
        var planDesc = $("#plan_desc-textbox").val().trim();
        if (planDesc === "") {
            alert("กรุณาระบุคำอธิบายแผน (ถ้าไม่มีใส่ - )");
            isValid = false;
        }
        var partReqRadio = $('input[name="part-req-radio"]:checked').val();
        if (partReqRadio =="0"){
            partReqVal = 0;
        }else if (partReqRadio =="1"){
            partReqVal = 1;
        }else{
            alert("เกิดข้อผิดพลาดการเลือกรายการอะไหล่");
            isValid = false;
        }

        

        var itemsData = [];
        // Check items container inputs
        $(".pm-items").each(function() {
            var itemName = $(this).find(".item-name").val();
            var workMethod = $(this).find(".work-method").val();
            var standard = $(this).find(".standard").val();
            

            if (itemName === "" || workMethod === "" || standard === "") {
                alert("กรุณากรอกข้อมูลรายการให้ครบทุกช่อง");
                isValid = false;
                return false; // Break the loop
            }

            var rowData = {
                // order: $(this).find(".item-order").text(),
                name: itemName,
                checkboxes: {
                    clean: $(this).find(".c-clean").prop("checked"),
                    test: $(this).find(".c-test").prop("checked"),
                    replace: $(this).find(".c-replace").prop("checked"),
                    torque: $(this).find(".c-torque").prop("checked"),
                    overhaul: $(this).find(".c-overhaul").prop("checked"),
                    check: $(this).find(".c-check").prop("checked"),
                    oil: $(this).find(".c-oil").prop("checked")
                },
                workMethod: workMethod,
                standard: standard
            };

            itemsData.push(rowData);
        });
        
        reqPartData = [];
        $(".part-items").each(function() { 
            var partId = $(this).find(".partId").text();
            var reqQuan = $(this).find(".added-p-req").val();
            if (!isFinite(partId)) {
                alert("เกิดข้อผิดพลาด");
                isValid = false;
                return false; // Break the loop
            }

            if (reqQuan=== "") {
                alert("กรุณากรอกจำนวนที่ต้องการของอะไหล่หมายเลข: "+partId);
                isValid = false;
                return false; // Break the loop
            }


            var partRow = {
                partId: partId,
                reqQuan: reqQuan
            }
            reqPartData.push(partRow);
        });


        var requestData = {
            planName: $("#plan_name-textbox").val().trim(),
            planInterval: $("#plan_interval-textbox").val(),
            intervalUnit: $("#interval-unit-select").val(),
            planDesc: $("#plan_desc-textbox").val().trim(),
            partReqVal: partReqVal,
            items: itemsData,
            parts: reqPartData
        };

        if (isValid) {
            // Encode data and fire Ajax call
            var jsonData = JSON.stringify(requestData);
            $.ajax({
                url: "pm_plan_creation_handle.php",
                type: "POST",
                data: { newPlanData: jsonData,
                    updating: false},
                success: function(response) {
                    var res = JSON.parse(response);
                    if(res.status) {
                        alert("บันทึกสำเร็จ");
                        location.reload();
                    }else{
                        alert(res.message);
                    }



                },
                error: function(error) {
                    console.error("Error saving plan: ", error);
                }
            });
        }else{return;}
    });


    $("#part-list-table").on("click", ".add-part-btn", function() {
        var partId = $(this).data("partid");
        var partName = $(this).closest("tr").find("td:nth-child(2)").text();
        var partSpec = $(this).closest("tr").find("td:nth-child(3)").text();
        var partUnit = $(this).closest("tr").find("td:nth-child(4)").text();
        var duplicatePart = false;
        // Create a new row in the 'added-parts-table'
        var newRow = `
            <tr class="part-items">
                <td class="partId">${partId}</td>
                <td>${partName}</td>
                <td>${partSpec}</td>
                <td style='width: 5%; text-align:center:'><input type='text' value ='' name='${partId}-requiredquan' id='${partId}-requiredquan' class='form-control form-control-sm added-p-req' required></td>
                <td>${partUnit}</td>
                <td><button type='button' class='remove-part-btn' data-partid='${partId}''>ลบ</button></td>
            </tr>
        `;
        $(".part-items").each(function() { 
            var addedPartId = $(this).find(".partId").text(); 
            if (addedPartId == partId) {
                duplicatePart = true;
                return;
            }
        });
        // Append the new row to the 'added-parts-table'
        if (!duplicatePart) {
        $(".added-parts-container").append(newRow);
        }else {
            alert("ไม่สามารถเพิ่มรายการซ้ำ");
            return;
        }
        
        // Show the 'added-parts-field' div
        $("#added-parts-field").show();
    });


    $(".added-parts-container").on("click", ".remove-part-btn", function() {
        // Get the current row and remove it
        var rowCount = $(".part-items").length;  
        // Check if there's more than one row before removing
        if (rowCount >= 1) {
            var removedRow = $(this).closest(".part-items");
            removedRow.remove();
            if (rowCount == 1){
            $("#added-parts-field").hide(); 
            } 
        } 
    });


    $("#added-parts-field").on("input", ".added-p-req", function() {
        var rawVal = $(this).val();
        var cleanedVal = rawVal.replace(/[^0-9.]/g, ''); // Remove non-numeric characters
    
        // Split the value by the decimal point
        var parts = cleanedVal.split('.');
        
        // Remove any additional decimal points beyond the first one
        if (parts.length > 2) {
            parts.pop(); // Remove the last element
            cleanedVal = parts.join('.');
        }
        $(this).val(cleanedVal);
        var value = parseFloat(cleanedVal);
        if (isNaN(value) || value < 0) {
            $(this).val(""); // Clear the input if not valid
        }
    });


    $('#plan_interval-textbox').on("input", ()=>{

        let inputValue = $("#plan_interval-textbox").val();

        inputValue = inputValue.replace(/[^0-9]/g, '');
        if (parseInt(inputValue) > 366) {
            alert("จำกัดตัวเลขไม่เกิน 366");
            inputValue = '';
        }
        $("#plan_interval-textbox").val(inputValue);

    });
    
    $('#interval-unit-select').on("change", ()=>{
        let thisSelector =  $('#interval-unit-select');
        if (thisSelector.val() != "" ){
        thisSelector.find("option[value='']").prop("disabled",true);
        }
    });

    $("#pm-id-label").hide();
    $("#added-parts-field").hide();
    $("#mr-detail-container").hide();
    if ($('#part-req-radio-confirm').prop('checked')) {
        $('#mr-detail-container').show(); // Show the 'mr-detail-container'
    }
    
    // Handle radio button change event
    $('input[name="part-req-radio"]').change(function() {
        if ($(this).attr('id') === 'part-req-radio-confirm') {
            $('#mr-detail-container').show();
        } else {
            $('#mr-detail-container').hide();
            $("#added-parts-field").hide();
            $('.added-parts-container').html("");
        }
    });

    fetchLatestPartData();

});
