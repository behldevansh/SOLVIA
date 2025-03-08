import React, {useEffect} from 'react'
import Home from './pages/Home'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import {Routes, Route } from 'react-router-dom'
import axios from "axios"
import {useDispatch, useSelector} from 'react-redux'
import {authActions} from './store/auth'
import SignUp from './pages/SignUp'
import LogIn from './pages/LogIn'
import Form from './pages/Form'
import AboutUs from "./components/Home/AboutUs"
import ContactUs from './components/Home/ContactUs'
import Profile from "./pages/Profile"
import PredictHistory from "./components/Profile/PredictHistory"
import Settings from "./components/Profile/Settings"

const App = () => {
  const dispatch = useDispatch()
  // const role = useSelector((state)=> state.auth.role)
  useEffect(()=>{
    if(
      localStorage.getItem("id")&&
      localStorage.getItem("token")
    ){
      dispatch(authActions.login())
      
    }
  }, []);
  return (
    <div>
      <Navbar></Navbar>
      <Routes>
        <Route exact path="/" element={<Home></Home>}></Route>
        <Route  path="/about-us" element={<AboutUs></AboutUs>}></Route>
        <Route  path="/contact" element={<ContactUs></ContactUs>}></Route>
        <Route  path="/profile" element={<Profile></Profile>}>
          <Route path="/profile/predictHistory" element={<PredictHistory />}></Route>
          <Route path="/profile/settings" element={<Settings></Settings>}></Route>
        </Route>
        <Route path="/SignUp" element={<SignUp></SignUp>}></Route>
        <Route path="/LogIn" element={<LogIn></LogIn>}></Route>
        <Route path="/form" element={<Form></Form>}></Route>
      </Routes>
      <Footer></Footer>
      </div>
  )
}

export default App
