import { useState } from "react";
import { useRouter } from "next/router";
import ErrorMessage from "../components/Toast/ErrorMessage";
import SuccessMessage from "../components/Toast/SuccessMessage";

export default function ResetPassword() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [disabled, setDisabled] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setDisabled(true);

    if (newPassword !== confirmPassword) {
      setError("Die Passwörter stimmen nicht überein.");
      setDisabled(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("Das Passwort muss mindestens 8 Zeichen lang sein.");
      setDisabled(false);
      return;
    }

    const specialCharacterRegex = /[!@#$%^&*(),.?":{}|<>]/;
    const numberRegex = /\d/;
    if (!specialCharacterRegex.test(newPassword) || !numberRegex.test(newPassword)) {
      setError("Das Passwort muss mindestens ein Sonderzeichen und eine Zahl enthalten.");
      setDisabled(false);
      return;
    }

    try {
      const { token } = router.query;
      const response = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const msg = data.message || "Fehler beim Zurücksetzen des Passworts.";
        setError(msg);
        setToastMessage(msg);
        setShowError(true);
        setDisabled(false);
        setTimeout(() => {
          setShowError(false);
          setToastMessage("");
        }, 5000);
        return;
      }

      setError("");
      setNewPassword("");
      setConfirmPassword("");

      setShowSuccess(true);
      setToastMessage("Passwort erfolgreich zurückgesetzt! 🎉");
      setTimeout(() => {
        setShowSuccess(false);
        setToastMessage("");
        router.push("/auth/login");
      }, 3000);
    } catch (err) {
      console.error("Fehler beim Zurücksetzen des Passworts:", err);
      const msg = "Fehler beim Zurücksetzen des Passworts.";
      setError(msg);
      setToastMessage(msg);
      setShowError(true);
      setDisabled(false);
      setTimeout(() => {
        setShowError(false);
        setToastMessage("");
      }, 5000);
    }
  }

  return (
    <>
      {showError && <ErrorMessage message={toastMessage} />}
      {showSuccess && <SuccessMessage message={toastMessage} />}

      <div className="absolute top-1/2 left-1/2 w-full transform -translate-x-1/2 -translate-y-1/2 max-w-sm mx-auto my-10 p-5 bg-gray-900 text-white shadow-md rounded-md">
        <h2 className="text-2xl font-bold text-center mb-4">Passwort zurücksetzen</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
          <div className="mb-4">
            <p className="text-xs p-4 text-gray-300">
              Das Passwort muss mindestens 8 Zeichen, 1 Sonderzeichen
              <br /> und eine Zahl enthalten.
            </p>
            <label className="block text-gray-200 mb-1" htmlFor="newPassword">
              Neues Passwort
            </label>

            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full p-3 border rounded-md bg-gray-800 text-white"
              disabled={disabled}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-200 mb-1" htmlFor="confirmPassword">
              Passwort bestätigen
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full p-3 border rounded-md bg-gray-800 text-white"
              disabled={disabled}
            />
          </div>

          <button
            type="submit"
            disabled={disabled}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-md cursor-pointer transition"
          >
            Passwort zurücksetzen
          </button>
        </form>
      </div>
    </>
  );
}
