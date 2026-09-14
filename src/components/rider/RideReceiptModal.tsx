import React from "react";
import { ActiveRide } from "../../types";
import { RideFeedbackModal } from "./RideFeedbackModal";

interface RideReceiptModalProps {
  ride: ActiveRide;
  onClose: () => void;
}

export const RideReceiptModal: React.FC<RideReceiptModalProps> = ({ ride, onClose }) => {
  return <RideFeedbackModal ride={ride} onClose={onClose} />;
};

