import "./Navbar.css";
import icon from "../assets/icon.png"

function Navbar({ onNavigate }) {
  const goToPage = (page) => {
    if (typeof onNavigate === "function") {
      onNavigate(page);
      return;
    }

    try {
      localStorage.setItem("page", page);
    } catch (e) {
      
    }
    window.location.reload();
  };

  const handleLogoClick = () => {
    goToPage("landing");
  };

  return (
    <>
      <nav className="navbar">
        <div className="logo" onClick={handleLogoClick} style={{cursor: "pointer"}}>
            <img src={icon} width={50} style={{borderRadius: 10}}/>
        </div>

        <div className="Navbar">
          <div className="actions">
            <button onClick={() => goToPage('login')} className="lgn-btn" >Log In</button>
            <button onClick={() => goToPage('selectsignup')} className="create-btn">Create an Account</button>
            <button onClick={() => goToPage('messaging')} className="landing-btn landing-btn-secondary">Chat</button>
          </div>
        </div>
        
      </nav>
    </>
  );
}

export default Navbar;
