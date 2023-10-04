const mongoose = require('mongoose');
const bcrypt = require('bcrypt')


const Schema = mongoose.Schema;

const admin_schema = new Schema({


    admin_name:{
        type:String,
        required: true,
        unique: true
    },

    admin_email:{
        type:String,
        unique: true,
        lowercase: true,
        required: true
    },

    admin_password:{
        type:String,
        required: true
    },

    tokens: [{ type: Object }],

    permission: {
        type: Number,
        default : 2
    }

})


admin_schema.pre('save', async function(next){

    const hash = await bcrypt.hash(this.admin_password, 15);
    this.admin_password = hash;
    next();
})


module.exports = mongoose.model('admins', admin_schema)