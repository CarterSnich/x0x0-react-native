import { useRef } from "react";
import {
  ModalProps,
  Modal as RNModal,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { ThemedButton } from "./themed-button";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

type ModalButton = {
  label: string;
  action?: () => void;
};

type Props = ModalProps & {
  title?: string;
  containerStyle?: StyleProp<ViewStyle>;
  actions?: ModalButton[];
};

function Modal({ ...props }: Props) {
  const ref = useRef<RNModal>(null);

  return (
    <RNModal ref={ref} animationType="fade" transparent {...props}>
      <View style={styles.modalBackdrop}>
        <ThemedView style={styles.modalDialog}>
          <ThemedText style={styles.modalTitle}>{props.title}</ThemedText>
          <View style={[styles.modalBody, props.containerStyle]}>
            {props.children}
          </View>
          <View style={styles.modalButtons}>
            {props.actions?.map((btn, index) => (
              <ThemedButton key={index} onPress={btn.action}>
                {btn.label}
              </ThemedButton>
            ))}
          </View>
        </ThemedView>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "#000000cb",
    justifyContent: "center",
    alignItems: "center",
  },
  modalDialog: {
    width: "90%",
    padding: 16,
    borderRadius: 8,
    gap: 24,
  },
  modalTitle: {
    fontSize: 24,
  },
  modalBody: {},
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
  },
});

export { Modal, ModalButton };
