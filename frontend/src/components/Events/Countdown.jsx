// import axios from "axios";
import React, { useEffect, useState } from "react";
// import { server } from "../../server";

const CountDown = ({ data }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        // if (
        //     typeof timeLeft.days === 'undefined' &&
        //     typeof timeLeft.hours === 'undefined' &&
        //     typeof timeLeft.minutes === 'undefined' &&
        //     typeof timeLeft.seconds === 'undefined'
        // ) {
        //     axios.delete(`${server}/event/delete-shop-event/${data._id}`);
        // }
        return () => clearTimeout(timer);
    });

    function calculateTimeLeft() {
        // Use the event's own finish date. This was hardcoded to '2026-08-08',
        // so the `data` prop was ignored and every event on the site showed
        // "Time's Up" once that date passed. An unparseable/missing date gives
        // NaN, which fails the `> 0` check below and falls back to "Time's Up".
        const difference = +new Date(data?.Finish_Date) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }

        return timeLeft;
    }

    const timerComponents = Object.keys(timeLeft).map((interval) => {
        if (!timeLeft[interval]) {
            return null;
        }

        return (
            <span className="text-[25px] text-[#475ad2]">
                {timeLeft[interval]} {interval}{" "}
            </span>
        );
    });

    return (
        <div>
            {timerComponents.length ? (
                timerComponents
            ) : (
                <span className="text-[red] text-[25px]">Time's Up</span>
            )}
        </div>
    );
};

export default CountDown;