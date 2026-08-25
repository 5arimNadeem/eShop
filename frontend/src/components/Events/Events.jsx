import React from 'react'
import { useSelector } from 'react-redux';
import styles from '../../styles/styles'
import EventCard from "./EventCard";

const Events = () => {
    const { allEvents, isLoading } = useSelector((state) => state.event);

    // Do not render while loading
    if (isLoading) {
        return null;
    }

    return (
        <div>
            <div className={`${styles.section}`}>
                <div className={`${styles.heading}`}>
                    <h1>Popular Events</h1>
                </div>
                <div className="w-full grid">
                    {allEvents && allEvents.length > 0 ? (
                        allEvents.map((event) => (
                            <EventCard key={event._id} data={event} active={false} />
                        ))
                    ) : (
                        <h4 className="text-gray-500 text-center py-6">No Events Available!</h4>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Events;