const mongoose =require('mongoose');

const institutionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim:true
    },
    type:{
        type: String,
        enum: ['School', 'College', 'coaching', 'Institute'],
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },

    phone: {
        type: String,
        required: true,
    },
    
    address: {
        type: String,
        default: ""
    },
    logo: {
        type: String,
        default: ""
    }, 
    isActive: {
        type: Boolean,
        default: true
    },

},
{
    timestamps: true
}
);

const Institution = mongoose.model('Institution', institutionSchema);
module.exports = Institution;