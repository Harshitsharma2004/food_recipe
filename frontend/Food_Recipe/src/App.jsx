import React from 'react'
import {createBrowserRouter,RouterProvider} from 'react-router-dom'
import './App.css' 
import Home from './pages/Home'
import MainNavigation from './components/MainNavigation'
import axios from 'axios';
import AddFoodRecipe from './pages/AddFoodRecipe'


import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import EditRecipe from './pages/EditRecipe'
import UserDashboard from './components/UserDashboard'
import RecipeDetail from './components/RecipeDetail'


// const getMyRecipes=async()=>{
//   let user = JSON.parse(localStorage.getItem("user"))
//   let allRecipes = await getAllRecipes()
//   return allRecipes.filter((item=>item.createdBy===user._id))
// }

const router = createBrowserRouter([
  {path:'/',element:<MainNavigation/>,children:[
    // {path:"/", element:<Home/>, loader:getAllRecipes },
    // {path:"/myRecipe", element:<Home/>,loader:getMyRecipes},
    {path:"/favRecipe", element:<Home/>},
    {path:"/", element:<Home/>},
    {path:"/myRecipe", element:<Home/>},
    {path:"/addRecipe", element:<AddFoodRecipe/>},
    {path:"/editRecipe/:id", element:<EditRecipe/>},
    {path:"/profile", element:<UserDashboard/>},
    {path:"/recipe/:id", element:<RecipeDetail/>}

  ]}
])
function App() {
  return (
    <>
      <ToastContainer />
      <RouterProvider router={router}></RouterProvider>
    </>
  )
}

export default App
