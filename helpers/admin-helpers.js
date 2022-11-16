var db = require("../config/connection")
var collection = require("../config/collections")
const bcrypt = require("bcrypt")
const { PRODUCT_COLLECTION } = require("../config/collections")
var objId = require('mongodb').ObjectId

module.exports = {
    //admin signin checking the admin login
    adminSignin: (adminData) => {
        let response = {};
        return new Promise(async (resolve, reject) => {
            let admin = await db.get().collection(collection.ADMIN_COLLECTON).findOne({ email: adminData.email })
            if (admin) {
                bcrypt.compare(adminData.password, admin.password).then((status) => {

                    if (status) {
                        response.admin = admin;
                        response.status = true;
                        resolve(response)

                    } else {
                        reject("invalid password")
                    }
                })
            } else {
                reject('invalid email')
            }
        })
    },
    //to display the user to the admin
    listUser: () => {
        return new Promise(async (resolve, reject) => {
            let users = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(users)
        })
    },
    // to delete the user from the site
    deleteUser: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).deleteOne({ _id: objId(userId) }).then((status) => {
                resolve(status)
            })
        })
    },
    // to get the all user related data
    userDetails: (userId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objId(userId) }).then((response) => {
                resolve(response);
            })
        })
    },
    //change user status
    changeUserStatus: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objId(userId) }, [{ "$set": { status: { "$not": "$status" } } }])
            resolve("success")
        })
    },
    // get categories
    getCategories: () => {
        return new Promise(async (resolve, reject) => {
            let categories = await db.get().collection(collection.CATEGORIES_COLLECTION).find({}).sort({ date: -1 }).toArray()
            resolve(categories);
        })
    },
    //set categories
    setCategory: (categoryData) => {
        return new Promise(async (resolve, reject) => {
            categoryData.category = categoryData.category.toUpperCase()

            categoryData.date = new Date()
            let categoryCheck = await db.get().collection(collection.CATEGORIES_COLLECTION).findOne({ category: categoryData.category })
            if (categoryCheck == null) {
                categoryData.categoryOffer = 0
                db.get().collection(collection.CATEGORIES_COLLECTION).insertOne(categoryData).then((response) => {
                    resolve(response.insertedId)
                })
            } else {
                reject()
            }

        })
    },
    editCategory: (categoryData) => {
        return new Promise(async (resolve, reject) => {
            categoryData.inputValue = categoryData.inputValue.toUpperCase()
            let categoryCheck = await db.get().collection(collection.CATEGORIES_COLLECTION).findOne({ category: categoryData.inputValue })
            if (categoryCheck == null) {
                db.get().collection(collection.CATEGORIES_COLLECTION).updateOne(
                    {
                        _id: objId(categoryData.categoryId)
                    }, {
                    $set: {
                        category: categoryData.inputValue
                    }
                }
                ).then((response) => {
                    resolve(response.insertedId)
                })
            } else {
                reject()
            }
        })
    },

    //xxxxxxxxxxxxxxxxxxxxxxx UPDATE CATEGORY IN USER PRODUCT TOO.. XXXXXXXXXXXXXXXXXXX

    updateProductCategory: (categoryData) => {
        categoryData.inputValue = categoryData.inputValue.toUpperCase()
        console.log(categoryData, '90909090909090909090909090');
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.PRODUCT_COLLECTION).updateMany(
                {
                    category: categoryData.categoryName
                }, {
                $set: {
                    category: categoryData.inputValue
                }
            })
            resolve()
        })
    },
    //delete categories
    deleteCategory: (categoryId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORIES_COLLECTION).deleteOne({ _id: objId(categoryId) }).then((status) => {
                resolve(status);
            })
        })
    },
    //add product
    addProduct: (productData, urls, callback) => {

        return new Promise((resolve, reject) => {
            productData.date = new Date()
            productData.actualPrice = Number(productData.actualPrice)
            productData.offerPrice = Number(productData.actualPrice)
            productData.stock = Number(productData.stock)
            productData.categoryOffer = 0;
            productData.productOffer = 0;
            productData.currentOffer = 0;
            productData.image = urls
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(productData).then((data) => {
                callback(data.insertedId.toString())
            })
        })
    },
    //edit product
    editProduct: (proId, updatedData, urls) => {
        return new Promise((resolve, reject) => {
            updatedData.offerPrice = Number(updatedData.offerPrice)
            updatedData.stock = Number(updatedData.stock)

            db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
                {
                    _id: objId(proId)
                },
                {
                    $set: {
                        product_name:updatedData.product_name,
                        // product: updatedData.product,
                        brand: updatedData.brand,
                        stock: updatedData.stock,
                        actualPrice: updatedData.actualPrice,
                        category: updatedData.category,
                        description: updatedData.description,
                        image: urls
                    }
                }

            ).then((response) => {
                // console.log(response, 'OOOOOOOOOOOOOOOOOOOOOOOOOOO');
                resolve(response)
            })


        })
    },
    //get product to the products from the database
    getProducts: () => {
        return new Promise((resolve, reject) => {
            let products = db.get().collection(collection.PRODUCT_COLLECTION).find({}).toArray();
            resolve(products)
        })
    },
    //get product id to change and delete item you need the product id 

    getProductById: (proId) => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objId(proId) }).then((response) => {
                resolve(response)
            })
        })
    },
    //get category form the database
    getCategory: () => {
        return new Promise((resolve, reject) => {
            let category = db.get().collection(collection.CATEGORIES_COLLECTION).find({}).toArray()
            resolve(category)
        })
    },
    //delete product
    deleteProduct: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: objId(proId) }).then((response) => {
                resolve();
            })
        })
    },
    //payment get

    getPaymentOption: () => {
        return new Promise(async (resolve, reject) => {
            let paymentOptions = await db.get().collection(collection.PAYMENT_COLLECTION).find({}).toArray();
            resolve(paymentOptions)
        })
    },
    addPaymentOption: (paymentOption) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PAYMENT_COLLECTION).insertOne(paymentOption).then(() => {
                resolve()
            })
        })
    },
    deletePaymentOption: (paymentMethodId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PAYMENT_COLLECTION).deleteOne({ _id: objId(paymentMethodId) }).then(() => {
                resolve()
            })

        })
    },
    // to get the full order details of the user and the product including the order status whether it is placed ,shipped, delivered
    getOrderDetails: (orderStatus) => {
        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([

                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: "$products.quantity",
                        deliveryDetails: "$deliveryDetails",
                        paymentMethod: "$paymentMethod",
                        totalAmount: "$totalAmount",
                        status: "$products.status",
                        date: "$date",
                        offerPrice: "$products.offerPrice"
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                }, {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] },
                        // quantity:"$products.quantity",
                        paymentMethod: 1, deliveryDetails: 1, totalAmount: 1, status: 1, date: 1, offerPrice: 1
                    }
                }

            ]).toArray()

            resolve(orderItems)
            // console.log(orderItems + 'ttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt');
        })
    },
    //cancel orders
    cancelOrder: (orderId, proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION)
                .updateOne({ _id: objId(orderId) }, { $pull: { products: { item: objId(proId) } } })
                .then((response) => {
                    resolve(response)
                })
        })
    },
    // to change order status placed , shipped , delivered
    changeOrderStatus: (orderId, status, proId) => {
        return new Promise((resolve, reject) => {
            let dateStatus = new Date()
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objId(orderId), 'products.item': objId(proId) },
                { $set: { 'products.$.status': status, statusUpdateDate: dateStatus } }).then((response) => {
                    resolve(response)
                })
        })
    },


    //================================ SALES REPORT ==========================================

    //==================================================== sales report-delivered order list ======================
    deliveredOrderList: (yy, mm) => {
        return new Promise(async (resolve, reject) => {
            let agg = [{
                $match: {
                    'products.status': 'delivered'
                }
            }, {
                $unwind: {
                    path: '$products'
                }
            }, {
                $project: {
                    item: '$products.item',
                    totalAmount: '$totalAmount',
                    statusUpdateDate: '$statusUpdateDate',
                    paymentMethod: '$paymentMethod',
                    status: '$products.status'
                }
            }, {
                $lookup: {
                    from: PRODUCT_COLLECTION,
                    localField: 'item',
                    foreignField: '_id',
                    as: 'result'
                }
            }, {
                $unwind: {
                    path: '$result'
                }
            }, {
                $project: {
                    totalAmount: 1,
                    paymentMethod: 1,
                    productPrice: '$result.offerPrice',
                    statusUpdateDate: 1,
                    status: 1

                }
            }]
            if (mm) {
                let start = "1"
                let end = "30"
                let fromDate = mm.concat("/" + start + "/" + yy)
                let fromD = new Date(new Date(fromDate).getTime() + 3600 * 24 * 1000)

                let endDate = mm.concat("/" + end + "/" + yy)
                let endD = new Date(new Date(endDate).getTime() + 3600 * 24 * 1000)

                dbQuery = {
                    $match: {
                        statusUpdateDate: {
                            $gte: fromD,
                            $lte: endD
                        }
                    }
                }

                agg.unshift(dbQuery)
                let deliveredOrders = await db
                    .get()
                    .collection(collection.ORDER_COLLECTION)
                    .aggregate(agg).toArray()
                resolve(deliveredOrders)


            } else if (yy) {
                let dateRange = yy.daterange.split("-")
                let [from, to] = dateRange
                from = from.trim("")
                to = to.trim("")
                fromDate = new Date(new Date(from).getTime() + 3600 * 24 * 1000)
                toDate = new Date(new Date(to).getTime() + 3600 * 24 * 1000)

                dbQuery = {
                    $match: {
                        statusUpdateDate: {
                            $gte: fromDate,
                            $lte: toDate
                        }
                    }
                }

                agg.unshift(dbQuery)
                let deliveredOrders = await db
                    .get()
                    .collection(collection.ORDER_COLLECTION)
                    .aggregate(agg).toArray()
                resolve(deliveredOrders)

            } else {

                let deliveredOrders = await db
                    .get()
                    .collection(collection.ORDER_COLLECTION)
                    .aggregate(agg).toArray()
                resolve(deliveredOrders)
            }



        })

    },
    //xxxxxxxxxxxxxxxxxxxxxx GET REVENUE XXXXXXXXXXXXXXXXXXXXXXXX
    getRevenue: (orderDetails) => {
        return new Promise(async (resolve, reject) => {
            const total = orderDetails.reduce((acc, item) => acc + item.totalAmount, 0)

            resolve(total)
        })

    },

    //xxxxxxxxxxxxxxxxxxxxxxxx dash board xxxxxxxxxxxxxxxxxxxxxxx
    salesReport: (days) => {
        days = parseInt(days)
        return new Promise(async (resolve, reject) => {
            let startDate = new Date();
            let endDate = new Date();
            startDate.setDate(startDate.getDate() - days)

            let data = {};

            data.deliveredOrders = await db.get().collection(collection.ORDER_COLLECTION).find({ date: { $gte: startDate, $lte: endDate }, 'products.status': 'delivered' }).count()
            data.shippedOrders = await db.get().collection(collection.ORDER_COLLECTION).find({ date: { $gte: startDate, $lte: endDate }, 'products.status': 'shipped' }).count()
            data.placedOrders = await db.get().collection(collection.ORDER_COLLECTION).find({ date: { $gte: startDate, $lte: endDate }, 'products.status': 'placed' }).count()
            data.pendingOrders = await db.get().collection(collection.ORDER_COLLECTION).find({ date: { $gte: startDate, $lte: endDate }, 'products.status': 'pending' }).count()
            data.canceledOrders = await db.get().collection(collection.ORDER_COLLECTION).find({ date: { $gte: startDate, $lte: endDate }, 'products.status': 'canceled' }).count()
            data.returnedOrders = await db.get().collection(collection.ORDER_COLLECTION).find({ date: { $gte: startDate, $lte: endDate }, 'products.status': 'returned' }).count()
            let codTotal = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        date: {
                            $gte: startDate, $lte: endDate
                        },
                        paymentMethod: 'COD'
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: {
                            $sum: "$totalAmount"
                        }
                    }
                }
            ]).toArray()
            data.codTotal = codTotal?.[0]?.totalAmount

            let razorPayTotal = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        date: {
                            $gte: startDate, $lte: endDate
                        },
                        paymentMethod: 'razorpay'
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: {
                            $sum: "$totalAmount"
                        }
                    }
                }
            ]).toArray()
            data.razorPayTotal = razorPayTotal?.[0]?.totalAmount

            let paypalTotal = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        date: {
                            $gte: startDate, $lte: endDate
                        },
                        paymentMethod: 'paypal'
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: {
                            $sum: "$totalAmount"
                        }
                    }
                }
            ]).toArray()
            data.paypalTotal = paypalTotal?.[0]?.totalAmount

            let totalAmount = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        date: {
                            $gte: startDate, $lte: endDate
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: {
                            $sum: "$totalAmount"
                        }
                    }
                }
            ]).toArray()
            data.totalAmount = totalAmount?.[0]?.totalAmount
            let refundAmount = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        date: {
                            $gte: startDate, $lte: endDate
                        },
                        status: 'canceled'
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: {
                            $sum: "$totalAmount"
                        }
                    }
                }
            ]).toArray()
            data.refundAmount = refundAmount?.[0]?.totalAmount
            data.users = await db.get().collection(collection.USER_COLLECTION).find({ date: { $gte: startDate, $lte: endDate } }).count()
            resolve(data)
            console.log(data, '000000000000000000000000000000000000');
        })
    },
    // ====================== ADD OFFER CATEGORY ==================
    //add Product offer
    addProductOffer: (offerDetails) => {

        return new Promise(async (resolve, reject) => {
            let proId = objId(offerDetails.product)
            offerPercentage = Number(offerDetails.percentage)
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
                {
                    _id: proId
                },
                {
                    $set: {
                        productOffer: offerPercentage
                    }
                })

            let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: proId })

            if (product.productOffer >= product.categoryOffer) {
                let temp = (product.actualPrice * product.productOffer) / 100
                let updatedOfferPrice = (product.actualPrice - temp)
                let updatedProduct = await db.get().collection(collection.PRODUCT_COLLECTION).
                    updateOne(
                        { _id: proId },
                        {
                            $set:
                            {
                                offerPrice: updatedOfferPrice,
                                currentOffer: product.productOffer
                            }
                        })
                resolve(updatedProduct)

            } else if (product.productOffer < product.categoryOffer) {
                let temp = (product.actualPrice * product.categoryOffer) / 100
                let updatedOfferPrice = (product.actualPrice - temp)
                let updatedProduct = await db.get().collection(collection.PRODUCT_COLLECTION).
                    updateOne(
                        { _id: proId },
                        {
                            $set:
                            {
                                offerPrice: updatedOfferPrice,
                                currentOffer: product.productOffer
                            }
                        })
                resolve(updatedProduct)

            }


        })
    },
    //show products with product offer
    getProductOffer: () => {
        return new Promise(async (resolve, reject) => {
            offerProducts = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate(
                [{
                    $match: {
                        productOffer: {
                            $gt: 0
                        }
                    }
                }, {
                    $project: {
                        product_name: 1,
                        productOffer: 1
                    }
                }]
            ).toArray()
            resolve(offerProducts)
            // console.log(offerProducts, 'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
        })

    },
    //================= DELETE PRODUCT OFFER ===========

    deleteProductOffer: (proId) => {
        return new Promise(async (resolve, reject) => {

            await db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
                {
                    _id: objId(proId)
                }, {
                $set: {
                    productOffer: 0
                }
            }).then(async (response) => {

                await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objId(proId) }).then(async (response) => {

                    if (response.productOffer == 0 && response.categoryOffer == 0) {

                        response.offerPrice = response.actualPrice

                        db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
                            {
                                _id: objId(proId)
                            },
                            {
                                $set: {
                                    offerPrice: response.offerPrice,
                                    actualPrice: response.actualPrice,
                                    currentOffer: 0
                                }
                            })

                    } else if (response.productOffer < response.categoryOffer) {

                        let temp = (response.actualPrice * response.categoryOffer) / 100
                        let updatedOfferPrice = (response.actualPrice - temp)
                        let updatedProduct = await db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
                            {
                                _id: prodId
                            },
                            {
                                $set: {
                                    offerPrice: updatedOfferPrice,
                                    actualPrice: 0,
                                    currentOffer: response.categoryOffer
                                }
                            }
                        )
                        resolve(updatedProduct)
                    }


                })
                resolve()
            })
        })
    },

    //add category offer
    addCategoryOffer: (details) => {



        let category = details.category
        let percentage = Number(details.percentage)

        return new Promise(async (resolve, reject) => {

            await db.get().collection(collection.CATEGORIES_COLLECTION).updateOne({ category: category }, { $set: { categoryOffer: percentage } })

            await db.get().collection(collection.PRODUCT_COLLECTION).updateMany({ category: category }, { $set: { categoryOffer: percentage } })

            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({ category: category }).toArray()

            for (let i = 0; i < products.length; i++) {

                if (products[i].categoryOffer >= products[i].productOffer) {

                    let temp = (products[i].actualPrice * products[i].categoryOffer) / 100

                    let updatedOfferPrice = (products[i].actualPrice - temp)

                    updatedOfferPrice = parseInt(updatedOfferPrice)

                    console.log(updatedOfferPrice, 'uuuuuuuuuuuuuuuuuuuuuuuuuuu');

                    db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
                        {
                            _id: products[i]._id
                        }, {
                        $set: {
                            offerPrice: updatedOfferPrice,
                            currentOffer: products[i].categoryOffer
                        }
                    })

                } else if (products[i].categoryOffer < products[i].productOffer) {

                    let temp = (products[i].actualPrice * products[i].productOffer) / 100

                    let updatedOfferPrice = (products[i].actualPrice - temp)

                    updatedOfferPrice = parseInt(updatedOfferPrice)

                    console.log(updatedOfferPrice, 'uuuuuuuuuuuuuuuuuuuuuuuuuuu');

                    db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
                        {
                            _id: products[i]._id
                        },
                        {
                            $set: {
                                offerPrice: updatedOfferPrice,
                                currentOffer: products[i].productOffer
                            }
                        })

                } else if (products[i].categoryOffer == 0 && products[i].productOffer == 0) {

                    let updatedOfferPrice = (products[i].offerPrice = products[i].actualPrice)

                    updatedOfferPrice = parseInt(updatedOfferPrice)

                    db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
                        {
                            _id: products[i]._id
                        },
                        {
                            $set: {
                                offerPrice: updatedOfferPrice,
                                currentOffer: 0
                            }
                        })
                }

            }
            resolve()
        })

    },
    //display categories with offer
    getCategoryOffer: () => {

        return new Promise(async (resolve, reject) => {

            let categoryOffer = await db.get().collection(collection.CATEGORIES_COLLECTION).find({ categoryOffer: { $gt: 0 } }).toArray()

            resolve(categoryOffer)
        })

    },


    //================= DELETE CATEGORY OFFER ============
    deleteCategoryOffer: (category) => {

        return new Promise(async (resolve, reject) => {

            await db.get().collection(collection.CATEGORIES_COLLECTION).updateOne({ category: category }, { $set: { categoryOffer: 0 } })

            await db.get().collection(collection.PRODUCT_COLLECTION).updateMany({ category: category }, { $set: { categoryOffer: 0 } }).then(async () => {

                let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({ category: category }).toArray()

                for (let i = 0; i < products.length; i++) {

                    if (products[i].categoryOffer === 0 && products[i].productOffer == 0) {

                        products[i].offerPrice = products[i].actualPrice

                        db.get().collection(collection.PRODUCT_COLLECTION).
                            updateMany({ category: category },
                                {
                                    $set: {
                                        offerPrice: products[i].offerPrice,
                                        currentOffer: 0
                                    }
                                })

                    } else if (products[i].categoryOffer >= products[i].productOffer) {

                        let temp = (products[i].actualPrice * products[i].categoryOffer) / 100

                        let updatedOfferPrice = (products[i].actualPrice - temp)

                        updatedOfferPrice = parseInt(updatedOfferPrice)

                        console.log(updatedOfferPrice, 'uuuuuuuuuuuuuuuuuuuuuuuuuuu');

                        db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
                            {
                                _id: products[i]._id
                            }, {
                            $set: {
                                offerPrice: updatedOfferPrice
                            }
                        })

                    } else if (products[i].categoryOffer < products[i].productOffer) {

                        let temp = (products[i].actualPrice * products[i].productOffer) / 100

                        let updatedOfferPrice = (products[i].actualPrice - temp)

                        updatedOfferPrice = parseInt(updatedOfferPrice)

                        console.log(updatedOfferPrice, 'uuuuuuuuuuuuuuuuuuuuuuuuuuu');

                        db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
                            {
                                _id: products[i]._id
                            }, {
                            $set: {
                                offerPrice: updatedOfferPrice,
                                currentOffer: products[i].productOffer
                            }
                        })

                    }
                }
            })
            resolve()
        })
    },

    //================================================== COUPON COLLECTION ===============================

    //============================================ ADD COUPON ============================================

    addCoupon: (couponDetails) => {

        couponDetails.minPrice = parseInt(couponDetails.minPrice)
        couponDetails.maxPrice = parseInt(couponDetails.maxPrice)
        couponDetails.percentage = parseInt(couponDetails.percentage)
        couponDetails.isoDate = new Date(couponDetails.expiryDate)
        couponDetails.coupon = couponDetails.coupon.toUpperCase()
        couponDetails.user = []

        return new Promise(async (resolve, reject) => {

            let couponCheck = await db.get().collection(collection.COUPON_COLLECTION).
                findOne({ coupon: couponDetails.coupon })

            if (couponCheck === null) {

                db.get().collection(collection.COUPON_COLLECTION).insertOne(couponDetails).then((response) => {
                    resolve()
                })

            }
            else {
                console.log('coupon rejected');
                reject()
            }

        })
    },

    // xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx DISPLAY THE COUPON ON ADMIN SIDE XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    getCoupon: () => {

        return new Promise(async (resolve, reject) => {

            coupons = await db.get().collection(collection.COUPON_COLLECTION).find({}).toArray()
            resolve(coupons)
        })
    },

    // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX DELETE THE COUPON XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    deleteCoupon: (couponId) => {

        return new Promise((resolve, reject) => {

            db.get().collection(collection.COUPON_COLLECTION).deleteOne({ _id: objId(couponId.couponId) }).then(() => {
                resolve()
            })
        })
    },
    //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx ADD BANNNER XXXXXXXXXXXXXXXXXXXX
    addBanner: (data, urls) => {

        return new Promise((resolve, reject) => {
            data.image = urls
            data.time = new Date()
            db.get().collection(collection.BANNER_COLLECTION).insertOne(data).then(() => {
                resolve()
            })
        })

    },
    getBanner: () => {
        return new Promise(async (resolve, reject) => {
            let banner = await db.get().collection(collection.BANNER_COLLECTION).find().toArray()

            resolve(banner)
        })
    },
    deleteBanner: (bannerId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION).deleteOne({ _id: objId(bannerId) }).then(() => {
                resolve()
            })
        })
    }

}
