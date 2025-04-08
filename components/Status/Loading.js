import { Loader } from "lucide-react";

export default function Loading() {

    return(        
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-9999 flex justify-center items-center w-full h-full">
        <Loader className="h-10 w-10 animate-spin text-blue-500" />
    </div>
    );
}