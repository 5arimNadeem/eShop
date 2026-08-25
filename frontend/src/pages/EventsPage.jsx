import React from "react";
import { useSelector } from "react-redux";
import EventCard from "../components/Events/EventCard";
import Header from "../components/Layout/Header";
import Loader from "../components/Layout/Loader";

const EventsPage = () => {
    const { allEvents, isLoading } = useSelector((state) => state.event);

    return (
        <>
            {isLoading ? (
                <Loader />
            ) : (
                <div>
                    <Header activeHeading={4} />
                    <div className="w-full min-h-screen">
                        {allEvents && allEvents.length > 0 ? (
                            allEvents.map((event) => (
                                <EventCard key={event._id} data={event} active={true} />
                            ))
                        ) : (
                            <div className="w-full flex items-center justify-center py-20">
                                <h2 className="text-xl text-gray-500">No Events Available!</h2>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default EventsPage;
