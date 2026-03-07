import { useNavigate } from "react-router-dom";
import "./SelectSignUp.css"

const isMobile = window.innerWidth < 768;

function SelectSignUp() {
    const navigate = useNavigate();

    return ( 
        <>
        <div className="nav-bar">
            <button onClick={() => navigate('/')}> LOGO </button>
            <button onClick={() => navigate('/login')} className="login">Log In</button>
        </div>
        <div className="heading">
            <div className="main-heading">
                {isMobile? <h1 style={{fontFamily: "droidsans", fontSize:"50px"}}>Which role do you act in Platform?</h1>
                :<h1 style={{fontFamily: "droidsans", fontSize:"50px"}}>Which role do you<br/> act in Platform?</h1>
                }
            </div>
            <p className="title-des" style={{fontFamily: "Satoshi", fontSize:"21px"}}>customize user experience for better engagement </p>
        </div>

        <div className="selection">
            <div className="section1" onClick={() => navigate('/orgsignup')} style={{cursor: 'pointer'}}>
                {isMobile? <h3 style={{fontFamily: "Satoshi", fontSize:"25px"}}>As an organization</h3>
                :<h3 style={{fontFamily: "Satoshi", fontSize:"30px"}}>Create account as a Organization</h3>
                }
                {isMobile? <></>:<p style={{fontFamily: "Satoshi", fontSize:"20px"}}>fund raising and project management profiles for fund raising</p>}
            </div>

            <div className="section2">
                {isMobile? <h3 style={{fontFamily: "Satoshi", fontSize:"25px"}}>As a user</h3>
                :<h3 style={{fontFamily: "Satoshi", fontSize:"30px"}}>Create account as a User</h3>
                }
                {isMobile? <></>:<p style={{fontFamily: "Satoshi", fontSize:"20px"}}>items buying, selling and donating to rank up</p>}
            </div>
        </div>
        </>
     );
}

export default SelectSignUp;