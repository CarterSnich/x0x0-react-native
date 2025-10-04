import { Modal, ModalButton } from "@/components/modal";
import { ThemedText } from "@/components/themed-text";
import React, { createContext, useContext, useState } from "react";

type AlertContentProp = {
  title?: string;
  message?: string;
  buttons?: ModalButton[];
};

type ContextProp = {
  isVisible: boolean;
  alertShow: ({ ...content }: AlertContentProp) => void;
  alertClose: () => void;
};

const AlertContext = createContext<ContextProp | undefined>(undefined);

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [content, setContent] = useState<AlertContentProp>();

  const alertShow = ({ ...content }: AlertContentProp) => {
    setContent(content);
    setIsVisible(true);
  };

  const alertClose = () => {
    setIsVisible(false);
    setContent(undefined);
  };

  const defaultActionButtons = [
    {
      label: "OKAY",
      action: alertClose,
    },
  ];

  return (
    <AlertContext.Provider value={{ isVisible, alertShow, alertClose }}>
      {children}
      <Modal
        title={content?.title}
        visible={isVisible}
        actions={content?.buttons ?? defaultActionButtons}
      >
        <ThemedText>{children}</ThemedText>
      </Modal>
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    throw new Error("useAlert must be used within a AlertProvider");
  }
  return ctx;
};
