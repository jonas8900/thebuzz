export default function ChooseAdminOrPlayer() {
    return (
        <div className="flex flex-col items-center justify-center h-screen ">
            <h1 className=" text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">Choose Your Role</h1>
            <div className="flex space-x-4">
                <button className="cursor-pointer px-6 py-3 bg-violet-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition duration-200">
                    Admin
                </button>
                <button className="cursor-pointer px-6 py-3 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 transition duration-200">
                    Player
                </button>
            </div>
        </div>
    );
}