import React from "react";
import "./style/Home.css";
import Product from "./Product";
function Home() {
  const products = [
    {
      product: "/Record_v01.glb",
    },
    {
      product: "/Redbox_v02.glb",
    },
    {
      product: "/Stopwatch_v01.glb",
    },
    {
      product: "/Tree_v01.glb",
    },
  ];
  // const products = [
  //   {
  //     product: "/Tree_v01.glb",
  //   },
  //   {
  //     product: "/car.glb",
  //   },
  //   {
  //     product: "/car.glb",
  //   },
  //   {
  //     product: "/car.glb",
  //   },
  // ];
  return (
    <div>
      <div className="lowpoly_container">
        <div className="container">
          <div className="title">
            <h1>Lowploy</h1>
          </div>
          <div className="products">
            {products.map((d) => (
              <Product image={d.product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
export default Home;
