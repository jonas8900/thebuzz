import { useState } from "react";
import { useRouter } from "next/router";
import LoginScreen from "../../components/Login/Loginscreen";
import ErrorMessage from "../../components/Toast/ErrorMessage";
import SuccessMessage from "../../components/Toast/SuccessMessage";
import { signIn } from "next-auth/react";

export default function Login() {
    const [toastMessage, setToastMessage] = useState("");
    const [showError, setShowError] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const router = useRouter();

    async function handleSubmit(event) {
        event.preventDefault();
        setLoadingSubmit(true);
    
        const formData = new FormData(event.target);
        const email = formData.get("email");
        const password = formData.get("password");
    
        setShowError(false);
        setShowSuccess(false);
    
        const response = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });
    
        if (response.error) {
            setShowError(true);
            setToastMessage(response.error);
            setTimeout(() => {
                setShowError(false);
                setToastMessage("");
                setLoadingSubmit(false)
            }, 4000);
        } else {
            setShowSuccess(true);
            setToastMessage("Erfolgreich eingeloggt!");
            setTimeout(() => {
                setShowSuccess(false);
                setToastMessage("");
                setLoadingSubmit(false)
                router.push("/");
            }, 2000);
        }
    }

    return (
        <>
            <LoginScreen handleSubmit={handleSubmit} loadingSubmit={loadingSubmit} />
            {showError && <ErrorMessage message={toastMessage} /> }
            {showSuccess && <SuccessMessage message={toastMessage} />}
        </>
        
    )
}