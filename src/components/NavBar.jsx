import React from "react";
import { Link } from "react-router-dom";
import * as userService from "../utilities/users-service";
function Navbar({ user, setUser }) {
  function handleLogOut() {
    // Delegate to the users-service
    userService.logOut();
    // Update state will also cause a re-render
    setUser(null);
  }
  return (
    <>
      <nav style={{ justifyContent: "space-evenly", display: "flex" }}>
        <div style={{ justifyContent: "space-around" }}>
          <div>
            <p style={{ margin: "1em", color: "white" }}>
              Welcome {user.name},{" "}
            </p>
            <hr style={{ borderColor: "white" }} />
            <p style={{ margin: "1em", color: "white" }}>
              Logged In: {user.email}
            </p>
          </div>
          <Link to="" onClick={handleLogOut}>
            <button>Log-Out</button>
          </Link>
        </div>

        <Link to="/orders">Order History</Link>

        <Link to="/orders/new">New Order</Link>
      </nav>
    </>
  );
}

export default Navbar;
