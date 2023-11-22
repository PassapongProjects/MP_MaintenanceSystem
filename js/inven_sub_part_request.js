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
            <td style="text-align:center">${part.instock}</td>
            <td style="text-align:center">${part.unit}</td>
            <td>${part.part_loc}</td>
            <td style="text-align:center">
                <button type="button" class="btn btn-primary btn-sm add-part-btn" data-partid="${part.id}" data-mrcode="${mrCode}">เบิก</button>
            </td>
        </tr>
            `;
            partsListContainer.append(partItem);
        });
    }
    // Load options for part selection dropdown via Ajax
    
    // Handle form submission
    $('#partRequestForm').submit(function(event) {
        event.preventDefault();
        // Your code to handle form submission here
    });

    $("#added-parts-field").on("click", ".remove-part-btn", function() {
        // Get the values from the data attributes
        var partId = $(this).attr("data-partid");
        var mrCode = $(this).attr("data-mrcode");
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
                    url: "get_added_parts_sub.php", // Replace with your server-side script to retrieve added parts
                    method: "GET",
                    data: { mr_code:mrCode },
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

    $(document).on("click", ".add-part-btn", function() {
        // Get the part ID from the data attribute
        var partId = $(this).attr("data-partid");
        var mrCode = $(this).attr("data-mrcode");
        // AJAX call to store the part ID in the database
        $.ajax({
            url: "store_part_id_sub.php", // Replace with your server-side script to handle storing the part ID
            method: "POST",
            data: { partId: partId,
                    mrcode: mrCode},
            success: function(response) {
                // AJAX call to display all the added parts in the another field
                $.ajax({
                    url: "get_added_parts_sub.php", // Replace with your server-side script to retrieve added parts
                    method: "GET",
                    data: { mr_code:mrCode },
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




    $('#Requist-confirm-but').click(function() {
        var mrCode = $('#mrSelection').val();

            if (!$('.added-parts-table').length) {
                alert("กรุณาระบุรายการที่ต้องการ");
                return;
            } else {
                var partData = {};
                var valid = true;
                $('.added-p-req').each(function() {
                    var partId = $(this).attr('id').replace('p', '').replace('-requiredquan', '');
                    var requiredQuantity = $(this).val().replace(/^0+/, '');
                    var pInstock = $(this).data('instock');
                    var status = $(this).data('status');
                    if (requiredQuantity !== '' && parseFloat(requiredQuantity) > 0) {
                        if (parseFloat(requiredQuantity) > parseFloat(pInstock)) {
                            alert('อะไหล่เลขที่: ' + partId + ' เบิกเกินจำนวนคงคลัง');
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
                    return;
                }
    
                confirmationMessage = "รายการอะไหล่ที่ต้องการเบิก:";
                for (var partId in partData) {
                    confirmationMessage += "\nอะไหล่เลขที่: " + partId + ", จำนวน: " + partData[partId];
                }
    
                if (confirm(confirmationMessage)) {
                    $.ajax({
                        url: 'invent_part_request_handle_sub.php',
                        method: 'POST',
                        data: {mr_code: mrCode,
                        partData: partData,
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
    $("#jobSelection").change(function() {
        // Code to execute when the selection changes
        var jobId = $(this).val();
        var mr_select = $('#mrSelection')
        mr_select.empty();
        $("#mr-detail-container").hide();
        if (jobId !== "") {
            // Remove the empty option from the select element
            $(".spare-part-requisition-container").show();
            $(this).find('option[value=""]').remove();
            // AJAX to fetch mr_code for his job to mrselection
            $.ajax({
                url: "fetch_sub_mrcode.php", // This is to generate new mr
                method: "POST",
                dataType: "json",
                data: { jobId: jobId,},
                success: function(response) {
                    // Populate the "added-parts-field" div with the retrieved added parts
                    mr_select.append($('<option>', {
                        value: "",
                        text: "--กรุณาเลือกรายการ--",
                        selected: true,
                        disabled:true
                        
                    }))
                    
                    for (var i in response){
                        if(response[i] == "Nodata"){return;}
                        mr_select.append($('<option>', {
                            value: response[i],
                            text: response[i]
                        }))
                       } 
                },
                error: function(error) {
                    console.error("Error: ", error);
                }
            });
        }else{$(".spare-part-requisition-container").hide();}
        
       
    });
    $('#new-mr-but').click(function() {
        var jobId =  $("#jobSelection").val()
        var mr_select = $('#mrSelection')
        $.ajax({
            url: "store_part_id_sub.php", // This is to generate new mr
            method: "POST",
            data: { jobId: jobId,
                    generate: true},
            success: function(response) {
                // Populate the "added-parts-field" div with the retrieved added parts
                mr_select.append($('<option>', {
                    value: response,
                    text: response
                }))
                mr_select.val(response).change();
            },
            error: function(error) {
                console.error("Error: ", error);
            }
        });

    });

    $('#del-mr-but').click(function() {
        var mr_select = $('#mrSelection')
        var mr_cur_value = mr_select.val();
        $.ajax({
            url: "inven_del_mr_handle.php", // This is to generate new mr
            method: "POST",
            data: { mr_val: mr_cur_value,
                    delete: true},
            success: function(response) {
                var res = JSON.parse(response);
                // Populate the "added-parts-field" div with the retrieved added parts
                if(res.status=='GO'){
                // mr_select.append($('<option>', {
                //     value: "",
                //     text: "--กรุณาเลือกรายการ--"
                // }))
                mr_select.val("").change();
                mr_select.find(`option[value='${mr_cur_value}']`).remove();
                $("#mr-detail-container").hide();

            }else {
                alert("ไม่สามารถลบรายการที่มีการดำเนินการแล้วได้");
            }
                
            },
            error: function(error) {
                console.error("Error: ", error);
            }
        });

    });

    $("#mrSelection").change(function() {
        var mrcode = $(this).val();
        $(".parts-list-container .add-part-btn").attr("data-mrcode", mrcode);
        $.ajax({
            url: "get_added_parts_sub.php", // Replace with your server-side script to retrieve added parts
            method: "GET",
            data: { mr_code: mrcode },
            success: function(addedParts) {
                // Populate the "added-parts-field" div with the retrieved added parts
                $("#added-parts-field").html(addedParts);
                if(mrcode != null){
                $("#mr-detail-container").show();}
            },
            error: function(error) {
               
                console.error("Error retrieving added parts: ", error);
            }
        });
    });

    $(".spare-part-requisition-container").hide();
    $("#mr-detail-container").hide();
    fetchLatestPartData();
});