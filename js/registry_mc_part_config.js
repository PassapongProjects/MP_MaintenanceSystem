$(document).ready(function () {
    // jQuery code to load HTML and CSS into a PHP page

    function init_navAndLoad() {
        $('body').prepend('<div id="nav-container"></div>');

        $.get({ url: '../global_res/global_sidebar_EN.html' }, function (htmlContent) {
            $('#nav-container').html(htmlContent);
            $.get({ url: '../style/global_sidebar.css' }, function (cssContent) {
                $('<style>').attr('type', 'text/css').html(cssContent).appendTo('head');

                let $els = $('.menu a, .menu header');
                let count = $els.length;
                let grouplength = Math.ceil(count / 3);
                let groupNumber = 0;
                let i = 1;
                $('.menu').css('--count', count + '');
                $els.each(function (j) {
                    if (i > grouplength) {
                        groupNumber++;
                        i = 1;
                    }
                    $(this).attr('data-group', groupNumber);
                    i++;
                });

                $('#nav-container').on('click', '.menu footer button', function (e) {
                    e.preventDefault();
                    $els.each(function (j) {
                        $(this).css('--top', $(this)[0].getBoundingClientRect().top + ($(this).attr('data-group') * -15) - 20);
                        $(this).css('--delay-in', j * .1 + 's');
                        $(this).css('--delay-out', (count - j) * .1 + 's');
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
            ajaxStart: function () { $('body').addClass("loading"); },
            ajaxStop: function () { $('body').removeClass("loading"); }
        });

    }
    init_navAndLoad();

    const mode_select = $('#mode-select');
    const new_obj_button = $('#new-object-btn');
    const object_filter_bar = $("#filter-text-input");
    const mid_section_div = $("#mid-section-div");
    const object_table = $('#top-filter-table-cont');
    const operationInputField = $('#operation-input-field-cont');
    const operationInputFieldLabel = $('#operation-header-label');

    function fetchObjects(funcArr = null) {
        // Name As string
        // Arg as array {}
        if (funcArr == null) { return false };
        return new Promise(function (resolve, reject) {
            $.ajax({
                type: 'POST',
                url: 'fetch_registry_mc_part.php',
                data: { "functions": funcArr },
                success: function (response) {
                    // Resolve the Promise with the response data
                    response = JSON.parse(response);

                    if (response.status) {
                        resolve(response);
                    }
                    else { resolve(false) };
                },
                error: function (xhr, status, error) {
                    // Reject the Promise with an error message
                    reject(error);
                }
            });
        });
    }

    function isSafeInput(inputString) {
        // Check if the input string is empty or consists only of white spaces
        if (!inputString || inputString.trim() === "") {
            return false;
        }

        // Check for potentially harmful characters
        const harmfulChars = /[\'";`<>]/g; // Add more characters as needed
        if (harmfulChars.test(inputString)) {
            return false;
        }

        // If the input passes all checks, it is considered safe
        return inputString.trim();
    }

    function allowOnlyIntegers(inputElement) {
        let rawVal = inputElement.val();
        let cleanedVal = rawVal.replace(/[^0-9]/g, ''); // Remove non-numeric characters
        let value = parseInt(cleanedVal);
        if (isNaN(value) || value <= 0) {
            value = 0; // Clear the input if not valid
        }
        inputElement.val(value);
    }

    function allowFloatingPoint(inputElement) {
        let rawVal = inputElement.val();
        let cleanedVal = rawVal.replace(/^0+|[^0-9.]/g, '');
        let parts = cleanedVal.split('.');
        if (parts[0] == '') {
            parts[0] = '0';
        }
        if (parts.length > 2) {
            parts.pop();
        }
        cleanedVal = parts.join('.');
        inputElement.val(cleanedVal);

    }


    function displayRequireReasonPopup() {

            popupContent.empty();
            const part_stock_change_inform_field_hidden = operationInputField.find('#object-stock-change-reason');
            const part_stock_change_reason_select_hidden = operationInputField.find('#stock-change-reason-select');

            part_stock_change_inform_field_hidden.val("");
            part_stock_change_reason_select_hidden.val("");

            const detail_div = $('<div>').addClass('center-elements');
            const reason_select = $('<select>').addClass('select-element stock-change-reason-select').html(`
            <option value="" selected disabled>-- โปรดระบุ --</option>
            <option value="COUNT_PI"> ตรวจนับประจำปี </option>
            <option value="COUNT_CC"> ตรวจนับประจำรอบ </option>
            <option value="COUNT_ETC"> สาเหตุอื่น ๆ </option>
            `);
            const stock_change_reason_input = $('<input>').attr('type', 'text').attr('id', 'stock-change-reason-input').attr('placeholder', 'ระบุเหตุผลในการปรับจำนวน (บังคับ)');
            const confirm_done_btn = $('<button>').attr('type', 'button').addClass('oper-btn record_btn').text('ยืนยันแก้ไขจำนวนคงคลัง');

            const element_stock_change_reason = $('<div>').addClass('label-element-cont-center').append($('<label>').addClass('info-label').text("สาเหตุ: "), stock_change_reason_input).hide();

            const center_btn_div = $('<div>').addClass('center-btn-cont');

            detail_div.append(reason_select,element_stock_change_reason);
            center_btn_div.append(confirm_done_btn);

            popupContent.append(detail_div, center_btn_div);

            reason_select.on('change', function () {

                let selected_option = $(this).val();

                if (selected_option == "COUNT_ETC") {
                    stock_change_reason_input.val("");
                    element_stock_change_reason.show();

                } else {

                    element_stock_change_reason.hide();

                    if (selected_option == "COUNT_PI") {
                        stock_change_reason_input.val("ตรวจนับประจำปี");

                    } else if (selected_option == "COUNT_CC") {
                        stock_change_reason_input.val("ตรวจนับประจำรอบ");
                    }

                }
            });

            confirm_done_btn.on('click', function () {

                let inform_value = isSafeInput(stock_change_reason_input.val());
                let reason_value = reason_select.val();
                if (!inform_value || reason_value =="") {
                    alert('จำเป็นต้องระบุสาเหตุในการเปลี่ยนแปลง โดยห้ามใช้อัขระพิเศษ');
                    return false;
                } else {

                    part_stock_change_inform_field_hidden.val(inform_value);
                    part_stock_change_reason_select_hidden.val(reason_value);

                    operationInputField.find('#update-btn').trigger('click');

                    return true;
                }

            });

            popupElement.css('display', 'block');
            overlayElement.css('display', 'block');

            return true;

    }


    function initElements() {

        mid_section_div.hide();

        fetchObjects([{ "name": "fetch_objects_list", "arg": null }]).then(function (data) {
            objectsArrays = data.fetch_objects_list; // Machine and Parts
            mode_select.val("mc").trigger("change");
            init_filterBar_action();
        })
            .catch(function (error) {
                console.log(error);
                return;
            });

        init_tr_action(); //Floating tooltip and clicking

        // Initiate on change behavior of the filter bar


        operationInputField.on('change', '#object-status', function () {
            // Get the selected option's value
            var selectedValue = $(this).val();

            // Remove any existing classes that might have been set previously
            $(this).removeClass('active inactive down');

            // Add the appropriate class based on the selected value
            if (selectedValue === '1') {
                $(this).addClass('active');
            } else if (selectedValue === '2') {
                $(this).addClass('inactive');
            } else if (selectedValue === '3') {
                $(this).addClass('down');
            }
        });

        operationInputField.on('input', '.input-int-limit', function () {
            allowOnlyIntegers($(this));
        });

        operationInputField.on('input', '.input-float-limit', function () {
            allowFloatingPoint($(this));
        });
        operationInputField.on('click', '#update-btn', function () {
            let mode = mode_select.val();
            let information;
            if (!confirm("ยืนยันการบันทึกข้อมูล?")) { alert("ยกเลิกรายการ"); return; }
            if (mode == 'mc') {
                information = validate_mc_input();
            } else if (mode == 'part') {
                const part_real_instock_field = operationInputField.find('#object-real-instock');
                const part_stock_change_inform_field_hidden = operationInputField.find('#object-stock-change-reason');
                const current_stock = current_selected_obj ? current_selected_obj.real_instock: null;
                const new_part_stock = part_real_instock_field.val();
                

                if (new_part_stock != current_stock && current_stock !== null && part_stock_change_inform_field_hidden.val() == "") {
                    displayRequireReasonPopup();
                    return;
                }
                information = validate_part_input();
            } else {
                // Not expecting anything here -> mode out of bound
                return;
            }

            if (information) {
                if (information.objId == 'new') {
                    fetchObjects([{ "name": "new_object", "arg": information }]).then(function (data) {
                        if (data.new_object) {
                            alert('บันทึกข้อมูลสำเร็จ');
                            location.reload();
                        } else {
                            alert('เกิดข้อผิดพลาด กรุณาลองอีกครั้งหลังจากรีเฟรช');
                            return;
                        }
                    })
                        .catch(function (error) {
                            console.log(error);
                            alert('เกิดข้อผิดพลาด ดำเนินการรีเฟลชหน้า');
                            location.reload();
                            return;
                        })
                } else if (typeof information.objId == 'number') {
                    fetchObjects([{ "name": "update_object", "arg": information }]).then(function (data) {
                        if (data.update_object) {
                            alert('บันทึกข้อมูลสำเร็จ');
                            location.reload();
                            return;
                        } else {
                            alert('เกิดข้อผิดพลาด กรุณาลองอีกครั้งหลังจากรีเฟรช');
                            return;
                        }

                    })
                        .catch(function (error) {
                            console.log(error);
                            alert('เกิดข้อผิดพลาด ดำเนินการรีเฟลชหน้า');
                            location.reload();
                            return;
                        })

                } else {
                    console.log('Invalid Object id -> neither number or new');
                    alert('เกิดข้อผิดพลาด ดำเนินการรีเฟลชหน้า');
                    location.reload();
                    return;
                }
            } else {
                alert('กรุณากรอกข้อมูลให้ครบถ้วน');
                return;
            }

        });

        operationInputField.on('click', '#cancel-btn', function () {
            // Clear out Input field
            mid_section_div.hide();
            operationInputField.html("");

        });


        close_btn.on('click', () => {
            popupContent.empty();
            popupElement.css('display', 'none');
            overlayElement.css('display', 'none');
        });



    }

    function init_filterBar_action() {


        object_filter_bar.on("input", () => {
            let mode = mode_select.val();
            displayObjectTable(mode);
        })
    }

    function init_tr_action() {
        $('#top-filter-table-cont').on("mouseenter", ".objItm", function (event) {
            // Get the tooltip content
            let itmId = $(this).attr("data-id");
            let itmType = $(this).attr("data-type");
            let tooltipContent = `${itmType} รหัส ${itmId}: <span style="color: #f53613;">คลิกเพื่อแก้ไข</span>`;
            // Create a new tooltip element
            let tooltip = $('<div>').addClass('floating-text').html(tooltipContent);


            // Calculate tooltip position based on mouse coordinates
            let x = event.clientX + window.scrollX + 10; // Adjust horizontal position
            let y = event.clientY + window.scrollY + 10; // Adjust vertical position

            // Set tooltip position
            tooltip.css({ left: x + 'px', top: y + 'px' });


            // Append the tooltip to the body
            $('#pg-cont .top-section').append(tooltip);

            // Show the tooltip
            tooltip.css('display', 'block');


            $(document).on("mousemove", function (event) {
                let x = event.clientX + window.scrollX + 10; // Adjust horizontal position
                let y = event.clientY + window.scrollY + 10; // Adjust vertical position

                // Update tooltip position
                tooltip.css({ left: x + 'px', top: y + 'px' });
            });


            $(this).mouseleave(function () {
                tooltip.css('display', 'none');
                tooltip.remove(); // Remove the tooltip element from the DOM
            });
        });


        $('#top-filter-table-cont').on("click", ".objItm", function () {
            // Displaying InputField based on type and Id
            let itmId = $(this).attr("data-id");
            let itmType = $(this).attr("data-type-input");
            displayInputField(itmType, itmId, "update");

        });

    }

    function filterObjectsArray(objectsArray, searchString, objType) {
        searchString = searchString.replace(/\s/g, '').toLowerCase(); // Remove spaces and normalize to lowercase
        const filteredArray = objectsArray.filter(obj => {
            // Convert specified properties to lowercase and remove spaces
            const idLowerCase = obj.id.replace(/\s/g, '').toLowerCase();
            const nameLowerCase = obj.name.replace(/\s/g, '').toLowerCase();
            const locationLowerCase = obj.location == null ? '' : obj.location.replace(/\s/g, '').toLowerCase();
            const specLowerCase = obj.spec ? obj.spec.replace(/\s/g, '').toLowerCase() : '';
            // Check if the search string is found in any of the specified properties
            return (
                idLowerCase.includes(searchString) ||
                nameLowerCase.includes(searchString) ||
                locationLowerCase.includes(searchString) ||
                specLowerCase.includes(searchString)
            );
        });

        return filteredArray;
    }

    function displayObjectTable(objType) {

        object_table.html("");
        // objectType -> mc/part
        object_table.append(
            `<table class="object-table" id="mc-filter-table">
<thead>

</thead>
<tbody>
</tbody>
</table>
`);


        const tableHead = object_table.find("thead");
        const tableBody = object_table.find("tbody");

        if (objType == "mc") {
            let mcObject = objectsArrays.mc;

            if (object_filter_bar.val().replace(/\s/g, '') != '') {
                // if fiter text exists -> filter before further processing
                mcObject = filterObjectsArray(mcObject, object_filter_bar.val(), objType);
            }


            tableHead.append(`
<tr>
<th>รหัส</th>
<th colspan="2">ชื่อเครื่องจักร</th>
<th>สถานที่ตั้ง</th>
</tr>
`);

            if (mcObject.length > 0) {
                mcObject.forEach(mcItm => {

                    tableBody.append(`
    <tr class="objItm" data-id="${mcItm.id}" data-type='เครื่องจักร' data-type-input="mc">
            <td class="obj-id-td">${mcItm.id}</td>
            <td colspan="2">
                <div class="mc-item-name-cont">
                ${mcItm.name}
                </div>
            </td>
            <td>${mcItm.location == null ? '<span style="color:#ff4141;">-ไม่ระบุ-</span>' : mcItm.location}</td>
        </tr>
    `);


                });
            } else {
                tableBody.append(`
    <tr class="empty-object-row">
        <td colspan="4">ไม่มีรายการที่ค้นหา</td></tr>
    `);
            }

        } else if (objType == "part") {
            let partObject = objectsArrays.part;
            if (object_filter_bar.val().replace(/\s/g, '') != '') {
                // if fiter text exists -> filter before further processing
                partObject = filterObjectsArray(partObject, object_filter_bar.val(), objType);
            }
            tableHead.append(`
    <tr>
    <th>รหัส</th>
    <th colspan="2">ชื่อ-เสปคอะไหล่</th>
    <th>สถานที่ตั้ง</th>
    </tr>
    `);

            // Display Part Name and spec by seperated line
            // part-item-spec-cont should be displayed in two lines
            // the field should be filled with small size text
            if (partObject.length > 0) {
                partObject.forEach(partItm => {
                    tableBody.append(`
        <tr class="objItm" data-id="${partItm.id}" data-type='อะไหล่สำรอง' data-type-input="part">
            <td class="obj-id-td">${partItm.id}</td>
            <td colspan="2">
            <div class="part-item-name_spec_cont">
                <div class="part-item-name-cont">${partItm.name}</div>
                <div class="part-item-spec-cont">${partItm.spec}</div>
            </div>
            
            </td>
            <td>${partItm.location == null ? '<span style="color:#ff4141;">-ไม่ระบุ-</span>' : partItm.location}</td>
        </tr>

        `);
                });
            } else {
                tableBody.append(`
        <tr class="empty-object-row">
            <td colspan="4">ไม่มีรายการที่ค้นหา</td></tr>
        `);
            }

        } else {
            // mode not valid -> not expecting anything here
        }

    }

    function initiate_mc_inputs(objectId, mode) {
        const mc_id_field = operationInputField.find('#object-id-text');
        const mc_name_field = operationInputField.find('#object-name');
        const mc_location_field = operationInputField.find('#object-location');
        const mc_rank_field = operationInputField.find('#object-rank');
        const mc_type_field = operationInputField.find('#object-type');
        const mc_status_field = operationInputField.find('#object-status');
        const mc_group_field = operationInputField.find('#object-group');

        // Fetch the available <select> options

        fetchObjects([{ "name": "fetch_mc_all_select_option", "arg": null }]).then(function (data) {
            if (data.fetch_mc_all_select_option.status) {

                // Loop through select_rank object
                Object.entries(data.fetch_mc_all_select_option.select_rank).forEach(([key, value]) => {
                    let opt = $('<option>', { value: key, text: value });
                    mc_rank_field.append(opt);
                });

                // Loop through select_type object
                Object.entries(data.fetch_mc_all_select_option.select_type).forEach(([key, value]) => {
                    let opt = $('<option>', { value: key, text: value });
                    mc_type_field.append(opt);
                });

                // Loop through select_status object
                Object.entries(data.fetch_mc_all_select_option.select_status).forEach(([key, value]) => {
                    let opt = $('<option>', { value: key, text: value });
                    mc_status_field.append(opt);
                });

                // Loop through select_group object
                Object.entries(data.fetch_mc_all_select_option.select_group).forEach(([key, value]) => {
                    let opt = $('<option>', { value: key, text: value });
                    mc_group_field.append(opt);
                });

                if (mode == "update") {
                    // Fetch and Set data

                    fetchObjects([{ "name": "fetch_object_detail", "arg": { "type": 'mc', "objId": objectId } }]).then(function (data) {
                        if (data.fetch_object_detail.status) {

                            current_selected_obj = data.fetch_object_detail.object_detail;

                            let obj_id = data.fetch_object_detail.object_detail.id;
                            let obj_name = data.fetch_object_detail.object_detail.name;
                            let obj_location = data.fetch_object_detail.object_detail.location;
                            let obj_fk_mc_rank = data.fetch_object_detail.object_detail.fk_mc_rank;
                            let obj_Type = data.fetch_object_detail.object_detail.Type;
                            let obj_Status = data.fetch_object_detail.object_detail.Status;
                            let obj_fk_group = data.fetch_object_detail.object_detail.fk_group == null ? 3 : data.fetch_object_detail.object_detail.fk_group;

                            operationInputFieldLabel.html("แก้ไขรายละเอียดเครื่องจักร");
                            mc_id_field.html(obj_id);
                            mc_id_field.attr("data-id", obj_id);
                            mc_name_field.val(obj_name);
                            mc_location_field.val(obj_location);

                            mc_rank_field.val(obj_fk_mc_rank);
                            mc_type_field.val(obj_Type);
                            mc_status_field.val(obj_Status);
                            mc_group_field.val(obj_fk_group);
                            mc_status_field.trigger("change");
                            mid_section_div.show();
                            window.scrollTo(0, document.body.scrollHeight);
                        } else {
                            alert("error");
                            location.reload();
                            return;
                        }


                    })
                        .catch(function (error) {
                            console.log(error);
                            return;
                        });


                } else if (mode == 'new') {
                    operationInputFieldLabel.html("เพิ่มรายการเครื่องจักรใหม่");
                    mid_section_div.show();
                    window.scrollTo(0, document.body.scrollHeight);
                    return; // Done operating

                } else {
                    // Not expecting anything here -> mode other than new/update
                }



            } else {
                alert("error");
                location.reload();
                return;
            }

        })
            .catch(function (error) {
                console.log(error);
                return;
            });
    }


    function initiate_part_inputs(objectId, mode) {
        const part_id_field = operationInputField.find('#object-id-text');
        const part_name_field = operationInputField.find('#object-name');
        const part_spec_field = operationInputField.find('#object-partSpec');
        const part_location_field = operationInputField.find('#object-location');
        const part_unit_field = operationInputField.find('#object-unit');
        const part_ltTime_field = operationInputField.find('#object-ltTime');
        const part_safetyStock_field = operationInputField.find('#object-safetyStock');
        const part_real_instock_field = operationInputField.find('#object-real-instock');
        const part_stock_change_inform_field_hidden = operationInputField.find('#object-stock-change-reason');
        const part_auto_ss_field = operationInputField.find('#object-auto-safetyStock');

        if (mode == "update") {
            // Fetch and Set data

            fetchObjects([{ "name": "fetch_object_detail", "arg": { "type": 'part', "objId": objectId } }]).then(function (data) {
                if (data.fetch_object_detail.status) {
                    current_selected_obj = data.fetch_object_detail.object_detail;

                    let obj_id = data.fetch_object_detail.object_detail.id;
                    let obj_name = data.fetch_object_detail.object_detail.name;
                    let obj_spec = data.fetch_object_detail.object_detail.spec;
                    let obj_location = data.fetch_object_detail.object_detail.location;
                    let obj_unit = data.fetch_object_detail.object_detail.unit;
                    let obj_lead_time = data.fetch_object_detail.object_detail.lead_time ?? '0';
                    let obj_safety_stock = data.fetch_object_detail.object_detail.safety_stock ?? '0';
                    let obj_real_instock = data.fetch_object_detail.object_detail.real_instock ?? '0';
                    let obj_auto_update_ss = data.fetch_object_detail.object_detail.auto_update_ss ?? '1';
                  

                    operationInputFieldLabel.html("แก้ไขรายละเอียดอะไหล่");
                    part_id_field.html(obj_id);
                    part_id_field.attr("data-id", obj_id);
                    part_name_field.val(obj_name);
                    part_spec_field.val(obj_spec);
                    part_location_field.val(obj_location);
                    part_unit_field.val(obj_unit);
                    part_ltTime_field.val(parseInt(obj_lead_time));
                    part_safetyStock_field.val(parseFloat(obj_safety_stock));
                    part_real_instock_field.val(parseFloat(obj_real_instock));
                    part_auto_ss_field.val(obj_auto_update_ss);

                    mid_section_div.show();
                    window.scrollTo(0, document.body.scrollHeight);
                } else {
                    alert("error");
                    location.reload();
                    return;
                }


            })
                .catch(function (error) {
                    console.log(error);
                    return;


                });

        } else if (mode == 'new') {
            operationInputFieldLabel.html("เพิ่มรายการอะไหล่ใหม่");
            mid_section_div.show();
            window.scrollTo(0, document.body.scrollHeight);
            return; // Done operating

        } else {
            // Not expecting anything here -> mode other than new/update
        }


    }




    function displayInputField(objectType = null, objectId = null, mode = null) {
        // mode new / update 
        // Generate Empty Field -> If Mode is new
        // EMPTY out the field before changing
        mid_section_div.hide();
        operationInputField.html("");
        operationInputFieldLabel.html("");
        // Call promise to fetch detail and 
        let btn_group = `<div class="operation-button-group-cont">
    <!-- Save / Cancel Button Goes here -->
    <button type="button" class="operation-btn" id="update-btn">บันทึก</button>
    <button type="button" class="operation-btn" id="cancel-btn">ยกเลิก</button>
    </div>`;
        if (objectType == 'mc') {
            let inputfield = `
        <div class="total-input-group-cont">

            <div class="input-group-cont long-text-group-cont">
            <label class="input-label" for="object-id-text">เลขรหัส: </label>
                <div class="input-cont" id="object-id-text" data-id=""><span style="color:#ff4141;">** สร้างรายการใหม่</span></div>
                <div class="input-cont" id="object-name-cont">
                <label class="input-label" for="object-name" style="color:#ff4141;">ชื่อเครื่อง*: </label>
                <input type="text" id="object-name" class="text-field-input" placeholder="กรอกข้อมูล" required></div>
                <div class="input-cont" id="object-location-cont"> 
                <label class="input-label" for="object-location">สถานที่ตั้ง: </label>
                <input type="text" id="object-location" class="text-field-input" placeholder="กรอกข้อมูล"></div>
            </div>

            <div class="input-group-cont short-text-group-cont">
                <div class="input-cont" id="object-rank-cont">
                <label class="input-label" for="object-rank">ความสำคัญ: </label>
                <select id="object-rank" class="select-field-input select">
                <option value="" selected disabled style="color:#ff4141;">--*--</option>
                </select></div>
                <div class="input-cont" id="object-type-cont">
                <label class="input-label" for="object-type" style="color:#ff4141;">ประเภทเครื่อง*: </label>
                <select id="object-type" class="select-field-input select">
                <option value="" selected disabled style="color:#ff4141;">--*--</option>
                </select></div>
                <div class="input-cont" id="object-status-cont">
                <label class="input-label" for="object-status" style="color:#ff4141;">สถานะ*: </label>
                <select id="object-status" class="select-field-input select">
                <option value="" selected disabled style="color:#ff4141;">--*--</option>
                </select></div>
                <div class="input-cont" id="object-group-cont">
                <label class="input-label" for="object-group" style="color:#ff4141;">หน่วยงาน*: </label>
                <select id="object-group" class="select-field-input select">
                <option value="" selected disabled style="color:#ff4141;">--*--</option>
                </select></div>
            </div>

        </div>
        `;

            operationInputField.append(inputfield);
            operationInputField.append(btn_group);
            initiate_mc_inputs(objectId, mode);

        } else if (objectType == 'part') {
            let inputfield = `
            
        <div class="total-input-group-cont">

            <div class="input-group-cont long-text-group-cont">
            <label class="input-label" for="object-id-text">เลขรหัส: </label>
                <div class="input-cont" id="object-id-text" data-id=""><span style="color:#ff4141;">** สร้างรายการใหม่</span></div>
                <div class="input-cont" id="object-name-cont">
                <label class="input-label" for="object-name" style="color:#ff4141;">ชื่ออะไหล่*: </label>
                <input type="text" id="object-name" class="text-field-input" placeholder="กรอกข้อมูล" required></div>
                <div class="input-cont" id="object-partSpec-cont">
                <label class="input-label" for="object-partSpec" style="color:#ff4141;">สเปคอะไหล่*: </label>
                <textarea type="text" id="object-partSpec" class="text-field-input" placeholder="กรอกข้อมูล" required></textarea></div>
                <div class="input-cont" id="object-location-cont">
                <label class="input-label" for="object-location">สถานที่เก็บ: </label>
                <input type="text" id="object-location" class="text-field-input" placeholder="กรอกข้อมูล"></div>
            </div>

            <div class="input-group-cont short-text-group-cont">
                <div class="input-cont" id="object-unit-cont">
                <label class="input-label" for="object-unit" style="color:#ff4141;">หน่วยนับ*: </label>
                <input type="text" class="text-field-input" id="object-unit" placeholder="กรอกข้อมูล"></div>
                <div class="input-cont" id="object-real-instock-cont">
                <label class="input-label" for="object-real-instock">จำนวนคงคลัง: </label>
                <input type="text" class="input-float-limit number-input" id="object-real-instock" min="0" placeholder="1.00"></div>
                <div class="input-cont" id="object-ltText-cont">
                <label class="input-label" for="object-ltTime">Lead Time (วัน): </label>
                <input type="text" class="input-int-limit number-input" id="object-ltTime" min="0" placeholder="1"></div>
                <div class="input-cont" id="object-safetyStock-cont">
                <label class="input-label" for="object-safetyStock">Safety Stock: </label>
                <input type="text" class="input-float-limit number-input" id="object-safetyStock" min="0" placeholder="1.00"></div>
                <div class="input-cont" id="object-auto-safetyStock-cont">
                <label class="input-label" for="object-auto-safetyStock">ปรับ Safety Stock อัตโนมัติ: </label>
                <select id="object-auto-safetyStock" class="select-field-input select">
                <option value="1" selected>ปรับอัตโนมัติ</option>
                <option value="0">ไม่ ปรับอัตโนมัติ</option>
                </select></div>
                <input type="hidden" id="object-stock-change-reason" value="">
                <input type="hidden" id="stock-change-reason-select" value="">
            </div>

        </div>
        `;
            operationInputField.append(inputfield);
            operationInputField.append(btn_group);
            initiate_part_inputs(objectId, mode);
        } else {
            // Not expecting Anything here (Neither machine nor part)
        }


    }


    function validate_mc_input() {
        // Define const(s) of input field
        // Called When submit

        const mc_id_field = operationInputField.find('#object-id-text');
        const mc_name_field = operationInputField.find('#object-name');
        const mc_location_field = operationInputField.find('#object-location');
        const mc_rank_field = operationInputField.find('#object-rank');
        const mc_type_field = operationInputField.find('#object-type');
        const mc_status_field = operationInputField.find('#object-status');
        const mc_group_field = operationInputField.find('#object-group');

        // Field Required -> name, Location, status, group

        let information = {
            type: 'mc',
            objId: isNaN(parseInt(mc_id_field.attr('data-id'), 10)) ? 'new' : parseInt(mc_id_field.attr('data-id'), 10),
            name: mc_name_field.val() || false,
            location: mc_location_field.val() || '',
            fk_mc_rank: mc_rank_field.val() || '',
            Type: mc_type_field.val() || false,
            Status: mc_status_field.val() || false,
            fk_group: mc_group_field.val() || false
        }

        for (const key in information) {
            if (information[key] === false) {
                return false;
            } else if (typeof information[key] === 'string') {
                information[key] = information[key].trim();
            }
        }

        return information;
    }


    function validate_part_input() {
        // Define const(s) of input field
        // Called When submit
        const part_id_field = operationInputField.find('#object-id-text');
        const part_name_field = operationInputField.find('#object-name');
        const part_spec_field = operationInputField.find('#object-partSpec');
        const part_location_field = operationInputField.find('#object-location');
        const part_unit_field = operationInputField.find('#object-unit');
        const part_ltTime_field = operationInputField.find('#object-ltTime');
        const part_safetyStock_field = operationInputField.find('#object-safetyStock');
        const part_real_instock_field = operationInputField.find('#object-real-instock');
        const part_stock_change_inform_field_hidden = operationInputField.find('#object-stock-change-reason');

        const part_stock_change_reason_select_hidden = operationInputField.find('#stock-change-reason-select');
        const part_auto_ss_field = operationInputField.find('#object-auto-safetyStock');

        const new_part_stock = parseFloat(part_real_instock_field.val()) ?? 0;
        const old_part_stock = current_selected_obj ? parseFloat(current_selected_obj.real_instock) : 0;
        let part_stock_diff = new_part_stock - old_part_stock;
        let inform_value = part_stock_change_inform_field_hidden.val();
        let select_reason_value = part_stock_change_reason_select_hidden.val();
        // Field Required -> name, spec, unit


        let information = {
            type: 'part',
            objId: isNaN(parseInt(part_id_field.attr('data-id')), 10) ? 'new' : parseInt(part_id_field.attr('data-id'), 10),
            name: part_name_field.val() || false,
            spec: part_spec_field.val() || false,
            location: part_location_field.val() || '',
            unit: part_unit_field.val() || false,
            lead_time: part_ltTime_field.val() || 0,
            safety_stock: part_safetyStock_field.val() || 0,
            new_part_stock: new_part_stock,
            part_stock_diff: part_stock_diff,
            stock_change_inform_reason: inform_value,
            stock_change_select_reason: select_reason_value,
            part_auto_ss: part_auto_ss_field.val()
        }

        for (const key in information) {
            if (information[key] === false) {
                return false;
            } else if (typeof information[key] === 'string') {
                information[key] = information[key].trim();
            }
        }


        return information;

    }

    new_obj_button.on("click", () => {
        current_selected_obj = null;
        displayInputField(mode_select.val(), null, "new");

    });



    mode_select.on("change", function () {
        // display Filter table
        // Clea out Every Element such as input filter /...
        let mode = mode_select.val();

        // Clear out Input field
        mid_section_div.hide();
        operationInputField.html("");
        object_filter_bar.val("");
        //

        displayObjectTable(mode); // -> Clear the filter bar every time this thing is displayed

    });

    var current_selected_obj;
    const popupElement = $('#edit-popUpForm');
    const overlayElement = $('#dark-overlay');
    const popupContent = $('#form-context');
    const close_btn = $('#closepopUp');

    initElements();

});