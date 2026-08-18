import Enrollment from "@/pages/Enrollment";
import Home from "@/pages/Home";
import Invoice from "@/pages/Invoice";
import PublicStatus from "@/pages/PublicStatus";
import RegistrationForm from "@/pages/RegistrationForm";
import RegistrationDetail from "@/pages/RegistrationDetail";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/check-status" element={<PublicStatus />} />
        <Route path="/status" element={<RegistrationDetail />} />
        <Route path="/status/invoice" element={<Invoice />} />
        <Route path="/status/enrollment" element={<Enrollment />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
