$(document).ready(function () {
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
                    background: rgba(114, 114, 114, 0.8) url('../icon/global_loading_gif.gif') 50% 50% no-repeat;
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
        return inputString;
    }
    function generate_tooltip(element, contentText) {
        element.on('mouseenter', function (event) {

            $('body').find('.floating-text').remove();
            let tooltipContent = contentText
            // Create a new tooltip element
            let tooltip = $('<div>').addClass('floating-text').html(tooltipContent);


            // Calculate tooltip position based on mouse coordinates
            let x = event.clientX + window.scrollX + 10; // Adjust horizontal position
            let y = event.clientY + window.scrollY + 10; // Adjust vertical position

            // Set tooltip position
            tooltip.css({ left: x + 'px', top: y + 'px' });


            // Append the tooltip to the body
            $('body').append(tooltip);

            // Show the tooltip
            tooltip.css('display', 'block');


            element.on("mousemove", function (event) {

                let x = event.clientX + window.scrollX + 10; // Adjust horizontal position
                let y = event.clientY + window.scrollY + 10; // Adjust vertical position

                // Update tooltip position
                tooltip.css({ left: x + 'px', top: y + 'px' });
            });


            element.mouseleave(function () {
                tooltip.css('display', 'none');
                tooltip.remove(); // Remove the tooltip element from the DOM
            });
        });
    }

    function object_to_options(obj, selected_val = null, mode = "obj") {
        selected_val = selected_val ?? "";

        let option_html = `<option value="" ${selected_val === "" ? "selected" : ""} disabled>-- โปรดระบุ --</option>`;

        if (mode === "obj") {
            $.each(obj, function (id, name) {

                option_html += `<option value="${id}" ${selected_val == id ? "selected" : ""} >${name}</option>`;

            });
        } else if (mode === "arr") {
            obj.forEach(row => {
                option_html += `<option value="${row.id}" ${selected_val == row.id ? "selected" : ""} >${row.name}</option>`;
            });
        }


        return option_html;

    }



    function displayEmployeeHandling(empId) {

        function generate_mid_section_content(registered = false,auth_type_option_html,registered_selected_option = null) {

            mid_section_div.addClass('hide');
            operationInputFieldLabel.empty();
            operationInputField.empty();

            // Generate content inside then append to mid section

            const registration_form_cont = $('<div>').addClass('registration-form-cont');

            const registration_form = $('<form>').addClass('registration-form');

            const username_field = $('<div>').addClass('registration-input-field username-field');

            const password_field = $('<div>').addClass('registration-input-field password-field');
            const show_pass_icon = $('<i>').addClass('fas fa-eye-slash eyes-icon').attr('id','eyeIcon');
            const password_eye_wrap = $('<div>').addClass('password-eye-wrap');

            const auth_type_field = $('<div>').addClass('registration-input-field auth-select-field');
            

            const username_label = $('<label>').addClass('registration-input-label username-label').text('ชื่อผู้ใช้');
            const password_label = $('<label>').addClass('registration-input-label password-label').text('รหัสผ่าน');
            const auth_type_label = $('<label>').addClass('registration-input-label auth-select-label').text('ระดับ');

            const username_input = $('<input>').attr('type','text').attr('placeholder','ชื่อผู้ใช้').attr('maxlength',50).prop('required',true).prop('autofocus',true).addClass('registration-input username-input');
            const password_input = $('<input>').attr('type','password').attr('placeholder','รหัสผ่าน').attr('maxlength',50).prop('required',true).addClass('registration-input pass-input');

            
            const auth_type_select = $('<select>').addClass('registration-auth-select').append(auth_type_option_html);


            const submit_btn = $('<button>').attr('type','submit').attr('id','confirm-registration-form-btn').addClass('oper-btn').text('สร้างบัญชีใหม่');

            
            password_eye_wrap.append(password_input,show_pass_icon);
            

            username_field.append(username_label,username_input);
            password_field.append(password_label,password_eye_wrap);
            auth_type_field.append(auth_type_label,auth_type_select);

            registration_form.append(username_field,password_field,auth_type_field,auth_type_field,submit_btn);
            registration_form_cont.append(registration_form);

        
            show_pass_icon.on('click',function(){

                if(password_input.attr('type') === 'password'){
                    password_input.attr('type','text');
                    show_pass_icon.removeClass('fa-eye-slash').addClass('fa-eye');
                }else {
                    // showing - text
                    password_input.attr('type','password');
                    show_pass_icon.removeClass('fa-eye').addClass('fa-eye-slash');
                }

                

            });

            
            registration_form.off();
            registration_form.submit(function(e){
            
                e.preventDefault();
      
                // Add password/username validaion

                try {
            
                const username_input_value = username_input.val();
                const password_input_value = password_input.val();
                const selected_auth_rank = auth_type_select.val();

                if (selected_auth_rank == "") {

                    alert('กรุณาระบุระดับของบัญชี');
                    throw new Error(`กรุณาระบุระดับของบัญชี`);
                }
                if(!isSafeInput(username_input_value) || !isSafeInput(password_input_value)) {
                    alert(`มีการใข้อักขระต้องห้าม ตัวอักษรที่ห้ามใช้( '";<> )`);
                    throw new Error(`มีการใข้อักขระต้องห้าม ตัวอักษรที่ห้ามใช้( '";<> )`);
                }

                // Fetch data to check if username already exist or not

                // if !usable username -> prevnet submitting
                

                fetchObjects([{"name":"registration_handle","arg":{"username":username_input_value,"pass":password_input_value,"auth_rank":selected_auth_rank,"empId":empId}}]).then(function(data){

                    if(data.registration_handle.status){

                        alert('เพิ่มบัญชีผู้ใช้สำเร็จ');
                        location.reload();
                        return;
                        
                    }else {
                        let error_code = data.registration_handle.error ?? 'Error';
                        console.log(error_code);

                        if(error_code == 100){
                            alert('ผู้ใช้งานนี้มีการสมัครสมาชิกแล้ว กรุณาลองใหม่รีเฟรช');
                        }else if(error_code == 200) {
                            alert('ชื่อผู้ใช้ซ้ำกับผู้อื่นในระบบ กรุณาใช้ชื่อผู้ใช้อื่น');
                            username_input.val("");
                            username_input.focus();
                        }else {
                            alert('เกิดข้อผิดพลาด กรุณารีเฟรช');
                        }

                        
                        return false;
                    }


                })
                .catch((error)=> {
                    throw new Error(error);
                });





            }catch (error){
                console.log(error);
                return false;

            }
              
            });

            if (!registered) {
                // New account -> Form to input username / password
                
                operationInputFieldLabel.text("สร้างบัญชีใหม่");
                operationInputField.append(registration_form_cont);


                

            } else {
                // Already has an account
                // Change Password / Reset Password
                
                operationInputFieldLabel.text("จัดการบัญชีผู้ใช้");

                if(registered_selected_option === null) {
                    // Unselected option -> display button

                    const mode_btn_cont = $('<div>').addClass('center-button-container');
                    const password_change_mode_btn = $('<button>').attr('type','button').addClass('mode-select-button password-change-button').text('เปลี่ยนรหัสผ่าน');

                    mode_btn_cont.append(password_change_mode_btn);

                    password_change_mode_btn.on('click',()=>{

                        generate_mid_section_content(registered,auth_type_option_html,"mode_change_password");
                        return;
                        
                    })

                    operationInputField.append(mode_btn_cont);

                }else if(registered_selected_option == "mode_change_password") {
                    // Update Password -> Require username, password, newpassword

                    fetchObjects([{ "name": "fetch_user_account_information", "arg": { "empId": empId } }]).then(function (data) {

                        if(data.fetch_user_account_information.status) {

                            const acc_data = data.fetch_user_account_information.acc_data;

                            username_input.val(acc_data.username);
                            password_input.focus();

                            auth_type_select.val(acc_data.auth_role);

                            submit_btn.text('ยืนยัน');
                            
                            registration_form.off();
                            registration_form.submit(function(e){
                                e.preventDefault();
                                try {
            
                                    const username_input_value = username_input.val();
                                    const password_input_value = password_input.val();
                                    const selected_auth_rank = auth_type_select.val();
                    
                                    if (selected_auth_rank == "") {
                    
                                        alert('กรุณาระบุระดับของบัญชี');
                                        throw new Error(`กรุณาระบุระดับของบัญชี`);
                                    }
                                    if(!isSafeInput(username_input_value) || !isSafeInput(password_input_value)) {
                                        alert(`มีการใข้อักขระต้องห้าม ตัวอักษรที่ห้ามใช้( '";<> )`);
                                        throw new Error(`มีการใข้อักขระต้องห้าม ตัวอักษรที่ห้ามใช้( '";<> )`);
                                    }
                    
                                    // Fetch data to check if username already exist or not
                    
                                    // if !usable username -> prevnet submitting
                                    
                    
                                    fetchObjects([{"name":"change_password_handle","arg":{"username":username_input_value,"pass":password_input_value,"auth_rank":selected_auth_rank,"empId":empId}}]).then(function(data){
                    
                                        if(data.change_password_handle.status){
                    
                                            alert('เปลี่ยนรหัสผ่านสำเร็จ');
                                            location.reload();
                                            return;
                                            
                                        }else {
                                            let error_code = data.change_password_handle.error ?? 'Error';
                                            console.log(error_code);
                    
                                            if(error_code == 100){
                                                alert('ผู้ใช้งานนี้มีการสมัครสมาชิกแล้ว กรุณาลองใหม่รีเฟรช');
                                            }else if(error_code == 200) {
                                                alert('ชื่อผู้ใช้ซ้ำกับผู้อื่นในระบบ กรุณาใช้ชื่อผู้ใช้อื่น');
                                                username_input.val("");
                                                username_input.focus();
                                            }else {
                                                alert('เกิดข้อผิดพลาด กรุณารีเฟรช');
                                            }
                    
                                            
                                            return false;
                                        }
                    
                    
                                    })
                                    .catch((error)=> {
                                        throw new Error(error);
                                    });
                    
                    
                    
                    
                    
                                }catch (error){
                                    console.log(error);
                                    return false;
                    
                                }


                            });

                            operationInputField.append(registration_form_cont);


                        }else {
                            throw new Error('Query Error');
                        }

                    })
                    .catch((error) => {
                        console.log(error);
                        alert('เกิดข้อผิดพลาด กรุณารีเฟรช');
                        return false;
                    });

                }else if(registered_selected_option == "") {
                    // Forget password -> Require username
                    // Not nescessary for now
                }else {
                    return false;
                }




            }



            mid_section_div.removeClass('hide');
            return;

        }


        // fetch data to check if this id is has any accout registered

        fetchObjects([{ "name": "fetch_user_account_check", "arg": { "empId": empId } }, {"name":"fetch_auth_type_option","arg":""}]).then(function (data) {

            if (data.fetch_user_account_check.status && data.fetch_auth_type_option.status) {

                let user_account_registered = data.fetch_user_account_check.registered; // T/F
                let user_emp_rank = data.fetch_user_account_check.emp_rank == false ? null: data.fetch_user_account_check.emp_rank
                let valid_auth_type_option = object_to_options(data.fetch_auth_type_option.auth,user_emp_rank,"arr");

                generate_mid_section_content(user_account_registered,valid_auth_type_option);

            } else {
                throw new Error('Query Error');
            }


        })
            .catch((error) => {
                console.log(error);
                alert('เกิดข้อผิดพลาด กรุณารีเฟรช');
                return false;
            });
    }

    function filterObjectsArray(objectsArray, searchString, objType) {
        searchString = searchString.replace(/\s/g, '').toLowerCase(); // Remove spaces and normalize to lowercase
        const filteredArray = objectsArray.filter(obj => {
            // Convert specified properties to lowercase and remove spaces
            const idLowerCase = String(obj.emp_id).replace(/\s/g, '').toLowerCase();
            const nameLowerCase = obj.emp_name.replace(/\s/g, '').toLowerCase();
            const surnameLowerCase = obj.emp_surname == null ? '' : obj.emp_surname.replace(/\s/g, '').toLowerCase();
            const telLowerCase = obj.spec ? obj.spec.replace(/\s/g, '').toLowerCase() : '';
            // Check if the search string is found in any of the specified properties
            return (
                idLowerCase.includes(searchString) ||
                nameLowerCase.includes(searchString) ||
                surnameLowerCase.includes(searchString) ||
                telLowerCase.includes(searchString)
            );
        });

        return filteredArray;
    }

    function displayTopTable(objectsArrays) {

        top_table.html("");
        // objectType -> mc/part
        top_table.append(
            `<table class="object-table" id="emp-filter-table">
<thead>

</thead>
<tbody>
</tbody>
</table>
`);

        const tableHead = top_table.find("thead");
        const tableBody = top_table.find("tbody");

        if (objectsArrays.length > 0) {

            let filtered_array = objectsArrays;
            if (object_filter_bar.val().replace(/\s/g, '') != '') {
                // if fiter text exists -> filter before further processing
                filtered_array = filterObjectsArray(objectsArrays, object_filter_bar.val());
            }


            tableHead.append(`
<tr>
<th>#พนักงาน</th>
<th>ชื่อ</th>
<th>นามสกุล</th>
<th>แผนก</th>
<th>โทรศัพท์</th>
</tr>
`);

            if (filtered_array.length > 0) {
                filtered_array.forEach(empItm => {

                    let newrow = $('<tr>').addClass('obj-row').append(`
                    <td>${empItm.emp_id}</td>
                    <td>${empItm.emp_name}</td>
                    <td>${empItm.emp_surname}</td>
                    <td>${empItm.emp_department_name}</td>
                    <td>${empItm.emp_tel}</td>
                    `)

                    if (empItm.indepartment == 1) {
                        generate_tooltip(newrow, `คลิกเพื่อแก้ไขบัญชีพนักงาน <span style="color:#00c95b;font-weight:bold;">${empItm.emp_name}</span>`);

                        newrow.on('click', () => {
                            displayEmployeeHandling(empItm.emp_id);

                        });


                    } else {
                        // Not in department
                        newrow.addClass('disabled-row');
                        generate_tooltip(newrow, `<span style="color:#ff4e47;font-weight:bold;">ไม่สามารถแก้ไขพนักงานต่างแผนก</span>`);
                    }

                    tableBody.append(newrow);

                });
            } else {
                tableBody.append(`
    <tr class="empty-object-row">
        <td colspan="5"><b><u>-- ไม่มีรายการที่ค้นหา--</u></b></td></tr>
    `);
            }


        } else {
            // mode not valid -> not expecting anything here
        }



    }
    function fetchObjects(funcArr = null) {
        // Name As string
        // Arg as array {}
        if (funcArr == null) { return false };
        return new Promise(function (resolve, reject) {
            $.ajax({
                type: 'POST',
                url: 'fetch_user_config.php',
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



    function initial_element() {

        // Display top table

        fetchObjects([{ "name": "fetch_department_user", "arg": "" }]).then(function (data) {

            if (data.fetch_department_user.status) {

                let fetched_employee_data = data.fetch_department_user.emp_table;
               

                
                displayTopTable(fetched_employee_data);

                object_filter_bar.on("input", () => {
                    displayTopTable(fetched_employee_data);
                });



            } else {
                throw new Error('Query Error');
            }




        })
            .catch((error) => {
                console.log(error);
                alert('เกิดข้อผิดพลาด กรุณารีเฟรช');
                return false;
            });




    }


    // Define const



    const page = $('#pg-cont');
    const popupElement = $('#edit-popUpForm');
    const overlayElement = $('#dark-overlay');
    const popupContent = $('#form-context');
    const close_btn = $('#closepopUp');
    const object_filter_bar = $("#filter-text-input");
    const mid_section_div = $("#mid-section-div");
    const top_table = $('#top-filter-table-cont');
    const operationInputField = $('#operation-input-field-cont');
    const operationInputFieldLabel = $('#operation-header-label');


    initial_element();


});