import {createSlice,createAsyncThunk} from '@reduxjs/toolkit'
import axios from 'axios'

// API URL for user-related endpoints
const API_URL=`${import.meta.env.VITE_API_URL}/users`;

const user=JSON.parse(localStorage.getItem('user'));    

// Initial state for authentication
const initialState={
    user:user ? user : null,
    isError:false,
    isSuccess:false,
    isLoading:false,
    isProfileLoading: false,
    message:''
}

// Async thunk for user registration
export const register=createAsyncThunk('auth/register',async(userData,thunkAPI)=>{
    try {
        const response =await axios.post(`${API_URL}register`,userData, { withCredentials: true });
        if(response.data){
            localStorage.setItem('user',JSON.stringify(response.data))
        }
        return response.data
    } catch (error) {
        const message=(error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message)
    }
})

// Async thunk for user login
export const login=createAsyncThunk('auth/login',async(userData,thunkAPI)=>{
    try {
        const response =await axios.post(`${API_URL}login`,userData, { withCredentials: true });
        if(response.data){
            localStorage.setItem('user',JSON.stringify(response.data))
        }
        return response.data
    } catch (error) {
        const message=(error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message)
    }
})

// Async thunk for Google OAuth login
export const googleLogin=createAsyncThunk('auth/googleLogin',async(token,thunkAPI)=>{
    try {
        const response =await axios.post(`${API_URL}google`,{token}, { withCredentials: true });
        if(response.data){
            localStorage.setItem('user',JSON.stringify(response.data))
        }
        return response.data
    } catch (error) {
        const message=(error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message)
    }
})

// Async thunk for user logout
export const logout=createAsyncThunk('auth/logout',async()=>{
    localStorage.removeItem('user');
})

export const updateProfile=createAsyncThunk('auth/update',async(userData,thunkAPI)=>{
    try{
        const token = thunkAPI.getState().auth.user.token;
       const config={
           headers:{
               Authorization:`Bearer ${token}`
           },
              withCredentials: true
       }
       const response=await axios.put(`${API_URL}profile`,userData,config);
       return response.data;
       }catch(error){
        const message=(error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message)
       }
    
})

// Create the authentication slice with reducers and extra reducers for handling async actions
export const authSlice=createSlice({
    name:'auth',
    initialState,
    reducers:{
        reset:(state)=>{
            state.isLoading=false;
            state.isSuccess=false;
            state.isError=false;
            state.message='';
        }
    },
    extraReducers:(builder)=>{
        builder
        .addCase(register.pending,(state)=>{
            state.isLoading=true;
        })
        .addCase(register.fulfilled,(state,action)=>{
            state.isLoading=false;
            state.isSuccess=true;
            state.user=action.payload;
        })
        .addCase(register.rejected,(state,action)=>{
            state.isLoading=false;
            state.isError=true;
            state.message=action.payload;
            state.user=null;
        })
        .addCase(login.pending,(state)=>{
            state.isLoading=true;
        })
        .addCase(login.fulfilled,(state,action)=>{
            state.isLoading=false;
            state.isSuccess=true;
            state.user=action.payload;
        })
        .addCase(login.rejected,(state,action)=>{
            state.isLoading=false;
            state.isError=true;
            state.message=action.payload;
            state.user=null;
        })
      
        .addCase(googleLogin.pending,(state)=>{
            state.isLoading=true;
        })
        .addCase(googleLogin.fulfilled,(state,action)=>{
            state.isLoading=false;
            state.isSuccess=true;
            state.user=action.payload;
        })
        .addCase(googleLogin.rejected,(state,action)=>{
            state.isLoading=false;
            state.isError=true;
            state.message=action.payload;
            state.user=null;
        })
          .addCase(logout.fulfilled,(state)=>{
            state.user=null;
        })
        .addCase(updateProfile.pending,(state)=>{
            state.isProfileLoading = true
        })
        .addCase(updateProfile.fulfilled,(state,action)=>{
            state.isProfileLoading = false
            state.isSuccess=true;
            state.user=action.payload;
             localStorage.setItem('user', JSON.stringify(action.payload))
        })
        .addCase(updateProfile.rejected,(state,action)=>{
            state.isProfileLoading = false
            state.isError=true;
            state.message=action.payload;
            
        })
    }
})


export const {reset}=authSlice.actions;
export default authSlice.reducer