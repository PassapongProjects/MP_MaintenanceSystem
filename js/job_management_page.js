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



    $.ajax({
        url: "get_added_parts.php", // Replace with your server-side script to retrieve added parts
        method: "GET",
        data: { jobId: $("#inputjobid").val() },
        success: function(addedParts) {
            // Populate the "added-parts-field" div with the retrieved added parts
            
            $("#added-parts-field").html(addedParts);
        },
        error: function(error) {
          
            console.error("Error retrieving added parts: ", error);
        }
    });
    $(".option-checkbox").change(function() {
        if (this.checked) {
            // Uncheck #option1Checkbox if any other checkbox is checked
            $(".option-checkbox").not(this).prop("checked", false);
            $(".spare-part-requisition-container").hide();
        } else {if ($(".option-checkbox:checked").length === 0) {
            $(this).prop("checked", true);}}
    $("#option1Checkbox").change(function() {
        if (this.checked) {
            // Show the spare part requisition form
            $(".spare-part-requisition-container").show();
            
        }

    });

    // Function to handle checking of the option checkboxes
    
    });

    $(".spare-part-requisition-container").show();
          // Example data for demonstration purposes

        // Function to create a job element

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
        
        // Function to display the filtered parts in the parts list container
        function displayFilteredParts(filteredParts) {
            var partsListContainer = $(".parts-list-container");
            partsListContainer.empty(); // Clear any existing parts
            var job_id_ = $("#inputjobid").val();
            filteredParts.forEach(function(part) {
                var partItem = `
                <tr>
                <td style="text-align:center">${part.id}</td>
                <td>${part.part_name}</td>
                <td>${part.part_spec}</td>
                <td style="text-align:center">${part.instock}</td>
                <td style="text-align:center">${part.unit}</td>
                <td>${part.part_loc}</td>
                <td>
                    <button type="button" class="btn btn-primary btn-sm add-part-btn" data-partid="${part.id}" data-job_id="${job_id_}">เบิก</button>
                </td>
            </tr>
                `;
                partsListContainer.append(partItem);
            });
        }
        

        $('#toggleButton').click(function() {
            $('.part_req_table').toggle();
          });
        // Function to handle the search box input change
        $("#searchBox").on("input", function() {
            var searchText = $(this).val();
    
            // Filter the parts based on the search text
            var filteredParts = filterParts(searchText);
    
            // Display the filtered parts in the parts list container
            displayFilteredParts(filteredParts);
        }); 
         // Function to handle "เบิก" button click
        
         $(document).on("click", ".add-part-btn", function() {
            
            // Get the part ID from the data attribute
            var partId = $(this).data("partid");
            var jobId = $(this).data("job_id");
            // AJAX call to store the part ID in the database
            $.ajax({
                url: "store_part_id.php", // Replace with your server-side script to handle storing the part ID
                method: "POST",
                data: { partId: partId,
                        jobId: jobId },
                success: function(response) {
                    // AJAX call to display all the added parts in the another field
                    
                    $.ajax({
                        url: "get_added_parts.php", // Replace with your server-side script to retrieve added parts
                        method: "GET",
                        data: { jobId: jobId },
                        success: function(addedParts) {
                            // Populate the "added-parts-field" div with the retrieved added parts
                            $("#added-parts-field").html(addedParts);
                        },
                        error: function(error) {
                           
                            console.error("Error retrieving added parts: ", error);
                        }
                    });
                },
                error: function(error) {
                    console.error("Error storing part ID: ", error);
                }
            });
        });

        $("#added-parts-field").on("click", ".remove-part-btn", function() {
            // Get the values from the data attributes
            var partId = $(this).data("partid");
            var mrCode = $(this).data("mrcode");
            var jobId = $(this).data("jobid");
            // AJAX call to handle the SQL query for removing the part
            $.ajax({
                url: "inven_remove_added_cart.php", // Replace with your server-side script to handle the removal
                method: "POST",
                data: {
                    partId: partId,
                    mrCode: mrCode
                },
                success: function(response) {
                    $.ajax({
                        url: "get_added_parts.php", // Replace with your server-side script to retrieve added parts
                        method: "GET",
                        data: { jobId: jobId },
                        success: function(addedParts) {
                            // Populate the "added-parts-field" div with the retrieved added parts
                            $("#added-parts-field").html(addedParts);
                        },
                        error: function(error) {
                           
                            console.error("Error retrieving added parts: ", error);
                        }
                    });
                },
                error: function(error) {
                    console.error("Error removing part: ", error);
                }
            });
        });


        $('#job_done').click(function() {
            var reasonDescription = $('#reason-description').val();
            var maintenanceDescription = $('#maintenance-description').val();
            var selectedOption = $('input[type=checkbox]:checked').val();
            var jobId = $('#inputjobid').val();
            
            if (reasonDescription === '' || maintenanceDescription === '') {
                alert('กรอกรายละเอียดงานให้ครบถ้วน');
                return;
            }
        
            var confirmationMessage = "ตรวจสอบความถูกต้องของข้อมูล?\n\nรายละเอียดเหตุผล: " + reasonDescription + "\nรายละเอียดการซ่อมบำรุง: " + maintenanceDescription;
        
            if (selectedOption === '1') {

                if (confirm(confirmationMessage)) {
                    sendAjaxRequest({}, reasonDescription, maintenanceDescription, selectedOption,jobId);
                }
            } else {
                // Handle other selected options
                if (confirm(confirmationMessage)) {
                    sendAjaxRequest({}, reasonDescription, maintenanceDescription, selectedOption,jobId);
                }
            }
        });


        $('#Requist-confirm-but').click(function() {
            var jobId = $('#inputjobid').val();

            var valid = true;
                if (!$('.added-parts-table').length) {
                    alert("กรุณาระบุรายการที่ต้องการ");
                    return false;
                } else {
                    var partData = {};
                    $('.added-p-req').each(function() {
                        var partId = $(this).attr('id').replace('p', '').replace('-requiredquan', '');
                        var requiredQuantity = $(this).val().replace(/^0+/, '');
                        var pInstock = $(this).data('instock');
                        var status = $(this).data('status');
                        if (requiredQuantity !== '' && parseFloat(requiredQuantity) > 0) {
                            if (parseFloat(requiredQuantity) > parseFloat(pInstock)) {
                                alert('อะไหล่เลขที่: ' + partId + ' เบิกเกินจำนวนคงคลัง');
                                valid = false;
                                return;
                            }
                            if(status !=='done'){
                            partData[partId] = requiredQuantity;}
                        } else {
                            alert('จำนวนอะไหล่ไม่ถูกต้อง: หากไม่ใช้กรุณาลบจากรายการ');
                            valid = false;
                            return;
                        }
                    });
        
                    if ($.isEmptyObject(partData) || valid == false) {
                        return false;
                    }
        
                    confirmationMessage = "รายการอะไหล่ที่ต้องการเบิก:";
                    for (var partId in partData) {
                        confirmationMessage += "\nอะไหล่เลขที่: " + partId + ", จำนวน: " + partData[partId];
                    }
        
                    if (confirm(confirmationMessage)) {
                        $.ajax({
                            url: 'invent_part_request_handle.php',
                            method: 'POST',
                            data: {jobId: jobId,
                            partData: partData,
                            jobType: 'BD'
                            },
                            success: function(response) {
                            
                               alert("ยืนยันรายการเสร็จสมบูรณ์ กรุณาติดต่อคลังอะไหล่เพื่อดำเนินการเบิกจ่าย")
                               location.reload();
                            },
                            error: function(error) {
                                console.error('Error:', error);
                            }
                        });
                    }
                }
            
        });

        
        
        function sendAjaxRequest(partData, reasonDescription, maintenanceDescription, selectedOption,jobid) {
            var dataToSend = {
                jobId: jobid,
                partData: partData,
                reasonDescription: reasonDescription,
                maintenanceDescription: maintenanceDescription,
                selectedOption: selectedOption
            };
            
            $.ajax({
                url: 'job_done_handle.php',
                method: 'POST',
                data: dataToSend,
                success: function(response) {
                    var res = JSON.parse(response);
                    if(res.success){
                        window.location.href = 'ENG_MT_job.php?confirm_result=แจ้งจบงานสำเร็จ';
                    }else{
                        alert("จบงานไม่สำเร็จ\nสาเหตุ: "+res.reason)
                    }
                   
                },
                error: function(error) {
                    console.error('Error:', error);
                }
            });
        }
        
        function fetch_eng_table() {
            return new Promise(function (resolve, reject) {
              $.ajax({
                url: 'fetch_pm_job_schedule.php',
                method: 'POST',
                data: { requiredTopic: [{ "name": 'employeeData' }] },
                success: function (data) {
                  const response = JSON.parse(data);
                  if (response.status) {
                    const employee = response.employeeData;
                    resolve(employee); // Resolve the promise with the employee data
                  } else {
                    resolve([]); // Resolve with an empty array if no data is available
                  }
                },
                error: function (xhr, status, error) {
                  reject(error); // Reject the promise in case of an error
                }
              });
            });
          }

        if ($('.container').find('.asg-eng-cont').length >0) {
            let selector = $("#asg_select");
            let asg_eng_val = $("#asg_eng_for_job").val();
            let optionSelect =false;
          fetch_eng_table().then(function(employeeData) {
                    employeeData.forEach(eng => {
                        if (eng.empID == asg_eng_val) {
                            optionSelect = true;
                        }else {
                            optionSelect = false;
                        }
                        selector.append($('<option>', {
                           value: eng.empID,
                           text: "รหัส: "+ eng.empID + ": " + eng.empName +" " + eng.empSurname,
                           selected: optionSelect  
                       }))
                       });
                    });
        }

        $(".container").on("click","#asg_btn", () => {
            if ($(".container #asg_select").val() != "") {

        $.ajax({
        url: "job_process_handle.php", // Replace with your server-side script to retrieve added parts
        method: "POST",
        data: { job_id:  $('#inputjobid').val(),
            engineerid: $(".container #asg_select").val(),
            operMode: 'asgEng' },
        success: function(response) {
            let res = JSON.parse(response);
            if (res.status) {
            alert("มอบหมายงานสำเร็จ");
            location.reload();
            }
            else {
                alert("ผิดพลาด โปรดลองอีกครั้ง");
                location.reload();
            }
        },
        error: function(error) {
          
            console.error("Error retrieving added parts: ", error);
        }
    });

            }
        })
        
        


            

    fetchLatestPartData()
});
