import { Component, useEffect, useState, type ComponentType, type ReactNode } from "react";
import { StyleSheet } from "react-native";
import Constants from "expo-constants";

export function Burst() {
  const [Lottie, setLottie] = useState<ComponentType<{
    source: number;
    autoPlay?: boolean;
    loop?: boolean;
    style?: object;
  }> | null>(null);

  useEffect(() => {
    if (Constants.executionEnvironment === "storeClient") return;
    try {
      const view = require("lottie-react-native").default as ComponentType<{
        source: number;
        autoPlay?: boolean;
        loop?: boolean;
        style?: object;
      }>;
      setLottie(() => view);
    } catch {
      setLottie(null);
    }
  }, []);

  if (!Lottie) return null;
  return (
    <LottieGuard>
      <Lottie source={require("../../assets/lottie/win.json")} autoPlay loop={false} style={styles.lottie} />
    </LottieGuard>
  );
}

class LottieGuard extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const styles = StyleSheet.create({
  lottie: {
    position: "absolute",
    width: 220,
    height: 220,
    top: 70,
  },
});
