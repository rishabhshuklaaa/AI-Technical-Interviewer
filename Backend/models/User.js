import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// User Schema
const userSchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    password:{
        type:String,
        required:function(){
            return !this.googleId
        }
    },
    googleId:{
        type:String,
        unique:true,
        sparse:true
    } ,
    preferredRole:{
        type:String,
        default:"MERN Stack Developer"
    },
},{
    timestamps:true
})

// Password hashing middleware
userSchema.pre("save", async function (next) {
    if (!this.isModified("password") || !this.password) {
        return ;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword=async function(enteredPassword){
    if(!this.password){
        return false
    }
    return await bcrypt.compare(enteredPassword,this.password)
}


const User=mongoose.model("User",userSchema)
export default User