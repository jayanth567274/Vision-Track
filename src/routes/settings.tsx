import React from "react";
import SettingsPage from "../components/Settings";

const user = {
  name: "Guest",
  email: "guest@example.com",
  joinedAsGuest: true,
};

const SettingsRoute = () => {
  return <SettingsPage user={user} />;
};

export default SettingsRoute;