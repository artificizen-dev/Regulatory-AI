import { Routes, Route, Navigate } from "react-router-dom";
import ROUTES from "./routes";
import Landing from "./pages/landing/Landing";
import Signup from "./pages/signup/Signup";
import Login from "./pages/login/Login";
import Documentation from "./pages/documentation/Documentation";
import Chat from "./pages/chat/Chat";
import Contact from "./pages/contact/Contact";

function App() {
  return (
    <Routes>
      <Route path={ROUTES.default} element={<Landing />} />
      <Route path={ROUTES.login} element={<Login />} />
      <Route path={ROUTES.signup} element={<Signup />} />
      <Route path={ROUTES.documentation} element={<Documentation />} />
      <Route path={ROUTES.chat} element={<Chat />} />
      <Route path={ROUTES.contact} element={<Contact />} />
      <Route path="*" element={<Navigate to={ROUTES.default} replace />} />
    </Routes>
  );
}

export default App;
