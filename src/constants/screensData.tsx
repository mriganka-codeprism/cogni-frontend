import loginScreenImg from "../assets/images/loginScreenImg.png"
import muSigmaLogo from "../assets/images/MSLogo.png"
import avatarImg from "../assets/images/Avatar.png"
import botImg from "../assets/images/Bot.png"
import homebackground from "../assets/images/homebackground.png"
import userAvatar from "../assets/images/userAvatar.png"
import collegeIcon from "../assets/images/collegeIcon.svg"
import muSigmaLabsLogo from "../assets/images/MSLabsLogo.png"

export const logoConfig = {
    loginScreen: loginScreenImg,
  muSigmaLogo,
  muSigmaLabsLogo,
  avatarImg,
    bot:botImg,
  bg: homebackground,
  userAvatar,
  collegeIcon
}

console.log(logoConfig.collegeIcon)
export enum CallStatus {
  COMPLETED = "completed",
  IN_PROGRESS = "in_progress",
  NOT_EVALUATED = 'Not evaluated',
  SELECTED = 'Selected',
  NOT_SELECTED = 'Not selected',
  DISQUALIFIED = 'Disqualified'
}

export const CallStatusLabels: Record<CallStatus, string> = {
  [CallStatus.COMPLETED]: "Completed",
  [CallStatus.IN_PROGRESS]: "In Progress",
  [CallStatus.NOT_EVALUATED]: "Not Evaluated",
  [CallStatus.SELECTED]: "Selected",
  [CallStatus.NOT_SELECTED]: "Not Selected",
  [CallStatus.DISQUALIFIED]: "Disqualified",
};

export enum interviewStatus  {
  REJECTED= "REJECTED",
  SELECTED= "SELECTED",
}

export const statusColors: {
  [key: string]: {
    borderColor?: string;
    backgroundColor?: string;
    borderRadius?: string;
  };
} = {
  [CallStatus.COMPLETED]: {
    backgroundColor: "#56BF7E",
  },
  [CallStatus.IN_PROGRESS]: {
    backgroundColor: "#1e90ff",
  },
 

};

export const streamOptions = [
  "BE", "BTech", "MBA", "BSC", "BA",
  "BCom", "BCA", "BBA", "BMS", "BSc", "Others"
];
