import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SessionMonitor = ({ children }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = localStorage.getItem("currentUser");

        if (!currentUser) {
            // If no user is logged in, redirect to login
            navigate("/login");
        }
    }, [navigate]);

    return children;
};

export default SessionMonitor;
