import { Modal, ModalButton } from "@/components/modal";
import React, { createContext, useContext, useState } from "react";

type ModalContentProp = {
  title?: string;
  content?: React.ReactNode;
  buttons?: ModalButton[];
};

type ContextProp = {
  isVisible: boolean;
  openModal: ({ ...modalContent }: ModalContentProp | undefined) => void;
  closeModal: () => void;
};

const ModalContext = createContext<ContextProp | undefined>(undefined);

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [modalContent, setModalContent] = useState<ModalContentProp>();

  const openModal = ({ ...content }: ModalContentProp | undefined) => {
    setModalContent(content);
    setIsVisible(true);
  };

  const closeModal = () => {
    setIsVisible(false);
    setModalContent(undefined);
  };

  const defaultActionButtons = [
    {
      label: "OKAY",
      action: closeModal,
    },
  ];

  return (
    <ModalContext.Provider value={{ isVisible, openModal, closeModal }}>
      {children}
      <Modal
        title={modalContent?.title}
        visible={isVisible}
        actions={modalContent?.buttons ?? defaultActionButtons}
      >
        {modalContent?.content}
      </Modal>
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return ctx;
};
