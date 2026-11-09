
import Home from "./components/Home"
import SignIn from "./components/SignIn"
import Signout from "./components/Signout"
import SignUp from "./components/SignUp"
import {Routes, Route } from "react-router-dom"


const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} /> 
        <Route path="/signout" element={<Signout />} />
      </Routes>
     
      
    </div>
  )
}

export default App