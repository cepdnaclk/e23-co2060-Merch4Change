import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import icon from "../../assets/icon.png"

function Navbar() {
  const navigate = useNavigate();

  return (
    <>
      <nav className="navbar">
        <div className="logo" onClick={() => navigate('/')} style={{cursor: "pointer"}}>
            <img src={icon} width={50} style={{borderRadius: 10}}/>
        </div>

        <div className="Navbar">
          <div className="actions">
            <button onClick={() => navigate('/login')} className="lgn-btn" >Log In</button>
            <button onClick={() => navigate('/selectsignup')} className="create-btn">Create an Account</button>
            <button onClick={() => navigate('/messaging')} className="landing-btn landing-btn-secondary">Chat</button>
          </div>
        </div>
        
      </nav>
    </>
  );
}

export default Navbar;
