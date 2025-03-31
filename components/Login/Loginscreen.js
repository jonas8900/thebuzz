import { useEffect, useRef, useState } from "react";
import { IoIosEye } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import ErrorMessage from "../Toast/ErrorMessage";
import SuccessMessage from "../Toast/SuccessMessage";

export default function LoginScreen({ handleSubmit }) {
    const [typeSwitch, setTypeSwitch] = useState('password');
    const [forgotPassword, setForgotPassword] = useState(false);
    const [registered, setRegistered] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [showError, setShowError] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const overlayRef = useRef(null);
    const overlayRegisteredRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    async function handleSubmitRegistration(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData);


        const response = await fetch(`/api/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if(!response.ok) {
            setShowError(true);
            setToastMessage("Etwas ist schiefgelaufen!");
            setTimeout(() => {
                setShowError(false);
                setToastMessage("");
            }, 5000);
          return;
        }

        if (response.ok) {
            setShowSuccess(true);
            setToastMessage("Erfolgreich eingeloggt! 🎉");
            setTimeout(() => {
                setShowSuccess(false);
                setToastMessage("");
                router.push("/auth/login");
            }, 5000);
        } else {
          alert('Etwas ist schiefgelaufen, versuche es später noch einmal.');
        }
    }
    




    function handlePasswortTypeHidden() {
        setTypeSwitch('text');

    }

    function handlePasswortTypeVisibil() {
        setTypeSwitch('password');
    }

    function handleToggleToast()
    {
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
        }, 5000); 
    }

    function handleClickOutside(e) {
        if (overlayRef.current && !overlayRef.current.contains(e.target)) {
            setForgotPassword(false);
        }
        if (overlayRegisteredRef.current && !overlayRegisteredRef.current.contains(e.target)) {
            setRegistered(false);
        }
    };
    
    

    return(
            <div className="relative flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
                <div className=" bg-[url(/images/images.png)] bg-contain bg-center bg-no-repeat bg-gray-50 h-screen w-full flex items-center justify-center box-shadow-lg dark:bg-gray-900">
                    <div className="flex bg-white rounded-lg shadow-lg overflow-hidden mx-auto w-full max-w-4xl dark:border-gray-700 dark:bg-gray-800">
                        <div className="hidden lg:block lg:w-1/2 bg-cover" style={{ backgroundImage: 'url(/images/derLord.png)' }}></div>
                        <div className="w-full p-8 lg:w-1/2">
                        <h2 className="text-2xl font-semibold text-gray-700 text-center dark:text-white">Nobus Ankerquiz</h2>
                            <a href="#" className="flex items-center justify-center mt-4 text-white rounded-lg shadow-md hover:bg-gray-200 transition-all duration-200 dark:bg-white dark:hover:bg-gray-300">
                                <div className="px-0 py-3">
                                    {/* googleIcon for Login with Google */}
                                    <svg className="h-6 w-6" viewBox="0 0 40 40">
                                        <path d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.045 27.2142 24.3525 30 20 30C14.4775 30 10 25.5225 10 20C10 14.4775 14.4775 9.99999 20 9.99999C22.5492 9.99999 24.8683 10.9617 26.6342 12.5325L31.3483 7.81833C28.3717 5.04416 24.39 3.33333 20 3.33333C10.7958 3.33333 3.33335 10.7958 3.33335 20C3.33335 29.2042 10.7958 36.6667 20 36.6667C29.2042 36.6667 36.6667 29.2042 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z" fill="#FFC107"/>
                                        <path d="M5.25497 12.2425L10.7308 16.2583C12.2125 12.59 15.8008 9.99999 20 9.99999C22.5491 9.99999 24.8683 10.9617 26.6341 12.5325L31.3483 7.81833C28.3716 5.04416 24.39 3.33333 20 3.33333C13.5983 3.33333 8.04663 6.94749 5.25497 12.2425Z" fill="#FF3D00"/>
                                        <path d="M20 36.6667C24.305 36.6667 28.2167 35.0192 31.1742 32.34L26.0159 27.975C24.3425 29.2425 22.2625 30 20 30C15.665 30 11.9842 27.2359 10.5975 23.3784L5.16254 27.5659C7.92087 32.9634 13.5225 36.6667 20 36.6667Z" fill="#4CAF50"/>
                                        <path d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.7592 25.1975 27.56 26.805 26.0133 27.9758C26.0142 27.975 26.015 27.975 26.0158 27.9742L31.1742 32.3392C30.8092 32.6708 36.6667 28.3333 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z" fill="#1976D2"/>
                                    </svg>
                                </div>
                                <h1 class="px-6 py-3 w-5/6 text-center text-gray-600 font-bold  ">Melde dich mit Google an</h1>
                            </a>
                            <div class="mt-4 flex items-center justify-between">
                                <span class="border-b w-1/5 lg:w-1/4"></span>
                                <a href="#" class="text-xs text-center text-gray-500 uppercase dark:text-white">or login with Email</a>
                                <span class="border-b w-1/5 lg:w-1/4"></span>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div class="mt-4">
                                    <label id="email" class="block text-gray-700 text-sm font-bold mb-2 dark:text-white">Email Address</label>
                                    <input  class="w-full h-10 bg-transparent placeholder:text-gray-400 text-gray-700 text-sm border border-slate-200 rounded px-3 py-2 mb-4 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md dark:text-white" type="email" name="email"/>
                                </div>
                                <div class="mt-4">
                                    <div class="flex justify-between">
                                        <label class="block text-gray-700 text-sm font-bold mb-2 dark:text-white" id="password">Password</label>
                                        <a href="#" class="cursor-pointer text-xs text-purple-500 hover:text-gray-600 transition-all duration-200 dark:hover:text-white" onClick={() => setForgotPassword(true)}>Forget Password?</a>

                                    </div>
                                    <span class="relative flex items-center">
                                        <IoIosEye class="absolute cursor-pointer right-3 top-2.5 w-5 h-5 text-gray-400" onMouseDown={handlePasswortTypeHidden} onMouseUp={handlePasswortTypeVisibil} onMouseLeave={handlePasswortTypeVisibil}/>

                                        <input  class=" w-full h-10 bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded px-3 py-2 mb-4 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md dark:text-white" type={typeSwitch} name="password"/>
                                    </span>
                                </div>
                                <div class="mt-8">
                                    <button class="cursor-pointer bg-purple-700 text-white font-bold py-2 px-4 w-full rounded hover:bg-purple-500 transition-all duration-200" onClick={handleToggleToast}>Login</button>
                                </div>
                            </form>
                            <div class="mt-4 flex items-center justify-between">
                                <span class="border-b w-1/5 md:w-1/4"></span>
                                <a href="#" class="cursor-pointer text-xs text-purple-500 uppercase hover:text-gray-600 transition-all duration-200 dark:hover:text-white" onClick={() => setRegistered(true)}>or sign up</a>
                                <span class="border-b w-1/5 md:w-1/4"></span>
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
                            
                            class="absolute flex items-center justify-center bg-transparent rounded-lg shadow-lg overflow-hidden mx-auto h-screen w-full  top-0 backdrop-blur-sm">
                            <div class="mt-7 bg-white min-w-sm rounded-xl shadow-lg dark:bg-gray-800 dark:border-gray-700" ref={overlayRef}>
                            <div class="p-4 sm:p-7">
                            <div class="text-center">
                                <h1 class="block text-2xl font-bold text-gray-800 dark:text-white">Forgot password?</h1>
                                <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Remember your password ?&nbsp;
                                <a class="text-blue-600 decoration-2 hover:underline font-medium" onClick={() => setForgotPassword(false)}>
                                    Login here
                                </a>
                                </p>
                            </div>
                    
                            <div class="mt-5"  >
                                <form>
                                <div class="grid gap-y-4">
                                    <div>
                                    <label for="email" class="block text-sm font-bold ml-1 mb-2 dark:text-white">Email address</label>
                                    <div class="relative">
                                        <input type="email" id="email" name="email" class="py-3 px-4 block w-full border-2 border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm" required/>
                                    </div>
                                    </div>
                                    <button type="submit" class="cursor-pointer bg-purple-700 text-white font-bold py-3 px-4 w-full rounded hover:bg-purple-500 transition-all duration-200">Reset password</button>
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
                          
                          class="absolute flex items-center justify-center bg-transparent rounded-lg shadow-lg overflow-hidden mx-auto h-screen w-full  top-0 backdrop-blur-sm">
                          <div class="mt-7 bg-white min-w-sm rounded-xl shadow-lg dark:bg-gray-800 dark:border-gray-700" ref={overlayRegisteredRef}>
                          <div class="p-4 sm:p-7">
                          <div class="text-center">
                              <h1 class="block text-2xl font-bold text-gray-800 dark:text-white">Registriere dich jetzt</h1>
                              <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                              Doch schon einen Account ?&nbsp;
                              <a class="text-blue-600 decoration-2 hover:underline font-medium cursor-pointer" onClick={() => setRegistered(false)}>
                                  hier anmelden
                              </a>
                              </p>
                          </div>
                        
                          <div class="mt-5"  >
                            <form onSubmit={handleSubmitRegistration}>
                              <div class="grid gap-y-4">
                                  <div>
                                  <label for="username" class="block text-sm font-bold ml-1 mb-2 dark:text-white">Username</label>
                                  <div class="relative">
                                      <input type="text" id="username" name="username" class="py-3 px-4 block w-full border-2 border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm" required/>
                                  </div>
                                  </div>
                                  <div>
                                  <label for="name" class="block text-sm font-bold ml-1 mb-2 dark:text-white">Vor- und Nachname</label>
                                  <div class="relative">
                                      <input type="text" id="name" name="name" class="py-3 px-4 block w-full border-2 border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm" required/>
                                  </div>
                                  </div>
                                  <div>
                                  <label for="email" class="block text-sm font-bold ml-1 mb-2 dark:text-white">Email address</label>
                                  <div class="relative">
                                      <input type="email" id="email" name="email" class="py-3 px-4 block w-full border-2 border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm" required/>
                                  </div>
                                  </div>
                                  <div>
                                  <label for="password" class="block text-sm font-bold ml-1 mb-2 dark:text-white">Passwort</label>
                                  <div class="relative">
                                      <input type={typeSwitch} id="password" name="password" class="py-3 px-4 block w-full border-2 border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm" required/>
                                      <IoIosEye class="absolute cursor-pointer right-3 top-3.5 w-5 h-5 text-gray-400" onMouseDown={handlePasswortTypeHidden} onMouseUp={handlePasswortTypeVisibil} onMouseLeave={handlePasswortTypeVisibil}/>
                                 
                                  </div>
                                  <p class="text-xs pt-1 ">Das Passwort muss mindestens 8 Zeichen, 1 Sonderzeichen<br></br> und eine Zahl enthalten.</p>
                                  </div>
                                  <button type="submit" class="cursor-pointer mt-5 bg-purple-700 text-white font-bold py-3 px-4 w-full rounded hover:bg-purple-500 transition-all duration-200">Reset password</button>
                              </div>
                            </form>
                          </div>
                          </div>
                          </div>
                      </motion.div>
                    )}
                    {showError && <ErrorMessage message={toastMessage} /> }
                    {showSuccess && <SuccessMessage message={toastMessage} />}
                </AnimatePresence>
            </div>

    )

}