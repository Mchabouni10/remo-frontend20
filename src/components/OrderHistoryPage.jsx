import React from "react";
import * as usersService from "../utilities/users-service";

function OrderHistoryPage() {
  const handleCheckToken = async () => {
    let exp = await usersService.checkToken();
    console.log(exp);
    return exp;
  };

  return (
    <>
      <h1>Order History Page</h1>
      <button onClick={handleCheckToken}>Check login Expiration</button>
    </>
  );
}

export default OrderHistoryPage;

