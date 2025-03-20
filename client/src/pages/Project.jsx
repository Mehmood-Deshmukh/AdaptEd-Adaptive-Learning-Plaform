import Sidebar from "../components/Sidebar";
import useAuthContext from "../hooks/useAuthContext";
import projects from "../../../data/codedex_projects.json";

const Project = () => {
  const { state, dispatch } = useAuthContext();
  const { user } = state;
  const projects_sliced1 = projects.slice(0, 4);
  const projects_sliced2 = projects.slice(5, 9);

  return (
    <>
      <div className="flex bg-gray-50">
        <Sidebar user={user} />

        <div className="flex-1 p-8 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
            <h2 className="text-xl font-semibold mb-5 text-black">
              Recommended Projects
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {projects_sliced1.map((project) => (
                <div className="bg-gray-100 rounded-xl shadow-md p-4 hover:shadow-lg transition">
                  <h3 className="text-lg h-18 font-semibold text-black">
                    {project.title}
                  </h3>
                  <img
                    src={project.image}
                    alt={project.name}
                    className="w-full h-40 object-cover rounded-t-xl"
                  />
                  {project.tags.map((tag) => (
                    <button className="mt-3 bg-gray-600 text-sm text-white px-1 py-1 rounded-lg hover:bg-black transition ml-2">
                      {tag}
                    </button>
                  ))}
                  <p>
                    <button className="mt-5 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-black transition">
                      Explore More
                    </button>
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
            <h2 className="text-xl font-semibold mb-5 text-black">
              Based on your recent searches
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {projects_sliced2.map((project) => (
                <div className="bg-gray-100 rounded-xl shadow-md p-4 hover:shadow-lg transition">
                  <h3 className="text-lg h-18 font-semibold text-black">
                    {project.title}
                  </h3>
                  <img
                    src={project.image}
                    alt={project.name}
                    className="w-full h-40 object-cover rounded-t-xl"
                  />
                  {project.tags.map((tag) => (
                    <button className="mt-3 bg-gray-600 text-sm text-white px-1 py-1 rounded-lg hover:bg-black transition ml-2">
                      {tag}
                    </button>
                  ))}
                  <p>
                    <button className="mt-5 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-black transition">
                      Explore More
                    </button>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Project;
