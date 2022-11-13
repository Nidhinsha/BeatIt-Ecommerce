
var express = require('express');
var router = express.Router();
const userHelpers = require("../helpers/user-helpers")
// const otp_verification = require('../otp_section')
require('dotenv').config()
const client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN)
var paypal = require('paypal-rest-sdk');


/* GET users listing. */

//=============== PAY PAL =======================
paypal.configure({
  'mode': 'sandbox', //sandbox or live 
  // 'client_id': 'Ae5plDPCGMYHu8rfL6BVwptUpxF6Ni7NDWCv7Punt-0bb5f7yh2QRbfwHyJeT0psv0mZuOysWtbYscva',
  // 'client_secret': 'EEtlGhK89BGM9d0nSgR_DOfvegeHWz_U5YqFeK1WuNWXUR70UuywFXAkqtH27iBtqMMSfFYdChu61pqI'
  'client_id':process.env.CLIENT_ID,
  'client_secret':process.env.CLIENT_SECRET
});

//delete to delete anything
router.use((req, res, next) => {
  if (req.query._method == "DELETE") {
    req.method = "DELETE";
    req.url = req.path;
  }
  next();
})
//to verify

const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect('/')
  }
}

//to logout

const verifyLogout = (req, res, next) => {
  if (req.session.loggedIn) {
    res.redirect('/')
  } else {
    next()
  }
}


// ===================================== LANDING PAGE ================================
router.get('/', async (req, res) => {
  console.log(req.session.user);
  let cartCount = null;
  let userName = req.session.user;
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
    console.log(cartCount);
  }
  let randomProducts =await userHelpers.randomProducts()
  let category = await userHelpers.getCategory();
  let banner = await userHelpers.getBanner()
  // console.log(banner,'bbbbbbbbbbbbbbbbbbbbbbb');
  // userHelpers.getProduct().then((products) => {
    res.render('user/landingPage', { randomProducts, userName, cartCount, category, user: req.session.user,banner, logout: !req.session.loggedIn})
  // })
})

//signup


router.post('/user_registration', function (req, res) {
  userHelpers.userSignup(req.body).then((response) => {
    req.session.loggedIn = true;
    req.session.user = response.user;
    res.json({ status: true })
    
  })
    .catch((response) => {
      res.json({status:false})
     
    })
})


//XXXXXXXXXXX USER MODAL LOIGN XXXXXXXXXXXXX
router.post('/modal-login', (req, res) => {
  // console.log(req.body, 'ooooooooooooooooooooooooooo');
  userHelpers.userSignin(req.body).then((response) => {
    req.session.loggedIn = true;
    req.session.user = response.user;
    res.json({ status: true })
  }).catch((response) => {
    res.json({ status: false })
  })
});

//xxxxxxxxxxxxxxxxxx USER PHONE NUMBER CHECK FOR OTP XXXXXXXXXXXXX
router.post('/verifyNumber',(req,res)=>{
  userHelpers.verifyNumber(req.body.phoneNumber).then((response)=>{
   req.session.user = response
///////////////////////////////////////////

      client.verify
      .services(process.env.SERVICE_ID)
      .verifications
      .create({
        to: `+91${response.mobile}`,
        channel: `sms`
      }).then(() => {
     
        console.log('OTP COMING');
        //to display the otp veerify page for the user
      }).catch((err) => {

        console.log(err);
      })
    //////////////////////////////
    res.json(response)
    // console.log(response,'oooooooooooooooooo');
  }).catch((response)=>{

    // console.log(response,'ffffffffffffffffffffffffff');
    res.json({msg:"Invalid Phone Number"})
  })
})

//xxxxxxxxxxxxx OTP LOGIN xxxxxxxxxxxxxxxxxxxxx
router.post('/loginOtp',(req,res)=>{

 //////////////////////////////////////////// 
      client.verify
      .services(process.env.SERVICE_ID)
      .verificationChecks
      .create({
        to: `+91${req.body.phnNumber}`,//the user number
        code: req.body.code//the otp code
      }).then((data) => {
        if(data.valid){
          req.session.loggedIn=true
          res.json({status:true})
         
        }else{
          req.session.loggedIn=true
          req.session.user = null
          
        }
        
      }).catch((err) => {
      
        console.log(err);
      })
 ////////////////////////////////////////////////

})




//post otp verification
router.get('/otp_verify', (req, res) => {
  res.render('user/otp_verify')
})

// logout of user
router.get('/logout', (req, res) => {
  req.session.loggedIn = false;
  req.session.user = null;
  res.redirect('/')
})


//user product view by using this page the uer can sees the product in it

router.get('/product-view/:id', async (req, res) => {
  let cartCount = null;
  let userName = req.session.user;
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
    console.log(cartCount);
  }
  userHelpers.getProductView(req.params.id).then((products) => {
    console.log(products, 'ppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp');

    res.render('user/product-view', { products, user: req.session.user, userName, cartCount,logout: !req.session.loggedIn })
  })
})

//========================================================== THE CART ==========================================================

//  =============================TO DISPLAY THE PRODUCT THAAT ADDED TO THE CART =============================
router.get('/cart', verifyLogin, async (req, res) => {

  let cartCount = null;
  let userName = req.session.user;
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
    console.log(cartCount);
  }
  let products = await userHelpers.getCartProducts(req.session.user._id)
  let totalValue = await userHelpers.getTotalAmount(req.session.user._id)
  console.log(products);
  // console.log(products[0].product);
  console.log('****' + req.session.user._id);
  res.render('user/cart', { products, user: req.session.user._id, totalValue, userName, cartCount,logout: !req.session.loggedIn })
})

//  =============================TO DELETE THE PRODUCT THAT ADDED TO THE CART =============================

router.get('/delete-cart-product/:id', verifyLogin, (req, res) => {
  userHelpers.deleteProductFromCart(req.params.id, req.session.user._id).then((response) => {
    res.json(response)
  })
})

//  =============================TO ADD THE PRODUCT  TO THE CART =============================
router.get('/add-to-cart/:id', (req, res) => {
  if (req.session.loggedIn) {
    console.log("api calls");
    userHelpers.addToCart(req.params.id, req.session.user._id).then((count) => {
      res.json({ status: true })
    })
  } else {
    res.json({ status: false })
  }
})
//  =============================CHANGE THE QUANTITY OF THE CART ITEMS =============================

router.post('/change-product-quantity', (req, res) => {
  console.log(req.body);
  userHelpers.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelpers.getTotalAmount(req.body.user)
    res.json(response)
  })
})

//  =============================PALCE ORDER TO BUY THE PRODUCT =============================

router.get('/place-order', verifyLogin, async (req, res) => {
  let cartCount = null;
  let userName = req.session.user

  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
    console.log(cartCount);
  }
  let userDetails = await userHelpers.getUserDetails(req.session.user._id)
  let addressData = await userHelpers.getAddressList(req.session.user._id)
  let total = await userHelpers.getTotalAmount(req.session.user._id)
  let wallet = await userHelpers.getWallet(req.session.user._id)
  res.render('user/place-order', { total, user: req.session.user, cartCount, userName, userDetails, addressData, wallet,logout: !req.session.loggedIn });
})

// ========================== POST OF PLACE ORDER ===================================

router.post('/place-order', verifyLogin, async (req, res) => {

  let products = await userHelpers.getCartProductList(req.session.user._id)

  let coupon = req.body.nameCoupon
  let totalPrice = Number(req.body.total)
  //  totalPrice = parseInt(req.body.total)
  let walletAmount = Number(req.body.wallet)
  // console.log(walletAmount, '44444444444444444444444444');
  // console.log(totalPrice, '33333333333333333333333333333333333');
  // console.log(req.body,'yyyyyyyyyyyyyyyyyyyyyyyyyyyyyy');
  if (walletAmount) {
    if (totalPrice >= walletAmount) {
      totalPrice = totalPrice - walletAmount
      console.log(totalPrice, '11111111111111111111111111111111');
      userHelpers.decreaseWallet(req.session.user._id,walletAmount)
    } else {
      userHelpers.decreaseWallet(req.session.user._id,totalPrice)
      totalPrice = walletAmount - totalPrice
    }

  } else {
    totalPrice = totalPrice
    // console.log(totalprice,'222222222222222222222222222222222');
  }
 

  userHelpers.placeOrder(req.body, products, totalPrice, req.body.paymentMethod, req.session.user._id, coupon, req.session.user).then((orderId) => {

    if (req.body.paymentMethod === 'COD') {
      res.json({ codSuccess: true })

    } else if (req.body.paymentMethod === 'paypal') {

      req.session.orderId = orderId
      var create_payment_json = {
        "intent": "sale",
        "payer": {
          "payment_method": "paypal"
        },
        "redirect_urls": {
          "return_url": "http://localhost:3000/success",
          "cancel_url": "http://cancel.url"
        },
        "transactions": [{
          "item_list": {
            "items": [{
              "name": products[0].item,
              "sku": "item",
              // "price": totalPrice[0].total,
              "price": totalPrice,
              "currency": "USD",
              "quantity": 1
            }]
          },
          "amount": {
            "currency": "USD",
            // "total": totalPrice[0].total
            "total": totalPrice
          },
          "description": "This is the payment description."
        }]
      };

      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
          throw error;
        } else {
          console.log("Create Payment Response");
          console.log(payment);
          for (let i = 0; i < payment.links.length; i++) {
            if (payment.links[i].rel === 'approval_url') {
              console.log(payment.links[i].href);
              res.json({ url: payment.links[i].href, paypal: true });

            }
          }
        }
      });
    } else {

      userHelpers.generateRezorpay(orderId, totalPrice).then((response) => {
        res.json({ response, razorpay: true })
      })
    }
  })
})


//======================================================= TO VERITY THE PAYMENT ============================================

router.post('/verify-payment', async (req, res) => {
  let userId = req.session.user._id
 
  let products =await userHelpers.getCartProductList(userId)
  userHelpers.verifyPayment(req.body).then(() => {
    userHelpers.changePaymentStatus(req.body['order[receipt]'], userId,products).then(() => {
      console.log('Payment Succcess');
      res.json({ status: true })
    })
  }).catch((err) => {
    console.log(err);
    res.json({ status: false })
  })
})

//================= payment success =================

router.get('/success', verifyLogin, (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  userHelpers.changePaymentStatus(req.session.orderId).then(() => {
    delete req.session.orderId
    res.redirect('/orders')
  })
})
// =============================DISPLAY A ALERT WHEN A USER BUYS  A PRODUCT =============================

router.get('/order-success', async (req, res) => {
  let userName = req.session.user
  let cartCount = null;
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
    console.log(cartCount);
  }
  res.render('user/order-success', { user: req.session.user, cartCount, userName,logout: !req.session.loggedIn })
})

//  =============================ORDERS OF THE USER AND ITS HISTROY =============================
router.get('/orders', verifyLogin, async (req, res) => {

  let userName = req.session.user
  let cartCount = null;
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
    console.log(cartCount);
  }
  userHelpers.deletePendingOrder()
  userHelpers.orderHistory(req.session.user._id).then((response) => {
   
    res.render('user/orders', { response, user: req.session.user, userName, cartCount,logout: !req.session.loggedIn })
  })
})

//  =============================TO CANCEL THE ORDER IN USER SIDE =============================
//to delete the user
router.put('/cancelOrder', (req, res) => {
 
  console.log(req.orderId);
  orderId = req.body.orderId,
  proId = req.body.proId
  userHelpers.cancelOrder(orderId,proId).then(() => {
    res.json({ status: true })
  })
})

//================================== TO RETURN THE PRODUCT IN USER SIDE ========================
router.put('/returnOrder',async (req,res)=>{
  console.log(req.body,'ppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp');
  let products = await userHelpers.getProductView(req.body.proId)
  console.log(products,'zzzzzzzzzzzzzzzzzzzzzzzzzz');
  userHelpers.returnOrder(req.body,req.session.user._id,products).then(()=>{
    res.json({status:true})
  })

})
//==================================  TO CHANGE THE ORDER STATUS ====================================
router.put('/change-order-status', verifyLogin, (req, res) => {
  userHelpers.changeOrderStatus(req.body).then(() => {
    res.json({ status: true })
  })
})

//to dispaly the users product
router.get('/view-order-products/:id', async (req, res) => {
  let userName = req.session.user
  let cartCount = null;
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
    console.log(cartCount);
  }
  let products = await userHelpers.getOrderProducts(req.params.id)
  res.render('user/view-order-products', { user: req.session.user, products, userName, cartCount ,logout: !req.session.loggedIn})
})

//  =============================TO DISPLAY THE PROFILE OF THE USER =============================
//user profile
router.get('/profile', verifyLogin, async (req, res) => {
  let userName = req.session.user
  let cartCount = null;
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  let orders = await userHelpers.getOrderProducts(req.session.user._id)
  console.log(orders,'++++++++++++++++++++++++++++++++++++++++++++');
  let address = await userHelpers.getUserDetails(req.session.user._id)
  console.log(address, 'addreess is coming');
  //consoling the orders
  res.render('user/profile', { userName, user: req.session.user._id, cartCount, orders, address ,logout: !req.session.loggedIn})
})

//======================================  EDIT USER PROFILE =================================
router.post('/profile', (req, res) => {
  // let userName = req.session.user
  userHelpers.editProfile(req.session.user._id, req.body).then(() => {
    req.session.user = req.body
    console.log(req.session.user, 'profile');
    res.redirect('/profile')
  })
})

//  ============================= WISHLIST OF THE USER =============================

router.get('/wishlist', verifyLogin, async (req, res) => {
  let userName = req.session.user
  let cartCount = null;
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  userHelpers.getWishlist(req.session.user._id).then((response) => {

    res.render('user/wishlist', { response, user: req.session.user, cartCount, userName,logout: !req.session.loggedIn })
  })

})

//  =============================ADD TO WISHLIST OF THE PRODUCT =============================


router.get('/add-to-wishlist/:proId', verifyLogin, (req, res) => {
  userHelpers.addToWishlist(req.params.proId, req.session.user._id).then(() => {
    res.json({ status: true })
  }).catch((response) => {
    res.json({ status: false })
  })
})

//  =============================ADDRESS OF THE USER =============================
router.get('/addressBook', verifyLogin, async (req, res) => {
  let userName = req.session.user
  let cartCount = null;
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  // console.log(userName,'user is coming');
  userHelpers.getAddressList(req.session.user._id).then((addressData) => {

    res.render('user/addressBook', { addressData, user: req.session.user, userName, cartCount,logout: !req.session.loggedIn })
  })
})

// ============================================== address ========================================
router.post('/address', verifyLogin, (req, res) => {
  console.log(req.body, 'address');
  userHelpers.addAddress(req.body).then((response) => {
    res.json({ status: true })
  })
})
//  ================================================== edit product ===================================

router.get('/edit-address/:addressId', verifyLogin, async (req, res) => {
  // console.log(req.session.user._id,' ppppppppppppppppppppppp');
  let addressData = await userHelpers.getOrderAddress(req.session.user._id, req.params.addressId)
  res.json(addressData)
})

router.post('/edit-address', verifyLogin, async (req, res) => {

  userHelpers.editAddress(req.body).then(() => {
    res.json({ status: true })
  })
})


// //============================================================== DELETE THE ADDRESS ====================================

router.delete('/delete-address', verifyLogin, (req, res) => {
  userHelpers.deleteAddress(req.session.user._id, req.body.addressId).then(() => {
    res.json({ status: true })
  })
})

//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  POST OF COUPON XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
router.post('/redeem-coupon', async (req, res) => {
  let userId = req.session.user._id
  let total = await userHelpers.getTotalAmount(userId)
  // let total = totalPrice
  // console.log(totalPrice[0].total,'pppppppppppppppppppppppppppppppppppppppppppppppp');

  userHelpers.redeemCoupon(req.body.coupon, req.session.user._id).then((couponData) => {
    // console.log(couponData, 'bbbbbbbbbbbbbbbbbbbbb');
    console.log(req.body.coupon, 'redeeem')

    let maxMsg = 'Only valid for below this price ₹' + couponData.maxPrice
    let minMsg = 'Only valid for above this price ₹' + couponData.minPrice
   

    if (total >= couponData.minPrice && total <= couponData.maxPrice) {
      let temp = (total * couponData.percentage) / 100
      total = (total - temp)
      let coupon = req.body.coupon
      console.log(total, 'ttttttthhhhhhhhhhhhhhhhe total');
      res.json({ total: total, disPrice: temp, coupon })
    }
   else if(total <= couponData.minPrice) {
      console.log('lllllllllllllllllllooooooooooooooooooooooooo');
      res.json({ msg: minMsg,total: total })
    }
  else if(total >= couponData.maxPrice){
    console.log('hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhiiiiii');
      res.json({ msg: maxMsg,total: total })
  }
  }).catch(() => {
    let message = 'Invalid coupon Or Already Expired !!'
    res.json({ msg: message ,total:total})
  })
})


//xxxxxxxxxxxxxxx WALLET PAGE XXXXXXXXXXXXXXXX
router.get('/wallet', verifyLogin, async (req, res) => {
  let userName = req.session.user
  let cartCount = null;
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  userHelpers.getWallet(req.session.user._id).then((walletDetails) => {
    console.log(response, 'vvvvvvvvvvvvvvvvvvvvvvvvv');
    res.render('user/wallet', { walletDetails, user: req.session.user, userName, cartCount,logout: !req.session.loggedIn })
  })
})
//xxxxxxxxxxxxxxx SEARCH PRODUCT XXXXXXXXXXXXXXXXXXXX
router.get('/search',async (req,res)=>{
  let userName = req.session.user
  let cartCount = null;
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  userHelpers.getSearchProduct(req.query.search).then((response)=>{
    console.log(response,'rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr');
    userHelpers.getCategory().then(async (category)=>{
    // let products =await  userHelpers.getProduct()
      res.render('user/product-list',{userName,cartCount,response,category,user:req.session.user,logout: !req.session.loggedIn})
    
  })
  }).catch(()=>{
    userHelpers.getCategory().then((category)=>{
      res.render('user/product-list',{userName,cartCount,category,user:req.session.user,logout: !req.session.loggedIn})
    })
  })
 
})

router.get('/pick-address/:addressId',(req,res)=>{
  console.log('22222222222222222222222222');
  userHelpers.getOrderAddress(req.session.user._id,req.params.addressId).then((address)=>{
    console.log(req.params.addressId,'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
    console.log(req.session.user._id,'cccccccccccccccccccccccccccccccccc');
    console.log(address,'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    res.json(address)
  })
})




// p-test 
router.get('/p-test', (req, res) => {
  res.render('user/p-test')
})
//hey 
router.get('/hey', (req, res) => {
  res.render('user/hey')
})
module.exports = router;
