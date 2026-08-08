import React from 'react'
import Header from '../components/Layout/Header.jsx'
import Hero from '../components/Route/Hero.jsx'
import Categories from '../components/Route/Catagories/Catagories.jsx'
import BestDeals from '../components/Route/BestDeals/BestDeals.jsx'
import FeaturedProduct from '../components/Route/FeaturedProduct/FeaturedProduct.jsx'
import Events from '../components/Events/Events.jsx'
import Sponsored from '../components/Route/Sponsered.jsx'
import Footer from '../components/Layout/Footer.jsx'
const HomePage = () => {
    return (
        <div>
            <Header activeHeading={1} />
            <Hero />
            <Categories />
            <BestDeals />
            <FeaturedProduct />
            <Events />
            <br />
            <br />
            <Sponsored />
            <Footer />
        </div>
    )
}

export default HomePage