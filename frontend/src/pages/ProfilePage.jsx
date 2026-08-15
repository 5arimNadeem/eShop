// components
import React, { useState } from 'react'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'
import ProfileSideBar from "../components/Profile/ProfileSideBar.jsx"
import ProfileContent from "../components/Profile/ProfileContent.jsx"
import styles from '../styles/styles.js'
const ProfilePage = () => {
    const [active, setActive] = useState(1)
    return (
        <div>
            <Header />
            <div className={`${styles.section} flex bg-white py-10`}>
                <div className='w-[60px] 800px:w-[335px] flex-shrink-0'>
                    <ProfileSideBar active={active} setActive={setActive} />
                </div>
                <ProfileContent active={active} />
            </div>

            <Footer />
        </div>
    )
}

export default ProfilePage