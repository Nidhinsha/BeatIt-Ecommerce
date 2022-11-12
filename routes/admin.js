
var express = require('express');
var router = express.Router();
const mkdirp = require('mkdirp');
const adminHelpers = require("../helpers/admin-helpers")
const cloudinary = require('../utils/cloudinary')
const multer = require('multer')
const path = require('path');
const { response } = require('../app');
upload= multer({
    storage:multer.diskStorage({}),
    fileFilter:(req,file,cb) => {
        let ext = path.extname(file.originalname)
        if (ext!==".jpg" && ext!==".jpeg" &&ext!==".png" &&ext!==".webp") {
            cb(new Error("File type is not supported"),false)
            return 
        } 
        cb(null,true)
    }
})
/* GET home page. */

//middlewear

router.use(function (req, res, next) {
    if (req.query._method == 'DELETE') {
        req.method = 'DELETE';
        req.url = req.path;
    }
    next();
});

router.use((req, res, next) => {
    if (req.query._method == 'PUT') {
        req.method = 'PUT';
        req.url = req.path;
    }
    next();
})

//admin login checkers

const verifyLogin = (req, res, next) => {
    if (req.session.adminLoggedIn) {
        next();
    } else {
        res.redirect('/admin/admin_login')
    }
}

//admin logout checker
const verifyLogout = (req, res, next) => {
    if (req.session.adminLoggedIn) {
        res.redirect('/admin/admin_panel/list_user')
    } else {
        next()
    }
}
//log out admin

router.get('/logout', (req, res) => {
    req.session.adminLoggedIn = false;
    req.session.admin = null;
    res.redirect('/admin')
})

//admin login
router.get('/', verifyLogout, (req, res) => {
    res.redirect('/admin/admin_login')
})
//admin_login 
router.get("/admin_login", verifyLogout, (req, res) => {
    var adminChecker = req.query.valid
    // console.log(adminChecker);  
    res.render('admin/signin', { adminChecker, not: true })
})
router.post('/admin_login', function (req, res) {
    adminHelpers.adminSignin(req.body).then((response) => {
        req.session.admin = response.admin
        req.session.adminLoggedIn = true
        res.redirect('/admin/admin_panel/list_user')

    }).catch((response) => {
        var string = encodeURIComponent(response);
        res.redirect('/admin/admin_login?valid=' + string)
    })

})


//admin user management
//display user 
router.get('/admin_panel/list_user', verifyLogin, (req, res) => {
    adminHelpers.listUser().then((response) => {
        res.render('admin/list_user', { response, admin: true })
    })

})
//delete user
router.delete('/admin_panel/list_user/:id', (req, res) => {
    adminHelpers.deleteUser(req.params.id).then((response) => {
        res.redirect('/admin/admin_panel/list_user')
    })
})

//user details

router.get('/admin_panel/list_user/user-management/:id', (req, res) => {
    adminHelpers.userDetails(req.params.id).then((response) => {
        res.render('admin/user_details', { response })
    })

})
router.get('/admin_panel/list_user/:id', (req, res) => {

    adminHelpers.changeUserStatus(req.params.id).then((response) => {
        res.redirect('/admin/admin_panel/list_user')
    })
})

//view products

router.get('/admin_panel/products', verifyLogin, (req, res) => {
    adminHelpers.getProducts().then((response) => {
        res.render('admin/product', { response, admin: true })
    })
})

//delete product
router.delete('/admin_panel/products/:id', (req, res) => {
    adminHelpers.deleteProduct(req.params.id).then((response) => {
        res.redirect('/admin/admin_panel/products')
    })
})
//add product
router.get('/admin_panel/products/add_product', verifyLogin, (req, res) => {
    adminHelpers.getCategory().then((category) => {
        res.render('admin/add_product', { category, admin: true })
    })
})
//add product
router.post('/admin_panel/products/add_product',upload.fields([
{name:'image1' , maxCount:1},
{name:'image2' , maxCount:1},
{name:'image3' , maxCount:1},
{name:'image4' , maxCount:1},
]),async (req,res)=>{
    console.log(process.env.API_KEY,'ppppppppppppppppppppppp');
  const  cloudinaryImageUploadMethod = (file)=>{
    return new Promise((resolve,reject) => {
        cloudinary.uploader.upload(file,(err,res)=>{
            if(err) return res.status(500).send("UPLOAD IMAGE ERROR")
            resolve(res.secure_url)
        })
    })
  }
  const files = req.files;
  let arr1 = Object.values(files);
  let arr2 = arr1.flat()
  const urls = await Promise.all(
    arr2.map(async(file)=>{
        const {path} = file
        const result = await cloudinaryImageUploadMethod(path)
        return result
    })
  )
  console.log(urls,'urls');
    adminHelpers.addProduct(req.body,urls, (id) => {
        res.redirect('/admin/admin_panel/products')
    })
   
})




//edit
router.get('/admin_panel/products/edit_product/:id', verifyLogin, (req, res) => {
    adminHelpers.getProductById(req.params.id).then((response) => {
        res.render('admin/edit_product', { response, admin: true })
    })
})

// router.post('/admin_panel/products/edit_product/:id', upload.array('image1', 4), (req, res) => {
    
//     adminHelpers.editProduct(req.params.id, req.body).then(() => {
//         res.redirect('/admin/admin_panel/products')

        
//     })
// })
router.post('/admin_panel/products/edit_product/:id', upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 },
  ]), async (req, res) => {
    console.log(req.files);
    const cloudinaryImageUploadMethod = (file) => {
      console.log("qwertyui");
      return new Promise((resolve) => {
        cloudinary.uploader.upload(file, (err, res) => {
          console.log(err, " asdfgh");
          if (err) return res.status(500).send("Upload Image Error")
          resolve(res.secure_url)
        })
      })
    }
  
    const files = req.files
    let arr1 = Object.values(files)
    let arr2 = arr1.flat()
    const urls = await Promise.all(
      arr2.map(async (file) => {
        const { path } = file
        const result = await cloudinaryImageUploadMethod(path)
        return result
      })
    )
    console.log(urls);
  
   adminHelpers.editProduct(req.params.id, req.body, urls).then((id) => {
    res.redirect('/admin/admin_panel/products')
    })
  })



//newly added item to display images and all
// let id = req.params.id;
// let image1 = req.files?.image1;
// let image2 = req.files?.image2;
// let image3 = req.files?.image3;
// let image4 = req.files?.image4;
// if (image1) {
//     image1.mv('./public/product-images/' + id + "/" + id + "_0" + '.png')
// }
// if (image2) {
//     image2.mv('./public/product-images/' + id + "/" + id + "_1" + '.png')
// }
// if (image3) {
//     image3.mv('./public/product-images/' + id + "/" + id + "_2" + '.png')
// }
// if (image4) {
//     image4.mv('./public/product-images/' + id + "/" + id + "_3" + '.png')
// }

// console.log(image);
//ADMIN PRODUCT MANAGEMENET

router.get('/admin_panel/category-management', verifyLogin, (req, res) => {

    adminHelpers.getCategories().then((response) => {
        res.render('admin/category-management', { response, admin: true })
    })
})
//post category method
router.post('/admin_panel/category-management', (req, res) => {
    adminHelpers.setCategory(req.body).then((id) => {
        res.json({ status: true })

    }).catch(() => {

        res.redirect('admin/admin_panel/category-management')
    })
})
//put category
router.put('/admin_panel/category-management', (req, res) => {
    adminHelpers.editCategory(req.body).then(() => {
        res.json({ status: true })

    }).catch(() => {
        res.json({ status: false })
    })
})

//delete category

router.delete('/admin_panel/category-management/:id', (req, res) => {
    adminHelpers.deleteCategory(req.params.id).then((response) => {

        res.redirect('/admin/admin_panel/category-management')
    })
})


//ORDER MANAGEMENT  GET PRODUCTS
router.get('/admin_panel/orders', verifyLogin, (req, res) => {
    adminHelpers.getOrderDetails('placed').then((response) => {
        // console.log(response);
        res.render('admin/orders', { response, admin: true })
    })
})
//change order status
router.get('/admin_panel/orders/:status', (req, res) => {
    adminHelpers.getOrderDetails(req.params.status).then((response) => {
        res.json(response)
    })
})
// orders post
router.post('/admin_panel/orderStatus', (req, res) => {
    adminHelpers.changeOrderStatus(req.body.orderId, req.body.status,req.body.proId).then(() => {
        res.json({ status: true })
    })
})

//ORDER CANCEL ORDERS
router.delete('/admin_panel/orders/', (req, res) => {
    adminHelpers.cancelOrder(req.query.orderId, req.query.proId).then(() => {
        // console.log('cancel order router inside');
        res.redirect('/admin/admin-panel/orders')
    })

})

//payment managenent
router.get('/admin_panel/payment-management', verifyLogin, (req, res) => {
    adminHelpers.getPaymentOption().then((response) => {
        res.render('admin/payment_method', { response, admin: true })
    })

})

router.post('/admin_panel/payment-management', (req, res) => {
    adminHelpers.addPaymentOption(req.body).then(() => {
        res.redirect('/admin/admin_panel/payment-management')
    })
})
//delete payment method

router.delete('/admin_panel/payment-management/:id', (req, res) => {
    adminHelpers.deletePaymentOption(req.params.id).then(() => {
        res.redirect('/admin/admin_panel/payment-management')
    })
})
//============================= ALL SAMPLE ==========================================

//data table for test 

router.get('/data-table', (req, res) => {

    res.render('admin/data-table')
})

//admin side bar new for shuhaib sir

router.get('/admin-side-new', (req, res) => {
    res.render('admin/admin-side-new', { not: true })
})
//sample
router.get('/sample', (req, res) => {
    res.render('admin/sample')
})
//sample form 
router.get('/sample-form', (req, res) => {
    res.render('admin/sample-form')
})
//sample login
router.get('/sample-login', (req, res) => {
    res.render('admin/sample-login', { admin: true })
})
//crop sample
router.get('/crop-sample', (req, res) => {
    res.render('admin/crop-sample')
})
//nav-bar sample

router.get('/sample-add', (req, res) => {
    res.render('admin/sample-add', { not: true })
})
//address card to display the address

router.get('/address-cards', (req, res) => {
    res.render('admin/address-cards')
})
//============================= ALL SAMPLE ==========================================
//============================= SALES REPORT     ==========================================
// router.get('/admin_panel/sales-report',(req,res)=>{

//     adminHelpers.salesReport(1).then((response)=>{
//         console.log(response,'sales report in get');
//         res.render('admin/sales-report',{admin:true,response})
//     })

// })

// router.get('/admin_panel/sales-report/:days',(req,res)=>{
//     adminHelpers.salesReport(req.params.days).then((response)=>{
//         console.log(response,'sales report days');
//         res.json(response)
//     })
// })


//sales report
router.get("/admin_panel/sales-report", verifyLogin, async (req, res) => {
    if (req.query?.month) {
        let month = req.query?.month.split("-");
        let [yy, mm] = month;
        deliveredOrders = await adminHelpers.deliveredOrderList(yy, mm);
    } else if (req.query?.daterange) {
        deliveredOrders = await adminHelpers.deliveredOrderList(req.query);
    } else {
        deliveredOrders = await adminHelpers.deliveredOrderList();
    }
    console.log(deliveredOrders, 'this iiiiiiiiiiiiiiiiiiiiiiiiiiii');
   let revenue =await adminHelpers.getRevenue(deliveredOrders)
    res.render("admin/sales-report", { admin: true, deliveredOrders,revenue });
  
  
});

//============================= ADMIN DASHBOARD ==========================================

router.get('/admin_panel/dashboard', verifyLogin, (req, res) => {
    adminHelpers.salesReport(req.params.days).then((response) => {
        console.log(response,'77777777777777777777777777777777');
        
    res.render('admin/dashboard', { admin: true,response })
    })
})

router.get('/admin_panel/dashboard/:days', verifyLogin, (req, res) => {
    adminHelpers.salesReport(req.params.days).then((response) => {
        console.log(response,'rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr');
        res.json(response)
    })
})

//===================== OFFER MANAGEMENT ================================

//product offers
router.get("/admin_panel/offers", verifyLogin, async (req, res) => {
    category = await adminHelpers.getCategories()
    products = await adminHelpers.getProducts()
    productOffer = await adminHelpers.getProductOffer()
    categoryOffer = await adminHelpers.getCategoryOffer()
    res.render('admin/offers', { admin: true, category, products, productOffer, categoryOffer })
})

router.post("/admin_panel/offers/product-offers", verifyLogin, (req, res) => {
    adminHelpers.addProductOffer(req.body).then((response) => {
        res.redirect('/admin/admin_panel/offers')
    })
})

//category offers
router.post("/admin_panel/offers/category-offers", verifyLogin, (req, res) => {
    adminHelpers.addCategoryOffer(req.body).then((response) => {
        res.redirect('/admin/admin_panel/offers')
    })
})
// DELETE PRODUCT OFFER
router.post('/admin_panel/delete-product-offer', (req, res) => {    
    adminHelpers.deleteProductOffer(req.body.proId)
    res.json({status:true})
})

//DELETE CATEGORY OFFER

router.post('/admin_panel/delete-category-offer',(req,res)=>{
    adminHelpers.deleteCategoryOffer(req.body.category).then(()=>{
        res.json({status:true})
    })
})

// ============================== COUPOUN ==============================

router.get('/admin_panel/coupon',(req,res)=>{
     adminHelpers.getCoupon().then((coupons)=>{
        console.log(coupons,'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
        res.render('admin/coupon',{admin:true,coupons})
     })
   
})

// =============================== ADD COUPON ==========================
 router.post('/admin_panel/coupon',(req,res)=>{
    adminHelpers.addCoupon(req.body).then(()=>{
        res.json({status:true})
    }).catch(()=>{
        res.json({status:false})
    })
 })
 //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx DELETE COUPON XXXXXXXXXXXXXXXXXXXXXXXXX
 router.delete('/admin_panel/coupon',(req,res)=>{
    console.log(req.body,'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddd');
   adminHelpers.deleteCoupon(req.body).then(()=>{
    res.json({status:true})
   })
 })
 //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx ADD BANNER XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
 router.get('/admin_panel/banner',(req,res)=>{
    adminHelpers.getBanner().then((banner)=>{
        console.log('bannnnnnner',banner);
        res.render('admin/banner',{admin:true,banner})
    })
   
 })
router.post('/admin_panel/banner',upload.fields([
    {name:'banner1' , maxCount:1},
    {name:'banner2' , maxCount:1},
    {name:'banner3' , maxCount:1},
    {name:'banner4' , maxCount:1},
    ]),async (req,res)=>{
        console.log(process.env.API_KEY,'ppppppppppppppppppppppp');
      const  cloudinaryImageUploadMethod = (file)=>{
        return new Promise((resolve,reject) => {
            cloudinary.uploader.upload(file,(err,res)=>{
                if(err) return res.status(500).send("UPLOAD IMAGE ERROR")
                resolve(res.secure_url)
            })
        })
      }
      const files = req.files;
      let arr1 = Object.values(files);
      let arr2 = arr1.flat()
      const urls = await Promise.all(
        arr2.map(async(file)=>{
            const {path} = file
            const result = await cloudinaryImageUploadMethod(path)
            return result
        })
      )
      console.log(urls,'urls');
        adminHelpers.addBanner(req.body,urls).then(()=>{
            res.redirect('/admin/admin_panel/banner')
        })
          
})
//xxxxxxxxxxxxxx DELETE BANNER XXXXXXXXXXXXXXXXX
router.delete('/admin_panel/banner',(req,res)=>{
    console.log(req.body,';;;;;;;');
    console.log(req.body.bannerId,'ll');
    bannerId = req.body.bannerId
    adminHelpers.deleteBanner(bannerId).then(()=>{
        res.json({status:true})
    })
})
module.exports = router;

