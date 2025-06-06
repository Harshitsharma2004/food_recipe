import React from "react";
import foodBanner from "../assets/food-banner.jpg";
// import "./Home.css";
import RecipeItems from "../components/RecipeItems";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Modal from "../components/Modal";
import InputForm from "../components/InputForm";
function Home() {
  const navigate=useNavigate()
  const [isOpen,setIsOpen] = useState(false)
  const addRecipe = ()=>{
    let token=localStorage.getItem('token')
    if(token){
    navigate("/addRecipe")
    }else{
      setIsOpen(true)
    }
  }
  return (
    <>
      <div className="home">
        <div className="left">
          <h1>Food Recipe</h1>
          <h5>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Neque
            dolor laudantium, odio beatae quasi natus expedita. Molestias
            nostrum doloremque perferendis?
          </h5>
          <button className="shareButton" onClick={addRecipe}>Share Your Recipe</button>
        </div>
        <div className="right">
          <img
            src={foodBanner}
            alt="Food Banner"
            width={"320px"}
            height={"300px"}
          />
        </div>
      </div>
      <div className="bg">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path
            fill="#a2d9ff"
            fillOpacity="1"
            d="M0,128L80,149.3C160,171,320,213,480,229.3C640,245,800,235,960,224C1120,213,1280,203,1360,197.3L1440,192L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
          ></path>
        </svg>
      </div>
      {isOpen && (
        <Modal onClose={() => setIsOpen(false)}>
          <InputForm setIsOpen={setIsOpen} />
        </Modal>
      )}
      <div className="home-recipes">
        <RecipeItems/>
      </div>
    </>
  );
}

export default Home;
