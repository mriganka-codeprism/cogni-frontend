// src/components/hooks/useMenuItems.ts
import HomeFilledIcon from "@mui/icons-material/HomeFilled";
import { routes } from "../../constants/routes";
//import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import ChecklistIcon from '@mui/icons-material/Checklist';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import DrawOutlinedIcon from '@mui/icons-material/DrawOutlined';
import { useCandidateStore } from "../../store/candidateStore";


import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import QuestionAnswerOutlinedIcon from "@mui/icons-material/QuestionAnswerOutlined";
import ChecklistOutlinedIcon from "@mui/icons-material/ChecklistOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import NetworkCheckOutlinedIcon from "@mui/icons-material/NetworkCheckOutlined";
import BookmarksOutlinedIcon from "@mui/icons-material/BookmarksOutlined";
import network from "../../assets/images/network.png";
import createjobpage from "../../assets/images/createjobpage.png";
import candidateevaluation from "../../assets/images/candidateevaluation.png";
import categorymanagement from "../../assets/images/categorymanagement.png";
import adminhome from "../../assets/images/adminhome.png";
import vectorIcon from "../../assets/images/Vector.png";

export const useMenuItems = () => {
  const user = useCandidateStore((state) => state.tokenPayload);

  if (user?.role === "admin") {
    return [
      {
        id: 0,
        icon: <img src={adminhome} alt="" style={{ height: "2vh", width: "2vh" }} />,
        href: routes.adminHome,
        title: "Home",
      },
      {
        id: 1,
        icon: <img src={categorymanagement} alt="" style={{ height: "2vh", width: "2vh" }} />,
        href: routes.category,
        title: "Category",
      },
      {
        id: 2,
        icon: <img src={candidateevaluation} alt="" style={{ height: "2vh", width: "2vh" }} />,
        href: routes.candidateEvaluation,
        title: "Candidate Evaluation",
      },
      {
        id: 3,
        icon: <img src={adminhome} alt="" style={{ height: "2vh", width: "2vh" }} />,
        href: routes.createJob,
        title: "Create Job",
      },
      {
        id: 4,
        icon: <img src={createjobpage} alt="" style={{ height: "2vh", width: "2vh" }} />,
        href: routes.createJobPost,
        title: "Create Job Post",
      },
      {
        id: 5,
        icon: <img src={vectorIcon} alt="" style={{ height: "2vh", width: "1.5vh" }} />,
        href: routes.savedDrafts,
        title: "Saved Drafts",
      },
      {
        id: 6,
        icon: <img src={network} alt="" style={{ height: "2.3vh", width: "2.3vh" }} />,
        href: routes.networkDiagnostics,
        title: "Network Diagnostics",
      },
    ];
  }

  return [
    {
      id: 0,
      icon: <HomeOutlinedIcon />,
      href: routes.candidateHome,
      title: "Home",
    },
  ];
};
