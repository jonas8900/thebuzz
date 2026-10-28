import { useEffect, useRef, useState } from "react";
import { IoIosEye } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import ErrorMessage from "../Toast/ErrorMessage";
import SuccessMessage from "../Toast/SuccessMessage";
import { signIn } from "next-auth/react";
import { normalizeEmail } from "@/lib/normalizeInput";

export default function LoginScreen({ handleSubmit, loadingSubmit }) {
  const [typeSwitch, setTypeSwitch] = useState("password");
  const [forgotPassword, setForgotPassword] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const overlayRef = useRef(null);
  const overlayRegisteredRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e) {
      if (overlayRef.current && !overlayRef.current.contains(e.target)) {
        setForgotPassword(false);
      }
      if (
        overlayRegisteredRef.current &&
        !overlayRegisteredRef.current.contains(e.target)
      ) {
        setRegistered(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleSubmitRegistration(event) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await response.json().catch(() => ({}));

      if (!response.ok) {
        setShowError(true);
        setToastMessage(resData.error || "Etwas ist schiefgelaufen!");
        setLoading(false);
        setTimeout(() => {
          setShowError(false);
          setToastMessage("");
        }, 5000);
        return;
      }

      setShowSuccess(true);
      setToastMessage("Erfolgreich registriert! 🎉");
      setLoading(false);
      setTimeout(() => {
        setShowSuccess(false);
        setToastMessage("");
        setRegistered(false);
        router.push("/auth/login");
      }, 3000);
    } catch (error) {
      setShowError(true);
      setToastMessage("Netzwerkfehler bei der Registrierung.");
      setLoading(false);
      setTimeout(() => {
        setShowError(false);
        setToastMessage("");
      }, 5000);
    }
  }

  function handlePasswortTypeHidden() {
    setTypeSwitch("text");
  }

  function handlePasswortTypeVisibil() {
    setTypeSwitch("password");
  }

  async function handleSubmitForgotPassword(event) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.target);
    const email = normalizeEmail(formData.get("email"));

    try {
      const response = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      setLoading(false);

      if (!response.ok) {
        setShowError(true);
        setToastMessage("Fehler beim Senden der E-Mail.");
        setTimeout(() => {
          setShowError(false);
          setToastMessage("");
        }, 5000);
        return;
      }

      setShowSuccess(true);
      setToastMessage("E-Mail zum Zurücksetzen des Passworts wurde gesendet!");
      setTimeout(() => {
        setShowSuccess(false);
        setToastMessage("");
        setForgotPassword(false);
      }, 5000);
    } catch (error) {
      setLoading(false);
      setShowError(true);
      setToastMessage("Es gab einen Fehler. Versuche es später erneut.");
      setTimeout(() => {
        setShowError(false);
        setToastMessage("");
      }, 5000);
    }
  }

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen
                 bg-gradient-to-br from-violet-100 via-fuchsia-50 to-sky-50
                 dark:from-[#0b0b13] dark:via-[#11142a] dark:to-[#1b0f2e]"
    >
      <div className="bg-transparent bg-contain bg-center bg-no-repeat h-screen w-full flex items-center justify-center">
        <div className="flex bg-white rounded-lg shadow-lg overflow-hidden mx-auto w-full max-w-4xl dark:border-gray-700 dark:bg-gray-800">
          <div
            className="hidden lg:block lg:w-1/2 bg-center bg-no-repeat bg-contain min-h-[420px]"
            style={{ backgroundImage: "url(/images/quizTime.jpg)" }}
          ></div>

          <div className="w-full p-8 lg:w-1/2">
            <h2 className="text-2xl font-semibold text-gray-700 text-center dark:text-white">
              TheBuzz Quiz
            </h2>
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="flex items-center w-full cursor-pointer justify-center mt-4 text-white rounded-lg shadow-md hover:bg-gray-200 transition-all duration-200 dark:bg-white dark:hover:bg-gray-300"
            >
              <div className="px-0 py-3">
                <svg className="h-6 w-6" viewBox="0 0 40 40">
                  <path
                    d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.045 27.2142 24.3525 30 20 30C14.4775 30 10 25.5225 10 20C10 14.4775 14.4775 9.99999 20 9.99999C22.5492 9.99999 24.8683 10.9617 26.6342 12.5325L31.3483 7.81833C28.3717 5.04416 24.39 3.33333 20 3.33333C10.7958 3.33333 3.33335 10.7958 3.33335 20C3.33335 29.2042 10.7958 36.6667 20 36.6667C29.2042 36.6667 36.6667 29.2042 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z"
                    fill="#FFC107"
                  />
                  <path
                    d="M5.25497 12.2425L10.7308 16.2583C12.2125 12.59 15.8008 9.99999 20 9.99999C22.5491 9.99999 24.8683 10.9617 26.6341 12.5325L31.3483 7.81833C28.3716 5.04416 24.39 3.33333 20 3.33333C13.5983 3.33333 8.04663 6.94749 5.25497 12.2425Z"
                    fill="#FF3D00"
                  />
                  <path
                    d="M20 36.6667C24.305 36.6667 28.2167 35.0192 31.1742 32.34L26.0159 27.975C24.3425 29.2425 22.2625 30 20 30C15.665 30 11.9842 27.2359 10.5975 23.3784L5.16254 27.5659C7.92087 32.9634 13.5225 36.6667 20 36.6667Z"
                    fill="#4CAF50"
                  />
                  <path
                    d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.7592 25.1975 27.56 26.805 26.0133 27.9758C26.0142 27.975 26.015 27.975 26.0158 27.9742L31.1742 32.3392C30.8092 32.6708 36.6667 28.3333 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z"
                    fill="#1976D2"
                  />
                </svg>
              </div>
              <h1 className="px-6 py-3 w-5/6 text-center text-gray-600 font-bold">
                Melde dich mit Google an
              </h1>
            </button>
            <div className="mt-4 flex items-center justify-between">
              <span className="border-b w-1/5 lg:w-1/4"></span>
              <span className="text-xs text-center text-gray-500 uppercase dark:text-white">
                or login with Email
              </span>
              <span className="border-b w-1/5 lg:w-1/4"></span>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mt-4">
                <label
                  htmlFor="login-email"
                  className="block text-gray-700 text-sm font-bold mb-2 dark:text-white"
                >
                  Email Address
                </label>
                <input
                  id="login-email"
                  className="w-full h-10 bg-transparent placeholder:text-gray-400 text-gray-700 text-sm border border-slate-200 rounded px-3 py-2 mb-4 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md dark:text-white"
                  type="email"
                  name="email"
                  required
                />
              </div>
              <div className="mt-4">
                <div className="flex justify-between">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2 dark:text-white"
                    htmlFor="login-password"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    className="cursor-pointer text-xs text-purple-500 hover:text-gray-600 transition-all duration-200 dark:hover:text-white"
                    onClick={() => setForgotPassword(true)}
                  >
                    Forget Password?
                  </button>
                </div>
                <span className="relative flex items-center">
                  <IoIosEye
                    className="absolute cursor-pointer right-3 top-2.5 w-5 h-5 text-gray-400"
                    onMouseDown={handlePasswortTypeHidden}
                    onMouseUp={handlePasswortTypeVisibil}
                    onMouseLeave={handlePasswortTypeVisibil}
                  />

                  <input
                    id="login-password"
                    className="w-full h-10 bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded px-3 py-2 mb-4 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md dark:text-white"
                    type={typeSwitch}
                    name="password"
                    required
                  />
                </span>
              </div>
              <div className="mt-8">
                <button
                  className="cursor-pointer bg-purple-700 text-white font-bold py-2 px-4 w-full rounded hover:bg-purple-500 transition-all duration-200"
                  disabled={loadingSubmit}
                >
                  {loadingSubmit ? "Lade.." : "Login"}
                </button>
              </div>
            </form>
            <div className="mt-4 flex items-center justify-between">
              <span className="border-b w-1/5 md:w-1/4"></span>
              <button
                type="button"
                className="cursor-pointer text-xs text-purple-500 uppercase hover:text-gray-600 transition-all duration-200 dark:hover:text-white"
                onClick={() => setRegistered(true)}
              >
                or sign up
              </button>
              <span className="border-b w-1/5 md:w-1/4"></span>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {forgotPassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute flex items-center justify-center bg-transparent rounded-lg shadow-lg overflow-hidden mx-auto h-screen w-full top-0 backdrop-blur-sm"
          >
            <div
              className="mt-7 bg-white min-w-sm rounded-xl shadow-lg dark:bg-gray-800 dark:border-gray-700"
              ref={overlayRef}
            >
              <div className="p-4 sm:p-7">
                <div className="text-center">
                  <h1 className="block text-2xl font-bold text-gray-800 dark:text-white">
                    Passwort vergessen?
                  </h1>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Erinnerst du dich doch?&nbsp;
                    <button
                      type="button"
                      className="text-blue-600 decoration-2 hover:underline font-medium cursor-pointer"
                      onClick={() => setForgotPassword(false)}
                    >
                      hier einloggen
                    </button>
                  </p>
                </div>

                <div className="mt-5">
                  <form onSubmit={handleSubmitForgotPassword}>
                    <div className="grid gap-y-4">
                      <div>
                        <label
                          htmlFor="forgot-email"
                          className="block text-sm font-bold ml-1 mb-2 dark:text-white"
                        >
                          Email address
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            id="forgot-email"
                            name="email"
                            className="py-3 px-4 block w-full border-2 border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                            required
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="cursor-pointer bg-purple-700 text-white font-bold py-3 px-4 w-full rounded hover:bg-purple-500 transition-all duration-200"
                        disabled={loading}
                      >
                        {loading ? "Sendet.." : "Bestätigen"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {registered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute flex items-center justify-center bg-transparent rounded-lg shadow-lg overflow-hidden mx-auto h-screen w-full top-0 backdrop-blur-sm"
          >
            <div
              className="mt-7 bg-white min-w-sm rounded-xl shadow-lg dark:bg-gray-800 dark:border-gray-700"
              ref={overlayRegisteredRef}
            >
              <div className="p-4 sm:p-7">
                <div className="text-center">
                  <h1 className="block text-2xl font-bold text-gray-800 dark:text-white">
                    Registriere dich jetzt
                  </h1>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Doch schon einen Account?&nbsp;
                    <button
                      type="button"
                      className="text-blue-600 decoration-2 hover:underline font-medium cursor-pointer"
                      onClick={() => setRegistered(false)}
                    >
                      hier anmelden
                    </button>
                  </p>
                </div>

                <div className="mt-5">
                  <form onSubmit={handleSubmitRegistration}>
                    <div className="grid gap-y-4">
                      <div>
                        <label
                          htmlFor="username"
                          className="block text-sm font-bold ml-1 mb-2 dark:text-white"
                        >
                          Username
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="username"
                            name="username"
                            className="py-3 px-4 block w-full border-2 border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-bold ml-1 mb-2 dark:text-white"
                        >
                          Vor- und Nachname
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="name"
                            name="name"
                            className="py-3 px-4 block w-full border-2 border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="register-email"
                          className="block text-sm font-bold ml-1 mb-2 dark:text-white"
                        >
                          Email address
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            id="register-email"
                            name="email"
                            className="py-3 px-4 block w-full border-2 border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="register-password"
                          className="block text-sm font-bold ml-1 mb-2 dark:text-white"
                        >
                          Passwort
                        </label>
                        <div className="relative">
                          <input
                            type={typeSwitch}
                            id="register-password"
                            name="password"
                            className="py-3 px-4 block w-full border-2 border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                            required
                          />
                          <IoIosEye
                            className="absolute cursor-pointer right-3 top-3.5 w-5 h-5 text-gray-400"
                            onMouseDown={handlePasswortTypeHidden}
                            onMouseUp={handlePasswortTypeVisibil}
                            onMouseLeave={handlePasswortTypeVisibil}
                          />
                        </div>
                        <p className="text-xs pt-1">
                          Das Passwort muss mindestens 8 Zeichen, 1 Sonderzeichen
                          <br /> und eine Zahl enthalten.
                        </p>
                      </div>
                      <button
                        type="submit"
                        className="cursor-pointer mt-5 bg-purple-700 text-white font-bold py-3 px-4 w-full rounded hover:bg-purple-500 transition-all duration-200"
                        disabled={loading}
                      >
                        {loading ? "Lade..." : "Registrieren"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        {showError && <ErrorMessage message={toastMessage} />}
        {showSuccess && <SuccessMessage message={toastMessage} />}
      </AnimatePresence>
    </div>
  );
}
