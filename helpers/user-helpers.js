var db = require("../config/connection")
var collection = require("../config/collections")
const bcrypt = require("bcrypt");
const Razorpay = require('razorpay');
var paypal = require('paypal-rest-sdk');
const { PRODUCT_COLLECTION } = require("../config/collections");

// const { syncBuiltinESMExports } = require("module");
require('dotenv').config()

//===========  FOR RAZORPAY ====================
var instance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET
})
//=============== PAY PAL =======================
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': process.env.CLIENT_ID,
    'client_secret': process.env.CLIENT_SECRET
});

const objId = require('mongodb').ObjectId;
module.exports = {

    //user signup 
    userSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            let emailCheck = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            if (emailCheck == null) {
                userData.password = await bcrypt.hash(userData.password, 10)
                userData.status = true;
                userData.date = new Date()
                userData.referralId = userData.firstname + new objId().toString().slice(1, 7)
                console.log(userData.referralId, 'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk');
                await db.get().collection(collection.USER_COLLECTION).insertOne(userData)
                await db.get().collection(collection.WALLET_COLLECTION).insertOne({
                    userId: userData._id,
                    walletBalace: 0,
                    transaction: [],
                    referralId: userData.referralId
                })
                resolve("success")
            } else {
                reject("email is already in use")
            }
            //xxxxxxxx  CHECKING REFERRAL XXXXXXXXXXXXX
            if (userData.referralCode) {
                db.get().collection(collection.USER_COLLECTION).findOne({ referralId: userData.referralCode }).then(async (response) => {
                    if (response != null) {
                        await db.get().collection(collection.WALLET_COLLECTION).updateOne({ userId: objId(userData._id) }, { $set: { walletBalace: 100 } })
                        await db.get().collection(collection.WALLET_COLLECTION).updateOne({ referralId: userData.referralCode }, { $inc: { walletBalace: 100 } })

                    }

                })
            }
        })
    },
    userSignin: (userData) => {

        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {};
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            if (user && user.status) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    console.log(user);
                    if (status) {
                        response.user = user;
                        response.status = true;
                        resolve(response)

                    } else {

                        reject("Incorrect Password")
                        resolve({ status: false })

                    }
                })
            } else {
                reject("Invalid Email")
                resolve({ status: false })
            }
        })
    },
    //checking the phone number with data base  fot otp login
    verifyNumber: (phoneNumber) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ mobile: phoneNumber }).then((response) => {
                if (response != null) {
                    resolve(response)
                    console.log(response, 'hiihhihihi');
                } else {
                    reject(response)
                }
            })
        })
    },
    getProduct: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({}).toArray();
            resolve(products)
        })


    },
    getCategory: () => {
        return new Promise((resolve, reject) => {
            let categories = db.get().collection(collection.CATEGORIES_COLLECTION).find().toArray()
            resolve(categories)
        })
    },
    getProductView: (proId) => {
        return new Promise(async (resolve, reject) => {
            let productView = await db.get().collection(collection.PRODUCT_COLLECTION).find({ _id: objId(proId) }).toArray()
            resolve(productView)
        })
    },
    addToCart: (proId, userId) => {
        let proObj = {
            item: objId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objId(userId) })

            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == proId)
                console.log(proExist);

                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION).
                        updateOne({ user: objId(userId), 'products.item': objId(proId) },
                            {
                                $inc: { 'products.$.quantity': 1 }
                            }
                        ).then(() => {
                            resolve()
                        })
                } else {

                    db.get().collection(collection.CART_COLLECTION).
                        updateOne({ user: objId(userId) },
                            {
                                $push: { products: proObj }
                            }
                        ).then((response) => {
                            resolve()
                        })
                }

            } else {

                let cartObj = {
                    user: objId(userId),
                    products: [proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })
    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: "$products.quantity"
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
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ]).toArray()

            resolve(cartItems)
        })
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0;
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objId(userId) })

            if (cart) {
                count = cart.products.length
            }
            resolve(count)
        })
    },
    deleteProductFromCart: (proId, userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).updateOne({
                user: objId(userId)
            },
                {
                    $pull: { products: { item: objId(proId) } }
                }
            ).then(() => {
                resolve(response)
            })
        })
    },
    changeProductQuantity: (details) => {

        details.quantity = parseInt(details.quantity)
        details.count = parseInt(details.count)
        console.log(details);

        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {

                db.get().collection(collection.CART_COLLECTION).
                    updateOne({ _id: objId(details.cart) },
                        {
                            $pull: { products: { item: objId(details.product) } }

                        }
                    ).then((response) => {
                        resolve({ removeProduct: true })
                    })

            } else {

                db.get().collection(collection.CART_COLLECTION).
                    updateOne({ _id: objId(details.cart), 'products.item': objId(details.product) },
                        {
                            $inc: { 'products.$.quantity': details.count }
                        }
                    ).then((response) => {
                        resolve({ status: true })
                    })
            }

        })
    },
    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: "$products.quantity"
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', '$product.offerPrice'] } }
                        // change toInt
                    }
                }

            ]).toArray()
            console.log(total[0]?.total, 'the total amount ');
            resolve(total[0]?.total)
        })
    },
    // this function is to get the user details 
    addAddress: (addressData) => {

        let obj = new objId()
        console.log(obj, 'object is here');
        let address = {
            _id: objId(obj),
            firstname: addressData.firstname,
            lastname: addressData.lastname,
            address: addressData.address,
            landmark: addressData.landmark,
            altnumber: addressData.altnumber,
            streetName: addressData.streetName,
            country: addressData.country,
            state: addressData.state,
            city: addressData.city,
            pincode: addressData.pincode
        }
        console.log(addressData, 'address is coming');
        return new Promise(async (resolve, reject) => {
            let checkAddress = await db.get().collection(collection.USER_COLLECTION).findOne({
                $and: [
                    { _id: objId(addressData.userId) },
                    { address: { $exists: true } }
                ]
            })

            //checking if the user is true or false

            if (checkAddress) {
                db.get().collection(collection.USER_COLLECTION).updateOne(
                    {
                        _id: objId(addressData.userId)
                    },
                    {
                        $push: { address: address }
                    }
                ).then(() => {
                    resolve()
                })
            } else {
                let addressObj = [address]
                db.get().collection(collection.USER_COLLECTION).updateOne(
                    {
                        _id: objId(addressData.userId)
                    },
                    {
                        $set: { address: addressObj }
                    }
                ).then(() => {
                    resolve()
                })
            }
        })
    },

    // TO DISPLAY THE  ADDRESS IN CARDS
    getAddressList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let addressData = await db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $match: {
                        _id: objId(userId)
                    }
                },
                {
                    $unwind: {
                        path: '$address'
                    }

                },
                {
                    $project: {
                        address: 1
                    }
                }
            ]).toArray()
            console.log(addressData, 'addrsssData is fine');
            resolve(addressData)
        })
    },

    // this function is for the dispaly of the user address
    getUserDetails: (userId) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).find({ _id: objId(userId) }).toArray()
            resolve(user)
        })
    },

    // this function is to place the order when click the place now button

    placeOrder: (order, products, total, paymentMethod, userId, coupon, user) => {
        return new Promise((resolve, reject) => {
            let totalAmount = parseInt(total)
            products.offerPrice = parseInt(products?.offerPrice)
            console.log(order, products, total, 'eeeeeeeeeeeeeeeeeeeeeeeee');

            let status = paymentMethod === 'COD' ? 'placed' : 'pending'

            products.forEach(element => {
                element.status = status
            });

            let orderObj = {
                deliveryDetails: {
                    fullname: order?.firstname + " " + order?.lastname,
                    landmark: order?.landmark,
                    // email: order.email,
                    address: order?.address,
                    country: order?.country,
                    state: order?.state,
                    city: order?.city,
                    // mobile: order.address?.mobile,
                    altnumber: order?.altnumber,
                    pincode: order?.pincode
                },
                userId: objId(userId),
                paymentMethod: paymentMethod,
                products: products,
                // totalAmount: total[0]?.total,
                totalAmount: totalAmount,
                date: new Date(),
                displayDate: new Date().toDateString(),
                // status: status,
                statusUpdateDate: new Date()
            }

            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                // console.log(status, 'ssssssssssssssssssssssssssssssssssssssss');
                if (status === 'placed') {
                    // TO DELETE PRODUCT FORM THE CART AFTER SUCCESS 
                    db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objId(userId) })
                    // TO DECREMENT STOCK AFTER BUYING 
                    products.forEach(element => {

                        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objId(element.item) }, { $inc: { stock: -(element.quantity) } })
                    });


                    resolve(response.insertedId)

                    console.log(response, 'place-order ');

                } else {
                    resolve(response.insertedId)
                }
                if (coupon) {

                    db.get().collection(collection.COUPON_COLLECTION).
                        updateOne({ coupon: coupon }, { $push: { user: objId(userId) } })

                    console.log('coupon is coming in place order helper', coupon);
                }
            })
        })

    },
    getCartProductList: (userId) => {
        console.log(userId);
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objId(userId) })
            resolve(cart?.products)
        })
    },
    getUserOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            console.log(userId);
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: objId(userId) }).toArray()
            //console.log(orders);
            //console.log('orders');
            resolve(orders)
        })
    },
    getOrderProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { $and: [{ $or: [{ status: 'placed' }, { status: 'pending' }, { status: 'shipped' }] }, { userId: objId(userId) }] }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                        // offerPrice:'$products.offerPrice',
                        deliveryDetails: '$deliveryDetails',
                        paymentMethod: '$paymentMethod',
                        totalAmount: '$totalAmount',
                        status: '$products.status',
                        date: '$date',
                        displayDate: '$displayDate'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: {
                            $arrayElemAt: ['$product', 0]
                        },
                        deliveryDetails: 1,
                        paymentMethod: 1,
                        totalAmount: 1,
                        offerPrice: '$product.offerPrice',
                        status: 1,
                        date: 1,
                        displayDate: 1
                    }
                }
            ]).toArray()
            //console.log(orderItems);
            console.log('rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr', orderItems);
            resolve(orderItems)
        })
    },
    // to cancel the orders from the user Side
    cancelOrder: (orderId, proId) => {
        console.log(orderId, proId, + 'order id is coming welluuuuuuuuuuuuuuuuuuuuuuuuuuuuuu');
        return new Promise((resolve, reject) => {
            let dateStatus = new Date()
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objId(orderId), 'products.item': objId(proId) },
                { $set: { 'products.$.status': 'canceled' } }).then(() => {
                    resolve()
                })
        })
    },

    //xxxxxxxxxxxxxxxxxxxxxxxx to return  the orders from the user Side  xxxxxxxxxxxxxxxx
    returnOrder: (data, userId, products) => {

        // console.log(data.orderId,data.proId,userId,products + 'order id is coming welluuuuuuuuuuuuuuuuuuuuuuuuuuuuuu');
        return new Promise((resolve, reject) => {
            let dateStatus = new Date()
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objId(data.orderId), 'products.item': objId(data.orderId) },
                { $set: { 'products.$.status': 'returned' } }).then(() => {
                    resolve()
                })
            db.get().collection(collection.WALLET_COLLECTION).updateOne({ userId: objId(userId) }, { $inc: { walletBalace: products.offerPrice } })

        })
    },

    // to show the order history to the user in the user side  
    orderHistory: (userId) => {
        return new Promise(async (resolve, reject) => {

            let orderedItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { userId: objId(userId) }
                },
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
                        displayDate: '$displayDate',
                        statusUpdateDate: "$statusUpdateDate"
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: {
                            $arrayElemAt: ['$product', 0]
                        }, deliveryDetails: 1,
                        paymentMethod: 1, totalAmount: 1, status: 1, date: 1, displayDate: 1, statusUpdateDate: 1
                    }
                }

            ]).toArray()
            // console.log(orderedItems );
            // console.log("ordered History" + orderedItems);
            resolve(orderedItems)
            //console.log(orderedItems);
        })
    },
    //xxxxxxxxxxxxxxxxxxxxxxxx DELETE PENDING ORDER XXXXXXXXXXXXXXXXXXXXXXXXXXX
    deletePendingOrder: () => {

        db.get().collection(collection.ORDER_COLLECTION).deleteMany({ 'products.status': 'pending' })

    },
    //xxxxxxxxxxxxxxxxxxxxxxxxxxx GET PRODUCT VIEW XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    getProductView: (proId) => {

        return new Promise((resolve, reject) => {

            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objId(proId) }).then((product) => {

                resolve(product)
            })

        })
    },
    //  to fetch user details 
    // getUserDetails:(userId)=>{
    //     return new Promise(async(resolve, reject) => {
    //         let userDetails = await db.get().collection(collection.USER_COLLECTION)
    //     })
    // }


    //form user address
    getUserAddress: (userId, address) => {
        // console.log(address,'home is comig');
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ user: objId(userId) },
                {
                    $push: {
                        address: { address: objId(userId) }

                    }
                }).then((response) => {
                    console.log(response, 'address is passing')
                    resolve(response)
                })
        })
    },
    // add to wishlist to wishlist box
    addToWishlist: (proId, userId) => {
        return new Promise(async (resolve, reject) => {

            let userWishlist = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: objId(userId) })
            let proObj = {
                item: objId(proId)
            }
            if (userWishlist) {

                let proExist = userWishlist.products.findIndex(product => product.item == proId)

                if (proExist == -1) {

                    db.get().collection(collection.WISHLIST_COLLECTION).updateOne({
                        user: objId(userId)
                    },
                        {
                            $push: { products: { item: objId(proId) } }
                        }
                    ).then((response) => {
                        resolve()
                    })
                } else {

                    db.get().collection(collection.WISHLIST_COLLECTION).updateOne({
                        user: objId(userId)
                    }, {
                        $pull: { products: { item: objId(proId) } }
                    }).then((response) => {
                        reject()
                    })
                }
            } else {

                let wishlistObj = {
                    user: objId(userId),
                    products: [proObj]
                }

                db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishlistObj).then((response) => {
                    resolve()
                })
            }
        })
    },
    //to display the wishlist of the user
    getWishlist: (userId) => {
        return new Promise(async (resolve, reject) => {
            let wishlist = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                {
                    $match: { user: objId(userId) }
                }, {
                    '$unwind': {
                        'path': '$products'
                    }
                }, {
                    '$project': {
                        'item': '$products.item'
                    }
                }, {
                    '$lookup': {
                        'from': collection.PRODUCT_COLLECTION,
                        'localField': 'item',
                        'foreignField': '_id',
                        'as': 'product'
                    }
                }, {
                    '$project': {
                        product: {
                            $arrayElemAt: ['$product', 0]
                        }
                    }
                }
            ]).toArray()
            resolve(wishlist)
        })
    },

    // ================================================ GET USER ORDER ADDRESS =====================================
    getOrderAddress: (userId, addressId) => {

        console.log(addressId, userId, 'address id and user id ');

        return new Promise(async (resolve, reject) => {

            let address = await db.get().collection(collection.USER_COLLECTION).aggregate(
                [
                    {
                        $match: {
                            _id: objId(userId)
                        }
                    }, {
                        $unwind: {
                            path: '$address'
                        }
                    }, {
                        $match: {
                            'address._id': objId(addressId)
                        }
                    }, {
                        $project: {
                            address: 1,
                            email: 1,
                            mobile: 1
                        }
                    }
                ]).toArray()
            console.log(address, 'aggegation');
            resolve(address)
        })
    },

    // =========================================================== EDIT ADDRESS ============================================

    editAddress: (addressDetails) => {

        let addressId = addressDetails.addressId

        console.log(addressId + ' address id is');

        let userId = addressDetails.userId
        let obj = new objId()

        let address = {

            _id: objId(obj),
            firstname: addressDetails.editfirstname,
            lastname: addressDetails.editlastname,
            address: addressDetails.editaddress,
            landmark: addressDetails.editlandmark,
            altnumber: addressDetails.editaltnumber,
            streetName: addressDetails.editstreetName,
            country: addressDetails.editcountry,
            state: addressDetails.editstate,
            city: addressDetails.editcity,
            pincode: addressDetails.editpincode

        }
        return new Promise((resolve, reject) => {

            db.get().collection(collection.USER_COLLECTION).updateOne(
                {
                    _id: objId(userId),
                    'address._id': objId(addressId)
                },
                {
                    $set: {
                        "address.$": address
                    }
                }
            ).then(() => {
                resolve()
            })
        })

    },
    // ======================================================= DELETE THE ADDRESS ===================================

    deleteAddress: (userId, addressId) => {

        return new Promise((resolve, reject) => {

            db.get().collection(collection.USER_COLLECTION).updateOne(
                {
                    _id: objId(userId)
                },
                {
                    $pull: {
                        address: { _id: objId(addressId) }
                    }
                }
            ).then((response) => {
                resolve()
            })
        })
    },

    // ======================================================= RAZOR PAY GENERATE =================================================

    generateRezorpay: (orderId, total) => {
        console.log(orderId, 'order id razor pppppppppppppppppppppp');
        // let total = totalPrice[0]?.total
        console.log(total, 'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu');
        return new Promise((resolve, reject) => {

            var options = {
                amount: total * 100, //amount in the samllest curency limit
                currency: "INR",
                receipt: "" + orderId
            };
            instance.orders.create(options, function (err, order) {

                if (err) {
                    console.log(err);
                } else {
                    console.log("New order", order);
                    resolve(order)
                }

            })
        })
    },

    //============================================================ VERIFY PAYMENT RAZOR PAY======================================

    verifyPayment: (details) => {

        return new Promise((resolve, reject) => {

            const crypto = require('crypto')
            let hmac = crypto.createHmac('sha256', 'rH9mwztNFDPakQlHirwrV9sP')
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                resolve()
            } else {
                reject()
            }
        })

    },

    // ================================================================= CHANGE THE PAYMENT STATUS ==========================

    changePaymentStatus: (orderId, userId, products) => {
        console.log(products, 'rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr');

        return new Promise((resolve, reject) => {
            products.forEach(async element => {
                let response = await db.get().collection(collection.ORDER_COLLECTION).
                    updateOne(
                        {
                            _id: objId(orderId),
                            "products.item": objId(element.item)
                        },
                        {
                            $set: {
                                'products.$.status': 'placed'
                            }
                        })
                console.log(response, 'kkkkkkkkkkkkkkkkkkkkkkkkkkkk');
                await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objId(element.item) },
                    { $inc: { stock: -(element.quantity) } })
            });
            // db.get(collection.COUPON_COLLECTION).updateOne({coupon:coupon},{$push:{user:objId(user)}})
            db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objId(userId) })
            resolve()
        })

    },

    //=========================================  EDIT PROFILE ========================================

    editProfile: (userId, updateData) => {

        return new Promise(async (resolve, reject) => {

            await db.get().collection(collection.USER_COLLECTION).updateOne(
                {
                    _id: objId(userId)
                },
                {
                    $set: {
                        firstname: updateData.firstname,
                        lastname: updateData.lastname,
                        email: updateData.email,
                        mobile: updateData.mobile
                    }
                }
            )
            resolve()
        })
    },

    // ================================= GET OFFER CATEGORY ==================================

    getOfferCategory: () => {

        return new Promise(async (resolve, reject) => {

            let categoryOffer = await db.get().collection(collection.OFFER_COLLECTION).find(
                { product: { $exists: true } }).toArray()

            resolve(categoryOffer)

            console.log(categoryOffer, 'cccccccccccccccccccccccccccccccccccccccccccc');
        })
    },

    // xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx GET PRODUCT OFFER IN USER SIDE

    getOfferProduct: () => {

        return new Promise(async (resolve, reject) => {

            let productOffer = await db.get().collection(collection.OFFER_COLLECTION).find(
                { product: { $exists: true } }
            ).toArray()
            resolve(productOffer)
            console.log(productOffer, 'pppppprrrrrrrrrrrrrrrrrrrroooooooooddddddddduuucccctttttttt');
        })
    },

    //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx REDEEM COUPON XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    redeemCoupon: (couponCode, userId) => {

        return new Promise(async (resolve, reject) => {

            let user = await db.get().collection(collection.COUPON_COLLECTION).findOne({ $and: [{ coupon: couponCode }, { user: objId(userId) }] })
            console.log(user, 'user exists');
            db.get().collection(collection.COUPON_COLLECTION).findOne({ $and: [{ coupon: couponCode }, { isoDate: { $gte: new Date() } }] }).then((response) => {

                console.log(response, 'opopopop');

                if (response !== null && !user) {

                    resolve(response)
                    console.log('response is coming in redeem');
                }
                else {

                    console.log('reject is woking');
                    reject()
                }

            })
        })
    },

    //xxxxxxxxxxxxxx PICK ADDRESS INTO THE FORM XXXXXXXXXXXXXXXXXXX
    // getOrderAddress = (userId, addressId) => {
    //     return new Promise(async (resolve, reject) => {
    //         let address = await db.get().collection(collection.USER_COLLECTION).aggregate(
    //             [
    //                 {
    //                     '$match': {
    //                         '_id': objId(userId)
    //                     }
    //                 }, {
    //                     '$unwind': {
    //                         'path': '$address'
    //                     }
    //                 }, {
    //                     '$match': {
    //                         'address._id': objId(addressId)
    //                     }
    //                 }, {
    //                     '$project': {
    //                         'address': 1,
    //                         'email': 1,
    //                         'username': 1
    //                     }
    //                 }
    //             ]
    //         ).toArray()
    //         resolve(address)
    //     })
    // }

    //xxxxxxxxxxxxx GET WALLET XXXXXXXXXXXXXXXXX
    getWallet: (userId) => {

        return new Promise((resolve, reject) => {

            db.get().collection(collection.WALLET_COLLECTION).findOne({ userId: objId(userId) }).then((response) => {
                resolve(response)

                console.log(response, 'rrrrrrrrrrrrrrrrrrrrrrr');
            })
        })
    },
    //xxxxxxxxxxxxxxxxxxxxxxx DECEASE WALLET COLLECTION XXXXXXXXXXXXXXXXXXXXXXX
    decreaseWallet: (userId, amount) => {
        db.get().collection(collection.WALLET_COLLECTION).findOne({ userId: objId(userId) }).then((response) => {
            console.log(response, '000000000000000000000000');
            let updatedBalance = response.walletBalace - amount
            db.get().collection(collection.WALLET_COLLECTION).updateOne({ userId: objId(userId) }, { $set: { walletBalace: updatedBalance } })
        })
        //check thappu 
    },
    getBanner: () => {
        return new Promise(async (resolve, reject) => {
            let banner = await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
            console.log(banner, 'bannnnnnnnnnnnnnnnnnner');
            resolve(banner)
        })
    },
    //xxxxxxxxxxxxxxxxxxxxxxxxx     SEARCH PRODUCTS     XXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    getSearchProduct: (key) => {
        console.log(key, 'kkkkkkkkkkkkkkkkkkeeeeeeeeeeeyyyyyyy');
        return new Promise(async (resolve, reject) => {
            let data = await db.get().collection(collection.PRODUCT_COLLECTION).find({

                "$or": [
                    { product_name: { $regex: key, '$options': 'i' } },
                    { brand: { $regex: key, '$options': 'i' } },
                    { category: { $regex: key, '$options': 'i' } }
                ]
            }).toArray()
            console.log(data, 'ddddddddddddddddaaaaaaaaaaaaaaaaaatttttttttttttaaaaaaa');
            if (data.length > 0) {
                resolve(data)

            } else {
                reject()
            }
        })
    },
    //xxxxxxxxxxxxxxxx  DISPLAY RANDOM PRODUCTS IN LANDING PAGE XXXXXXXXXXXXXX
    randomProducts: () => {
        return new Promise((resolve, reject) => {
            let random = db.get().collection(collection.PRODUCT_COLLECTION).aggregate(
                [
                    {
                        '$match': {
                            'actualPrice': {
                                '$gt': 0
                            }
                        }
                    }, {
                        '$limit': 4
                    }
                ]
            ).toArray()
            resolve(random)
            console.log(random, 'rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr');
        })
    }

}
