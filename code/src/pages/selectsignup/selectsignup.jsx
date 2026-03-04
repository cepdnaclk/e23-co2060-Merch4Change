import "./SelectSignUp.css";

const isMobile = window.innerWidth < 768;

function SelectSignUp({ onNavigate }) {
  const goToPage = (page) => {
    console.log("Navigating to:", page); // Debug
    if (typeof onNavigate === "function") {
      onNavigate(page);
    } else {
      window.location.href = `/${page}`;
    }
  };

  return (
    <div className="selection-page-container">
      {/* Navbar */}
      <div className="nav-bar">
        <button onClick={() => goToPage("landing")}>LOGO</button>
        <button onClick={() => goToPage("login")} className="login">
          Log In
        </button>
      </div>

      {/* Heading */}
      <div className="heading">
        <div className="main-heading">
          {isMobile ? (
            <h1 style={{ fontFamily: "droidsans", fontSize: "50px", color: "white" }}>
              Which role do you act in Platform?
            </h1>
          ) : (
            <h1 style={{ fontFamily: "droidsans", fontSize: "50px", color: "white" }}>
              Which role do you
              <br /> act in Platform?
            </h1>
          )}
        </div>
        <p className="title-des" style={{ fontFamily: "Satoshi", fontSize: "21px", color: "white" }}>
          Customize user experience for better engagement
        </p>
      </div>

      {/* Selection Sections */}
      <div className="selection">
        {/* Organization */}
        <div className="section1" onClick={() => goToPage("organizationsignup")}>
          {isMobile ? (
            <h3 style={{ fontFamily: "Satoshi", fontSize: "25px" }}>As an organization</h3>
          ) : (
            <h3 style={{ fontFamily: "Satoshi", fontSize: "30px" }}>
              Create account as an Organization
            </h3>
          )}
          {!isMobile && (
            <p style={{ fontFamily: "Satoshi", fontSize: "20px" }}>
              Fund raising and project management profiles for fund raising
            </p>
          )}
        </div>

        {/* User */}
        <div className="section2" onClick={() => goToPage("usersignup")}>
          {isMobile ? (
            <h3 style={{ fontFamily: "Satoshi", fontSize: "25px" }}>As a user</h3>
          ) : (
            <h3 style={{ fontFamily: "Satoshi", fontSize: "30px" }}>Create account as a User</h3>
          )}
          {!isMobile && (
            <p style={{ fontFamily: "Satoshi", fontSize: "20px" }}>
              Items buying, selling, and donating to rank up
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SelectSignUp;