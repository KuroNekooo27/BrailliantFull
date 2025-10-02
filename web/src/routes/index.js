import { Routes } from "react-router-dom";
import { UserRoutes } from "./UserRoutes";
import { AdminRoutes } from "./AdminRoutes";

export default function AppRoutes(props) {
  return (
    <Routes>
      {UserRoutes(props)}
      {AdminRoutes}
    </Routes>
  );
}
