import Hero from "./Hero"
import Featured from "./Featuredproducts"
import { Categories } from "./Categories"
import Offers from "./Offers"

export default function Home() {
  return (
    <>
      <Hero />
      <Featured />
      <Offers />
      <Categories />
    </>
  )
}
