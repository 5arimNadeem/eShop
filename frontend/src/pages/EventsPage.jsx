import React from "react";
// import { useSelector } from "react-redux";
import EventCard from "../components/Events/EventCard";
import Header from "../components/Layout/Header";
// import Loader from "../components/Layout/Loader";

const EventsPage = () => {
    // const { allEvents, isLoading } = useSelector((state) => state.event);
    return (
        <>
            {/* {isLoading ? (
                <Loader />
            ) : ( */}
                <div>
                    <Header activeHeading={4} />
                    <main className="pt-[190px]">
                        <EventCard active={true}/>
                    </main>
                </div>
            {/* )} */}
        </>
    );
};

export default EventsPage;
