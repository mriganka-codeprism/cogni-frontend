import { Routes, Route } from "react-router-dom";
import { routes } from "../constants/routes";
import Call from "../pages/Call";
import Login from "../pages/Login";
import CandidateHome from "../pages/CandidateHome";
import Transcription from "../pages/transcription";
import AdminTabbedPanel from "../pages/AdminTabbedPanel";
import ProtectedRoute from "../components/ProtectedRoute";
import CollegeConfigPage from "../pages/CollegeConfigPage";
import MissingLink from "../pages/MissingLink";
import ResumeUpload from "../pages/resumeUpload";
import CandidateSummary from "../pages/candidateSummary";
import CandidateSelection from "../pages/candidateSelection";
import EvaluationDashboard from "../pages/evaluationDashboard";
import CreateJob from "../pages/createjob";
import LateralTabbedPanel from "../pages/LateralTabbedPanel";
import CreateJobStepper from "../pages/CreateJobStepper";
import EvaluationCriteria from "../pages/EvaluationCriteria";
import OtherDetails from "../pages/OtherDetails";
import JobDetails from "../pages/JobDetails";
import FrameworkDetails from "../pages/FrameworkDetails";
import ScoreSummary from "../pages/ScoreSummary";
import SendEmail from "../pages/SendEmail";
import ATSProcessing from "../pages/ATSProcessing";
import NetworkDiagnostics from "../pages/NetworkDiagnostics";
import SavedDrafts from "../pages/SavedDrafts";
import CandidatesInformation from "../pages/CandidatesInformation";





const App = () => {
  return (
    <Routes>
      {/* Public Login route */}
      <Route path="/" element={<Login />} />
      <Route path={routes.login} element={<Login />} />

      {/* Candidate public access routes */}
      <Route path={routes.candidateHome} element={<CandidateHome />} />
      <Route path={routes.call} element={<Call />} />

      {/* Admin protected routes */}
      <Route
        path={routes.adminHome}
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminTabbedPanel />
          </ProtectedRoute>
        }
      />
      <Route
        path={routes.category}
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminTabbedPanel />
          </ProtectedRoute>
        }
      />
      <Route
        path={routes.candidateEvaluation}
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminTabbedPanel />
          </ProtectedRoute>
        }
      />
      <Route
        path={routes.transcription}
        element={
          <ProtectedRoute requiredRole="admin">
            <Transcription />
          </ProtectedRoute>
        }
      />
      <Route
        path={routes.resumeUpload}
        element={
          <ProtectedRoute requiredRole="admin">
            <ResumeUpload />
          </ProtectedRoute>
        }
      />
      <Route
        path={routes.collegeConfig}
        element={
          <ProtectedRoute requiredRole="admin">
            <CollegeConfigPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={routes.candidateSummary}
        element={
          <ProtectedRoute requiredRole="admin">
            <CandidateSummary />
          </ProtectedRoute>
        }
      />
      <Route
        path={routes.aptitudeEvaluation}
        element={
          <ProtectedRoute requiredRole="admin">
            <CandidateSelection />
          </ProtectedRoute>
        }
      />
      <Route
        path={routes.createJob}
        element={
          <ProtectedRoute requiredRole="admin">
            <CreateJob />
          </ProtectedRoute>
        }
      />

      <Route
        path={routes.createJobPost}
        element={
          <ProtectedRoute requiredRole="admin">
            <CreateJobStepper />
          </ProtectedRoute>
        }
      />
      <Route
        path={routes.evaluationCriteria}
        element={
          <ProtectedRoute requiredRole="admin">
            <EvaluationCriteria />
          </ProtectedRoute>
        }
      />

      <Route
        path={routes.otherDetails}
        element={
          <ProtectedRoute requiredRole="admin">
            <OtherDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path={routes.jobDetails}
        element={
          <ProtectedRoute requiredRole="admin">
            <JobDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path={routes.candidatesInformation}
        element={
          <ProtectedRoute requiredRole="admin">
            <CandidatesInformation />
          </ProtectedRoute>
        }
      />

{/* <Route
        path={routes.frameworkDetails}
        element={
          <ProtectedRoute requiredRole="admin">
            <FrameworkDetails />
          </ProtectedRoute>
        }
      /> */}

      <Route
        path={routes.scoreSummary}
        element={
          <ProtectedRoute requiredRole="admin">
            <ScoreSummary />
          </ProtectedRoute>
        }
      />

      <Route
        path={routes.atsProcessing}
        element={
          <ProtectedRoute requiredRole="admin">
            <ATSProcessing />
          </ProtectedRoute>
        }
      />

      <Route
        path={routes.evaluationDashboard}
        element={
          <ProtectedRoute requiredRole="admin">
            <EvaluationDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path={routes.sendEmail}
        element={
          <ProtectedRoute requiredRole="admin">
            <SendEmail />
          </ProtectedRoute>
        }
      />



      <Route
        path={routes.networkDiagnostics}
        element={
          <ProtectedRoute requiredRole="admin">
            <NetworkDiagnostics />
          </ProtectedRoute>
        }
      />

      <Route
        path={routes.savedDrafts}
        element={
          <ProtectedRoute requiredRole="admin">
            <SavedDrafts />
          </ProtectedRoute>
        }
      />
      <Route
        path={routes.lateralAdmin}
        element={
          <ProtectedRoute requiredRole="admin">
            <LateralTabbedPanel />
          </ProtectedRoute>
        }
      />
      <Route path="/missing-link" element={<MissingLink />} />


    </Routes>




  );
};

export default App;
