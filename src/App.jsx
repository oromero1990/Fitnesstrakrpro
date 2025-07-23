import { Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import Register from "./auth/Register";
import Login from "./auth/Login";
import ActivitiesPage from "./activities/ActivitiesPage";
import ActivityDetails from "./activities/ActivityDetails";
import RoutinesPage from "./routines/RoutinesPage";
import RoutineDetails from "./routines/RoutineDetails";
import Error404 from "./Error404.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<ActivitiesPage />} />
        <Route path="register" element={<Register />} />
        <Route path="login" element={<Login />} />
        <Route path="activities/:activityId" element={<ActivityDetails />} />
        <Route path="routines" element={<RoutinesPage />} />
        <Route path="routines/:routineId" element={<RoutineDetails />} />{" "}
        {/* ✅ Moved inside */}
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
}
