import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import useAuthContext from './hooks/useAuthContext'
import Roadmap from './pages/RoadmapGenerator'
import Quiz from './pages/Quiz'
import Forum from './pages/Forum'
import CreatePost from './pages/CreatePost'
import ProfilePage from './pages/Profile'
import ProjectsPage from './pages/Projects'
import AdminDashboard from './pages/AdminDashboard'
import UserContributionsPage from './pages/userContributionsPage'
import ViewPost from './pages/ViewPost'
import ViewCommunity from './pages/ViewCommunity'
import AllQuizzes from './pages/Quizzes'
import PublicProfile from './components/PublicProfile'
import TeacherDashboard from './pages/TeacherDashboard'
import SubjectiveAnswers from './pages/SubjectiveAnswers'
import Challenge from './pages/Challenge'

function App() {
  const { state } = useAuthContext()
  const { isAuthenticated, Loading } = state;
  
  console.log(state?.user?.role === 'teacher');
  if (Loading) {
    console.log('loading');
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

 
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={!isAuthenticated ? <Navigate to="/login" /> : state?.user?.role === 'admin' ? <Navigate to="/admin" /> : <Home />} />
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
        <Route path="/roadmap-generator" element={isAuthenticated ? <Roadmap /> : <Navigate to="/login" />} />
        <Route path="/quiz-generator" element={isAuthenticated ? <Quiz /> : <Navigate to="/login" />} />
        <Route path="/forum" element={isAuthenticated ? <Forum /> : <Navigate to="/login" />} />
        <Route path="*" element={<h1>Not Found</h1>} />
        <Route path='/create-post' element={<CreatePost />} />
        <Route path='/profile'  element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />}/>
        <Route path='/projects' element={isAuthenticated ? <ProjectsPage /> : <Navigate to="/login" />}/>
        <Route path='/admin' element={!isAuthenticated ? <Navigate to="/login" /> : state?.user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
        <Route path='/contribute' element={isAuthenticated ? <UserContributionsPage /> : <Navigate to="/login" />} />
        <Route path='/post/:id' element={isAuthenticated ? <ViewPost /> : <Navigate to="/login" />} />
        <Route path='/community/:id' element={isAuthenticated ? <ViewCommunity /> : <Navigate to="/login" />} />
        <Route path='/quizzes' element={isAuthenticated ? <AllQuizzes /> : <Navigate to="/login" />} />
        <Route path='/teacher' element={!isAuthenticated ? <Navigate to="/login" /> : state?.user?.role === 'teacher' ? <TeacherDashboard /> : <Navigate to="/" />} />

        <Route path='/public-profile/:userId' element={<PublicProfile />} />
        <Route path='/subjective-answers' element={isAuthenticated ? <SubjectiveAnswers /> : <Navigate to="/login" />} />
        <Route path='/challenge' element={isAuthenticated ? <Challenge /> : <Navigate to="/login" />} />
        {/* <Route path='/quiz/:quizId' element={isAuthenticated ? <QuizReview /> : <Navigate to="/login" />} /> */}
      
      </Routes>
    </BrowserRouter>
  )
}

export default App