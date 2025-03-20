import Sidebar from "../components/Sidebar";
import useAuthContext from "../hooks/useAuthContext";


const Project = () =>{
    const { state, dispatch } = useAuthContext();
    const { user } = state;
    
    return (
        <>
        <div className="flex h-screen bg-gray-50">
            <Sidebar user={user}/>
            these are proj tuts
        </div>
        
        </>
    )
}

export default Project;