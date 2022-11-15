const MongoClient=require('mongodb').MongoClient
const state={
    db:null
}
module.exports.connect=function(done){
    // const url='mongodb://localhost:27017'
    const url=  'mongodb+srv://nidhinshavs:0tfUs9oKIqwZSjw0@cluster0.t1py4ir.mongodb.net/?retryWrites=true&w=majority'
    const dbname='ecommerce'
    MongoClient.connect(url,(err,data)=>{
        if(err) return done(err)
        state.db=data.db(dbname)
        done();
    })
}

module.exports.get =()=> {
    return state.db;
}