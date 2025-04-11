import { useState } from "react";
import { useRouter } from "next/router";
import ErrorMessage from "../components/Toast/ErrorMessage";
import SuccessMessage from "../components/Toast/SuccessMessage";


export default function ResetPassword() {
    const router = useRouter();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [showError, setShowError] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

  async function handleSubmit(e){
    e.preventDefault();
    setLoading(true);
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Die Passwörter stimmen nicht überein.");
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("Das Passwort muss mindestens 8 Zeichen lang sein.");
      setLoading(false);
      return;
    }

    const specialCharacterRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (!specialCharacterRegex.test(newPassword)) {
        setError("Das Passwort muss mindestens ein Sonderzeichen enthalten.");
        setLoading(false);
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

        const data = await response.json();
        if (!response.ok) {
            setError(data.message || "Fehler beim Zurücksetzen des Passworts.");
            setLoading(false);
            return;
            }
        setError("");
        setNewPassword("");
        setConfirmPassword("");
            
        setLoading(false);

        setToastMessage("Passwort erfolgreich zurückgesetzt! 🎉");
        setTimeout(() => {
          setShowSuccess(false);
          setToastMessage("");
          router.push("/auth/login");
        }, 5000);
    }
    catch (error) {
      console.error("Fehler beim Zurücksetzen des Passworts:", error);
      setError("Fehler beim Zurücksetzen des Passworts.");
      setLoading(false);
    }
  };

  return (
    <>
    <div className="absolute top-1/2 left-1/2 w-full transform -translate-x-1/2 -translate-y-1/2 max-w-sm mx-auto my-10 p-5 bg-gray-900 shadow-md rounded-md">
      <h2 className="text-2xl font-bold text-center mb-4">Passwort zurücksetzen</h2>
      <form onSubmit={handleSubmit}>
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        <div className="mb-4">
            <p class="text-xs p-4 ">
                    Das Passwort muss mindestens 8 Zeichen, 1
                    Sonderzeichen<br></br> und eine Zahl enthalten.
            </p>
          <label className="block text-gray-200" htmlFor="newPassword">
            Neues Passwort
          </label>
           
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full p-3 border rounded-md"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-200" htmlFor="confirmPassword">
            Passwort bestätigen
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full p-3 border rounded-md"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-3 rounded-md"
        >
          {loading ? "Lädt..." : "Passwort zurücksetzen"}
        </button>
      </form>
              
    </div>
        {showError && <ErrorMessage message={toastMessage} />}
        {showSuccess && <SuccessMessage message={toastMessage} />}
    </>
  );
}
