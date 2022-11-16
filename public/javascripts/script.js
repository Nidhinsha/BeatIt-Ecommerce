
$("#signup-form").submit((e) => {
    e.preventDefault();
    console.log('hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh');
    // function signUpValidate() {
    // const userName=document.getElementById('username')
    const number = document.getElementById('number')
    const email = document.getElementById('email')
    const password = document.getElementById('password')
    const repassword = document.getElementById('repassword')
    const error = document.getElementsByClassName('invalid-feedback')


    if (number.value.trim() === "" || number.value.length < 9) {
        error[0].style.display = "block";
        error[0].innerHTML = "Enter valid phone number";
        number.style.border = "2px solid red";
        return false;
    } else {
        error[0].innerHTML = ""
        number.style.border = "2px solid green";
    }

    if (!(email.value.trim().match(/^[a-zA-Z0-9.!#$%&'+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)$/))) {
        error[1].style.display = "block";
        error[1].innerHTML = "Enter correct email";
        email.style.border = "2px solid red";
        return false;
    } else {
        error[1].innerHTML = ""
        email.style.border = "2px solid green";
    }

    if (password.value.trim() === "" || password.value.length < 6) {
        error[2].style.display = "block";
        error[2].innerHTML = "password must be 6 character";
        password.style.border = "2px solid red";
        return false;
    } else {
        error[2].innerHTML = ""
        password.style.border = "2px solid green";
    }



    if (repassword.value === password.value) {
        error[3].innerHTML = ""
        repassword.style.border = "2px solid green";
    } else {
        error[3].style.display = "block";
        error[3].innerHTML = "Incorrect Password";
        repassword.style.border = "2px solid red";
        return false;
    }
    $.ajax({
        url: '/user_registration',
        type: 'post',
        data: $('#signup-form').serialize(),
        success: (response) => {
            if (response.status) {
                // if (isConfirm) {
                // location.reload()
                $('#signUpModal').modal('hide');
                $('#signInModal').modal('show');

                // }
            } else {
                // if (isConfirm) {
                error[1].style.display = "block";
                error[1].innerHTML = "Email Already taken";
                email.style.border = "2px solid red";
                // }
            }
        }
    })
})
// return true;
// }


//xxxxxxxxxxxxxxxxxxxxx MODAL LOGIN USER XXXXXXXXXXXXXXXXXXXXXXXX
//MODAL LOGIN
$("#login-form").submit((e) => {
    e.preventDefault();
    const email = document.getElementById('email');
    const pass = document.getElementById('password');
    const error = document.getElementsByClassName('invalid-feedback');

    if (!(email.value.trim().match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/))) {
        error[0].style.display = "block";
        error[0].innerHTML = "Enter email";
        email.style.border = "2px solid red";
        return false;
    } else {
        error[0].innerHTML = ""
        email.style.border = "2px solid none";
    }

    if (pass.value.trim() === "") {
        error[1].style.display = "block";
        error[1].innerHTML = "Enter password";
        pass.style.border = "2px solid red";
        return false;
    } else {
        error[1].innerHTML = ""
        pass.style.border = "2px solid none";
    }
    console.log('Its not workinggggggggggggggg.............');
    $.ajax({
        url: '/modal-login',
        type: 'post',
        data: $('#login-form').serialize(),
        success: (response) => {
            console.log(response);
            if (response.status) {
                location.reload()
            } else {
                error[0].style.display = "block";
                error[0].innerHTML = "No user found! Enter valid email & password";
                email.style.border = "2px solid red";
            }
        }
    })
})

//xxxxxxxxxxxxxxxxxxx MODAL FOR OTP CHECK PHONE NUMBER XXXXXXXXXXXXXXXXXX
$("#numberVerify").submit((e) => {
    e.preventDefault()
    // const phoneNumber = document.getElementById('verifyNumber')
    $.ajax({
        url: '/verifyNumber',
        method: 'post',
        data: $('#numberVerify').serialize(),
        success: (response) => {
            if (response.msg) {
                $('#errNumber').css('border-color', 'red')
                $('#errNum').text(response.msg)
            } else {
                $('#otpVerifyModal').modal('show');
                $('#otpNumberModal').modal('hide');
                $('#mobNo').text(response.mobile)
                $('#phnNumber').val(response.mobile)


            }
        }
    })
})
//xxxxxxxxxxxxxxxx VERIFY THE OTP SO IT GO INSIDE THE EWBSITE XXXXXXXXXXXXXXXXX
$('#verifyCode').submit((e) => {
    e.preventDefault()

    $.ajax({
        url: '/loginOtp',
        method: 'post',
        data: $('#verifyCode').serialize(),
        success: ((response) => {
            if (response.status) {
                location.href = '/'
            } else {
                console.log('EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE');
                // location.href('/')
                $('#errOTP').css('border-color', 'red')
                $('#otpERROR').text(response.errMsg)
            }

        })
    })
})


//otp verification 

function otpValidate() {
    const code = document.getElementById('code');
    const error = document.getElementsByClassName('invalid-feedback');

    if (code.value.trim() === "" || code.value.length < 6) {
        error.style.display = "block";
        error.innerHTML = "Enter code";
        pass.style.border = "2px solid red";
        return false;
    } else {
        error.innerHTML = " "
        pass.style.border = "2px solid none";
    }

    return true;
}

//productzoom

// zoom in product details

$(document).ready(function () {
    $(".block__pic").imagezoomsl({
        zoomrange: [2, 2]
    });
});


//cahnge image
function changeImage(id) {
    var img = document.getElementById("image");
    var src = document.getElementById(id).src;
    img.src = src
    return false;
}




//j query add t cart count and refresh anandhu


function addToCart(proId) {
    $.ajax({
        url: '/add-to-cart/' + proId,
        method: 'get',
        success: (response) => {
            if (response.status) {
                let count = $('#cart-count').html()
                count = parseInt(count) + 1
                $('#cart-count').html(count)
                //item is added to item 
                document.getElementById('success').classList.remove('d-none')
                setTimeout(function () {
                    document.getElementById('success').classList.add('d-none')
                }, 1000)
            } else {
                $('#signInModal').modal('show');
            }
        }
    })
}

// function addToCart(proId) {
//     $.ajax({
//         url:'/add-to-cart/'+proId,
//         method:'get',
//         success:(response)=>{
//             if (response.status) {
//                 let count = $('#cart-count').html()
//                 count = parseInt(count)+1
//                 $("#cart-count").html(count)
//             }

//         }
//     })
// }
//  change quantity anandhu
// function changeQuantity(cartId, proId, userId, count) {
//     let quantity = parseInt(document.getElementById(proId).value)
//     count = parseInt(count)
//     $.ajax({
//         url: '/change-product-quantity',
//         data: {
//             user: userId,
//             cart: cartId,
//             product: proId,
//             count: count,
//             quantity: quantity
//         },
//         method: 'post',
//         success: (response) => {
//             if (response.removeProduct) {
//                 alert("Product Removed from cart")
//                 location.reload()
//             } else {
//                 document.getElementById(proId).value = quantity + count;
//                 document.getElementById('total').innerHTML = response.total
//             }
//         }
//     })
// }


function changeQuantity(cartId, proId, userId, stock, count) {

    let quantity = parseInt(document.getElementById(proId).innerHTML)

    console.log(stock, quantity, 'stock and quantity');
    count = parseInt(count)
    quantityCheck = quantity + count
    stock = parseInt(stock)
    console.log(userId);
    if (quantityCheck <= stock && quantityCheck != 0) {

        document.getElementById("minus" + proId).classList.remove("invisible")
        document.getElementById("plus" + proId).classList.remove("invisible")
        $.ajax({
            url: '/change-product-quantity',
            data: {
                user: userId,
                cart: cartId,
                product: proId,
                count: count,
                quantity: quantity
            },
            method: 'post',
            success: (response) => {
                console.log(response, count, quantity);

                if (response.removeProduct) {

                    location.reload()
                } else {
                    console.log(response);
                    document.getElementById(proId).innerHTML = quantity + count
                    // document.getElementById('total').innerHTML = response.total[0].total
                    document.getElementById('total').innerHTML = response.total
                }

            }
        })
    }
    if (quantityCheck == 1) {
        document.getElementById("minus" + proId).classList.add("invisible")
    }
    if (quantityCheck == stock) {
        document.getElementById("plus" + proId).classList.add("invisible")
    }
    // else {

    //     swal("Out of Stock", "Please Wait until stock arrive:)", "error");

    // }

}
//xxxxxxxxxxxxxxxxxxxxxxxxxxxxx REMOVE ITEM FROM CART XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
function deleteProCart(proId) {
    swal({
        title: "Are you sure?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "red",
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        closeOnConfirm: false,
        closeOnCancel: true
    },
        function (isConfirm) {
            if (isConfirm) {
                $.ajax({
                    url: '/delete-cart-product/' + proId,
                    method: 'get',
                    success: (response) => {
                        if (response) {
                            location.reload()
                        }
                    }
                })
            }

        }
    );
}

//============================ CHANGE ORDER STATUS IN USER SIDE  ============================================

function changeOrderStatus(orderId, proId, status) {
    swal({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Cancel it!',
        closeOnConfirm: true,
        closeOnConfirm: true
    },
        function (isConfirm) {
            if (isConfirm) {
                $.ajax({
                    url: "/cancelOrder",
                    method: "put",
                    data: {
                        orderId,
                        proId,
                        status
                    },
                    success: (response) => {
                        if (response.status) {
                            document.getElementById(orderId + proId).innerHTML = status
                            document.getElementById(proId + orderId).style.display = 'none'
                        }

                    }
                })
            }

        }
    )
}
//=========================== CHANGE ORDER STATUS IN TO RETURN IN USER SIDE ==================================
function returnOrder(orderId, proId, status) {
    swal({
        title: "Return Form!",
        text: "The reason for returning:",
        type: "input",
        showCancelButton: true,
        closeOnConfirm: false,
        animation: "slide-from-top",
        inputPlaceholder: "Write something",
        showCancelButton: true,
        closeOnConfirm: false,

    },
        function (inputValue) {
            if (inputValue === null) return false;

            if (inputValue === "") {
                swal.showInputError("You need to write something!");
                return false
            }
            if (inputValue) {
                $.ajax({
                    url: "/returnOrder",
                    method: "put",
                    data: {
                        orderId,
                        proId,
                        status
                    },
                    success: (response) => {
                        if (response.status) {
                            swal("Thank you! ", "You reason: " + inputValue, "success");
                            document.getElementById(orderId + proId).innerHTML = status
                            document.getElementById(proId + orderId).style.display = 'none'

                        }

                    }
                })
            }


        }
    )
}
//============================================================= PLACE ORDER ======================================
$("#checkout-form").submit((e) => {
    console.log($('#checkout-form').serialize(), 'pppppppppppppppppppppppp');
    e.preventDefault()
    console.log('checkout-form ajax');
    $.ajax({
        url: '/address',
        type: 'post',
        data: $('#checkout-form').serialize(),
        success: (response) => {
            console.log('005');
            // alert(response)
            console.log(response);
            if (response) {
                location.href = '/place-order'
            }
        }
    })
})

//=========================================================================== ADDRESS ==============================================

$("#address-form").submit((e) => {
    e.preventDefault()
    console.log('address-form ajax');
    $.ajax({
        url: '/address',
        type: 'post',
        data: $('#address-form').serialize(),
        success: (response) => {
            console.log('005');
            // alert(response)
            console.log(response);
            if (response) {

                location.href = '/addressBook'
            }
        }
    })
})

//=========================================================== EDIT ADDRESS =======================================================

function editAddress(addressId) {
    console.log(addressId, 'address id is in edit add fun');
    console.log('address edit has been started');
    $.ajax({
        url: '/edit-address/' + addressId,
        method: 'get',
        success: (response) => {
            $('#editAddressModal').modal('show');
            $("input[name='editfirstname']").val(response[0].address.firstname);
            $("input[name='editlastname']").val(response[0].address.lastname);
            $("input[name='editaddress']").val(response[0].address.address);
            $("input[name='editlandmark']").val(response[0].address.landmark);
            $("input[name='editaltnumber']").val(response[0].address.altnumber);
            $("input[name='editstreetName']").val(response[0].address.streetName);
            $("input[name='editcountry']").val(response[0].address.country);
            $("input[name='editstate']").val(response[0].address.state);
            $('#editcity').val(response[0].address.city);
            $("input[name='editpincode']").val(response[0].address.pincode);
            $("input[name='addressId']").val(addressId);
        }
    })
}

$('#address-edit-form').submit((e) => {
    e.preventDefault();
    console.log('address-edit-form working');
    console.log($('#address-edit-form').serialize());
    $.ajax({
        url: '/edit-address',
        type: 'post',
        data: $('#address-edit-form').serialize(),
        success: (response) => {
            if (response) {
                location.href = '/addressBook'
            }
        }
    })
})


//================================================================ DELETE THE ADDRESS =============================================

function deleteAddress(addressId) {

    $.ajax({
        url: '/delete-address',
        type: 'delete',
        data: {
            addressId
        },
        success: (response) => {
            location.href = '/addressBook'
        }
    })
}
// =============================================================== submit the address =============================================

$('#address-submit').submit((e) => {
    e.preventDefault()
    console.log('address-submit ajax');
    $.ajax({
        url: '/place-order',
        type: 'post',
        data: $('#address-submit').serialize(),
        success: (response) => {
            //alert('order')
            if (response.codSuccess) {
                swal({
                    title: "Order Placed ",
                    type: 'success',
                    text: "congratulations!! ",
                    icon: "success",
                    confirmButtonColor: "#318a2c",
                    confirmButtonText: "Click here to See the Orders!",
                    closeOnConfirm: false
                },
                    function (isConfirm) {
                        if (isConfirm) {
                            location.href = '/orders'          // submitting the form when user press yes
                        }

                    });
            } else if (response.paypal) {
                location.href = response.url
            }
            else if (response.razorpay) {
                console.log(response);
                razorpayPayment(response.response)
            }
        }
    })
})



//===================================== razor pay function ===================================

function razorpayPayment(order) {
    console.log(order.id, 'order id');
    console.log(order, 'order in razor payhhhhhhhhhhhhhhhhhhhhhhhh');
    var options = {
        "key": "rzp_test_ONsvngWELtCTTW", // Enter the Key ID generated from the Dashboard
        "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "Beat it",
        "description": "Test Transaction",
        "image": src = "/images/beatit2.jpg",
        "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response) {
            console.log('handler working');


            verifyPayment(response, order)
        },
        "prefill": {
            "name": "Ishaq",
            "email": "ishaq@gmail.com",
            "contact": "9746709101"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();
    // var rzp1 = new Razorpay(options);
    // console.log('razor pay button');
    // rzp1.open();

}

// =============================================================== VERIFY PAYMENT OF RAZOR PAY =======================================

function verifyPayment(payment, order) {
    console.log(payment, order, 'payment and order');
    $.ajax({
        url: '/verify-payment',
        data: {
            payment,
            order
        },
        method: 'post',

        success: (response) => {
            if (response.status) {
                swal("Thank you! ", "Your Order is Placed ", "success");
                location.href = '/orders'
            } else {
                swal("Error! ", "Something went wrong", "error");
            }
        }
    })
}


// view image

// function viewImage(event) {
//     console.log(event);
//     var fileInput =
//         document.getElementById('imgInput');

//     var filePath = fileInput.value;

//     console.log(filePath);

//     // Allowing file type
//     var allowedExtensions =
//         /(\.jpg|\.jpeg|\.png|\.gif|\.jfif|\.webp)$/i;

//     if (!allowedExtensions.exec(filePath)) {
//         alert('Invalid file type');
//         fileInput.value = '';
//         return false;
//     }
//     else {


//         document.getElementById('imgView').classList.remove("d-none")
//         document.getElementById('imgView1').src = URL.createObjectURL(event.target.files[0])
//         document.getElementById('imgView2').src = URL.createObjectURL(event.target.files[1])
//         document.getElementById('imgView3').src = URL.createObjectURL(event.target.files[2])
//         document.getElementById('imgView4').src = URL.createObjectURL(event.target.files[3])
//     }

// }

//Remove Product from the cart

function cancelOrder(orderId, proId) {
    swal({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Cancel it!',
        closeOnConfirm: true,
        closeOnConfirm: true
    },
        function (isConfirm) {
            if (isConfirm) {
                $.ajax({
                    url: "/cancel-order/" + orderId,
                    method: "get",
                    success: (response) => {
                        if (response.status) {
                            document.getElementById(orderId + proId).innerHTML = "canceled"
                            document.getElementById("status-button").style.display = 'none'
                        }

                    }
                })
            }

        }

    )
}


//the order status 

function statusChange(proId, orderId) {
    console.log(proId, orderId, 'is there any problem');
    var status = document.getElementById(proId + orderId).value;
    console.log(status, 'status is coming');
    swal({
        title: 'Are you sure?',
        text: "Do you want to  " + status + " the Order!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Do it!',
        cancelButtonText: 'cancel',
        closeOnConfirm: true,
        closeOnCancel: true
    },
        function (isConfirm) {
            if (isConfirm) {
                $.ajax({
                    url: '/admin/admin_panel/orderStatus',
                    data: {
                        proId,
                        orderId,
                        status
                    },
                    method: 'post',
                    success: (response) => {
                        if (response.status) {
                            document.getElementById(orderId + proId).innerHTML = status
                            if (status == "pending" || status == "placed" || status == "shipped" || status == "delivered" || status == "canceled") {
                                location.reload()
                            }
                        }
                    }
                })
            } else {
                location.reload()
            }
        }
    )
}

//this function is used to add an item to wishlist whwn the user click on the wishlist buttom

function addToWishlist(proId) {
    console.log(proId);
    $.ajax({
        url: '/add-to-wishlist/' + proId,
        method: 'get',
        success: (response) => {
            if (response.status) {
                document.getElementById('success-wishlist').classList.remove('d-none')

                setTimeout(function () {
                    document.getElementById('success-wishlist').classList.add('d-none')
                }, 1000)

                // location.href='/wishlist'
                // document.getElementById('add' + proId).classList.add("d-none")
                // document.getElementById('remove' + proId).classList.remove("d-none")
            } else {
                // document.getElementById('remove' + proId).classList.add("d-none")
                // document.getElementById('add' + proId).classList.remove("d-none")
                $('#signInModal').modal('show');
            }
        }
    })
}

//SET THE CATEGORY

$("#category-form").submit((e) => {
    e.preventDefault()
    // var formData = new FormData(this);
    console.log("kjhgfd");
    $.ajax({
        url: '/admin/admin_panel/category-management',
        method: 'post',
        data: $('#category-form').serialize(),
        // data: formData,
        success: (response) => {
            console.log(response);
            if (response.status) {
                // document.getElementById('category-message').classList.remove("d-none");
                // document.getElementById('category-message').innerHTML = msg;
                // setTimeout(() => {
                //     document.getElementById('category-message').classList.add("d-none");
                // }, 2000)


                swal("Category Added!", "success");
                location.reload()
            }
        }
    })
})

// TO EDIT THE CATEGORY

function editCategory(categoryId, categoryName) {
    console.log('category is comijg', categoryId);
    let category = document.getElementById(categoryId).innerHTML


    console.log(category, 'category id is coming');
    swal({
        title: "CATEGORY!",
        text: "Edit the Category:",
        type: "input",
        showCancelButton: true,
        closeOnConfirm: false,
        inputValue: category,
        animation: "slide-from-top"
    },
        function (inputValue) {
            if (inputValue === false) return false;

            if (inputValue === "") {
                swal.showInputError("You need to write something!");
                return false
            }
            // we are adding the ajax

            $.ajax({
                url: '/admin/admin_panel/category-management',
                method: 'put',
                data: {
                    categoryId,
                    inputValue,
                    categoryName
                },
                success: (response) => {
                    if (response.status) {
                        document.getElementById(categoryId).innerHTML = inputValue.toUpperCase()
                        swal("Nice!", "You wrote: " + inputValue, "success");
                    } else {
                        return false
                    }
                }

            })



        });
}

//======================================= SALES REPORT ===========================================================


function salesReport(days, buttonId) {
    console.log('hi salesreport');
    $.ajax({

        url: '/admin/admin_panel/sales-report/' + days,
        method: 'get',
        success: (response) => {
            console.log(response, 'holoram, response');
            if (response) {
                const buttons = document.querySelectorAll('button');
                buttons.forEach(button => {
                    button.classList.remove('active');
                });
                document.getElementById(buttonId).classList.add("active");
                document.getElementById('days').innerHTML = buttonId
                document.getElementById('deliveredOrders').innerHTML = response.deliveredOrders
                document.getElementById('shippedOrders').innerHTML = response.shippedOrders
                document.getElementById('placedOrders').innerHTML = response.placedOrders
                document.getElementById('pendingOrders').innerHTML = response.pendingOrders
                document.getElementById('canceledOrders').innerHTML = response.canceledOrders
                document.getElementById('returnedOrders').innerHTML = response.returnedOrders
                document.getElementById('codTotal').innerHTML = response.codTotal ? response.codTotal : 0
                document.getElementById('onlineTotal').innerHTML = response.onlineTotal ? response.onlineTotal : 0
                document.getElementById('totalAmount').innerHTML = response.totalAmount ? response.totalAmount : 0
                document.getElementById('refundAmount').innerHTML = response.refundAmount ? response.refundAmount : 0
                document.getElementById('users').innerHTML = response.users
            }
        }
    })
}

//=========================================== HOLOGRAM ==================================================================


window.addEventListener('load', () => {
    histogram(1, 'daily')
})


function histogram(days, buttonId) {

    $.ajax({
        url: '/admin/admin_panel/dashboard/' + days,
        method: 'get',
        success: (response) => {
            if (response) {
                const buttons = document.querySelectorAll('button');
                buttons.forEach(button => {
                    button.classList.remove('active');
                });
                document.getElementById(buttonId).classList.add("active");

                let totalOrder = response.deliveredOrders + response.shippedOrders + response.placedOrders

                document.getElementById('totalOrders').innerHTML = totalOrder
                console.log(totalOrder, 'ttttttttttdtdtdtdttdt');
                document.getElementById('totalAmount').innerHTML = response.totalAmount

                var xValues = ["Delivered", "Shipped", "Placed", "Pending", "Canceled", "Returned"];
                var yValues = [response.deliveredOrders, response.shippedOrders, response.placedOrders, response.pendingOrders, response.canceledOrders, response.returnedOrders];


                //bar chart for order report new change
                new Chart(document.getElementById("bar-chart"), {
                    type: 'bar',
                    data: {
                        labels: xValues,
                        datasets: [
                            {
                                label: "Population (millions)",
                                backgroundColor: ["#3cba9f", "#8e5ea2", "#3e95cd", "#e8c3b9", "red", "brown"],
                                data: yValues
                            }
                        ]
                    },
                    options: {
                        legend: { display: false },
                        title: {
                            display: true,
                            text: 'Beat It Order Report'
                        }
                    }
                });


                var xValues = ["COD", "Razorpay", "Paypal",];
                var yValues = [response.codTotal, response.razorPayTotal, response.paypalTotal];

                var barColors = [
                    "#b91d47",
                    "#00aba9",
                    "#2b5797",


                ];

                new Chart(document.getElementById("polar-chart"), {
                    type: 'polarArea',
                    data: {
                        labels: xValues,
                        datasets: [
                            {
                                label: "Population (millions)",
                                backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f", "#e8c3b9", "#c45850"],
                                data: yValues
                            }
                        ]
                    },
                    options: {
                        title: {
                            display: true,
                            text: 'Beat It Payment Report'
                        }
                    }
                });






            }
        }
    })
}

//================================ DATA EXPORT ==============================================

// pdf export
$(document).ready(function ($) {

    $(document).on('click', '.btn_print', function (event) {
        event.preventDefault();



        var element = document.getElementById('container_content');


        var opt =
        {
            margin: 1,
            filename: 'pageContent_' + '7834745897453984598459845398' + '.pdf',
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        // New Promise-based usage:
        html2pdf().set(opt).from(element).save();


    });



});

// pdf export

// excel export

function export_data() {
    let data = document.getElementById('container_content');
    var fp = XLSX.utils.table_to_book(data, { sheet: 'vishal' });
    XLSX.write(fp, {
        bookType: 'xlsx',
        type: 'base64'
    });
    XLSX.writeFile(fp, 'test.xlsx');
}

// excel export

//DATE RANGE PICKER
$(function () {
    $('input[name="daterange"]').daterangepicker({
        opens: 'left'
    }, function (start, end, label) {
        console.log("A new date selection was made: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
    });
});

// //============== DELETE PRODUDCT OFFER ===============

function deleteProductOffer(proId) {
    swal({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Cancel it!',
        closeOnConfirm: true,
        closeOnConfirm: true
    },
        function (isConfirm) {
            if (isConfirm) {
                $.ajax({
                    url: '/admin/admin_panel/delete-product-offer',
                    type: 'post',
                    data: {
                        proId
                    },
                    success: (response) => {

                        location.reload()
                    }
                })
            }

        }
    )
}

// ==================== DELETE CATEGORY OFFER ==============
function deleteCategoryOffer(category) {
    $.ajax({
        url: '/admin/admin_panel/delete-category-offer',
        type: 'post',
        data: {
            category
        },
        success: (response) => {
            location.reload()
        }
    })
}

//======================  ADD COUPON ==========================
$('#add-coupon-form').submit((e) => {
    e.preventDefault()
    $.ajax({
        url: '/admin/admin_panel/coupon',
        type: 'post',
        data: $('#add-coupon-form').serialize(),
        success: (response) => {
            if (response.status) {
                location.href = '/admin/admin_panel/coupon'
            }
            else {
                swal("Already In", "Please Add Some Other Coupon:)", "error");

                // swal({
                //     title:'Coupon Already Added',
                //     icon: 'warning',
                //     // text:false,
                //     timer:1000,
                //     showConfirmButton:false,

                // })
            }

        }
    })
})

///xxxxxxxxxxxxxxxxxxxxxxxxxx DELETE COUPON XXXXXXXXXXXXXXXXXXXXXX

function deleteCoupon(couponId) {
    $.ajax({
        url: '/admin/admin_panel/coupon',
        type: 'delete',
        data: {
            couponId
        },
        success: () => {
            $('#' + couponId).remove()
        }
    })
}

//xxxxxxxxxxxxxxxxxxxxxxxxxx  REDEEM COUPON XXXXXXXXXXXXXXXXXXXXXXXX
$("#redeem-coupon").submit((e) => {
    e.preventDefault()
    console.log($("#redeem-coupon").serialize(), ':::::::::::::::::::::::::::::::');
    $.ajax({
        url: '/redeem-coupon',
        type: 'post',
        data: $("#redeem-coupon").serialize(),
        success: (response) => {
            if (!response.msg) {
                $('#coupon-condition').text("")
                $('#finalPrice').text(response.total)
                $('#disPrice').text(response.disPrice)
                $('#totalAmount').val(response.total)
                $('#isCoupon').val(response.coupon)
                console.log(response.totalPrice, 'toal price n reddeeem');
                console.log(response.total, 'toatl is this');
                console.log(response.coupon, '|||||||||||||||||||||||||||||||');
            } else {
                $('#coupon-condition').text(response.msg)
                console.log(response.msg, 'man this is rang..');
                $('#totalAmount').val(response.total)
                $('#finalPrice').text(response.total)
            }
        }


    })
})

//xxxxxxxxxxxxxx PICK ADDRESS AND DISPLAY IN THE FORM XXXXXXXXXXXXXXXXXXXXXXX

function pickAddress(addressId) {
    console.log(addressId, '333333333333333333');
    $.ajax({
        url: '/pick-address/' + addressId,
        method: 'get',
        success: (response) => {
            console.log(response);
            // if(response.status)
            console.log('iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii999999999999999999999');
            $("#firstNameField").val(response[0].address.firstname);
            $("#lastNameField").val(response[0].address.lastname);
            $("#addressField").val(response[0].address.address);
            $("#landmarkField").val(response[0].address.landmark);
            $("#streetNameField").val(response[0].address.streetName);
            $("#altnumberField").val(response[0].address.altnumber);
            $('#countryField').val(response[0].address.country);
            $("#stateField").val(response[0].address.state);
            $("#cityField").val(response[0].address.city);
            $("#pincodeField").val(response[0].address.pincode);
            $("").val(addressId);
            //     }else{
            //         console.log('88888888888888888888888888888888888888888888');
            //     }
        }
    })
}


//xxxxxxxxxxxxxxxxxxxxxx DELETE BANNER XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

function deleteBanner(bannerId) {
    $.ajax({
        url: '/admin/admin_panel/banner',
        type: 'delete',
        data: {
            bannerId
        },
        success: (response) => {
            location.reload()
        }
    })
}